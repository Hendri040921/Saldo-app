async function register() {
    // 1. Ambil nilai input
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const phone = document.getElementById('phone').value;
    const account = document.getElementById('account').value;
    const errorEl = document.getElementById('errorMessage');

    // 2. Validasi input
    if (!email || !password || !phone || !account) {
        errorEl.textContent = "Semua field harus diisi!";
        return;
    }

    try {
        // 3. Daftarkan user ke Firebase Auth
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        
        // 4. Simpan data tambahan ke Firestore
        await firebase.firestore().collection('users').doc(userCredential.user.uid).set({
            email: email,
            phone: phone,
            account: account,
            balance: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // 5. Kirim email verifikasi
        await userCredential.user.sendEmailVerification();
        
        // 6. Redirect ke halaman verifikasi
        window.location.href = '/verify-email.html?email=' + encodeURIComponent(email);
        
    } catch (error) {
        // 7. Handle error
        let errorMessage = "Pendaftaran gagal: ";
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage += "Email sudah terdaftar";
                break;
            case 'auth/invalid-email':
                errorMessage += "Format email tidak valid";
                break;
            case 'auth/weak-password':
                errorMessage += "Password minimal 6 karakter";
                break;
            default:
                errorMessage += error.message;
        }
        errorEl.textContent = errorMessage;
        console.error("Error register:", error);
    }
}
