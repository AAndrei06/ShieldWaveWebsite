var swiper = new Swiper(".mySwiper", {
    cssMode: true,
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
    pagination: {
        el: ".swiper-pagination",
    },
    mousewheel: true,
    keyboard: true,
});

let codeForBtnsAlert = "none";
let yesBtn = document.querySelector(".yes-op");
let noBtn = document.querySelector(".no-op");

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



let userObject = null;
let userToken = null;
let translate = {};
let activate_btn = true;
let activate_deactivate = document.querySelector('.deactivate');



LIST_OF_VALID = ['person', 'bicycle', 'car', 'motorcycle', 'bus', 'truck', 'bird', 'cat', 'dog', 'horse', 'sheep',
    'cow', 'elephant', 'bear', 'zebra']

//Video
translate["person"] = "Persoană";
translate["bicycle"] = "Bicicletă/Motocicletă";
translate["motorcycle"] = "Bicicletă/Motocicletă";
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

let insertAlertsDiv = document.getElementsByClassName("inserted-alerts")[0];

async function getUserData() {
    const auth = firebase.auth();
    return new Promise((resolve, reject) => {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const querySnapshot = await usersDB.where("ID", "==", user.uid).get();
                    if (!querySnapshot.empty) {
                        userObject = querySnapshot.docs[0].data();
                        userToken = userObject.token;
                        localStorage.setItem("userTokenShieldWave", userToken);
                    } else {
                        console.log("No user document found with ID:", user.uid);
                    }
                    resolve(userObject);
                } catch (error) {
                    reject(error);
                }
            } else {
                if (window.location.hostname == "127.0.0.1") {
                    window.location.pathname = "/Frontend/pages/login.html"
                } else {
                    window.location.pathname = "/pages/login.html"
                }
                resolve(null);
            }
        });
    });
}


