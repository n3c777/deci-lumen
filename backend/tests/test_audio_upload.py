import io
import wave

def make_sine_wav_bytes(duration_secs=0.1, freq=440, framerate=44100):
    #Returns a short generated wav file with using a monotone 
    buf = io.BytesIO()
    with wave.open(buf, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)              
        w.setframerate(framerate)
        n_frames = int(duration_secs * framerate)
        
        import math, struct
        frames = []
        for i in range(n_frames):
            sample = int(32767.0 * math.sin(2 * math.pi * freq * i / framerate))
            frames.append(struct.pack('<h', sample))
        w.writeframes(b''.join(frames))
    buf.seek(0)
    return buf

def test_upload_generated_wav(client):
    wav_buf = make_sine_wav_bytes()
    data = {
        'file': (wav_buf, 'tone.wav'),
        'is_individual': 'true'
    }
    resp = client.post('/upload_raw_audio',
                       data=data,
                       content_type='multipart/form-data')
    assert resp.status_code == 200
    assert resp.get_json() == {'message': 'File uploaded successfully.'}


def test_upload_invalid_extension(client):
    data = {
        'file': (io.BytesIO(b'data'), 'sound.mp3'),
    }
    resp = client.post('/upload_raw_audio', data=data, content_type='multipart/form-data')
    assert resp.status_code == 400
    assert 'Invalid file format' in resp.get_json()['error']
