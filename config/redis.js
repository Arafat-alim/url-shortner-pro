const Redis = require("ioredis");

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    if (times > 5) {
      console.error("Redis connection failed after 5 retries");
      return null; // Stop retrying
    }
    return Math.min(times * 50, 2000); // Retry after 50ms, 100ms, ..., up to 2s
  },
});

redisClient.on("error", (error) => {
  console.error("Redis connection error: ", error);
});

module.exports = redisClient;
