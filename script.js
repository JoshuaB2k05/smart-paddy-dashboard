import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCU3hhO7SHqR_-cHfHN0OoGRzmu8nkwdOw",
  authDomain: "smart-paddy-control.firebaseapp.com",
  databaseURL: "https://smart-paddy-control-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smart-paddy-control",
  storageBucket: "smart-paddy-control.firebasestorage.app",
  messagingSenderId: "864924965654",
  appId: "1:864924965654:web:0a1fe93aa024a54af00e37"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const plotsContainer = document.getElementById("plotsContainer");
const aiSummary = document.getElementById("aiSummary");

const chartCtx = document.getElementById("waterChart").getContext("2d");

let chart = new Chart(chartCtx, {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      label: "Water Level (cm)",
      data: [],
      borderColor: "#00ff88",
      fill: false,
      tension: 0.3
    }]
  }
});

onValue(ref(db, "plots"), (snapshot) => {
  const data = snapshot.val();
  plotsContainer.innerHTML = "";

  if (!data) return;

  Object.keys(data).forEach(plotId => {
    const plot = data[plotId];

    const card = document.createElement("div");
    card.className = "plot-card";

    const waterPercent = (plot.currentLevel / 20) * 100;

    card.innerHTML = `
      <h3>${plotId.toUpperCase()}</h3>
      <div class="water-bar">
        <div class="water-fill" style="height:${waterPercent}%"></div>
      </div>
      <p>Current: ${plot.currentLevel} cm</p>
      <p>Recommended: ${plot.recommendedLevel} cm</p>
      <p>Gate: ${plot.gateStatus}</p>
      <p class="${plot.failSafe ? "fail-safe" : ""}">
        ${plot.failSafe ? "⚠ FAIL SAFE ACTIVE" : "Normal Mode"}
      </p>
      <div class="battery">
        Battery: ${plot.batteryPercent}% | Solar: ${plot.solarVoltage}V
      </div>
    `;

    plotsContainer.appendChild(card);

    updateChart(plot);
    generateSummary(plotId, plot);
  });
});

function setLevelAll() {
  const value = document.getElementById("levelInput").value;
  if (!value) return;

  onValue(ref(db, "plots"), (snapshot) => {
    const data = snapshot.val();
    Object.keys(data).forEach(plotId => {
      set(ref(db, `plots/${plotId}/recommendedLevel`), Number(value));
    });
  }, { onlyOnce: true });
}

function generateSummary(plotId, plot) {
  let msg = "";

  if (plot.currentLevel > plot.recommendedLevel) {
    msg = `${plotId} water level HIGH. Gate opening to stabilize.`;
  } else if (plot.currentLevel < plot.recommendedLevel) {
    msg = `${plotId} water level LOW. Irrigation required.`;
  } else {
    msg = `${plotId} optimal water maintained.`;
  }

  if (plot.failSafe) msg += " Fail-safe autonomous mode active.";

  aiSummary.innerText = msg;
}

function updateChart(plot) {
  if (!plot.history) return;

  chart.data.labels = Object.keys(plot.history);
  chart.data.datasets[0].data = Object.values(plot.history);
  chart.update();
}
