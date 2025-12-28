import { validateEmail, createEmailValidationRules } from './src/utils/validation.js';

console.log('Testing email validation:');
console.log('a@b.cc:', validateEmail('a@b.cc'));
console.log('test@example.com:', validateEmail('test@example.com'));
console.log('empty string:', validateEmail(''));
console.log('whitespace:', validateEmail('   '));

console.log('\nTesting email rules:');
const emailRules = createEmailValidationRules();
console.log('Email rules:', emailRules.map(rule => ({ message: rule.message, type: rule.type })));

// Test the rules directly
console.log('\nTesting rules against a@b.cc:');
emailRules.forEach((rule, index) => {
  const result = rule.test('a@b.cc');
  console.log(`Rule ${index} (${rule.message}): ${result}`);
});

console.log('\nTesting rules against empty string:');
emailRules.forEach((rule, index) => {
  const result = rule.test('');
  console.log(`Rule ${index} (${rule.message}): ${result}`);
});