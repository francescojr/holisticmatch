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
        Uses raw SQL for SQLite compatibility
        """
        from django.db.models import Q
        from django.db import connection
        
        # For SQLite, we need to use JSON_TYPE and JSON_EACH
        # For PostgreSQL, we'll use @> operator (when we switch)
        if 'sqlite' in connection.vendor:
            # SQLite approach: Check if service exists in JSON array
            # Using raw SQL with json_each to iterate array
            return queryset.extra(
                where=[
                    "EXISTS (SELECT 1 FROM json_each(professionals_professional.services) WHERE json_each.value = %s)"
                ],
                params=[value]
            )
        else:
            # PostgreSQL approach
            return queryset.filter(services__contains=[value])
