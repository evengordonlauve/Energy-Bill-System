
import React, { useState } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';

interface Tenant {
  id: number;
  name: string;
  area: number;
  el: number;
  discount: number;
  distE: 'consumption' | 'area';
  distP: 'consumption' | 'area';
}

interface TenantCardProps {
  tenant: Tenant;
  onChange: (tenant: Tenant) => void;
  onRemove: (id: number) => void;
}
function TenantCard({ tenant, onChange, onRemove }: TenantCardProps) {
  const handle =
    (field: keyof Tenant) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value =
        field === 'name' ? e.target.value : parseFloat(e.target.value) || 0;
      onChange({ ...tenant, [field]: value });
    };

  return (
    <div className="relative border rounded p-3 bg-gray-50">
      <button
        type="button"
        onClick={() => onRemove(tenant.id)}
        className="absolute top-1 right-1 text-gray-500 hover:text-gray-700"
      >
        &times;
      </button>
      <label className="block text-sm mb-1">Navn</label>
      <input
        type="text"
        value={tenant.name}
        onChange={handle('name')}
        className="w-full p-1 border rounded mb-1 focus:ring-blue-300 focus:outline-none"
      />
      <label className="block text-sm mb-1">Areal (m²)</label>
      <input
        type="number"
        value={tenant.area}
        onChange={handle('area')}
        className="w-full p-1 border rounded mb-1 focus:ring-blue-300 focus:outline-none"
      />
      <label className="block text-sm mb-1">El-forbruk (kWh)</label>
      <input
        type="number"
        value={tenant.el}
        onChange={handle('el')}
        className="w-full p-1 border rounded mb-1 focus:ring-blue-300 focus:outline-none"
      />
      <label className="block text-sm mb-1">Rabatt sol (%)</label>
      <input
        type="number"
        value={tenant.discount}
        onChange={handle('discount')}
        className="w-full p-1 border rounded mb-2 focus:ring-blue-300 focus:outline-none text-sm"
      />
      <div className="grid grid-cols-2 gap-2 mt-2">
        <div>
          <label className="block text-sm">Fordel el</label>
          <select
            value={tenant.distE}
            onChange={handle('distE')}
            className="w-full p-1 border rounded focus:ring-blue-300 focus:outline-none text-xs"
          >
            <option value="consumption">Forbruk</option>
            <option value="area">Areal</option>
          </select>
        </div>
        <div>
          <label className="block text-sm">Fordel sol</label>
          <select
            value={tenant.distP}
            onChange={handle('distP')}
            className="w-full p-1 border rounded focus:ring-blue-300 focus:outline-none text-xs"
          >
            <option value="consumption">Forbruk</option>
            <option value="area">Areal</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default function CostCalculations() {
  const [totalArea, setTotalArea] = useState(1000);
  const [commonArea, setCommonArea] = useState(200);
  const [totalElectric, setTotalElectric] = useState(12000);
  const [totalThermal, setTotalThermal] = useState(8000);
  const [totalWater, setTotalWater] = useState(120);
  const [prodEnergy, setProdEnergy] = useState(4000);
  const [exportEnergy, setExportEnergy] = useState(2500);
  const [priceConsumption, setPriceConsumption] = useState(0.64);
  const [priceProduction, setPriceProduction] = useState(0.64);
  const [gridFixed, setGridFixed] = useState(300);
  const [gridEnergy, setGridEnergy] = useState(0.3);
  const [priceThermal, setPriceThermal] = useState(0.7);
  const [priceWater, setPriceWater] = useState(50);

  const [nextId, setNextId] = useState(2);
  const [tenants, setTenants] = useState<Tenant[]>([
    {
      id: 0,
      name: 'Butikk A',
      area: 300,
      el: 600,
      discount: 0,
      distE: 'consumption',
      distP: 'consumption',
    },
    {
      id: 1,
      name: 'Kontor B',
      area: 500,
      el: 200,
      discount: 0,
      distE: 'consumption',
      distP: 'consumption',
    },
  ]);

  const [results, setResults] = useState(null);

  const addTenant = () => {
    setTenants([
      ...tenants,
      {
        id: nextId,
        name: '',
        area: 100,
        el: 1000,
        discount: 0,
        distE: 'consumption',
        distP: 'consumption',
      },
    ]);
    setNextId(nextId + 1);
  };

  const updateTenant = (updated: Tenant) => {
    setTenants(tenants.map((t) => (t.id === updated.id ? updated : t)));
  };

  const removeTenant = (id: number) => {
    setTenants(tenants.filter((t) => t.id !== id));
  };

  const calculate = () => {
    const TE = totalElectric;
    const PE = prodEnergy;
    const EE = exportEnergy;
    const PC = priceConsumption;
    const PP = priceProduction;
    const PT = priceThermal;
    const PW = priceWater;
    const TT = totalThermal;
    const TW = totalWater;

    const selfConsumed = PE - EE;
    const selfPercent = PE > 0 ? ((selfConsumed / PE) * 100).toFixed(1) : '0.0';

    const tenantResults = tenants.map((t) => {
      const areaPct = totalArea > 0 ? ((t.area / totalArea) * 100).toFixed(1) : '0.0';
      const elCost =
        t.distE === 'consumption'
          ? (t.el / TE) * PC * TE
          : (t.area / totalArea) * PC * TE;
      const thCost = PT * TT;
      const wCost = PW * TW;
      const exportIncome = EE * PP;
      const baseShare =
        t.distP === 'consumption'
          ? (t.el / TE) * exportIncome
          : (t.area / totalArea) * exportIncome;
      const exportShare = baseShare * (1 - t.discount / 100);
      const total = elCost + thCost + wCost - exportShare;
      return {
        id: t.id,
        name: t.name,
        areaPct,
        elCost,
        exportShare,
        discount: t.discount,
        total,
      };
    });

    setResults({ selfConsumed: selfConsumed.toFixed(1), selfPercent, tenantResults });
  };


  return (
    <Layout>
      <Head>
        <title>Kostnads- og Inntektsfordeling</title>
        <script src="https://cdn.tailwindcss.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="max-w-4xl mx-auto p-6 mt-10 bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-semibold text-center mb-6">Kostnads- og Inntektsfordeling</h1>

        {/* 1. Byggstruktur */}
        <section className="mb-6">
          <h2 className="font-medium mb-3 border-b pb-1">1. Byggstruktur</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm">Totalt byggareal (m²)</label>
              <input

                type="number"
                value={totalArea}
                onChange={(e) => setTotalArea(parseFloat(e.target.value) || 0)}

                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Fellesareal (m²)</label>
              <input
                type="number"
                value={commonArea}
                onChange={(e) => setCommonArea(parseFloat(e.target.value) || 0)}

                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
        </section>

        {/* 2. Leietakere */}
        <section className="mb-6">
          <h2 className="font-medium mb-3 border-b pb-1">2. Leietakere</h2>

          <div className="space-y-3">
            {tenants.map((t) => (
              <TenantCard
                key={t.id}
                tenant={t}
                onChange={updateTenant}
                onRemove={removeTenant}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={addTenant}
            id="addTenant"
            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-3 rounded transition"
          >
            + Legg til leietaker
          </button>
        </section>

        {/* 3. Forbruk & produksjon */}
        <section className="mb-6">
          <h2 className="font-medium mb-3 border-b pb-1">3. Forbruk & Produksjon (Bygget totalt)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1 text-sm">El-forbruk (kWh/mnd)</label>
              <input

                type="number"
                value={totalElectric}
                onChange={(e) => setTotalElectric(parseFloat(e.target.value) || 0)}
                id="total_electric"
                type="number"
                defaultValue="12000"

                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Termisk forbruk (kWh/mnd)</label>
              <input

                type="number"
                value={totalThermal}
                onChange={(e) => setTotalThermal(parseFloat(e.target.value) || 0)}

                id="total_thermal"
                type="number"
                defaultValue="8000"

                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Vannforbruk (m³/mnd)</label>
              <input

                type="number"
                value={totalWater}
                onChange={(e) => setTotalWater(parseFloat(e.target.value) || 0)}
                id="total_water"
                type="number"
                defaultValue="120"

                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Produsert solenergi (kWh/mnd)</label>
              <input

                type="number"
                value={prodEnergy}
                onChange={(e) => setProdEnergy(parseFloat(e.target.value) || 0)}
                id="prod_energy"
                type="number"
                defaultValue="4000"

                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Eksportert energi (kWh/mnd)</label>
              <input

                type="number"
                value={exportEnergy}
                onChange={(e) => setExportEnergy(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
        </section>

        {/* 4. Prisstruktur */}
        <section className="mb-6">
          <h2 className="font-medium mb-3 border-b pb-1">4. Prisstruktur</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1 text-sm">Spotpris forbruk (kr/kWh)</label>
              <input
                type="number"
                step="0.01"
                value={priceConsumption}
                onChange={(e) => setPriceConsumption(parseFloat(e.target.value) || 0)}

                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Spotpris produksjon (kr/kWh)</label>
              <input

                type="number"
                step="0.01"
                value={priceProduction}
                onChange={(e) => setPriceProduction(parseFloat(e.target.value) || 0)}

                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Nettleie fastledd (kr/mnd)</label>
              <input

                type="number"
                value={gridFixed}
                onChange={(e) => setGridFixed(parseFloat(e.target.value) || 0)}

                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Nettleie energiledd (kr/kWh)</label>
              <input

                type="number"
                step="0.01"
                value={gridEnergy}
                onChange={(e) => setGridEnergy(parseFloat(e.target.value) || 0)}

                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Pris termisk energi (kr/kWh)</label>
              <input

                type="number"
                step="0.01"
                value={priceThermal}
                onChange={(e) => setPriceThermal(parseFloat(e.target.value) || 0)}

                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Pris vann (kr/m³)</label>
              <input

                type="number"
                value={priceWater}
                onChange={(e) => setPriceWater(parseFloat(e.target.value) || 0)}

                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
        </section>

        {/* Beregn knapp */}
        <div className="text-center mb-6">
          <button

            type="button"
            onClick={calculate}

            className="bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-6 rounded transition"
          >
            Beregn kostnader
          </button>
        </div>

        {/* 5. Resultater */}

        {results && (
          <section id="results">
            <h2 className="font-medium mb-3 border-b pb-1">5. Resultater</h2>
            <div className="mb-4 p-3 bg-white rounded shadow">
              <p className="text-sm">
                <strong>Egenforbruk bygget:</strong> {results.selfConsumed} kWh ({results.selfPercent} %)
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.tenantResults.map((r) => (
                <div key={r.id} className="p-3 bg-white rounded shadow">
                  <h3 className="font-semibold mb-1">{r.name}</h3>
                  <p className="text-sm">Arealandel: {r.areaPct} %</p>
                  <p className="text-sm">El-kostnad: {r.elCost.toFixed(1)} kr</p>
                  <p className="text-sm">Produksjonsandel (rabatt {r.discount}%): -{r.exportShare.toFixed(1)} kr</p>
                  <p className="font-semibold text-right">Totalt: {r.total.toFixed(1)} kr</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

    </Layout>
  );
}
