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

let userObject = null;
let userToken = null;
let activate_btn = true;
let activate_deactivate = document.querySelector('.deactivate');


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
        document.body.style.display = "block";
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
                    const urlParts = link.split("detections/");
                    if (urlParts.length > 1) {
                        const filePath = `detections/${urlParts[1]}`;
                        const fileRef = storage.ref(filePath);
                        deletePromises.push(fileRef.delete());
                    }
                }
            });

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

        const userRef = db.collection("usersDB").where("token", "==", localStorage.getItem("userTokenShieldWave"));

        userRef.get()
            .then(userDocs => {
                if (!userDocs.empty) {
                    const user = userDocs.docs[0];

                    user.ref.update({
                        deactivateMic: "yes"
                    }).then(() => {
                        showAlert("Microfonul se va dezactiva în câteva secunde!");
                        codeForBtnsAlert = "none";
                    }).catch(error => {
                        console.error("Eroare la actualizarea microfonului:", error);
                    });
                } else {
                    console.log("Utilizatorul nu a fost găsit.");
                }
            }).catch(error => {
                console.error("Eroare la căutarea utilizatorului:", error);
            });


    } else if (codeForBtnsAlert == "cameraDeactivateAsk") {

        const userRef = db.collection("usersDB").where("token", "==", localStorage.getItem("userTokenShieldWave"));

        userRef.get()
            .then(userDocs => {
                if (!userDocs.empty) {
                    const user = userDocs.docs[0];

                    user.ref.update({
                        deactivateCam: "yes"
                    }).then(() => {
                        showAlert("Camera se va dezactiva în câteva secunde!");
                        codeForBtnsAlert = "none";
                    }).catch(error => {
                        console.error("Eroare la actualizarea camerei:", error);
                    });
                } else {
                    console.log("Utilizatorul nu a fost găsit.");
                }
            }).catch(error => {
                console.error("Eroare la căutarea utilizatorului:", error);
            });

    } else if (codeForBtnsAlert == "deactivateALL" && activate_btn == false) {

        const userRef = db.collection("usersDB").where("token", "==", localStorage.getItem("userTokenShieldWave"));

        userRef.get()
            .then(userDocs => {
                if (!userDocs.empty) {
                    const user = userDocs.docs[0];

                    user.ref.update({
                        deactivateSystem: "yes"
                    }).then(() => {
                        showAlert("Sistemul se va dezactiva în câteva secunde!");
                        codeForBtnsAlert = "none";
                        activate_deactivate.innerHTML = '<div><i class="fa-regular fa-circle-play"></i> Activează</div>';
                        activate_btn = true;
                    }).catch(error => {
                        console.error("Eroare la actualizarea deactivarii:", error);
                    });
                } else {
                    console.log("Utilizatorul nu a fost găsit.");
                }
            }).catch(error => {
                console.error("Eroare la căutarea utilizatorului:", error);
            });

    } else if (codeForBtnsAlert == "activateALL" && activate_btn == true) {

        const userRef = db.collection("usersDB").where("token", "==", localStorage.getItem("userTokenShieldWave"));

        userRef.get()
            .then(userDocs => {
                if (!userDocs.empty) {
                    const user = userDocs.docs[0];

                    user.ref.update({
                        activate: "yes"
                    }).then(() => {
                        showAlert("Sistemul se va activa în câteva secunde!");
                        codeForBtnsAlert = "none";
                        activate_deactivate.innerHTML = '<div><i class="fa-regular fa-circle-stop"></i> Deactivează</div>';
                        activate_btn = false;
                    }).catch(error => {
                        console.error("Eroare la actualizarea activarii:", error);
                    });
                } else {
                    console.log("Utilizatorul nu a fost găsit.");
                }
            }).catch(error => {
                console.error("Eroare la căutarea utilizatorului:", error);
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

usersDB.where("token", "==", localStorage.getItem("userTokenShieldWave")).get().then(snapshot => {
    if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;
        docRef.onSnapshot(doc => {
            if (doc.exists) {
                let new_date = new Date();
                let epoch_seconds = Math.round(new_date.getTime() / 1000);

                const windowWidth = window.innerWidth;
                if (epoch_seconds - doc.data().last_active <= 15 && doc.data().state == "active") {

                    activate_deactivate.innerHTML = '<div><i class="fa-regular fa-circle-stop"></i> Dezactivează</div>';
                    activate_btn = false;
                } else {
                    activate_deactivate.innerHTML = '<div><i class="fa-regular fa-circle-play"></i> Activează</div>';
                    activate_btn = true;
                }

                if (windowWidth < 380) {
                    if (activate_btn == false) {
                        buttons[1].innerHTML = "<div><i class='fa-regular fa-circle-stop'></i></div>";
                    } else {
                        buttons[1].innerHTML = "<div><i class='fa-regular fa-circle-play'></i></div>";
                    }
                }
            }
        });
    } else {
        console.log("User not found.");
    }

}).catch(error => {
    console.error("Error fetching user document:", error);
});


document.querySelector('.deactivate').onclick = () => {
    usersDB.where("token", "==", localStorage.getItem("userTokenShieldWave")).get().then((querySnapshot) => {
        querySnapshot.forEach(doc => {
            let new_date = new Date();
            let epoch_seconds = Math.round(new_date.getTime() / 1000);
            if (epoch_seconds - doc.data().last_active > 15) {
                showAlert("Atenție, sistemul nu este conectat sau e defect!!!");
            } else if (epoch_seconds - doc.data().last_active <= 15 && doc.data().state == "active"){

                usersDB.where("token", "==", localStorage.getItem("userTokenShieldWave")).get()
                .then(userDocs => {
                    if (!userDocs.empty) {
                        const doc = userDocs.docs[0];
                        
                        if (doc.data().deactivateSystem == "no"){
                            codeForBtnsAlert = "deactivateALL";
                            showAlert("Ești sigur că vrei să dezactivezi sistemul?", true);
                        }

                    } else {
                        console.log("Utilizatorul nu a fost găsit.");
                    }
                }).catch(error => {
                    console.error("Eroare la căutarea utilizatorului:", error);
                });

            } else if (epoch_seconds - doc.data().last_active <= 15 && doc.data().state == "inactive") {


                usersDB.where("token", "==", localStorage.getItem("userTokenShieldWave")).get()
                .then(userDocs => {
                    if (!userDocs.empty) {
                        const doc = userDocs.docs[0];
                        
                        if (doc.data().activate == "no"){
                            codeForBtnsAlert = "activateALL";
                            showAlert("Ești sigur că vrei să activezi sistemul?", true);
                        }

                    } else {
                        console.log("Utilizatorul nu a fost găsit.");
                    }
                }).catch(error => {
                    console.error("Eroare la căutarea utilizatorului:", error);
                });
            }
        });
    });
}

document.querySelector('.stop-cam').onclick = () => {

    usersDB.where("token", "==", localStorage.getItem("userTokenShieldWave")).get()
    .then(userDocs => {
        if (!userDocs.empty) {
            const doc = userDocs.docs[0];
            
            if (doc.data().deactivateCam == "no"){
                codeForBtnsAlert = "cameraDeactivateAsk";
                showAlert("Ești sigur că vrei să dezactivezi camera?", true);
            }

        } else {
            console.log("Utilizatorul nu a fost găsit.");
        }
    }).catch(error => {
        console.error("Eroare la căutarea utilizatorului:", error);
    });

}


document.querySelector('.stop-mic').onclick = () => {


    usersDB.where("token", "==", localStorage.getItem("userTokenShieldWave")).get()
    .then(userDocs => {
        if (!userDocs.empty) {
            const doc = userDocs.docs[0];
            
            if (doc.data().deactivateMic == "no"){
                codeForBtnsAlert = "micDeactivateAsk";
                showAlert("Ești sigur că vrei să dezactivezi microfonul?", true);
            }

        } else {
            console.log("Utilizatorul nu a fost găsit.");
        }
    }).catch(error => {
        console.error("Eroare la căutarea utilizatorului:", error);
    });
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
