#!/usr/bin/env python3
import sys
import json
import pyaudio
import vosk

def main():
    p = pyaudio.PyAudio()
    
    # Print all devices (just for debug)
    print("=== Listing audio input devices that PyAudio can see ===")
    for i in range(p.get_device_count()):
        info = p.get_device_info_by_index(i)
        print(f"{i}: {info['name']} (channels: {info['maxInputChannels']})")

    # Suppose we found AirPods at index 1
    AIRPODS_INDEX = 1

    MODEL_PATH = "vosk-model-en-us-0.42-gigaspeech"
    RATE = 16000

    print("Loading Vosk model...")
    sys.stdout.flush()
    
    model = vosk.Model(MODEL_PATH)
    recognizer = vosk.KaldiRecognizer(model, RATE)

    print(f"Opening PyAudio stream on device index={AIRPODS_INDEX}")
    sys.stdout.flush()

    stream = p.open(format=pyaudio.paInt16,
                   channels=1,
                   rate=RATE,
                   input=True,
                   frames_per_buffer=8000,
                   input_device_index=AIRPODS_INDEX)

    print("Python: Vosk model loaded. Listening for voice...")
    sys.stdout.flush()

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
