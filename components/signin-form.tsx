
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from 'next/navigation';
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import styles from "../app/styles/signin&up.module.scss";
import {FcGoogle} from "react-icons/fc";
import {FaGithub} from "react-icons/fa6";

function SocialButton({ provider, children, ...props }: { provider: 'Google' | 'GitHub' } & React.ComponentProps<typeof Button>) {
    const handleClick = async () => {
        const {data, error} = await authClient.signIn.social({provider: provider.toLowerCase()});
        console.log(`${provider} sign-in clicked`);
        if (error) {
            console.error(`${provider} sign-in initiation failed:`, error);
        }
    };
    return <Button variant="outline" type="button" onClick={handleClick} {...props}>{children}</Button>;
}

export function SignInForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            const { data, error } = await authClient.signIn.email({ email, password });
            if (error) throw error;
            if (data?.user) window.location.href = "/dashboard";
            else throw new Error("Login failed. Please check your credentials.");
        } catch (err: any) {
            setError(err.message || "An error occurred during login.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.formContainer}>
            <form onSubmit={handleSubmit}>
                <div className={styles.fieldsGrid}>
                    <div className={styles.inputGroup}>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <div className={styles.labelRow}>
                            <Label htmlFor="password">Password</Label>
                            <Link href="/forgot-password" className={styles.forgotPasswordLink}>
                                Forgot your password?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                    {error && <p className={styles.errorMessage}>{error}</p>}
                    <Button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className={styles.spinner}/>}
                        {isSubmitting ? "Signing in..." : "Login"}
                    </Button>
                </div>
            </form>
            <div className={styles.separator}>
                <div className={styles.line} />
                <div className={styles.textWrapper}>
                    <span className={styles.text}>Or continue with</span>
                </div>
            </div>
            <div className={styles.socialButtonsGrid}>
                <SocialButton provider="Google" disabled={isSubmitting}>
                    <FcGoogle />Google
                </SocialButton>
                <SocialButton provider="GitHub" disabled={isSubmitting}>
                    <FaGithub />GitHub
                </SocialButton>
            </div>
        </div>
    );
}