// Fungsi Login
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // 1. Login dengan Firebase Auth
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        
        // 2. Cek email sudah diverifikasi
        if (!userCredential.user.emailVerified) {
            alert('Harap verifikasi email terlebih dahulu!');
            await firebase.auth().signOut();
            return;
        }
        
        // 3. Redirect ke dashboard jika berhasil
        window.location.href = '/dashboard.html';
    } catch (error) {
        // Handle error
        let errorMessage = "Login gagal: ";
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage += "Email tidak terdaftar";
                break;
            case 'auth/wrong-password':
                errorMessage += "Password salah";
                break;
            default:
                errorMessage += error.message;
        }
        alert(errorMessage);
    }
}

// Cek apakah user sudah login
firebase.auth().onAuthStateChanged((user) => {
    if (user && user.emailVerified) {
        window.location.href = '/dashboard.html';
    }
});
