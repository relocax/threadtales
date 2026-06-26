import json
import logging

from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from .models import Product, Order
from django.db import IntegrityError
from .models import Subscriber

logger = logging.getLogger(__name__)


def home(request):
    products = Product.objects.filter(is_active=True)
    return render(request, 'main/home.html', {'products': products})


@require_POST
@csrf_exempt  # JS fetch with custom headers; CSRF checked manually below
def create_order(request):
    """
    Log an order before redirecting to WhatsApp.
    No payment data stored — just product + customer info.
    """
    # CSRF check (manual — JS sends token in header)
    csrf_token = request.headers.get('X-CSRFToken', '')
    if not csrf_token:
        return JsonResponse({'error': 'CSRF token required'}, status=403)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    product_id = data.get('product_id')
    if not product_id:
        return JsonResponse({'error': 'product_id is required'}, status=400)

    try:
        product = Product.objects.get(id=product_id, is_active=True)
    except Product.DoesNotExist:
        return JsonResponse({'error': 'Product not found'}, status=404)

    order = Order.objects.create(
        product=product,
        product_name=product.name,
        product_price=product.price,
        quantity=1,
        total_amount=product.price,
    )

    logger.info(f"Order #{order.id} created: {product.name} (Rs. {product.price})")

    return JsonResponse({
        'success': True,
        'order_id': order.id,
        'product_name': product.name,
        'price': product.price,
    })

@require_POST
@csrf_exempt
def subscribe(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()

    if not name or not email:
        return JsonResponse({'error': 'Name and email required'}, status=400)

    try:
        Subscriber.objects.create(name=name, email=email)
        return JsonResponse({'success': True, 'message': 'Subscribed!'})
    except IntegrityError:
        return JsonResponse({'success': False, 'message': 'Already subscribed'}, status=409)