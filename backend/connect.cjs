// server/server.js
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Correctly load the .env file from the parent directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const DB = process.env.MONGO_URI;

if (!DB) {
    console.error('FATAL ERROR: MONGO_URI is not defined in root .env');
    process.exit(1);
}

async function main() {
    const client = new MongoClient(DB, {
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000
    });

    try {
        await client.connect();
        console.log("Connected successfully to MongoDB server");
        const db = client.db("Rig-Op");
        console.log(`Database: ${db.databaseName}`);
    } catch (e) {
        console.error("Connection failed:", e.message);
    } finally {
        await client.close();
    }
}

main().catch(console.error);