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

        for (let doc of elements) {
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
                if (alert.classification == "Intenție Rea"){
                    html += `
                        <div class="alert-div" data-id="${alert.doc_id}">
                            <div>Limbaj</div>
                            <div class="hour-of-alert">${alert.time}</div>
                            <div>${alert.classification}</div>
                            <div><div class="probability ${alert.color_class}">${alert.confidence}%</div></div>
                            <div class="link-obj"><a href="${alert.link}">Link la frază</a></div>
                        </div>
                    `;
                }else{
                    html += `
                        <div class="alert-div" data-id="${alert.doc_id}">
                            <div>${alert.detection_type}</div>
                            <div class="hour-of-alert">${alert.time}</div>
                            <div>${alert.classification}</div>
                            <div><div class="probability ${alert.color_class}">${alert.confidence}%</div></div>
                            <div class="link-obj"><a href="${alert.link}">${alert.detection_type == "Video" ? "Link la video" : "Link la audio"}</a></div>
                        </div>
                    `;
                }
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
