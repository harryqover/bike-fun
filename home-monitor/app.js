// Home Monitor app.js
// Fetch latest sensor data and render zone cards

const API_URL = "https://script.google.com/macros/s/AKfycbzYlwGraPXhuwSZYZdgnyQz2biBStKV18ejnwHuxsi7Fd1yj5RdwPYXd-7ww6N0AbOq/exec";
const DEFAULT_LIMIT = 20;

// Mapping of Zone ID to friendly name
const ZONE_NAMES = {
  1: "Salon",
  2: "Entrée",
  3: "Salle de bain",
  4: "Chambre",
  5: "Grenier"
};

// Icons for different zones
const ZONE_ICONS = {
  1: "🛋️", // Salon
  2: "🚪", // Entrée
  3: "🚿", // Salle de bain
  4: "🛏️", // Chambre
  5: "🏠"  // Grenier
};

let temperatureChart = null;

function fetchData(limit = DEFAULT_LIMIT) {
  return fetch(API_URL, {
    method: "POST",
    redirect: "follow",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ sheet: "data", limit })
  })
    .then(res => res.json())
    .then(json => {
      if (json.status !== "success") throw new Error("API error: " + json.message);
      return json.data;
    });
}

function fetchDailyReports(limit = 1) {
  return fetch(API_URL, {
    method: "POST",
    redirect: "follow",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ sheet: "daily_reports", limit })
  })
    .then(res => res.json())
    .then(json => {
      if (json.status !== "success") throw new Error("API error: " + json.message);
      return json.data;
    });
}

function fetchAlarms(limit = 20) {
  return fetch(API_URL, {
    method: "POST",
    redirect: "follow",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ sheet: "alarms", limit })
  })
    .then(res => res.json())
    .then(json => {
      if (json.status !== "success") throw new Error("API error: " + json.message);
      return json.data;
    });
}

function getLatestPerZone(data) {
  const latest = {};
  data.forEach(entry => {
    const zoneId = entry["Zone ID"];
    const ts = new Date(entry["Timestamp"]);
    if (!latest[zoneId] || ts > new Date(latest[zoneId]["Timestamp"])) {
      latest[zoneId] = entry;
    }
  });
  return latest;
}

function getAllDataPerZone(data) {
  const zoneData = {};
  data.forEach(entry => {
    const zoneId = entry["Zone ID"];
    if (!zoneData[zoneId]) {
      zoneData[zoneId] = [];
    }
    zoneData[zoneId].push(entry);
  });
  return zoneData;
}

function renderCards(zoneData) {
  const dashboard = document.getElementById("dashboard");
  dashboard.innerHTML = "";

  Object.entries(zoneData).forEach(([zoneId, entry]) => {
    const card = document.createElement("div");
    card.className = "zone-card fade-in";
    const name = ZONE_NAMES[zoneId] || entry["Zone Name"] || `Zone ${zoneId}`;
    const icon = ZONE_ICONS[zoneId] || "🏠";
    const temp = entry["Temp (°C)"] !== undefined ? entry["Temp (°C)"].toFixed(1) : "N/A";
    const humidity = entry["Humidity (%)"] !== undefined ? entry["Humidity (%)"].toFixed(0) : "N/A";
    const heatingPower = entry["Heating Power (%)"] !== undefined ? entry["Heating Power (%)"].toFixed(0) : "0";
    const windowOpen = entry["Open Window"] === "Open";
    const linkState = entry["Link State"] === "ONLINE";

    const ts = new Date(entry["Timestamp"]);
    const now = new Date();
    const diffMin = Math.round((now - ts) / 60000);
    const timeStr = diffMin < 1 ? "just now" : `${diffMin} min ago`;

    card.innerHTML = `
      <div class="card-header">
        <span class="zone-icon">${icon}</span>
        <h2>${name}</h2>
      </div>
      <div class="temp">${temp}°C</div>
      <div class="metrics">
        <div class="metric">
          <span class="metric-icon">💧</span>
          <span class="metric-value">${humidity}%</span>
        </div>
        <div class="metric">
          <span class="metric-icon">🔥</span>
          <span class="metric-value">${heatingPower}%</span>
        </div>
      </div>
      <div class="status-indicators">
        <span class="status-badge ${windowOpen ? 'status-warning' : 'status-ok'}">
          ${windowOpen ? '🪟 Open' : '🪟 Closed'}
        </span>
        <span class="status-badge ${linkState ? 'status-ok' : 'status-error'}">
          ${linkState ? '📡 Online' : '📡 Offline'}
        </span>
      </div>
      <div class="timestamp">${timeStr}</div>
    `;
    dashboard.appendChild(card);
  });
}

function renderAIMessage(reports) {
  const aiContainer = document.getElementById("ai-message");
  if (!reports || reports.length === 0) {
    aiContainer.style.display = "none";
    return;
  }

  const latestReport = reports[0];
  const message = latestReport["AI Message"] || "No message available";
  const timestamp = new Date(latestReport["Timestamp"]);
  const timeStr = timestamp.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });

  aiContainer.innerHTML = `
    <div class="ai-header">
      <span class="ai-icon">🤖</span>
      <span class="ai-title">AI Daily Report</span>
      <span class="ai-time">${timeStr}</span>
    </div>
    <div class="ai-content">${message}</div>
  `;
  aiContainer.style.display = "block";
}

