import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Disable caching to get real-time results

export async function GET() {
    try {
        // Get all members of the 'players' set
        const players = await kv.smembers('players');

        // Handle case where set is empty (returns null or empty array depending on client)
        const playerList = Array.isArray(players) ? players : [];

        return NextResponse.json({ players: playerList });
    } catch (error) {
        console.error('Error fetching players:', error);
        return NextResponse.json({ error: 'Internal Server Error', players: [] }, { status: 500 });
    }
}
