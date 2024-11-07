import { auth } from '/src/modules/firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", function () {
    
    // 네비게이션 렌더링
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

    // 방명록 HTML 및 JS 로드
    fetch('/src/guestbook.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('guestbookSection').innerHTML = data;

            // 방명록 HTML 로드 후 guestbook.js 모듈 불러오기
            import('/src/guestbook.js')
                .then(module => {
                    const userName = document.getElementById("guestbookSection").getAttribute("data-username");
                    console.log("userName:", userName); // userName 값이 제대로 들어오는지 확인

                    module.submitGuestbookEntry(userName); // 방명록 삽입 함수 호출
                    module.loadEntries(userName); // 방명록 목록 출력 함수 호출
                })
                .catch(error => console.error("Failed to load guestbook.js:", error));
        })
        .catch(error => console.error('Error loading guestbook.html:', error));

    // Footer 로드
    fetch('/src/footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer').innerHTML = data;
        })
        .catch(error => console.error('Error loading footer:', error));

    // 로그인 상태 관리
    onAuthStateChanged(auth, (user) => {
        const loginBtn = document.querySelector(".login-btn");
        const logoutBtn = document.querySelector(".logout-btn");
        const userBox = document.querySelector('.user-name');
        const profileImg = document.querySelector('.nav-profile-img');
        const profileBox = document.querySelector('.nav-profile-box');
    
        if (user) {
            console.log("로그인 상태입니다:", user.email);
    
            if (userBox) {
                userBox.innerHTML = user.displayName || '사용자';
            }

            if (profileImg) {
                profileImg.src = user.photoURL || "/resources/img/user-thumbnail.png";
            }
    
            loginBtn.style.display = "none";
            logoutBtn.style.display = "block";
    
            logoutBtn.addEventListener("click", () => {
                signOut(auth)
                    .then(() => {
                        alert("로그아웃 되었습니다.");
                    })
                    .catch((error) => {
                        console.error("로그아웃 오류:", error);
                    });
            });
        } else {
            console.log("로그인되지 않았습니다.");
            profileBox.style.display = "none";
            loginBtn.style.display = "block";
            logoutBtn.style.display = "none";
        }
    });
    
});
