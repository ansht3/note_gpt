import NodeCache from "node-cache";

export const cache = new NodeCache({
  stdTTL: 3600, // Default TTL: 1 hour
  checkperiod: 600, // Check for expired keys every 10 minutes
});
