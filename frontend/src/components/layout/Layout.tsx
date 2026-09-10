import React, { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenNewOrgModal: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  currentPage,
  onNavigate,
  onOpenNewOrgModal,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar
        currentPage={currentPage}
        onNavigate={onNavigate}
        onOpenNewOrgModal={onOpenNewOrgModal}
      />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar
          currentPage={currentPage}
          onNavigate={onNavigate}
        />

        <main style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 65px)' }}>
          {children}
        </main>
      </div>
    </div>
  );
};
