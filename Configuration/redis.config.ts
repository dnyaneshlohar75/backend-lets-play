import { createClient } from "redis";
import dotenv from "dotenv";
import Redis from "ioredis";

dotenv.config();

export const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
    db: Number(process.env.REDIS_DB) || 0,
    retryStrategy: (times) => Math.min(times * 50, 2000),
});

// export const redis = createClient({
//     username: 'default',
//     password: process.env.REDIS_PASSWORD,
//     socket: {
//         host: process.env.REDIS_HOST,
//         port: Number(process.env.REDIS_PORT),
//     }
// });

redis.on('connect', () => {
    console.log("[INFO] Redis server connected");
})

redis.on('connecting', () => {
    console.log("[INFO] Redis server connecting...");
})

redis.on('error', (error) => {
    console.log("[ERROR] Redis server connection failed");
    console.log("[ERROR]", error.message);
})