// Inisialisasi Firestore
const db = firebase.firestore();
let currentUser = null;

// Fungsi: Tambahkan bunga harian (3% per tahun ≈ 0.0082% per hari)
async function updateBalanceWithInterest(userId) {
    const userRef = db.collection('users').doc(userId);
    await db.runTransaction(async (tx) => {
        const doc = await tx.get(userRef);
        if (!doc.exists) return;

        const data = doc.data();
        const lastUpdate = data.lastInterestUpdate?.toDate() ?? new Date(0);
        const now = new Date();

        const daysPassed = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));
        if (daysPassed <= 0) return;

        const balance = data.balance ?? 0;
        const annualRate = 0.03;
        const dailyRate = annualRate / 365;
        const newBalance = balance * Math.pow(1 + dailyRate, daysPassed);

        tx.update(userRef, {
            balance: Math.floor(newBalance),
            lastInterestUpdate: firebase.firestore.Timestamp.fromDate(now)
        });
    });
}

// Listener status login
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

            // Hitung dan update bunga
            await updateBalanceWithInterest(user.uid);

            // Mulai listener realtime saldo
            initSaldoListener();
        }
    } catch (error) {
        console.error("Gagal ambil data user:", error);
    }

    // Tombol logout
    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
        btnLogout.addEventListener("click", async () => {
            try {
                await firebase.auth().signOut();
                window.location.href = "/login.html";
            } catch (err) {
                console.error("Logout gagal:", err);
            }
        });
    }

    // Tombol klaim
    const btnClaim = document.getElementById("btnClaim");
    if (btnClaim) {
        btnClaim.addEventListener("click", claimSaldo);
    }
});

// Fungsi klaim kode saldo
async function claimSaldo() {
    const code = document.getElementById("claimCode").value.trim();
    const messageEl = document.getElementById("claimMessage");

    if (!code) {
        messageEl.textContent = "Silakan masukkan kode.";
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

        await db.runTransaction(async (tx) => {
            const userRef = db.collection('users').doc(currentUser.uid);
            const userDoc = await tx.get(userRef);

            const currentBalance = userDoc.data().balance ?? 0;
            const amount = codeDoc.data().amount ?? 0;
            const newBalance = currentBalance + amount;

            tx.update(userRef, { balance: newBalance });
            tx.update(codeDoc.ref, { isUsed: true });
        });

        messageEl.textContent = "Saldo berhasil ditambahkan!";
        document.getElementById("claimCode").value = "";
    } catch (error) {
        console.error("Klaim gagal:", error);
        messageEl.textContent = "Terjadi kesalahan: " + error.message;
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

async function logout() {
    try {
        await firebase.auth().signOut();
        window.location.href = "/login.html";
    } catch (err) {
        console.error("Logout gagal:", err);
        alert("Logout error: " + err.message);
    }
}
