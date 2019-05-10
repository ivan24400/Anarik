const redis = require('redis');
const path = require('path');

const redisConfig = require(path.join(__dirname, '..', 'cache', 'redis.js'));

const redisClient = redis.createClient({
  host: redisConfig.host,
  port: redisConfig.port,
});

redisClient.on('connect', () => {
  console.log('Redis connected');
});

redisClient.on('error', () => {
  console.log('Redis connected failed');
  throw new Error('Redis connection failed');
});

module.exports = redisClient;
