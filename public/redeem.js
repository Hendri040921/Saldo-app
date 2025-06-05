import { Client, Databases, Account } from "appwrite";
import { client, databases, account, userId } from "./appwrite-config.js";

const redeemForm = document.getElementById("redeemForm");
const redeemResult = document.getElementById("redeemResult");

// ID database dan collection
const DATABASE_ID = "bitroyalty-db"; // ganti sesuai ID database kamu
const CODE_COLLECTION = "redeem-codes"; // collection untuk kode unik
const USER_COLLECTION = "users";        // collection user dan saldo
const HISTORY_COLLECTION = "history";   // untuk mencatat aktivitas poin

redeemForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const codeInput = document.getElementById("code");
  const code = codeInput.value.trim().toUpperCase();

  redeemResult.classList.remove("hidden");
  redeemResult.textContent = "Memproses klaim kode...";

  try {
    // Ambil kode dari database (cari yang match dan belum diklaim)
    const res = await databases.listDocuments(DATABASE_ID, CODE_COLLECTION, [
      Query.equal("code", code)
    ]);

    if (res.documents.length === 0) {
      redeemResult.textContent = "❌ Kode tidak ditemukan atau salah!";
      return;
    }

    const kodeData = res.documents[0];

    if (kodeData.used === true) {
      redeemResult.textContent = "⚠️ Kode ini sudah pernah diklaim.";
      return;
    }

    // Ambil user data
    const userDoc = await databases.getDocument(DATABASE_ID, USER_COLLECTION, userId);

    // Tambahkan poin ke poinSegar
    const poinSekarang = userDoc.poinSegar || 0;
    const poinBaru = poinSekarang + kodeData.value;

    // Update saldo user
    await databases.updateDocument(DATABASE_ID, USER_COLLECTION, userId, {
      poinSegar: poinBaru
    });

    // Tandai kode sebagai sudah diklaim
    await databases.updateDocument(DATABASE_ID, CODE_COLLECTION, kodeData.$id, {
      used: true,
      claimedBy: userId,
      claimedAt: new Date().toISOString()
    });

    // Tambah ke histori
    await databases.createDocument(DATABASE_ID, HISTORY_COLLECTION, ID.unique(), {
      user: userId,
      type: "klaim",
      detail: `Klaim kode ${code} bernilai ${kodeData.value} poin`,
      poinMasuk: kodeData.value,
      poinKeluar: 0,
      waktu: new Date().toISOString()
    });

    redeemResult.textContent = `✅ Kode berhasil diklaim! +${kodeData.value} Poin Segar`;
    codeInput.value = "";

  } catch (err) {
    console.error("Gagal klaim kode:", err);
    redeemResult.textContent = "❌ Terjadi kesalahan saat memproses kode.";
  }
});
