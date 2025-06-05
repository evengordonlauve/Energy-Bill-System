
import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useCalculations, SavedCalculation } from '../calculations/CalculationContext';
import { useCustomers } from '../customers/CustomerContext';
import { useChecklists, Checklist } from '../checklists/ChecklistContext';
import { useTags } from '../tags/TagContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { CalculatorIcon, ListIcon, PlusIcon, Clock, Users, Building, ClipboardCheck, Tag as TagIcon } from 'lucide-react';
import { Badge } from '../ui/badge';
import { formatDistanceToNow } from 'date-fns';

type DashboardProps = {
  onNavigate: (href: string) => void;
};

export function Dashboard({ onNavigate }: DashboardProps) {
  const { user, isAdmin } = useAuth();
  const { calculations } = useCalculations();
  const { customers, assets } = useCustomers();
  const { checklists } = useChecklists();
  const { tags } = useTags();
  const [activeTab, setActiveTab] = useState<'all' | 'cost' | 'price' | 'customers' | 'checklists'>('all');

  // Get calculations for the current user
  const userCalculations = user ? calculations.filter(calc => calc.createdBy === user.id) : [];
  
  // Get recent customers
  const recentCustomers = customers.slice(0, 5);
  
  // Get recent checklists
  const recentChecklists = checklists.slice(0, 5);
  
  // Filter based on active tab
  const getFilteredItems = () => {
    switch(activeTab) {
      case 'cost':
        return userCalculations.filter(calc => calc.type === 'cost-calculation');
      case 'price':
        return userCalculations.filter(calc => calc.type === 'price-list');
      case 'all':
      default:
        return userCalculations;
    }
  };
  
  const filteredItems = getFilteredItems();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h1>Dashboard</h1>
          <p className="text-muted-foreground">
            {user?.name ? `Welcome back, ${user.name}` : 'Welcome to the Calculation Portal'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => onNavigate('/cost-calculation')}>
            <CalculatorIcon className="mr-2 h-4 w-4" />
            Cost Calculator
          </Button>
          <Button onClick={() => onNavigate('/price-list')}>
            <ListIcon className="mr-2 h-4 w-4" />
            Price List
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Calculations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCalculations.length}</div>
            <p className="text-xs text-muted-foreground">
              {userCalculations.filter(calc => calc.type === 'cost-calculation').length} cost calculations, 
              {userCalculations.filter(calc => calc.type === 'price-list').length} price lists
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" onClick={() => setActiveTab('all')}>
              View all calculations
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">
              {assets.length} assets registered
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" onClick={() => onNavigate('/customers')}>
              Manage customers
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Checklists</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{checklists.length}</div>
            <p className="text-xs text-muted-foreground">
              {checklists.filter(c => c.status === 'completed').length} completed, 
              {checklists.filter(c => c.status === 'in-progress').length} in progress
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" onClick={() => onNavigate('/checklist')}>
              New checklist
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList>
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="cost">Cost Calculations</TabsTrigger>
          <TabsTrigger value="price">Price Lists</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="checklists">Checklists</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Recently Created</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-accent/30 border-dashed cursor-pointer hover:bg-accent/50 transition-colors">
              <CardContent className="h-full flex items-center justify-center p-6" onClick={() => onNavigate('/cost-calculation')}>
                <div className="text-center">
                  <PlusIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p>Create New Calculation</p>
                </div>
              </CardContent>
            </Card>
            
            {[...userCalculations, ...recentChecklists]
              .sort((a, b) => {
                // Get created date safely from both types
                const dateA = 'createdAt' in a ? a.createdAt : a.created;
                const dateB = 'createdAt' in b ? b.createdAt : b.created;
                
                return new Date(dateB).getTime() - new Date(dateA).getTime();
              })
              .slice(0, 5).map(item => {
                if ('type' in item) {
                  // It's a calculation
                  const calculation = item as SavedCalculation;
                  return (
                    <CalculationCard
                      key={calculation.id}
                      calculation={calculation}
                      onOpen={() => {
                        if (calculation.type === 'cost-calculation') {
                          onNavigate(`/cost-calculation?id=${calculation.id}`);
                        } else {
                          onNavigate(`/price-list?id=${calculation.id}`);
                        }
                      }}
                      tags={tags}
                    />
                  );
                } else {
                  // It's a checklist
                  const checklist = item as Checklist;
                  return (
                    <ChecklistCard
                      key={checklist.id}
                      checklist={checklist}
                      onOpen={() => onNavigate(`/checklist?id=${checklist.id}`)}
                      customer={customers.find(c => c.id === checklist.customerId)}
                      tags={tags}
                    />
                  );
                }
              })}
          </div>
        </TabsContent>
        
        <TabsContent value="cost" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-accent/30 border-dashed cursor-pointer hover:bg-accent/50 transition-colors">
              <CardContent className="h-full flex items-center justify-center p-6" onClick={() => onNavigate('/cost-calculation')}>
                <div className="text-center">
                  <PlusIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p>Create New Cost Calculation</p>
                </div>
              </CardContent>
            </Card>
            
            {filteredItems.map(calculation => (
              <CalculationCard
                key={calculation.id}
                calculation={calculation}
                onOpen={() => onNavigate(`/cost-calculation?id=${calculation.id}`)}
                tags={tags}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="price" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-accent/30 border-dashed cursor-pointer hover:bg-accent/50 transition-colors">
              <CardContent className="h-full flex items-center justify-center p-6" onClick={() => onNavigate('/price-list')}>
                <div className="text-center">
                  <PlusIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p>Create New Price List</p>
                </div>
              </CardContent>
            </Card>
            
            {filteredItems.map(calculation => (
              <CalculationCard
                key={calculation.id}
                calculation={calculation}
                onOpen={() => onNavigate(`/price-list?id=${calculation.id}`)}
                tags={tags}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-accent/30 border-dashed cursor-pointer hover:bg-accent/50 transition-colors">
              <CardContent className="h-full flex items-center justify-center p-6" onClick={() => onNavigate('/customers')}>
                <div className="text-center">
                  <PlusIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p>Add New Customer</p>
                </div>
              </CardContent>
            </Card>
            
            {recentCustomers.map(customer => (
              <Card key={customer.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate(`/customers/detail?id=${customer.id}`)}>
                <CardHeader>
                  <CardTitle className="text-base">{customer.name}</CardTitle>
                  <CardDescription>{customer.orgNumber}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      <Building className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{assets.filter(a => a.customerId === customer.id).length} assets</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {customer.tags.map(tagId => {
                        const tagObj = tags.find(t => t.id === tagId);
                        return tagObj ? (
                          <Badge key={tagObj.id} variant="secondary" className={tagObj.color}>
                            {tagObj.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    View Customer
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="checklists" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-accent/30 border-dashed cursor-pointer hover:bg-accent/50 transition-colors">
              <CardContent className="h-full flex items-center justify-center p-6" onClick={() => onNavigate('/checklist')}>
                <div className="text-center">
                  <PlusIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p>Create New Checklist</p>
                </div>
              </CardContent>
            </Card>
            
            {recentChecklists.map(checklist => (
              <ChecklistCard
                key={checklist.id}
                checklist={checklist}
                onOpen={() => onNavigate(`/checklist?id=${checklist.id}`)}
                customer={customers.find(c => c.id === checklist.customerId)}
                tags={tags}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      {isAdmin && (
        <div className="space-y-4 pt-4">
          <h2>Administration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage users and access control</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="outline" onClick={() => onNavigate('/admin/users')}>
                  Manage Users
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure system preferences</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="outline" onClick={() => onNavigate('/admin/settings')}>
                  Settings
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

// Card component for a calculation
function CalculationCard({ 
  calculation, 
  onOpen, 
  tags
}: { 
  calculation: SavedCalculation, 
  onOpen: () => void,
  tags: any[]
}) {
  const calcType = calculation.type === 'cost-calculation' ? 'Cost Distribution' : 'Price List';
  const icon = calculation.type === 'cost-calculation' ? <CalculatorIcon className="h-4 w-4" /> : <ListIcon className="h-4 w-4" />;
  
  const getSummary = () => {
    if (calculation.type === 'cost-calculation') {
      const tenantCount = calculation.data.tenants?.length || 0;
      return `${tenantCount} tenant${tenantCount !== 1 ? 's' : ''}`;
    } else {
      const itemCount = calculation.data.priceList?.filter((item: any) => item.quantity > 0).length || 0;
      const total = calculation.data.totals?.hardware || 0;
      return `${itemCount} item${itemCount !== 1 ? 's' : ''} · ${total.toLocaleString('no-NO')} kr`;
    }
  };
  
  // Add safe date handling
  const formatDate = (date: any) => {
    try {
      if (!date) return 'Unknown date';
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onOpen}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">{calculation.name}</CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            {icon}
            <span>{calcType}</span>
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-1">
          <Clock className="h-3 w-3" /> 
          <span>{formatDate(calculation.createdAt)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-muted-foreground" /> 
            <span>Created by: {calculation.createdByName}</span>
          </div>
          
          {calculation.groups && calculation.groups.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {calculation.groups.map(groupId => (
                <Badge key={groupId} variant="secondary" className="text-xs">
                  {groupId}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex flex-wrap gap-1 mt-2">
            {calculation.tags && calculation.tags.map(tagId => {
              const tag = tags.find(t => t.id === tagId);
              return tag ? (
                <Badge key={tagId} variant="secondary" className={tag.color + " text-xs"}>
                  {tag.name}
                </Badge>
              ) : null;
            })}
          </div>
          
          <p className="mt-2 text-muted-foreground">{getSummary()}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full">
          Open Calculation
        </Button>
      </CardFooter>
    </Card>
  );
}

// Card component for a checklist
function ChecklistCard({ 
  checklist, 
  onOpen, 
  customer,
  tags
}: { 
  checklist: Checklist, 
  onOpen: () => void,
  customer?: any,
  tags: any[]
}) {
  const getProgressPercentage = () => {
    const responseCount = Object.keys(checklist.responses).length;
    // This is a simplification - in reality we'd calculate based on required fields
    return Math.min(Math.floor((responseCount / 20) * 100), 100);
  };
  
  const progress = getProgressPercentage();
  
  // Add safe date handling
  const formatDate = (date: any) => {
    try {
      if (!date) return 'Unknown date';
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onOpen}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">{checklist.name}</CardTitle>
          <Badge variant={
            checklist.status === 'draft' ? 'outline' : 
            checklist.status === 'completed' ? 'default' : 
            'secondary'
          }>
            {checklist.status === 'draft' ? 'Draft' : 
             checklist.status === 'completed' ? 'Completed' : 
             'In Progress'}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-1">
          <Clock className="h-3 w-3" /> 
          <span>{formatDate(checklist.created)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Building className="h-3 w-3 text-muted-foreground" /> 
            <span>Customer: {customer?.name || 'Unknown'}</span>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {checklist.tags && checklist.tags.map(tagId => {
              const tag = tags.find(t => t.id === tagId);
              return tag ? (
                <Badge key={tagId} variant="secondary" className={tag.color + " text-xs"}>
                  {tag.name}
                </Badge>
              ) : null;
            })}
          </div>
          
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full">
          <ClipboardCheck className="mr-2 h-4 w-4" />
          {checklist.status === 'draft' ? 'Continue Draft' : 
           checklist.status === 'completed' ? 'View Checklist' : 
           'Continue Working'}
        </Button>
      </CardFooter>
    </Card>
  );
}
