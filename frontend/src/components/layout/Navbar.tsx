import React, { useState, useEffect, useRef } from 'react';
import { Leaf, ChevronDown, Building2, Plus, Check } from 'lucide-react';
import { useOrganization } from '../../context/OrganizationContext';

interface NavbarProps {
  onOpenNewOrgModal: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNewOrgModal, onNavigate }) => {
  const { organizations, currentOrg, selectOrgById } = useOrganization();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <header 
      className="glass-panel"
      style={{ 
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '12px 24px',
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
      }}
    >
      {/* Brand */}
      <div 
        onClick={() => onNavigate('dashboard')} 
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
      >
        <div style={{ 
          background: '#087F5B', 
          width: '36px', 
          height: '36px', 
          borderRadius: '8px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 2px 4px rgba(8, 127, 91, 0.2)'
        }}>
          <Leaf size={20} color="#FFFFFF" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#17201C' }}>Sustain</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#087F5B' }}>IQ</span>
          </div>
          <p style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '-2px', fontWeight: 500 }}>
            ESG Monitoring & Analytics
          </p>
        </div>
      </div>

      {/* Right Controls - Organization Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setDropdownOpen(prev => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '7px 14px',
              borderRadius: '8px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              color: '#17201C',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 500,
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              transition: 'border-color 0.15s ease, background-color 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#CBD5E1')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
            aria-expanded={dropdownOpen}
            aria-label="Select Organization"
          >
            <Building2 size={16} color="#087F5B" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#17201C' }}>
                {currentOrg ? currentOrg.name : 'Select Organization'}
              </div>
              {currentOrg && (
                <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                  {currentOrg.type} • {currentOrg.reporting_year}
                </div>
              )}
            </div>
            <ChevronDown 
              size={14} 
              color="#64748B" 
              style={{ 
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.15s ease',
                marginLeft: '4px' 
              }} 
            />
          </button>

          {/* Dropdown Menu (Overlay with high z-index) */}
          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                width: '280px',
                maxWidth: 'calc(100vw - 32px)',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                zIndex: 1100,
                overflow: 'hidden',
              }}
            >
              <div style={{ 
                padding: '9px 14px', 
                borderBottom: '1px solid #F1F5F9', 
                fontSize: '0.72rem', 
                color: '#64748B', 
                fontWeight: 600, 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                background: '#F8FAFC'
              }}>
                Organizations ({organizations.length})
              </div>

              <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                {organizations.length === 0 ? (
                  <div style={{ padding: '16px', fontSize: '0.8rem', color: '#64748B', textAlign: 'center' }}>
                    No organizations yet
                  </div>
                ) : (
                  organizations.map(org => {
                    const isSelected = currentOrg?.id === org.id;
                    return (
                      <div
                        key={org.id}
                        onClick={() => {
                          selectOrgById(org.id);
                          setDropdownOpen(false);
                        }}
                        style={{
                          padding: '10px 14px',
                          cursor: 'pointer',
                          background: isSelected ? '#EBF5F0' : 'transparent',
                          borderLeft: isSelected ? '3px solid #087F5B' : '3px solid transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          transition: 'background-color 0.12s ease',
                        }}
                        onMouseEnter={e => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = '#F8FAFC';
                        }}
                        onMouseLeave={e => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', overflow: 'hidden' }}>
                          <div style={{ 
                            fontSize: '0.85rem', 
                            fontWeight: 600, 
                            color: isSelected ? '#087F5B' : '#17201C',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {org.name}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                            {org.type} • {org.location}
                          </div>
                        </div>
                        {isSelected && <Check size={14} color="#087F5B" style={{ flexShrink: 0 }} />}
                      </div>
                    );
                  })
                )}
              </div>

              <div style={{ padding: '8px 10px', borderTop: '1px solid #F1F5F9', background: '#F8FAFC' }}>
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenNewOrgModal();
                  }}
                  className="btn-primary"
                  style={{ width: '100%', fontSize: '0.8rem', padding: '7px 12px' }}
                >
                  <Plus size={14} /> Create Organization
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
