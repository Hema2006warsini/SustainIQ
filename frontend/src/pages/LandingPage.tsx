import React from 'react';
import { ArrowRight, Activity, Award, TrendingUp, FileText, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onGetStarted: () => void;
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onNavigate }) => {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      title: 'Real-time Monitoring',
      description: 'Continuous operational telemetry tracking for energy consumption, water usage, waste diversion, and greenhouse gas emissions.',
      icon: Activity,
      iconColor: '#087F5B',
      iconBg: '#EBF5F0',
    },
    {
      title: 'ESG Score Calculation',
      description: 'Transparent multi-pillar score computation across Environmental, Social, and Governance criteria using actual verified records.',
      icon: Award,
      iconColor: '#2563EB',
      iconBg: '#EFF6FF',
    },
    {
      title: 'Trend Analysis',
      description: 'Dynamic time-series visual analysis tracking month-over-month performance shifts and longitudinal sustainability progress.',
      icon: TrendingUp,
      iconColor: '#4F46E5',
      iconBg: '#EEF2FF',
    },
    {
      title: 'Compliance Reports',
      description: 'Presentation-ready PDF documentation compiled directly from database telemetry for evaluators, audits, and leadership.',
      icon: FileText,
      iconColor: '#D97706',
      iconBg: '#FEF3C7',
    },
  ];

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', padding: '48px 24px' }}>
      {/* Hero Section */}
      <div 
        style={{ 
          textAlign: 'center', 
          padding: '48px 20px 40px',
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          marginBottom: '32px'
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#17201C' }}>
            Sustain<span style={{ color: '#087F5B' }}>IQ</span>
          </h1>
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#087F5B', marginBottom: '16px', letterSpacing: '-0.01em' }}>
          Smart ESG Monitoring & Analytics Platform
        </h2>

        <p style={{ maxWidth: '600px', margin: '0 auto 28px', fontSize: '1.05rem', color: '#475569', lineHeight: '1.6' }}>
          Track environmental, social, and governance performance across your organization with verified telemetry and dedicated user data isolation.
        </p>

        {/* Dynamic CTA based on Auth */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {isAuthenticated ? (
            <button 
              type="button"
              onClick={onGetStarted}
              className="btn-primary" 
              style={{ padding: '12px 28px', fontSize: '0.95rem', borderRadius: '8px' }}
            >
              Open Dashboard ({user?.name || 'Account'}) <ArrowRight size={16} />
            </button>
          ) : (
            <>
              <button 
                type="button"
                onClick={() => onNavigate('register')}
                className="btn-primary" 
                style={{ padding: '12px 24px', fontSize: '0.95rem', borderRadius: '8px' }}
              >
                <UserPlus size={16} /> Create Free Account
              </button>
              <button 
                type="button"
                onClick={() => onNavigate('login')}
                style={{ 
                  padding: '12px 24px', 
                  fontSize: '0.95rem', 
                  borderRadius: '8px',
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  color: '#17201C',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <LogIn size={16} /> Sign In
              </button>
            </>
          )}
        </div>
      </div>

      {/* 4 Clean Feature Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div 
              key={idx}
              className="glass-card" 
              style={{ 
                padding: '24px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px',
                background: '#FFFFFF',
              }}
            >
              <div 
                style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: '10px', 
                  background: feature.iconBg, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <Icon size={20} color={feature.iconColor} />
              </div>
              <h3 style={{ fontSize: '1.05rem', color: '#17201C', fontWeight: 600 }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: '1.55' }}>
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
