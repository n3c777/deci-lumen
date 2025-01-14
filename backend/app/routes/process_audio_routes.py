import librosa
import numpy as np
import json
from flask import Blueprint, request, jsonify
from io import BytesIO
from ..models.models import db, RawAudio, ProcessAudio
import sys

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



