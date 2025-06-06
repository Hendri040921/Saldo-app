<script type="module">
  import { Client, Account, Databases } from 'https://cdn.jsdelivr.net/npm/appwrite@13.0.1/+esm';

  const client = new Client();
  client
    .setEndpoint('https://fra.cloud.appwrite.io/v1') // Ganti sesuai server kamu
    .setProject('684042be002f1040b027');

  const account = new Account(client);
  // Lanjutkan penggunaan...
</script>
