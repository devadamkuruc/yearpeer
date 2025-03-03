import React, {useState, useEffect} from 'react';
import {format} from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {DateRange} from "@/types";
import {GoalWithTasks} from "@/data/goals";
import ColorPicker from "@/components/calendar/color-picker";
import ImpactSelector from "@/components/calendar/impact-selector";
import useGoalStore from '@/store/goal-store';
import {GOAL_COLORS} from '@/constants';

interface GoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialDateRange?: DateRange;
    editingGoal?: GoalWithTasks;
}

const GoalModal: React.FC<GoalModalProps> = ({
                                                 isOpen,
                                                 onClose,
                                                 initialDateRange,
                                                 editingGoal
                                             }) => {
    const {createGoal, updateGoal, deleteGoal, hasOverlap, modal} = useGoalStore();
    const error = modal.error;

    // Form state
    const [formState, setFormState] = useState({
        title: '',
        description: '',
        dateRange: {start: null, end: null} as DateRange,
        color: GOAL_COLORS[0],
        impact: 3
    });

    // UI state
    const [isLoading, setIsLoading] = useState(false);

    const resetForm = () => {
        setFormState({
            title: '',
            description: '',
            dateRange: {start: null, end: null},
            color: GOAL_COLORS[0],
            impact: 3
        });
    };

    useEffect(() => {
        if (!isOpen) return;

        if (editingGoal) {
            setFormState({
                title: editingGoal.title,
                description: editingGoal.description || '',
                dateRange: {
                    start: editingGoal.startDate,
                    end: editingGoal.endDate
                },
                color: editingGoal.color,
                impact: editingGoal.impact
            });
        } else {
            resetForm();

            if (initialDateRange?.start && initialDateRange?.end) {
                setFormState(prev => ({
                    ...prev,
                    dateRange: initialDateRange
                }));
            }
        }
    }, [isOpen, editingGoal, initialDateRange]);

    const validateDateRange = (range: DateRange) => {
        if (!range.start || !range.end) return true;

        if (range.end < range.start) {
            return false;
        } else if (hasOverlap(range.start, range.end, editingGoal?.id)) {
            return false;
        }
        return true;
    };

    const handleDateChange = (type: 'start' | 'end', value: string) => {
        const newDate = new Date(value);
        const updatedRange = {
            ...formState.dateRange,
            [type]: newDate
        };

        setFormState(prev => ({
            ...prev,
            dateRange: updatedRange
        }));
    };

    const handleSave = async () => {
        const {title, dateRange, color, impact, description} = formState;

        if (!dateRange.start || !dateRange.end || !title) return;

        if (dateRange.end < dateRange.start) {
            return; // Don't save if end date is before start date
        }

        setIsLoading(true);

        const goalData = {
            title,
            description,
            startDate: dateRange.start,
            endDate: dateRange.end,
            color,
            impact,
        };

        try {
            if (editingGoal) {
                await updateGoal(editingGoal.id, goalData);
            } else {
                await createGoal(goalData);
            }
            onClose();
        } catch (err) {
            console.error("Failed to save goal:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!editingGoal) return;

        setIsLoading(true);
        try {
            await deleteGoal(editingGoal.id);
            onClose();
        } catch (err) {
            console.error("Failed to delete goal:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl sm:max-w-2xl max-h-[35rem] overflow-auto">
                <DialogHeader>
                    <DialogTitle>
                        {editingGoal ? 'Edit Goal' : 'Create New Goal'}
                    </DialogTitle>
                    {error && (
                        <DialogDescription className="text-red-500">
                            {error}
                        </DialogDescription>
                    )}
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Goal Title */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="title" className="text-right">
                            Goal Title
                        </Label>
                        <Input
                            id="title"
                            placeholder="Enter goal title..."
                            value={formState.title}
                            onChange={(e) => setFormState(prev => ({
                                ...prev,
                                title: e.target.value
                            }))}
                            className="col-span-3"
                        />
                    </div>

                    {/* Goal Description */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="description" className="text-right">
                            Goal Description
                        </Label>
                        <Textarea
                            id="description"
                            placeholder="Enter goal description..."
                            value={formState.description}
                            onChange={(e) => setFormState(prev => ({
                                ...prev,
                                description: e.target.value
                            }))}
                            className="col-span-3 min-h-[4rem] max-h-[10rem]"
                        />
                    </div>

                    <div className="flex flex-col">
                        <div className="col-span-3 grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="start-date">Start Date</Label>
                                <Input
                                    id="start-date"
                                    type="date"
                                    value={formState.dateRange.start
                                        ? format(formState.dateRange.start, 'yyyy-MM-dd')
                                        : ''}
                                    onChange={(e) => handleDateChange('start', e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="end-date">End Date</Label>
                                <Input
                                    id="end-date"
                                    type="date"
                                    value={formState.dateRange.end
                                        ? format(formState.dateRange.end, 'yyyy-MM-dd')
                                        : ''}
                                    onChange={(e) => handleDateChange('end', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label className="text-right">Color</Label>
                                <ColorPicker
                                    color={formState.color}
                                    setColor={(color) => setFormState(prev => ({
                                        ...prev,
                                        color
                                    }))}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Impact</Label>
                                <ImpactSelector
                                    impact={formState.impact}
                                    setImpact={(impact) => setFormState(prev => ({
                                        ...prev,
                                        impact
                                    }))}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    {editingGoal && (
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isLoading}
                            className="mr-auto"
                        >
                            Delete
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={
                            isLoading ||
                            !formState.title ||
                            !formState.dateRange.start ||
                            !formState.dateRange.end ||
                            !validateDateRange(formState.dateRange)
                        }
                    >
                        {isLoading ? (
                            <>
                                {editingGoal ? 'Saving...' : 'Creating...'}
                            </>
                        ) : (
                            editingGoal ? 'Save Changes' : 'Create Goal'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default GoalModal;