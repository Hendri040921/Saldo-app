import { Client, Account } from 'https://cdn.jsdelivr.net/npm/appwrite@13.0.1/+esm';

const client = new Client();
client
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('684042be002f1040b027');

const account = new Account(client);

export function loginUser(email, password) {
  account.createEmailSession(email, password)
    .then(res => {
      alert("Login berhasil!");
      console.log(res);
    })
    .catch(err => {
      alert("Login gagal: " + err.message);
      console.error(err);
    });
}
