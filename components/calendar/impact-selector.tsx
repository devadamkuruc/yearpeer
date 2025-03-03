"use client";

import { useState } from 'react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface ImpactSelectorProps {
    impact: number;
    setImpact: (impact: number) => void;
    className?: string;
}

const ImpactSelector: React.FC<ImpactSelectorProps> = ({
                                                           impact,
                                                           setImpact,
                                                           className,
                                                       }) => {
    const [activeTab, setActiveTab] = useState('impact');
    const [hoverLevel, setHoverLevel] = useState<number>(0);

    const handleSetImpact = (level: number) => {
        setImpact(level);
    };

    const handleMouseEnter = (level: number) => {
        setHoverLevel(level);
    };

    const handleMouseLeave = () => {
        setHoverLevel(0);
    };

    const getImpactLabel = (level: number) => {
        const labels = [
            'Very Low Impact',
            'Low Impact',
            'Medium Impact',
            'High Impact',
            'Very High Impact'
        ];
        return labels[level - 1];
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        className
                    )}
                >
                    <div className="flex items-center w-full">
                        <div className="flex mr-2">
                            {[1, 2, 3, 4, 5].map((level) => (
                                <div
                                    key={level}
                                    className={`w-4 h-4 rounded-full mr-0.5 
                                        ${level <= impact
                                        ? 'bg-black'
                                        : 'bg-transparent border border-solid border-gray-300'
                                    }`}
                                />
                            ))}
                        </div>
                        <span className="truncate">
                            {getImpactLabel(impact)}
                        </span>
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4">
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                >
                    <TabsList className="w-full mb-4">
                        <TabsTrigger value="impact" className="flex-1">
                            Impact Levels
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="impact">
                        <div
                            className="flex w-full justify-between mb-4"
                            onMouseLeave={handleMouseLeave}
                        >
                            {[1, 2, 3, 4, 5].map((level) => (
                                <div
                                    key={level}
                                    onClick={() => handleSetImpact(level)}
                                    onMouseEnter={() => handleMouseEnter(level)}
                                    className={`w-10 h-10 rounded-md cursor-pointer flex items-center justify-center
                                        ${level <= impact
                                        ? 'bg-black text-white'
                                        : level <= hoverLevel
                                            ? 'bg-gray-200'
                                            : 'bg-transparent border border-solid border-gray-300'
                                    }`}
                                    aria-label={`Set impact to ${level}`}
                                >
                                    {level}
                                </div>
                            ))}
                        </div>
                        <div className="text-center text-sm text-gray-500">
                            {getImpactLabel(impact)}
                        </div>
                    </TabsContent>
                </Tabs>
            </PopoverContent>
        </Popover>
    );
};

export default ImpactSelector;