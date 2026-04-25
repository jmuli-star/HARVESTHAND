import json
import base64
import requests
import logging
from datetime import datetime
from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from .ai_utils import AgriBrain
from .models import (
    Category, MarketplaceItem, MpesaCalls, 
    MpesaCallBacks, MpesaPayment ,CartItem
)
from .serializers import CategorySerializer, MarketplaceItemSerializer , CartItemSerializer , AIInteractionSerializer

logger = logging.getLogger(__name__)

# --- 1. MPESA AUTH UTILITY ---

def get_mpesa_access_token():
    """Fetches OAuth2 token using credentials defined in settings"""
    consumer_key = settings.MPESA_CONSUMER_KEY
    consumer_secret = settings.MPESA_CONSUMER_SECRET
    api_URL = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    
    try:
        r = requests.get(api_URL, auth=(consumer_key, consumer_secret))
        r.raise_for_status()
        return r.json().get('access_token')
    except Exception as e:
        logger.error(f"Mpesa Auth Error: {str(e)}")
        return None

def format_phone_number(phone):
    """Standardizes phone to 2547XXXXXXXX"""
    phone = str(phone).strip()
    if phone.startswith("0"):
        return "254" + phone[1:]
    if phone.startswith("+"):
        return phone[1:]
    if phone.startswith("7"):
        return "254" + phone
    return phone

# --- 2. MARKETPLACE VIEWS ---

class CategoryListView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

