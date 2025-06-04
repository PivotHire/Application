import {SignUpForm} from "@/components/signup-form";
import Image from "next/image";

export default function SignUpPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <div className="flex flex-col items-center space-y-1">
                <Image
                    src={'/logo-light-transparent.png'}
                    alt="PivotHire AI Logo"
                    width={200}
                    height={200}
                />
                <SignUpForm/>
            </div>
        </div>
    );
}