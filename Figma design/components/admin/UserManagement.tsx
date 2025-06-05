
import { useState } from 'react';
import { ArrowLeftIcon, PlusIcon, Save, Trash2, UserPlus } from 'lucide-react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

type User = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  groups: string[];
};

type Group = {
  id: string;
  name: string;
  description: string;
  calculations: string[];
};

// Mock initial data
const initialUsers: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@example.com', isAdmin: true, groups: ['all'] },
  { id: '2', name: 'Regular User', email: 'user@example.com', isAdmin: false, groups: ['basic', 'energy'] },
  { id: '3', name: 'Energy Manager', email: 'energy@example.com', isAdmin: false, groups: ['energy'] },
  { id: '4', name: 'Finance User', email: 'finance@example.com', isAdmin: false, groups: ['basic'] },
];

const initialGroups: Group[] = [
  { id: 'all', name: 'All Access', description: 'Access to all calculations and tools', calculations: ['cost-calculation', 'price-list'] },
  { id: 'basic', name: 'Basic', description: 'Access to cost calculations', calculations: ['cost-calculation'] },
  { id: 'energy', name: 'Energy', description: 'Access to energy-related tools', calculations: ['price-list'] },
];

// Available calculations
const availableCalculations = [
  { id: 'cost-calculation', name: 'Cost Distribution Calculator' },
  { id: 'price-list', name: 'Price List Calculator' },
];

export default function UserManagement({ onBack }: { onBack: () => void }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);
  
  // New user/group form states
  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({
    name: '',
    email: '',
    isAdmin: false,
    groups: []
  });
  
  const [newGroup, setNewGroup] = useState<Omit<Group, 'id'>>({
    name: '',
    description: '',
    calculations: []
  });

  // Handle adding new user
  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) return;
    
    const user: User = {
      ...newUser,
      id: `user-${Date.now()}`
    };
    
    setUsers([...users, user]);
    setNewUser({ name: '', email: '', isAdmin: false, groups: [] });
    setShowAddUser(false);
  };

  // Handle adding new group
  const handleAddGroup = () => {
    if (!newGroup.name) return;
    
    const group: Group = {
      ...newGroup,
      id: newGroup.name.toLowerCase().replace(/\s+/g, '-')
    };
    
    setGroups([...groups, group]);
    setNewGroup({ name: '', description: '', calculations: [] });
    setShowAddGroup(false);
  };

  // Handle user deletion
  const deleteUser = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
  };

  // Handle group deletion
  const deleteGroup = (id: string) => {
    // First update users that might belong to this group
    const updatedUsers = users.map(user => {
      if (user.groups.includes(id)) {
        return {
          ...user,
          groups: user.groups.filter(g => g !== id)
        };
      }
      return user;
    });
    
    setUsers(updatedUsers);
    setGroups(groups.filter(group => group.id !== id));
  };

  // Toggle user group membership
  const toggleUserGroup = (userId: string, groupId: string) => {
    setUsers(
      users.map(user => {
        if (user.id === userId) {
          const updatedGroups = user.groups.includes(groupId)
            ? user.groups.filter(g => g !== groupId)
            : [...user.groups, groupId];
          
          return { ...user, groups: updatedGroups };
        }
        return user;
      })
    );
  };

  // Toggle calculation in group
  const toggleCalculationInGroup = (groupId: string, calcId: string) => {
    setGroups(
      groups.map(group => {
        if (group.id === groupId) {
          const updatedCalcs = group.calculations.includes(calcId)
            ? group.calculations.filter(c => c !== calcId)
            : [...group.calculations, calcId];
          
          return { ...group, calculations: updatedCalcs };
        }
        return group;
      })
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <h2>User and Access Management</h2>
        <Button variant="outline" size="sm" className="ml-auto">
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Users</CardTitle>
            <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>
                    Create a new user and assign them to groups.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label>Name</label>
                    <Input 
                      placeholder="Full Name" 
                      value={newUser.name}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label>Email</label>
                    <Input 
                      type="email" 
                      placeholder="email@company.com" 
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="admin" 
                      checked={newUser.isAdmin}
                      onCheckedChange={(checked) => 
                        setNewUser({...newUser, isAdmin: checked === true})
                      }
                    />
                    <label htmlFor="admin">Administrator Access</label>
                  </div>
                  
                  <div className="space-y-2">
                    <label>Assign to Groups</label>
                    <div className="space-y-2 border rounded p-2">
                      {groups.map(group => (
                        <div key={group.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`new-user-group-${group.id}`}
                            checked={newUser.groups.includes(group.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewUser({...newUser, groups: [...newUser.groups, group.id]});
                              } else {
                                setNewUser({
                                  ...newUser, 
                                  groups: newUser.groups.filter(g => g !== group.id)
                                });
                              }
                            }}
                          />
                          <label htmlFor={`new-user-group-${group.id}`}>{group.name}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddUser(false)}>Cancel</Button>
                  <Button onClick={handleAddUser}>Create User</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Groups</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.isAdmin ? "default" : "outline"}>
                        {user.isAdmin ? "Admin" : "User"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.groups.map(groupId => {
                          const group = groups.find(g => g.id === groupId);
                          return group ? (
                            <Badge key={groupId} variant="secondary">
                              {group.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => deleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Groups Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Groups</CardTitle>
            <Dialog open={showAddGroup} onOpenChange={setShowAddGroup}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Group</DialogTitle>
                  <DialogDescription>
                    Create a new group and assign calculations.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label>Group Name</label>
                    <Input 
                      placeholder="Group Name" 
                      value={newGroup.name}
                      onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label>Description</label>
                    <Input 
                      placeholder="Description" 
                      value={newGroup.description}
                      onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label>Assign Calculations</label>
                    <div className="space-y-2 border rounded p-2">
                      {availableCalculations.map(calc => (
                        <div key={calc.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`new-group-calc-${calc.id}`}
                            checked={newGroup.calculations.includes(calc.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewGroup({
                                  ...newGroup, 
                                  calculations: [...newGroup.calculations, calc.id]
                                });
                              } else {
                                setNewGroup({
                                  ...newGroup, 
                                  calculations: newGroup.calculations.filter(c => c !== calc.id)
                                });
                              }
                            }}
                          />
                          <label htmlFor={`new-group-calc-${calc.id}`}>{calc.name}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddGroup(false)}>Cancel</Button>
                  <Button onClick={handleAddGroup}>Create Group</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {groups.map(group => (
                <Card key={group.id}>
                  <CardHeader className="py-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">{group.name}</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => deleteGroup(group.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{group.description}</p>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="space-y-2">
                      <div>
                        <h4 className="text-sm mb-1">Calculations Access:</h4>
                        <div className="flex flex-wrap gap-1">
                          {availableCalculations.map(calc => (
                            <Badge 
                              key={calc.id} 
                              variant={group.calculations.includes(calc.id) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => toggleCalculationInGroup(group.id, calc.id)}
                            >
                              {calc.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm mb-1">Users in this group:</h4>
                        <div className="flex flex-wrap gap-1">
                          {users.filter(user => user.groups.includes(group.id)).map(user => (
                            <Badge 
                              key={user.id} 
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => toggleUserGroup(user.id, group.id)}
                            >
                              {user.name} ×
                            </Badge>
                          ))}
                          {users.filter(user => !user.groups.includes(group.id)).length > 0 && (
                            <Badge variant="outline" className="cursor-pointer">
                              + Add users
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
