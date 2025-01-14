from app import create_app 
from app.routes.raw_audio_routes import raw_audio_routes
from app.routes.process_audio_routes import process_audio_routes
from app.routes.mqtt_routes import mqtt_routes
from app.mqtt.mqtt_client import MQTTClient

app = create_app()
app.register_blueprint(raw_audio_routes)
app.register_blueprint(process_audio_routes)


mqtt_client = MQTTClient("broker.hivemq.com", 8000, "test/counter")


app.register_blueprint(mqtt_routes(mqtt_client))


print([rule.rule for rule in app.url_map.iter_rules()])

if __name__ == '__main__':
    mqtt_client.connect()
    app.run(host="0.0.0.0", port=5000, debug=True)
