import io
import json
import numpy as np
import soundfile as sf
from app.models.models import RawAudio, ProcessAudio, db

def test_process_all_individual_audio(client, app):
    sr = 22050
    duration = 1  # 1 second
    tone = np.sin(2 * np.pi * 440 * np.linspace(0, duration, int(sr * duration)))
    buffer = io.BytesIO()
    sf.write(buffer, tone, sr, format='WAV')
    buffer.seek(0)

    with app.app_context():
        raw_audio = RawAudio(filename='test.wav', data=buffer.read(), is_individual=True)
        db.session.add(raw_audio)
        db.session.commit()
        audio_id = raw_audio.id

    resp = client.post('/process_all_individual_audio')
    assert resp.status_code == 200
    assert resp.get_json()['message'] == 'All individual audios processed successfully.'

    with app.app_context():
        processed = ProcessAudio.query.filter_by(audio_id=audio_id).first()
        assert processed is not None
        levels = json.loads(processed.decibel_levels)
        assert isinstance(levels, list)
        assert len(levels) > 0
