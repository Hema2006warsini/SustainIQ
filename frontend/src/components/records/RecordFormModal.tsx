import React, { useState, useEffect } from 'react';
import { X, Check, Leaf, Users, ShieldCheck, PlusCircle } from 'lucide-react';
import { ESGRecord, Organization } from '../../types';

interface RecordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<ESGRecord>) => Promise<void>;
  initialData?: ESGRecord | null;
  organization: Organization | null;
}

export const RecordFormModal: React.FC<RecordFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  organization,
}) => {
  const [activeTab, setActiveTab] = useState<'env' | 'soc' | 'gov' | 'org'>('env');

  // Basic Info
  const [recordDate, setRecordDate] = useState('');

  // Environmental
  const [energy, setEnergy] = useState<string>('');
  const [water, setWater] = useState<string>('');
  const [wasteGen, setWasteGen] = useState<string>('');
  const [wasteRec, setWasteRec] = useState<string>('');
  const [carbon, setCarbon] = useState<string>('');
  const [renewablePct, setRenewablePct] = useState<string>('');

  // Social
  const [employees, setEmployees] = useState<string>('');
  const [trainingHours, setTrainingHours] = useState<string>('');
  const [safetyIncidents, setSafetyIncidents] = useState<string>('0');
  const [communityInitiatives, setCommunityInitiatives] = useState<string>('0');

  // Governance
  const [compliancePct, setCompliancePct] = useState<string>('');
  const [ethicsIncidents, setEthicsIncidents] = useState<string>('0');
  const [govScore, setGovScore] = useState<string>('');

  // Organization-specific metric
  const [orgMetricKey, setOrgMetricKey] = useState('');
  const [orgMetricValue, setOrgMetricValue] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive default metric name based on organization type
  const getOrgMetricLabel = (type?: string) => {
    switch (type) {
      case 'Hospital': return 'Regulated Medical Waste (kg)';
      case 'Bank': return 'Paper Usage (Reams)';
      case 'College / University': return 'Student Sustainability Initiatives (Count)';
      case 'Manufacturing': return 'Production Scrap / Byproduct Rate (%)';
      case 'Corporate / Company': return 'Business Travel Carbon Offsets (kg CO2e)';
      default: return 'Sector-Specific Sustainability Metric';
    }
  };

  useEffect(() => {
    if (initialData) {
      const dateStr = initialData.record_date.includes('T')
        ? initialData.record_date.split('T')[0]
        : initialData.record_date;
      setRecordDate(dateStr);

      setEnergy(String(initialData.energy_consumption));
      setWater(String(initialData.water_consumption));
      setWasteGen(String(initialData.waste_generated));
      setWasteRec(String(initialData.waste_recycled));
      setCarbon(String(initialData.carbon_emissions));
      setRenewablePct(String(initialData.renewable_energy_percentage));

      setEmployees(String(initialData.employees));
      setTrainingHours(String(initialData.training_hours));
      setSafetyIncidents(String(initialData.safety_incidents));
      setCommunityInitiatives(String(initialData.community_initiatives));

      setCompliancePct(String(initialData.compliance_percentage));
      setEthicsIncidents(String(initialData.ethics_incidents));
      setGovScore(String(initialData.governance_score));

      if (initialData.custom_metrics) {
        const keys = Object.keys(initialData.custom_metrics);
        if (keys.length > 0) {
          setOrgMetricKey(keys[0]);
          setOrgMetricValue(String(initialData.custom_metrics[keys[0]]));
        }
      }
    } else {
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      setRecordDate(`${organization?.reporting_year || now.getFullYear()}-${month}-01`);

      setEnergy('');
      setWater('');
      setWasteGen('');
      setWasteRec('');
      setCarbon('');
      setRenewablePct('');

      setEmployees('');
      setTrainingHours('');
      setSafetyIncidents('0');
      setCommunityInitiatives('0');

      setCompliancePct('');
      setEthicsIncidents('0');
      setGovScore('');

      setOrgMetricKey(getOrgMetricLabel(organization?.type));
      setOrgMetricValue('');
    }
    setError(null);
    setActiveTab('env');
  }, [initialData, organization, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!recordDate) {
      setError('Record date is required');
      return;
    }

    const numEnergy = parseFloat(energy);
    const numWater = parseFloat(water);
    const numWasteGen = parseFloat(wasteGen);
    const numWasteRec = parseFloat(wasteRec);
    const numCarbon = parseFloat(carbon);
    const numRenewable = parseFloat(renewablePct);

    const numEmp = parseInt(employees, 10);
    const numTraining = parseFloat(trainingHours);
    const numSafety = parseInt(safetyIncidents, 10);
    const numCommunity = parseInt(communityInitiatives, 10);

    const numCompliance = parseFloat(compliancePct);
    const numEthics = parseInt(ethicsIncidents, 10);
    const numGov = parseFloat(govScore);

    if (
      isNaN(numEnergy) || isNaN(numWater) || isNaN(numWasteGen) || isNaN(numWasteRec) ||
      isNaN(numCarbon) || isNaN(numRenewable) || isNaN(numEmp) || isNaN(numTraining) ||
      isNaN(numSafety) || isNaN(numCommunity) || isNaN(numCompliance) || isNaN(numEthics) ||
      isNaN(numGov)
    ) {
      setError('Please fill in all numerical ESG fields with valid numbers');
      return;
    }

    if (
      numEnergy < 0 || numWater < 0 || numWasteGen < 0 || numWasteRec < 0 ||
      numCarbon < 0 || numTraining < 0 || numSafety < 0 || numCommunity < 0 ||
      numEthics < 0
    ) {
      setError('Negative values are not allowed for consumption, incidents, or volume metrics');
      return;
    }

    if (numEmp < 1) {
      setError('Number of employees must be at least 1');
      return;
    }

    if (numRenewable < 0 || numRenewable > 100) {
      setError('Renewable Energy Percentage must be between 0% and 100%');
      return;
    }

    if (numCompliance < 0 || numCompliance > 100) {
      setError('Compliance Percentage must be between 0% and 100%');
      return;
    }

    if (numGov < 0 || numGov > 100) {
      setError('Governance Score must be between 0 and 100');
      return;
    }

    if (numWasteRec > numWasteGen) {
      setError('Waste recycled cannot exceed total waste generated');
      return;
    }

    const customMetrics: Record<string, any> = {};
    if (orgMetricKey && orgMetricValue) {
      customMetrics[orgMetricKey] = isNaN(Number(orgMetricValue)) ? orgMetricValue : Number(orgMetricValue);
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        record_date: recordDate,
        energy_consumption: numEnergy,
        water_consumption: numWater,
        waste_generated: numWasteGen,
        waste_recycled: numWasteRec,
        carbon_emissions: numCarbon,
        renewable_energy_percentage: numRenewable,
        employees: numEmp,
        training_hours: numTraining,
        safety_incidents: numSafety,
        community_initiatives: numCommunity,
        compliance_percentage: numCompliance,
        ethics_incidents: numEthics,
        governance_score: numGov,
        custom_metrics: customMetrics,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save ESG record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '720px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #E2E8F0' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#17201C', fontWeight: 600 }}>
              <span style={{ color: '#087F5B' }}>{initialData ? 'Edit' : 'Add'}</span> Monthly ESG Record
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
              Organization: <strong style={{ color: '#17201C' }}>{organization?.name}</strong> ({organization?.type})
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', padding: '0 20px', overflowX: 'auto' }}>
          <button
            type="button"
            onClick={() => setActiveTab('env')}
            style={{
              padding: '11px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'env' ? '2px solid #087F5B' : '2px solid transparent',
              color: activeTab === 'env' ? '#087F5B' : '#64748B',
              fontWeight: 600,
              fontSize: '0.825rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <Leaf size={15} /> Environmental
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('soc')}
            style={{
              padding: '11px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'soc' ? '2px solid #2563EB' : '2px solid transparent',
              color: activeTab === 'soc' ? '#2563EB' : '#64748B',
              fontWeight: 600,
              fontSize: '0.825rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <Users size={15} /> Social
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gov')}
            style={{
              padding: '11px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'gov' ? '2px solid #4F46E5' : '2px solid transparent',
              color: activeTab === 'gov' ? '#4F46E5' : '#64748B',
              fontWeight: 600,
              fontSize: '0.825rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <ShieldCheck size={15} /> Governance
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('org')}
            style={{
              padding: '11px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'org' ? '2px solid #D97706' : '2px solid transparent',
              color: activeTab === 'org' ? '#D97706' : '#64748B',
              fontWeight: 600,
              fontSize: '0.825rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <PlusCircle size={15} /> Sector Custom
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && (
            <div style={{ padding: '12px 16px', background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px', color: '#DC2626', fontSize: '0.85rem', marginBottom: '18px' }}>
              {error}
            </div>
          )}

          {/* Record Date Selection (Visible across all tabs) */}
          <div style={{ marginBottom: '18px', paddingBottom: '16px', borderBottom: '1px solid #E2E8F0' }}>
            <label className="form-label">Record Date / Reporting Month *</label>
            <input
              type="date"
              className="form-input"
              value={recordDate}
              onChange={e => setRecordDate(e.target.value)}
              required
              style={{ maxWidth: '240px' }}
            />
          </div>

          {/* TAB 1: ENVIRONMENTAL */}
          {activeTab === 'env' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="form-label">Energy Consumption (kWh) *</label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  placeholder="e.g. 45000"
                  value={energy}
                  onChange={e => setEnergy(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Water Consumption (Litres) *</label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  placeholder="e.g. 120000"
                  value={water}
                  onChange={e => setWater(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Waste Generated (kg) *</label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  placeholder="e.g. 8000"
                  value={wasteGen}
                  onChange={e => setWasteGen(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Waste Recycled (kg) *</label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  placeholder="e.g. 3200 (must be <= waste generated)"
                  value={wasteRec}
                  onChange={e => setWasteRec(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Carbon Emissions (kg CO2e) *</label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  placeholder="e.g. 18500"
                  value={carbon}
                  onChange={e => setCarbon(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Renewable Energy (%) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  className="form-input"
                  placeholder="e.g. 35.0 (0 - 100%)"
                  value={renewablePct}
                  onChange={e => setRenewablePct(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* TAB 2: SOCIAL */}
          {activeTab === 'soc' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="form-label">Total Workforce / Employees *</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  placeholder="e.g. 350"
                  value={employees}
                  onChange={e => setEmployees(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Total Employee Training Hours *</label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  placeholder="e.g. 800"
                  value={trainingHours}
                  onChange={e => setTrainingHours(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Workplace Safety Incidents *</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  placeholder="e.g. 0"
                  value={safetyIncidents}
                  onChange={e => setSafetyIncidents(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Community Sustainability Initiatives *</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  placeholder="e.g. 2"
                  value={communityInitiatives}
                  onChange={e => setCommunityInitiatives(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* TAB 3: GOVERNANCE */}
          {activeTab === 'gov' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="form-label">Regulatory Compliance (%) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  className="form-input"
                  placeholder="e.g. 98.5 (0 - 100%)"
                  value={compliancePct}
                  onChange={e => setCompliancePct(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Ethics & Compliance Violations *</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  placeholder="e.g. 0"
                  value={ethicsIncidents}
                  onChange={e => setEthicsIncidents(e.target.value)}
                  required
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Governance & Oversight Score (0 - 100) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  className="form-input"
                  placeholder="e.g. 88.0"
                  value={govScore}
                  onChange={e => setGovScore(e.target.value)}
                  required
                />
                <p style={{ fontSize: '0.725rem', color: '#64748B', marginTop: '4px' }}>
                  Based on board independence, transparency audits, and data privacy policies.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: SECTOR CUSTOM */}
          {activeTab === 'org' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '12px 14px', borderRadius: '8px', background: '#FEF3C7', border: '1px solid #FDE68A', fontSize: '0.8rem', color: '#B45309' }}>
                Optional organization-specific metric tailored for <strong>{organization?.type}</strong> organizations.
              </div>

              <div>
                <label className="form-label">Custom Metric Label</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Metric Name"
                  value={orgMetricKey}
                  onChange={e => setOrgMetricKey(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">Custom Metric Value</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Value"
                  value={orgMetricValue}
                  onChange={e => setOrgMetricValue(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #E2E8F0', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
              * Records are validated against database constraints
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                <Check size={16} />
                {isSubmitting ? 'Saving Record...' : initialData ? 'Update ESG Record' : 'Save ESG Record'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
