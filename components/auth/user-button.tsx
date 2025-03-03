"use client"

import React from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"

import {User, LogOut, Settings, ReceiptText} from 'lucide-react';
import {useCurrentUser} from "@/hooks/use-current-user";
import {logout} from "@/actions/logout";


const UserButton = () => {
    const user = useCurrentUser();
    

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex w-fit outline-none">
                <Avatar className="size-9">
                    <AvatarImage src={user?.image || ""}/>
                    <AvatarFallback className="bg-white">
                        <User className="text-black"/>
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-2xs">
                <DropdownMenuLabel className="flex items-center gap-4">
                    <Avatar>
                        <AvatarImage src={user?.image || ""}/>
                        <AvatarFallback className="bg-white">
                            <User className="text-black"/>
                        </AvatarFallback>
                    </Avatar>
                    {user?.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator/>
                <DropdownMenuItem>
                    <Settings />
                    Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <ReceiptText />
                    Subscription
                </DropdownMenuItem>
                <DropdownMenuSeparator/>
                <DropdownMenuItem onClick={logout}>
                    <LogOut/>
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UserButton;