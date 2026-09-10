import React from 'react';
import { LucideIcon, TrendingDown, TrendingUp } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: number | string | null;
  unit?: string;
  changePct?: number | null;
  icon: LucideIcon;
  color?: 'emerald' | 'blue' | 'purple' | 'amber' | 'rose' | 'teal';
  subtitle?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  unit,
  changePct,
  icon: Icon,
  color = 'emerald',
  subtitle,
}) => {
  const colorMap = {
    emerald: { bg: '#EBF5F0', text: '#087F5B', border: '#C3E6CB' },
    blue: { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
    purple: { bg: '#EEF2FF', text: '#4F46E5', border: '#C7D2FE' },
    amber: { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' },
    rose: { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA' },
    teal: { bg: '#F0FDFA', text: '#0D9488', border: '#99F6E4' },
  };

  const theme = colorMap[color];
  const formattedValue = value !== null && value !== undefined 
    ? typeof value === 'number' ? value.toLocaleString() : value 
    : '—';

  return (
    <div 
      className="glass-card" 
      style={{ 
        padding: '20px', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        background: '#FFFFFF',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </span>
        <div style={{ background: theme.bg, border: `1px solid ${theme.border}`, padding: '7px', borderRadius: '8px' }}>
          <Icon size={17} color={theme.text} />
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#17201C', letterSpacing: '-0.02em' }}>
            {formattedValue}
          </span>
          {unit && formattedValue !== '—' && (
            <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>
              {unit}
            </span>
          )}
        </div>

        {/* Change indicator or subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', minHeight: '18px' }}>
          {changePct !== null && changePct !== undefined ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: changePct <= 0 ? '#087F5B' : '#DC2626',
              }}
            >
              {changePct <= 0 ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
              {Math.abs(changePct)}% MoM
            </span>
          ) : subtitle ? (
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
              {subtitle}
            </span>
          ) : (
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              {formattedValue === '—' ? 'No data' : 'Verified telemetry'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
