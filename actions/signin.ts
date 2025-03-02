"use server";

import {DEFAULT_LOGIN_REDIRECT} from "@/routes";
import {signIn} from "@/auth";

export async function signInWithGoogle() {
    await signIn("google", {
        redirectTo: DEFAULT_LOGIN_REDIRECT
    });
}