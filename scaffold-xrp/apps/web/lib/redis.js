import { createClient } from 'redis';

let client;

if (!process.env.KV_REDIS_URL && !process.env.KV_URL) {
    console.warn("Redis URL not found in environment variables (KV_REDIS_URL or KV_URL)");
}

const url = process.env.KV_REDIS_URL || process.env.KV_URL;

if (!client) {
    client = createClient({
        url: url,
        socket: {
            tls: url && url.startsWith('rediss://'), // Enable TLS if using rediss protocol
            rejectUnauthorized: false // Often needed for some managed Redis providers
        }
    });

    client.on('error', (err) => console.error('Redis Client Error', err));

    // Connect immediately
    client.connect().catch(console.error);
}

export default client;
