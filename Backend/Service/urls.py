from django.urls import path
from . import views

app_name = 'services'

urlpatterns = [
    # --- Marketplace Display Endpoints ---
    # Fetch all categories (Personnel, Products, etc.)
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    
    # Fetch all items (or filter by category via ?category=slug)
    path('items/', views.ItemListView.as_view(), name='item-list'),

    # --- M-Pesa Payment Endpoints ---
    # Trigger the STK Push prompt on a user's phone
    path('pay/initiate/', views.InitiatePaymentView.as_view(), name='pay-initiate'),
    
    # Webhook for Safaricom to send payment results (Public URL)
    path('callback/', views.mpesa_callback, name='mpesa-callback'),
]