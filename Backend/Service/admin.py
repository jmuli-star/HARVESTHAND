from django.contrib import admin
from django.utils.html import format_html
from .models import Category, MarketplaceItem, MpesaCalls, MpesaCallBacks, MpesaPayment, Order , CartItem

# --- 1. MARKETPLACE ADMIN ---

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'icon_name', 'created_at')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)
    ordering = ('name',)

@admin.register(MarketplaceItem)
class MarketplaceItemAdmin(admin.ModelAdmin):
    # Added 'provider' to show who is selling the item
    list_display = ('get_image', 'name', 'category', 'item_type', 'price', 'stock_quantity', 'provider', 'is_active')
    list_filter = ('item_type', 'category', 'is_active', 'created_at')
    search_fields = ('name', 'description', 'provider__username')
    list_editable = ('price', 'stock_quantity', 'is_active')
    readonly_fields = ('get_image_large', 'created_at', 'updated_at')
    autocomplete_fields = ['category', 'provider'] # Helpful if you have many users/categories

    def get_image(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 45px; height: 45px; border-radius: 8px; object-fit: cover;" />', obj.image.url)
        return "No Image"
    get_image.short_description = 'Thumbnail'

    def get_image_large(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-width: 300px; border-radius: 15px;" />', obj.image.url)
        return "No Image Uploaded"
    get_image_large.short_description = 'Current Image Preview'

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    """Allows admins to see active shopping carts across the platform"""
    list_display = ('user', 'item', 'quantity', 'get_subtotal', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__email', 'item__name')
    readonly_fields = ('created_at', 'updated_at')

    def get_subtotal(self, obj):
        return f"KES {obj.subtotal:,}"
    get_subtotal.short_description = 'Subtotal'
# --- 2. MPESA LOGGING ADMIN ---

@admin.register(MpesaCalls)
class MpesaCallsAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'caller', 'conversation_id', 'ip_address')
    list_filter = ('created_at',)
    search_fields = ('caller', 'conversation_id', 'content')
    readonly_fields = ('created_at', 'updated_at', 'content', 'ip_address')

@admin.register(MpesaCallBacks)
class MpesaCallBacksAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'conversation_id', 'ip_address')
    list_filter = ('created_at',)
    search_fields = ('conversation_id', 'content')
    readonly_fields = ('created_at', 'updated_at', 'content', 'ip_address')

@admin.register(MpesaPayment)
class MpesaPaymentAdmin(admin.ModelAdmin):
    list_display = ('reference', 'first_name', 'last_name', 'amount', 'phone_number', 'created_at')
    list_filter = ('created_at', 'type')
    search_fields = ('reference', 'phone_number', 'first_name', 'last_name')
    # Fields should be read-only to maintain financial integrity
    readonly_fields = ('user', 'item', 'amount', 'reference', 'first_name', 'middle_name', 'last_name', 
                       'phone_number', 'organization_balance', 'description', 'type', 'created_at')

# --- 3. ORDER MANAGEMENT ADMIN ---
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    # Maps fulfillment status and links back to the M-Pesa transaction
    list_display = ('id', 'item', 'get_payment_ref', 'quantity', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    list_editable = ('status',)
    search_fields = ('item__name', 'payment__reference', 'payment__first_name')
    readonly_fields = ('payment', 'item', 'quantity', 'created_at')

    def get_payment_ref(self, obj):
        if obj.payment:
            return obj.payment.reference
        return "N/A"
    get_payment_ref.short_description = 'M-Pesa Ref'