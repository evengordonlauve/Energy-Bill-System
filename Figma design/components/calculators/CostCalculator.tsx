
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { PlusIcon, XIcon, ArrowLeftIcon, Save, Printer, Download } from 'lucide-react';
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useAuth } from "../auth/AuthContext";
import { useCalculations } from "../calculations/CalculationContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { generatePDF, createPrintView } from "../utils/pdfUtils";

type Tenant = {
  id: string;
  name: string;
  area: number;
  electricUsage: number;
  thermalUsage: number;
  waterUsage: number;
};

type BuildingData = {
  totalArea: number;
  commonArea: number;
  totalElectric: number;
  totalThermal: number;
  totalWater: number;
  energyProduction: number;
  energyExport: number;
};

type PriceStructure = {
  consumptionPrice: number;
  productionPrice: number;
  gridFixed: number;
  gridEnergy: number;
  thermalPrice: number;
  waterPrice: number;
};

type DistributionMethod = 'consumption' | 'area';

type DistributionChoices = {
  electric: DistributionMethod;
  thermal: DistributionMethod;
  water: DistributionMethod;
  production: DistributionMethod;
};

type CalculationResult = {
  selfConsumption: number;
  selfConsumptionPercent: number;
  tenantResults: {
    id: string;
    name: string;
    areaPercent: number;
    electricCost: number;
    thermalCost: number;
    waterCost: number;
    productionShare: number;
    total: number;
  }[];
};

type CostCalculatorProps = {
  onBack: () => void;
  calculationId?: string; // Optional ID if viewing a saved calculation
};

