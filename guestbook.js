import { db, auth, collection, addDoc, getDocs,serverTimestamp , query, orderBy,doc, updateDoc, deleteDoc} from '/modules/firebase.js';
import { onAuthStateChanged} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";



const guestbookForm = document.getElementById("guestbookForm");
const guestbookEntries = document.getElementById("guestbookEntries");




// 로그인 상태 확인 함수
function checkLoginStatus(callback) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("로그인 상태입니다:", user.email);
      callback(user);
    } else {
      alert("로그인이 필요한 서비스입니다.");
      window.location.href = "/login.html";
    }
  });
}

// 방명록 작성 함수
export function submitGuestbookEntry(pageOwner) {
  guestbookForm.addEventListener("submit", (e) => {
    e.preventDefault(); // 새로고침 없이 DB에 바로 저장

    checkLoginStatus(async (user) => {
      const content = document.getElementById("in_content").value;

      try {
        await addDoc(collection(db, "guestbook"), {
          pageOwner: pageOwner,        // 페이지 주인 
          writerEmail: user.email,     // 작성자 이메일
          nickname: user.displayName,   // 입력된 닉네임
          content: content,            // 입력된 내용
          date: serverTimestamp(),   // 작성 날짜
          profileImageUrl: user.photoURL || "/resources/img/user-thumbnail.png" //
        });

        guestbookForm.reset();
        alert("방명록이 작성되었습니다.");
        loadEntries(pageOwner); // 새로고침 대신 방명록 목록만 다시 로드
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    });
  });
}



// 방명록 목록을 불러오는 함수
export async function loadEntries(pageOwner) {
  guestbookEntries.innerHTML = ""; // 기존 항목 초기화

 // `orderBy`를 사용해 최신순으로 정렬
 const q = query(collection(db, "guestbook"), orderBy("date", "desc"));
 const querySnapshot = await getDocs(q);

 // 모든 데이터를 가져와서 pageOwner로 필터링
 const data = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
 const filteredGuestbooks = data.filter((entry) => entry.pageOwner === pageOwner);

  // 필터링된 항목을 화면에 표시
  filteredGuestbooks.forEach((entry) => {
    displayEntry(entry); // displayEntry 함수에 각 항목을 넘겨 화면에 추가
  });
}

// 개별 방명록 항목을 화면에 표시하는 함수
function displayEntry(entry) {
  const entryDiv = document.createElement("div");
  entryDiv.classList.add("entry");
  entryDiv.dataset.id = entry.id; // 숨겨진 항목으로 ID 저장
  entryDiv.dataset.writerEmail = entry.writerEmail; // 숨겨진 항목으로 작성자 이메일 저장

  const profileBox = document.createElement("div");
  profileBox.classList.add("profile-box");
  
  const profileContent = document.createElement("div");
  profileContent.classList.add("profile-content");

  const profileImageDiv = document.createElement("div");
  profileImageDiv.classList.add("profile-image");

  const profileImage = document.createElement("img");
  profileImage.src = entry.profileImageUrl || "/resources/img/user-thumbnail.png";
  profileImage.alt = "프로필 이미지";
  profileImage.classList.add("profile-img");
  profileImageDiv.appendChild(profileImage);

  onAuthStateChanged(auth, (user) => {
    if (user && user.email === entry.writerEmail) {
      profileImage.src = user.photoURL || "/resources/img/user-thumbnail.png";
      nicknameDiv.textContent = user.displayName || "사용자";
    } else {
      profileImage.src = entry.profileImageUrl || "/resources/img/user-thumbnail.png";
      nicknameDiv.textContent = entry.nickname || "사용자";
    }
  });

  const nicknameDiv = document.createElement("div");
  nicknameDiv.classList.add("nickname");
  nicknameDiv.textContent = entry.nickname;
  const dateDiv = document.createElement("div");
  dateDiv.classList.add("date");
  dateDiv.textContent = entry.date ? new Date(entry.date.seconds * 1000).toLocaleString() : "날짜 정보 없음";

  profileBox.appendChild(profileImageDiv);

  profileBox.appendChild(profileContent);


  profileContent.appendChild(nicknameDiv);
  profileContent.appendChild(dateDiv);

  entryDiv.appendChild(profileBox);

  const contentDiv = document.createElement("div");
  contentDiv.classList.add("entry-content");
  contentDiv.textContent = entry.content;
  entryDiv.appendChild(contentDiv);

  // 현재 로그인한 사용자의 이메일과 작성자의 이메일이 같을 경우 수정/삭제 버튼 추가
  const currentUserEmail = auth.currentUser ? auth.currentUser.email : null;
  if (entry.writerEmail === currentUserEmail) {
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");

    // 수정 버튼
    const editButton = document.createElement("button");
    editButton.textContent = "수정";
    editButton.classList.add("edit-btn");
    editButton.onclick = () => {
      // contentDiv를 textarea로 변경
      const textarea = document.createElement("textarea");
      textarea.classList.add("edit-content");
      textarea.value = entry.content;
      contentDiv.replaceWith(textarea);

      // 저장 버튼 생성
      const saveButton = document.createElement("button");
      saveButton.textContent = "저장";
      saveButton.classList.add("save-btn");
      saveButton.onclick = async () => {
        await handleSave(entry.id, textarea.value);
        location.reload(); // 저장 후 페이지 새로고침
      };

      // 저장 버튼과 수정 버튼을 교체
      buttonContainer.replaceChild(saveButton, editButton);
    };

    // 삭제 버튼
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "삭제";
    deleteButton.classList.add("delete-btn");
    deleteButton.onclick = () => handleDelete(entry.id);

    buttonContainer.appendChild(editButton);
    buttonContainer.appendChild(deleteButton);
    entryDiv.appendChild(buttonContainer);
  }

  guestbookEntries.appendChild(entryDiv);
}

// 저장 핸들러 함수(수정 후 저장버튼)
async function handleSave(entryId, newContent) {
  const entryRef = doc(db, "guestbook", entryId);
  try {
    await updateDoc(entryRef, { content: newContent });
    alert("방명록이 수정되었습니다.");
  } catch (error) {
    console.error("Error updating document: ", error);
  }
}


// 삭제핸들러
async function handleDelete(entryId) {
  if (confirm("이 글을 삭제하시겠습니까?")) {
    const entryRef = doc(db, "guestbook", entryId);
    try {
      await deleteDoc(entryRef);
      alert("방명록이 삭제되었습니다.");
      location.reload(); // 페이지 새로고침
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  }
}
