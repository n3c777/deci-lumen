import paho.mqtt.client as mqtt
import json

class MQTTClient:
    def __init__(self, broker_url, broker_port, topic):
        self.client = mqtt.Client(transport="websockets")
        self.broker_url = broker_url
        self.broker_port = broker_port
        self.topic = topic

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print("Connected successfully")
            # Subscribe to the topic upon connection
            self.client.subscribe(self.topic)
        else:
            print(f"Connection failed with code {rc}")

    def on_message(self, client, userdata, msg):
        # Print out the received message's payload
        print(f"Message received on topic {msg.topic}: {msg.payload.decode()}")
        try:
            payload_data = json.loads(msg.payload.decode())  # If it's a JSON payload
            print(f"Decoded message data: {payload_data}")
        except json.JSONDecodeError:
            print(f"Error decoding JSON from message payload")

    def connect(self):
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        self.client.connect(self.broker_url, self.broker_port)
        self.client.loop_start()

    def publish(self, message):
        # Ensure message is a string if it's a dictionary
        if isinstance(message, dict):
            message = json.dumps(message)
        self.client.publish(self.topic, message)

