from app.models.models import db, RawAudio

def test_delete_nonexistent(client):
    resp = client.delete('/delete_raw_audio/1')
    assert resp.status_code == 404

def test_delete_and_delete_all(client, app):
    with app.app_context():
        db.session.add_all([
            RawAudio(filename='d.wav', data=b'a', is_individual=True),
            RawAudio(filename='e.wav', data=b'b', is_individual=False)
        ])
        db.session.commit()
    # Delete one
    resp = client.delete('/delete_raw_audio/1')
    assert resp.status_code == 200

    # Delete all
    resp2 = client.delete('/delete_all_raw_audio')
    assert resp2.status_code == 200
