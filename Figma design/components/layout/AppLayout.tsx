
import { ReactNode, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../ui/button';
import { Menu, X, LayoutDashboard, Calculator, Users, Settings, LogOut, ClipboardCheck, Building, ListChecks } from 'lucide-react';

type NavItem = {
  label: string;
  icon: ReactNode;
  href: string;
  adminOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard size={18} />, href: '/' },
  { label: 'Cost Calculations', icon: <Calculator size={18} />, href: '/cost-calculation' },
  { label: 'Price Lists', icon: <Calculator size={18} />, href: '/price-list' },
  { label: 'Customers & Assets', icon: <Building size={18} />, href: '/customers' },
  { label: 'Building Checklist', icon: <ClipboardCheck size={18} />, href: '/checklist' },
  { label: 'Manage Users', icon: <Users size={18} />, href: '/admin/users', adminOnly: true },
  { label: 'Settings', icon: <Settings size={18} />, href: '/admin/settings', adminOnly: true },
];

type AppLayoutProps = {
  children: ReactNode;
  currentPage: string;
  onNavigate: (href: string) => void;
};

export function AppLayout({ children, currentPage, onNavigate }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();

  // Filter nav items based on user role
  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (item.adminOnly && !isAdmin) return false;
    return true;
  });

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    onNavigate(href);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h1 className="font-medium">Acron Energy Tools</h1>
        </div>
        
        <div className="flex items-center">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-foreground text-primary rounded-full flex items-center justify-center">
                {user?.name.charAt(0)}
              </div>
              <span>{user?.name}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logout} 
              className="text-primary-foreground hover:text-primary-foreground hover:bg-primary/80"
            >
              <LogOut size={18} className="mr-1" /> Sign Out
            </Button>
          </div>
          
          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-primary-foreground hover:text-primary-foreground hover:bg-primary/80"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </header>
      
      <div className="flex flex-1">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:block w-64 bg-sidebar border-r border-sidebar-border">
          <div className="pt-5 px-5 pb-4">
            <h2 className="text-xl font-medium">Acron Energy Tools</h2>
          </div>
          <nav className="py-4 px-3">
            <ul className="space-y-1">
              {filteredNavItems.map((item) => (
                <li key={item.label}>
                  <Button
                    variant={currentPage === item.href ? "secondary" : "ghost"}
                    onClick={() => handleNavClick(item.href)}
                    className={`w-full justify-start ${
                      currentPage === item.href 
                        ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        
        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-background">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h2 className="font-medium">Acron Energy Tools</h2>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X size={24} />
                </Button>
              </div>
              
              <div className="p-4 border-b">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                    {user?.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium">{user?.name}</div>
                    <div className="text-sm text-muted-foreground">{user?.email}</div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={logout} 
                  className="w-full"
                >
                  <LogOut size={18} className="mr-2" /> Sign Out
                </Button>
              </div>
              
              <nav className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-1">
                  {filteredNavItems.map((item) => (
                    <li key={item.label}>
                      <Button
                        variant={currentPage === item.href ? "secondary" : "ghost"}
                        onClick={() => handleNavClick(item.href)}
                        className="w-full justify-start"
                      >
                        <span className="mr-2">{item.icon}</span>
                        {item.label}
                      </Button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        )}
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