getUserData()
.then((userObject) => {
    document.querySelector('.plain-text-token').innerText = userToken;
    
    activationsDB.where("user_token","==",userToken).get().then((querySnapshot) => {
        querySnapshot.forEach(doc => {
            if (doc.exists){
                activate_deactivate.innerHTML = '<div><i class="fa-regular fa-circle-play"></i> Activează</div>';
            }
        });
    });
    
    
    alertsDB.where("user_token", "==", userToken)
        .get()
        .then((querySnapshot) => {
            let alertsByDay = {};
            let presentNow = new Date();
            let past24h = new Date(presentNow);
            past24h.setHours(presentNow.getHours() - 24);

            let detectionsPerHour = Array.from({ length: 24 }, (_, i) => 0)
            let hourLabels = [];
            let tmp = new Date(presentNow);
            for (let i = 0; i < 24; i++) {

                hourLabels.push(`${tmp.getHours().toString().padStart(2, '0')}:00`);
                tmp.setHours(tmp.getHours() - 1);
            }
            hourLabels.reverse();

            querySnapshot.forEach((element) => {
                elements = element.data().alert_list.sort((a, b) => b.detection_time - a.detection_time);
                for (let doc of elements){
                    let link = doc.detection_type == "Video" ? "Link la video" : "Link la audio";
                    let color_class = "red-class";
                    let confidence = doc.confidence;
                    if (confidence >= 80) {
                        color_class = "green-class";
                    } else if (confidence < 80 && confidence >= 60) {
                        color_class = "yellow-class";
                    } else {
                        color_class = "red-class";
                    }

                    let seconds_time = doc.detection_time;
                    let dateObject = new Date(seconds_time * 1000);

                    let year = dateObject.getFullYear();
                    let month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
                    let day = dateObject.getDate().toString().padStart(2, '0');
                    let hours = dateObject.getHours().toString().padStart(2, '0');
                    let minutes = dateObject.getMinutes().toString().padStart(2, '0');
                    let seconds = dateObject.getSeconds().toString().padStart(2, '0');

                    if (dateObject >= past24h && dateObject <= presentNow) {
                        let index = hourLabels.indexOf(`${hours}:00`)
                        detectionsPerHour[index]++;
                    }

                    let dateKey = `${day}.${month}.${year}`;

                    if (!alertsByDay[dateKey]) {
                        alertsByDay[dateKey] = [];
                    }

                    alertsByDay[dateKey].push({
                        detection_type: doc.detection_type,
                        classification: translate[doc.classification],
                        confidence: doc.confidence,
                        link: doc.link,
                        time: `${hours}:${minutes}:${seconds}`,
                        color_class: color_class,
                        doc_id: doc.id
                    });
                }
            });


            alertsChart1.data.labels = hourLabels;
            alertsChart1.data.datasets[0].data = detectionsPerHour;
            alertsChart1.update();

            insertAlertsDiv.innerHTML = "";
            alertsChart.data.labels = [];
            alertsChart.data.datasets[0].data = [];

            alertData.datasets[0].backgroundColor = [];
            alertData.datasets[0].borderColor = [];
            alertData.labels = [];
            alertData.datasets[0].data = [];

            let html = "";
            const lastWeekDate = new Date();
            const today = new Date();
            lastWeekDate.setDate(today.getDate() - 7);
            for (let dateKey in alertsByDay) {
                html += `
            <div class="date-formated">
                <div class="the-line"></div>
                <div class="actual-date">${dateKey}</div>
            </div>
        `;
                let al = 0;
                alertsByDay[dateKey].forEach(alert => {
                    incrementAlertCount(alert.classification);
                    al += 1;

                    html += `
                        <div class="alert-div" data-id="${alert.doc_id}">
                            <div>${alert.detection_type}</div>
                            <div class="hour-of-alert">${alert.time}</div>
                            <div>${alert.classification}</div>
                            <div><div class="probability ${alert.color_class}">${alert.confidence}%</div></div>
                            <div class="link-obj"><a href="${alert.link}">${alert.detection_type == "Video" ? "Link la video" : "Link la audio"}</a></div>
                        </div>
                    `;
                });

                let newFormat = dateKey.split('.');
                const dft = new Date()
                dft.setFullYear(Number(newFormat[2]))
                dft.setMonth(newFormat[1][0] != "0" ? Number(newFormat[1]) - 1 : Number(newFormat[1][1]) - 1)
                dft.setDate(Number(newFormat[0]))

                if (dft > lastWeekDate) {
                    updateChartData(`${newFormat[0]}.${newFormat[1]}`, al);
                }
            }
            insertAlertsDiv.innerHTML = html;
        })
        .then(() => {
            document.body.style.display = "block";
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });
        

})
.catch((error) => {
    console.error("Error:", error);
});

async function deleteAllFilesAndDocs(authToken) {
    try {
        const snapshot = await alertsDB.where("user_token", "==", authToken).get();

        if (snapshot.empty) {
            showAlert("Nu s-au găsit alerte pentru acest utilizator.");
            return;
        }

        const deletePromises = [];

        snapshot.forEach((doc) => {
            const alertList = doc.data().alert_list || [];

            alertList.forEach((alert) => {
                const link = alert.link;
                if (link) {
                    // Extragem path-ul Firebase Storage (începând cu "detections/")
                    const urlParts = link.split("detections/");
                    if (urlParts.length > 1) {
                        const filePath = `detections/${urlParts[1]}`;
                        const fileRef = storage.ref(filePath);
                        deletePromises.push(fileRef.delete());
                    }
                }
            });

            // Ștergem documentul Firestore
            deletePromises.push(doc.ref.delete());
        });

        await Promise.all(deletePromises);
        showAlert("Toate alertele și fișierele au fost șterse cu succes!");
    } catch (error) {
        console.error("Eroare la ștergere:", error);
        showAlert("A apărut o eroare la ștergerea fișierelor sau alertelor.");
    }
}



