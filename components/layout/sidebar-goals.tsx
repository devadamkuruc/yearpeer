'use client'

import {SidebarHeading, SidebarItem} from "@/components/ui/sidebar";
import {Goal} from "@/app/generated/prisma";
import CreateGoalDialog from "@/components/layout/create-goal-dialog";
import {useState} from "react";
import EditGoalDialog from "@/components/layout/edit-goal-dialog";

interface SidebarGoalsProps {
    goals: Goal[]
}

export default function SidebarGoals({goals}: SidebarGoalsProps) {
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const handleGoalClick = (goal: Goal) => {
        setSelectedGoal(goal)
        setIsEditDialogOpen(true)
    }

    const handleCloseEditDialog = () => {
        setIsEditDialogOpen(false)
        setSelectedGoal(null)
    }

    return (
        <>
            <SidebarHeading>
                Goals
            </SidebarHeading>
            {goals.length > 0 ? (
                goals.map((goal) => (
                    <SidebarItem key={goal.id}
                                 onClick={() => handleGoalClick(goal)}
                                 className='cursor-pointer'
                    >
                        <div className='h-2.5 w-2.5 rounded-full'
                             style={{backgroundColor: goal.color || ''}}
                        />
                        <span className="truncate" title={goal.description || goal.title}>
                                    {goal.title}
                                </span>
                    </SidebarItem>
                ))
            ) : (
                <div className="text-zinc-500 dark:text-zinc-400 text-xs px-2 py-1">
                    No goals yet. Create your first one!
                </div>
            )}
            <CreateGoalDialog/>

            <EditGoalDialog
                goal={selectedGoal}
                isOpen={isEditDialogOpen}
                onClose={handleCloseEditDialog}
            />
        </>
    )
}