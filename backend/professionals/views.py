"""
Views for the professionals app.
Implements API endpoints for professional profiles.
"""
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend

from .models import Professional
from .serializers import ProfessionalSerializer, ProfessionalSummarySerializer
from .filters import ProfessionalFilter
from .constants import SERVICE_TYPES


class ProfessionalViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for Professional model
    Provides list and retrieve actions with filtering
    """
    queryset = Professional.objects.all()
    serializer_class = ProfessionalSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_class = ProfessionalFilter
    
    def get_serializer_class(self):
        """Use summary serializer for list view"""
        if self.action == 'list':
            return ProfessionalSummarySerializer
        return ProfessionalSerializer
    
    @action(detail=False, methods=['get'])
    def service_types(self, request):
        """
        GET /api/v1/professionals/service_types/
        Returns list of available service types
        """
        return Response(SERVICE_TYPES)
