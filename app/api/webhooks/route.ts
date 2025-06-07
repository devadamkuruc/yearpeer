import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest } from 'next/server'
import prisma from "@/lib/prisma";
import { UserJSON } from '@clerk/nextjs/server';

// Helper function using Clerk's UserJSON type
async function upsertUser(userData: UserJSON) {
    const { id, email_addresses, first_name, image_url } = userData;

    if (!id || !email_addresses?.[0]?.email_address) {
        throw new Error('Missing required user data');
    }

    return prisma.user.upsert({
        where: {clerkId: id},
        update: {
            email: email_addresses[0].email_address,
            name: first_name || null,
            imageUrl: image_url || null,
        },
        create: {
            clerkId: id,
            email: email_addresses[0].email_address,
            name: first_name || null,
            imageUrl: image_url || null,
        }
    });
}

export async function POST(req: NextRequest) {
    try {
        const evt = await verifyWebhook(req)
        console.log(`Webhook received: ${evt.type}`)

        if (evt.type === 'user.created' || evt.type === 'user.updated') {
            try {
                const user = await upsertUser(evt.data);
                console.log(`User ${user.clerkId} synced to database (Clerk event: ${evt.type})`);
                return new Response(JSON.stringify(user), { status: 200 });

            } catch (error) {
                console.error(`Database error during ${evt.type}:`, error);
                return new Response('Database error', { status: 500 });
            }
        }

        if (evt.type === 'user.deleted') {
            const { id } = evt.data;

            if (!id) {
                return new Response('Invalid user data', { status: 400 });
            }

            try {
                const result = await prisma.user.deleteMany({
                    where: { clerkId: id }
                });

                console.log(`User deletion: ${result.count > 0 ? 'success' : 'user not found'}`);
                return new Response(JSON.stringify({ deleted: result.count }), { status: 200 });

            } catch (error) {
                console.error('Database error during user.deleted:', error);
                return new Response('Database error', { status: 500 });
            }
        }

        return new Response('Webhook received', { status: 200 });

    } catch (err) {
        console.error('Error verifying webhook:', err);
        return new Response('Error verifying webhook', { status: 400 });
    }
}