function renderAlarms(alarms) {
  const alarmsContainer = document.getElementById("alarms-container");

  // Filter for alarms within last 24 hours
  const now = new Date();
  const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);
  const recentAlarms = alarms ? alarms.filter(alarm => {
    const alarmTime = new Date(alarm["Timestamp"]);
    return alarmTime > twentyFourHoursAgo;
  }) : [];

  if (!recentAlarms || recentAlarms.length === 0) {
    // Show reassuring message when no recent alarms
    alarmsContainer.innerHTML = `
      <div class="no-alarms-message">
        <span class="no-alarms-icon">✅</span>
        <span class="no-alarms-text">All systems normal - No recent alarms</span>
      </div>
    `;
    alarmsContainer.style.display = "block";
    return;
  }

  alarmsContainer.innerHTML = "";
  recentAlarms.forEach(alarm => {
    const alarmCard = document.createElement("div");
    alarmCard.className = "alarm-card fade-in";

    const timestamp = new Date(alarm["Timestamp"]);
    const timeStr = timestamp.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });

    alarmCard.innerHTML = `
      <div class="alarm-header">
        <span class="alarm-icon">⚠️</span>
        <div class="alarm-info">
          <span class="alarm-zone">${alarm["Zone"] || "Unknown Zone"}</span>
          <span class="alarm-type">${alarm["Type"] || "Alert"}</span>
        </div>
        <span class="alarm-time">${timeStr}</span>
      </div>
      <div class="alarm-details">${alarm["Details"] || "No details available"}</div>
    `;
    alarmsContainer.appendChild(alarmCard);
  });

  alarmsContainer.style.display = "block";
}

function renderChart(allData) {
  const chartContainer = document.getElementById("chart-container");
  const ctx = document.getElementById("temperatureChart");

  if (!allData || Object.keys(allData).length === 0) {
    chartContainer.style.display = "none";
    return;
  }

  chartContainer.style.display = "block";

  // Prepare datasets for each zone
  const datasets = [];
  const colors = {
    1: 'rgba(59, 130, 246, 1)',   // Blue - Salon
    2: 'rgba(16, 185, 129, 1)',   // Green - Entrée
    3: 'rgba(245, 158, 11, 1)',   // Orange - Salle de bain
    4: 'rgba(239, 68, 68, 1)',    // Red - Chambre
    5: 'rgba(168, 85, 247, 1)'    // Purple - Grenier
  };

  Object.entries(allData).forEach(([zoneId, entries]) => {
    const sortedEntries = entries.sort((a, b) =>
      new Date(a["Timestamp"]) - new Date(b["Timestamp"])
    );

    datasets.push({
      label: ZONE_NAMES[zoneId] || `Zone ${zoneId}`,
      data: sortedEntries.map(entry => ({
        x: new Date(entry["Timestamp"]),
        y: entry["Temp (°C)"]
      })),
      borderColor: colors[zoneId] || 'rgba(156, 163, 175, 1)',
      backgroundColor: (colors[zoneId] || 'rgba(156, 163, 175, 1)').replace('1)', '0.1)'),
      tension: 0.3,
      pointRadius: 3,
      pointHoverRadius: 5
    });
  });

  if (temperatureChart) {
    temperatureChart.destroy();
  }

  temperatureChart = new Chart(ctx, {
    type: 'line',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { color: '#e0e0e0', padding: 15, font: { size: 12 } }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            title: (items) => new Date(items[0].parsed.x).toLocaleString('en-GB'),
            label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(1)}°C`
          }
        }
      },
      scales: {
        x: {
          type: 'time',
          time: { unit: 'hour', displayFormats: { hour: 'HH:mm' } },
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          ticks: { color: '#a0a0a0' }
        },
        y: {
          beginAtZero: false,
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          ticks: { color: '#a0a0a0', callback: (value) => `${value}°C` }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    }
  });
}

function showLoadingState() {
  const dashboard = document.getElementById("dashboard");
  dashboard.innerHTML = "";

  // Create 5 loading skeleton cards
  for (let i = 0; i < 5; i++) {
    const loadingCard = document.createElement("div");
    loadingCard.className = "loading-card";
    loadingCard.innerHTML = `
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-temp"></div>
      <div class="skeleton skeleton-line"></div>
      <div class="skeleton skeleton-line"></div>
      <div class="skeleton skeleton-line"></div>
    `;
    dashboard.appendChild(loadingCard);
  }
}

async function update() {
  try {
    // Show loading state
    showLoadingState();

    // Fetch sensor data
    const data = await fetchData();
    const latestPerZone = getLatestPerZone(data);
    const allDataPerZone = getAllDataPerZone(data);

    renderCards(latestPerZone);
    renderChart(allDataPerZone);

    // Fetch AI daily reports
    const reports = await fetchDailyReports(1);
    renderAIMessage(reports);

    // Fetch alarms
    const alarms = await fetchAlarms(20);
    renderAlarms(alarms);
  } catch (err) {
    console.error("Home Monitor error:", err);
    const dashboard = document.getElementById("dashboard");
    dashboard.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; color: var(--error); padding: 2rem;">
        ⚠️ Error loading data. Retrying in 60 seconds...
      </div>
    `;
  }
}

// Initial load
update();
// Refresh every minute
setInterval(update, 60 * 1000);
