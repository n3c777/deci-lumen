from flask import Blueprint, request, jsonify, send_file
from werkzeug.utils import secure_filename
from io import BytesIO
from ..models.models import db, RawAudio

"""
/upload_raw_audio
allows you to upload raw audio in wav format. 
It checks wether the audio is individual or collecitive. 
This prevents having to store raw audio in two seperate databases and instead adds one more column

/raw_audio_list
retreives either all collective or all individual audio ids.

/raw_audio/<int:id>
using the retreived audio ids gets all audio files 

/get_all_raw_audio
this is specifcially for the audio visual page. It gets all collective tracks used for playback.

/delete_raw_audio/<int:id>
deletes audio indivdiually. used for collective and individual upload audio components

/delete_all_raw_audio
deletes all raw audio (and though casading all processed audio). Used by the audio-visual page for reseting everything.
"""


raw_audio_routes = Blueprint('raw_audio', __name__)

@raw_audio_routes.route('/upload_raw_audio', methods=['POST'])
def upload_audio():
    file = request.files['file']
    is_individual = request.form.get('is_individual', 'false').lower() == 'true'

    if not file or not file.filename.endswith('.wav'):
        return jsonify({'error': 'Invalid file format. Please upload a .wav file.'}), 400

    filename = secure_filename(file.filename)
    audio = RawAudio(filename=filename, data=file.read(), is_individual=is_individual)
    db.session.add(audio)
    db.session.commit()

    return jsonify({'message': 'File uploaded successfully.'}), 200



@raw_audio_routes.route('/raw_audio_list', methods=['GET'])
def list_audios():
    is_individual = request.args.get('is_individual', None)
    if is_individual is not None:
        is_individual = is_individual.lower() == 'true'
        audios = RawAudio.query.filter_by(is_individual=is_individual).all()
    else:
        audios = RawAudio.query.all()
    return jsonify([{'id': audio.id, 'filename': audio.filename, 'is_individual': audio.is_individual} for audio in audios])


@raw_audio_routes.route('/raw_audio/<int:id>', methods=['GET'])
def get_audio(id):
    audio = RawAudio.query.get(id)  
    if not audio:
        return jsonify({'error': 'Audio file not found.'}), 404
    return send_file(BytesIO(audio.data), download_name=audio.filename, as_attachment=False, mimetype='audio/wav')

@raw_audio_routes.route('/get_all_raw_audio', methods=['GET'])
def get_all_audio():
    is_individual = request.args.get('is_individual', None)
    if is_individual is not None:
        is_individual = is_individual.lower() == 'true'
        audio = RawAudio.query.filter_by(is_individual=is_individual).first()
    else:
        audio = RawAudio.query.first()
    if not audio:
        return {"error": "No audio files found"}, 404
    return send_file(BytesIO(audio.data), download_name=audio.filename,as_attachment=False,mimetype='audio/wav')

@raw_audio_routes.route('/delete_raw_audio/<int:id>', methods=['DELETE'])
def delete_audio(id):
    audio = RawAudio.query.get(id)  
    if not audio:
        return jsonify({'error': 'Audio file not found.'}), 404

    db.session.delete(audio)
    db.session.commit()

    return jsonify({'message': 'File deleted successfully.'}), 200


@raw_audio_routes.route('/delete_all_raw_audio', methods=['DELETE'])
def delete_all_audio():
    audios = RawAudio.query.all()
    if not audios:
        return jsonify({'error': 'No audio files found.'}), 404

    for audio in audios:
        db.session.delete(audio)

    db.session.commit()

    return jsonify({'message': 'All audio files deleted successfully.'}), 200



