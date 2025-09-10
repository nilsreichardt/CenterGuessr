"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { Profile } from "@/lib/types/database";

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Get initial session
        const getInitialSession = async () => {
            console.log("Getting initial session");
            const { data: { session } } = await supabase.auth.getSession();

            console.log("Session", session);

            if (session?.user) {
                setUser(session.user);
                await ensureProfile(session.user);
            }

            setIsLoading(false);
        };

        getInitialSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === "SIGNED_IN" && session?.user) {
                    setUser(session.user);
                    await ensureProfile(session.user);
                    router.push("/game");
                } else if (event === "SIGNED_OUT") {
                    setUser(null);
                    setProfile(null);
                    router.push("/");
                }

                setIsLoading(false);
            },
        );

        return () => subscription.unsubscribe();
    }, [router]);

    const ensureProfile = async (user: User) => {
        try {
            // Check if profile exists
            const { data: existingProfile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            console.log("Existing profile", existingProfile);

            if (existingProfile) {
                setProfile(existingProfile);
                return;
            }

            console.log("Creating profile", user);
            // Create profile if it doesn't exist
            const { data: newProfile } = await supabase
                .from("profiles")
                .insert({
                    id: user.id,
                    email: user.email!,
                    display_name: user.user_metadata?.full_name ||
                        user.email?.split("@")[0],
                    avatar_url: user.user_metadata?.avatar_url,
                })
                .select()
                .single();

            if (newProfile) {
                setProfile(newProfile);
            }
        } catch (error) {
            console.error("Error ensuring profile:", error);
        }
    };

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                queryParams: {
                    hd: "cdtm.com",
                },
            },
        });

        if (error) {
            throw error;
        }
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            throw error;
        }
    };

    return {
        user,
        profile,
        isLoading,
        signInWithGoogle,
        signOut,
    };
}
