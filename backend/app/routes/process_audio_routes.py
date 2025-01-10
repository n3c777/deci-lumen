import librosa
import numpy as np
import json
from flask import Blueprint, request, jsonify
from io import BytesIO
from ..models.models import db, RawAudio, ProcessAudio
import sys

process_audio_routes = Blueprint('process_audio', __name__)

@process_audio_routes.route('/process_audio/<int:id>', methods=['POST'])
def process_audio(id):
    audio = RawAudio.query.get(id)
    if not audio:
        return jsonify({'error': 'Audio file not found.'}), 404

    audio_data, sr = librosa.load(BytesIO(audio.data), sr=None)
    decibel_levels = librosa.amplitude_to_db(np.abs(audio_data), ref=np.max)

    # Downsample value
    downsample_factor = 750
    downsampled_decibels = decibel_levels[::downsample_factor]

    # Calculate decibel measurements per second
    decibel_measurements_per_second = sr / downsample_factor

    # Convert decibel levels to JSON and calculate size
    decibel_json = json.dumps(downsampled_decibels.tolist())
    decibel_data_size = sys.getsizeof(decibel_json)  

    # Store decibel levels in the database
    processed_audio = ProcessAudio(
        audio_id=id,
        decibel_levels=decibel_json  
    )
    db.session.add(processed_audio)
    db.session.commit()

    return jsonify({
        'message': 'Audio processed and decibel levels stored.',
        'decibel_data_size': decibel_data_size,
        'measurements_per_second': decibel_measurements_per_second
    }), 200

@process_audio_routes.route('/decibel_data/<int:id>', methods=['GET'])
def decibel_data(id):
    processed_audio = ProcessAudio.query.filter_by(audio_id=id).first()
    if not processed_audio:
        return jsonify({'error': 'Processed audio data not found.'}), 404
    return jsonify({'decibel_levels': json.loads(processed_audio.decibel_levels)})
