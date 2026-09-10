import React, { useState, useEffect } from 'react';
import { FileText, Download, Building2, AlertCircle } from 'lucide-react';
import { useOrganization } from '../context/OrganizationContext';
import { api } from '../services/api';
import { DashboardStats, Organization } from '../types';

export const ReportsPage: React.FC = () => {
  const { currentOrg, organizations, selectOrgById } = useOrganization();
  const [period, setPeriod] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    const fetchOrgData = async () => {
      if (!currentOrg) return;
      try {
        setIsLoading(true);
        const data = await api.getDashboard(currentOrg.id);
        setDashboardData(data);
      } catch {
        // Silently handle
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrgData();
  }, [currentOrg]);

  const handleDownloadPdf = () => {
    if (!currentOrg) return;
    setIsGenerating(true);
    const pdfUrl = api.getPdfReportUrl(
      currentOrg.id,
      period,
      period === 'custom' ? startDate : undefined,
      period === 'custom' ? endDate : undefined
    );
    window.open(pdfUrl, '_blank');
    setTimeout(() => setIsGenerating(false), 1500);
  };

  if (!currentOrg) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
        Please select or create an organization first to generate reports.
      </div>
    );
  }

  const hasData = dashboardData?.hasData || false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.45rem', marginBottom: '4px', color: '#17201C', fontWeight: 700 }}>
          ESG Compliance Reports
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
          Generate verifiable, presentation-ready PDF sustainability documentation for stakeholders and evaluators
        </p>
      </div>

      {/* Configuration Card */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', background: '#FFFFFF' }}>
        <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#17201C', fontWeight: 600 }}>
          <FileText size={18} color="#087F5B" /> Report Scope & Settings
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {/* Organization Selector */}
          <div>
            <label className="form-label">Target Organization</label>
            <select
              className="form-select"
              value={currentOrg.id}
              onChange={e => selectOrgById(e.target.value)}
            >
              {organizations.map((org: Organization) => (
                <option key={org.id} value={org.id}>
                  {org.name} ({org.type})
                </option>
              ))}
            </select>
          </div>

          {/* Reporting Period */}
          <div>
            <label className="form-label">Reporting Period</label>
            <select
              className="form-select"
              value={period}
              onChange={e => setPeriod(e.target.value)}
            >
              <option value="all">All Recorded History</option>
              <option value="monthly">Monthly Interval</option>
              <option value="quarterly">Quarterly Review</option>
              <option value="yearly">Annual Statutory Summary</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>
        </div>

        {/* Custom Range pickers */}
        {period === 'custom' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div>
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-input"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGenerating}
            className="btn-primary"
            style={{ padding: '10px 20px', fontSize: '0.9rem' }}
          >
            <Download size={16} />
            {isGenerating ? 'Compiling PDF...' : 'Generate & Download PDF Report'}
          </button>
        </div>
      </div>

      {/* Live Preview Card */}
      <div className="glass-card" style={{ padding: '24px', background: '#FFFFFF' }}>
        <h3 style={{ fontSize: '1.05rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#17201C', fontWeight: 600 }}>
          <span>Report Data Preview</span>
          <span className="badge badge-emerald">Verified DB Stream</span>
        </h3>

        {!hasData ? (
          <div style={{ padding: '36px 20px', textAlign: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
            <AlertCircle size={30} color="#DC2626" style={{ margin: '0 auto 8px' }} />
            <h4 style={{ color: '#17201C', fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>
              No ESG data available for the selected reporting period.
            </h4>
            <p style={{ color: '#64748B', fontSize: '0.825rem', maxWidth: '440px', margin: '0 auto' }}>
              The dynamic PDF engine requires actual records in PostgreSQL. Submit records through the ESG Records page before compiling an analytical report.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Header snippet */}
            <div style={{ padding: '14px 18px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#17201C' }}>{currentOrg.name}</div>
              <div style={{ fontSize: '0.825rem', color: '#64748B', marginTop: '2px' }}>
                {currentOrg.type} • {currentOrg.location} • Reporting Year: {currentOrg.reporting_year}
              </div>
            </div>

            {/* Scores summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '14px', borderRadius: '8px', background: '#EBF5F0', border: '1px solid #C3E6CB', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: '#087F5B', fontWeight: 600, textTransform: 'uppercase' }}>OVERALL ESG</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#087F5B' }}>{dashboardData?.kpis.overallEsgScore ?? '—'}</div>
              </div>
              <div style={{ padding: '14px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>ENVIRONMENTAL</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#17201C' }}>{dashboardData?.kpis.environmentalScore ?? '—'}</div>
              </div>
              <div style={{ padding: '14px', borderRadius: '8px', background: '#EFF6FF', border: '1px solid #BFDBFE', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: '#2563EB', fontWeight: 600, textTransform: 'uppercase' }}>SOCIAL</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563EB' }}>{dashboardData?.kpis.socialScore ?? '—'}</div>
              </div>
              <div style={{ padding: '14px', borderRadius: '8px', background: '#EEF2FF', border: '1px solid #C7D2FE', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: '#4F46E5', fontWeight: 600, textTransform: 'uppercase' }}>GOVERNANCE</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#4F46E5' }}>{dashboardData?.kpis.governanceScore ?? '—'}</div>
              </div>
            </div>

            {/* Key Totals */}
            <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6', padding: '14px 18px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <strong>Report Inclusions:</strong> This report encompasses <strong>{dashboardData?.totalRecords}</strong> recorded monthly interval(s), with a total energy consumption of <strong>{dashboardData?.kpis.totalEnergyConsumption?.toLocaleString()} kWh</strong>, <strong>{dashboardData?.kpis.totalWaterConsumption?.toLocaleString()} L</strong> of water, and <strong>{dashboardData?.kpis.totalCarbonEmissions?.toLocaleString()} kg CO2e</strong> in greenhouse gas emissions.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
