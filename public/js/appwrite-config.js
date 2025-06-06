<script type="module">
  import { Client, Account, Databases } from 'https://cdn.jsdelivr.net/npm/appwrite@13.0.1/+esm';

  const client = new Client();
  client
    .setEndpoint('https://fra.cloud.appwrite.io/v1') // ini sudah benar
    .setProject('684042be002f1040b027'); // Project ID kamu

  const account = new Account(client);

  account.get()
    .then(user => console.log("Login sukses:", user))
    .catch(err => console.log("Belum login:", err));
</script>
