import Head from 'next/head';
import Layout from '../../components/Layout';

export default function CostCalculations() {
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
                id="total_area"
                type="number"
                defaultValue="1000"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Fellesareal (m²)</label>
              <input
                id="common_area"
                type="number"
                defaultValue="200"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
        </section>

        {/* 2. Leietakere */}
        <section className="mb-6">
          <h2 className="font-medium mb-3 border-b pb-1">2. Leietakere</h2>
          <div id="tenants" className="space-y-3" />
          <button
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
                id="total_electric"
                type="number"
                defaultValue="12000"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Termisk forbruk (kWh/mnd)</label>
              <input
                id="total_thermal"
                type="number"
                defaultValue="8000"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Vannforbruk (m³/mnd)</label>
              <input
                id="total_water"
                type="number"
                defaultValue="120"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Produsert solenergi (kWh/mnd)</label>
              <input
                id="prod_energy"
                type="number"
                defaultValue="4000"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Eksportert energi (kWh/mnd)</label>
              <input
                id="export_energy"
                type="number"
                defaultValue="2500"
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
                id="price_consumption"
                type="number"
                step="0.01"
                defaultValue="0.64"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Spotpris produksjon (kr/kWh)</label>
              <input
                id="price_production"
                type="number"
                step="0.01"
                defaultValue="0.64"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Nettleie fastledd (kr/mnd)</label>
              <input
                id="grid_fixed"
                type="number"
                defaultValue="300"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Nettleie energiledd (kr/kWh)</label>
              <input
                id="grid_energy"
                type="number"
                step="0.01"
                defaultValue="0.30"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Pris termisk energi (kr/kWh)</label>
              <input
                id="price_thermal"
                type="number"
                step="0.01"
                defaultValue="0.70"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Pris vann (kr/m³)</label>
              <input
                id="price_water"
                type="number"
                defaultValue="50"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
        </section>

        {/* Beregn knapp */}
        <div className="text-center mb-6">
          <button
            id="calculateBtn"
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-6 rounded transition"
          >
            Beregn kostnader
          </button>
        </div>

        {/* 5. Resultater */}
        <section id="results" className="hidden">
          <h2 className="font-medium mb-3 border-b pb-1">5. Resultater</h2>
          <div className="mb-4 p-3 bg-white rounded shadow">
            <p className="text-sm">
              <strong>Egenforbruk bygget:</strong>{' '}
              <span id="self_consumed" /> kWh (<span id="self_percent" /> %)
            </p>
          </div>
          <div id="cards" className="grid grid-cols-1 md:grid-cols-2 gap-4" />
        </section>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
    let tenantCount = 0;
    const tenantContainer = document.getElementById('tenants');

    function createTenantCard(data = {}) {
      const id = tenantCount++;
      const card = document.createElement('div');
      card.className = 'relative border rounded p-3 bg-gray-50';
      card.innerHTML = \`
        <button data-id="\${id}" class="absolute top-1 right-1 text-gray-500 hover:text-gray-700">&times;</button>
        <label class="block text-sm mb-1">Navn</label>
        <input type="text" id="name_\${id}" value="\${data.name || ''}" class="w-full p-1 border rounded mb-1 focus:ring-blue-300 focus:outline-none" />
        <label class="block text-sm mb-1">Areal (m²)</label>
        <input type="number" id="area_\${id}" value="\${data.area || 100}" class="w-full p-1 border rounded mb-1 focus:ring-blue-300 focus:outline-none" />
        <label class="block text-sm mb-1">El-forbruk (kWh)</label>
        <input type="number" id="el_\${id}" value="\${data.el || 1000}" class="w-full p-1 border rounded mb-1 focus:ring-blue-300 focus:outline-none" />
        <label class="block text-sm mb-1">Rabatt sol (%)</label>
        <input type="number" id="discount_\${id}" value="0" class="w-full p-1 border rounded mb-2 focus:ring-blue-300 focus:outline-none text-sm" />
        <div class="grid grid-cols-2 gap-2 mt-2">
          <div>
            <label class="block text-sm">Fordel el</label>
            <select id="dist_e_\${id}" class="w-full p-1 border rounded focus:ring-blue-300 focus:outline-none text-xs">
              <option value="consumption">Forbruk</option>
              <option value="area">Areal</option>
            </select>
          </div>
          <div>
            <label class="block text-sm">Fordel sol</label>
            <select id="dist_p_\${id}" class="w-full p-1 border rounded focus:ring-blue-300 focus:outline-none text-xs">
              <option value="consumption">Forbruk</option>
              <option value="area">Areal</option>
            </select>
          </div>
        </div>
      \`;
      tenantContainer.appendChild(card);
      card.querySelector('button').onclick = () => card.remove();
    }

    document.getElementById('addTenant').onclick = () => createTenantCard();
    createTenantCard({ name: 'Butikk A', area: 300, el: 600 });
    createTenantCard({ name: 'Kontor B', area: 500, el: 200 });

    document.getElementById('calculateBtn').onclick = () => {
      const TE = parseFloat(document.getElementById('total_electric').value);
      const PE = parseFloat(document.getElementById('prod_energy').value);
      const EE = parseFloat(document.getElementById('export_energy').value);
      const PC = parseFloat(document.getElementById('price_consumption').value);
      const PP = parseFloat(document.getElementById('price_production').value);
      const PT = parseFloat(document.getElementById('price_thermal').value);
      const PW = parseFloat(document.getElementById('price_water').value);
      const TT = parseFloat(document.getElementById('total_thermal').value);
      const TW = parseFloat(document.getElementById('total_water').value);

      // Egenforbruk bygget
      const selfConsumed = PE - EE;
      const selfPercent = PE > 0 ? ((selfConsumed / PE) * 100).toFixed(1) : '0.0';
      document.getElementById('self_consumed').textContent = selfConsumed.toFixed(1);
      document.getElementById('self_percent').textContent = selfPercent;

      const cardsDiv = document.getElementById('cards');
      cardsDiv.innerHTML = '';

      document.querySelectorAll('#tenants > div').forEach(card => {
        const id = card.querySelector('button').dataset.id;
        const name = document.getElementById(`name_${id}`).value;
        const area = parseFloat(document.getElementById(`area_${id}`).value);
        const el = parseFloat(document.getElementById(`el_${id}`).value);
        const discount = parseFloat(document.getElementById(`discount_${id}`).value) / 100;
        const distE = document.getElementById(`dist_e_\${id}`).value;
        const distP = document.getElementById(`dist_p_\${id}`).value;

        const totalArea = parseFloat(document.getElementById('total_area').value);
        const areaPct = totalArea > 0 ? ((area / totalArea) * 100).toFixed(1) : '0.0';

        const elCost =
          distE === 'consumption' ? (el / TE) * PC * TE : (area / totalArea) * PC * TE;
        const thCost = (thermal => (thermal / TT) * PT * TT)(
          parseFloat(document.getElementById('total_thermal').value)
        );
        const wCost = (water => (water / TW) * PW * TW)(
          parseFloat(document.getElementById('total_water').value)
        );
        const exportIncome = EE * PP;
        const baseShare =
          distP === 'consumption'
            ? (el / TE) * exportIncome
            : (area / totalArea) * exportIncome;
        const exportShare = baseShare * (1 - discount);
        const total = elCost + thCost + wCost - exportShare;

        const div = document.createElement('div');
        div.className = 'p-3 bg-white rounded shadow';
        div.innerHTML = \`
          <h3 class="font-semibold mb-1">\${name}</h3>
          <p class="text-sm">Arealandel: \${areaPct} %</p>
          <p class="text-sm">El-kostnad: \${elCost.toFixed(1)} kr</p>
          <p class="text-sm">Produksjonsandel (rabatt \${(discount * 100).toFixed(0)}%): -\${exportShare.toFixed(1)} kr</p>
          <p class="font-semibold text-right">Totalt: \${total.toFixed(1)} kr</p>
        \`;
        cardsDiv.appendChild(div);
      });

      document.getElementById('results').classList.remove('hidden');
    };
  `,
        }}
      />
    </Layout>
  );
}
