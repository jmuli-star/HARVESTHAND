from rest_framework import serializers
from .models import Category, MarketplaceItem, MpesaPayment, Order
from django.contrib.auth import get_user_model

User = get_user_model()

class CategorySerializer(serializers.ModelSerializer):
    """
    Serializes categories (Personnel, Products, etc.)
    """
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'icon_name']

class MarketplaceItemSerializer(serializers.ModelSerializer):
    """
    Handles the products and personnel. 
    Uses CategorySerializer to provide full category data.
    """
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), 
        source='category', 
        write_only=True
    )
    # The image field automatically returns the Cloudinary URL
    image = serializers.SerializerMethodField()

    class Meta:
        model = MarketplaceItem
        fields = [
            'id', 'category', 'category_id', 'item_type', 'name', 
            'description', 'price', 'image', 'stock_quantity', 
            'is_active', 'created_at'
        ]

    def get_image(self, obj):
        if obj.image:
            return obj.image.url
        return None

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