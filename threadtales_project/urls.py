from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from main.views import home, create_order, subscribe

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home, name='home'),
    path('api/order/', create_order, name='create_order'),
    path('api/subscribe/', subscribe, name='subscribe'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
