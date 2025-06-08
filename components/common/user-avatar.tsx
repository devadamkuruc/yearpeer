'use client'

import {SignedIn, UserButton} from "@clerk/nextjs";
import {Button} from "@/components/ui/button";

export default function UserAvatar() {

    return (
        <div className="flex flex-row items-center gap-3.5">
            <SignedIn>
                <UserButton appearance={{
                    elements: {
                        avatarBox: "h-10! w-10!"
                    }
                }}/>
            </SignedIn>
            <Button className="h-8 bg-white/10! items-center text-xs! shadow-none">Upgrade</Button>
        </div>
    )
}