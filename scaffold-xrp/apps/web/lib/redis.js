import { createClient } from 'redis';

let client;

// Mock Redis Client for Local Development (when no KV_URL is provided)
class MockRedis {
    constructor() {
        this.store = new Map();
        this.isOpen = false;
        console.log("⚠️  Using Mock Redis (In-Memory) for Local Development");
    }

    async connect() {
        this.isOpen = true;
        console.log("✅ Mock Redis Connected");
    }

    on(event, callback) {
        // No-op for mock
    }

    async sAdd(key, value) {
        if (!this.store.has(key)) {
            this.store.set(key, new Set());
        }
        this.store.get(key).add(value);
        return 1; // Added
    }

    async sMembers(key) {
        if (!this.store.has(key)) {
            return [];
        }
        return Array.from(this.store.get(key));
    }
}

const url = process.env.KV_REDIS_URL || process.env.KV_URL;

if (!client) {
    if (url) {
        // Real Redis Client (Production / Vercel)
        client = createClient({
            url: url,
            socket: {
                tls: url.startsWith('rediss://'),
                rejectUnauthorized: false
            }
        });
        client.on('error', (err) => console.error('Redis Client Error', err));
        client.connect().catch(console.error);
    } else {
        // Mock Client (Localhost without env vars)
        client = new MockRedis();
        // Auto-connect mock
        client.connect();
    }
}

export default client;
