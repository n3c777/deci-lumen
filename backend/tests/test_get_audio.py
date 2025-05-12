import io
from app.models.models import db, RawAudio


def test_get_audio_not_found(client):
    resp = client.get('/raw_audio/999')
    assert resp.status_code == 404

def test_get_and_get_all_audio(client, app):
    with app.app_context():
        audio = RawAudio(filename='c.wav', data=b'1234', is_individual=False)
        db.session.add(audio)
        db.session.commit()
        audio_id = audio.id

    # Single fetch
    resp = client.get(f'/raw_audio/{audio_id}')
    assert resp.status_code == 200
    assert resp.data == b'1234'
    assert resp.mimetype == 'audio/wav'

    # get_all fetch
    resp2 = client.get('/get_all_raw_audio')
    assert resp2.status_code == 200
    assert resp2.data == b'1234'
