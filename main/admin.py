from django.contrib import admin
from .models import Product, ProductImage, Order, Subscriber


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ['image', 'order']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'category', 'badge', 'rating', 'is_active', 'image_count', 'created_at']
    list_filter = ['category', 'badge', 'is_active']
    search_fields = ['name', 'description']
    list_editable = ['price', 'badge', 'is_active']
    ordering = ['-created_at']
    inlines = [ProductImageInline]

    fieldsets = (
        ('Basic Info', {
            'fields': ('name', 'price', 'description', 'tag')
        }),
        ('Categorization', {
            'fields': ('category', 'badge', 'rating')
        }),
        ('Status', {
            'fields': ('is_active',),
        }),
    )

    def image_count(self, obj):
        return obj.images.count()
    image_count.short_description = 'Images'


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'product_name', 'total_amount', 'status', 'customer_name',
                    'customer_phone', 'whatsapp_sent', 'created_at']
    list_filter = ['status', 'whatsapp_sent', 'created_at']
    search_fields = ['product_name', 'customer_name', 'customer_phone']
    list_editable = ['status']
    ordering = ['-created_at']
    readonly_fields = ['created_at']

    fieldsets = (
        ('Order Info', {
            'fields': ('product', 'product_name', 'product_price', 'quantity', 'total_amount')
        }),
        ('Customer', {
            'fields': ('customer_name', 'customer_phone', 'customer_address')
        }),
        ('Status', {
            'fields': ('status', 'whatsapp_sent', 'notes')
        }),
        ('Timestamp', {
            'fields': ('created_at',),
        }),
    )


@admin.register(Subscriber)
class SubscriberAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'subscribed_at']
    search_fields = ['name', 'email']
    ordering = ['-subscribed_at']
