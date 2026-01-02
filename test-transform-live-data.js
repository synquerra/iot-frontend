import { transformLiveData } from './src/utils/telemetryTransformers.js';

// Test with string temperature value (the actual bug scenario)
const testData = [{
  imei: 'TEST123',
  latitude: 40.7128,
  longitude: -74.0060,
  speed: 50,
  rawTemperature: '34.14 c',
  battery: 85,
  deviceTimestamp: '2024-01-01T12:00:00.000Z'
}];

const result = transformLiveData(testData);
console.log('Input rawTemperature:', testData[0].rawTemperature);
console.log('Output temperature:', result.temperature);
console.log('Expected: 34.14');
console.log('Test passed:', result.temperature === 34.14);
