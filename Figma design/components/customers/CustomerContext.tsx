
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';

export type Customer = {
  id: string;
  name: string;
  orgNumber: string;
  address: string;
  contactPerson: {
    name: string;
    email: string;
    phone: string;
    role: string;
  };
  created: Date;
  createdBy: string;
  createdByName: string;
  tags: string[];
  notes?: string;
};

export type Asset = {
  id: string;
  customerId: string;
  name: string;
  type: 'building' | 'technical-system' | 'other';
  address?: string;
  buildingType?: string;
  area?: number;
  buildYear?: number;
  energyRating?: string;
  energyRatingDate?: Date;
  notes?: string;
  created: Date;
  createdBy: string;
  createdByName: string;
  tags: string[];
};

type CustomerContextType = {
  customers: Customer[];
  assets: Asset[];
  addCustomer: (customer: Omit<Customer, 'id' | 'created' | 'createdBy' | 'createdByName'>) => string;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addAsset: (asset: Omit<Asset, 'id' | 'created' | 'createdBy' | 'createdByName'>) => string;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  getCustomerById: (id: string) => Customer | undefined;
  getCustomerAssets: (customerId: string) => Asset[];
  getAssetById: (id: string) => Asset | undefined;
};

// Sample initial data
const initialCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'ABC Property Management',
    orgNumber: '987654321',
    address: 'Storgata 1, 0155 Oslo',
    contactPerson: {
      name: 'John Smith',
      email: 'john@abcproperty.com',
      phone: '+47 123 45 678',
      role: 'Property Manager'
    },
    created: new Date(2025, 3, 15),
    createdBy: '1', // Admin user ID
    createdByName: 'Admin User',
    tags: ['commercial', 'managed']
  },
  {
    id: 'cust-2',
    name: 'XYZ Housing Association',
    orgNumber: '123456789',
    address: 'Parkveien 10, 0350 Oslo',
    contactPerson: {
      name: 'Emma Johnson',
      email: 'emma@xyzhousing.com',
      phone: '+47 987 65 432',
      role: 'Housing Director'
    },
    created: new Date(2025, 4, 2),
    createdBy: '1', // Admin user ID
    createdByName: 'Admin User',
    tags: ['residential', 'housing-association']
  }
];

const initialAssets: Asset[] = [
  {
    id: 'asset-1',
    customerId: 'cust-1',
    name: 'Central Office Building',
    type: 'building',
    address: 'Storgata 1, 0155 Oslo',
    buildingType: 'Office',
    area: 2500,
    buildYear: 2010,
    energyRating: 'B',
    energyRatingDate: new Date(2024, 6, 10),
    notes: 'Main office complex with 4 floors',
    created: new Date(2025, 3, 15),
    createdBy: '1',
    createdByName: 'Admin User',
    tags: ['office', 'central']
  },
  {
    id: 'asset-2',
    customerId: 'cust-2',
    name: 'Parkveien Apartments',
    type: 'building',
    address: 'Parkveien 10, 0350 Oslo',
    buildingType: 'Residential',
    area: 3800,
    buildYear: 2005,
    energyRating: 'C',
    energyRatingDate: new Date(2023, 5, 20),
    notes: 'Residential complex with 30 apartments',
    created: new Date(2025, 4, 2),
    createdBy: '1',
    createdByName: 'Admin User',
    tags: ['apartments', 'residential']
  },
  {
    id: 'asset-3',
    customerId: 'cust-1',
    name: 'Ventilation System',
    type: 'technical-system',
    notes: 'Main ventilation system for the central office building',
    created: new Date(2025, 3, 20),
    createdBy: '1',
    createdByName: 'Admin User',
    tags: ['ventilation', 'technical']
  }
];

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [assets, setAssets] = useState<Asset[]>(initialAssets);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers));
    localStorage.setItem('assets', JSON.stringify(assets));
  }, [customers, assets]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCustomers = localStorage.getItem('customers');
    const savedAssets = localStorage.getItem('assets');
    
    if (savedCustomers) {
      try {
        const parsedCustomers: Customer[] = JSON.parse(savedCustomers);
        // Convert date strings back to Date objects
        const processedCustomers = parsedCustomers.map(customer => ({
          ...customer,
          created: new Date(customer.created)
        }));
        setCustomers(processedCustomers);
      } catch (error) {
        console.error('Error parsing saved customers:', error);
      }
    }

    if (savedAssets) {
      try {
        const parsedAssets: Asset[] = JSON.parse(savedAssets);
        // Convert date strings back to Date objects
        const processedAssets = parsedAssets.map(asset => ({
          ...asset,
          created: new Date(asset.created),
          energyRatingDate: asset.energyRatingDate ? new Date(asset.energyRatingDate) : undefined
        }));
        setAssets(processedAssets);
      } catch (error) {
        console.error('Error parsing saved assets:', error);
      }
    }
  }, []);

  // Customer operations
  const addCustomer = (customerData: Omit<Customer, 'id' | 'created' | 'createdBy' | 'createdByName'>) => {
    if (!user) return '';

    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      created: new Date(),
      createdBy: user.id,
      createdByName: user.name
    };

    setCustomers([...customers, newCustomer]);
    return newCustomer.id;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(customers.map(customer => 
      customer.id === id ? { ...customer, ...updates } : customer
    ));
  };

  const deleteCustomer = (id: string) => {
    // First, delete all assets associated with this customer
    setAssets(assets.filter(asset => asset.customerId !== id));
    // Then, delete the customer
    setCustomers(customers.filter(customer => customer.id !== id));
  };

  // Asset operations
  const addAsset = (assetData: Omit<Asset, 'id' | 'created' | 'createdBy' | 'createdByName'>) => {
    if (!user) return '';

    const newAsset: Asset = {
      ...assetData,
      id: `asset-${Date.now()}`,
      created: new Date(),
      createdBy: user.id,
      createdByName: user.name
    };

    setAssets([...assets, newAsset]);
    return newAsset.id;
  };

  const updateAsset = (id: string, updates: Partial<Asset>) => {
    setAssets(assets.map(asset => 
      asset.id === id ? { ...asset, ...updates } : asset
    ));
  };

  const deleteAsset = (id: string) => {
    setAssets(assets.filter(asset => asset.id !== id));
  };

  // Lookup operations
  const getCustomerById = (id: string) => {
    return customers.find(customer => customer.id === id);
  };

  const getCustomerAssets = (customerId: string) => {
    return assets.filter(asset => asset.customerId === customerId);
  };

  const getAssetById = (id: string) => {
    return assets.find(asset => asset.id === id);
  };

  return (
    <CustomerContext.Provider
      value={{
        customers,
        assets,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addAsset,
        updateAsset,
        deleteAsset,
        getCustomerById,
        getCustomerAssets,
        getAssetById
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export const useCustomers = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
};
