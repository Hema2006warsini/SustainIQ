import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Organization } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface OrganizationContextType {
  organizations: Organization[];
  currentOrg: Organization | null;
  setCurrentOrg: (org: Organization | null) => void;
  selectOrgById: (id: string) => void;
  refreshOrganizations: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

const SELECTED_ORG_KEY = 'sustainiq_selected_org_id';

export const OrganizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshOrganizations = async () => {
    if (!isAuthenticated) {
      setOrganizations([]);
      setCurrentOrg(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const orgs = await api.getOrganizations();
      setOrganizations(orgs);

      // Preserve previously selected org if valid for this user
      const savedId = localStorage.getItem(`${SELECTED_ORG_KEY}_${user?.id || 'current'}`);
      if (savedId) {
        const found = orgs.find(o => o.id === savedId);
        if (found) {
          setCurrentOrg(found);
        } else if (orgs.length > 0) {
          setCurrentOrg(orgs[0]);
          localStorage.setItem(`${SELECTED_ORG_KEY}_${user?.id || 'current'}`, orgs[0].id);
        } else {
          setCurrentOrg(null);
          localStorage.removeItem(`${SELECTED_ORG_KEY}_${user?.id || 'current'}`);
        }
      } else if (orgs.length > 0) {
        setCurrentOrg(orgs[0]);
        localStorage.setItem(`${SELECTED_ORG_KEY}_${user?.id || 'current'}`, orgs[0].id);
      } else {
        setCurrentOrg(null);
      }
    } catch (err: any) {
      // If 401 unauthenticated, clear gracefully
      if (err.message?.includes('401') || err.message?.includes('Authentication')) {
        setOrganizations([]);
        setCurrentOrg(null);
      } else {
        setError(err.message || 'Failed to load organizations');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectOrgById = (id: string) => {
    const found = organizations.find(o => o.id === id);
    if (found) {
      setCurrentOrg(found);
      localStorage.setItem(`${SELECTED_ORG_KEY}_${user?.id || 'current'}`, found.id);
    }
  };

  const handleSetCurrentOrg = (org: Organization | null) => {
    setCurrentOrg(org);
    if (org) {
      localStorage.setItem(`${SELECTED_ORG_KEY}_${user?.id || 'current'}`, org.id);
    } else {
      localStorage.removeItem(`${SELECTED_ORG_KEY}_${user?.id || 'current'}`);
    }
  };

  // Re-fetch when authentication status or user ID changes
  useEffect(() => {
    if (isAuthenticated) {
      refreshOrganizations();
    } else {
      setOrganizations([]);
      setCurrentOrg(null);
    }
  }, [isAuthenticated, user?.id]);

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        currentOrg,
        setCurrentOrg: handleSetCurrentOrg,
        selectOrgById,
        refreshOrganizations,
        isLoading,
        error,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