yesBtn.addEventListener("click", () => {

    if (codeForBtnsAlert == "micDeactivateAsk") {
        microphoneDeactivateDB.add({
            user_token: localStorage.getItem("userTokenShieldWave"),
            state: true
        }).then(() => {
            showAlert("Microfonul se va dezactiva în 7 secunde!");
            codeForBtnsAlert = "none";
        });
    } else if (codeForBtnsAlert == "cameraDeactivateAsk") {
        cameraDeactivateDB.add({
            user_token: localStorage.getItem("userTokenShieldWave"),
            state: true
        }).then(() => {
            showAlert("Camera se va dezactiva în 7 secunde!");
            codeForBtnsAlert = "none";
        });
    } else if (codeForBtnsAlert == "deactivateALL" && activate_btn == false) {
        deactivationsDB.add({
            user_token: localStorage.getItem("userTokenShieldWave"),
            state: true
        }).then(() => {
            showAlert("Sistemul se va dezactiva în 7 secunde!");
            codeForBtnsAlert = "none";
            activate_deactivate.innerHTML = '<div><i class="fa-regular fa-circle-play"></i> Activează</div>';
            activate_btn = true;
        });
    }else if (codeForBtnsAlert == "activateALL" && activate_btn == true){
        activationsDB.add({
            user_token: localStorage.getItem("userTokenShieldWave")
        }).then(() => {
            showAlert("Sistemul se va activa în 7 secunde!");
            codeForBtnsAlert = "none";
            activate_deactivate.innerHTML = '<div><i class="fa-regular fa-circle-stop"></i> Deactivează</div>';
            activate_btn = false;
        });
    } else if (codeForBtnsAlert == "logoutUser") {

        firebase.auth().signOut().then(() => {
            showAlert("Te-ai deconectat!");
            localStorage.removeItem("userTokenShieldWave");
            console.log("logged out");

            codeForBtnsAlert = "none";
        }).catch((error) => {
            console.log(error);
        });
    } else if (codeForBtnsAlert == "deleteAllLinks") {

        async function deleteLinks() {

            const querySnapshot = await linksDB
                .where("token", "==", localStorage.getItem("userTokenShieldWave"))
                .get();

            querySnapshot.forEach((doc) => {
                linksDB.doc(doc.id).delete();
            });
            codeForBtnsAlert = "none";
            showAlert("Au fost șterse toate link-urile!");
        }
        deleteLinks();
    } else if (codeForBtnsAlert == "deleteAllAlertsAI") {

        deleteAllFilesAndDocs(localStorage.getItem("userTokenShieldWave"));
        codeForBtnsAlert = "none";
    }
});

noBtn.addEventListener("click", () => {
    let alertDiv = document.getElementsByClassName("alert-bar")[0];
    let text = alertDiv.getElementsByTagName("h3")[0];
    codeForBtnsAlert = "none";
    alertDiv.style.display = "none";
    text.innerText = "";
})



document.querySelector('.delete-all-alerts').addEventListener('click', () => {
    codeForBtnsAlert = "deleteAllAlertsAI";
    showAlert("Ești sigur că vrei să stergi toate alertele?", true);
});

usersDB.where("token", "==", localStorage.getItem("userTokenShieldWave")).onSnapshot((snapshot) => {
    let docs = snapshot.docs;
    let doc = docs[0];
    let new_date = new Date();
    let epoch_seconds = Math.round(new_date.getTime()/1000);

    const windowWidth = window.innerWidth;
    if (epoch_seconds - doc.data().last_active <= 10 && doc.data().state == "active"){

        activate_deactivate.innerHTML = '<div><i class="fa-regular fa-circle-stop"></i> Dezactivează</div>';
        activate_btn = false;
    }else{
        activate_deactivate.innerHTML = '<div><i class="fa-regular fa-circle-play"></i> Activează</div>';
        activate_btn = true;
    }
    
    if (windowWidth < 380) {
        if (activate_btn == false){
            buttons[1].innerHTML = "<div><i class='fa-regular fa-circle-stop'></i></div>";
        }else{
            buttons[1].innerHTML = "<div><i class='fa-regular fa-circle-play'></i></div>";
        }
    }
});

