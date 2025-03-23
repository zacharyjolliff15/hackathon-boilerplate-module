#!/usr/bin/env python3
import sys
import json
import pyaudio
import vosk

def main():
    model = vosk.Model("vosk-model-en-us-0.42-gigaspeech")
    recognizer = vosk.KaldiRecognizer(model, 16000)
    p = pyaudio.PyAudio()

    stream = p.open(format=pyaudio.paInt16,
                    channels=1,
                    rate=16000,
                    input=True,
                    frames_per_buffer=8000)

    print("Python: Vosk model loaded. Listening for voice...")
    sys.stdout.flush()  # Make sure this prints immediately

    while True:
        data = stream.read(16000, exception_on_overflow=False)

        if recognizer.AcceptWaveform(data):
            result = recognizer.Result()
            recognized_text = json.loads(result).get("text", "")

            if recognized_text.strip():
                print(recognized_text.strip())
                sys.stdout.flush()

if __name__ == "__main__":
    main()
