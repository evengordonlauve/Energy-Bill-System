
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';

// Define categories and sections based on provided checklist structure
export type ChecklistSection = {
  id: string;
  name: string;
  items: ChecklistItem[];
};

export type ChecklistItem = {
  id: string;
  text: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  options?: string[]; // For select type
  required: boolean;
};

export type ChecklistResponse = {
  itemId: string;
  value: string | number | boolean | Date | null;
  notes?: string;
};

export type Checklist = {
  id: string;
  name: string;
  customerId: string;
  assetId?: string;
  created: Date;
  createdBy: string;
  createdByName: string;
  lastUpdated: Date;
  status: 'draft' | 'completed' | 'in-progress';
  responses: Record<string, ChecklistResponse>;
  tags: string[];
  groups: string[]; // Groups this checklist belongs to
};

type ChecklistContextType = {
  checklists: Checklist[];
  sections: ChecklistSection[];
  addChecklist: (data: Omit<Checklist, 'id' | 'created' | 'createdBy' | 'createdByName' | 'lastUpdated'>) => string;
  updateChecklist: (id: string, updates: Partial<Checklist>) => void;
  updateChecklistResponse: (id: string, itemId: string, response: ChecklistResponse) => void;
  deleteChecklist: (id: string) => void;
  getChecklistById: (id: string) => Checklist | undefined;
  getChecklistsByCustomer: (customerId: string) => Checklist[];
  getChecklistsByAsset: (assetId: string) => Checklist[];
  getChecklistsByGroup: (groupId: string) => Checklist[];
  getAvailableGroups: () => string[];
};

// List of available groups
const AVAILABLE_GROUPS = ['all', 'basic', 'energy', 'commercial', 'residential'];

