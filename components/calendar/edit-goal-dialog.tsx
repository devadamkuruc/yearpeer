// components/EditGoalDialog.tsx

'use client'

import { Goal } from "@/app/generated/prisma"
import { updateGoal, deleteGoal } from "@/lib/actions/goals"
import GoalDialog from "@/components/calendar/goal-dialog";

interface EditGoalDialogProps {
    goal: Goal | null
    isOpen: boolean
    onClose: () => void
}

export default function EditGoalDialog({ goal, isOpen, onClose }: EditGoalDialogProps) {
    const handleSubmit = async (formData: FormData) => {
        if (!goal) return { success: false, error: 'No goal selected' }

        // Add the goal ID to the form data
        const updatedFormData = new FormData()
        updatedFormData.append('id', goal.id.toString())

        // Copy all form fields
        for (const [key, value] of formData.entries()) {
            updatedFormData.append(key, value)
        }

        return await updateGoal(updatedFormData)
    }

    const handleDelete = async () => {
        if (!goal) return { success: false, error: 'No goal selected' }
        return await deleteGoal(goal.id)
    }

    // Don't render if no goal is selected
    if (!goal) return null

    return (
        <GoalDialog
            isOpen={isOpen}
            onClose={onClose}
            mode="edit"
            goal={goal}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
        />
    )
}