document.querySelector('.deactivate').onclick = () => {
    usersDB.where("token", "==", localStorage.getItem("userTokenShieldWave")).get().then((querySnapshot) => {
        querySnapshot.forEach(doc => {
            let new_date = new Date();
            let epoch_seconds = Math.round(new_date.getTime()/1000);
            if (epoch_seconds - doc.data().last_active > 10){
                showAlert("Atenție, sistemul nu este conectat sau e defect!!!");
            }else if (epoch_seconds - doc.data().last_active <= 10 && doc.data().state == "active")
                deactivationsDB.where("user_token", "==", userToken).get()
                .then((querySnapshot) => {
                    let doIt = true;
                    querySnapshot.forEach((doc) => {
                        doIt = false;
                    });
                    if (doIt) {
                        codeForBtnsAlert = "deactivateALL";
                        showAlert("Ești sigur că vrei să dezactivezi sistemul?", true);
                    }
                })
            else if (epoch_seconds - doc.data().last_active <= 10 && doc.data().state == "inactive"){
                activationsDB.where("user_token", "==", userToken).get()
                .then((querySnapshot) => {
                    let doIt = true;
                    querySnapshot.forEach((doc) => {
                        doIt = false;
                    });
                    if (doIt) {
                        codeForBtnsAlert = "activateALL";
                        showAlert("Ești sigur că vrei să activezi sistemul?", true);
                    }
                })
            }
        });
    });
}

document.querySelector('.stop-cam').onclick = () => {
    cameraDeactivateDB.where("user_token", "==", userToken).get()
        .then((querySnapshot) => {
            let doIt = true;
            querySnapshot.forEach((doc) => {
                doIt = false;
            });
            if (doIt) {
                codeForBtnsAlert = "cameraDeactivateAsk";
                showAlert("Ești sigur că vrei să dezactivezi camera?", true);
            }
        })
}

document.querySelector('.stop-mic').onclick = () => {
    microphoneDeactivateDB.where("user_token", "==", userToken).get()
        .then((querySnapshot) => {
            let doIt = true;
            querySnapshot.forEach((doc) => {
                doIt = false;
            });
            if (doIt) {
                codeForBtnsAlert = "micDeactivateAsk";
                showAlert("Ești sigur că vrei să dezactivezi microfonul?", true);
            }
        })
}

document.querySelector(".logout").onclick = () => {
    codeForBtnsAlert = "logoutUser";
    showAlert("Ești sigur că vrei să te deconectezi?", true);
}

document.querySelector('.delete-all-links').onclick = async () => {

    const querySnapshot = await linksDB
        .where("token", "==", localStorage.getItem("userTokenShieldWave"))
        .get();

    if (querySnapshot.empty) {
        showAlert("Nu s-a găsit nici un link!!!");
    } else {
        codeForBtnsAlert = "deleteAllLinks";
        showAlert("Ești sigur că vrei să ștergi toate link-urile?", true);
    }
};


document.querySelector('.link-btn').onclick = async () => {
    let link = document.getElementsByName('link-for-live')[0].value;

    if (link.startsWith('https://www.youtube.com/embed/')) {
        const querySnapshot = await linksDB
            .where("token", "==", localStorage.getItem("userTokenShieldWave"))
            .get();

        if (querySnapshot.empty) {
            linksDB.add({
                token: localStorage.getItem("userTokenShieldWave"),
                links: [link]
            }).then(() => {
                document.getElementsByName('link-for-live')[0].value = "";
            });
        } else {
            querySnapshot.forEach((doc) => {
                let links = doc.data().links;
                links.push(link);

                linksDB.doc(doc.id).update({
                    links: links
                }).then(() => {
                    document.getElementsByName('link-for-live')[0].value = "";
                });
            });
        }
    } else {
        showAlert("Link-ul nu e valid!");
    }
};


