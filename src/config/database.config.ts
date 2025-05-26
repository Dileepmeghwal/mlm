import mongoose, { ConnectOptions } from "mongoose";

const curr="mongodb+srv://<db_username>:<db_password>@ml.qkuo7.mongodb.net/?retryWrites=true&w=majority&appName=ML"
//const uri = "mongodb://localhost:27017/mlm?retryWrites=true&w=majority&appName=ML";
const uri='mongodb+srv://admin:mlm%231%40dtfindia%24%23000%23%24@cluster0.rilg88z.mongodb.net/mlm?retryWrites=true&w=majority&appName=Cluster0'
const options: any = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: { version: "1", strict: true, deprecationErrors: true }
  };async function run() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, options);
    await mongoose.connection?.db?.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await mongoose.disconnect();
  }
}

async function databaseConnect() {
    // await run().catch(console.dir);
    // return;
  const options: ConnectOptions = {
    serverApi: { version: "1", strict: true, deprecationErrors: true },
  };
  const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };


  try {
    await mongoose.connect(uri,options);

    console.log(
      `Pinged your deployment. You successfully connected to MongoDB database '${mongoose?.connection?.db?.databaseName}'!`
    );
    mongoose.set("debug", true);
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
    // process.exit(1);
  }
  return true;
}

export default databaseConnect;
