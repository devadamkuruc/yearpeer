"use client";

import React from 'react';
import { GoalWithTasks } from "@/data/goals";
import {CirclePlus} from "lucide-react";

interface GoalsProps {
    onCreateNewGoal: () => void;
    onEditGoal: (goal: GoalWithTasks) => void;
    goals: GoalWithTasks[];
    currentYear: number;
}

const Goals: React.FC<GoalsProps> = ({ onCreateNewGoal, onEditGoal, goals, currentYear }) => {
    const yearGoals = goals.filter(goal => {
        const goalYear = goal.startDate.getFullYear();
        return goalYear === currentYear || goal.endDate.getFullYear() === currentYear;
    });

    const sortedGoals = yearGoals.sort((a, b) =>
        a.startDate.getTime() - b.startDate.getTime()
    );

    const renderImpactDots = (impact: number) => {
        return (
            <div className="flex gap-0.5 items-center ml-2">
                {[1, 2, 3, 4, 5].map((dot) => (
                    <div
                        key={dot}
                        className={`w-1 h-1 rounded-full ${
                            dot <= impact ? 'bg-white' : 'bg-white/30'
                        }`}
                    />
                ))}
            </div>
        );
    };

    return (
        <>
            <div className="flex flex-col mt-7">
                <div className="text-white text-2xl font-extrabold mb-5">
                    Goals for {currentYear}
                </div>

                <div className="flex flex-col gap-y-1">
                    {sortedGoals.map((goal) => (
                        <div
                            key={goal.id}
                            className="flex items-center text-white cursor-pointer hover:bg-white/10 rounded-lg py-1 px-2 transition-colors"
                            onClick={() => onEditGoal(goal)}
                        >
                            <div className="flex items-center flex-1 min-w-0">
                                <div
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: goal.color }}
                                />
                                <span className="ml-2 text-sm truncate">{goal.title}</span>
                            </div>
                            {renderImpactDots(goal.impact)}
                        </div>
                    ))}

                    <button
                        onClick={onCreateNewGoal}
                        className="flex items-center gap-2 text-white text-sm self-start mt-2 cursor-pointer hover:opacity-80"
                    >
                        <CirclePlus size={14} className="fill-white/60" color="black" />
                        <span className="opacity-60">Add a new goal</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Goals;