import cors from "cors";
import express from "express";
import helmet from "helmet";
import { HOST, PORT } from "./config.js";
import { router } from "./routes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use("/api", router);

app.listen(PORT, HOST, () => {
  console.log(`Pro Clubs API listening on http://${HOST}:${PORT}`);
});
