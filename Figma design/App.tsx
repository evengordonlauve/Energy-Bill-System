
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './components/auth/AuthContext';
import { CalculationProvider } from './components/calculations/CalculationContext';
import { CustomerProvider } from './components/customers/CustomerContext';
import { TagProvider } from './components/tags/TagContext';
import { ChecklistProvider } from './components/checklists/ChecklistContext';
import { LoginPage } from './components/auth/LoginPage';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './components/dashboard/Dashboard';
import CostCalculator from './components/calculators/CostCalculator';
import PriceList from './components/calculators/PriceList';
import CustomerManagement from './components/customers/CustomerManagement';
import ChecklistForm from './components/checklists/ChecklistForm';
import UserManagement from './components/admin/UserManagement';
import Settings from './components/admin/Settings';
import { Toaster } from './components/ui/toast';

// Main Application
function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('/');
  const [currentParams, setCurrentParams] = useState<Record<string, string>>({});
  
  // Handle navigation with query parameters
  const handleNavigate = (href: string) => {
    // Parse URL and extract query params if any
    const [path, queryString] = href.split('?');
    const params: Record<string, string> = {};
    
    if (queryString) {
      const searchParams = new URLSearchParams(queryString);
      searchParams.forEach((value, key) => {
        params[key] = value;
      });
    }
    
    setCurrentPage(path);
    setCurrentParams(params);
  };

  // Render content based on current page
  const renderContent = () => {
    switch (currentPage) {
      case '/cost-calculation':
        return <CostCalculator onBack={() => handleNavigate('/')} calculationId={currentParams.id} />;
      case '/price-list':
        return <PriceList onBack={() => handleNavigate('/')} calculationId={currentParams.id} />;
      case '/customers':
        return <CustomerManagement onBack={() => handleNavigate('/')} onNavigate={handleNavigate} />;
      case '/checklist':
        return <ChecklistForm onBack={() => handleNavigate('/')} checklistId={currentParams.id} />;
      case '/admin/users':
        return <UserManagement onBack={() => handleNavigate('/')} />;
      case '/admin/settings':
        return <Settings onBack={() => handleNavigate('/')} />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Show main application content
  return (
    <AppLayout currentPage={currentPage} onNavigate={handleNavigate}>
      {renderContent()}
    </AppLayout>
  );
}

// Root component with Providers
export default function App() {
  return (
    <AuthProvider>
      <TagProvider>
        <CustomerProvider>
          <CalculationProvider>
            <ChecklistProvider>
              <AppContent />
              <Toaster />
            </ChecklistProvider>
          </CalculationProvider>
        </CustomerProvider>
      </TagProvider>
    </AuthProvider>
  );
}
