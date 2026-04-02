from django.db import models
from django.conf import settings
from cloudinary.models import CloudinaryField

# --- BASE MODELS ---

class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

# --- MARKETPLACE MODELS ---

class Category(BaseModel):
    """
    Categories: Personnel (Engineers/Mechanics), Products (Solar/Feeders), etc.
    """
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    icon_name = models.CharField(max_length=50, default="package") # For Lucide icons

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

class MarketplaceItem(BaseModel):
    """
    The actual items for sale or professionals for hire.
    """
    ITEM_TYPES = [
        ('personnel', 'Personnel/Professional Service'),
        ('product', 'Physical Product'),
    ]

    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="items")
    item_type = models.CharField(max_length=20, choices=ITEM_TYPES)
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Cloudinary image storage
    image = CloudinaryField('image', folder='harvest_hand/marketplace/', null=True, blank=True)
    
    # Inventory and provider info
    stock_quantity = models.PositiveIntegerField(default=0)
    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name="provided_items"
    )
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"[{self.category.name}] {self.name}"

# --- MPESA LOGGING MODELS (Your existing logic) ---

class MpesaCalls(BaseModel):
    ip_address = models.TextField()
    caller = models.TextField()
    conversation_id = models.TextField()
    content = models.TextField()

    class Meta:
        verbose_name = 'Mpesa Call'
        verbose_name_plural = 'Mpesa Calls'

class MpesaCallBacks(BaseModel):
    ip_address = models.TextField()
    caller = models.TextField()
    conversation_id = models.TextField()
    content = models.TextField()

    class Meta:
        verbose_name = 'Mpesa Call Back'
        verbose_name_plural = 'Mpesa Call Backs'

class MpesaPayment(BaseModel):
    """
    Final record of a successful payment. 
    Linked to a user and potentially a specific item.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="payments", 
        null=True
    )
    item = models.ForeignKey(
        MarketplaceItem, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    type = models.TextField() # e.g. "Paybill" or "BuyGoods"
    reference = models.TextField() # M-Pesa Receipt Number
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100)
    phone_number = models.TextField()
    organization_balance = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        verbose_name = 'Mpesa Payment'
        verbose_name_plural = 'Mpesa Payments'

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.reference}"

# --- ORDER MANAGEMENT ---

class Order(BaseModel):
    """
    Connects a successful MpesaPayment to the actual business fulfillment.
    """
    payment = models.OneToOneField(MpesaPayment, on_delete=models.CASCADE)
    item = models.ForeignKey(MarketplaceItem, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    status = models.CharField(
        max_length=20, 
        choices=[('pending', 'Pending'), ('shipped', 'Shipped'), ('completed', 'Completed')],
        default='pending'
    )

    def __str__(self):
        return f"Order {self.id} for {self.item.name}"