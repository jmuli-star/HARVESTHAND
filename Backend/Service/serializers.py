from rest_framework import serializers
from .models import Category, MarketplaceItem, MpesaPayment, Order , CartItem , AIInteraction
from django.contrib.auth import get_user_model

User = get_user_model()

# MARKET PLACE
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'icon_name']

class MarketplaceItemSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True) 
    # ID field for the frontend to send the integer ID when creating an item
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), 
        source='category', 
        write_only=True
    )
    # Provider info - Read only because we set this via the request user in the view
    provider_name = serializers.ReadOnlyField(source='provider.username')
    image = serializers.SerializerMethodField()

    class Meta:
        model = MarketplaceItem
        fields = [
            'id', 'category', 'category_id', 'item_type', 'name', 
            'description', 'price', 'image', 'stock_quantity', 
            'provider_name', 'is_active', 'created_at'
        ]

    def get_image(self, obj):
        if obj.image:
            return obj.image.url
        return None
    
# SECTION 2: CART SYSTEM (NEW)
class CartItemSerializer(serializers.ModelSerializer):
    """
    MODIFIED: Explicitly flat-mapping fields for easier frontend calculation 
    and display within the M-Pesa checkout drawer.
    """
    # item_details gives the full object if needed
    item_details = MarketplaceItemSerializer(source='item', read_only=True)
    
    # Flat fields for quick access in the React frontend
    item_name = serializers.ReadOnlyField(source='item.name')
    item_price = serializers.ReadOnlyField(source='item.price')
    item_image = serializers.SerializerMethodField()
    
    item_id = serializers.PrimaryKeyRelatedField(
        queryset=MarketplaceItem.objects.all(),
        source='item',
        write_only=True
    )
    
    # This pulls from the @property def subtotal(self) in models.py
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = [
            'id', 'item_id', 'item_name', 'item_price', 'item_image', 
            'item_details', 'quantity', 'subtotal', 'created_at'
        ]

    def get_item_image(self, obj):
        """Helper to get the Cloudinary URL for the item directly in the cart list"""
        if obj.item.image:
            return obj.item.image.url
        return None


# MPESA

class MpesaPaymentSerializer(serializers.ModelSerializer):
    """
    Serializes successful M-Pesa payment records.
    """
    class Meta:
        model = MpesaPayment
        fields = [
            'id', 'amount', 'description', 'reference', 
            'first_name', 'last_name', 'phone_number', 
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class OrderSerializer(serializers.ModelSerializer):
    """
    The full order details, linking the payment to the item.
    """
    item = MarketplaceItemSerializer(read_only=True)
    payment = MpesaPaymentSerializer(read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'payment', 'item', 'quantity', 'status', 'created_at']

class AIInteractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIInteraction
        fields = ['id', 'user', 'mode', 'query', 'image', 'response', 'created_at']
        read_only_fields = ['user', 'response', 'created_at']

    def validate(self, data):
        # Ensure that if it's chat/market, there's a query. If vision, there's an image.
        if data.get('mode') in ['chat', 'market'] and not data.get('query'):
            raise serializers.ValidationError("A query text is required for this mode.")
        if data.get('mode') == 'vision' and not self.initial_data.get('image'):
            raise serializers.ValidationError("An image is required for Crop Doctor mode.")
        return data