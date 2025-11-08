"""
URL configuration for HolisticMatch project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.response import Response
from rest_framework.decorators import api_view

@api_view(['GET'])
def health_check(request):
    """Simple health check endpoint that returns JSON"""
    return Response({
        'status': 'ok',
        'debug': settings.DEBUG,
        'message': 'HolisticMatch API is running'
    })

urlpatterns = [
    path('health/', health_check),
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('authentication.urls')),
    path('api/v1/', include('professionals.urls')),
]

# Serve media files in development
if settings.DEBUG and not settings.USE_S3:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
