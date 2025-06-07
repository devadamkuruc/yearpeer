import { PrismaClient, Prisma } from "@/app/generated/prisma";

const prisma = new PrismaClient();

export async function main() {
    // First, create users
    const alice = await prisma.user.create({
        data: {
            clerkId: "user_alice123",
            name: "Alice",
            email: "alice@example.io",
        }
    });

    const bob = await prisma.user.create({
        data: {
            clerkId: "user_bob456",
            name: "Bob",
            email: "bob@example.io",
        }
    });

    // Then create goals with tasks, including authorId
    await prisma.goal.create({
        data: {
            title: "Learn Programming",
            description: "Master JavaScript and TypeScript fundamentals",
            authorId: alice.id,
            tasks: {
                create: [
                    {
                        title: "Complete JavaScript Course",
                        content: "Finish the online JavaScript course on Udemy",
                        published: true,
                        authorId: alice.id, // Required!
                    },
                    {
                        title: "Build a Todo App",
                        content: "Create a todo application using vanilla JavaScript",
                        authorId: alice.id, // Required!
                    },
                ],
            },
        },
    });

    await prisma.goal.create({
        data: {
            title: "Get Fit",
            description: "Improve physical health and fitness",
            authorId: alice.id,
            tasks: {
                create: [
                    {
                        title: "Daily Morning Run",
                        content: "Run 30 minutes every morning",
                        published: true,
                        authorId: alice.id, // Required!
                    },
                ],
            },
        },
    });

    await prisma.goal.create({
        data: {
            title: "Career Growth",
            description: "Advance in software development career",
            authorId: bob.id,
            tasks: {
                create: [
                    {
                        title: "Update Resume",
                        content: "Refresh resume with recent projects and skills",
                        published: true,
                        authorId: bob.id, // Required!
                    },
                    {
                        title: "Apply to Jobs",
                        content: "Apply to 5 senior developer positions",
                        authorId: bob.id, // Required!
                    },
                ],
            },
        },
    });
}

main();