export default function CostCalculator({ onBack, calculationId }: CostCalculatorProps) {
  const { user, isAdmin } = useAuth();
  const { addCalculation, getCalculation, updateCalculation } = useCalculations();
  const [calculationName, setCalculationName] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isViewingSaved, setIsViewingSaved] = useState(false);
  const [currentCalculationId, setCurrentCalculationId] = useState<string | undefined>(calculationId);
  
  const [tenants, setTenants] = useState<Tenant[]>([
    { id: '1', name: 'Butikk A', area: 300, electricUsage: 600, thermalUsage: 3000, waterUsage: 20 },
    { id: '2', name: 'Kontor B', area: 500, electricUsage: 200, thermalUsage: 4000, waterUsage: 30 }
  ]);
  
  const [buildingData, setBuildingData] = useState<BuildingData>({
    totalArea: 1000,
    commonArea: 200,
    totalElectric: 12000,
    totalThermal: 8000,
    totalWater: 120,
    energyProduction: 4000,
    energyExport: 2500
  });
  
  const [priceStructure, setPriceStructure] = useState<PriceStructure>({
    consumptionPrice: 0.64,
    productionPrice: 0.64,
    gridFixed: 300,
    gridEnergy: 0.30,
    thermalPrice: 0.70,
    waterPrice: 50
  });
  
  const [distribution, setDistribution] = useState<DistributionChoices>({
    electric: 'consumption',
    thermal: 'consumption',
    water: 'consumption',
    production: 'consumption'
  });
  
  const [result, setResult] = useState<CalculationResult | null>(null);
  
  // Reference for printable content
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
      if (savedCalculation && savedCalculation.type === 'cost-calculation') {
        setCalculationName(savedCalculation.name);
        setTenants(savedCalculation.data.tenants);
        setBuildingData(savedCalculation.data.buildingData);
        setDistribution(savedCalculation.data.distribution);
        setCurrentCalculationId(calculationId);
        setSelectedGroups(savedCalculation.groups || []);
        setIsViewingSaved(true);
        
        // If there are results saved, load those too
        if (savedCalculation.data.result) {
          setResult(savedCalculation.data.result);
        } else {
          // Otherwise calculate the results
          calculate();
        }
      }
    }
  }, [calculationId]);

  const addTenant = () => {
    const newTenant: Tenant = {
      id: `tenant-${Date.now()}`,
      name: `Leietaker ${tenants.length + 1}`,
      area: 100,
      electricUsage: 1000,
      thermalUsage: 500,
      waterUsage: 10
    };
    setTenants([...tenants, newTenant]);
  };

  const removeTenant = (id: string) => {
    setTenants(tenants.filter(tenant => tenant.id !== id));
  };

  const updateTenant = (id: string, field: keyof Tenant, value: string | number) => {
    setTenants(tenants.map(tenant => {
      if (tenant.id === id) {
        return { ...tenant, [field]: value };
      }
      return tenant;
    }));
  };

  const updateBuildingData = (field: keyof BuildingData, value: number) => {
    setBuildingData({ ...buildingData, [field]: value });
  };

  const updatePriceStructure = (field: keyof PriceStructure, value: number) => {
    setPriceStructure({ ...priceStructure, [field]: value });
  };

  const updateDistribution = (field: keyof DistributionChoices, value: DistributionMethod) => {
    setDistribution({ ...distribution, [field]: value });
  };

  const calculate = () => {
    // Self-consumption calculation
    const selfConsumed = buildingData.energyProduction - buildingData.energyExport;
    const selfPercent = buildingData.energyProduction > 0 
      ? (selfConsumed / buildingData.energyProduction * 100) 
      : 0;
    
    const tenantResults = tenants.map(tenant => {
      // Calculate area percentage
      const areaPercent = buildingData.totalArea > 0 
        ? (tenant.area / buildingData.totalArea * 100) 
        : 0;
      
      // Calculate costs based on distribution method
      const electricCost = distribution.electric === 'consumption'
        ? (tenant.electricUsage / buildingData.totalElectric) * priceStructure.consumptionPrice * buildingData.totalElectric
        : (tenant.area / buildingData.totalArea) * priceStructure.consumptionPrice * buildingData.totalElectric;
      
      const thermalCost = distribution.thermal === 'consumption'
        ? (tenant.thermalUsage / buildingData.totalThermal) * priceStructure.thermalPrice * buildingData.totalThermal
        : (tenant.area / buildingData.totalArea) * priceStructure.thermalPrice * buildingData.totalThermal;
      
      const waterCost = distribution.water === 'consumption'
        ? (tenant.waterUsage / buildingData.totalWater) * priceStructure.waterPrice * buildingData.totalWater
        : (tenant.area / buildingData.totalArea) * priceStructure.waterPrice * buildingData.totalWater;
      
      const exportIncome = buildingData.energyExport * priceStructure.productionPrice;
      const productionShare = distribution.production === 'consumption'
        ? (tenant.electricUsage / buildingData.totalElectric) * exportIncome
        : (tenant.area / buildingData.totalArea) * exportIncome;
      
      const total = electricCost + thermalCost + waterCost - productionShare;
      
      return {
        id: tenant.id,
        name: tenant.name,
        areaPercent,
        electricCost,
        thermalCost,
        waterCost,
        productionShare,
        total
      };
    });
    
    setResult({
      selfConsumption: selfConsumed,
      selfConsumptionPercent: selfPercent,
      tenantResults
    });
  };
  
  const handleSaveCalculation = () => {
    if (!calculationName.trim()) return;
    
    // Save calculation with all its data
    const calculationData = {
      tenants,
      buildingData,
      priceStructure,
      distribution,
      result
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
      addCalculation(calculationName, 'cost-calculation', calculationData, selectedGroups);
    }
    
    setShowSaveDialog(false);
    // Show a success message or notification here
  };
  
  const toggleGroupSelection = (groupId: string) => {
    if (selectedGroups.includes(groupId)) {
      setSelectedGroups(selectedGroups.filter(id => id !== groupId));
    } else {
      setSelectedGroups([...selectedGroups, groupId]);
    }
  };
  
  const handlePrintPDF = async () => {
    if (!printableRef.current || !result) return;
    
    try {
      await generatePDF(
        printableRef.current, 
        `${calculationName || 'Cost-Distribution'}.pdf`
      );
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    }
  };

  const handlePrint = () => {
    if (!printableRef.current || !result) return;
    createPrintView(printableRef.current);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <h2>
          {isViewingSaved ? calculationName : 'Kostnads- og Inntektsfordeling'}
        </h2>
        
        <div className="ml-auto flex gap-2">
          {result && (
            <>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              
              <Button variant="outline" size="sm" onClick={handlePrintPDF}>
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </>
          )}
          
          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Save className="mr-2 h-4 w-4" />
                Save Calculation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Calculation</DialogTitle>
                <DialogDescription>
                  Give your calculation a name and assign it to groups.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label>Calculation Name</label>
                  <Input 
                    placeholder="My Cost Calculation"
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
        </div>
      </div>
      
      <div className="space-y-6" ref={printableRef}>
        {/* 1. Building Structure */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">1. Byggstruktur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Totalt byggareal (m²)</label>
                <Input
                  type="number"
                  value={buildingData.totalArea}
                  onChange={(e) => updateBuildingData('totalArea', parseFloat(e.target.value) || 0)}
                  className="bg-input-background"
                />
              </div>
              <div>
                <label className="block mb-1">Fellesareal (m²)</label>
                <Input
                  type="number"
                  value={buildingData.commonArea}
                  onChange={(e) => updateBuildingData('commonArea', parseFloat(e.target.value) || 0)}
                  className="bg-input-background"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* 2. Tenants */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">2. Leietakere</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tenants.map((tenant) => (
                <div key={tenant.id} className="relative border rounded p-4 bg-background">
                  <button 
                    className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                    onClick={() => removeTenant(tenant.id)}
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-3">
                      <label className="block mb-1">Navn</label>
                      <Input
                        value={tenant.name}
                        onChange={(e) => updateTenant(tenant.id, 'name', e.target.value)}
                        className="bg-input-background"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Areal (m²)</label>
                      <Input
                        type="number"
                        value={tenant.area}
                        onChange={(e) => updateTenant(tenant.id, 'area', parseFloat(e.target.value) || 0)}
                        className="bg-input-background"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">El-forbruk (kWh)</label>
                      <Input
                        type="number"
                        value={tenant.electricUsage}
                        onChange={(e) => updateTenant(tenant.id, 'electricUsage', parseFloat(e.target.value) || 0)}
                        className="bg-input-background"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Termisk (kWh)</label>
                      <Input
                        type="number"
                        value={tenant.thermalUsage}
                        onChange={(e) => updateTenant(tenant.id, 'thermalUsage', parseFloat(e.target.value) || 0)}
                        className="bg-input-background"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Vann (m³)</label>
                      <Input
                        type="number"
                        value={tenant.waterUsage}
                        onChange={(e) => updateTenant(tenant.id, 'waterUsage', parseFloat(e.target.value) || 0)}
                        className="bg-input-background"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" size="sm" onClick={addTenant}>
                <PlusIcon className="mr-1 h-4 w-4" />
                Legg til leietaker
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* 3. Consumption & Production */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">3. Forbruk & Produksjon (Bygget totalt)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1">El-forbruk (kWh/mnd)</label>
                <Input
                  type="number"
                  value={buildingData.totalElectric}
                  onChange={(e) => updateBuildingData('totalElectric', parseFloat(e.target.value) || 0)}
                  className="bg-input-background"
                />
              </div>
              <div>
                <label className="block mb-1">Termisk forbruk (kWh/mnd)</label>
                <Input
                  type="number"
                  value={buildingData.totalThermal}
                  onChange={(e) => updateBuildingData('totalThermal', parseFloat(e.target.value) || 0)}
                  className="bg-input-background"
                />
              </div>
              <div>
                <label className="block mb-1">Vannforbruk (m³/mnd)</label>
                <Input
                  type="number"
                  value={buildingData.totalWater}
                  onChange={(e) => updateBuildingData('totalWater', parseFloat(e.target.value) || 0)}
                  className="bg-input-background"
                />
              </div>
              <div>
                <label className="block mb-1">Produsert solenergi (kWh/mnd)</label>
                <Input
                  type="number"
                  value={buildingData.energyProduction}
                  onChange={(e) => updateBuildingData('energyProduction', parseFloat(e.target.value) || 0)}
                  className="bg-input-background"
                />
              </div>
              <div>
                <label className="block mb-1">Eksportert energi (kWh/mnd)</label>
                <Input
                  type="number"
                  value={buildingData.energyExport}
                  onChange={(e) => updateBuildingData('energyExport', parseFloat(e.target.value) || 0)}
                  className="bg-input-background"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* 4. Price Structure */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">4. Prisstruktur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1">Spotpris forbruk (kr/kWh)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={priceStructure.consumptionPrice}
                  onChange={(e) => updatePriceStructure('consumptionPrice', parseFloat(e.target.value) || 0)}
                  className="bg-input-background"
                />
              </div>
              <div>
                <label className="block mb-1">Spotpris produksjon (kr/kWh)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={priceStructure.productionPrice}
                  onChange={(e) => updatePriceStructure('productionPrice', parseFloat(e.target.value) || 0)}
                  className="bg-input-background"
                />
              </div>
              <div>
                <label className="block mb-1">Nettleie fastledd (kr/mnd)</label>
                <Input
                  type="number"
                  value={priceStructure.gridFixed}
                  onChange={(e) => updatePriceStructure('gridFixed', parseFloat(e.target.value) || 0)}
                  className="bg-input-background"
                />
              </div>
              <div>
                <label className="block mb-1">Nettleie energiledd (kr/kWh)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={priceStructure.gridEnergy}
                  onChange={(e) => updatePriceStructure('gridEnergy', parseFloat(e.target.value) || 0)}
                  className="bg-input-background"
                />
              </div>
              <div>
                <label className="block mb-1">Pris termisk energi (kr/kWh)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={priceStructure.thermalPrice}
                  onChange={(e) => updatePriceStructure('thermalPrice', parseFloat(e.target.value) || 0)}
                  className="bg-input-background"
                />
              </div>
              <div>
                <label className="block mb-1">Pris vann (kr/m³)</label>
                <Input
                  type="number"
                  value={priceStructure.waterPrice}
                  onChange={(e) => updatePriceStructure('waterPrice', parseFloat(e.target.value) || 0)}
                  className="bg-input-background"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* 5. Distribution Choices */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">5. Fordelingsvalg</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Elektrisk fordeling</label>
                <Select
                  value={distribution.electric}
                  onValueChange={(value) => updateDistribution('electric', value as DistributionMethod)}
                >
                  <SelectTrigger className="w-full bg-input-background">
                    <SelectValue placeholder="Velg fordeling" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consumption">Etter forbruk</SelectItem>
                    <SelectItem value="area">Etter areal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block mb-1">Termisk fordeling</label>
                <Select
                  value={distribution.thermal}
                  onValueChange={(value) => updateDistribution('thermal', value as DistributionMethod)}
                >
                  <SelectTrigger className="w-full bg-input-background">
                    <SelectValue placeholder="Velg fordeling" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consumption">Etter forbruk</SelectItem>
                    <SelectItem value="area">Etter areal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block mb-1">Vannfordeling</label>
                <Select
                  value={distribution.water}
                  onValueChange={(value) => updateDistribution('water', value as DistributionMethod)}
                >
                  <SelectTrigger className="w-full bg-input-background">
                    <SelectValue placeholder="Velg fordeling" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consumption">Etter forbruk</SelectItem>
                    <SelectItem value="area">Etter areal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block mb-1">Solstrømfordeling</label>
                <Select
                  value={distribution.production}
                  onValueChange={(value) => updateDistribution('production', value as DistributionMethod)}
                >
                  <SelectTrigger className="w-full bg-input-background">
                    <SelectValue placeholder="Velg fordeling" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consumption">Etter forbruk</SelectItem>
                    <SelectItem value="area">Etter areal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Calculate Button */}
        <div className="text-center mb-6">
          <Button onClick={calculate}>Beregn kostnader</Button>
        </div>
        
        {/* 6. Results */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                6. Resultater
                {isViewingSaved && <div className="text-sm text-muted-foreground mt-1">
                  {calculationName} - Created by {user?.name || "User"} - {new Date().toLocaleDateString()}
                </div>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-3 border rounded bg-background">
                <p>
                  <strong>Egenforbruk bygget:</strong> {result.selfConsumption.toFixed(1)} kWh (
                  {result.selfConsumptionPercent.toFixed(1)} %)
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.tenantResults.map((tenant) => (
                  <div key={tenant.id} className="p-3 border rounded bg-background">
                    <h3 className="font-medium mb-1">{tenant.name}</h3>
                    <p className="text-sm">Arealandel: {tenant.areaPercent.toFixed(1)} %</p>
                    <p className="text-sm">El-kostnad: {tenant.electricCost.toFixed(1)} kr</p>
                    <p className="text-sm">Termisk kostnad: {tenant.thermalCost.toFixed(1)} kr</p>
                    <p className="text-sm">Vannkostnad: {tenant.waterCost.toFixed(1)} kr</p>
                    <p className="text-sm text-green-600">
                      Produksjonsandel: -{tenant.productionShare.toFixed(1)} kr
                    </p>
                    <p className="font-medium text-right">Totalt: {tenant.total.toFixed(1)} kr</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
