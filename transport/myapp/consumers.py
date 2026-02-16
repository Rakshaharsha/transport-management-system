import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Bus, User

class BusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.bus_id = self.scope['url_route']['kwargs']['bus_id']
        self.room_group_name = f'bus_{self.bus_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type')
        
        if message_type == 'location_update':
            location = text_data_json.get('location')
            # Update bus location in DB
            await self.update_bus_location(self.bus_id, location)
            
            # Broadcast location to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'bus_location_update',
                    'location': location
                }
            )

    # Receive message from room group
    async def bus_location_update(self, event):
        location = event['location']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'location_update',
            'location': location
        }))

    @database_sync_to_async
    def update_bus_location(self, bus_id, location):
        try:
            bus = Bus.objects.get(id=bus_id)
            bus.current_location = str(location) # JSON string or lat,long
            # if location is object with lat/lng
            if isinstance(location, dict):
                 # Try to update specific fields if they exist in future
                 pass
            bus.save()
        except Bus.DoesNotExist:
            pass


class DriverLocationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'driver_locations'
        
        # Check permissions - only admin should listen? 
        # For now allow authenticated users or just connect
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        
    async def receive(self, text_data):
        data = json.loads(text_data)
        if data.get('type') == 'update_location':
            driver_id = data.get('driver_id')
            lat = data.get('latitude')
            lng = data.get('longitude')
            
            await self.update_driver_location(driver_id, lat, lng)
            
            # Broadcast to admins
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'driver_location_broadcast',
                    'driver_id': driver_id,
                    'latitude': lat,
                    'longitude': lng
                }
            )

    async def driver_location_broadcast(self, event):
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def update_driver_location(self, driver_id, lat, lng):
        try:
            driver = User.objects.get(id=driver_id)
            driver.current_latitude = lat
            driver.current_longitude = lng
            driver.save()
        except User.DoesNotExist:
            pass