// Predefined checklist sections and items
const initialChecklistSections: ChecklistSection[] = [
  {
    id: 'building-info',
    name: 'Bygginfo',
    items: [
      { id: 'owner', text: 'Byggeier', type: 'text', required: true },
      { id: 'tenant', text: 'Leietaker', type: 'text', required: true },
      { id: 'customer-contact', text: 'Hvem blir evt. kunde og kontaktperson. Hvem skal ha rapport fra energianalyse - hvem tar avgjørelsene på evt. investering. Kontaktinfo', type: 'text', required: true },
      { id: 'org-number', text: 'Org nr', type: 'text', required: true },
      { id: 'building-contact', text: 'Kontaktperson på bygget . Navn, tlf og e-post.', type: 'text', required: true },
      { id: 'address', text: 'Adresse', type: 'text', required: true },
      { id: 'building-name', text: 'Bygg navn', type: 'text', required: true },
      { id: 'building-type', text: 'Bygg type', type: 'select', options: ['Office', 'Retail', 'Residential', 'Industrial', 'Mixed use'], required: true },
      { id: 'area', text: 'Areal (BRA)', type: 'number', required: true },
      { id: 'build-year', text: 'Byggeår (hovedbygg og evt. tilbygg)', type: 'text', required: true },
      { id: 'energy-rating', text: 'Energimerke og foreligger energiattest', type: 'text', required: false },
      { id: 'energy-rating-date', text: 'Dato for energiattest', type: 'date', required: false },
      { id: 'energy-assessment', text: 'Krav til energivurdering tekniske anlegg?', type: 'text', required: false },
    ]
  },
  {
    id: 'service-operations',
    name: 'Service, drift, avtaler',
    items: [
      { id: 'service-agreement', text: 'Hvem har serviceavtale / rammeavtale på elektro, rør og ventilasjon.', type: 'text', required: false },
      { id: 'building-operation', text: 'Hvem drifter bygget i dag (SD anlegg / EOS etc)', type: 'text', required: false },
      { id: 'electricity-agreement', text: 'Strømavtale - spot eller fastpris. Evt. prisnivå ved fastpris.', type: 'text', required: false },
      { id: 'electricity-meter', text: 'Hvem er strømmåler registrert på - byggeier / leietaker', type: 'text', required: false },
    ]
  },
  {
    id: 'usage-pattern',
    name: 'Bruksmønster',
    items: [
      { id: 'building-usage', text: 'Hvordan brukes bygget - er det personer i alle arealer hele dagen og hver dag i uken.', type: 'text', required: false },
      { id: 'opening-hours', text: 'Åpningstid / arbeidstid', type: 'text', required: false },
      { id: 'holiday-operation', text: 'Drift ferier/helligdager (Gir en pekepinn på hvor godt bygget er driftet)', type: 'text', required: false },
      { id: 'partial-usage', text: 'Er hele eller kun deler av bygget i bruk', type: 'text', required: false },
      { id: 'heated-areas', text: 'Hvilke arealer er oppvarmet - hvilken temperatur', type: 'text', required: false },
    ]
  },
  {
    id: 'fdv-drawings',
    name: 'FDV og tegninger',
    items: [
      { id: 'previous-measures', text: 'Oversikt over tidligere utførte tiltak eller oppgraderinger teknisk anlegg / byggteknisk', type: 'text', required: false },
      { id: 'access-docs', text: 'Tilgang til relevante underlag', type: 'text', required: false },
      { id: 'floor-plans', text: 'Plantegninger', type: 'boolean', required: false },
      { id: 'fdv-heating', text: 'FDV på varmeanlegg / ventilasjon etc', type: 'boolean', required: false },
      { id: 'service-reports', text: 'Service rapporter ventilasjon / varmeanlegg', type: 'boolean', required: false },
      { id: 'other-docs', text: 'Annet', type: 'text', required: false },
    ]
  },
  {
    id: 'consumption',
    name: 'Forbruk',
    items: [
      { id: 'meter-data', text: 'Innhenting av måler data (zohm eller få tilsendt 3 siste år, timeverdier)', type: 'text', required: false },
      { id: 'district-heating', text: 'Forbruk og faktura/kost oversikt ved fjernvarme, oljefyr e.l', type: 'text', required: false },
      { id: 'meter-overview', text: 'Oversikt over måler anlegg og hvilke bygg/areal de dekker', type: 'text', required: false },
      { id: 'sub-meters', text: 'Har anlegget undermålere / minusmålere til f.eks. leietakere eller andre forbrukere', type: 'text', required: false },
    ]
  },
  {
    id: 'photo-documentation',
    name: 'Bildedokumentasjon',
    items: [
      { id: 'photos-meters', text: 'Målere', type: 'boolean', required: false },
      { id: 'photos-panels', text: 'Tavler', type: 'boolean', required: false },
      { id: 'photos-circuit-lists', text: 'Kurslister', type: 'boolean', required: false },
      { id: 'photos-drawings', text: 'Tegninger', type: 'boolean', required: false },
      { id: 'photos-areas', text: 'Arealer -Generelt av bygget / anlegget', type: 'boolean', required: false },
      { id: 'photos-technical', text: 'Teknisk rom - alle vinkler - ledig areal for utvidelser ++', type: 'boolean', required: false },
      { id: 'photos-systems', text: 'Tekniske anlegg – VP, vent, varmeanlegg, pumper, beredere ++', type: 'boolean', required: false },
      { id: 'photos-roof', text: 'Tak areal (ved sol beregninger)', type: 'boolean', required: false },
      { id: 'photos-facade', text: 'Fasade (sol eller til frontside rapport)', type: 'boolean', required: false },
      { id: 'photos-flow-diagram', text: 'Flytskjema SD anlegg (fra tegninger eller skjermbilde PC)', type: 'boolean', required: false },
      { id: 'photos-control-schema', text: 'Styreskjema / kurslister vent anlegg (kartlegge effekter o.l)', type: 'boolean', required: false },
    ]
  },
  {
    id: 'technical-systems',
    name: 'Tekniske anlegg',
    items: [
      {
        id: 'heating-system',
        text: 'Varmeanlegg - Type distribusjon (el, vannbåren, ventilasjon, luft/luft)',
        type: 'text',
        required: false
      },
      {
        id: 'electric-heating',
        text: 'Ved el oppvarming: varmekabler, panelovn, stråleovn, varmluftsvifter - effekter, antall',
        type: 'text',
        required: false
      },
      {
        id: 'water-heating',
        text: 'Ved vannbåren oppvarming: Radiatorer (type - lav temp eller høy temp) / gulvvarme / aero tempere',
        type: 'text',
        required: false
      },
      {
        id: 'heat-sources',
        text: 'Type varmekilder - El kjele, Varmtvannstanker, Oljefyr / biofyr, Varmepumper, Fjernvarme',
        type: 'text',
        required: false
      },
      {
        id: 'heat-source-details',
        text: 'Notere ned effekter og antall',
        type: 'text',
        required: false
      },
      {
        id: 'heat-areas',
        text: 'Beskrive evt ulike varmekilder i ulike arealer',
        type: 'text',
        required: false
      }
    ]
  },
  {
    id: 'ventilation',
    name: 'Ventilasjon',
    items: [
      { id: 'ventilation-units', text: 'Antall, merke, modell', type: 'text', required: false },
      { id: 'ventilation-age', text: 'Alder', type: 'text', required: false },
      { id: 'ventilation-condition', text: 'Tilstand', type: 'text', required: false },
      { id: 'ventilation-airflow', text: 'Luftmengde', type: 'text', required: false },
      { id: 'ventilation-areas', text: 'Areal anleggene dekker', type: 'text', required: false },
      { id: 'ventilation-heat', text: 'Type oppvarmingskilde', type: 'text', required: false },
      { id: 'ventilation-cooling', text: 'Kjøling - type. Integrert DX / kjølebatteri / kombibatteri', type: 'text', required: false },
      { id: 'ventilation-fan', text: 'Type vifte', type: 'text', required: false },
      { id: 'ventilation-recovery', text: 'Type varmegjenvinner', type: 'text', required: false },
      { id: 'ventilation-hours', text: 'Driftstider', type: 'text', required: false },
      { id: 'ventilation-zones', text: 'Inndeling soner eller mengde regulert', type: 'text', required: false },
      { id: 'ventilation-vav', text: 'VAV spjeld i anlegget (soneinndeling)', type: 'text', required: false },
      { id: 'ventilation-recirculation', text: 'Omluft seksjon', type: 'text', required: false },
      { id: 'ventilation-control', text: 'Styring - SD / manuell kontroller', type: 'text', required: false },
    ]
  },
  {
    id: 'control-systems',
    name: 'Styringssystem',
    items: [
      { id: 'control-central-system', text: 'System – type. Omfang', type: 'text', required: false },
      { id: 'control-calendar', text: 'Kalenderstyrt eller ukestyring?', type: 'text', required: false },
      { id: 'control-hours', text: 'Driftstider', type: 'text', required: false },
      { id: 'control-outer-system', text: 'Type system', type: 'text', required: false },
      { id: 'control-regulation', text: 'Type regulering (temp, co2, tilstedeværelse ++)', type: 'text', required: false },
      { id: 'control-sensors', text: 'Type sensorer', type: 'text', required: false },
      { id: 'control-room', text: 'Romstyring eller etasjestyrt', type: 'text', required: false },
      { id: 'control-night', text: 'Nattsenk', type: 'text', required: false },
      { id: 'control-eos', text: 'EOS', type: 'text', required: false },
    ]
  },
  {
    id: 'lighting',
    name: 'Belysning',
    items: [
      { id: 'lighting-type', text: 'Type', type: 'text', required: false },
      { id: 'lighting-count', text: 'Antall', type: 'text', required: false },
      { id: 'lighting-power', text: 'Effekt', type: 'text', required: false },
      { id: 'lighting-control', text: 'Styring', type: 'text', required: false },
      { id: 'lighting-hours', text: 'Driftstimer', type: 'text', required: false },
      { id: 'lighting-environment', text: 'Miljø / IP grad', type: 'text', required: false },
    ]
  },
  {
    id: 'other-systems',
    name: 'Andre anlegg',
    items: [
      { id: 'solar-panels', text: 'Solcelleanlegg', type: 'text', required: false },
      { id: 'battery', text: 'Batteri', type: 'text', required: false },
      { id: 'snow-melt-area', text: 'Snøsmelteanlegg - Arealer / plassering', type: 'text', required: false },
      { id: 'snow-melt-type', text: 'Snøsmelteanlegg - Type - vannbåren eller varmekabler', type: 'text', required: false },
      { id: 'snow-melt-power', text: 'Snøsmelteanlegg - Effekt', type: 'text', required: false },
      { id: 'snow-melt-control', text: 'Snøsmelteanlegg - Styring type. Kun temp eller kombi temp / fukt', type: 'text', required: false },
      { id: 'sun-shade-type', text: 'Solskjerm - Type', type: 'text', required: false },
      { id: 'sun-shade-control', text: 'Solskjerm - Styring', type: 'text', required: false },
      { id: 'charging-type', text: 'Ladeanlegg - Type', type: 'text', required: false },
      { id: 'charging-count', text: 'Ladeanlegg - Antall', type: 'text', required: false },
      { id: 'charging-current', text: 'Ladeanlegg - AC / DC', type: 'text', required: false },
      { id: 'charging-power', text: 'Ladeanlegg - Effekter', type: 'text', required: false },
      { id: 'charging-potential', text: 'Ladeanlegg - Potensial for Laddel', type: 'text', required: false },
    ]
  },
  {
    id: 'electric-loads',
    name: 'Store el. laster',
    items: [
      { id: 'loads-machines', text: 'Maskiner', type: 'text', required: false },
      { id: 'loads-compressors', text: 'Kompressorer', type: 'text', required: false },
      { id: 'loads-ovens', text: 'Ovner', type: 'text', required: false },
      { id: 'loads-other', text: 'Annet', type: 'text', required: false },
    ]
  }
];

