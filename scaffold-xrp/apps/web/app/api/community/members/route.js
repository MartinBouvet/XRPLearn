import client, { isMock } from '../../../../lib/redis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        if (!client.isOpen) await client.connect();

        const membersRaw = await client.sMembers('community_members');
        const members = membersRaw.map(m => {
            try {
                return JSON.parse(m);
            } catch (e) {
                return null;
            }
        }).filter(Boolean);

        return NextResponse.json({ members, isMock });
    } catch (error) {
        console.error('Error fetching community members:', error);
        return NextResponse.json({ error: 'Internal Server Error', members: [] }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, address, avatar, level, status } = body;

        if (!name || !address) {
            return NextResponse.json({ error: 'Missing name or address' }, { status: 400 });
        }

        if (!client.isOpen) await client.connect();

        // Create member object
        const memberData = JSON.stringify({
            name,
            address,
            avatar: avatar || "👤",
            level: level || "1",
            status: status || "online",
            lastSeen: Date.now()
        });

        // Add to set
        await client.sAdd('community_members', memberData);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error registering member:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
