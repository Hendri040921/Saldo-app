// js/auth.js

import { Client, Account, ID } from "https://cdn.jsdelivr.net/npm/appwrite@13.0.0/+esm";
import { client, account } from "./appwrite-config.js";

// Fungsi Register
export async function registerUser(email, password, name) {
  try {
    const response = await account.create(ID.unique(), email, password, name);
    await account.createVerification("https://saldoapp.netlify.app/login.html");
    alert("Berhasil daftar. Cek email untuk verifikasi.");
    window.location.href = "login.html";
  } catch (error) {
    alert("Gagal daftar: " + error.message);
  }
}

// Fungsi Login
export async function loginUser(email, password) {
  try {
    await account.createEmailSession(email, password);
    const user = await account.get();

    if (!user.emailVerification) {
      await account.deleteSession("current");
      alert("Akun belum diverifikasi. Cek email kamu.");
      return;
    }

    window.location.href = "dashboard.html";
  } catch (error) {
    alert("Login gagal: " + error.message);
  }
}

// Fungsi Forgot Password
export async function forgotPassword(email) {
  try {
    await account.createRecovery(email, "https://saldoapp.netlify.app/reset.html");
    alert("Link reset password dikirim ke email kamu.");
  } catch (error) {
    alert("Gagal kirim link: " + error.message);
  }
}
