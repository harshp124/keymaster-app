"""
Redis client module for managing Redis connections.
"""

import redis
from config import Config


class RedisClient:
    """Singleton Redis client."""
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(RedisClient, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        """Initialize Redis connection."""
        try:
            redis_url = f"redis://{Config.REDIS_USERNAME}:{Config.REDIS_PASSWORD}@{Config.REDIS_HOST}:{Config.REDIS_PORT}/0"
            self.client = redis.from_url(
                redis_url,
                decode_responses=True
            )
            # Test the connection
            self.client.ping()
            print("✓ Successfully connected to Redis")
        except Exception as e:
            print(f"✗ Failed to connect to Redis: {e}")
            raise

    def get_client(self):
        """Get the Redis client instance."""
        return self.client

    def close(self):
        """Close the Redis connection."""
        if self.client:
            self.client.close()
            print("✓ Redis connection closed")