alertsDB.where("user_token", "==", localStorage.getItem("userTokenShieldWave")).onSnapshot((snapshot) => {
    /*
    Notification.requestPermission().then(perm => {
        if (perm == "granted"){
            const notification = new Notification("Alertă detectată",{
                body: "Accesează site-ul pentru a vedea alerta!!!",
                icon: "../images/logo.png"
            });
        }
    })
    */
    let docs = snapshot.docs;
    let alertsByDay = {};
    let presentNow = new Date();
    let past24h = new Date(presentNow);
    past24h.setHours(presentNow.getHours() - 24);

    let detectionsPerHour = Array.from({ length: 24 }, (_, i) => 0)
    let hourLabels = [];
    let tmp = new Date(presentNow);
    for (let i = 0; i < 24; i++) {

        hourLabels.push(`${tmp.getHours().toString().padStart(2, '0')}:00`);
        tmp.setHours(tmp.getHours() - 1);
    }
    hourLabels.reverse();
    docs.forEach((element) => {
        elements = element.data().alert_list.sort((a, b) => b.detection_time - a.detection_time);
        
        for (let doc of elements){
            let link = doc.detection_type == "Video" ? "Link la video" : "Link la audio";
            let color_class = "red-class";
            let confidence = doc.confidence;
            if (confidence >= 80) {
                color_class = "green-class";
            } else if (confidence < 80 && confidence >= 60) {
                color_class = "yellow-class";
            } else {
                color_class = "red-class";
            }

            let seconds_time = doc.detection_time;
            let dateObject = new Date(seconds_time * 1000);

            let year = dateObject.getFullYear();
            let month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
            let day = dateObject.getDate().toString().padStart(2, '0');
            let hours = dateObject.getHours().toString().padStart(2, '0');
            let minutes = dateObject.getMinutes().toString().padStart(2, '0');
            let seconds = dateObject.getSeconds().toString().padStart(2, '0');

            if (dateObject >= past24h && dateObject <= presentNow) {
                let index = hourLabels.indexOf(`${hours}:00`)
                detectionsPerHour[index]++;
            }

            let dateKey = `${day}.${month}.${year}`;

            if (!alertsByDay[dateKey]) {
                alertsByDay[dateKey] = [];
            }

            alertsByDay[dateKey].push({
                detection_type: doc.detection_type,
                classification: translate[doc.classification],
                confidence: doc.confidence,
                link: doc.link,
                time: `${hours}:${minutes}:${seconds}`,
                color_class: color_class,
                doc_id: doc.id
            });
        }
    });
    alertsChart1.data.labels = hourLabels;
    alertsChart1.data.datasets[0].data = detectionsPerHour;
    alertsChart1.update();

    insertAlertsDiv.innerHTML = "";
    alertsChart.data.labels = [];
    alertsChart.data.datasets[0].data = [];

    alertData.datasets[0].backgroundColor = [];
    alertData.datasets[0].borderColor = [];
    alertData.labels = [];
    alertData.datasets[0].data = [];
    let html = "";
    const lastWeekDate = new Date();
    const today = new Date();
    lastWeekDate.setDate(today.getDate() - 7);
    for (let dateKey in alertsByDay) {
        html += `
            <div class="date-formated">
                <div class="the-line"></div>
                <div class="actual-date">${dateKey}</div>
            </div>
        `;
        let al = 0;
        alertsByDay[dateKey].forEach(alert => {
            incrementAlertCount(alert.classification);

            al += 1;
            if (alert.classification != "")
                html += `
                <div class="alert-div" data-id="${alert.doc_id}">
                    <div>${alert.detection_type}</div>
                    <div class="hour-of-alert">${alert.time}</div>
                    <div>${alert.classification}</div>
                    <div><div class="probability ${alert.color_class}">${alert.confidence}%</div></div>
                    <div class="link-obj"><a href="${alert.link}">${alert.detection_type == "Video" ? "Link la video" : "Link la audio"}</a></div>
                </div>
            `;
        });
        let newFormat = dateKey.split('.');
        const dft = new Date()
        dft.setFullYear(Number(newFormat[2]))
        dft.setMonth(newFormat[1][0] != "0" ? Number(newFormat[1]) - 1 : Number(newFormat[1][1]) - 1)
        dft.setDate(Number(newFormat[0]))

        if (dft > lastWeekDate) {
            updateChartData(`${newFormat[0]}.${newFormat[1]}`, al);
        }
    }
    insertAlertsDiv.innerHTML = html;

}, (error) => {
    console.error(error);
});


