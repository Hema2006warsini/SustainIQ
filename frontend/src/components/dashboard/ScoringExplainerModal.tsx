import React from 'react';
import { X, HelpCircle, Leaf, Users, ShieldCheck, Award } from 'lucide-react';

interface ScoringExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScoringExplainerModal: React.FC<ScoringExplainerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '680px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#EBF5F0', padding: '8px', borderRadius: '8px' }}>
              <HelpCircle size={20} color="#087F5B" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#17201C', fontWeight: 600 }}>Transparent ESG Scoring Methodology</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748B' }}>Mathematical formulation & pillar weighting</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', fontSize: '0.875rem' }}>
          <p style={{ color: '#475569', lineHeight: '1.6' }}>
            SustainIQ employs an <strong>input-driven, transparent scoring model</strong>. Scores are not arbitrary or pre-assigned; every verified monthly record in PostgreSQL contributes directly to pillar and overall indices.
          </p>

          {/* Overall Formula Box */}
          <div style={{ padding: '16px', borderRadius: '10px', background: '#EBF5F0', border: '1px solid #C3E6CB' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#087F5B', marginBottom: '8px' }}>
              <Award size={18} /> Overall ESG Score Formula (0 – 100)
            </div>
            <code style={{ display: 'block', background: '#FFFFFF', border: '1px solid #A7F3D0', padding: '10px 14px', borderRadius: '6px', color: '#087F5B', fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 600 }}>
              Overall Score = (Environmental × 0.40) + (Social × 0.30) + (Governance × 0.30)
            </code>
          </div>

          {/* Environmental Pillar */}
          <div style={{ padding: '16px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#087F5B', marginBottom: '8px' }}>
              <Leaf size={16} /> Environmental Pillar (Weight: 40%)
            </div>
            <ul style={{ paddingLeft: '20px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.825rem' }}>
              <li><strong>Renewable Energy (30%)</strong>: Percentage of electricity sourced from green/renewable energy.</li>
              <li><strong>Waste Recycling Rate (30%)</strong>: Ratio calculated as <code>(Waste Recycled / Waste Generated) × 100</code>.</li>
              <li><strong>Carbon Efficiency (20%)</strong>: Greenhouse emissions per employee relative to standard benchmark.</li>
              <li><strong>Energy Efficiency (20%)</strong>: Total kWh electricity consumption relative to workforce size.</li>
            </ul>
          </div>

          {/* Social Pillar */}
          <div style={{ padding: '16px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#2563EB', marginBottom: '8px' }}>
              <Users size={16} /> Social Pillar (Weight: 30%)
            </div>
            <ul style={{ paddingLeft: '20px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.825rem' }}>
              <li><strong>Employee Training (40%)</strong>: Training hours completed per employee against monthly targets.</li>
              <li><strong>Workplace Safety (40%)</strong>: 100% baseline with 20-point deduction per safety incident.</li>
              <li><strong>Community Initiatives (20%)</strong>: Active outreach and community sustainability projects.</li>
            </ul>
          </div>

          {/* Governance Pillar */}
          <div style={{ padding: '16px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#4F46E5', marginBottom: '8px' }}>
              <ShieldCheck size={16} /> Governance Pillar (Weight: 30%)
            </div>
            <ul style={{ paddingLeft: '20px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.825rem' }}>
              <li><strong>Regulatory Compliance (50%)</strong>: Adherence rate to labor, environmental, and corporate codes.</li>
              <li><strong>Ethics Violations (25%)</strong>: 100% baseline with 25-point deduction per ethics violation.</li>
              <li><strong>Governance Assessment (25%)</strong>: Direct audit score on board transparency and data governance.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '14px 24px', borderTop: '1px solid #E2E8F0', background: '#F8FAFC' }}>
          <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '8px 20px' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
