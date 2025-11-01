"""
Filters for the professionals app.
Implements search and filtering logic.
"""
from django_filters import rest_framework as filters
from .models import Professional


class ProfessionalFilter(filters.FilterSet):
    """
    Filter for Professional queryset
    Supports filtering by service, location, price range, and attendance type
    """
    service = filters.CharFilter(method='filter_service')
    city = filters.CharFilter(lookup_expr='icontains')
    state = filters.CharFilter(lookup_expr='iexact')
    price_min = filters.NumberFilter(field_name='price_per_session', lookup_expr='gte')
    price_max = filters.NumberFilter(field_name='price_per_session', lookup_expr='lte')
    attendance_type = filters.CharFilter(lookup_expr='iexact')
    
    class Meta:
        model = Professional
        fields = ['service', 'city', 'state', 'price_min', 'price_max', 'attendance_type']
    
    def filter_service(self, queryset, name, value):
        """
        Filter by service type in JSONB services array
        Simple approach that works with both SQLite and PostgreSQL
        """
        # Use a simple string contains approach that works across databases
        # This will match the service name within the JSON string representation
        import json
        return queryset.filter(services__icontains=value)
