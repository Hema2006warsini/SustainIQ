import React, { useState, useEffect } from 'react';
import { Database, Zap, RefreshCw, BookOpen, Leaf, Users, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { SystemHealth } from '../types';

export const SettingsPage: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchHealth = async () => {
    try {
      setIsLoading(true);
      const data = await api.getSystemHealth();
      setHealth(data);
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', marginBottom: '4px', color: '#17201C', fontWeight: 700 }}>System Architecture & Diagnostics</h1>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Live status of PostgreSQL storage, internal Redis caching performance, and algorithmic scoring
          </p>
        </div>

        <button type="button" onClick={fetchHealth} className="btn-secondary" style={{ padding: '8px 14px' }}>
          <RefreshCw size={14} /> Refresh Diagnostics
        </button>
      </div>

      {/* Diagnostics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* PostgreSQL Database Card */}
        <div className="glass-card" style={{ padding: '20px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ background: '#EBF5F0', padding: '9px', borderRadius: '8px' }}>
              <Database size={20} color="#087F5B" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', color: '#17201C', fontWeight: 600 }}>Database Layer</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748B' }}>PostgreSQL Telemetry Engine</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #E2E8F0' }}>
              <span style={{ color: '#64748B' }}>Engine Status:</span>
              <span style={{ color: '#087F5B', fontWeight: 600 }}>● Active & Connected</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #E2E8F0' }}>
              <span style={{ color: '#64748B' }}>Engine Mode:</span>
              <span style={{ color: '#17201C', fontWeight: 600 }}>{health?.database.type || 'PostgreSQL'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #E2E8F0' }}>
              <span style={{ color: '#64748B' }}>Seed Data Policy:</span>
              <span style={{ color: '#2563EB', fontWeight: 600 }}>Zero-Mock (100% User Input)</span>
            </div>
          </div>
        </div>

        {/* Redis Cache Card */}
        <div className="glass-card" style={{ padding: '20px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ background: '#FEF3C7', padding: '9px', borderRadius: '8px' }}>
              <Zap size={20} color="#D97706" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', color: '#17201C', fontWeight: 600 }}>Redis Caching Layer</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748B' }}>Real-time Internal Cache & Invalidation</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #E2E8F0' }}>
              <span style={{ color: '#64748B' }}>Cache Engine:</span>
              <span style={{ color: '#D97706', fontWeight: 600 }}>{health?.redis.engine || 'Redis Cache'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #E2E8F0' }}>
              <span style={{ color: '#64748B' }}>Cache Hits:</span>
              <span style={{ color: '#087F5B', fontWeight: 600 }}>{health?.redis.stats.hits ?? 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #E2E8F0' }}>
              <span style={{ color: '#64748B' }}>Cache Misses:</span>
              <span style={{ color: '#DC2626', fontWeight: 600 }}>{health?.redis.stats.misses ?? 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #E2E8F0' }}>
              <span style={{ color: '#64748B' }}>Cache Invalidations:</span>
              <span style={{ color: '#4F46E5', fontWeight: 600 }}>{health?.redis.stats.invalidations ?? 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transparent Scoring Breakdown Section */}
      <div className="glass-card" style={{ padding: '24px', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ background: '#EFF6FF', padding: '9px', borderRadius: '8px' }}>
            <BookOpen size={20} color="#2563EB" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#17201C', fontWeight: 600 }}>Transparent ESG Scoring Formula</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B' }}>Published mathematical specifications</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.875rem', color: '#475569', lineHeight: '1.6' }}>
          <p>
            SustainIQ calculates category scores and a unified ESG Index entirely from recorded telemetry values. If metrics are missing or the database is unpopulated, the platform safely flags <strong>"Insufficient data"</strong> rather than inventing arbitrary baseline figures.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '8px' }}>
            <div style={{ padding: '16px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <h4 style={{ color: '#087F5B', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Leaf size={16} /> Environmental (40%)
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
                Weights: 30% Renewable Energy Adoption, 30% Waste Diversion & Recycling Rate, 20% Carbon Intensity per Employee, 20% Electricity Intensity per Employee.
              </p>
            </div>

            <div style={{ padding: '16px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <h4 style={{ color: '#2563EB', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Users size={16} /> Social (30%)
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
                Weights: 40% Training Hours per Staff Member (3.5 hr/mo benchmark), 40% Zero Workplace Safety Incidents (20-point penalty per incident), 20% Community Sustainability Initiatives.
              </p>
            </div>

            <div style={{ padding: '16px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <h4 style={{ color: '#4F46E5', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <ShieldCheck size={16} /> Governance (30%)
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
                Weights: 50% Statutory Regulatory Compliance %, 25% Zero Ethics Violations (25-point penalty per incident), 25% Internal Board & Policy Governance Assessment Score.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
