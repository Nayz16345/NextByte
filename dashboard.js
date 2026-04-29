const DashboardDemo = (() => {
  const bins = [
    { id: "LX-A01", name: "Lixeira A-01", location: "Bloco A - Entrada", level: 18, battery: 94, status: "normal", x: 18, y: 30 },
    { id: "LX-A02", name: "Lixeira A-02", location: "Bloco A - Garagem", level: 72, battery: 67, status: "attention", x: 23, y: 57 },
    { id: "LX-B01", name: "Lixeira B-01", location: "Bloco B - Hall", level: 92, battery: 45, status: "critical", x: 46, y: 27 },
    { id: "LX-B02", name: "Lixeira B-02", location: "Bloco B - Jardim", level: 36, battery: 88, status: "normal", x: 50, y: 54 },
    { id: "LX-C01", name: "Lixeira C-01", location: "Bloco C - Piscina", level: 68, battery: 72, status: "attention", x: 74, y: 34 },
    { id: "LX-C02", name: "Lixeira C-02", location: "Bloco C - Salão", level: 11, battery: 98, status: "normal", x: 77, y: 61 },
    { id: "LX-D01", name: "Lixeira D-01", location: "Área externa", level: 89, battery: 31, status: "critical", x: 35, y: 76 },
    { id: "LX-D02", name: "Lixeira D-02", location: "Portaria", level: 28, battery: 85, status: "normal", x: 60, y: 79 }
  ];

  let selectedBinId = bins[0].id;
  let updateInterval = null;
  const feedCapacity = 20;
  let events = [];

  function getStatusColor(status) {
    switch (status) {
      case "normal": return "#83d461";
      case "attention": return "#f4cb63";
      case "critical": return "#ff8478";
      default: return "#ffffff";
    }
  }

  function getStatusLabel(status) {
    switch (status) {
      case "normal": return "Estável";
      case "attention": return "Atenção";
      case "critical": return "Crítico";
      default: return "-";
    }
  }

  function createMapSVG() {
    return `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-label="Mapa do condomínio">
        <defs>
          <pattern id="dash-grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="0.2" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#dash-grid)" />
        
        <!-- Ruas / Caminhos Internos -->
        <path d="M 0,45 L 100,45 M 35,0 L 35,100 M 68,0 L 68,100" stroke="rgba(255,255,255,0.05)" stroke-width="2" />
        
        <!-- Blocos de Edifícios -->
        <g stroke="rgba(255,255,255,0.1)" stroke-width="0.5" fill="rgba(255,255,255,0.02)">
          <rect x="10" y="10" width="20" height="30" rx="2" /> <!-- Bloco A -->
          <rect x="10" y="50" width="20" height="20" rx="2" /> <!-- Estacionamento A -->
          
          <rect x="42" y="10" width="20" height="40" rx="2" /> <!-- Bloco B -->
          <rect x="42" y="60" width="20" height="10" rx="2" /> <!-- Área Lazer -->
          
          <rect x="75" y="10" width="15" height="50" rx="2" /> <!-- Bloco C -->
        </g>

        <!-- Detalhes de Área -->
        <rect x="75" y="68" width="15" height="15" rx="8" fill="rgba(66, 153, 225, 0.05)" stroke="rgba(66, 153, 225, 0.2)" /> <!-- Piscina -->
        <rect x="42" y="78" width="20" height="8" rx="1" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" /> <!-- Portaria -->

        <!-- Text labels -->
        <g fill="rgba(255,255,255,0.15)" font-size="3" font-family="Sora, sans-serif" font-weight="600">
          <text x="12" y="8">BLOCO A</text>
          <text x="44" y="8">BLOCO B</text>
          <text x="76" y="8">BLOCO C</text>
          <text x="78" y="86">PISCINA</text>
          <text x="45" y="88">PORTARIA</text>
        </g>
        
        ${bins.map(bin => {
          const color = getStatusColor(bin.status);
          const isActive = bin.id === selectedBinId;
          return `
            <g class="map-bin-marker ${isActive ? 'is-active' : ''}" data-bin-id="${bin.id}" style="cursor:pointer">
              <circle cx="${bin.x}" cy="${bin.y}" r="${isActive ? 3.5 : 2}" fill="${color}" opacity="${isActive ? 0.9 : 0.5}" />
              <circle cx="${bin.x}" cy="${bin.y}" r="${isActive ? 1.2 : 0.6}" fill="#fff" />
              ${isActive ? `<circle cx="${bin.x}" cy="${bin.y}" r="6" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.4">
                <animate attributeName="r" from="2" to="10" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
              </circle>` : ''}
            </g>
          `;
        }).join("")}
      </svg>
    `;
  }

  function addFeedEvent(type, message, binName = "") {
    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const event = { type, message, binName, time, id: Math.random() };
    events.unshift(event);
    if (events.length > feedCapacity) events.pop();
    renderFeed();
  }

  function renderFeed() {
    const feed = document.getElementById("activity-feed");
    if (!feed) return;
    feed.innerHTML = events.map(ev => `
      <div class="feed-item">
        <div class="feed-time">${ev.time}</div>
        <div class="feed-content">
          <span class="tag ${ev.type}">${ev.type.toUpperCase()}</span>
          ${ev.binName ? `<strong>[${ev.binName}]</strong> ` : ""}${ev.message}
        </div>
      </div>
    `).join("");
  }

  function renderBinList() {
    const list = document.getElementById("bin-list");
    if (!list) return;
    list.innerHTML = bins.map(bin => `
      <div class="dash-bin-item ${selectedBinId === bin.id ? "active" : ""}" data-bin-id="${bin.id}">
        <div class="bin-status-indicator ${bin.status}"></div>
        <div class="bin-info">
          <div class="bin-name">${bin.name}</div>
        </div>
        <div class="bin-level">${bin.level}%</div>
      </div>
    `).join("");

    list.querySelectorAll(".dash-bin-item").forEach(item => {
      item.addEventListener("click", () => {
        const prevId = selectedBinId;
        selectedBinId = item.dataset.binId;
        if (prevId !== selectedBinId) {
          const bin = bins.find(b => b.id === selectedBinId);
          addFeedEvent("update", `Foco alterado para ${bin.name}`, bin.id);
          updateUI();
        }
      });
    });
  }

  function updateFocusCard() {
    const focus = document.getElementById("focus-card");
    if (!focus) return;
    const bin = bins.find(b => b.id === selectedBinId);
    const color = getStatusColor(bin.status);
    
    focus.innerHTML = `
      <div class="focus-level-ring">
        <svg viewBox="0 0 36 36" width="54" height="54">
          <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="3" />
          <circle cx="18" cy="18" r="16" fill="none" stroke="${color}" stroke-width="3" 
            stroke-dasharray="${bin.level}, 100" transform="rotate(-90 18 18)" style="transition: stroke-dasharray 0.6s ease" />
        </svg>
      </div>
      <div class="focus-info">
        <h4>${bin.name}</h4>
        <p>${bin.location} · Bateria: ${bin.battery}%</p>
      </div>
      <div class="focus-actions">
        <button class="focus-btn">Relatório</button>
        <button class="focus-btn">Coleta</button>
      </div>
    `;
  }

  function updateStats() {
    const total = document.getElementById("dash-total");
    const critical = document.getElementById("dash-full");
    const battery = document.getElementById("dash-battery");

    const criticalCount = bins.filter(b => b.status === "critical").length;
    const avgBattery = Math.round(bins.reduce((s, b) => s + b.battery, 0) / bins.length);

    if (total) total.textContent = bins.length;
    if (critical) critical.textContent = criticalCount;
    if (battery) battery.textContent = `${avgBattery}%`;
  }

  function updateUI() {
    renderBinList();
    updateFocusCard();
    updateStats();
    
    const map = document.getElementById("condo-map");
    if (map) {
      map.innerHTML = createMapSVG();
      
      // Re-attach listeners to new SVG elements
      map.querySelectorAll(".map-bin-marker").forEach(marker => {
        marker.addEventListener("click", (e) => {
          e.stopPropagation();
          const prevId = selectedBinId;
          selectedBinId = marker.dataset.binId;
          if (prevId !== selectedBinId) {
            const bin = bins.find(b => b.id === selectedBinId);
            addFeedEvent("update", `Seleção via mapa: ${bin.name}`, bin.id);
            updateUI();
          }
        });
      });
    }

    const coord = document.getElementById("map-coord");
    if (coord) {
      const bin = bins.find(b => b.id === selectedBinId);
      coord.textContent = `${bin.x}.0, ${bin.y}.0`;
    }
  }

  function simulate() {
    updateInterval = setInterval(() => {
      const idx = Math.floor(Math.random() * bins.length);
      const bin = bins[idx];
      const delta = Math.floor(Math.random() * 7) - 2;
      const oldLevel = bin.level;
      bin.level = Math.max(0, Math.min(100, bin.level + delta));

      if (bin.level <= 40) bin.status = "normal";
      else if (bin.level <= 80) bin.status = "attention";
      else bin.status = "critical";

      if (oldLevel < 80 && bin.level >= 80) {
        addFeedEvent("alert", `Nível crítico atingido (${bin.level}%)`, bin.name);
      } else if (Math.random() < 0.1) {
        addFeedEvent("update", `Leitura de telemetria sincronizada`, bin.name);
      }

      if (Math.random() < 0.2) {
        bin.battery = Math.max(10, bin.battery - 1);
        if (bin.battery < 20) addFeedEvent("alert", `Bateria baixa detectada (${bin.battery}%)`, bin.name);
      }

      updateUI();
    }, 4500);
  }

  function init() {
    addFeedEvent("success", "Sistema NextByte OS inicializado");
    addFeedEvent("update", "Conectando a 8 dispositivos em campo...");
    updateUI();
    simulate();
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", DashboardDemo.init);
