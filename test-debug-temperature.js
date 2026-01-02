// Test script to debug temperature parsing
import { parseTemperature } from './src/utils/telemetryTransformers.js';

// Simulate the API response data
const mockApiData = {
  "id": "69574c830829bc4cebd3b817",
  "topic": "862942074957887/pub",
  "imei": "862942074957887",
  "interval": 300,
  "geoid": "10",
  "packet": "N",
  "latitude": "23.301575",
  "longitude": "85.327148",
  "speed": 1.0,
  "battery": "93",
  "signal": "93",
  "alert": null,
  "timestamp": "2026-01-02T10:11:39.403000",
  "deviceTimestamp": "2026-01-02T10:11:39.403000",
  "deviceRawTimestamp": "2026-01-02T04:41:38",
  "rawPacket": "N",
  "rawImei": "862942074957887",
  "rawAlert": null,
  "type": "packet_N",
  "rawTemperature": "22.12 c"
};

console.log('=== Testing Temperature Parsing ===');
console.log('Input rawTemperature:', mockApiData.rawTemperature);
console.log('Type:', typeof mockApiData.rawTemperature);

const result = parseTemperature(mockApiData.rawTemperature);
console.log('Parsed result:', result);
console.log('Expected: 22.12');
console.log('Test passed:', result === 22.12);