linksDB.where("token", "==", localStorage.getItem("userTokenShieldWave")).onSnapshot((snapshot) => {
    let docs = snapshot.docs;
    let container = document.querySelector('.swiper-wrapper');
    let notVideo = document.querySelector('.not-video');
    notVideo.style.display = "block";
    container.innerHTML = "";
    for (let doc of docs) {
        for (let link of doc.data().links) {
            notVideo.style.display = "none";
            container.innerHTML += `
                <div class="swiper-slide">
                    <iframe width="100%" height="100%"
                        src="${link}"
                        allowfullscreen>
                    </iframe>
                </div>
            `;
        }
    }
});

function updateChartData(newLabels, newData) {
    alertsChart.data.labels.unshift(newLabels);
    alertsChart.data.datasets[0].data.unshift(newData)
    alertsChart.update();
}

const ctx = document.getElementById('alertsChart').getContext('2d');
const alertsChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Număr de alerte',
            data: [],
            backgroundColor: [
                'rgba(255, 99, 132, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 206, 86, 0.7)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(153, 102, 255, 0.7)',
                'rgba(255, 159, 64, 0.7)',
                'rgba(199, 199, 199, 0.7)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(199, 199, 199, 1)'
            ],
            borderWidth: 1,
            borderRadius: 5,
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {

            legend: {
                display: false,
                labels: {
                    font: {
                        size: 14,
                        family: 'Arial',
                        weight: 'bold',
                        color: '#333',
                    },
                    padding: 10
                },
                position: 'top',
            },
            title: {
                display: true,
                text: 'Numărul de alerte în ultimele 7 zile',
                font: {
                    size: 14,
                    weight: 'bold',
                },
                color: '#333',
                padding: {
                    top: 10,
                    bottom: 20
                }
            },

            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(0,0,0,0.7)',
                titleColor: '#fff',
                bodyColor: '#fff',
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Zilele săptămânii',
                    color: '#333',
                    font: {
                        size: 16,
                        weight: 'bold',
                    },
                },
                ticks: {
                    color: '#666',
                    font: {
                        size: 12,
                    },
                },
                grid: {
                    color: 'rgba(200, 200, 200, 0.3)'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Număr de alerte',
                    color: '#333',
                    font: {
                        size: 16,
                        weight: 'bold',
                    },
                },
                ticks: {
                    color: '#666',
                    font: {
                        size: 12,
                    },
                },
                grid: {
                    color: 'rgba(200, 200, 200, 0.3)'
                },
                beginAtZero: true,
            }
        }
    }
});
const ctx1 = document.getElementById('alertsChart24h').getContext('2d');
const alertsChart1 = new Chart(ctx1, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointBackgroundColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(199, 199, 199, 1)',
            ],
            pointRadius: 5,
            pointHoverRadius: 7,
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => `Alerte: ${tooltipItem.raw}`,
                },
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                titleColor: '#fff',
                bodyColor: '#fff',
            },
            title: {
                display: true,
                text: 'Numărul de alerte pe oră (24h)',
                font: {
                    size: 14,
                    weight: 'bold',
                },
                color: '#333',
                padding: {
                    top: 10,
                    bottom: 20
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Orele zilei',
                    color: '#333',
                    font: {
                        size: 16,
                        weight: 'bold',
                    },
                },
                ticks: {
                    color: '#666',
                    font: {
                        size: 12,
                    },
                },
                grid: {
                    color: 'rgba(200, 200, 200, 0.3)'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Numărul de alerte',
                    color: '#333',
                    font: {
                        size: 16,
                        weight: 'bold',
                    },
                },
                ticks: {
                    color: '#666',
                    font: {
                        size: 12,
                    },
                },
                grid: {
                    color: 'rgba(200, 200, 200, 0.3)'
                },
                beginAtZero: true,
            }
        },
        elements: {
            line: {
                backgroundColor: 'white',
            }
        }
    }
});

