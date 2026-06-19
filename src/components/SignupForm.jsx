import React, { useState } from 'react';
import {
  ArrowRight,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Field from './Field';

const SignupForm = ({ onSwitchToLogin }) => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: '',
  });

  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: '',
    };

    let isValid = true;

    if (!name.trim()) {
      newErrors.name = 'Please enter your full name.';
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = 'Please enter your email address.';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
      isValid = false;
    }

    if (!password.trim()) {
      newErrors.password = 'Please enter a password.';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password =
        'Password must contain at least 6 characters.';
      isValid = false;
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword =
        'Please confirm your password.';
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword =
        'Passwords do not match.';
      isValid = false;
    }

    if (!acceptTerms) {
      newErrors.terms =
        'Please accept the Terms & Conditions.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      toast.error('Please fix the highlighted errors.');
      return;
    }

    try {
      setLoading(true);

      // =====================
      // SIGNUP API CALL HERE
      // =====================
      //
      // const response = await axios.post(
      //   'http://localhost:5000/api/signup',
      //   {
      //     name,
      //     email,
      //     password,
      //   }
      // );

      await new Promise((resolve) =>
        setTimeout(resolve, 1800)
      );

      toast.success(
        'Account created successfully 🎉',
        {
          duration: 3000,
          style: {
            background: '#0A0A0A',
            color: '#FFFFFF',
            borderRadius: '14px',
            padding: '14px 18px',
          },
        }
      );

      setTimeout(() => {
        navigate('/home');
      }, 1200);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          'Unable to create account.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSignup();
        }}
      >
        <p className="text-xs uppercase tracking-[0.2em] text-[#0A0A0A]/40 mb-2">
          Get Started
        </p>

        <h1 className="text-3xl font-semibold text-[#0A0A0A] mb-8">
          Create Account
        </h1>

        <div className="space-y-4">
          <div>
            <Field
              icon={User}
              placeholder="Full name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({
                  ...prev,
                  name: '',
                }));
              }}
            />

            {errors.name && (
              <p className="mt-1 text-xs text-red-500">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <Field
              icon={Mail}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({
                  ...prev,
                  email: '',
                }));
              }}
            />

            {errors.email && (
              <p className="mt-1 text-xs text-red-500">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <Field
              icon={Lock}
              type={showPw ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({
                  ...prev,
                  password: '',
                }));
              }}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
            />

            {errors.password && (
              <p className="mt-1 text-xs text-red-500">
                {errors.password}
              </p>
            )}
          </div>

          <div>
            <Field
              icon={Lock}
              type={
                showConfirmPw
                  ? 'text'
                  : 'password'
              }
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(
                  e.target.value
                );
                setErrors((prev) => ({
                  ...prev,
                  confirmPassword: '',
                }));
              }}
              rightSlot={
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPw(
                      !showConfirmPw
                    )
                  }
                >
                  {showConfirmPw ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
            />

            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className="flex items-start gap-2 text-sm text-[#0A0A0A]/70">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) =>
                setAcceptTerms(
                  e.target.checked
                )
              }
            />

            <span>
              I agree to the Terms &
              Conditions and Privacy
              Policy.
            </span>
          </label>

          {errors.terms && (
            <p className="mt-1 text-xs text-red-500">
              {errors.terms}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full mt-6 font-medium px-6 py-3 rounded-md text-white transition-all duration-200 flex items-center justify-center gap-2 ${
            loading
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-[#0A0A0A] hover:bg-[#262626]'
          }`}
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Creating account...
            </>
          ) : (
            <>
              Create Account
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-center text-sm text-[#0A0A0A]/55 mt-8">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-medium text-[#0A0A0A] underline underline-offset-4 hover:opacity-70"
          >
            Log in
          </button>
        </p>
      </form>
    </div>
  );
};

export default SignupForm;

