import { auth } from '/src/modules/firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
    const loginBtn = document.querySelector(".login-btn")
    const logoutBtn = document.querySelector(".logout-btn")

    if (user) {
        console.log("로그인 상태입니다:", user.email);
        loginBtn.style.display = "none";
        logoutBtn.style.display = "block";

        logoutBtn.addEventListener("click", () => {
            signOut(auth)
                .then(() => {
                    alert("로그아웃 되었습니다.");
                })
                .catch((error) => {
                    console.error(error);
                });
        });
    } else {
        console.log("로그인되지 않았습니다.");
        loginBtn.style.display = "block";
        logoutBtn.style.display = "none";
    }
});



// 네비게이션 렌더링
document.addEventListener("DOMContentLoaded", function () {
    fetch('/src/navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar').innerHTML = data;

            const navbarBrand = document.querySelector('.navbar-brand');

            if (navbarBrand) {
                navbarBrand.addEventListener('click', (event) => {
                    event.preventDefault();
                    window.location.href = '/src/index.html';
                });
            }
        })
        .catch(error => console.error('Error loading navbar:', error));
});




