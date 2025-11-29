import client, { isMock } from '../../../../lib/redis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Disable caching to get real-time results

export async function GET() {
    try {
        // Ensure client is connected
        if (!client.isOpen) {
            await client.connect();
        }

        // Get all members of the 'players' set
        const players = await client.sMembers('players');

        // Handle case where set is empty
        const playerList = Array.isArray(players) ? players : [];

        return NextResponse.json({ players: playerList, isMock });
    } catch (error) {
        console.error('Error fetching players:', error);
        return NextResponse.json({ error: 'Internal Server Error', players: [] }, { status: 500 });
    }
}
