import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import LeftPanel from './LeftPanel';

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
`;

const AuthContainer = () => {
  const [mode, setMode] = useState('login');

  return (
    <div
      className=" flex items-center justify-center bg-[#F5F5F5] "
      style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
    >
      <style>{FONT_IMPORT}</style>

      <div className="flex w-[900px] h-[550px] bg-white rounded-2xl overflow-hidden border border-[#0A0A0A]/10 shadow-lg">
        <LeftPanel />

        <div className="flex-1 p-10 flex flex-col justify-center">
          {mode === 'login' ? (
            <LoginForm
              onSwitchToSignup={() => setMode('signup')}
            />
          ) : (
            <SignupForm
              onSwitchToLogin={() => setMode('login')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthContainer;