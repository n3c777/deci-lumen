from app.models.models import ProcessAudio, db
import json


def test_decibel_data(client, app):
    with app.app_context():
        processed = ProcessAudio(audio_id=1, decibel_levels=json.dumps([-40, -30, -20]))
        db.session.add(processed)
        db.session.commit()

    resp = client.get('/decibel_data/1')
    assert resp.status_code == 200
    assert resp.get_json()['decibel_levels'] == [-40, -30, -20]