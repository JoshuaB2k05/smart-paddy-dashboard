// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Your Firebase Config
const firebaseConfig = {
 apiKey: "AIzaSyCU3hhO7SHqR_-cHfHN0OoGRzmu8nkwdOw",
  authDomain: "smart-paddy-control.firebaseapp.com",
  databaseURL: "https://smart-paddy-control-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smart-paddy-control",
  storageBucket: "smart-paddy-control.firebasestorage.app",
  messagingSenderId: "864924965654",
  appId: "1:864924965654:web:0a1fe93aa024a54af00e37"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// DOM Elements
const inputField = document.getElementById("dataInput");
const submitBtn = document.getElementById("submitBtn");
const dataList = document.getElementById("dataList");

// Write Data
submitBtn.addEventListener("click", () => {
  const value = inputField.value;

  if (value === "") {
    alert("Enter something first");
    return;
  }

  const newDataRef = push(ref(database, "nelliData"));
  set(newDataRef, {
    value: value,
    timestamp: Date.now()
  });

  inputField.value = "";
});

// Read Data (Real-Time)
const dataRef = ref(database, "nelliData");
onValue(dataRef, (snapshot) => {
  dataList.innerHTML = "";

  snapshot.forEach((childSnapshot) => {
    const li = document.createElement("li");
    li.textContent = childSnapshot.val().value;
    dataList.appendChild(li);
  });
});
