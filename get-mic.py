#!/usr/bin/env python3
import pyaudio

p = pyaudio.PyAudio()

print("=== PyAudio Devices ===")
for i in range(p.get_device_count()):
    info = p.get_device_info_by_index(i)
    print(f"Device index {i}: {info['name']} (maxInputChannels={info['maxInputChannels']})")
