import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { ChartDataPoint } from '../../types';
import { Zap, Droplets, Trash2, CloudFog, Sun, TrendingUp } from 'lucide-react';

interface DashboardChartsProps {
  energyData: ChartDataPoint[];
  waterData: ChartDataPoint[];
  wasteData: ChartDataPoint[];
  carbonData: ChartDataPoint[];
  renewableData: ChartDataPoint[];
  scoreData: ChartDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ 
        background: '#FFFFFF', 
        border: '1px solid #E2E8F0', 
        padding: '10px 14px', 
        borderRadius: '8px', 
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' 
      }}>
        <p style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '6px', fontWeight: 600 }}>{label}</p>
        {payload.map((p: any, idx: number) => (
          <p key={idx} style={{ fontSize: '0.8rem', color: p.color, fontWeight: 600 }}>
            {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const EmptyChartNotice = () => (
  <div style={{ height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
    <p>No records available for this chart.</p>
    <span style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px' }}>Add telemetry records to view time-series</span>
  </div>
);

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  energyData,
  waterData,
  wasteData,
  carbonData,
  renewableData,
  scoreData,
}) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
      {/* 1. Energy Consumption Over Time */}
      <div className="glass-card" style={{ padding: '20px', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Zap size={18} color="#D97706" />
          <h4 style={{ fontSize: '0.925rem', color: '#17201C', fontWeight: 600 }}>1. Energy Consumption Over Time (kWh)</h4>
        </div>
        {energyData.length === 0 ? (
          <EmptyChartNotice />
        ) : (
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={energyData}>
                <defs>
                  <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D97706" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#D97706" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" name="Energy (kWh)" stroke="#D97706" strokeWidth={2} fillOpacity={1} fill="url(#energyGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 2. Water Consumption Over Time */}
      <div className="glass-card" style={{ padding: '20px', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Droplets size={18} color="#0D9488" />
          <h4 style={{ fontSize: '0.925rem', color: '#17201C', fontWeight: 600 }}>2. Water Consumption Over Time (Litres)</h4>
        </div>
        {waterData.length === 0 ? (
          <EmptyChartNotice />
        ) : (
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={waterData}>
                <defs>
                  <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" name="Water (L)" stroke="#0D9488" strokeWidth={2} fillOpacity={1} fill="url(#waterGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 3. Waste Generated vs Waste Recycled */}
      <div className="glass-card" style={{ padding: '20px', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Trash2 size={18} color="#087F5B" />
          <h4 style={{ fontSize: '0.925rem', color: '#17201C', fontWeight: 600 }}>3. Waste Generated vs Waste Recycled (kg)</h4>
        </div>
        {wasteData.length === 0 ? (
          <EmptyChartNotice />
        ) : (
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wasteData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '6px' }} />
                <Bar dataKey="generated" name="Generated (kg)" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recycled" name="Recycled (kg)" fill="#087F5B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 4. Carbon Emissions Over Time */}
      <div className="glass-card" style={{ padding: '20px', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <CloudFog size={18} color="#DC2626" />
          <h4 style={{ fontSize: '0.925rem', color: '#17201C', fontWeight: 600 }}>4. Carbon Emissions Over Time (kg CO2e)</h4>
        </div>
        {carbonData.length === 0 ? (
          <EmptyChartNotice />
        ) : (
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={carbonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="value" name="Carbon (kg CO2e)" stroke="#DC2626" strokeWidth={2.5} dot={{ r: 4, fill: '#DC2626' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 5. Renewable Energy Percentage Over Time */}
      <div className="glass-card" style={{ padding: '20px', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Sun size={18} color="#087F5B" />
          <h4 style={{ fontSize: '0.925rem', color: '#17201C', fontWeight: 600 }}>5. Renewable Energy Percentage (%)</h4>
        </div>
        {renewableData.length === 0 ? (
          <EmptyChartNotice />
        ) : (
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={renewableData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" domain={[0, 100]} fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="value" name="Renewable %" stroke="#087F5B" strokeWidth={2.5} dot={{ r: 4, fill: '#087F5B' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 6. ESG Score Trend */}
      <div className="glass-card" style={{ padding: '20px', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <TrendingUp size={18} color="#4F46E5" />
          <h4 style={{ fontSize: '0.925rem', color: '#17201C', fontWeight: 600 }}>6. ESG Score Trend (E, S, G & Overall)</h4>
        </div>
        {scoreData.length === 0 ? (
          <EmptyChartNotice />
        ) : (
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" domain={[0, 100]} fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '6px' }} />
                <Line type="monotone" dataKey="environmental" name="Environmental" stroke="#087F5B" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="social" name="Social" stroke="#2563EB" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="governance" name="Governance" stroke="#4F46E5" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="overall" name="Overall ESG" stroke="#0F172A" strokeWidth={2.5} dot={{ r: 4, fill: '#0F172A' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
