import React, { useState } from 'react';
import PasswordInput from './PasswordInput';

// Simple debug component to test PasswordInput
const PasswordInputDebug = () => {
  const [password, setPassword] = useState('');

  return (
    <div className="p-4">
      <h2>PasswordInput Debug</h2>
      <PasswordInput
        label="Test Password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="mt-4">
        <p>Current password: "{password}"</p>
        <p>Password length: {password.length}</p>
      </div>
    </div>
  );
};

export default PasswordInputDebug;