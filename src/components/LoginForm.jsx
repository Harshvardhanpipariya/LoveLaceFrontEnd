import React, { useState } from "react";
import { ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import Field from "./Field";

const LoginForm = ({ onSwitchToSignup }) => {
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [showPw,     setShowPw]     = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [errors,     setErrors]     = useState({ email: "", password: "" });

  const validateForm = () => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = "Please enter your email";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Enter a valid email";
      isValid = false;
    }

    if (!password.trim()) {
      newErrors.password = "Please enter your password";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) { toast.error("Please fix the errors"); return; }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, user, message } = response.data;

      if (!token) throw new Error("Token not received from server");

      localStorage.removeItem("token");   localStorage.removeItem("user");
      sessionStorage.removeItem("token"); sessionStorage.removeItem("user");

      if (rememberMe) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(user));
      }

      toast.success(message || "Login successful");
      setTimeout(() => navigate("/dashboard", { replace: true }), 500);
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    /*
     * overflow-y-auto: if errors push content past the panel height, it scrolls
     * instead of overflowing visibly. py-8 gives breathing room top/bottom.
     */
    <div className="w-full h-full overflow-y-auto flex items-center justify-center py-8 px-2">
      <form
        onSubmit={(e) => { e.preventDefault(); handleLogin(); }}
        className="w-full max-w-sm"
        noValidate
      >
        <p
          className="text-xs uppercase tracking-[0.2em] text-[#0A0A0A]/40 mb-1"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          Welcome Back
        </p>

        {/* Tighter mb so errors don't push the button off-screen */}
        <h1
          className="text-3xl font-semibold text-[#0A0A0A] mb-6"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Log In
        </h1>

        <div className="space-y-1">
          {/* Email */}
          <div>
            <Field
              icon={Mail}
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((p) => ({ ...p, email: "" }));
              }}
            />
            {/* Reserve a fixed line height so the layout doesn't jump when error appears */}
            <p
              className="text-red-500 text-xs mt-1 min-h-[16px]"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {errors.email}
            </p>
          </div>

          {/* Password */}
          <div>
            <Field
              icon={Lock}
              type={showPw ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((p) => ({ ...p, password: "" }));
              }}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="text-[#0A0A0A]/40 hover:text-black"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
            <p
              className="text-red-500 text-xs mt-1 min-h-[16px]"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {errors.password}
            </p>
          </div>
        </div>

        {/* Remember me + forgot */}
        <div className="flex items-center justify-between mt-2">
          <label
            className="flex items-center gap-2 text-sm text-[#0A0A0A]/60 cursor-pointer select-none"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="accent-[#0A0A0A] w-3.5 h-3.5"
            />
            Remember me
          </label>
          <button
            type="button"
            className="text-xs text-[#0A0A0A]/45 hover:text-[#0A0A0A] transition-colors"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Forgot password?
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-5 px-6 py-3 rounded-md text-white font-medium flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            background: loading ? "#6b7280" : "#0A0A0A",
          }}
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Logging in…
            </>
          ) : (
            <>Log In <ArrowRight className="w-4 h-4" /></>
          )}
        </button>

        <p
          className="text-center text-sm text-[#0A0A0A]/55 mt-6"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          New here?{" "}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="font-medium text-[#0A0A0A] underline underline-offset-4 hover:opacity-70 transition-opacity"
          >
            Create an account
          </button>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;
