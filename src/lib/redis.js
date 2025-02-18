// lib/redis.js
import { createClient } from "redis";

const client = createClient({
  url: process.env.REDIS_URL, // The Redis server URL
});

client.on("error", (err) => {
  console.log("Redis Client Error", err);
});

(async () => {
  await client.connect();
})();

export default client;
