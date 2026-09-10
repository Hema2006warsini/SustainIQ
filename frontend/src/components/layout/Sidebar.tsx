import React from 'react';
import { 
  LayoutDashboard, 
  Database, 
  Building2, 
  FileText, 
  Home
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const navItems = [
    { id: 'landing', label: 'Welcome / Home', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'records', label: 'ESG Records', icon: Database },
    { id: 'organizations', label: 'Organizations', icon: Building2 },
    { id: 'reports', label: 'ESG Reports (PDF)', icon: FileText },
  ];

  return (
    <aside 
      style={{
        width: '240px',
        minHeight: 'calc(100vh - 65px)',
        background: '#FFFFFF',
        borderRight: '1px solid #E2E8F0',
        padding: '20px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        flexShrink: 0,
      }}
    >
      <div style={{ padding: '0 12px 10px', fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Navigation
      </div>

      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              background: isActive ? '#EBF5F0' : 'transparent',
              color: isActive ? '#087F5B' : '#475569',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
              borderLeft: isActive ? '3px solid #087F5B' : '3px solid transparent',
            }}
            onMouseEnter={e => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = '#F8FAFC';
                e.currentTarget.style.color = '#0F172A';
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#475569';
              }
            }}
          >
            <Icon size={18} color={isActive ? '#087F5B' : '#64748B'} />
            <span>{item.label}</span>
          </button>
        );
      })}

      {/* Footer Info Box */}
      <div 
        style={{ 
          marginTop: 'auto', 
          padding: '12px 14px', 
          borderRadius: '10px', 
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          fontSize: '0.725rem',
          color: '#64748B',
        }}
      >
        <div style={{ fontWeight: 600, color: '#17201C', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#087F5B', display: 'inline-block' }}></span>
          Verified ESG Telemetry
        </div>
        <p style={{ lineHeight: '1.4' }}>
          Real-time metrics computed directly from database records.
        </p>
      </div>
    </aside>
  );
};
