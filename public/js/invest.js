// /bitroyalty/js/invest.js

import { Client, Databases, Account, ID } from "appwrite";
import { client, databases, databaseId, userId } from "./appwrite-config.js";

const collectionId = "poin"; // Ganti dengan collection ID saldo user

const showMessage = (msg, isError = false) => {
  const box = document.getElementById("investMessage");
  box.innerText = msg;
  box.style.color = isError ? "red" : "green";
};

// Fungsi setoran Ternak
async function investTernak() {
  const amount = parseInt(document.getElementById("ternakAmount").value);
  if (!amount || amount <= 0) return showMessage("Masukkan jumlah valid", true);

  if (amount < 18000000) return showMessage("Minimal 18 juta poin untuk ternak", true);

  try {
    const doc = await databases.getDocument(databaseId, collectionId, userId);
    if (doc.poin_segar < amount) return showMessage("Poin segar tidak cukup", true);

    const newTernak = doc.ternak_poin + amount;
    const newSegar = doc.poin_segar - amount;

    await databases.updateDocument(databaseId, collectionId, userId, {
      poin_segar: newSegar,
      ternak_poin: newTernak,
    });

    showMessage("Ternak berhasil disetor!");
  } catch (error) {
    showMessage("Gagal menyetor ternak", true);
  }
}

// Fungsi setoran Tanam
async function investTanam() {
  const amount = parseInt(document.getElementById("tanamAmount").value);
  if (!amount || amount <= 0) return showMessage("Masukkan jumlah valid", true);

  if (amount < 180000000) return showMessage("Minimal 180 juta poin untuk tanam", true);

  try {
    const doc = await databases.getDocument(databaseId, collectionId, userId);
    if (doc.poin_segar < amount) return showMessage("Poin segar tidak cukup", true);

    const newTanam = doc.tanam_poin + amount;
    const newSegar = doc.poin_segar - amount;

    await databases.updateDocument(databaseId, collectionId, userId, {
      poin_segar: newSegar,
      tanam_poin: newTanam,
    });

    showMessage("Tanam berhasil disetor!");
  } catch (error) {
    showMessage("Gagal menyetor tanam", true);
  }
}

window.investTernak = investTernak;
window.investTanam = investTanam;
