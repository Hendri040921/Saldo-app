import { Client, Databases, Account, ID } from 'appwrite';
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, DB_ID, USER_COLLECTION_ID, NOTIF_COLLECTION_ID } from './appwrite-config.js';

const client = new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);
const databases = new Databases(client);
const account = new Account(client);

async function hitungBungaDanHistori() {
  try {
    const session = await account.getSession('current');
    const user = await account.get();
    const userId = user.$id;

    const userData = await databases.getDocument(DB_ID, USER_COLLECTION_ID, userId);

    const now = new Date();
    const lastUpdate = new Date(userData.lastInterestUpdate || 0);
    const msPerDay = 86400000;
    const daysPassed = Math.floor((now - lastUpdate) / msPerDay);

    if (daysPassed <= 0) return;

    let { poinSegar, ternakPoin, tanamPoin } = userData;
    let bungaSegar = 0, bungaTernak = 0, bungaTanam = 0;

    const compound = (p, rate, days) => p * Math.pow(1 + rate / 365, days) - p;

    bungaSegar = compound(poinSegar, 0.02, daysPassed);
    if (ternakPoin >= 18000000) bungaTernak = compound(ternakPoin, 0.07, daysPassed);
    if (tanamPoin >= 180000000) bungaTanam = compound(tanamPoin, 0.20, daysPassed);

    const totalBunga = bungaSegar + bungaTernak + bungaTanam;

    await databases.updateDocument(DB_ID, USER_COLLECTION_ID, userId, {
      poinSegar: poinSegar + totalBunga,
      lastInterestUpdate: now.toISOString()
    });

    const historiMsg = `+${totalBunga.toFixed(2)} poin dari bunga harian (${daysPassed} hari)`;
    await databases.createDocument(DB_ID, NOTIF_COLLECTION_ID, ID.unique(), {
      userId,
      pesan: historiMsg,
      waktu: now.toISOString()
    });

    console.log('Bunga ditambahkan dan histori dicatat.');
  } catch (err) {
    console.error('Gagal hitung bunga:', err.message);
  }
}

export default hitungBungaDanHistori;
