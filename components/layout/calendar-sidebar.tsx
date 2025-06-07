import {
    CalendarIcon,
    Cog6ToothIcon,
    PencilSquareIcon
} from '@heroicons/react/20/solid'
import {
    Sidebar,
    SidebarBody, SidebarFooter,
    SidebarHeader,
    SidebarHeading,
    SidebarItem,
    SidebarLabel,
    SidebarSection
} from "@/components/ui/sidebar";

import prisma from "@/lib/prisma";
import UserAvatar from "@/components/layout/user-avatar";

export default async function CalendarSidebar() {
    const users = await prisma.user.findMany();

    return (
        <Sidebar className="bg-zinc-100 dark:bg-zinc-950 w-[21%]">
            <SidebarHeader>
                <SidebarSection>
                    <img src="/logos/logo-white.svg" alt="logo"  width={125}/>
                </SidebarSection>
            </SidebarHeader>

            <SidebarBody>
                <SidebarSection>
                    <SidebarItem href="/calendar/2025">
                        <CalendarIcon />
                        <SidebarLabel>Calendar</SidebarLabel>
                    </SidebarItem>
                    <SidebarItem href="/notes/2025">
                        <PencilSquareIcon />
                        <SidebarLabel>Notes</SidebarLabel>
                    </SidebarItem>
                    <SidebarItem href="/settings">
                        <Cog6ToothIcon />
                        <SidebarLabel>Settings</SidebarLabel>
                    </SidebarItem>
                </SidebarSection>
                <SidebarSection>
                    <SidebarHeading>
                        Goals
                    </SidebarHeading>
                    <SidebarItem>
                        <div className="h-2.5 w-2.5 rounded-full bg-[#A788FF]"/> Get taxes for 2025 done
                    </SidebarItem>
                    <SidebarItem>
                        <div className="h-2.5 w-2.5 rounded-full bg-[#FFC988]"/> Hire new designer
                    </SidebarItem>
                    <SidebarItem>
                        <div className="h-2.5 w-2.5 rounded-full bg-[#888FFF]"/> Finish yearpeer development
                    </SidebarItem>
                </SidebarSection>

                <SidebarSection>
                    <SidebarHeading>
                        Users
                    </SidebarHeading>
                    {users.map((user) => (
                        <SidebarItem key={user.id}>
                            {user.name}
                        </SidebarItem>
                    ))}


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