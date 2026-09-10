import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit3, Trash2, Database, RefreshCw, Calendar } from 'lucide-react';
import { useOrganization } from '../context/OrganizationContext';
import { api } from '../services/api';
import { ESGRecord } from '../types';
import { DeleteConfirmModal } from '../components/common/DeleteConfirmModal';

interface RecordsPageProps {
  onOpenAddRecordModal: () => void;
  onOpenEditRecordModal: (record: ESGRecord) => void;
  refreshKey: number;
  onRecordDeleted: () => void;
}

export const RecordsPage: React.FC<RecordsPageProps> = ({
  onOpenAddRecordModal,
  onOpenEditRecordModal,
  refreshKey,
  onRecordDeleted,
}) => {
  const { currentOrg } = useOrganization();
  const [records, setRecords] = useState<ESGRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [recordToDelete, setRecordToDelete] = useState<ESGRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchRecords = useCallback(async () => {
    if (!currentOrg) return;
    try {
      setIsLoading(true);
      const data = await api.getRecords(currentOrg.id);
      setRecords(data);
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  }, [currentOrg]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords, refreshKey]);

  const handleDeleteConfirm = async () => {
    if (!recordToDelete) return;
    try {
      setIsDeleting(true);
      await api.deleteRecord(recordToDelete.id);
      setRecordToDelete(null);
      await fetchRecords();
      onRecordDeleted();
    } catch (err: any) {
      alert(`Error deleting record: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredRecords = records.filter(r => {
    const matchDate = r.record_date.toLowerCase().includes(searchTerm.toLowerCase());
    return matchDate;
  });

  if (!currentOrg) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
        Please select or create an organization first.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', marginBottom: '4px', color: '#17201C', fontWeight: 700 }}>ESG Telemetry Records</h1>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Historical audit log for <strong style={{ color: '#17201C' }}>{currentOrg.name}</strong> ({currentOrg.type})
          </p>
        </div>

        <button onClick={onOpenAddRecordModal} className="btn-primary" style={{ padding: '8px 16px' }}>
          <Plus size={16} /> Add ESG Record
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '340px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 12px' }}>
          <Search size={15} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search records by date (YYYY-MM)..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ background: 'none', border: 'none', color: '#17201C', padding: '8px 0', fontSize: '0.85rem', width: '100%', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
            Showing {filteredRecords.length} of {records.length} record(s)
          </span>
          <button 
            type="button"
            onClick={fetchRecords} 
            className="btn-secondary" 
            title="Refresh" 
            style={{ padding: '7px 11px' }}
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="glass-card" style={{ padding: '20px', background: '#FFFFFF' }}>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
            Loading records from PostgreSQL...
          </div>
        ) : records.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <Database size={34} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.15rem', marginBottom: '6px', color: '#17201C', fontWeight: 600 }}>No ESG Records Available</h3>
            <p style={{ color: '#64748B', fontSize: '0.85rem', maxWidth: '400px', margin: '0 auto 20px' }}>
              No sustainability records have been submitted for {currentOrg.name} yet.
            </p>
            <button onClick={onOpenAddRecordModal} className="btn-primary">
              <Plus size={16} /> Add First Record
            </button>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#64748B', fontSize: '0.875rem' }}>
            No records match "{searchTerm}"
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date / Month</th>
                  <th>Energy (kWh)</th>
                  <th>Water (L)</th>
                  <th>Waste Gen (kg)</th>
                  <th>Waste Rec (kg)</th>
                  <th>Carbon (kg CO2e)</th>
                  <th>Renewable %</th>
                  <th>Workforce</th>
                  <th>Compliance %</th>
                  <th>ESG Score</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(rec => (
                  <tr key={rec.id}>
                    <td style={{ fontWeight: 600, color: '#17201C' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} color="#087F5B" />
                        {rec.record_date}
                      </div>
                    </td>
                    <td>{rec.energy_consumption.toLocaleString()}</td>
                    <td>{rec.water_consumption.toLocaleString()}</td>
                    <td>{rec.waste_generated.toLocaleString()}</td>
                    <td style={{ color: '#087F5B', fontWeight: 600 }}>{rec.waste_recycled.toLocaleString()}</td>
                    <td>{rec.carbon_emissions.toLocaleString()}</td>
                    <td style={{ color: '#087F5B' }}>{rec.renewable_energy_percentage}%</td>
                    <td>{rec.employees}</td>
                    <td>{rec.compliance_percentage}%</td>
                    <td>
                      <span className="badge badge-purple">
                        {rec.overall_esg_score !== null ? `${rec.overall_esg_score}/100` : '—'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                          type="button"
                          onClick={() => onOpenEditRecordModal(rec)}
                          title="Edit Record"
                          style={{ background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer', padding: '4px' }}
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRecordToDelete(rec)}
                          title="Delete Record"
                          style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '4px' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!recordToDelete}
        onClose={() => setRecordToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete ESG Record?"
        message={`Are you sure you want to delete the ESG record for date "${recordToDelete?.record_date}"? This will permanently remove the record from PostgreSQL and recalculate all dashboard KPIs.`}
        isDeleting={isDeleting}
      />
    </div>
  );
};
