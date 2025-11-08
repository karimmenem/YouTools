// Simple in-memory cache for products with TTL (Time To Live)
class ProductCache {
  constructor(ttlMinutes = 5) {
    this.cache = new Map();
    this.ttl = ttlMinutes * 60 * 1000; // Convert to milliseconds
    this.pendingRequests = new Map(); // Deduplicate simultaneous requests
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if cache expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear() {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  // Deduplicate simultaneous requests
  async getOrFetch(key, fetchFn) {
    // Check cache first
    const cached = this.get(key);
    if (cached) {
      return cached;
    }

    // Check if there's already a pending request
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    // Create new request
    const promise = fetchFn()
      .then(result => {
        // Only cache successful results with data
        if (result && result.success && result.data) {
          this.set(key, result);
        }
        this.pendingRequests.delete(key);
        return result;
      })
      .catch(error => {
        this.pendingRequests.delete(key);
        console.error(`Cache fetch error for ${key}:`, error);
        throw error;
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }
}

// Singleton instance
export const productCache = new ProductCache(5); // 5 minute cache

// Helper to add timeout to promises
export const withTimeout = (promise, timeoutMs = 30000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ]);
};

