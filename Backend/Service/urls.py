from django.urls import path
from . import views

# This namespace must match what you use in your main project urls.py
app_name = 'services'

urlpatterns = [
    # --- Marketplace Display & Posting ---
    
    # GET: Fetch all categories (Personnel, Products, etc.)
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    
    # GET: Fetch all active items
    # POST: Create a new item (Requires Auth)
    path('items/', views.ItemListView.as_view(), name='item-list'),

    # --- M-Pesa Payment Endpoints ---
    
    # POST: Trigger the STK Push prompt on a user's phone
    # Expected JSON: {"phone": "07...", "item_id": 1}
    path('pay/initiate/', views.InitiatePaymentView.as_view(), name='pay-initiate'),
    
    # POST: Webhook for Safaricom to send payment results
    # This URL must be publicly accessible for Safaricom to hit it
    path('pay/callback/', views.mpesa_callback, name='mpesa-callback'),
]