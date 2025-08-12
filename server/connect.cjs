const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './config.env' });

async function main() {
    const DB = process.env.MONGO_URI;
    
    if (!DB) {
        console.error('FATAL ERROR: MONGO_URI is not defined in config.env');
        process.exit(1);
    }

    const client = new MongoClient(DB, {
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000
    });

    try {
        await client.connect();
        console.log("Connected successfully to MongoDB server");

        const db = client.db("Rig-Op");
        console.log(`Database: ${db.databaseName}`);

        const collections = await db.collections();
        console.log(" Collections:");
        collections.forEach(col => console.log(`- ${col.collectionName}`));

    } catch (e) {
        console.error("onnection failed:", e.message);
        if (e.code === 'ENOTFOUND') {
            console.error("Check your MongoDB server URL and network connection");
        }
    } finally {
        await client.close();
        console.log("Connection closed");
    }
}

// Run with better error handling
main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Fatal error:", e);
        process.exit(1);
    });