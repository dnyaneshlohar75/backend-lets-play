import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { setupSocketIO } from "./Routes/ws";

import userRoutes from "./Routes/user";
import matchesRoutes from "./Routes/matches";

import { initKafkaConsumer } from "./utils/consumer";
import groundRoutes from "./Routes/grounds";
import { redis } from "./Configuration/redis.config";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[INFO] Server running at http://localhost:${PORT}`);
  console.log(`[INFO] WebSocket listening at ws://localhost:${PORT}/match`);
});

app.use(cors());
app.use(express.json());

app.use("/api/user/", userRoutes);
app.use("/api/matches/", matchesRoutes);
app.use("/api/grounds/", groundRoutes);

// initKafkaConsumer().then((res) => {
//   // console.log(res)
// }).catch((err) => {
//   console.log(err)
// });

// redis.connect();

setupSocketIO(server);

