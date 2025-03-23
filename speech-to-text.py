import socketio
import vosk
import json
import pyaudio

# Connect to MagicMirror (on localhost)
sio = socketio.Client()
sio.connect('http://localhost:8080')  # MagicMirror port

# Load Vosk model
model = vosk.Model("/path/to/vosk-model-small-en-us-0.15")

recognizer = vosk.KaldiRecognizer(model, 16000)
audio = pyaudio.PyAudio()
stream = audio.open(format=pyaudio.paInt16, channels=1, rate=16000, input=True, frames_per_buffer=8000)

print("Listening for speech...")

def send_to_magic_mirror(text):
    print(f"Sending to MagicMirror: {text}")
    sio.emit('speech_to_text', text)  # Emit event to MagicMirror

try:
    while True:
        data = stream.read(4000, exception_on_overflow=False)
        if recognizer.AcceptWaveform(data):
            result = json.loads(recognizer.Result())["text"]
            if result.strip():
                send_to_magic_mirror(result)

except KeyboardInterrupt:
    print("Stopping...")
finally:
    stream.stop_stream()
    stream.close()
    audio.terminate()
    sio.disconnect()
