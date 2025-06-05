
import { useState, useEffect, useRef } from 'react';
import { ArrowLeftIcon, Save, PlusIcon, Trash2, Check, Printer, Download } from 'lucide-react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useAuth } from "../auth/AuthContext";
import { useCalculations } from "../calculations/CalculationContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Checkbox } from "../ui/checkbox";
import { generatePDF, createPrintView } from "../utils/pdfUtils";
import { Badge } from "../ui/badge";

// Types
type PriceListItem = {
  id: string;
  category: string;
  type: string;
  description: string;
  priceNoHw: number;
  pricePerMonth: number;
  pricePerYear: number;
  quantity: number;
  notes?: string;
  isHeader?: boolean;
};

type PriceListProps = {
  onBack: () => void;
  calculationId?: string; // Optional ID if viewing a saved calculation
};

// Default price list data
const DEFAULT_PRICE_LIST: PriceListItem[] = [
  { id: 'header-1', category: 'Nivå 1 - (Krever ikke Edge gateway)', type: '', description: '', priceNoHw: 0, pricePerMonth: 0, pricePerYear: 0, quantity: 0, isHeader: true },
  { id: '1', category: 'Grunpakke AES (pr bygg)', type: 'HW', description: 'Pris pr bygg, inkluderer ett målepunkt', priceNoHw: 2000, pricePerMonth: 240, pricePerYear: 2880, quantity: 0 },
  { id: '2', category: 'Ekstra Ethub målepunkt', type: 'HW', description: 'Pris per ekstra strømmåler', priceNoHw: 1000, pricePerMonth: 120, pricePerYear: 1440, quantity: 0 },
  { id: '3', category: 'Gateway for sensorer', type: 'HW', description: 'Pris er inkl HW / gateway', priceNoHw: 3500, pricePerMonth: 60, pricePerYear: 720, quantity: 0 },
  { id: '4', category: 'Temperatur/Luftfuktighet', type: 'HW', description: 'Pris er inkl HW / sensor', priceNoHw: 1000, pricePerMonth: 30, pricePerYear: 360, quantity: 0 },
  { id: '5', category: 'Temperatur/Luftfuktighet/CO2', type: 'HW', description: 'Pris er inkl HW / sensor', priceNoHw: 2000, pricePerMonth: 30, pricePerYear: 360, quantity: 0 },
  
  { id: 'header-2', category: 'Nivå 2 - Energistyring (Krever Acron Energy Edge Gateway)', type: '', description: '', priceNoHw: 0, pricePerMonth: 0, pricePerYear: 0, quantity: 0, isHeader: true },
  { id: '6', category: 'Acron Energy Edge Gateway', type: 'HW', description: '', priceNoHw: 6000, pricePerMonth: 80, pricePerYear: 960, quantity: 0 },
  { id: '7', category: 'El-måler', type: 'HW', description: 'Kreves dersom en ikke kan benytte byggets måler', priceNoHw: 2000, pricePerMonth: 200, pricePerYear: 2400, quantity: 0 },
  { id: '8', category: 'Ventilasjonsanlegg', type: 'HW', description: 'Pris er ekskl. HW/installasjon', priceNoHw: 7000, pricePerMonth: 80, pricePerYear: 960, quantity: 0 },
  { id: '9', category: 'Varmepumpe', type: 'HW', description: 'Pris er ekskl. HW/installasjon', priceNoHw: 7000, pricePerMonth: 80, pricePerYear: 960, quantity: 0 },
  { id: '10', category: 'El kjele', type: 'HW', description: 'Pris er ekskl. HW/installasjon', priceNoHw: 7000, pricePerMonth: 80, pricePerYear: 960, quantity: 0 },
  { id: '11', category: 'Solcelleninverter', type: 'HW', description: 'Inkl. Modbus RTU gateway', priceNoHw: 3000, pricePerMonth: 80, pricePerYear: 960, quantity: 0 },
  { id: '12', category: 'Energisentral', type: '', description: 'Pumper, shunter, temp følere, regulering m.m', priceNoHw: 0, pricePerMonth: 0, pricePerYear: 0, quantity: 0 },
  { id: '13', category: 'HAN-gateway', type: 'HW', description: 'Live energidata, AMS måler', priceNoHw: 4000, pricePerMonth: 20, pricePerYear: 240, quantity: 0 },
  
  { id: 'header-3', category: 'Energimålere - (Krever M-bus gateway)', type: '', description: '', priceNoHw: 0, pricePerMonth: 0, pricePerYear: 0, quantity: 0, isHeader: true },
  { id: '14', category: 'M-bus gateway', type: 'HW', description: '', priceNoHw: 3000, pricePerMonth: 60, pricePerYear: 720, quantity: 0 },
  { id: '15', category: 'Energimåler elektrisk / termisk / vann', type: 'HW', description: '(energimålere er ikke inkl i pris)', priceNoHw: 1000, pricePerMonth: 30, pricePerYear: 360, quantity: 0 }
];

export default function PriceList({ onBack, calculationId }: PriceListProps) {
  const { user, isAdmin } = useAuth();
  const { addCalculation, getCalculation, updateCalculation } = useCalculations();
  const [priceList, setPriceList] = useState<PriceListItem[]>(DEFAULT_PRICE_LIST);
  const [editing, setEditing] = useState(false);
  const [calculationName, setCalculationName] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isViewingSaved, setIsViewingSaved] = useState(false);
  const [currentCalculationId, setCurrentCalculationId] = useState<string | undefined>(calculationId);
  
  const [totals, setTotals] = useState({
    hardware: 0,
    monthly: 0,
    yearly: 0
  });
  
  // Reference to the printable content
  const printableRef = useRef<HTMLDivElement>(null);

  // Available groups
  const availableGroups = [
    { id: 'all', name: 'All Access' },
    { id: 'basic', name: 'Basic' },
    { id: 'energy', name: 'Energy' },
  ];

  // Load saved calculation if ID is provided
  useEffect(() => {
    if (calculationId) {
      const savedCalculation = getCalculation(calculationId);
      if (savedCalculation && savedCalculation.type === 'price-list') {
        setCalculationName(savedCalculation.name);
        setSelectedGroups(savedCalculation.groups || []);
        setCurrentCalculationId(calculationId);
        
        if (savedCalculation.data.priceList) {
          // If we have saved price list items
          setPriceList(savedCalculation.data.priceList);
        } else {
          // Otherwise we'll use the updated quantities
          const updatedPriceList = DEFAULT_PRICE_LIST.map(item => {
            const savedItem = savedCalculation.data.quantities?.find(q => q.id === item.id);
            if (savedItem) {
              return { ...item, quantity: savedItem.quantity };
            }
            return item;
          });
          setPriceList(updatedPriceList);
        }
        
        setIsViewingSaved(true);
        calculateTotals();
      }
    }
  }, [calculationId]);

  // Calculate totals whenever the price list changes
  useEffect(() => {
    calculateTotals();
  }, [priceList]);

  const calculateTotals = () => {
    const hardware = priceList.reduce((sum, item) => {
      return sum + (item.priceNoHw * item.quantity);
    }, 0);
    
    const monthly = priceList.reduce((sum, item) => {
      return sum + (item.pricePerMonth * item.quantity);
    }, 0);
    
    const yearly = priceList.reduce((sum, item) => {
      return sum + (item.pricePerYear * item.quantity);
    }, 0);
    
    setTotals({ hardware, monthly, yearly });
  };

  const updateItemQuantity = (id: string, quantity: number) => {
    setPriceList(priceList.map(item => {
      if (item.id === id) {
        return { ...item, quantity };
      }
      return item;
    }));
    calculateTotals();
  };

  const updateItemField = (id: string, field: keyof PriceListItem, value: any) => {
    if (!isAdmin || !editing) return;
    
    setPriceList(priceList.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
    calculateTotals();
  };

  const addItem = (afterId: string) => {
    if (!isAdmin || !editing) return;
    
    const index = priceList.findIndex(item => item.id === afterId);
    const newItem: PriceListItem = {
      id: `new-${Date.now()}`,
      category: 'Ny kategori',
      type: 'HW',
      description: '',
      priceNoHw: 0,
      pricePerMonth: 0,
      pricePerYear: 0,
      quantity: 0
    };
    
    const updatedList = [
      ...priceList.slice(0, index + 1),
      newItem,
      ...priceList.slice(index + 1)
    ];
    
    setPriceList(updatedList);
  };

  const addHeader = () => {
    if (!isAdmin || !editing) return;
    
    const newHeader: PriceListItem = {
      id: `header-${Date.now()}`,
      category: 'Ny Seksjon',
      type: '',
      description: '',
      priceNoHw: 0,
      pricePerMonth: 0,
      pricePerYear: 0,
      quantity: 0,
      isHeader: true
    };
    
    setPriceList([...priceList, newHeader]);
  };

  const deleteItem = (id: string) => {
    if (!isAdmin || !editing) return;
    
    setPriceList(priceList.filter(item => item.id !== id));
    calculateTotals();
  };

  const toggleEditing = () => {
    if (!isAdmin) return;
    setEditing(!editing);
  };
  
  const handleSaveCalculation = () => {
    if (!calculationName.trim()) return;
    
    // Save price list with quantities
    const calculationData = {
      priceList,
      totals
    };
    
    if (currentCalculationId && isViewingSaved) {
      // Update existing calculation
      updateCalculation(currentCalculationId, {
        name: calculationName,
        groups: selectedGroups,
        data: calculationData
      });
    } else {
      // Create new calculation
      addCalculation(calculationName, 'price-list', calculationData, selectedGroups);
    }
    
    setShowSaveDialog(false);
    // Show success notification
  };

  const handlePrintPDF = async () => {
    if (!printableRef.current) return;
    
    try {
      await generatePDF(
        printableRef.current, 
        `${calculationName || 'Price-List'}.pdf`, 
        { orientation: 'landscape' }
      );
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    }
  };

  const handlePrint = () => {
    if (!printableRef.current) return;
    createPrintView(printableRef.current);
  };
  
  const toggleGroupSelection = (groupId: string) => {
    if (selectedGroups.includes(groupId)) {
      setSelectedGroups(selectedGroups.filter(id => id !== groupId));
    } else {
      setSelectedGroups([...selectedGroups, groupId]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <h2>
          {isViewingSaved ? calculationName : 'Acron Energy System - Prisliste'}
        </h2>
        
        <div className="ml-auto space-x-2">
          {isAdmin && (
            <Button 
              variant={editing ? "default" : "outline"} 
              size="sm" 
              onClick={toggleEditing}
            >
              {editing ? <Check className="mr-2 h-4 w-4" /> : null}
              {editing ? "Ferdig" : "Rediger prisliste"}
            </Button>
          )}
          
          {!editing && (
            <>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              
              <Button variant="outline" size="sm" onClick={handlePrintPDF}>
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              
              <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save Price List</DialogTitle>
                    <DialogDescription>
                      Give your price list a name and assign it to groups.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label>Price List Name</label>
                      <Input 
                        placeholder="My Price List"
                        value={calculationName}
                        onChange={(e) => setCalculationName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label>Assign to Groups</label>
                      <div className="flex flex-wrap gap-2">
                        {availableGroups.map(group => (
                          <Badge 
                            key={group.id}
                            variant={selectedGroups.includes(group.id) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleGroupSelection(group.id)}
                          >
                            {group.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
                    <Button onClick={handleSaveCalculation}>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
          
          {editing && (
            <Button variant="outline" size="sm" onClick={addHeader}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Legg til seksjon
            </Button>
          )}
        </div>
      </div>
      
      <div ref={printableRef}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Acron Energy System - {calculationName || "Prisliste"}
              </CardTitle>
              
              {isViewingSaved && (
                <div className="text-sm text-muted-foreground">
                  Created by: {user?.name || "User"}
                  <br />
                  Date: {new Date().toLocaleDateString()}
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Priser er kun for onboarding, etablering, AES hardware og abonnement - Installasjon av komponenter, kabling etc tilkommer
            </p>
          </CardHeader>
          <CardContent>
            <div className="rounded border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Type</TableHead>
                    <TableHead>Beskrivelse</TableHead>
                    <TableHead className="w-[100px] text-right">Etablering/HW</TableHead>
                    <TableHead className="w-[100px] text-right">Abb. Pr.mnd</TableHead>
                    <TableHead className="w-[100px] text-right">Abb. Pr.år</TableHead>
                    <TableHead className="w-[80px] text-right">Antall</TableHead>
                    <TableHead className="w-[80px] text-right">Sum</TableHead>
                    {editing && isAdmin && <TableHead className="w-[50px]"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {priceList.map((item) => (
                    <TableRow 
                      key={item.id} 
                      className={item.isHeader ? "bg-accent" : ""}
                    >
                      <TableCell className="font-medium">
                        {editing && isAdmin ? (
                          <Input 
                            value={item.category} 
                            onChange={(e) => updateItemField(item.id, 'category', e.target.value)}
                            className={item.isHeader ? "font-medium" : ""}
                          />
                        ) : (
                          item.category
                        )}
                        {editing && isAdmin && !item.isHeader && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => addItem(item.id)}
                            className="mt-1 h-6 text-xs"
                          >
                            <PlusIcon className="h-3 w-3 mr-1" />
                            Legg til under
                          </Button>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {editing && isAdmin ? (
                          <Input 
                            value={item.description} 
                            onChange={(e) => updateItemField(item.id, 'description', e.target.value)}
                          />
                        ) : (
                          item.description
                        )}
                      </TableCell>
                      
                      <TableCell className="text-right">
                        {editing && isAdmin ? (
                          item.isHeader ? "-" : (
                            <Input 
                              type="number"
                              value={item.priceNoHw} 
                              onChange={(e) => updateItemField(item.id, 'priceNoHw', Number(e.target.value))}
                              className="text-right"
                            />
                          )
                        ) : (
                          item.isHeader ? "-" : item.priceNoHw.toLocaleString('no-NO')
                        )}
                      </TableCell>
                      
                      <TableCell className="text-right">
                        {editing && isAdmin ? (
                          item.isHeader ? "-" : (
                            <Input 
                              type="number"
                              value={item.pricePerMonth} 
                              onChange={(e) => updateItemField(item.id, 'pricePerMonth', Number(e.target.value))}
                              className="text-right"
                            />
                          )
                        ) : (
                          item.isHeader ? "-" : item.pricePerMonth.toLocaleString('no-NO')
                        )}
                      </TableCell>
                      
                      <TableCell className="text-right">
                        {editing && isAdmin ? (
                          item.isHeader ? "-" : (
                            <Input 
                              type="number"
                              value={item.pricePerYear} 
                              onChange={(e) => updateItemField(item.id, 'pricePerYear', Number(e.target.value))}
                              className="text-right"
                            />
                          )
                        ) : (
                          item.isHeader ? "-" : item.pricePerYear.toLocaleString('no-NO')
                        )}
                      </TableCell>
                      
                      <TableCell className="text-right">
                        {!item.isHeader && (
                          <Input 
                            type="number"
                            value={item.quantity} 
                            onChange={(e) => updateItemQuantity(item.id, Number(e.target.value))}
                            className="text-right"
                            disabled={editing && isAdmin}
                          />
                        )}
                      </TableCell>
                      
                      <TableCell className="text-right font-medium">
                        {!item.isHeader && item.quantity > 0 ? (
                          (item.priceNoHw * item.quantity).toLocaleString('no-NO')
                        ) : "-"}
                      </TableCell>
                      
                      {editing && isAdmin && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteItem(item.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Totals */}
            <div className="mt-6 flex flex-col items-end">
              <div className="w-full max-w-sm space-y-2">
                <div className="flex justify-between">
                  <span>Sum Etablering/Hardware:</span>
                  <span className="font-medium">{totals.hardware.toLocaleString('no-NO')} kr</span>
                </div>
                <div className="flex justify-between">
                  <span>Sum Månedlig abonnement:</span>
                  <span className="font-medium">{totals.monthly.toLocaleString('no-NO')} kr</span>
                </div>
                <div className="flex justify-between">
                  <span>Sum Årlig abonnement:</span>
                  <span className="font-medium">{totals.yearly.toLocaleString('no-NO')} kr</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
