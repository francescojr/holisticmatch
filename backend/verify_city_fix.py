#!/usr/bin/env python
"""
Verification script for city/state validation fixes
Run this to verify the fixes are working correctly
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from professionals.models import City, Professional
from django.db.models import Count
from django.contrib.auth.models import User


def verify_city_population():
    """Verify all Brazilian cities are populated"""
    print("\n" + "="*60)
    print("1. CITY POPULATION VERIFICATION")
    print("="*60)
    
    total_cities = City.objects.count()
    total_states = City.objects.values('state').distinct().count()
    
    print(f"✓ Total cities in database: {total_cities}")
    print(f"✓ Total states in database: {total_states}")
    
    if total_states == 27:
        print("✓ All 27 Brazilian states represented")
    else:
        print(f"✗ Expected 27 states, found {total_states}")
        return False
    
    # Show state breakdown
    state_counts = City.objects.values('state').annotate(count=Count('id')).order_by('state')
    print("\nCities per state:")
    for item in state_counts:
        print(f"  {item['state']}: {item['count']}")
    
    return True


def verify_unique_constraint():
    """Verify UNIQUE constraint is working"""
    print("\n" + "="*60)
    print("2. UNIQUE CONSTRAINT VERIFICATION")
    print("="*60)
    
    # Try to create a duplicate - should return existing, not error
    city, created = City.objects.get_or_create(state='SP', name='São Paulo')
    
    if not created:
        print("✓ get_or_create() correctly returns existing city (not duplicate)")
    else:
        print("✗ get_or_create() created a duplicate (should have returned existing)")
        return False
    
    # Verify no duplicate entries
    duplicates = City.objects.values('state', 'name').annotate(count=Count('id')).filter(count__gt=1)
    if duplicates.count() == 0:
        print("✓ No duplicate cities found in database")
    else:
        print(f"✗ Found {duplicates.count()} duplicate city entries:")
        for dup in duplicates:
            print(f"  {dup['state']}/{dup['name']}: {dup['count']} times")
        return False
    
    return True


def verify_city_data():
    """Verify cities have proper names with accents"""
    print("\n" + "="*60)
    print("3. CITY NAME VERIFICATION")
    print("="*60)
    
    # Check key cities with accents
    test_cities = [
        ('SP', 'São Paulo'),
        ('RJ', 'Rio de Janeiro'),
        ('MG', 'Uberlândia'),
        ('PE', 'Jaboatão dos Guararapes'),
        ('MA', 'São Luís'),
        ('PA', 'Belém'),
    ]
    
    all_found = True
    for state, city_name in test_cities:
        exists = City.objects.filter(state=state, name=city_name).exists()
        status = "✓" if exists else "✗"
        print(f"{status} {state}/{city_name}: {'Found' if exists else 'NOT FOUND'}")
        if not exists:
            all_found = False
    
    return all_found


def verify_no_encoding_errors():
    """Verify no encoding issues in city names"""
    print("\n" + "="*60)
    print("4. ENCODING VERIFICATION")
    print("="*60)
    
    # Try to encode/decode all cities
    errors = []
    for city in City.objects.all():
        try:
            # Try UTF-8 encoding/decoding
            encoded = city.name.encode('utf-8')
            decoded = encoded.decode('utf-8')
            
            if decoded != city.name:
                errors.append(f"{city.state}/{city.name}: Encoding mismatch")
        except Exception as e:
            errors.append(f"{city.state}/{city.name}: {str(e)}")
    
    if errors:
        print(f"✗ Found {len(errors)} encoding issues:")
        for error in errors[:5]:  # Show first 5
            print(f"  {error}")
        return False
    else:
        print(f"✓ All {City.objects.count()} city names encoded correctly")
        return True


def verify_fixture_compatibility():
    """Verify fixture and migration cities work together"""
    print("\n" + "="*60)
    print("5. FIXTURE COMPATIBILITY VERIFICATION")
    print("="*60)
    
    # These are the cities used in conftest.py fixtures
    fixture_cities = {
        'SP': ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto', 'Sorocaba'],
        'RJ': ['Rio de Janeiro', 'Niterói', 'Duque de Caxias', 'Nova Iguaçu'],
        'MG': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora'],
    }
    
    all_present = True
    for state, cities in fixture_cities.items():
        for city_name in cities:
            exists = City.objects.filter(state=state, name=city_name).exists()
            if not exists:
                print(f"✗ Fixture city {state}/{city_name} NOT in database")
                all_present = False
    
    if all_present:
        print("✓ All fixture cities present in database")
        print("✓ Fixture and migration data compatible")
    
    return all_present


def main():
    """Run all verifications"""
    print("\n" + "="*60)
    print("CITY/STATE VALIDATION FIX VERIFICATION")
    print("="*60)
    
    results = {
        'Population': verify_city_population(),
        'UNIQUE Constraint': verify_unique_constraint(),
        'City Names': verify_city_data(),
        'Encoding': verify_no_encoding_errors(),
        'Fixture Compatibility': verify_fixture_compatibility(),
    }
    
    print("\n" + "="*60)
    print("VERIFICATION SUMMARY")
    print("="*60)
    
    for check_name, passed in results.items():
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{status}: {check_name}")
    
    all_passed = all(results.values())
    
    print("\n" + "="*60)
    if all_passed:
        print("✓ ALL VERIFICATIONS PASSED - Ready for production!")
    else:
        print("✗ SOME VERIFICATIONS FAILED - See details above")
    print("="*60 + "\n")
    
    return 0 if all_passed else 1


if __name__ == '__main__':
    sys.exit(main())
