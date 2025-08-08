const { MongoClient } = require('mongodb');
const { Collection } = require('mongoose');
require('dotenv').config({path: './config.env'});

async function main(){
    const DB = process.env.MONGO_URI;
    const client = new MongoClient(DB);

    try{
        await client.connect();
        console.log("Connected successfully to the database.");

        const collections = await client.db("Rig-Op").collections();

               collections.forEach((collection) =>
            console.log(collection.collectionName)
        );
    } catch(e){
        console.error("Connection failed:", e);
    } 
}

main().catch(console.error);