
const firebaseConfig = {
  apiKey: "AIzaSyCU3hhO7SHqR_-cHfHN0OoGRzmu8nkwdOw",
  authDomain: "smart-paddy-control.firebaseapp.com",
  databaseURL: "https://smart-paddy-control-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smart-paddy-control",
  storageBucket: "smart-paddy-control.firebasestorage.app",
  messagingSenderId: "864924965654",
  appId: "1:864924965654:web:0a1fe93aa024a54af00e37"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Apply required level
function applyLevel() {
  const level = document.getElementById("requiredLevel").value;

  for (let i = 1; i <= 4; i++) {
    database.ref("plots/plot" + i + "/recommended").set(Number(level));
  }
}

// Listen for real-time updates
for (let i = 1; i <= 4; i++) {
  database.ref("plots/plot" + i).on("value", snapshot => {
    const data = snapshot.val();
    if (!data) return;

    let status = "Perfect";
    let color = "green";

    if (data.level > data.recommended) {
      status = "High";
      color = "red";
    } else if (data.level < data.recommended) {
      status = "Low";
      color = "blue";
    }

    document.getElementById("plot"+i).innerHTML = `
      <h3>Plot ${i}</h3>
      <p>Current Level: ${data.level} cm</p>
      <p>Required Level: ${data.recommended} cm</p>
      <p style="color:${color}">Status: ${status}</p>
    `;

    generateSummary();
  });
}

function generateSummary() {
  database.ref("plots").once("value", snapshot => {
    let summary = "";
    snapshot.forEach(child => {
      const data = child.val();
      if (data.level > data.recommended)
        summary += "Water high. Drainage active. ";
      else if (data.level < data.recommended)
        summary += "Water low. Irrigation needed. ";
      else
        summary += "Water perfect. ";
    });

    document.getElementById("aiSummary").innerText = summary;
  });
}
