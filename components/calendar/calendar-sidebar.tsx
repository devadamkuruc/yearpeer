"use client";

import React from 'react';
import { GoalWithTasks } from "@/data/goals";
import Goals from "@/components/calendar/goals";
import DaysLeft from "@/components/calendar/days-left";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import UserButton from "@/components/auth/user-button";

interface CalendarSidebarProps {
    onCreateNewGoal: () => void;
    onEditGoal: (goal: GoalWithTasks) => void;
    goals: GoalWithTasks[];
    currentYear: number;
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
                                                             onCreateNewGoal,
                                                             onEditGoal,
                                                             goals,
                                                             currentYear
                                                         }) => {
    const { data: session } = useSession();
    const user = session?.user;

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/auth/sign-in" });
    };

    return (
        <div className="sticky flex flex-col justify-between right-0 top-0 h-screen bg-black w-[22%] px-4">
            <div className="flex flex-col">
                <div className="flex justify-end w-full my-4">
                    <UserButton/>
                </div>

                {/* Goals Section */}
                <Goals
                    onCreateNewGoal={onCreateNewGoal}
                    onEditGoal={onEditGoal}
                    goals={goals}
                    currentYear={currentYear}
                />
            </div>

            <DaysLeft />
        </div>
    );
};

export default CalendarSidebar;