
import { useState } from 'react';
import { ArrowLeftIcon, PlusIcon, Save, Trash2, UserPlus, Building, Tag, Search, Filter, X } from 'lucide-react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useCustomers, Customer, Asset } from './CustomerContext';
import { useTags } from '../tags/TagContext';
import { formatDistanceToNow } from 'date-fns';

type CustomerManagementProps = {
  onBack: () => void;
  onNavigate: (href: string) => void;
};

export default function CustomerManagement({ onBack, onNavigate }: CustomerManagementProps) {
  const { customers, assets, addCustomer, updateCustomer, deleteCustomer, getCustomerAssets } = useCustomers();
  const { tags } = useTags();
  
  const [activeTab, setActiveTab] = useState<'customers' | 'assets'>('customers');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // New customer form state
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '',
    orgNumber: '',
    address: '',
    contactPerson: {
      name: '',
      email: '',
      phone: '',
      role: ''
    },
    tags: []
  });
  
  // Filter customers based on search term and tags
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = searchTerm === '' || 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.orgNumber.includes(searchTerm) ||
      customer.address.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tagId => customer.tags.includes(tagId));
      
    return matchesSearch && matchesTags;
  });
  
  // Filter assets based on search term and tags
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = searchTerm === '' ||
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.address?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.every(tagId => asset.tags.includes(tagId));
      
    return matchesSearch && matchesTags;
  });
  
  // Handle adding new customer
  const handleAddCustomer = () => {
    if (!newCustomer.name || !newCustomer.orgNumber) return;
    
    addCustomer(newCustomer as Omit<Customer, 'id' | 'created' | 'createdBy' | 'createdByName'>);
    setNewCustomer({
      name: '',
      orgNumber: '',
      address: '',
      contactPerson: {
        name: '',
        email: '',
        phone: '',
        role: ''
      },
      tags: []
    });
    setShowAddCustomer(false);
  };
  
  // Toggle tag selection for filtering
  const toggleTagFilter = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };
  
  // Toggle tag for new customer
  const toggleCustomerTag = (tagId: string) => {
    const currentTags = newCustomer.tags || [];
    if (currentTags.includes(tagId)) {
      setNewCustomer({
        ...newCustomer,
        tags: currentTags.filter(id => id !== tagId)
      });
    } else {
      setNewCustomer({
        ...newCustomer,
        tags: [...currentTags, tagId]
      });
    }
  };
  
  // Handle customer click - navigate to details page
  const handleCustomerClick = (customerId: string) => {
    onNavigate(`/customers/detail?id=${customerId}`);
  };
  
  // Handle asset click - navigate to details page
  const handleAssetClick = (assetId: string) => {
    onNavigate(`/assets/detail?id=${assetId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <h2>Kunde og asset database</h2>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Søk etter navn, adresse..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
              {selectedTags.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {selectedTags.length}
                </Badge>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filter</DialogTitle>
              <DialogDescription>
                Filter data basert på tags
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <Badge 
                      key={tag.id}
                      variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                      className={`cursor-pointer ${selectedTags.includes(tag.id) ? tag.color : ''}`}
                      onClick={() => toggleTagFilter(tag.id)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="ghost" 
                onClick={() => setSelectedTags([])}
                disabled={selectedTags.length === 0}
              >
                Clear All
              </Button>
              <Button onClick={() => {}}>Apply</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Button onClick={() => setShowAddCustomer(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          New Customer
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'customers' | 'assets')}>
        <TabsList>
          <TabsTrigger value="customers">
            <UserPlus className="mr-2 h-4 w-4" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="assets">
            <Building className="mr-2 h-4 w-4" />
            Assets
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="customers" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Org Number</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Assets</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map(customer => {
                    const customerAssets = getCustomerAssets(customer.id);
                    return (
                      <TableRow 
                        key={customer.id}
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => handleCustomerClick(customer.id)}
                      >
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.orgNumber}</TableCell>
                        <TableCell>
                          <div>
                            <div>{customer.contactPerson.name}</div>
                            <div className="text-sm text-muted-foreground">{customer.contactPerson.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {customer.tags.map(tagId => {
                              const tag = tags.find(t => t.id === tagId);
                              return tag ? (
                                <Badge key={tag.id} className={tag.color}>
                                  {tag.name}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </TableCell>
                        <TableCell>{customerAssets.length}</TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {formatDistanceToNow(customer.created, { addSuffix: true })}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="assets" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      No assets found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssets.map(asset => {
                    const customer = customers.find(c => c.id === asset.customerId);
                    return (
                      <TableRow 
                        key={asset.id}
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => handleAssetClick(asset.id)}
                      >
                        <TableCell className="font-medium">{asset.name}</TableCell>
                        <TableCell>{customer?.name || 'Unknown'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {asset.type === 'building' ? 'Building' : 
                             asset.type === 'technical-system' ? 'Technical System' : 'Other'}
                          </Badge>
                        </TableCell>
                        <TableCell>{asset.address || '-'}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {asset.tags.map(tagId => {
                              const tag = tags.find(t => t.id === tagId);
                              return tag ? (
                                <Badge key={tag.id} className={tag.color}>
                                  {tag.name}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {formatDistanceToNow(asset.created, { addSuffix: true })}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
      
      <Dialog open={showAddCustomer} onOpenChange={setShowAddCustomer}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Enter customer information to add to the database.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label>Customer Name</label>
              <Input 
                placeholder="Company Name" 
                value={newCustomer.name || ''}
                onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label>Organization Number</label>
              <Input 
                placeholder="123456789" 
                value={newCustomer.orgNumber || ''}
                onChange={(e) => setNewCustomer({...newCustomer, orgNumber: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label>Address</label>
              <Input 
                placeholder="Street, City, Postal Code" 
                value={newCustomer.address || ''}
                onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label>Contact Person</label>
              <Input 
                placeholder="Full Name" 
                value={newCustomer.contactPerson?.name || ''}
                onChange={(e) => setNewCustomer({
                  ...newCustomer, 
                  contactPerson: {...(newCustomer.contactPerson || {}), name: e.target.value}
                })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <label>Email</label>
                <Input 
                  type="email"
                  placeholder="email@company.com" 
                  value={newCustomer.contactPerson?.email || ''}
                  onChange={(e) => setNewCustomer({
                    ...newCustomer, 
                    contactPerson: {...(newCustomer.contactPerson || {}), email: e.target.value}
                  })}
                />
              </div>
              <div className="space-y-2">
                <label>Phone</label>
                <Input 
                  placeholder="+00 123 45 678" 
                  value={newCustomer.contactPerson?.phone || ''}
                  onChange={(e) => setNewCustomer({
                    ...newCustomer, 
                    contactPerson: {...(newCustomer.contactPerson || {}), phone: e.target.value}
                  })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label>Role</label>
              <Input 
                placeholder="Role or Position" 
                value={newCustomer.contactPerson?.role || ''}
                onChange={(e) => setNewCustomer({
                  ...newCustomer, 
                  contactPerson: {...(newCustomer.contactPerson || {}), role: e.target.value}
                })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </label>
              <div className="flex flex-wrap gap-1 border rounded-md p-2">
                {tags.map(tag => (
                  <Badge 
                    key={tag.id}
                    variant={newCustomer.tags?.includes(tag.id) ? "default" : "outline"}
                    className={`cursor-pointer ${newCustomer.tags?.includes(tag.id) ? tag.color : ''}`}
                    onClick={() => toggleCustomerTag(tag.id)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCustomer(false)}>Cancel</Button>
            <Button onClick={handleAddCustomer}>Add Customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
