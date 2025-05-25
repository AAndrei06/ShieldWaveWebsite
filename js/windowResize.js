window.addEventListener('resize', () => {
    const windowWidth = window.innerWidth;

    if (windowWidth < 380) {
        buttons[0].innerHTML = "<div><i class='fa-solid fa-trash-can'></i></div>";
        if (activate_btn == false) {
            buttons[1].innerHTML = "<div><i class='fa-regular fa-circle-stop'></i></div>";
        } else {
            buttons[1].innerHTML = "<div><i class='fa-regular fa-circle-play'></i></div>";
        }
        buttons[2].innerHTML = "<div><i class='fa-solid fa-arrow-right-from-bracket'></i></div>";
        stopBtns[0].innerHTML = "<div><i class='fa-solid fa-video'></i></div>";
        stopBtns[1].innerHTML = "<div><i class='fa-solid fa-microphone'></i></div>";
        linkBtns[0].innerHTML = "<div><i class='fa-solid fa-plus'></i></div>";
        linkBtns[1].innerHTML = "<div><i class='fa-solid fa-trash-can'></i></div>";

    } else if (windowWidth > 380) {
        buttons[0].innerHTML = "<div><i class='fa-solid fa-trash-can'></i> Șterge alertele</div>";
        if (activate_btn == false) {
            buttons[1].innerHTML = "<div><i class='fa-regular fa-circle-stop'></i> Dezactivează</div>";
        } else {
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
    if (activate_btn == false) {
        buttons[1].innerHTML = "<div><i class='fa-regular fa-circle-stop'></i></div>";
    } else {
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
