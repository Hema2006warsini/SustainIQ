import React, { useState, useEffect } from 'react';
import { X, Building2, Check } from 'lucide-react';
import { Organization } from '../../types';

interface OrgFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Organization>) => Promise<void>;
  initialData?: Organization | null;
}

const PREDEFINED_TYPES = [
  'Hospital',
  'Bank',
  'College / University',
  'Corporate / Company',
  'Manufacturing',
  'Government Organization',
  'Other',
];

export const OrgFormModal: React.FC<OrgFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState('Corporate / Company');
  const [customType, setCustomType] = useState('');
  const [location, setLocation] = useState('');
  const [reportingYear, setReportingYear] = useState<number>(new Date().getFullYear());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setLocation(initialData.location);
      setReportingYear(initialData.reporting_year);
      if (PREDEFINED_TYPES.includes(initialData.type)) {
        setSelectedType(initialData.type);
        setCustomType('');
      } else {
        setSelectedType('Other');
        setCustomType(initialData.type);
      }
    } else {
      setName('');
      setSelectedType('Corporate / Company');
      setCustomType('');
      setLocation('');
      setReportingYear(new Date().getFullYear());
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Organization name is required');
      return;
    }
    if (!location.trim()) {
      setError('Location is required');
      return;
    }

    const finalType = selectedType === 'Other' ? customType.trim() : selectedType;
    if (selectedType === 'Other' && !finalType) {
      setError('Please specify your custom organization type');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: name.trim(),
        type: finalType,
        location: location.trim(),
        reporting_year: Number(reportingYear),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save organization');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#EBF5F0', padding: '8px', borderRadius: '8px' }}>
              <Building2 size={20} color="#087F5B" />
            </div>
            <h3 style={{ fontSize: '1.15rem', color: '#17201C', fontWeight: 600 }}>
              {initialData ? 'Edit Organization' : 'Create Organization Profile'}
            </h3>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && (
            <div style={{ padding: '12px 16px', background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px', color: '#DC2626', fontSize: '0.85rem', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Organization Name */}
            <div>
              <label className="form-label">Organization Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Apex Global Health, Horizon Financial, GreenTech Ltd"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            {/* Organization Type */}
            <div>
              <label className="form-label">Organization Type *</label>
              <select
                className="form-select"
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
              >
                {PREDEFINED_TYPES.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Conditional "Enter Organization Type" when "Other" is selected */}
            {selectedType === 'Other' && (
              <div>
                <label className="form-label">Enter Organization Type *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Non-Profit NGO, Aviation, Logistics"
                  value={customType}
                  onChange={e => setCustomType(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Location */}
            <div>
              <label className="form-label">Location (City, Country / State) *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. New York, USA or London, UK"
                value={location}
                onChange={e => setLocation(e.target.value)}
                required
              />
            </div>

            {/* Reporting Year */}
            <div>
              <label className="form-label">Reporting Year *</label>
              <input
                type="number"
                className="form-input"
                min="1990"
                max="2100"
                value={reportingYear}
                onChange={e => setReportingYear(Number(e.target.value))}
                required
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              <Check size={16} />
              {isSubmitting ? 'Saving...' : initialData ? 'Update Organization' : 'Create Organization'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
