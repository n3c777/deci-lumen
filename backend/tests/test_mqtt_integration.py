import json
import time
import pytest
import paho.mqtt.client as mqtt

BROKER = "localhost"
PORT = 1883
TOPIC = "test/integration"
PAYLOAD = {"message": "Test_Data"}
TIMEOUT = 5  # seconds

received_payload = {}

@pytest.fixture(scope="module")
def mqtt_client():
    client = mqtt.Client()
    client.connect(BROKER, PORT, 60)
    yield client
    client.disconnect()

def on_message(client, userdata, msg):
    received_payload["data"] = json.loads(msg.payload.decode())

def test_mqtt_send_and_receive(mqtt_client):
    received_payload.clear()

    mqtt_client.on_message = on_message
    mqtt_client.loop_start()
    mqtt_client.subscribe(TOPIC)

    time.sleep(1)  # wait for subscription setup

    mqtt_client.publish(TOPIC, json.dumps(PAYLOAD))

    timeout = time.time() + TIMEOUT
    while "data" not in received_payload and time.time() < timeout:
        time.sleep(0.1)

    mqtt_client.loop_stop()

    assert received_payload.get("data") == PAYLOAD