import React, { useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import LeftPanel from "./LeftPanel";

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
`;

const AuthContainer = () => {
  const [mode, setMode] = useState("login");

  return (
    <div
      className="h-[85vh] bg-[#F5F5F5] flex items-center justify-center p-0 md:p-4"
      style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
    >
      <style>{FONT_IMPORT}</style>

      <div
        className="
    w-full
    lg:min-h-0
    lg:w-[904px]
    lg:h-[550px]
    bg-white
    lg:rounded-2xl
    overflow-hidden
    border border-[#0A0A0A]/10
    shadow-lg
    flex
  "
      >
        {/* Desktop only */}
        <div className="hidden lg:block w-[380px] h-full flex-shrink-0">
          <LeftPanel />
        </div>

        {/* Form Section */}
        <div className="flex-1 flex flex-col justify-center px-5 py-8 md:p-10">
          {mode === "login" ? (
            <LoginForm
              onSwitchToSignup={() => setMode("signup")}
            />
          ) : (
            <SignupForm
              onSwitchToLogin={() => setMode("login")}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthContainer;