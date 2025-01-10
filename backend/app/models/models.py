from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class RawAudio(db.Model):
    __tablename__ = 'raw_audio'
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(256), nullable=False)
    is_individual = db.Column(db.Boolean, nullable=False, default=True)
    data = db.Column(db.LargeBinary, nullable=False)
    process_audios = db.relationship(
        'ProcessAudio',
        back_populates='raw_audio',
        cascade='all, delete-orphan'
    )

class ProcessAudio(db.Model):
    __tablename__ = 'process_audio'
    id = db.Column(db.Integer, primary_key=True)
    audio_id = db.Column(db.Integer, db.ForeignKey('raw_audio.id', ondelete='CASCADE'), nullable=False)
    decibel_levels = db.Column(db.Text, nullable=False)
    raw_audio = db.relationship('RawAudio', back_populates='process_audios')
