const firebaseConfig = {
  apiKey: "AIzaSyAPqKa2MSQEt-G0kEly-HeY2YEjFbnFpNM",
  authDomain: "megaanunt.firebaseapp.com",
  projectId: "megaanunt",
  storageBucket: "megaanunt.appspot.com",
  messagingSenderId: "1091398450368",
  appId: "1:1091398450368:web:e5cad303c33be121068125",
  measurementId: "G-8TE0GCLPKL"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();
const usersDB = firebase.firestore().collection("usersDB");
const alertsDB = firebase.firestore().collection("alerts");
const linksDB = firebase.firestore().collection("links");

let translate = {};
LIST_OF_VALID = ['person', 'bicycle', 'car', 'motorcycle', 'bus', 'truck', 'bird', 'cat', 'dog', 'horse', 'sheep',
  'cow', 'elephant', 'bear', 'zebra']

//Video
translate["person"] = "Persoană";
translate["bicycle"] = "Bicicletă/Motocicletă";
translate["motorcycle"] = "Bicicletă/Motocicletă";
translate["car"] = "Vehicul";
translate["bus"] = "Vehicul";
translate["truck"] = "Vehicul";
translate["bird"] = "Pasăre";
translate["cat"] = "Animal";
translate["dog"] = "Animal";
translate["horse"] = "Animal";
translate["sheep"] = "Animal";
translate["cow"] = "Animal";
translate["elephant"] = "Animal";
translate["bear"] = "Animal";
translate["zebra"] = "Animal";
translate["Necunoscut"] = "Mișcare";

// Audio
translate["footsteps"] = "Pași/Bătăi";
translate["voice"] = "Voce";
translate["door"] = "Ușă/Zgomot";
translate["glass"] = "Sticlă spartă";
translate["dog_audio"] = "Voce";
translate["bad_intention"] = "Intenție Rea"


function validateEmail(email){
  return String(email)
      .toLowerCase()
      .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
};

function generateToken(n) {
  var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var token = '';
  for(var i = 0; i < n; i++) {
      token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

function showError(error,connect){
  let write = document.querySelector('.title');
  let btn = document.getElementsByName('submit_btn')[0];
  write.innerHTML = error;
  write.style.color = '#cc0000';
  write.style.fontSize = '22px';
  btn.style.backgroundColor = '#cc0000';
  btn.style.fontSize = "38px";
  btn.innerHTML = '☹';
  setTimeout(() => {
    write.innerHTML = connect ? 'Conectează-te' : 'Înregistrează-te';
    write.style.color = '#454545';
    write.style.fontSize = '28px';
    btn.style.backgroundColor = '#8559ff';
    btn.style.fontSize = "20px";
    btn.innerHTML = connect ? 'Conectează-te' : 'Înregistrează-te';
  },3000);
}

function showAlert(textAlert, showBtn = false) {
  let alertsBtn = document.querySelector('.alert-btns');
  alertsBtn.style.display = "flex";
  if (!showBtn) {
      alertsBtn.style.display = "none";
  }
  let alertDiv = document.getElementsByClassName("alert-bar")[0];
  let text = alertDiv.getElementsByTagName("h3")[0];
  text.innerText = textAlert;
  alertDiv.style.display = "flex";

  if (!showBtn) {
      setTimeout(() => {
          alertDiv.style.display = "none";
          text.innerText = "";
      }, 5000);
  }
}