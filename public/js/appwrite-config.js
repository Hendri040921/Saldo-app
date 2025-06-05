// js/appwrite-config.js

import { Client, Account, Databases } from 'appwrite';

const client = new Client();

client
  .setEndpoint('https://fra.cloud.appwrite.io/v1') // GANTI dengan endpoint Appwrite kamu
  .setProject('684042be002f1040b027');              // GANTI dengan Project ID kamu

const account = new Account(client);
const databases = new Databases(client);

export { client, account, databases };
