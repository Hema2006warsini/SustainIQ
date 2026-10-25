import React from 'react';
import { 
  LayoutDashboard, 
  Database, 
  Building2, 
  FileText, 
  Home,
  LogOut,
  User as UserIcon,
  LogIn
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { user, isAuthenticated, logout } = useAuth();

  const navItems = [
    { id: 'landing', label: 'Welcome / Home', icon: Home, public: true },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, public: false },
    { id: 'records', label: 'ESG Records', icon: Database, public: false },
    { id: 'organizations', label: 'Organizations', icon: Building2, public: false },
    { id: 'reports', label: 'ESG Reports (PDF)', icon: FileText, public: false },
  ];

  const handleLogout = async () => {
    await logout();
    onNavigate('login');
  };

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

      {/* User Section / Logout at bottom */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {isAuthenticated && user ? (
          <div
            style={{
              padding: '12px',
              borderRadius: '10px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#EBF5F0',
                  color: '#087F5B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  border: '1px solid rgba(8, 127, 91, 0.2)',
                  flexShrink: 0,
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#17201C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.email}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '7px 10px',
                borderRadius: '6px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: '#64748B',
                fontSize: '0.775rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#FCA5A5';
                e.currentTarget.style.color = '#DC2626';
                e.currentTarget.style.backgroundColor = '#FEF2F2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#CBD5E1';
                e.currentTarget.style.color = '#64748B';
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div
            style={{
              padding: '12px',
              borderRadius: '10px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
              Sign in to manage and report ESG metrics.
            </div>
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="btn-primary"
              style={{ width: '100%', fontSize: '0.8rem', padding: '7px' }}
            >
              <LogIn size={14} /> Sign In
            </button>
          </div>
        )}

      </div>
    </aside>
  );
};
