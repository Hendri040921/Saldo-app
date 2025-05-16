async function register() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const phone = document.getElementById('phone').value;
    const account = document.getElementById('account').value;

    try {
        // 1. Buat user
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // 2. Simpan data tambahan ke Firestore
        await db.collection('users').doc(userCredential.user.uid).set({
            email: email,
            phone: phone,
            account: account,
            balance: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // 3. Kirim verifikasi email
        await userCredential.user.sendEmailVerification();
        alert('Email verifikasi telah dikirim!');
        window.location.href = '/login.html';
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}
