"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from "next/link";
import {Button} from "@/components/ui/button";

interface YearPickerProps {
    year: number;
    onYearChange: (year: number) => void;
}

const YearPicker: React.FC<YearPickerProps> = ({ year, onYearChange }) => {

    const handlePreviousYear = () => {
        onYearChange(year - 1);
    };

    const handleNextYear = () => {
        onYearChange(year + 1);
    };


    return (
        <div className="flex items-center justify-center bg-white rounded-lg border border-black/20">
            <Button
                onClick={handlePreviousYear}
                className="bg-transparent border-none flex items-center hover:bg-transparent text-xs"
                aria-label="Previous year"
            >
                <ChevronLeft className="text-black" />
            </Button>
            <span className="py-1">{year}</span>
            <Button
                onClick={handleNextYear}
                className="bg-transparent border-none flex items-center hover:bg-transparent text-xs"
                aria-label="Next year"
            >
                <ChevronRight className="text-black" />
            </Button>
        </div>
    );
};

export default YearPicker;