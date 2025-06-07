"use client";

import {ChangeEvent, useRef, useState} from "react";
import {Button} from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {useRouter} from 'next/navigation';
import {z, ZodError} from 'zod';
import {
    ImageKitAbortError,
    ImageKitInvalidRequestError,
    ImageKitServerError,
    ImageKitUploadNetworkError,
    upload,
} from "@imagekit/next";
import {authClient} from "@/lib/auth-client";

export function SignUpForm() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [nickName, setNickName] = useState("");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [progress, setProgress] = useState(0);
    const abortController = new AbortController();

    const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
    const [apiError, setApiError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) {
                setErrors(prev => ({...prev, avatar: ["File size cannot exceed 2MB."]}));
                setAvatarFile(null);
                setAvatarPreview(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
            setErrors(prev => ({...prev, avatar: undefined}));
        }
    };

    const authenticator = async () => {
        try {
            const response = await fetch("/api/imagekit-auth");
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Request failed with status ${response.status}: ${errorText}`);
            }
            const data = await response.json();
            const {signature, expire, token, publicKey} = data;
            return {signature, expire, token, publicKey};
        } catch (error) {
            console.error("ImageKit Authentication error:", error);
            throw new Error("ImageKit Authentication request failed");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setApiError(null);
        setSuccessMessage(null);

        setIsLoading(true);
        let uploadedAvatarUrl: string | undefined = undefined;

        let authParams;
        try {
            authParams = await authenticator();
        } catch (authError) {
            console.error("Failed to authenticate for upload:", authError);
            return;
        }
        const {signature, expire, token, publicKey} = authParams;

        try {
            if (avatarFile) {
                try {
                    const file = avatarFile;
                    const uploadResponse = await upload({
                        expire,
                        token,
                        signature,
                        publicKey,
                        file,
                        fileName: file.name,
                        onProgress: (event) => {
                            setProgress((event.loaded / event.total) * 100);
                        },
                        abortSignal: abortController.signal,
                    });
                    uploadedAvatarUrl = uploadResponse.url;
                    console.log("Upload response:", uploadResponse);
                } catch (error) {
                    if (error instanceof ImageKitAbortError) {
                        console.error("Upload aborted:", error.reason);
                    } else if (error instanceof ImageKitInvalidRequestError) {
                        console.error("Invalid request:", error.message);
                    } else if (error instanceof ImageKitUploadNetworkError) {
                        console.error("Network error:", error.message);
                    } else if (error instanceof ImageKitServerError) {
                        console.error("Server error:", error.message);
                    } else {
                        console.error("Upload error:", error);
                    }
                }
            }

            const {data, error} = await authClient.signUp.email({
                email: email, // user email address
                password: password, // user password -> min 8 characters by default
                name: username, // user display name
                image: uploadedAvatarUrl, // User image URL (optional)
                callbackURL: "/dashboard" // A URL to redirect to after the user verifies their email (optional)
            }, {
                onRequest: (ctx) => {
                    setIsLoading(true);
                },
                onSuccess: (ctx) => {
                    router.push(ctx.data.callbackURL || "/dashboard");
                },
                onError: (ctx) => {
                    // display the error message
                    alert(ctx.error.message);
                },
            })
        } catch (err) {
            console.error('Registration process error:', err);
            setApiError("An error occurred during registration. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="text-2xl">Register</CardTitle>
                <CardDescription>
                    Register a new account to start using PivotHire AI.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2 items-center">
                        <Label htmlFor="avatar">Avatar (optional, max 2MB)</Label>
                        <div className="flex items-center gap-4">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar Preview"
                                     className="h-20 w-20 rounded-full object-cover"/>
                            ) : (
                                <div
                                    className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs">
                                    Preview
                                </div>
                            )}
                            <Input
                                id="avatar"
                                type="file"
                                accept="image/png, image/jpeg, image/gif, image/webp"
                                onChange={handleAvatarChange}
                                disabled={isLoading}
                                className="flex-1"
                                ref={fileInputRef}
                            />
                        </div>
                        {errors.avatar && <p className="text-xs text-red-600">{errors.avatar.join(', ')}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="username">Username <span className="text-red-500">*</span></Label>
                        <Input
                            id="username"
                            type="text"
                            placeholder="e.g. johndoe"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                        {errors.username && <p className="text-xs text-red-600">{errors.username.join(', ')}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email<span className="text-red-500">*</span></Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                        {errors.email && <p className="text-xs text-red-600">{errors.email.join(', ')}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password<span className="text-red-500">*</span></Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                        {errors.password && <p className="text-xs text-red-600">{errors.password.join(', ')}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="confirmPassword">Confirm password<span className="text-red-500">*</span></Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                        {errors.confirmPassword &&
                            <p className="text-xs text-red-600">{errors.confirmPassword.join(', ')}</p>}
                    </div>

                    {apiError && <p className="text-sm text-red-600 text-center py-2">{apiError}</p>}
                    {successMessage && <p className="text-sm text-green-600 text-center py-2">{successMessage}</p>}
                </CardContent>
                <CardFooter className="flex flex-col mt-5">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Registering..." : "Register"}
                    </Button>
                    <Button variant="link" type="button" onClick={() => router.push('/signin')} disabled={isLoading}
                            className="text-sm">
                        Already have an account? Click here to sign in.
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}