from flask import Flask
from flask_cors import CORS
from .models.models import db
from .routes.raw_audio_routes import raw_audio_routes           
from .routes.process_audio_routes import process_audio_routes


def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///local_database.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    app.register_blueprint(raw_audio_routes)       
    app.register_blueprint(process_audio_routes) 
    with app.app_context():
        db.create_all()
    return app


