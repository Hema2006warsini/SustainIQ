import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OrganizationProvider, useOrganization } from './context/OrganizationContext';
import { Layout } from './components/layout/Layout';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { RecordsPage } from './pages/RecordsPage';
import { OrganizationsPage } from './pages/OrganizationsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OrgFormModal } from './components/organizations/OrgFormModal';
import { RecordFormModal } from './components/records/RecordFormModal';
import { Organization, ESGRecord } from './types';
import { api } from './services/api';
import { Leaf } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { currentOrg, organizations, refreshOrganizations, selectOrgById } = useOrganization();
  
  // Page state initialized with URL hash if present
  const [currentPage, setCurrentPage] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    if (['landing', 'dashboard', 'records', 'organizations', 'reports', 'settings', 'login', 'register'].includes(hash)) {
      return hash;
    }
    return 'landing';
  });

  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  // Modals
  const [isOrgModalOpen, setIsOrgModalOpen] = useState<boolean>(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<ESGRecord | null>(null);

  // Sync hash with page
  useEffect(() => {
    window.location.hash = currentPage;
  }, [currentPage]);

  // Handle hash changes from browser back/forward
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && hash !== currentPage) {
        setCurrentPage(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentPage]);

  // Route protection redirect checks
  useEffect(() => {
    if (isAuthLoading) return;

    const protectedPages = ['dashboard', 'records', 'organizations', 'reports', 'settings', 'methodology'];

    if (!isAuthenticated && protectedPages.includes(currentPage)) {
      // Redirect unauthenticated visitors attempting protected pages
      setCurrentPage('login');
    } else if (
      isAuthenticated &&
      (currentPage === 'login' || (currentPage === 'register' && !registrationComplete))
    ) {
      // Redirect authenticated users away from login / register
      setCurrentPage('dashboard');
    }
  }, [isAuthenticated, isAuthLoading, currentPage, registrationComplete]);

  useEffect(() => {
    if (currentPage !== 'register' && registrationComplete) {
      setRegistrationComplete(false);
    }
  }, [currentPage, registrationComplete]);

  // Trigger global data refresh
  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
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
    if (!isAuthenticated) {
      setCurrentPage('register');
    } else if (organizations.length === 0) {
      handleOpenNewOrgModal();
    } else {
      setCurrentPage('dashboard');
    }
  };

  // Initial Auth Loading Screen
  if (isAuthLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F8FAFC',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              background: '#087F5B',
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 8px 16px -4px rgba(8, 127, 91, 0.35)',
            }}
          >
            <Leaf size={32} color="#FFFFFF" />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#17201C', marginBottom: '8px' }}>
            SustainIQ
          </h2>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#64748B',
              fontSize: '0.85rem',
            }}
          >
            <span
              style={{
                width: '14px',
                height: '14px',
                border: '2px solid #087F5B',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                display: 'inline-block',
              }}
            />
            <span>Initializing session...</span>
          </div>
        </div>
      </div>
    );
  }

  // Standalone Auth Pages (Clean, focused UI matching requirements)
  if (currentPage === 'login') {
    return (
      <LoginPage
        onNavigate={setCurrentPage}
        onLoginSuccess={() => setCurrentPage('dashboard')}
      />
    );
  }

  if (currentPage === 'register') {
    return (
      <RegisterPage
        onNavigate={setCurrentPage}
        onRegisterSuccess={() => setRegistrationComplete(true)}
      />
    );
  }

  // App Layout with Navbar & Sidebar
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
    <AuthProvider>
      <OrganizationProvider>
        <AppContent />
      </OrganizationProvider>
    </AuthProvider>
  );
};

export default App;
