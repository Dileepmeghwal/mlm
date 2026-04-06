import mongoose, { ConnectOptions } from "mongoose";

const uri = "mongodb+srv://admin:mlm%231%40dtfindia%24%23000%23%24@cluster0.rilg88z.mongodb.net/mlm?retryWrites=true&w=majority&appName=Cluster0";

async function databaseConnect() {
  const options: ConnectOptions = {
    serverApi: { version: "1", strict: true, deprecationErrors: true },
  };

  try {
    await mongoose.connect(uri, options);

    console.log(
      `Pinged your deployment. You successfully connected to MongoDB database '${mongoose?.connection?.db?.databaseName}'!`
    );
    mongoose.set("debug", true);
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
  }
  return true;
}

export default databaseConnect;
