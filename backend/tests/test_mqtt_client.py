import json
import pytest
from paho.mqtt.client import MQTTMessage
from app.mqtt.mqtt_client import MQTTClient

class FakePahoClient:
    def __init__(self):
        self.on_connect = None
        self.on_message = None
        self._published = []

    def connect(self, url, port):
        # simulate immediate successful connection
        if self.on_connect:
            self.on_connect(self, None, None, 0)

    def loop_start(self):
        pass

    def subscribe(self, topic):
        self.subscribed_topic = topic

    def publish(self, topic, payload, retain):
        self._published.append((topic, payload, retain))

@pytest.fixture
def mqtt_client(monkeypatch):
    fake = FakePahoClient()
    monkeypatch.setattr('app.mqtt.mqtt_client.mqtt.Client', lambda: fake)

    client = MQTTClient(broker_url='test://', broker_port=1234, topic='test/topic')
    client.connect()  
    return client, fake

def test_subscribe_on_connect(mqtt_client):
    client, fake = mqtt_client
    # after connect() fake should have recorded a subscribe
    assert fake.subscribed_topic == 'test/topic'

def test_publish_encodes_dict_and_retain_flag(mqtt_client):
    client, fake = mqtt_client
    client.publish({'foo': 'bar'})
    # check exactly one publish call
    assert len(fake._published) == 1
    topic, payload, retain = fake._published[0]
    assert topic == 'test/topic'
    assert json.loads(payload) == {'foo': 'bar'}
    assert retain is True

def test_message_callback_is_called(mqtt_client):
    client, fake = mqtt_client
    received = []
    client.set_message_callback(lambda t, p: received.append((t, p)))

    # craft fake incoming MQTTMessage
    msg = MQTTMessage(topic=b'test/topic')
    msg.payload = b'hello'
    # simulate broker delivering message
    fake.on_message(fake, None, msg)
    assert received == [('test/topic', 'hello')]
