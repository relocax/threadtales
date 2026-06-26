from django.db import models


class Product(models.Model):
    CATEGORY_CHOICES = [
        ('Outerwear', 'Outerwear'),
        ('Hoodies', 'Hoodies'),
        ('Tees', 'Tees'),
        ('Bottoms', 'Bottoms'),
        ('Dresses', 'Dresses'),
        ('Accessories', 'Accessories'),
        ('Shirts', 'Shirts'),
        ('Knitwear', 'Knitwear'),
    ]

    BADGE_CHOICES = [
        ('', '— None —'),
        ('Bestseller', 'Bestseller'),
        ('New Drop', 'New Drop'),
        ('Limited', 'Limited'),
        ('Premium', 'Premium'),
        ('Essential', 'Essential'),
        ('Artisan', 'Artisan'),
    ]

    name = models.CharField(max_length=200)
    price = models.PositiveIntegerField(help_text="Price in Rs.")
    description = models.TextField()
    tag = models.CharField(max_length=200, help_text="Short feature tag, e.g. 'Summer friendly breathable cotton.'")
    badge = models.CharField(max_length=20, choices=BADGE_CHOICES, blank=True, default='')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='Outerwear')
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=4.5)

    image1 = models.CharField(max_length=200, help_text="Filename in static/images/ (e.g. product1.jpg)")
    image2 = models.CharField(max_length=200, blank=True, help_text="Alt view filename in static/images/ (e.g. product1_2.jpg)")

    is_active = models.BooleanField(default=True, help_text="Only active products appear on the site.")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def currency(self):
        return 'Rs.'


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    product_name = models.CharField(max_length=200)
    product_price = models.PositiveIntegerField()
    quantity = models.PositiveIntegerField(default=1)
    total_amount = models.PositiveIntegerField()

    customer_name = models.CharField(max_length=200, blank=True)
    customer_phone = models.CharField(max_length=20, blank=True)
    customer_address = models.TextField(blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    whatsapp_sent = models.BooleanField(default=False)
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.id} — {self.product_name} (Rs. {self.total_amount})"

class Subscriber(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-subscribed_at']

    def __str__(self):
        return f"{self.name} <{self.email}>"