// Sample initial checklist
const initialChecklists: Checklist[] = [
  {
    id: 'check-1',
    name: 'Central Office Building Checklist',
    customerId: 'cust-1',
    assetId: 'asset-1',
    created: new Date(2025, 4, 15),
    createdBy: '1', // Admin user ID
    createdByName: 'Admin User',
    lastUpdated: new Date(2025, 4, 15),
    status: 'in-progress',
    responses: {
      'owner': { itemId: 'owner', value: 'ABC Property Management', notes: '' },
      'tenant': { itemId: 'tenant', value: 'Tech Solutions Inc.', notes: '' },
      'org-number': { itemId: 'org-number', value: '987654321', notes: '' }
    },
    tags: ['commercial', 'office'],
    groups: ['all', 'commercial']
,
    groups: ['all', 'commercial']
  }
];

const ChecklistContext = createContext<ChecklistContextType | undefined>(undefined);

export function ChecklistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [checklists, setChecklists] = useState<Checklist[]>(initialChecklists);
  const [sections] = useState<ChecklistSection[]>(initialChecklistSections);

  // Save to localStorage whenever checklists change
  useEffect(() => {
    localStorage.setItem('checklists', JSON.stringify(checklists));
  }, [checklists]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedChecklists = localStorage.getItem('checklists');
    if (savedChecklists) {
      try {
        const parsedChecklists: Checklist[] = JSON.parse(savedChecklists);
        // Convert date strings back to Date objects
        const processedChecklists = parsedChecklists.map(checklist => ({
          ...checklist,
          created: new Date(checklist.created),
          lastUpdated: new Date(checklist.lastUpdated),
          groups: checklist.groups || [] // Add backward compatibility for groups
        }));
        setChecklists(processedChecklists);
      } catch (error) {
        console.error('Error parsing saved checklists:', error);
      }
    }
  }, []);

  const addChecklist = (data: Omit<Checklist, 'id' | 'created' | 'createdBy' | 'createdByName' | 'lastUpdated'>) => {
    if (!user) return '';

    const newChecklist: Checklist = {
      ...data,
      id: `check-${Date.now()}`,
      created: new Date(),
      createdBy: user.id,
      createdByName: user.name,
      lastUpdated: new Date(),
      groups: data.groups || [] // Ensure groups is always initialized
    };

    setChecklists([...checklists, newChecklist]);
    return newChecklist.id;
  };

  const updateChecklist = (id: string, updates: Partial<Checklist>) => {
    setChecklists(checklists.map(checklist => 
      checklist.id === id ? { ...checklist, ...updates, lastUpdated: new Date() } : checklist
    ));
  };

  const updateChecklistResponse = (id: string, itemId: string, response: ChecklistResponse) => {
    const checklist = checklists.find(c => c.id === id);
    if (!checklist) return;

    const updatedResponses = {
      ...checklist.responses,
      [itemId]: response
    };

    updateChecklist(id, { responses: updatedResponses });
  };

  const deleteChecklist = (id: string) => {
    setChecklists(checklists.filter(checklist => checklist.id !== id));
  };

  const getChecklistById = (id: string) => {
    return checklists.find(checklist => checklist.id === id);
  };

  const getChecklistsByCustomer = (customerId: string) => {
    return checklists.filter(checklist => checklist.customerId === customerId);
  };

  const getChecklistsByAsset = (assetId: string) => {
    return checklists.filter(checklist => checklist.assetId === assetId);
  };
  
  const getChecklistsByGroup = (groupId: string) => {
    return checklists.filter(checklist => checklist.groups?.includes(groupId));
  };
  
  const getAvailableGroups = () => {
    return AVAILABLE_GROUPS;
  };

  return (
    <ChecklistContext.Provider
      value={{
        checklists,
        sections,
        addChecklist,
        updateChecklist,
        updateChecklistResponse,
        deleteChecklist,
        getChecklistById,
        getChecklistsByCustomer,
        getChecklistsByAsset,
        getChecklistsByGroup,
        getAvailableGroups
      }}
    >
      {children}
    </ChecklistContext.Provider>
  );
}

export const useChecklists = () => {
  const context = useContext(ChecklistContext);
  if (!context) {
    throw new Error('useChecklists must be used within a ChecklistProvider');
  }
  return context;
};
