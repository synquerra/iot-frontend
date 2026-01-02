import { parseTemperature } from './src/utils/telemetryTransformers.js';

// Test cases
console.log('Testing parseTemperature function:');
console.log('"34.14 c" =>', parseTemperature('34.14 c'));
console.log('"34.14" =>', parseTemperature('34.14'));
console.log('34.14 =>', parseTemperature(34.14));
console.log('"-5.2 c" =>', parseTemperature('-5.2 c'));
console.log('null =>', parseTemperature(null));
console.log('undefined =>', parseTemperature(undefined));
console.log('"" =>', parseTemperature(''));
console.log('"invalid" =>', parseTemperature('invalid'));
console.log('"25.5°C" =>', parseTemperature('25.5°C'));
console.log('"30 C" =>', parseTemperature('30 C'));
