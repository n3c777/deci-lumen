from .raw_audio_routes import raw_audio_routes
from .process_audio_routes import process_audio_routes
from .mqtt_routes import mqtt_routes

routes = [raw_audio_routes, process_audio_routes, mqtt_routes]