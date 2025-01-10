from app import create_app
from app.routes.raw_audio_routes import raw_audio_routes
from app.routes.process_audio_routes import process_audio_routes

app = create_app()
app.register_blueprint(raw_audio_routes)
app.register_blueprint(process_audio_routes)


if __name__ == '__main__':
    #make sure to use host = "0.0.0.0". and port-5000 This is allows users to view it in the local browser 
    app.run(host="0.0.0.0", port=5000, debug=True)


