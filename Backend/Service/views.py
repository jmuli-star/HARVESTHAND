import json
import base64
import requests
import logging
from datetime import datetime
from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import (
    Category, MarketplaceItem, MpesaCalls, 
    MpesaCallBacks, MpesaPayment
)
from .serializers import CategorySerializer, MarketplaceItemSerializer

logger = logging.getLogger(__name__)

# --- 1. MPESA AUTH UTILITY ---

def get_access_token():
    """Fetches OAuth2 token using credentials defined in settings (via Decouple)"""
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

def format_phone(phone):
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
    permission_classes = [AllowAny]
    def get(self, request):
        items = MarketplaceItem.objects.filter(is_active=True)
        cat_slug = request.query_params.get('category')
        if cat_slug:
            items = items.filter(category__slug=cat_slug)
        serializer = MarketplaceItemSerializer(items, many=True)
        return Response(serializer.data)

# --- 3. MPESA STK PUSH (INITIATION) ---

class InitiatePaymentView(APIView):
    def post(self, request):
        # 1. Get Data
        phone = request.data.get('phone')
        item_id = request.data.get('item_id')
        
        if not phone:
            return Response({"error": "Phone number is required"}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Format Phone (Crucial step)
        # Converts 0712345678 to 254712345678
        if phone.startswith('0'):
            phone = '254' + phone[1:]
        elif phone.startswith('+'):
            phone = phone[1:]

        # 3. Generate Password & Timestamp
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        data_to_encode = settings.MPESA_SHORTCODE + settings.MPESA_PASSKEY + timestamp
        online_password = base64.b64encode(data_to_encode.encode()).decode('utf-8')

        # 4. Get Access Token
        access_token = self.get_access_token()
        if not access_token:
            return Response({"error": "Failed to get M-Pesa access token"}, status=500)

        # 5. Call Safaricom STK Push
        headers = {"Authorization": f"Bearer {access_token}"}
        stk_url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
        
        payload = {
            "BusinessShortCode": settings.MPESA_SHORTCODE,
            "Password": online_password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline", # Use CustomerBuyGoodsOnline if using Till
            "Amount": 1, # You can link this to item.price later
            "PartyA": phone,
            "PartyB": settings.MPESA_SHORTCODE,
            "PhoneNumber": phone,
            "CallBackURL": "https://your-domain.com/api/v1/services/pay/callback/",
            "AccountReference": f"Item_{item_id}",
            "TransactionDesc": "HarvestMarket Purchase"
        }

        try:
            response = requests.post(stk_url, json=payload, headers=headers)
            return Response(response.json(), status=response.status_code)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def get_access_token(self):
        # Helper to get the OAuth token
        url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
        try:
            res = requests.get(url, auth=(settings.MPESA_CONSUMER_KEY, settings.MPESA_CONSUMER_SECRET))
            return res.json().get('access_token')
        except:
            return None

# --- 4. MPESA CALLBACK (WEBHOOK) ---

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def mpesa_callback(request):
    """
    Safaricom Gateway hits this endpoint
    """
    raw_data = request.body.decode('utf-8')
    
    # 1. Log raw callback
    MpesaCallBacks.objects.create(
        ip_address=request.META.get('REMOTE_ADDR', '0.0.0.0'),
        caller="Safaricom_Callback",
        conversation_id="STK_PUSH",
        content=raw_data
    )

    data = json.loads(raw_data)
    # Safaricom structure: Body -> stkCallback -> ResultCode
    stk_callback = data.get('Body', {}).get('stkCallback', {})
    result_code = stk_callback.get('ResultCode')
    
    if result_code == 0:
        # Success! Extract metadata
        metadata = stk_callback.get('CallbackMetadata', {}).get('Item', [])
        res = {item['Name']: item.get('Value') for item in metadata}
        
        # 2. Save MpesaPayment record
        MpesaPayment.objects.create(
            amount=res.get('Amount'),
            description="Marketplace Success",
            type="STK_PUSH",
            reference=res.get('MpesaReceiptNumber'),
            first_name="Verified",
            last_name="Customer",
            phone_number=str(res.get('PhoneNumber')),
            organization_balance=0.00
        )
        
    return HttpResponse(status=200)