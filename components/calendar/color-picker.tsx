"use client";

import { useState } from 'react';
import { GOAL_COLORS } from '@/constants';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
    color: string;
    setColor: (color: string) => void;
    className?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
                                                     color,
                                                     setColor,
                                                     className,
                                                 }) => {
    const [activeTab, setActiveTab] = useState('solid');

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !color && "text-muted-foreground",
                        className
                    )}
                >
                    {color ? (
                        <div
                            className="h-4 w-4 rounded-full mr-2"
                            style={{ background: color }}
                        />
                    ) : (
                        <i className="icon icon-fill mr-2" />
                    )}
                    <span className="truncate">
                        {color ? color : 'Pick a color'}
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4">
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                >
                    <TabsList className="w-full mb-4">
                        <TabsTrigger value="solid" className="flex-1">
                            Solid
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="solid">
                        <div className="flex flex-wrap gap-1 mb-4">
                            {GOAL_COLORS.map((s) => (
                                <div
                                    key={s}
                                    style={{ background: s }}
                                    className="rounded-md h-6 w-6 cursor-pointer hover:scale-110 transition-transform"
                                    onClick={() => setColor(s)}
                                />
                            ))}
                        </div>

                        <Input
                            value={color}
                            placeholder="Enter color"
                            onChange={(e) => setColor(e.currentTarget.value)}
                        />
                    </TabsContent>
                </Tabs>
            </PopoverContent>
        </Popover>
    );
};

export default ColorPicker;