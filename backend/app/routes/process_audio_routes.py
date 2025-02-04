import librosa
import numpy as np
import json
from flask import Blueprint, request, jsonify
from io import BytesIO
from ..models.models import db, RawAudio, ProcessAudio
import sys

"""
/process_all_individual_audio
A post route used send wav audio to a decibel data. 
The decibel data can retreived from the audio using librosa.
To avoid large JSONs I chose every 750 decibel samples. 
If the WAV file is 22500 hz then it should be close to 30 light pulses a second.
Its called by the upload individual component

/get_all_processed_audio
It retreives all the processed audio
Since the librosa data is measured in 0-80 decibels 
and the pulse width modulation used to control the lights on the microcontroller takes in values of 0-250,
it is converted from one to the other
"""

process_audio_routes = Blueprint('process_audio', __name__)

@process_audio_routes.route('/decibel_data/<int:id>', methods=['GET'])
def decibel_data(id):
    processed_audio = ProcessAudio.query.filter_by(audio_id=id).first()
    if not processed_audio:
        return jsonify({'error': 'Processed audio data not found.'}), 404
    return jsonify({'decibel_levels': json.loads(processed_audio.decibel_levels)})

@process_audio_routes.route('/process_all_individual_audio', methods=['POST'])
def process_all_individual_audio():
    audios = RawAudio.query.filter_by(is_individual=True).all()

    if not audios:
        return jsonify({'error': 'No individual audio files found.'}), 404

    for audio in audios:
        audio_data, sr = librosa.load(BytesIO(audio.data), sr=None)
        decibel_levels = librosa.amplitude_to_db(np.abs(audio_data), ref=np.max)
        downsample_factor = 750
        downsampled_decibels = decibel_levels[::downsample_factor]

        processed_audio = ProcessAudio(
            audio_id=audio.id,
            decibel_levels=json.dumps(downsampled_decibels.tolist())
        )
        db.session.add(processed_audio)

    db.session.commit()

    return jsonify({'message': 'All individual audios processed successfully.'}), 200


@process_audio_routes.route('/get_all_processed_audio', methods=['POST']) 
def get_all_processed_audio():
    processed_audios = ProcessAudio.query.all()
    if not processed_audios:
        return jsonify({'error': 'No processed audio tracks found.'}), 500

    min_value = -80
    max_value = 0
    all_audio_data = []

    for processed_audio in processed_audios:
        if hasattr(processed_audio, 'decibel_levels') and processed_audio.decibel_levels:
            decibel_levels = json.loads(processed_audio.decibel_levels)
            normalized_levels = [
                int((value - min_value) / (max_value - min_value) * 255) for value in decibel_levels
            ]
        else:
            normalized_levels = []

        audio_data = {
            'audio_id': processed_audio.audio_id,
            'normalized_levels': normalized_levels
        }
        all_audio_data.append(audio_data)

    return jsonify({'processed_audios': all_audio_data}), 200

    




