
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';

// Types for our calculations
export type SavedCalculation = {
  id: string;
  name: string;
  type: 'cost-calculation' | 'price-list';
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  groups: string[]; // Store which groups this calculation belongs to
  data: any; // This will hold the actual calculation data
};

type CalculationContextType = {
  calculations: SavedCalculation[];
  addCalculation: (name: string, type: 'cost-calculation' | 'price-list', data: any, groups: string[]) => void;
  updateCalculation: (id: string, updates: Partial<SavedCalculation>) => void;
  deleteCalculation: (id: string) => void;
  getCalculationsByUser: (userId: string) => SavedCalculation[];
  getCalculationsByGroup: (groupId: string) => SavedCalculation[];
  getCalculation: (id: string) => SavedCalculation | undefined;
};

// Sample initial calculations
const initialCalculations: SavedCalculation[] = [
  {
    id: 'calc1',
    name: 'Office Building Cost Distribution',
    type: 'cost-calculation',
    createdBy: '1', // Admin user ID
    createdByName: 'Admin User',
    createdAt: new Date(2025, 4, 20), // May 20, 2025
    groups: ['all', 'basic'],
    data: {
      tenants: [
        { id: '1', name: 'Main Office', area: 500, electricUsage: 1000, thermalUsage: 5000, waterUsage: 50 },
        { id: '2', name: 'Retail Space', area: 300, electricUsage: 800, thermalUsage: 3000, waterUsage: 30 },
      ],
      buildingData: {
        totalArea: 1000,
        commonArea: 200,
        totalElectric: 2000,
        totalThermal: 9000,
        totalWater: 100,
        energyProduction: 5000,
        energyExport: 3000
      },
      distribution: {
        electric: 'consumption',
        thermal: 'area',
        water: 'consumption',
        production: 'area'
      }
    }
  },
  {
    id: 'calc2',
    name: 'Apartment Building Cost Distribution',
    type: 'cost-calculation',
    createdBy: '2', // Regular user ID
    createdByName: 'Regular User',
    createdAt: new Date(2025, 4, 22), // May 22, 2025
    groups: ['basic'],
    data: {
      tenants: [
        { id: '1', name: 'Apartment 1A', area: 85, electricUsage: 300, thermalUsage: 1200, waterUsage: 15 },
        { id: '2', name: 'Apartment 1B', area: 75, electricUsage: 250, thermalUsage: 1000, waterUsage: 12 },
        { id: '3', name: 'Apartment 2A', area: 85, electricUsage: 320, thermalUsage: 1250, waterUsage: 16 },
      ],
      buildingData: {
        totalArea: 300,
        commonArea: 55,
        totalElectric: 1000,
        totalThermal: 4000,
        totalWater: 50,
        energyProduction: 2000,
        energyExport: 1000
      },
      distribution: {
        electric: 'area',
        thermal: 'area',
        water: 'consumption',
        production: 'area'
      }
    }
  },
  {
    id: 'price1',
    name: 'Standard Pricing Model',
    type: 'price-list',
    createdBy: '1', // Admin user ID
    createdByName: 'Admin User',
    createdAt: new Date(2025, 4, 18), // May 18, 2025
    groups: ['all', 'energy'],
    data: {
      priceList: [
        { id: 'item1', category: 'Basic Package', quantity: 2 },
        { id: 'item5', category: 'Temp/Humidity/CO2', quantity: 5 },
        { id: 'item14', category: 'M-bus gateway', quantity: 1 },
      ]
    }
  },
  {
    id: 'price2',
    name: 'Energy System Premium',
    type: 'price-list',
    createdBy: '3', // Energy Manager ID
    createdByName: 'Energy Manager',
    createdAt: new Date(2025, 4, 24), // May 24, 2025
    groups: ['energy'],
    data: {
      priceList: [
        { id: 'item1', category: 'Basic Package', quantity: 1 },
        { id: 'item6', category: 'Acron Energy Edge Gateway', quantity: 1 },
        { id: 'item7', category: 'El-måler', quantity: 3 },
        { id: 'item11', category: 'Solcelleninverter', quantity: 2 },
      ]
    }
  }
];

const CalculationContext = createContext<CalculationContextType | undefined>(undefined);

export function CalculationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [calculations, setCalculations] = useState<SavedCalculation[]>(initialCalculations);

  // Save to localStorage whenever calculations change
  useEffect(() => {
    localStorage.setItem('savedCalculations', JSON.stringify(calculations));
  }, [calculations]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCalculations = localStorage.getItem('savedCalculations');
    if (savedCalculations) {
      try {
        const parsedCalculations: SavedCalculation[] = JSON.parse(savedCalculations);
        // Convert date strings back to Date objects
        const processedCalculations = parsedCalculations.map(calc => ({
          ...calc,
          createdAt: new Date(calc.createdAt),
          groups: calc.groups || [] // Ensure groups exists for backward compatibility
        }));
        setCalculations(processedCalculations);
      } catch (error) {
        console.error('Error parsing saved calculations:', error);
      }
    }
  }, []);

  // Add a new calculation
  const addCalculation = (
    name: string, 
    type: 'cost-calculation' | 'price-list', 
    data: any, 
    groups: string[] = []
  ) => {
    if (!user) return;

    const newCalculation: SavedCalculation = {
      id: `calc-${Date.now()}`,
      name,
      type,
      createdBy: user.id,
      createdByName: user.name,
      createdAt: new Date(),
      groups,
      data
    };

    setCalculations([...calculations, newCalculation]);
  };

  // Update an existing calculation
  const updateCalculation = (id: string, updates: Partial<SavedCalculation>) => {
    setCalculations(calculations.map(calc => 
      calc.id === id ? { ...calc, ...updates } : calc
    ));
  };

  // Delete a calculation
  const deleteCalculation = (id: string) => {
    setCalculations(calculations.filter(calc => calc.id !== id));
  };

  // Get calculations by user ID
  const getCalculationsByUser = (userId: string) => {
    return calculations.filter(calc => calc.createdBy === userId);
  };

  // Get calculations by group ID
  const getCalculationsByGroup = (groupId: string) => {
    // Filter calculations that belong to this group
    return calculations.filter(calc => calc.groups.includes(groupId));
  };

  // Get a specific calculation by ID
  const getCalculation = (id: string) => {
    return calculations.find(calc => calc.id === id);
  };

  return (
    <CalculationContext.Provider
      value={{
        calculations,
        addCalculation,
        updateCalculation,
        deleteCalculation,
        getCalculationsByUser,
        getCalculationsByGroup,
        getCalculation
      }}
    >
      {children}
    </CalculationContext.Provider>
  );
}

export const useCalculations = () => {
  const context = useContext(CalculationContext);
  if (!context) {
    throw new Error('useCalculations must be used within a CalculationProvider');
  }
  return context;
};
