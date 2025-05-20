import Express, { Application, Request, Response } from "express";
import databaseConnect from "./config/database.config";
import useApi from "./routes";
// import routes from "./src/routes";
// import useApi from "./src/routes";

const cors = require("cors");
const app: Application = Express();

//Applying middleware
app.use(Express.json());
app.use(cors());
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});
app.use(Express.static("public"));

//Starting the server
async function startServer() {
  //Adding a route
  useApi(app);
  // connecting Database
  await databaseConnect();
  const port = process?.env?.PORT || 8000;
  app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
  });
  return app;
}

startServer();
export default app;
