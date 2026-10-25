import React, { useState } from 'react';
import { Leaf, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onNavigate: (page: string) => void;
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onLoginSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address format.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(trimmedEmail, password);
      onLoginSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="sustainiq-login-layout"
      style={{
        minHeight: '100vh',
        display: 'flex',
        backgroundImage: "linear-gradient(rgba(245, 250, 246, 0.28), rgba(245, 250, 246, 0.28)), url('https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=2200&q=90')",
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .sustainiq-login-layout {
            flex-direction: column;
            overflow: visible;
          }
          .sustainiq-login-visual {
            flex: none !important;
            min-height: 220px !important;
            padding: 28px 20px !important;
          }
          .sustainiq-login-form-side {
            min-height: auto !important;
            padding: 20px 16px 32px !important;
          }
          .sustainiq-login-content {
            padding: 24px !important;
          }
        }
        @media (max-width: 420px) {
          .sustainiq-login-content {
            padding: 20px 16px !important;
          }
        }
      `}</style>

      <div
        className="sustainiq-login-visual"
        style={{
          flex: '1 1 50%',
          minHeight: '100vh',
          padding: '64px',
          display: 'flex',
          alignItems: 'center',
          background: 'transparent',
          color: '#173B2D',
        }}
      >
        <div style={{ maxWidth: '520px', padding: '32px', borderRadius: '18px', background: 'rgba(255, 255, 255, 0.72)', backdropFilter: 'blur(4px)', boxShadow: '0 12px 32px rgba(29, 61, 42, 0.10)' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.1, fontWeight: 700, margin: 0 }}>
            Building a Greener Tomorrow
          </h1>
          <p style={{ fontSize: '1.125rem', lineHeight: 1.6, margin: '16px 0 0', color: '#426554' }}>
            Measure today. Sustain tomorrow.
          </p>
        </div>
      </div>

      <div
        className="sustainiq-login-form-side"
        style={{
          flex: '1 1 50%',
          minHeight: '100vh',
          padding: '40px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'visible',
          background: 'transparent',
        }}
      >
        {/* Decorative ambient background blur spheres */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            left: '-5%',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(8, 127, 91, 0.12) 0%, rgba(8, 127, 91, 0) 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-10%',
            right: '-5%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, rgba(37, 99, 235, 0) 70%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            width: '100%',
            maxWidth: '440px',
            position: 'relative',
            zIndex: 10,
            padding: '32px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            background: 'rgba(255, 255, 255, 0.94)',
            boxShadow: '0 18px 48px rgba(29, 61, 42, 0.18)',
            backdropFilter: 'blur(8px)',
          }}
          className="sustainiq-login-content"
        >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            onClick={() => onNavigate('landing')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              marginBottom: '12px',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                background: '#087F5B',
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px -4px rgba(8, 127, 91, 0.35)',
              }}
            >
              <Leaf size={24} color="#FFFFFF" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#17201C' }}>
                  Sustain
                </span>
                <span style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#087F5B' }}>
                  IQ
                </span>
              </div>
              <p
                style={{
                  fontSize: '0.72rem',
                  color: '#64748B',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontWeight: 600,
                  marginTop: '-2px',
                }}
              >
                Smart ESG Analytics Platform
              </p>
            </div>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#17201C', marginTop: '8px' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '4px' }}>
            Welcome back! Let's make sustainability measurable.
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.06), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
            padding: '32px 28px',
          }}
        >
          {/* Error Message Alert */}
          {errorMessage && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '8px',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#B91C1C',
                fontSize: '0.85rem',
                marginBottom: '20px',
                lineHeight: '1.4',
              }}
              role="alert"
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontWeight: 600 }}>Authentication Error: </strong>
                {errorMessage}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email Input */}
            <div style={{ marginBottom: '18px' }}>
              <label
                htmlFor="login-email"
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '6px',
                }}
              >
                Work Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <Mail size={18} />
                </div>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.9rem',
                    color: '#17201C',
                    background: '#FFFFFF',
                    outline: 'none',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#087F5B';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(8, 127, 91, 0.12)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#CBD5E1';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px',
                }}
              >
                <label
                  htmlFor="login-password"
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#334155',
                  }}
                >
                  Password
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <Lock size={18} />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 38px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.9rem',
                    color: '#17201C',
                    background: '#FFFFFF',
                    outline: 'none',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#087F5B';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(8, 127, 91, 0.12)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#CBD5E1';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748B',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '11px',
                fontSize: '0.925rem',
                fontWeight: 600,
                borderRadius: '8px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.75 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 10px rgba(8, 127, 91, 0.25)',
              }}
            >
              {isSubmitting ? (
                <>
                  <span
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTopColor: '#FFFFFF',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                      display: 'inline-block',
                    }}
                  />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Switch to Register */}
          <div
            style={{
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid #F1F5F9',
              textAlign: 'center',
              fontSize: '0.875rem',
              color: '#64748B',
            }}
          >
            Don't have an account yet?{' '}
            <button
              type="button"
              onClick={() => onNavigate('register')}
              style={{
                background: 'none',
                border: 'none',
                color: '#087F5B',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'underline',
              }}
            >
              Create Account
            </button>
          </div>
        </div>

        </div>
      </div>
    </div>
  );
};
