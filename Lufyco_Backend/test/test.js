const mongoose = require("mongoose");

async function test() {
  try {
    const conn = await mongoose.connect("mongodb://nihinsa:1234@ac-6amhcgh-shard-00-00.yrkfagi.mongodb.net:27017,ac-6amhcgh-shard-00-01.yrkfagi.mongodb.net:27017,ac-6amhcgh-shard-00-02.yrkfagi.mongodb.net:27017/?ssl=true&replicaSet=atlas-l837i1-shard-0&authSource=admin&appName=Cluster0");
    console.log("Connected:", conn.connection.host);
    process.exit(0);
  } catch (err) {
    console.error("Connection failed:");
    console.error(err.message);
    process.exit(1);
  }
}

test();