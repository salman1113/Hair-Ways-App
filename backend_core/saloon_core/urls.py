from django.contrib import admin, auth
from django.contrib.auth import views as auth_views
from django.http import JsonResponse
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static


# ── Health Check (for AWS ALB) ────────────────────────────────────────────
def health_check(request):
    return JsonResponse({"status": "healthy", "service": "backend_core"})


# Swagger Imports
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Swagger Schema View Configuration
schema_view = get_schema_view(
   openapi.Info(
      title="Hair Ways API",
      default_version='v1',
      description="Detailed API documentation for Hair Ways Salon Booking Application",
      terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="support@hairways.com"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Health check endpoint (no auth — used by AWS ALB)
    path('health/', health_check, name='health-check'),

    path('admin/', admin.site.urls),

    # Services API Link
    path('api/v1/services/', include('services.urls')),

    # Bookings API Link
    path('api/v1/bookings/', include('bookings.urls')),

    # Accounts Link
    path('api/v1/accounts/', include('accounts.urls')),
    
    # DRF Login/Logout (Session Auth)
    path('api-auth/', include('rest_framework.urls')),
    
    # Swagger and Redoc URLs
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

    # Fix for Swagger Logout (Redirect/Alias)
    path('accounts/logout/', auth_views.LogoutView.as_view(), name='logout'),
]

# (Media & Static URL Setting for Daphne):
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)