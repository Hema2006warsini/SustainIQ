import React from 'react';
import { Award, Leaf, Users, ShieldCheck, HelpCircle } from 'lucide-react';

interface ScoreOverviewProps {
  overallScore: number | null;
  environmentalScore: number | null;
  socialScore: number | null;
  governanceScore: number | null;
  onOpenExplainer: () => void;
}

export const getEsgPerformanceStatus = (score: number | null | undefined): {
  label: string;
  indicator: string;
  color: string;
  bg: string;
  border: string;
} | null => {
  if (score === null || score === undefined || isNaN(score)) return null;
  if (score >= 80) {
    return {
      label: 'Good Performance',
      indicator: '🟢',
      color: '#087F5B',
      bg: '#E6F4EA',
      border: '#C3E6CB',
    };
  }
  if (score >= 60) {
    return {
      label: 'Needs Improvement',
      indicator: '🟡',
      color: '#B45309',
      bg: '#FEF3C7',
      border: '#FDE68A',
    };
  }
  return {
    label: 'Critical',
    indicator: '🔴',
    color: '#DC2626',
    bg: '#FEE2E2',
    border: '#FECACA',
  };
};

export const ScoreOverview: React.FC<ScoreOverviewProps> = ({
  overallScore,
  environmentalScore,
  socialScore,
  governanceScore,
  onOpenExplainer,
}) => {
  const hasScore = overallScore !== null && overallScore !== undefined;
  const performanceStatus = hasScore ? getEsgPerformanceStatus(overallScore) : null;

  return (
    <div className="glass-card" style={{ padding: '24px', background: '#FFFFFF' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: '#EBF5F0', padding: '8px', borderRadius: '8px' }}>
            <Award size={20} color="#087F5B" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#17201C', fontWeight: 600 }}>ESG Performance Scorecard</h3>
            <p style={{ fontSize: '0.75rem', color: '#64748B' }}>Real-time weighted sustainability index</p>
          </div>
        </div>

        {/* "How is this calculated?" Action */}
        <button
          type="button"
          onClick={onOpenExplainer}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            padding: '7px 12px',
            borderRadius: '8px',
            color: '#475569',
            fontSize: '0.8rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#087F5B';
            e.currentTarget.style.color = '#087F5B';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#E2E8F0';
            e.currentTarget.style.color = '#475569';
          }}
        >
          <HelpCircle size={15} color="#087F5B" />
          <span>How is this calculated?</span>
        </button>
      </div>

      {!hasScore ? (
        <div style={{ padding: '28px 20px', textAlign: 'center', background: '#F8FAFC', borderRadius: '10px', border: '1px dashed #CBD5E1' }}>
          <p style={{ color: '#475569', fontSize: '0.9rem', fontWeight: 600, marginBottom: '4px' }}>
            Insufficient data to calculate ESG score.
          </p>
          <p style={{ color: '#64748B', fontSize: '0.8rem' }}>
            Add at least one monthly record with environmental, social, and governance telemetry.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 240px) 1fr', gap: '24px', alignItems: 'center' }}>
          {/* Main Score Hero */}
          <div 
            style={{ 
              textAlign: 'center', 
              padding: '20px 16px', 
              background: '#F8FAFC', 
              borderRadius: '12px', 
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Overall Score
            </div>
            <div style={{ fontSize: '3.2rem', fontWeight: 800, color: '#087F5B', lineHeight: 1 }}>
              {overallScore}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '8px' }}>
              Out of 100
            </div>

            {/* Dynamic ESG Performance Status */}
            {performanceStatus && (
              <div 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  padding: '5px 12px', 
                  borderRadius: '6px', 
                  background: performanceStatus.bg, 
                  border: `1px solid ${performanceStatus.border}`, 
                  color: performanceStatus.color, 
                  fontSize: '0.8rem', 
                  fontWeight: 600 
                }}
              >
                <span>{performanceStatus.indicator}</span>
                <span>{performanceStatus.label}</span>
              </div>
            )}
          </div>

          {/* Sub-Pillar Breakdown Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Environmental */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#087F5B', fontWeight: 600 }}>
                  <Leaf size={14} color="#087F5B" /> Environmental Pillar (40%)
                </span>
                <span style={{ fontWeight: 700, color: '#17201C' }}>
                  {environmentalScore !== null ? `${environmentalScore}/100` : '—'}
                </span>
              </div>
              <div style={{ height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.max(0, environmentalScore || 0))}%`,
                    background: '#087F5B',
                    borderRadius: '4px',
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>
            </div>

            {/* Social */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563EB', fontWeight: 600 }}>
                  <Users size={14} color="#2563EB" /> Social Pillar (30%)
                </span>
                <span style={{ fontWeight: 700, color: '#17201C' }}>
                  {socialScore !== null ? `${socialScore}/100` : '—'}
                </span>
              </div>
              <div style={{ height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.max(0, socialScore || 0))}%`,
                    background: '#2563EB',
                    borderRadius: '4px',
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>
            </div>

            {/* Governance */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4F46E5', fontWeight: 600 }}>
                  <ShieldCheck size={14} color="#4F46E5" /> Governance Pillar (30%)
                </span>
                <span style={{ fontWeight: 700, color: '#17201C' }}>
                  {governanceScore !== null ? `${governanceScore}/100` : '—'}
                </span>
              </div>
              <div style={{ height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.max(0, governanceScore || 0))}%`,
                    background: '#4F46E5',
                    borderRadius: '4px',
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
