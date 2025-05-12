import io
from app.models.models import db, RawAudio

def test_list(client, app):
   
    with app.app_context():
        db.session.add_all([
            RawAudio(filename='a.wav', data=b'1', is_individual=True),
            RawAudio(filename='b.wav', data=b'2', is_individual=True)
        ])
        db.session.commit()

    resp = client.get('/raw_audio_list?is_individual=true')
    assert resp.status_code == 200
    assert len(resp.get_json()) == 2
    assert resp.get_json()[0]['filename'] == 'a.wav'
    assert resp.get_json()[1]['filename'] == 'b.wav'

def test_list_all_empty(client):
    resp = client.get('/raw_audio_list')
    assert resp.status_code == 200
    assert resp.get_json() == []

def test_list_filtered(client, app):
   
    with app.app_context():
        db.session.add_all([
            RawAudio(filename='a.wav', data=b'1', is_individual=True),
            RawAudio(filename='b.wav', data=b'2', is_individual=False)
        ])
        db.session.commit()

    resp = client.get('/raw_audio_list?is_individual=true')
    assert resp.status_code == 200
    assert len(resp.get_json()) == 1
    assert resp.get_json()[0]['filename'] == 'a.wav'
