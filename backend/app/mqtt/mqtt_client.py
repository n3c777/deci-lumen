import paho.mqtt.client as mqtt
import json

class MQTTClient:
    def __init__(self, broker_url, broker_port, topic):
        self.client = mqtt.Client()
        self.broker_url = broker_url
        self.broker_port = broker_port
        self.topic = topic
        self.message_callback = None  

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print("Connected successfully to MQTT broker")
            self.client.subscribe(self.topic)
        else:
            print(f"Connection failed with code {rc}")

    def on_message(self, client, userdata, msg):
        if self.message_callback:
            self.message_callback(msg.topic, msg.payload.decode())

    def connect(self):
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        self.client.connect(self.broker_url, self.broker_port)
        self.client.loop_start()

    def publish(self, message):
        if isinstance(message, dict):
            message = json.dumps(message)

        self.client.publish(self.topic, message, retain=True)

    def set_message_callback(self, callback):
        self.message_callback = callback
