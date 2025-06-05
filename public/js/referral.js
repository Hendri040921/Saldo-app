import { account, databases } from './appwrite-config.js';

// Konstanta untuk konfigurasi Appwrite
const DATABASE_ID = '684090e700319f1a1afd';         // Ganti sesuai ID database kamu
const COLLECTION_ID = '6841dad3003d0a01127e';            // Koleksi yang menyimpan user

// Fungsi utama: tampilkan info referral
async function loadReferralData() {
  try {
    const user = await account.get();
    const userId = user.$id;

    // Tampilkan userId sebagai kode referral
    document.getElementById('referralCode').value = userId;

    // Ambil semua user yang referrerId-nya = user ini
    const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
      {
        key: 'referrerId',
        value: userId,
        operator: 'equal'
      }
    ]);

    let totalPassive = 0;
    const tbody = document.querySelector('#downlineTable tbody');
    tbody.innerHTML = '';

    response.documents.forEach(downline => {
      const passiveIncome = Math.floor((downline.poinSegar || 0) * 0.20); // 20%
      totalPassive += passiveIncome;

      const row = `
        <tr>
          <td>${downline.email}</td>
          <td>${new Date(downline.$createdAt).toLocaleDateString()}</td>
          <td>${passiveIncome}</td>
        </tr>
      `;
      tbody.insertAdjacentHTML('beforeend', row);
    });

    document.getElementById('totalIncome').textContent = totalPassive;

  } catch (err) {
    console.error("Gagal mengambil data referral", err);
    alert("Gagal memuat data referral.");
  }
}

// Tombol salin kode referral
window.copyReferral = function () {
  const codeInput = document.getElementById('referralCode');
  codeInput.select();
  document.execCommand("copy");
  alert("Kode referral berhasil disalin!");
};

// Jalankan saat halaman dimuat
loadReferralData();
