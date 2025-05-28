// ===================
// Fungsi Register
// ===================
async function register() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const phone = document.getElementById('phone').value;
    const account = document.getElementById('account').value;
    const errorEl = document.getElementById('errorMessage');

    if (!email || !password || !phone || !account) {
        errorEl.textContent = "Semua field harus diisi!";
        return;
    }

    try {
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);

        await firebase.firestore().collection('users').doc(userCredential.user.uid).set({
            email: email,
            phone: phone,
            account: account,
            balance: 0,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        await userCredential.user.sendEmailVerification();

        window.location.href = '/verify-email.html?email=' + encodeURIComponent(email);

    } catch (error) {
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

// ===================
// Fungsi Login
// ===================
async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');

    try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        
        if (!userCredential.user.emailVerified) {
            errorEl.textContent = "Email belum diverifikasi. Silakan cek inbox kamu.";
            return;
        }

        window.location.href = "/dashboard.html";

    } catch (error) {
        let errorMessage = "Login gagal: ";
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                errorMessage += "Email atau password salah";
                break;
            case 'auth/invalid-email':
                errorMessage += "Email tidak valid";
                break;
            default:
                errorMessage += error.message;
        }
        errorEl.textContent = errorMessage;
        console.error("Error login:", error);
    }
}
