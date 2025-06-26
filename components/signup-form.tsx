
"use client";

import {ChangeEvent, useRef, useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {useRouter} from 'next/navigation';
import {z, ZodError} from 'zod';
import {authClient} from "@/lib/auth-client";
import {Loader2} from "lucide-react";
import styles from '../app/styles/signin&up.module.scss';

const GoogleIcon = () => (
    <svg role="img" viewBox="0 0 24 24" className={styles.socialButtonIcon}>
        <path fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              transform="translate(-1.56 -1.22) scale(0.9)"></path>
        <path fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              transform="translate(-1.56 -1.22) scale(0.9)"></path>
        <path fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              transform="translate(-1.56 -1.22) scale(0.9)"></path>
        <path fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              transform="translate(-1.56 -1.22) scale(0.9)"></path>
        <path fill="none" d="M0 0h48v48H0z" transform="translate(-1.56 -1.22) scale(0.9)"></path>
    </svg>
);
const GitHubIcon = () => <svg role="img" viewBox="0 0 24 24" className={styles.socialButtonIcon}>
    <path fill="currentColor"
          d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.305 24 12c0-6.627-5.373-12-12-12"></path>
</svg>;


function SocialButton({provider, children, ...props}: {
    provider: 'Google' | 'GitHub'
} & React.ComponentProps<typeof Button>) {
    const handleClick = () => {
        // TODO: Implement social login logic based on provider
        console.log(`${provider} sign-in clicked`);
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
                    <GoogleIcon/>Google
                </SocialButton>
                <SocialButton provider="GitHub" disabled={isLoading}>
                    <GitHubIcon/>GitHub
                </SocialButton>
            </div>
        </div>
    );
}