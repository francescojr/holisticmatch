"""
Management command to load all Brazilian cities from CSV into the database.
Usage: python manage.py load_cities
"""
import csv
import os
from django.core.management.base import BaseCommand
from professionals.models import City


class Command(BaseCommand):
    help = 'Load all Brazilian cities from CSV file into the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing cities before loading',
        )

    def handle(self, *args, **options):
        csv_path = os.path.join(
            os.path.dirname(__file__),
            '../../municipios.csv'
        )

        if not os.path.exists(csv_path):
            self.stdout.write(f'CSV file not found: {csv_path}')
            return

        # Count existing cities before
        # pylint: disable=no-member
        cities_before = City.objects.count()
        self.stdout.write(f'Current cities in DB: {cities_before}')

        # Clear if requested
        if options['clear']:
            City.objects.all().delete()
            self.stdout.write('✓ Cleared existing cities')

        cities_loaded = 0
        cities_updated = 0
        cities_failed = 0
        batch_size = 1000
        cities_to_create = []

        try:
            with open(csv_path, 'r', encoding='iso-8859-1') as csvfile:
                reader = csv.DictReader(
                    csvfile,
                    fieldnames=['TOM_CODE', 'IBGE_CODE', 'CITY_TOM', 'CITY_IBGE', 'STATE'],
                    delimiter=';'
                )

                # Skip header
                next(reader, None)

                row_count = 0
                for row in reader:
                    row_count += 1
                    try:
                        city_name = row.get('CITY_IBGE', '').strip()
                        state = row.get('STATE', '').strip().upper()

                        # Validate
                        if not city_name or not state or len(state) != 2:
                            cities_failed += 1
                            continue

                        # Check if city exists
                        # pylint: disable=no-member
                        exists = City.objects.filter(
                            state=state,
                            name=city_name
                        ).exists()

                        if exists:
                            cities_updated += 1
                        else:
                            cities_to_create.append(
                                City(state=state, name=city_name)
                            )
                            cities_loaded += 1

                        # Batch create every N cities
                        if len(cities_to_create) >= batch_size:
                            # pylint: disable=no-member
                            City.objects.bulk_create(
                                cities_to_create,
                                ignore_conflicts=True
                            )
                            self.stdout.write(
                                f'Batch created {len(cities_to_create)} cities... '
                                f'(Total: {row_count} rows processed)'
                            )
                            cities_to_create = []

                    except Exception:  # noqa: BLE001
                        cities_failed += 1
                        continue

                # Create remaining cities
                if cities_to_create:
                    # pylint: disable=no-member
                    City.objects.bulk_create(
                        cities_to_create,
                        ignore_conflicts=True
                    )
                    self.stdout.write(
                        f'Final batch created {len(cities_to_create)} cities'
                    )

        except Exception:  # noqa: BLE001
            self.stdout.write('Error reading CSV')
            return

        # Summary
        # pylint: disable=no-member
        cities_after = City.objects.count()
        self.stdout.write('\n✓ Cities loading complete!')
        self.stdout.write(f'Cities loaded: {cities_loaded}')
        self.stdout.write(f'Cities updated: {cities_updated}')
        self.stdout.write(f'Cities failed: {cities_failed}')
        self.stdout.write(f'Total in DB now: {cities_after}')

