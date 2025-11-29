import client from '../../../../lib/redis';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { username } = body;

        if (!username || typeof username !== 'string' || username.trim().length === 0) {
            return NextResponse.json({ error: 'Invalid username' }, { status: 400 });
        }

        // Ensure client is connected (it should be, but just in case)
        if (!client.isOpen) {
            await client.connect();
        }

        // Add user to the 'players' set
        await client.sAdd('players', username.trim());

        return NextResponse.json({ success: true, username: username.trim() });
    } catch (error) {
        console.error('Error joining lobby:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