class ItemListView(APIView):
    """
    GET: List all active products
    POST: Create a new marketplace item (Requires Auth)
    """
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]

    def get(self, request):
        items = MarketplaceItem.objects.filter(is_active=True).order_by('-created_at')
        cat_slug = request.query_params.get('category')
        if cat_slug:
            items = items.filter(category__slug=cat_slug)
        serializer = MarketplaceItemSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = MarketplaceItemSerializer(data=request.data)
        if serializer.is_valid():
            # Automatically assign the logged-in user as the provider
            serializer.save(provider=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#cartview
class CartView(APIView):
    """
    NEW: Handles adding, viewing, and clearing the shopping cart.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = CartItem.objects.filter(user=request.user)
        serializer = CartItemSerializer(items, many=True)
        total = sum(item.subtotal for item in items)
        return Response({
            "items": serializer.data,
            "grand_total": total
        })

    def post(self, request):
        serializer = CartItemSerializer(data=request.data)
        if serializer.is_valid():
            # Check if item already exists in cart, if so, update quantity
            item = serializer.validated_data['item']
            cart_item, created = CartItem.objects.get_or_create(
                user=request.user, 
                item=item,
                defaults={'quantity': serializer.validated_data.get('quantity', 1)}
            )
            if not created:
                cart_item.quantity += serializer.validated_data.get('quantity', 1)
                cart_item.save()
            
            return Response({"message": "Cart updated"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# --- 3. MPESA STK PUSH (INITIATION) ---

class InitiatePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        phone = request.data.get('phone')
        
        if not phone:
            return Response({"error": "Phone number is required"}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Fetch all items in the user's cart
        user_cart = CartItem.objects.filter(user=request.user)
        
        if not user_cart.exists():
            return Response({"error": "Your cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

       
        # We calculate the total by iterating through cart subtotal properties
        # This ensures we use the MarketplaceItem.price from the database
        total_amount = sum(item.subtotal for item in user_cart)
        
        # M-Pesa STK push usually expects an Integer for the 'Amount' field in Sandbox
        amount_to_charge = int(total_amount)

        # 3. Prepare M-Pesa Credentials
        formatted_phone = format_phone_number(phone)
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        data_to_encode = settings.MPESA_SHORTCODE + settings.MPESA_PASSKEY + timestamp
        online_password = base64.b64encode(data_to_encode.encode()).decode('utf-8')

        access_token = get_mpesa_access_token()
        if not access_token:
            return Response({"error": "M-Pesa auth failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 4. Construct Payload for the entire Cart
        headers = {"Authorization": f"Bearer {access_token}"}
        stk_url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
        
        payload = {
            "BusinessShortCode": settings.MPESA_SHORTCODE,
            "Password": online_password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": amount_to_charge,
            "PartyA": formatted_phone,
            "PartyB": settings.MPESA_SHORTCODE,
            "PhoneNumber": formatted_phone,
            "CallBackURL": settings.MPESA_CALLBACK_URL,
            "AccountReference": f"Cart_{request.user.id}", # Reference the User ID
            "TransactionDesc": f"Payment for {user_cart.count()} items in cart"
        }

        try:
            # Log the attempt in MpesaCalls before sending
            MpesaCalls.objects.create(
                ip_address=request.META.get('REMOTE_ADDR', '0.0.0.0'),
                caller=str(request.user),
                conversation_id=timestamp,
                content=f"Initiating STK Push for KES {amount_to_charge}"
            )

            response = requests.post(stk_url, json=payload, headers=headers)
            res_data = response.json()

            # If Safaricom accepted the request (ResponseCode 0)
            if res_data.get("ResponseCode") == "0":
                return Response({
                    "message": "STK Push sent to phone",
                    "checkout_request_id": res_data.get("CheckoutRequestID"),
                    "amount": amount_to_charge
                }, status=status.HTTP_200_OK)
            
            return Response(res_data, status=response.status_code)

        except Exception as e:
            logger.error(f"STK Push Error: {str(e)}")
            return Response({"error": "Failed to connect to Safaricom"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
# --- 4. MPESA CALLBACK (WEBHOOK) ---

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def mpesa_callback(request):
    """
    Safaricom hits this endpoint on payment completion
    """
    try:
        raw_data = request.body.decode('utf-8')
        data = json.loads(raw_data)
        
        # Log the callback
        MpesaCallBacks.objects.create(
            ip_address=request.META.get('REMOTE_ADDR', '0.0.0.0'),
            caller="Safaricom_Gateway",
            conversation_id="STK_PUSH",
            content=raw_data
        )

        stk_callback = data.get('Body', {}).get('stkCallback', {})
        result_code = stk_callback.get('ResultCode')
        
        if result_code == 0:
            metadata = stk_callback.get('CallbackMetadata', {}).get('Item', [])
            res = {item['Name']: item.get('Value') for item in metadata}
            
            # Save the record
            MpesaPayment.objects.create(
                amount=res.get('Amount'),
                description="Marketplace Purchase",
                type="STK_PUSH",
                reference=res.get('MpesaReceiptNumber'),
                first_name="M-Pesa",
                last_name="Customer",
                phone_number=str(res.get('PhoneNumber')),
                organization_balance=0.00
            )
            return HttpResponse("Success", status=200)
            
    except Exception as e:
        logger.error(f"Callback processing error: {str(e)}")
        
    return HttpResponse("Callback Received", status=200)

# --- 5. AI ASSISTANT VIEW ---
class AgriAIAssistantView(APIView):
    """
    Handles Chat, Crop Disease Detection (Vision), and Market Research.
    Saves interactions to the database for customer research analysis.
    """
    permission_classes = [IsAuthenticated]
    # Required to handle both JSON text and image file uploads
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        # 1. Initialize Serializer with the incoming data
        # This handles validation (e.g., ensuring an image is present for 'vision' mode)
        serializer = AIInteractionSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # 2. Extract validated data
        mode = serializer.validated_data.get('mode')
        query = serializer.validated_data.get('query')
        image = request.FILES.get('image') # Files are handled separately from validated_data

        try:
            # 3. Call the AI Utility (AgriBrain)
            ai_response = AgriBrain.process_request(
                mode=mode, 
                text_query=query, 
                image_file=image
            )
            
            # 4. Save the interaction to the database
            # We pass user and response manually since they are read-only in the serializer
            serializer.save(
                user=request.user, 
                response=ai_response,
                image=image
            )
            
            # 5. Return response to React
            return Response({
                "status": "success",
                "mode": mode,
                "data": ai_response
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"AI Assistant Error: {str(e)}")
            return Response({
                "status": "error",
                "message": "The AI agronomist is currently offline. Please try again later."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)