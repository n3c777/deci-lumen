from flask import Blueprint, request, jsonify
from app.models.models import ProcessAudio
import json

"""
MQTT ROUTES
"""

def mqtt_routes(mqtt_client):
    mqtt_routes = Blueprint('mqtt', __name__)

    @mqtt_routes.route('/publish', methods=['POST'])
    def publish_all_processed_audio():
        processed_audios = ProcessAudio.query.all()
        if not processed_audios:
            return jsonify({'error': 'No processed audio tracks found.'}), 500

        min_value = -80
        max_value = 0

        for processed_audio in processed_audios:
            if hasattr(processed_audio, 'decibel_levels') and processed_audio.decibel_levels:
                decibel_levels = json.loads(processed_audio.decibel_levels)
                normalized_levels = [
                    int((value - min_value) / (max_value - min_value) * 255) for value in decibel_levels
                ]
            else:
                normalized_levels = []

            message = {
                'audio_id': processed_audio.audio_id,
                'normalized_levels': normalized_levels
            }

            mqtt_client.publish(json.dumps(message))
            mqtt_client.publish(json.dumps("this is a message from the web"))

        return jsonify({'message': 'All processed audio tracks published successfully'}), 200
    
    return mqtt_routes