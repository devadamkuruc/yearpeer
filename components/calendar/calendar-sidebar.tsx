import {
    CalendarIcon,
    Cog6ToothIcon,
    PencilSquareIcon,
} from '@heroicons/react/20/solid'
import {
    Sidebar,
    SidebarBody, SidebarFooter,
    SidebarHeader,
    SidebarItem,
    SidebarLabel,
    SidebarSection
} from "@/components/ui/sidebar";

import prisma from "@/lib/prisma";
import UserAvatar from "@/components/common/user-avatar";
import {auth} from "@clerk/nextjs/server";
import {Goal} from "@/app/generated/prisma";
import SidebarGoals from "@/components/calendar/sidebar-goals";

export default async function CalendarSidebar() {
    const { userId } = await auth()

    let goals: Goal[] = []

    // Only fetch goals if user is authenticated
    if (userId) {
        try {
            // Find the user and their goals
            const user = await prisma.user.findUnique({
                where: { clerkId: userId },
                include: {
                    goals: {
                        orderBy: {
                            createdAt: 'desc' // Most recent goals first
                        }
                    }
                }
            })

            goals = user?.goals || []
        } catch (error) {
            console.error('Error fetching user goals:', error)
            goals = []
        }
    }

    return (
        <Sidebar className="bg-zinc-100 dark:bg-zinc-950 w-[21%] h-screen fixed">
            <SidebarHeader>
                <SidebarSection>
                    <img src="/logos/logo-white.svg" alt="logo" width={125}/>
                </SidebarSection>
            </SidebarHeader>

            <SidebarBody>
                <SidebarSection>
                    <SidebarItem href="/calendar/2025">
                        <CalendarIcon/>
                        <SidebarLabel>Calendar</SidebarLabel>
                    </SidebarItem>
                    <SidebarItem href="/notes/2025">
                        <PencilSquareIcon/>
                        <SidebarLabel>Notes</SidebarLabel>
                    </SidebarItem>
                    <SidebarItem href="/settings">
                        <Cog6ToothIcon/>
                        <SidebarLabel>Settings</SidebarLabel>
                    </SidebarItem>
                </SidebarSection>
                <SidebarSection>
                    <SidebarGoals goals={goals} />
                </SidebarSection>
            </SidebarBody>
            <SidebarFooter>
                <SidebarSection>
                    <UserAvatar/>
                </SidebarSection>
            </SidebarFooter>
        </Sidebar>
    )
}