var ctx3 = document.getElementById('alertChartPie').getContext('2d');

var alertData = {
    labels: [],
    datasets: [{
        label: 'Număr alerte',
        data: [],
        backgroundColor: [
            'rgba(255, 87, 51, 0.7)',
            'rgba(51, 255, 87, 0.7)',
            'rgba(51, 87, 255, 0.7)',
            'rgba(255, 51, 161, 0.7)'
        ],
        borderColor: [
            'rgba(255, 87, 51, 1)',
            'rgba(51, 255, 87, 1)',
            'rgba(51, 87, 255, 1)',
            'rgba(255, 51, 161, 1)'
        ],
        borderWidth: 1
    }]
};

var alertChart = new Chart(ctx3, {
    type: 'pie',
    data: alertData,
    options: {
        responsive: true,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        return tooltipItem.label + ': ' + tooltipItem.raw + ' alerte';
                    }
                }
            },
            legend: {
                display: false
            },
            datalabels: {
                anchor: 'center',
                align: 'center',
                font: {
                    weight: 'bold',
                    size: 12
                },
                color: 'white',
                formatter: (value, context) => {
                    return context.chart.data.labels[context.dataIndex] + '\n' + value;
                }
            },
            title: {
                display: true,
                text: 'Cele mai detectate alerte',
                font: {
                    size: 14,
                    weight: 'bold',
                },
                color: '#333',
                padding: {
                    top: 7,
                    bottom: 1
                }
            }
        }
    },
    plugins: [ChartDataLabels]
});

function addNewAlert(alertCategory, alertDataCount) {
    const existingIndex = alertData.labels.indexOf(alertCategory);

    if (existingIndex >= 0) {
        alertData.datasets[0].data[existingIndex] += alertDataCount;
    } else {
        alertData.labels.push(alertCategory);
        alertData.datasets[0].data.push(alertDataCount);

        let newColor = getRandomColor();
        alertData.datasets[0].backgroundColor.push(newColor);
        alertData.datasets[0].borderColor.push(newColor);
    }

    alertChart.update();
}

function incrementAlertCount(alertCategory) {

    const categoryIndex = alertData.labels.indexOf(alertCategory);

    if (categoryIndex !== -1) {
        alertData.datasets[0].data[categoryIndex] += 1;
    } else {
        addNewAlert(alertCategory, 1);
    }

    alertChart.update();
}

