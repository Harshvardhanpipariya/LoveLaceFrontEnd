import React, { useState } from 'react';
import { ArrowRight, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Field from './Field';

const SignupForm = ({ onSwitchToLogin }) => {
  const navigate = useNavigate();

  const [name,            setName]            = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw,          setShowPw]          = useState(false);
  const [showConfirmPw,   setShowConfirmPw]   = useState(false);
  const [acceptTerms,     setAcceptTerms]     = useState(false);
  const [loading,         setLoading]         = useState(false);

  const [errors, setErrors] = useState({
    name: '', email: '', password: '', confirmPassword: '', terms: '',
  });

  const clearError = (key) => setErrors((p) => ({ ...p, [key]: '' }));

  const validateForm = () => {
    const e = { name: '', email: '', password: '', confirmPassword: '', terms: '' };
    let ok = true;
    if (!name.trim())                      { e.name = 'Please enter your full name.';                ok = false; }
    if (!email.trim())                     { e.email = 'Please enter your email address.';           ok = false; }
    else if (!/\S+@\S+\.\S+/.test(email)) { e.email = 'Please enter a valid email address.';        ok = false; }
    if (!password.trim())                  { e.password = 'Please enter a password.';               ok = false; }
    else if (password.length < 6)          { e.password = 'Password must be at least 6 characters.'; ok = false; }
    if (!confirmPassword.trim())           { e.confirmPassword = 'Please confirm your password.';   ok = false; }
    else if (password !== confirmPassword) { e.confirmPassword = 'Passwords do not match.';         ok = false; }
    if (!acceptTerms)                      { e.terms = 'Please accept the Terms & Conditions.';     ok = false; }
    setErrors(e);
    return ok;
  };

  const handleSignup = async () => {
    if (!validateForm()) { toast.error('Please fix the highlighted errors.'); return; }
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1800));
      toast.success('Account created successfully 🎉', {
        duration: 3000,
        style: { background: '#0A0A0A', color: '#FFFFFF', borderRadius: '14px', padding: '14px 18px' },
      });
      setTimeout(() => navigate('/home'), 1200);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  const errStyle = { fontFamily: "'JetBrains Mono', monospace" };

  return (
    /* No overflow-y-auto — container grows instead. py-6 keeps breathing room tight. */
    <div className="w-full flex items-center justify-center py-6 px-4">
      <form
        onSubmit={(e) => { e.preventDefault(); handleSignup(); }}
        className="w-full max-w-sm"
        noValidate
      >
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#0A0A0A]/40 mb-1" style={errStyle}>
          Get Started
        </p>

        <h1 className="text-2xl font-semibold text-[#0A0A0A] mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Create Account
        </h1>

        {/* space-y-0: gaps are handled by the min-h error rows only, no extra space */}
        <div className="space-y-0">

          <div>
            <Field icon={User} placeholder="Full name" value={name}
              onChange={(e) => { setName(e.target.value); clearError('name'); }} />
            <p className="text-[11px] text-red-500 min-h-[15px] mt-0.5 leading-none" style={errStyle}>{errors.name}</p>
          </div>

          <div>
            <Field icon={Mail} type="email" placeholder="Email address" value={email}
              onChange={(e) => { setEmail(e.target.value); clearError('email'); }} />
            <p className="text-[11px] text-red-500 min-h-[15px] mt-0.5 leading-none" style={errStyle}>{errors.email}</p>
          </div>

          <div>
            <Field icon={Lock} type={showPw ? 'text' : 'password'} placeholder="Password" value={password}
              onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
              rightSlot={
                <button type="button" onClick={() => setShowPw(!showPw)} className="text-[#0A0A0A]/40 hover:text-[#0A0A0A]">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              } />
            <p className="text-[11px] text-red-500 min-h-[15px] mt-0.5 leading-none" style={errStyle}>{errors.password}</p>
          </div>

          <div>
            <Field icon={Lock} type={showConfirmPw ? 'text' : 'password'} placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); clearError('confirmPassword'); }}
              rightSlot={
                <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="text-[#0A0A0A]/40 hover:text-[#0A0A0A]">
                  {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              } />
            <p className="text-[11px] text-red-500 min-h-[15px] mt-0.5 leading-none" style={errStyle}>{errors.confirmPassword}</p>
          </div>

        </div>

        {/* Terms — mt-1 keeps it snug after the last error row */}
        <div className="mt-1">
          <label className="flex items-start gap-2 text-xs text-[#0A0A0A]/65 cursor-pointer select-none"
                 style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <input type="checkbox" checked={acceptTerms}
              onChange={(e) => { setAcceptTerms(e.target.checked); clearError('terms'); }}
              className="accent-[#0A0A0A] mt-0.5 w-3 h-3 shrink-0" />
            <span>I agree to the Terms &amp; Conditions and Privacy Policy.</span>
          </label>
          <p className="text-[11px] text-red-500 min-h-[15px] mt-0.5 leading-none" style={errStyle}>{errors.terms}</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-3 font-medium px-6 py-2.5 rounded-md text-white flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed text-sm"
          style={{ fontFamily: "'Space Grotesk', sans-serif", background: loading ? '#6b7280' : '#0A0A0A' }}
        >
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account…</>
          ) : (
            <>Create Account <ArrowRight className="w-4 h-4" /></>
          )}
        </button>

        <p className="text-center text-sm text-[#0A0A0A]/55 mt-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Already have an account?{' '}
          <button type="button" onClick={onSwitchToLogin}
            className="font-medium text-[#0A0A0A] underline underline-offset-4 hover:opacity-70 transition-opacity">
            Log in
          </button>
        </p>
      </form>
    </div>
  );
};

export default SignupForm;
