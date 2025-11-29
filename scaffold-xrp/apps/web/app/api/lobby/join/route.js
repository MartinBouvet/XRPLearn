import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { username } = body;

        if (!username || typeof username !== 'string' || username.trim().length === 0) {
            return NextResponse.json({ error: 'Invalid username' }, { status: 400 });
        }

        // Add user to the 'players' set
        // We use a set to ensure unique usernames (simplification for hackathon)
        await kv.sadd('players', username.trim());

        return NextResponse.json({ success: true, username: username.trim() });
    } catch (error) {
        console.error('Error joining lobby:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
