from django.urls import path
from . import views

# This namespace must match what you use in your main project urls.py
app_name ='services'

urlpatterns = [
    # --- Marketplace Display & Posting ---
    
    # GET: Fetch all categories (Personnel, Products, etc.)
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    
    # GET: Fetch all active items
    # POST: Create a new item (Requires Auth)
    path('items/', views.ItemListView.as_view(), name='item-list'),
    
    # --- Shopping Cart Management ---
    
    # GET: View all items in the logged-in user's cart + Grand Total
    # POST: Add an item to the cart (or increment quantity)
    path('cart/', views.CartView.as_view(), name='cart-detail'),

    # --- M-Pesa Payment Endpoints ---
    
    # MODIFIED LOGIC:
    # POST: Trigger the STK Push prompt for the TOTAL cart value.
    # Expected JSON: {"phone": "07XXXXXXXX"}
    # The view now calculates the total from CartItem models internally.
    path('pay/initiate/', views.InitiatePaymentView.as_view(), name='pay-initiate'),
    
    # POST: Webhook for Safaricom to send payment results
    # Ensure this URL is identical to the 'CallBackURL' sent in the initiate payload
    path('pay/callback/', views.mpesa_callback, name='mpesa-callback'),
    
    #AI ASSISTANT
    path('ai-assistant/', views.AgriAIAssistantView.as_view(), name='ai-assistant'),
]