import client from '../../../../lib/redis';
import { NextResponse } from 'next/server';

export async function DELETE() {
    try {
        if (!client.isOpen) await client.connect();

        // Clear the sets
        await client.del('players');
        await client.del('community_members');

        return NextResponse.json({ success: true, message: "Game state reset successfully" });
    } catch (error) {
        console.error('Error resetting game:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
