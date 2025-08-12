// 🔧 Firebase конфіг
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const wishList = document.getElementById('wishList');
const form = document.getElementById('wishForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const link = document.getElementById('link').value;
  const author = document.getElementById('author').value;
  const comment = document.getElementById('comment').value;
  const image = await fetchOGImage(link);
  const date = new Date().toISOString();

  await db.collection('wishes').add({ link, author, comment, image, date });
  form.reset();
  loadWishes();
});

async function fetchOGImage(url) {
  try {
    const res = await fetch(url);
    const text = await res.text();
    const match = text.match(/<meta property="og:image" content="(.*?)"/);
    return match ? match[1] : 'https://via.placeholder.com/250x150?text=Фото';
  } catch {
    return 'https://via.placeholder.com/250x150?text=Фото';
  }
}

async function loadWishes() {
  const snapshot = await db.collection('wishes').orderBy('date', 'desc').get();
  wishList.innerHTML = '';
  snapshot.forEach(doc => {
    const wish = doc.data();
    const id = doc.id;
    const card = document.createElement('div');
    card.className = 'wish-card';
    card.innerHTML = `
      <img src="${wish.image}" alt="Фото" />
      <p><strong>Автор:</strong> ${wish.author}</p>
      <p><strong>Дата:</strong> ${new Date(wish.date).toLocaleString()}</p>
      ${wish.comment ? `<p><strong>Коментар:</strong> ${wish.comment}</p>` : ''}
      <a href="${wish.link}" target="_blank">🔗 Перейти</a>
      <button onclick="editWish('${id}')">✏️ Редагувати</button>
      <button onclick="deleteWish('${id}')">🗑️ Видалити</button>
    `;
    wishList.appendChild(card);
  });
}

async function deleteWish(id) {
  await db.collection('wishes').doc(id).delete();
  loadWishes();
}

function editWish(id) {
  const newComment = prompt("Введи новий коментар:");
  if (newComment !== null) {
    db.collection('wishes').doc(id).update({ comment: newComment });
    loadWishes();
  }
}

loadWishes();