# Decilumen

Decilumen is an application that syncronizes audio and lights together. Combines together multiple technologies, including React, Python and C++, all running in a docker container and an esp32.

## File Structure

```
Decilumen (root)
├── docker-compose.yml
├── backend
│   ├── app
│   │   ├── __init__.py
│   │   ├── models
│   │   │   ├── __init__.py
│   │   │   └── models.py
│   │   ├── routes
│   │   │   ├── __init__.py
│   │   │   ├── raw_audio_routes.py
│   │   │   └── process_audio_routes.py
│   │   └── local_database.db
│   ├── requirements.txt
│   └── run.py
├── embedded
│   └── embedded.ino
└── frontend
    └──src
       ├── components
       │   ├── AudioList.js
       │   ├── BlueTooth.js
       │   ├── DelayAudio.js
       │   └── UploadAudio.js
       ├── pages
       │   ├── AudioVisuals.js
       │   ├── UploadCollective.js
       │   ├── UploadIndividual.js
       │   └── Welcome.js
       ├── styles
       └── app.js
```

## Setup Guide

This project was developed using **VS Code** and **Arduino IDE**.  
Ensure that **Python** and **Node** are installed before proceeding.

## Installing Flask

To install Flask, you must first create a virtual environment.  
Run the following commands before using `pip`:

```sh
python -m venv .venv
.venv\Scripts\activate  # On Windows
source .venv/bin/activate  # On macOS/Linux
```

Then, install all required Flask-related dependencies:

```sh
pip install Flask Werkzeug SQLAlchemy Flask-SQLAlchemy Flask-Cors psycopg2-binary python-dotenv Flask-Migrate librosa paho-mqtt
```

### Debugging Flask

To run Flask in debug mode:

```sh
python -m flask run --debugger
```

To view available routes:

```sh
flask routes
```

## Installing React

To install dependencies, run:

```sh
npm install
```

If you encounter an unknown error, try installing `web-vitals` manually:

```sh
npm install web-vitals
```

## Embedded Systems

Ensure you are using an **ESP32**; otherwise, `embedded.ino` will need modifications to support other microcontrollers.
