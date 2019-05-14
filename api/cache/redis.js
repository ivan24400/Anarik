/**
 * Redis cache setup
 * @module cache/redis
 * @requires local:web3-helper
 * @requires redis
 */
const redis = require('redis');

const redisConfig = require('../cache/redis');

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
