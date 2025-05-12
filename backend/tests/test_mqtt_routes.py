# tests/test_mqtt_routes.py
import json
import pytest

from app import create_app
from app.models.models import db, ProcessAudio
from app.routes.mqtt_routes import mqtt_routes

class DummyMQTTClient:
    def __init__(self):
        self.published = []

    def publish(self, message):
        # record whatever got published
        try:
            # JSON messages
            self.published.append(json.loads(message))
        except (TypeError, json.JSONDecodeError):
            # raw strings
            self.published.append(message)


@pytest.fixture
def app():
    # create your Flask app in testing mode
    app = create_app()
    # override configurations
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'

    # register only the mqtt blueprint using our dummy client
    dummy = DummyMQTTClient()
    app.register_blueprint(mqtt_routes(dummy), url_prefix='/mqtt')
    app.dummy_mqtt = dummy

    # set up our in-memory tables
    with app.app_context():
        db.create_all()
        # seed a ProcessAudio row with known levels
        pa = ProcessAudio(audio_id=123, decibel_levels=json.dumps([-80, -40, 0]))
        db.session.add(pa)
        db.session.commit()

    yield app

    # teardown database
    with app.app_context():
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


def test_publish_endpoint(client, app):
    # hit your route
    resp = client.post('/mqtt/publish')
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['message'] == 'All processed audio tracks published successfully'

    # check dummy MQTT client saw at least one publish
    published = app.dummy_mqtt.published
    assert len(published) >= 1

    # first one should be a dict with audio_id 123 and levels scaled to [0,127,255]
    msg0 = published[0]
    assert isinstance(msg0, dict)
    assert msg0['audio_id'] == 123
    assert msg0['normalized_levels'] == [0, 127, 255]

