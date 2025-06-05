
import { useState, useEffect } from 'react';
import { ArrowLeftIcon, Save, Check, Calendar, CheckCircle, X, Tag, FileText, UsersIcon, AlertCircle } from 'lucide-react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { useToast } from "../ui/use-toast";
import { Alert, AlertDescription } from "../ui/alert";
import { useChecklists, Checklist, ChecklistItem, ChecklistResponse } from './ChecklistContext';
import { useCustomers, Customer, Asset } from '../customers/CustomerContext';
import { useTags } from '../tags/TagContext';
import { useAuth } from '../auth/AuthContext';

type ChecklistFormProps = {
  onBack: () => void;
  checklistId?: string;
};

export default function ChecklistForm({ onBack, checklistId }: ChecklistFormProps) {
  const { user } = useAuth();
  const { sections, addChecklist, updateChecklist, updateChecklistResponse, getChecklistById, getAvailableGroups } = useChecklists();
  const { customers, assets, getCustomerById, getAssetById } = useCustomers();
  const { tags } = useTags();
  const { toast } = useToast();
  
  const [activeSection, setActiveSection] = useState(sections[0]?.id);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [checklistName, setChecklistName] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [responses, setResponses] = useState<Record<string, ChecklistResponse>>({});
  const [isEditing, setIsEditing] = useState(!checklistId);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [status, setStatus] = useState<Checklist['status']>('draft');
  const [formErrors, setFormErrors] = useState<{ name?: string, customer?: string }>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Available groups for selection
  const availableGroups = getAvailableGroups();
  const userGroups = user?.groups || [];
  
  // Load existing checklist if ID is provided
  useEffect(() => {
    if (checklistId) {
      const existingChecklist = getChecklistById(checklistId);
      if (existingChecklist) {
        setChecklistName(existingChecklist.name);
        setSelectedCustomer(existingChecklist.customerId);
        setSelectedAsset(existingChecklist.assetId || '');
        setSelectedTags(existingChecklist.tags);
        setSelectedGroups(existingChecklist.groups || []);
        setResponses(existingChecklist.responses);
        setStatus(existingChecklist.status);
        setIsEditing(false);
      }
    }
  }, [checklistId]);
  
  // Filter assets based on selected customer
  const customerAssets = selectedCustomer
    ? assets.filter(asset => asset.customerId === selectedCustomer)
    : [];
    
  const customer = selectedCustomer ? getCustomerById(selectedCustomer) : null;
  const asset = selectedAsset ? getAssetById(selectedAsset) : null;
  
  const toggleTag = (tagId: string) => {
    setSelectedTags(
      selectedTags.includes(tagId)
        ? selectedTags.filter(t => t !== tagId)
        : [...selectedTags, tagId]
    );
  };

  const toggleGroup = (groupId: string) => {
    setSelectedGroups(
      selectedGroups.includes(groupId)
        ? selectedGroups.filter(g => g !== groupId)
        : [...selectedGroups, groupId]
    );
  };
  
  const handleResponseChange = (item: ChecklistItem, value: any) => {
    setResponses({
      ...responses,
      [item.id]: {
        itemId: item.id,
        value
      }
    });
  };
  
  const handleNoteChange = (itemId: string, note: string) => {
    const response = responses[itemId];
    if (response) {
      setResponses({
        ...responses,
        [itemId]: {
          ...response,
          notes: note
        }
      });
    }
  };
  
  // Validate form fields
  const validateForm = () => {
    const errors: { name?: string, customer?: string } = {};
    
    if (!checklistName) {
      errors.name = 'Checklist name is required';
    }
    
    if (!selectedCustomer) {
      errors.customer = 'Customer selection is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSave = (saveAndClose: boolean = false) => {
    if (!validateForm()) return;
    
    const checklistData = {
      name: checklistName,
      customerId: selectedCustomer,
      assetId: selectedAsset || undefined,
      status,
      responses,
      tags: selectedTags,
      groups: selectedGroups
    };
    
    try {
      if (checklistId) {
        updateChecklist(checklistId, checklistData);
        toast({
          title: "Checklist updated",
          description: `${checklistName} has been successfully updated.`,
        });
      } else {
        const newId = addChecklist(checklistData as Omit<Checklist, 'id' | 'created' | 'createdBy' | 'createdByName' | 'lastUpdated'>);
        toast({
          title: "Checklist created",
          description: `${checklistName} has been successfully created.`,
        });
      }
      
      setSaveSuccess(true);
      setShowSaveDialog(false);
      
      if (saveAndClose) {
        setTimeout(() => {
          onBack();
        }, 500);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error saving the checklist. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const calculateProgress = () => {
    const requiredItems = sections.flatMap(section => 
      section.items.filter(item => item.required)
    );
    if (requiredItems.length === 0) return 0;
    
    const completedItems = requiredItems.filter(item => 
      responses[item.id]?.value !== undefined && 
      responses[item.id]?.value !== null && 
      responses[item.id]?.value !== ''
    );
    
    return Math.floor((completedItems.length / requiredItems.length) * 100);
  };
  
  const progress = calculateProgress();
  
  const renderInput = (item: ChecklistItem) => {
    const response = responses[item.id];
    const value = response?.value;
    
    switch (item.type) {
      case 'text':
        return (
          <Input
            placeholder="Skriv svar her"
            value={value as string || ''}
            onChange={(e) => handleResponseChange(item, e.target.value)}
            disabled={!isEditing}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            placeholder="0"
            value={value as number || ''}
            onChange={(e) => handleResponseChange(item, e.target.value ? Number(e.target.value) : null)}
            disabled={!isEditing}
          />
        );
      case 'boolean':
        return (
          <div className="flex items-center">
            <Checkbox
              id={`item-${item.id}`}
              checked={!!value}
              onCheckedChange={(checked) => handleResponseChange(item, !!checked)}
              disabled={!isEditing}
            />
            <label
              htmlFor={`item-${item.id}`}
              className="ml-2 text-sm cursor-pointer"
            >
              {value ? 'Ja' : 'Nei'}
            </label>
          </div>
        );
      case 'date':
        // A simple date input for now
        return (
          <Input
            type="date"
            value={value ? new Date(value as Date).toISOString().split('T')[0] : ''}
            onChange={(e) => handleResponseChange(item, e.target.value ? new Date(e.target.value) : null)}
            disabled={!isEditing}
          />
        );
      case 'select':
        return (
          <Select
            value={value as string || ''}
            onValueChange={(newValue) => handleResponseChange(item, newValue)}
            disabled={!isEditing}
          >
            <SelectTrigger>
              <SelectValue placeholder="Velg..." />
            </SelectTrigger>
            <SelectContent>
              {item.options?.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <h2>{checklistId ? checklistName || 'Byggsjekkliste' : 'Ny byggsjekkliste'}</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          {checklistId && !isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Rediger
            </Button>
          )}
          
          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <DialogTrigger asChild>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Lagre
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Lagre sjekkliste</DialogTitle>
                <DialogDescription>
                  Fyll ut informasjon for å lagre sjekklisten
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {saveSuccess && (
                  <Alert className="bg-green-50 border-green-200 mb-4">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">
                      Checklist was saved successfully!
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <label>Navn på sjekkliste <span className="text-destructive">*</span></label>
                  <Input 
                    placeholder="Sjekkliste navn"
                    value={checklistName}
                    onChange={(e) => {
                      setChecklistName(e.target.value);
                      setFormErrors({...formErrors, name: undefined});
                    }}
                    className={formErrors.name ? "border-destructive" : ""}
                  />
                  {formErrors.name && (
                    <p className="text-sm text-destructive">{formErrors.name}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label>Kunde <span className="text-destructive">*</span></label>
                  <Select 
                    value={selectedCustomer} 
                    onValueChange={(value) => {
                      setSelectedCustomer(value);
                      // Reset asset if customer changes
                      setSelectedAsset('');
                      setFormErrors({...formErrors, customer: undefined});
                    }}
                    required
                  >
                    <SelectTrigger className={formErrors.customer ? "border-destructive" : ""}>
                      <SelectValue placeholder="Velg kunde" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.customer && (
                    <p className="text-sm text-destructive">{formErrors.customer}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label>Asset (valgfri)</label>
                  <Select 
                    value={selectedAsset} 
                    onValueChange={setSelectedAsset}
                    disabled={!selectedCustomer || customerAssets.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Velg asset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {customerAssets.map(asset => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label>Status</label>
                  <Select 
                    value={status} 
                    onValueChange={(value) => setStatus(value as Checklist['status'])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Velg status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center gap-1">
                    <UsersIcon className="h-4 w-4" />
                    Groups
                  </label>
                  <div className="flex flex-wrap gap-1 border rounded p-2">
                    {availableGroups
                      .filter(group => user?.isAdmin || userGroups.includes(group)) // Only show groups user belongs to unless admin
                      .map(group => (
                      <Badge 
                        key={group}
                        variant={selectedGroups.includes(group) ? "default" : "outline"}
                        className={`cursor-pointer ${selectedGroups.includes(group) ? "bg-primary" : ""}`}
                        onClick={() => toggleGroup(group)}
                      >
                        {group}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-1 border rounded p-2">
                    {tags.map(tag => (
                      <Badge 
                        key={tag.id}
                        variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                        className={`cursor-pointer ${selectedTags.includes(tag.id) ? tag.color : ''}`}
                        onClick={() => toggleTag(tag.id)}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                  Avbryt
                </Button>
                <Button onClick={() => handleSave(false)}>
                  Lagre
                </Button>
                <Button variant="default" onClick={() => handleSave(true)}>
                  Lagre og lukk
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Customer and Asset Info */}
      {(customer || checklistName) && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between">
              <div>
                <CardTitle>{checklistName || 'Unnamed Checklist'}</CardTitle>
                {customer && (
                  <CardDescription>
                    Kunde: {customer.name} {asset ? `/ Asset: ${asset.name}` : ''}
                  </CardDescription>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={status === 'draft' ? 'outline' : status === 'completed' ? 'default' : 'secondary'}>
                  {status === 'draft' ? 'Utkast' : status === 'completed' ? 'Fullført' : 'Under arbeid'}
                </Badge>
                {selectedGroups.length > 0 && (
                  <div className="flex gap-1">
                    {selectedGroups.map(group => (
                      <Badge key={group} variant="outline" className="bg-primary/10">
                        {group}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-sm">{progress}% ferdig</div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Checklist Sections Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sections.map(section => (
          <Button
            key={section.id}
            variant={activeSection === section.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveSection(section.id)}
            className="whitespace-nowrap"
          >
            {section.name}
          </Button>
        ))}
      </div>
      
      {/* Active Section Content */}
      {sections.find(section => section.id === activeSection) && (
        <Card>
          <CardHeader>
            <CardTitle>{sections.find(section => section.id === activeSection)?.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {sections
              .find(section => section.id === activeSection)
              ?.items.map(item => (
                <div key={item.id} className="space-y-2">
                  <div className="flex items-start justify-between">
                    <Label htmlFor={`item-${item.id}`} className="flex items-center gap-1">
                      {item.required && <span className="text-destructive">*</span>}
                      {item.text}
                    </Label>
                    {responses[item.id]?.value && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  
                  {renderInput(item)}
                  
                  <Textarea
                    placeholder="Legg til kommentarer..."
                    value={responses[item.id]?.notes || ''}
                    onChange={(e) => handleNoteChange(item.id, e.target.value)}
                    disabled={!isEditing}
                    className="mt-2"
                  />
                </div>
              ))}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              {isEditing ? 'Rediger modus' : 'Visningsmodus'}
            </div>
            <div className="flex gap-2">
              {isEditing && (
                <Button 
                  onClick={() => setShowSaveDialog(true)}
                  className="mr-4"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Progress
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  const currentIndex = sections.findIndex(s => s.id === activeSection);
                  if (currentIndex < sections.length - 1) {
                    setActiveSection(sections[currentIndex + 1].id);
                  }
                }}
                disabled={activeSection === sections[sections.length - 1].id}
              >
                Neste seksjon
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
