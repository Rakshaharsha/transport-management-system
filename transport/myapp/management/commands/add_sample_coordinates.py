from django.core.management.base import BaseCommand
from myapp.models import User, Bus
from decimal import Decimal
import random


class Command(BaseCommand):
    help = 'Add sample coordinates to buses and students for testing'

    def handle(self, *args, **kwargs):
        # Sample coordinates around Tiruchengode area
        # University: 11.3833, 77.8833
        
        # Bus routes with coordinates
        bus_routes = [
            {
                'source': 'Salem',
                'source_lat': 11.6643,
                'source_lon': 78.1460,
                'dest_lat': 11.3833,
                'dest_lon': 77.8833,
                'distance': 45
            },
            {
                'source': 'Namakkal',
                'source_lat': 11.2189,
                'source_lon': 78.1677,
                'dest_lat': 11.3833,
                'dest_lon': 77.8833,
                'distance': 35
            },
            {
                'source': 'Erode',
                'source_lat': 11.3410,
                'source_lon': 77.7172,
                'dest_lat': 11.3833,
                'dest_lon': 77.8833,
                'distance': 18
            },
            {
                'source': 'Karur',
                'source_lat': 10.9601,
                'source_lon': 78.0766,
                'dest_lat': 11.3833,
                'dest_lon': 77.8833,
                'distance': 55
            },
        ]
        
        # Student home locations around these areas
        student_locations = [
            {'name': 'Salem area', 'lat': 11.6643, 'lon': 78.1460},
            {'name': 'Namakkal area', 'lat': 11.2189, 'lon': 78.1677},
            {'name': 'Erode area', 'lat': 11.3410, 'lon': 77.7172},
            {'name': 'Karur area', 'lat': 10.9601, 'lon': 78.0766},
            {'name': 'Sankari', 'lat': 11.4833, 'lon': 77.8667},
            {'name': 'Rasipuram', 'lat': 11.4667, 'lon': 78.1667},
            {'name': 'Attur', 'lat': 11.5942, 'lon': 78.6009},
        ]
        
        # Update buses
        buses = Bus.objects.all()
        bus_count = 0
        
        for bus in buses:
            # Find matching route or assign random
            route = None
            for r in bus_routes:
                if r['source'].lower() in bus.source.lower():
                    route = r
                    break
            
            if not route:
                route = random.choice(bus_routes)
            
            bus.source_latitude = Decimal(str(route['source_lat']))
            bus.source_longitude = Decimal(str(route['source_lon']))
            bus.destination_latitude = Decimal(str(route['dest_lat']))
            bus.destination_longitude = Decimal(str(route['dest_lon']))
            bus.distance_km = Decimal(str(route['distance']))
            bus.save()
            
            bus_count += 1
            self.stdout.write(f'✅ Updated Bus {bus.bus_number}: {bus.source} ({route["distance"]}km)')
        
        # Update students
        students = User.objects.filter(role='STUDENT')
        student_count = 0
        
        for student in students:
            # Assign random location with slight variation
            location = random.choice(student_locations)
            
            # Add small random offset (±0.05 degrees ≈ ±5km)
            lat_offset = (random.random() - 0.5) * 0.1
            lon_offset = (random.random() - 0.5) * 0.1
            
            student.home_latitude = Decimal(str(location['lat'] + lat_offset))
            student.home_longitude = Decimal(str(location['lon'] + lon_offset))
            student.save()
            
            student_count += 1
            self.stdout.write(f'✅ Updated {student.username}: {location["name"]}')
        
        self.stdout.write(self.style.SUCCESS(f'\n✅ Updated {bus_count} buses'))
        self.stdout.write(self.style.SUCCESS(f'✅ Updated {student_count} students'))
        self.stdout.write(self.style.SUCCESS(f'\n🎯 Ready for auto-assignment!'))
