const redisClient = require("../config/redis");

// Get data from Redis cache
exports.getFromCache = async (key) => {
  const cachedData = await redisClient.get(key);
  return cachedData ? JSON.parse(cachedData) : null;
};

// Set data in Redis cache
exports.setInCache = async (key, data, ttl = 600) => {
  await redisClient.setex(key, ttl, JSON.stringify(data));
};

// Delete data from Redis cache
exports.deleteFromCache = async (key) => {
  await redisClient.del(key);
};
