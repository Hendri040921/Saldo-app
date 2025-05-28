// Inisialisasi Firestore
const db = firebase.firestore();
let currentUser = null;

// Cek login status dan ambil data user
firebase.auth().onAuthStateChanged(async (user) => {
    if (!user || !user.emailVerified) {
        window.location.href = "/login.html";
        return;
    }

    currentUser = user;
    document.getElementById("userEmail").textContent = user.email;

    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            const data = userDoc.data();
            document.getElementById("userPhone").textContent = data.phone ?? "-";
            document.getElementById("userBalance").textContent = data.balance ?? 0;

            // Mulai listener realtime saldo
            initSaldoListener();
        } else {
            console.error("Data user tidak ditemukan");
        }
    } catch (error) {
        console.error("Gagal ambil data user:", error);
    }
});

// Logout handler
document.getElementById("btnLogout").addEventListener("click", () => {
    firebase.auth().signOut().then(() => {
        window.location.href = "/login.html";
    }).catch((error) => {
        console.error("Logout gagal:", error);
    });
});

// Tombol klaim saldo
document.getElementById("btnClaim").addEventListener("click", claimSaldo);

// Fungsi utama klaim saldo
async function claimSaldo() {
    const code = document.getElementById("claimCode").value.trim();
    const messageEl = document.getElementById("claimMessage");

    if (!code) {
        messageEl.textContent = "Kode tidak boleh kosong.";
        return;
    }

    try {
        const codeDoc = await db.collection('saldoCodes').doc(code).get();

        if (!codeDoc.exists) {
            messageEl.textContent = "Kode tidak valid.";
            return;
        }

        if (codeDoc.data().isUsed) {
            messageEl.textContent = "Kode sudah digunakan.";
            return;
        }

        await db.runTransaction(async (transaction) => {
            const userRef = db.collection('users').doc(currentUser.uid);
            const userDoc = await transaction.get(userRef);

            const currentBalance = userDoc.data().balance ?? 0;
            const amount = codeDoc.data().amount ?? 0;
            const newBalance = currentBalance + amount;

            transaction.update(userRef, { balance: newBalance });
            transaction.update(codeDoc.ref, { isUsed: true });
        });

        messageEl.textContent = "Saldo berhasil ditambahkan!";
        document.getElementById("claimCode").value = "";

    } catch (error) {
        console.error("Klaim saldo gagal:", error);
        messageEl.textContent = `Gagal: ${error.message}`;
    }
}

// Listener realtime saldo
function initSaldoListener() {
    db.collection('users').doc(currentUser.uid).onSnapshot(doc => {
        if (doc.exists) {
            const balance = doc.data().balance ?? 0;
            document.getElementById("userBalance").textContent = balance;
        }
    });
}
