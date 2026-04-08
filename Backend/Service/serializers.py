from rest_framework import serializers
from .models import Category, MarketplaceItem, MpesaPayment, Order , CartItem
from django.contrib.auth import get_user_model

User = get_user_model()

# MARKET PLACE
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'icon_name']

class MarketplaceItemSerializer(serializers.ModelSerializer):
    # Nested category object for the frontend to show names/icons easily
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
# ==========================================

class CartItemSerializer(serializers.ModelSerializer):
    """
    NEW: Manages the active shopping cart for an Institution.
    Includes the subtotal property from the model.
    """
    item_details = MarketplaceItemSerializer(source='item', read_only=True)
    item_id = serializers.PrimaryKeyRelatedField(
        queryset=MarketplaceItem.objects.all(),
        source='item',
        write_only=True
    )
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = ['id', 'item_id', 'item_details', 'quantity', 'subtotal', 'created_at']
        
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