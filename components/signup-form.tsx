
"use client";

import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {useRouter} from 'next/navigation';
import {z, ZodError} from 'zod';
import {authClient} from "@/lib/auth-client";
import {Loader2} from "lucide-react";
import styles from '../app/styles/signin&up.module.scss';
import {FcGoogle} from "react-icons/fc";
import {FaGithub} from "react-icons/fa6";

function SocialButton({provider, children, ...props}: {
    provider: 'Google' | 'GitHub'
} & React.ComponentProps<typeof Button>) {
    const handleClick = async () => {
        const {data, error} = await authClient.signIn.social({provider: provider.toLowerCase()});
        console.log(`${provider} sign-up clicked`);
        if (error) {
            console.error(`${provider} sign-up initiation failed:`, error);
        }
    };
    return <Button variant="outline" type="button" onClick={handleClick} {...props}>{children}</Button>;
}

export function SignUpForm() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [nickName, setNickName] = useState("");
    const [progress, setProgress] = useState(0);

    const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
    const [apiError, setApiError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setApiError(null);
        setSuccessMessage(null);

        setIsLoading(true);

        try {
            const {data, error} = await authClient.signUp.email({
                email: email, // user email address
                password: password, // user password -> min 8 characters by default
                name: username, // user display name
                callbackURL: "/dashboard" // A URL to redirect to after the user verifies their email (optional)
            }, {
                onRequest: (ctx) => {
                    setIsLoading(true);
                },
                onSuccess: (ctx) => {
                    router.push(ctx.data.callbackURL || "/dashboard");
                },
                onError: (ctx) => {
                    alert(ctx.error.message);
                },
            })
        } catch (err) {
            console.error('Registration process error:', err);
            setApiError("An error occurred during registration. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className={styles.formContainer}>
            <form onSubmit={handleSubmit}>
                <div className={styles.fieldsGrid}>
                    {/*<div className={styles.avatarGroup}>*/}
                    {/*    <Label htmlFor="avatar">Avatar (optional, max 2MB)</Label>*/}
                    {/*    <div className={styles.avatarFlexContainer}>*/}
                    {/*        {avatarPreview ? (*/}
                    {/*            <img src={avatarPreview} alt="Avatar Preview" className={styles.avatarPreview}/>*/}
                    {/*        ) : (*/}
                    {/*            <div className={styles.avatarPlaceholder}>*/}
                    {/*                Preview*/}
                    {/*            </div>*/}
                    {/*        )}*/}
                    {/*        <Input*/}
                    {/*            id="avatar"*/}
                    {/*            type="file"*/}
                    {/*            accept="image/png, image/jpeg, image/gif, image/webp"*/}
                    {/*            onChange={handleAvatarChange}*/}
                    {/*            disabled={isLoading}*/}
                    {/*            className={styles.fileInput}*/}
                    {/*            ref={fileInputRef}*/}
                    {/*        />*/}
                    {/*    </div>*/}
                    {/*    {errors.avatar && <p className={styles.fieldError}>{errors.avatar.join(', ')}</p>}*/}
                    {/*</div>*/}

                    <div className={styles.inputGroup}>
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" type="text" value={username}
                               onChange={(e) => setUsername(e.target.value)} disabled={isLoading} required/>
                        {errors.username && <p className={styles.fieldError}>{errors.username.join(', ')}</p>}
                    </div>

                    <div className={styles.inputGroup}>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={email}
                               onChange={(e) => setEmail(e.target.value)} disabled={isLoading} required/>
                        {errors.email && <p className={styles.fieldError}>{errors.email.join(', ')}</p>}
                    </div>
                    <div className={styles.inputGroup}>
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" value={password}
                               onChange={(e) => setPassword(e.target.value)}
                               disabled={isLoading} required/>
                        {errors.password && <p className={styles.fieldError}>{errors.password.join(', ')}</p>}
                    </div>
                    <div className={styles.inputGroup}>
                        <Label htmlFor="confirmPassword">Confirm password</Label>
                        <Input id="confirmPassword" type="password" value={confirmPassword}
                               onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading} required/>
                        {errors.confirmPassword &&
                            <p className={styles.fieldError}>{errors.confirmPassword.join(', ')}</p>}
                    </div>


                    {apiError && <p className={`${styles.apiStatusMessage} ${styles.error}`}>{apiError}</p>}
                    {successMessage &&
                        <p className={`${styles.apiStatusMessage} ${styles.success}`}>{successMessage}</p>}

                    <Button type="submit" className={styles.submitButton} disabled={isLoading}>
                        {isLoading && <Loader2 className={styles.spinner}/>}
                        {isLoading ? "Creating Account..." : "Create an account"}
                    </Button>
                </div>
            </form>

            <div className={styles.separator}>
                <div className={styles.line}/>
                <div className={styles.textWrapper}>
                    <span className={styles.text}>Or sign up with</span>
                </div>
            </div>

            <div className={styles.socialButtonsGrid}>
                <SocialButton provider="Google" disabled={isLoading}>
                    <FcGoogle />Google
                </SocialButton>
                <SocialButton provider="GitHub" disabled={isLoading}>
                    <FaGithub />GitHub
                </SocialButton>
            </div>
        </div>
    );
}