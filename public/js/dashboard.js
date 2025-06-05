// js/dashboard.js

import { Client, Account, Databases, Query } from 'appwrite'; import { client, account, databases } from './appwrite-config.js';

const poinSegarEl = document.getElementById('poinSegar'); const ternakPoinEl = document.getElementById('ternakPoin'); const tanamPoinEl = document.getElementById('tanamPoin'); const notifikasiList = document.getElementById('notifikasiList'); const logoutBtn = document.getElementById('logoutBtn');

const DATABASE_ID = 'bitroyalty'; const USER_COLLECTION_ID = 'users'; const HISTORY_COLLECTION_ID = 'history';

// Logout button handler logoutBtn.addEventListener('click', async () => { await account.deleteSession('current'); window.location.href = 'login.html'; });

async function loadDashboard() { try { const user = await account.get();

const response = await databases.getDocument(
  DATABASE_ID,
  USER_COLLECTION_ID,
  user.$id
);

const now = new Date();
const lastUpdate = new Date(response.lastUpdate);

const daysPassed = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));

let poinSegar = response.poinSegar || 0;
let ternakPoin = response.ternakPoin || 0;
let tanamPoin = response.tanamPoin || 0;

// Hitung bunga harian majemuk
for (let i = 0; i < daysPassed; i++) {
  const bungaTernak = ternakPoin >= 18000000 ? ternakPoin * (0.07 / 365) : 0;
  const bungaTanam = tanamPoin >= 180000000 ? tanamPoin * (0.20 / 365) : 0;
  const bungaSegar = poinSegar * (0.02 / 365);

  poinSegar += bungaSegar + bungaTernak + bungaTanam;
}

// Simpan update baru
await databases.updateDocument(DATABASE_ID, USER_COLLECTION_ID, user.$id, {
  poinSegar,
  lastUpdate: now.toISOString()
});

// Tampilkan ke UI
poinSegarEl.textContent = Math.floor(poinSegar).toLocaleString();
ternakPoinEl.textContent = Math.floor(ternakPoin).toLocaleString();
tanamPoinEl.textContent = Math.floor(tanamPoin).toLocaleString();

// Tambahkan notifikasi bunga (jika ada bunga)
if (daysPassed > 0) {
  await databases.createDocument(DATABASE_ID, HISTORY_COLLECTION_ID, 'unique()', {
    userId: user.$id,
    message: `Bunga harian ditambahkan setelah ${daysPassed} hari.`,
    createdAt: now.toISOString()
  });
}

// Ambil dan tampilkan histori
const histories = await databases.listDocuments(DATABASE_ID, HISTORY_COLLECTION_ID, [
  Query.equal('userId', user.$id),
  Query.orderDesc('createdAt'),
  Query.limit(20)
]);

notifikasiList.innerHTML = '';
histories.documents.forEach(doc => {
  const li = document.createElement('li');
  li.textContent = `[${new Date(doc.createdAt).toLocaleDateString()}] ${doc.message}`;
  notifikasiList.appendChild(li);
});

} catch (error) { console.error(error); alert('Gagal memuat dashboard. Silakan login ulang.'); window.location.href = 'login.html'; } }

loadDashboard();

