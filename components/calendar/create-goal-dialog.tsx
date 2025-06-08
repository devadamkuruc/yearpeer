'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircleIcon } from "@heroicons/react/16/solid"
import { createGoal } from "@/lib/actions/goals"
import GoalDialog from "@/components/calendar/goal-dialog";

interface CreateGoalDialogProps {
    isOpen?: boolean
    onClose?: () => void
    onSuccess?: () => void
    prefilledStartDate?: Date | null
    prefilledEndDate?: Date | null
}

export default function CreateGoalDialog({
                                             isOpen: externalIsOpen,
                                             onClose: externalOnClose,
                                             onSuccess,
                                             prefilledStartDate,
                                             prefilledEndDate
                                         }: CreateGoalDialogProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(false)

    // Use external state if provided, otherwise use internal state
    const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen
    const handleClose = externalOnClose || (() => setInternalIsOpen(false))

    const handleSubmit = async (formData: FormData) => {
        return await createGoal(formData)
    }

    const handleOpenInternal = () => {
        setInternalIsOpen(true)
    }

    return (
        <>
            {/* Only show the button if not controlled externally */}
            {externalIsOpen === undefined && (
                <Button
                    type="button"
                    onClick={handleOpenInternal}
                    className="self-start h-8 bg-white/10! items-center text-xs! shadow-none mt-4"
                >
                    <PlusCircleIcon className="size-3.5" />
                    Create a new goal
                </Button>
            )}

            <GoalDialog
                isOpen={isOpen}
                onClose={handleClose}
                mode="create"
                prefilledStartDate={prefilledStartDate}
                prefilledEndDate={prefilledEndDate}
                onSubmit={handleSubmit}
                onSuccess={onSuccess}
            />
        </>
    )
}