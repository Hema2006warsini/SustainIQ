import React, { useState } from 'react';
import { Building2, Plus, MapPin, Calendar, Check, Trash2, Edit3 } from 'lucide-react';
import { useOrganization } from '../context/OrganizationContext';
import { Organization } from '../types';
import { api } from '../services/api';
import { DeleteConfirmModal } from '../components/common/DeleteConfirmModal';

interface OrganizationsPageProps {
  onOpenNewOrgModal: () => void;
  onOpenEditOrgModal: (org: Organization) => void;
}

export const OrganizationsPage: React.FC<OrganizationsPageProps> = ({
  onOpenNewOrgModal,
  onOpenEditOrgModal,
}) => {
  const { organizations, currentOrg, selectOrgById, refreshOrganizations } = useOrganization();
  const [orgToDelete, setOrgToDelete] = useState<Organization | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleDeleteConfirm = async () => {
    if (!orgToDelete) return;
    try {
      setIsDeleting(true);
      await api.deleteOrganization(orgToDelete.id);
      setOrgToDelete(null);
      await refreshOrganizations();
    } catch (err: any) {
      alert(`Failed to delete organization: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', marginBottom: '4px', color: '#17201C', fontWeight: 700 }}>Organization Profiles</h1>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Manage registered entities and multi-tenant sustainability separation
          </p>
        </div>

        <button onClick={onOpenNewOrgModal} className="btn-primary" style={{ padding: '8px 16px' }}>
          <Plus size={16} /> Create Organization
        </button>
      </div>

      {/* Grid of Organizations */}
      {organizations.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px 20px', textAlign: 'center', maxWidth: '580px', margin: '30px auto', background: '#FFFFFF' }}>
          <Building2 size={36} color="#64748B" style={{ margin: '0 auto 14px' }} />
          <h3 style={{ fontSize: '1.15rem', marginBottom: '8px', color: '#17201C', fontWeight: 600 }}>No Organizations Registered</h3>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '20px', lineHeight: '1.6' }}>
            Create an organization profile (e.g. Hospital, Bank, University, Corporate, Manufacturing) to start recording ESG records.
          </p>
          <button onClick={onOpenNewOrgModal} className="btn-primary">
            <Plus size={16} /> Create Organization Profile
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {organizations.map((org: Organization) => {
            const isActive = currentOrg?.id === org.id;

            return (
              <div
                key={org.id}
                className="glass-card"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: isActive ? '1.5px solid #087F5B' : '1px solid #E2E8F0',
                  background: isActive ? '#F9FCFA' : '#FFFFFF',
                  boxShadow: isActive ? '0 2px 6px rgba(8, 127, 91, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ background: '#EBF5F0', padding: '9px', borderRadius: '8px' }}>
                        <Building2 size={20} color="#087F5B" />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', color: '#17201C', fontWeight: 600 }}>{org.name}</h3>
                        <span className="badge badge-emerald" style={{ marginTop: '4px' }}>
                          {org.type}
                        </span>
                      </div>
                    </div>

                    {isActive && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#087F5B', fontWeight: 600, background: '#EBF5F0', padding: '3px 8px', borderRadius: '6px' }}>
                        <Check size={13} /> Active
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.825rem', color: '#64748B', margin: '14px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} color="#64748B" /> Location: <strong style={{ color: '#17201C' }}>{org.location}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} color="#64748B" /> Reporting Year: <strong style={{ color: '#17201C' }}>{org.reporting_year}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid #E2E8F0', marginTop: '10px' }}>
                  {!isActive ? (
                    <button
                      type="button"
                      onClick={() => selectOrgById(org.id)}
                      className="btn-secondary"
                      style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                    >
                      Set as Active
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#087F5B', fontWeight: 600 }}>
                      Currently Selected
                    </span>
                  )}

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => onOpenEditOrgModal(org)}
                      className="btn-secondary"
                      title="Edit Organization"
                      style={{ padding: '6px 10px' }}
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrgToDelete(org)}
                      className="btn-danger"
                      title="Delete Organization"
                      style={{ padding: '6px 10px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Organization Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!orgToDelete}
        onClose={() => setOrgToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete "${orgToDelete?.name}"?`}
        message={`Are you sure you want to delete ${orgToDelete?.name}? WARNING: In accordance with database foreign key constraints, ALL associated ESG records stored in PostgreSQL for this organization will also be permanently deleted.`}
        isDeleting={isDeleting}
      />
    </div>
  );
};
