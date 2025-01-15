let email = document.getElementsByName('email')[0];
let password = document.getElementsByName('password')[0];
let submit = document.getElementsByName('submit_btn')[0];
console.log(submit);
submit.onclick = () => {
    firebase.auth().signInWithEmailAndPassword(email.value, password.value)
    .then((userCredential) => {
        let user = userCredential.user;
        let btn = document.getElementsByName('submit_btn')[0];
        btn.style.backgroundColor = '#4BB543';
        btn.innerHTML = 'Succes!!!';
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 2000)
        console.log(user);
    }).catch((err) => {
        console.log(err);
        if (err.code == "auth/invalid-email"){
            showError("Email-ul este formatat incorect",true);
        }else if (err.code == "auth/wrong-password"){
            showError("Parola nu este introdusă",true);
        }else if (err.code == "auth/user-not-found"){
            showError("Utilizatorul nu a fost găsit",true);
        }
    });
}
