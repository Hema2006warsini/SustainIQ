import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Plus, 
  Zap, 
  Droplets, 
  Trash2, 
  CloudFog, 
  Sun, 
  Award, 
  Edit3, 
  ArrowRight,
  Database,
  RefreshCw
} from 'lucide-react';
import { useOrganization } from '../context/OrganizationContext';
import { api } from '../services/api';
import { DashboardStats, ESGRecord } from '../types';
import { KpiCard } from '../components/dashboard/KpiCard';
import { ScoreOverview } from '../components/dashboard/ScoreOverview';
import { EmptyState } from '../components/dashboard/EmptyState';
import { DashboardCharts } from '../components/charts/DashboardCharts';
import { ScoringExplainerModal } from '../components/dashboard/ScoringExplainerModal';

interface DashboardPageProps {
  onOpenAddRecordModal: () => void;
  onOpenEditRecordModal: (record: ESGRecord) => void;
  onOpenNewOrgModal: () => void;
  onNavigate: (page: string) => void;
  refreshKey: number;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenAddRecordModal,
  onOpenEditRecordModal,
  onOpenNewOrgModal,
  onNavigate,
  refreshKey,
}) => {
  const { currentOrg, organizations, isLoading: isOrgLoading } = useOrganization();
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isExplainerOpen, setIsExplainerOpen] = useState<boolean>(false);

  const fetchDashboard = useCallback(async () => {
    if (!currentOrg) {
      setDashboardData(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getDashboard(currentOrg.id);
      setDashboardData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [currentOrg]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard, refreshKey]);

  // If no organizations exist yet
  if (!isOrgLoading && organizations.length === 0) {
    return (
      <div 
        style={{ 
          maxWidth: '700px', 
          margin: '60px auto', 
          textAlign: 'center', 
          padding: '48px 24px',
          background: '#FFFFFF' 
        }} 
        className="glass-card"
      >
        <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#EBF5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
          <Building2 size={28} color="#087F5B" />
        </div>
        <h2 style={{ fontSize: '1.45rem', marginBottom: '8px', color: '#17201C', fontWeight: 700 }}>Welcome to SustainIQ</h2>
        <p style={{ color: '#64748B', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 24px', lineHeight: '1.6' }}>
          To begin tracking sustainability metrics and computing verified ESG scores, create your first organization profile.
        </p>
        <button onClick={onOpenNewOrgModal} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
          <Plus size={16} /> Create First Organization
        </button>
      </div>
    );
  }

  // Loading State
  if (isLoading && !dashboardData) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', color: '#64748B' }}>
        <RefreshCw size={26} color="#087F5B" style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
        <p style={{ fontSize: '0.875rem' }}>Loading dashboard telemetry...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div style={{ padding: '20px', background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '10px', color: '#DC2626', margin: '20px' }}>
        <h4 style={{ fontWeight: 700, marginBottom: '6px' }}>Failed to load dashboard</h4>
        <p style={{ fontSize: '0.85rem' }}>{error}</p>
        <button onClick={fetchDashboard} className="btn-secondary" style={{ marginTop: '12px', fontSize: '0.8rem' }}>
          Retry Request
        </button>
      </div>
    );
  }

  const hasData = dashboardData?.hasData || false;
  const kpis = dashboardData?.kpis;
  const trends = dashboardData?.trends;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px' }}>
      {/* Header Banner */}
      <div 
        className="glass-card" 
        style={{ 
          padding: '20px 24px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: '16px',
          background: '#FFFFFF'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '1.45rem', color: '#17201C', fontWeight: 700 }}>
              {currentOrg?.name || 'Organization Dashboard'}
            </h1>
            <span className="badge badge-emerald">
              {currentOrg?.type}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.825rem', color: '#64748B', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <MapPin size={14} color="#087F5B" /> {currentOrg?.location}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Calendar size={14} color="#087F5B" /> Reporting Year: {currentOrg?.reporting_year}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Database size={14} color="#087F5B" /> Records: {dashboardData?.totalRecords || 0}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="button" 
            onClick={fetchDashboard} 
            className="btn-secondary" 
            title="Refresh Dashboard" 
            style={{ padding: '8px 12px' }}
          >
            <RefreshCw size={15} />
          </button>
          <button 
            type="button" 
            onClick={onOpenAddRecordModal} 
            className="btn-primary"
            style={{ padding: '8px 16px' }}
          >
            <Plus size={16} /> Add ESG Record
          </button>
        </div>
      </div>

      {/* Main Content Area: EMPTY STATE or POPULATED STATE */}
      {!hasData ? (
        <EmptyState onAddRecord={onOpenAddRecordModal} orgName={currentOrg?.name} />
      ) : (
        <>
          {/* 7 KPI CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {/* 1. Energy */}
            <KpiCard
              title="Total Energy"
              value={kpis?.totalEnergyConsumption ?? null}
              unit="kWh"
              changePct={trends?.energyChangePct}
              icon={Zap}
              color="amber"
            />

            {/* 2. Water */}
            <KpiCard
              title="Total Water"
              value={kpis?.totalWaterConsumption ?? null}
              unit="Litres"
              changePct={trends?.waterChangePct}
              icon={Droplets}
              color="teal"
            />

            {/* 3. Waste Generated */}
            <KpiCard
              title="Waste Generated"
              value={kpis?.totalWasteGenerated ?? null}
              unit="kg"
              changePct={trends?.wasteChangePct}
              icon={Trash2}
              color="rose"
            />

            {/* 4. Waste Recycled */}
            <KpiCard
              title="Waste Recycled"
              value={kpis?.totalWasteRecycled ?? null}
              unit="kg"
              subtitle={`Recycling Rate: ${kpis?.wasteRecyclingPercentage ?? 0}%`}
              icon={Trash2}
              color="emerald"
            />

            {/* 5. Carbon Emissions */}
            <KpiCard
              title="Carbon Emissions"
              value={kpis?.totalCarbonEmissions ?? null}
              unit="kg CO2e"
              changePct={trends?.carbonChangePct}
              icon={CloudFog}
              color="rose"
            />

            {/* 6. Renewable Energy % */}
            <KpiCard
              title="Renewable Energy"
              value={kpis?.renewableEnergyPercentage !== null ? `${kpis?.renewableEnergyPercentage}%` : null}
              subtitle="Average Green Energy Share"
              icon={Sun}
              color="emerald"
            />

            {/* 7. Overall ESG Score */}
            <KpiCard
              title="Overall ESG Score"
              value={kpis?.overallEsgScore !== null ? `${kpis?.overallEsgScore}/100` : null}
              subtitle="Transparent Weighted Model"
              icon={Award}
              color="purple"
            />
          </div>

          {/* ESG Score Overview Card */}
          <ScoreOverview
            overallScore={kpis?.overallEsgScore ?? null}
            environmentalScore={kpis?.environmentalScore ?? null}
            socialScore={kpis?.socialScore ?? null}
            governanceScore={kpis?.governanceScore ?? null}
            onOpenExplainer={() => setIsExplainerOpen(true)}
          />

          {/* 6 Dynamic Charts */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#17201C', fontWeight: 600 }}>Sustainability Telemetry & Trends</h3>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Time-series database records</span>
            </div>
            <DashboardCharts
              energyData={dashboardData?.charts.energyOverTime || []}
              waterData={dashboardData?.charts.waterOverTime || []}
              wasteData={dashboardData?.charts.wasteComparison || []}
              carbonData={dashboardData?.charts.carbonOverTime || []}
              renewableData={dashboardData?.charts.renewablePercentageOverTime || []}
              scoreData={dashboardData?.charts.scoreTrend || []}
            />
          </div>

          {/* Recent Records Quick Table */}
          <div className="glass-card" style={{ padding: '20px', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', color: '#17201C', fontWeight: 600 }}>Recent ESG Telemetry Records</h3>
                <p style={{ fontSize: '0.75rem', color: '#64748B' }}>Latest submissions for {currentOrg?.name}</p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="button"
                  onClick={() => onNavigate('records')} 
                  className="btn-secondary" 
                  style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                >
                  View All Records <ArrowRight size={14} />
                </button>
                <button 
                  type="button"
                  onClick={onOpenAddRecordModal} 
                  className="btn-primary" 
                  style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                >
                  <Plus size={14} /> Add Record
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Energy (kWh)</th>
                    <th>Water (L)</th>
                    <th>Waste Gen (kg)</th>
                    <th>Waste Rec (kg)</th>
                    <th>Carbon (kg CO2e)</th>
                    <th>Renewable %</th>
                    <th>ESG Score</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData?.recentRecords.map((rec: ESGRecord) => (
                    <tr key={rec.id}>
                      <td style={{ fontWeight: 600, color: '#17201C' }}>{rec.record_date}</td>
                      <td>{rec.energy_consumption.toLocaleString()}</td>
                      <td>{rec.water_consumption.toLocaleString()}</td>
                      <td>{rec.waste_generated.toLocaleString()}</td>
                      <td style={{ color: '#087F5B', fontWeight: 600 }}>{rec.waste_recycled.toLocaleString()}</td>
                      <td>{rec.carbon_emissions.toLocaleString()}</td>
                      <td style={{ color: '#087F5B' }}>{rec.renewable_energy_percentage}%</td>
                      <td>
                        <span className="badge badge-purple">
                          {rec.overall_esg_score !== null ? `${rec.overall_esg_score}/100` : '—'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => onOpenEditRecordModal(rec)}
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: '#2563EB', 
                            cursor: 'pointer', 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '4px', 
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            padding: '2px 4px'
                          }}
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* "How is this calculated?" Explainer Modal */}
      <ScoringExplainerModal
        isOpen={isExplainerOpen}
        onClose={() => setIsExplainerOpen(false)}
      />
    </div>
  );
};
