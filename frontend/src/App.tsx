import React, { useState } from 'react';
import { OrganizationProvider, useOrganization } from './context/OrganizationContext';
import { Layout } from './components/layout/Layout';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { RecordsPage } from './pages/RecordsPage';
import { OrganizationsPage } from './pages/OrganizationsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { OrgFormModal } from './components/organizations/OrgFormModal';
import { RecordFormModal } from './components/records/RecordFormModal';
import { Organization, ESGRecord } from './types';
import { api } from './services/api';

const AppContent: React.FC = () => {
  const { currentOrg, organizations, refreshOrganizations, selectOrgById } = useOrganization();
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Modals
  const [isOrgModalOpen, setIsOrgModalOpen] = useState<boolean>(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<ESGRecord | null>(null);

  // Trigger global data refresh
  const triggerRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Organization Modal Handlers
  const handleOpenNewOrgModal = () => {
    setEditingOrg(null);
    setIsOrgModalOpen(true);
  };

  const handleOpenEditOrgModal = (org: Organization) => {
    setEditingOrg(org);
    setIsOrgModalOpen(true);
  };

  const handleOrgSubmit = async (data: Partial<Organization>) => {
    if (editingOrg) {
      await api.updateOrganization(editingOrg.id, data);
    } else {
      const created = await api.createOrganization(data);
      await refreshOrganizations();
      selectOrgById(created.id);
      setCurrentPage('dashboard');
    }
    await refreshOrganizations();
    triggerRefresh();
  };

  // Record Modal Handlers
  const handleOpenAddRecordModal = () => {
    setEditingRecord(null);
    setIsRecordModalOpen(true);
  };

  const handleOpenEditRecordModal = (record: ESGRecord) => {
    setEditingRecord(record);
    setIsRecordModalOpen(true);
  };

  const handleRecordSubmit = async (data: Partial<ESGRecord>) => {
    if (!currentOrg) return;

    if (editingRecord) {
      await api.updateRecord(editingRecord.id, data);
    } else {
      await api.createRecord(currentOrg.id, data);
    }
    triggerRefresh();
  };

  const handleGetStarted = () => {
    if (organizations.length === 0) {
      handleOpenNewOrgModal();
    } else {
      setCurrentPage('dashboard');
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      onOpenNewOrgModal={handleOpenNewOrgModal}
    >
      {currentPage === 'landing' && (
        <LandingPage
          onGetStarted={handleGetStarted}
          onNavigate={setCurrentPage}
        />
      )}

      {currentPage === 'dashboard' && (
        <DashboardPage
          onOpenAddRecordModal={handleOpenAddRecordModal}
          onOpenEditRecordModal={handleOpenEditRecordModal}
          onOpenNewOrgModal={handleOpenNewOrgModal}
          onNavigate={setCurrentPage}
          refreshKey={refreshKey}
        />
      )}

      {currentPage === 'records' && (
        <RecordsPage
          onOpenAddRecordModal={handleOpenAddRecordModal}
          onOpenEditRecordModal={handleOpenEditRecordModal}
          refreshKey={refreshKey}
          onRecordDeleted={triggerRefresh}
        />
      )}

      {currentPage === 'organizations' && (
        <OrganizationsPage
          onOpenNewOrgModal={handleOpenNewOrgModal}
          onOpenEditOrgModal={handleOpenEditOrgModal}
        />
      )}

      {currentPage === 'reports' && (
        <ReportsPage />
      )}

      {(currentPage === 'settings' || currentPage === 'methodology') && (
        <SettingsPage />
      )}

      {/* Organization Modal */}
      <OrgFormModal
        isOpen={isOrgModalOpen}
        onClose={() => setIsOrgModalOpen(false)}
        onSubmit={handleOrgSubmit}
        initialData={editingOrg}
      />

      {/* ESG Record Modal */}
      <RecordFormModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSubmit={handleRecordSubmit}
        initialData={editingRecord}
        organization={currentOrg}
      />
    </Layout>
  );
};

export const App: React.FC = () => {
  return (
    <OrganizationProvider>
      <AppContent />
    </OrganizationProvider>
  );
};

export default App;