function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgba(${r}, ${g}, ${b}, 0.7)`;
}

let copyBtn = document.querySelector('.pure-field');

copyBtn.onclick = function () {
    document.execCommand("copy");
}

copyBtn.addEventListener("copy", function (event) {
    event.preventDefault();
    if (event.clipboardData) {
        event.clipboardData.setData("text/plain", document.getElementsByClassName('plain-text-token')[0].innerText);
        console.log(event.clipboardData.getData("text"))
        showAlert('Token Copiat!');
    }
});

let buttons = document.getElementsByClassName('option-btn');
let tokenField = document.querySelector('.token-field');
let pureField = document.querySelector('.pure-field');
let stopBtns = document.getElementsByClassName('stop-btn');
let linkBtns = document.getElementsByClassName("link-btn");

window.addEventListener('resize', () => {
    const windowWidth = window.innerWidth;

    if (windowWidth < 380) {
        buttons[0].innerHTML = "<div><i class='fa-solid fa-trash-can'></i></div>";
        if (activate_btn == false){
            buttons[1].innerHTML = "<div><i class='fa-regular fa-circle-stop'></i></div>";
        }else{
            buttons[1].innerHTML = "<div><i class='fa-regular fa-circle-play'></i></div>";
        }
        buttons[2].innerHTML = "<div><i class='fa-solid fa-arrow-right-from-bracket'></i></div>";
        stopBtns[0].innerHTML = "<div><i class='fa-solid fa-video'></i></div>";
        stopBtns[1].innerHTML = "<div><i class='fa-solid fa-microphone'></i></div>";
        linkBtns[0].innerHTML = "<div><i class='fa-solid fa-plus'></i></div>";
        linkBtns[1].innerHTML = "<div><i class='fa-solid fa-trash-can'></i></div>";

    } else if (windowWidth > 380) {
        buttons[0].innerHTML = "<div><i class='fa-solid fa-trash-can'></i> Șterge alertele</div>";
        if (activate_btn == false){
            buttons[1].innerHTML = "<div><i class='fa-regular fa-circle-stop'></i> Dezactivează</div>";
        }else{
            buttons[1].innerHTML = "<div><i class='fa-regular fa-circle-play'></i> Activează</div>";
        }
        buttons[2].innerHTML = "<div><i class='fa-solid fa-arrow-right-from-bracket'></i> Ieși</div>";
        stopBtns[0].innerHTML = "<div><i class='fa-solid fa-video'></i> Oprește camera</div>";
        stopBtns[1].innerHTML = "<div><i class='fa-solid fa-microphone'></i> Oprește microfonul</div>";
        linkBtns[0].innerHTML = "<div><i class='fa-solid fa-plus'></i> Adaugă un link live</div>";
        linkBtns[1].innerHTML = "<div><i class='fa-solid fa-trash-can'></i> Șterge toate link-urile</div>";
    }

    if (windowWidth < 497 && windowWidth >= 380) {
        stopBtns[0].innerHTML = "<div><i class='fa-solid fa-video'></i> Stop cam</div>";
        stopBtns[1].innerHTML = "<div><i class='fa-solid fa-microphone'></i> Stop mic</div>";
    }
});

const windowWidth = window.innerWidth;

if (windowWidth < 380) {
    buttons[0].innerHTML = "<div><i class='fa-solid fa-trash-can'></i></div>";
    if (activate_btn == false){
        buttons[1].innerHTML = "<div><i class='fa-regular fa-circle-stop'></i></div>";
    }else{
        buttons[1].innerHTML = "<div><i class='fa-regular fa-circle-play'></i></div>";
    }
    buttons[2].innerHTML = "<div><i class='fa-solid fa-arrow-right-from-bracket'></i></div>";
    stopBtns[0].innerHTML = "<div><i class='fa-solid fa-video'></i></div>";
    stopBtns[1].innerHTML = "<div><i class='fa-solid fa-microphone'></i></div>";
    linkBtns[0].innerHTML = "<div><i class='fa-solid fa-plus'></i></div>";
    linkBtns[1].innerHTML = "<div><i class='fa-solid fa-trash-can'></i></div>";
}

if (windowWidth < 497 && windowWidth >= 380) {
    stopBtns[0].innerHTML = "<div><i class='fa-solid fa-video'></i> Stop cam</div>";
    stopBtns[1].innerHTML = "<div><i class='fa-solid fa-microphone'></i> Stop mic</div>";
}
