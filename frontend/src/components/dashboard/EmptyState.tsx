import React from 'react';
import { Leaf, Plus, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  onAddRecord: () => void;
  orgName?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onAddRecord, orgName }) => {
  return (
    <div
      className="glass-card"
      style={{
        padding: '56px 30px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '680px',
        margin: '24px auto',
        border: '1px dashed #CBD5E1',
        background: '#FFFFFF',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: '#EBF5F0',
          border: '1px solid #C3E6CB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '18px',
        }}
      >
        <Leaf size={30} color="#087F5B" />
      </div>

      <h2 style={{ fontSize: '1.35rem', marginBottom: '8px', color: '#17201C', fontWeight: 700 }}>
        No ESG data available yet.
      </h2>

      <p style={{ color: '#64748B', fontSize: '0.9rem', maxWidth: '480px', lineHeight: '1.6', marginBottom: '24px' }}>
        Add your first ESG record to start monitoring {orgName ? <strong style={{ color: '#17201C' }}>{orgName}’s</strong> : "your organization's"} sustainability performance, dynamic scorecards, and analytical trends.
      </p>

      <button onClick={onAddRecord} className="btn-primary" style={{ padding: '10px 22px', fontSize: '0.9rem' }}>
        <Plus size={16} /> Add ESG Record
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '22px', fontSize: '0.75rem', color: '#64748B' }}>
        <Sparkles size={14} color="#087F5B" />
        Zero mock/fake data policy active • Populated only by your verified submissions
      </div>
    </div>
  );
};
