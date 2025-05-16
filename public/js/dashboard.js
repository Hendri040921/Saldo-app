let currentUser = null;

// Fungsi utama klaim saldo
async function claimSaldo() {
    const code = prompt("Masukkan kode saldo");
    
    try {
        // 1. Validasi kode
        const codeDoc = await db.collection('saldoCodes').doc(code).get();
        
        if(!codeDoc.exists) throw Error("Kode tidak valid");
        if(codeDoc.data().isUsed) throw Error("Kode sudah digunakan");
        
        // 2. Update saldo (pakai transaction)
        await db.runTransaction(async (transaction) => {
            const userRef = db.collection('users').doc(currentUser.uid);
            const userDoc = await transaction.get(userRef);
            
            const newBalance = userDoc.data().balance + codeDoc.data().amount;
            
            // Update saldo user
            transaction.update(userRef, { balance: newBalance });
            
            // Tandai kode sebagai terpakai
            transaction.update(codeDoc.ref, { isUsed: true });
        });
        
        alert("Saldo berhasil ditambahkan!");
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

// Init listener saldo realtime
function initSaldoListener() {
    db.collection('users').doc(currentUser.uid)
        .onSnapshot(doc => {
            document.getElementById('balance').textContent = doc.data().balance;
        });
}
