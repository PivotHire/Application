
"use client";

import { SignUpForm } from "@/components/signup-form";
import Image from "next/image";
import Link from "next/link";
import styles from "../../styles/signin&up.module.scss";

export default function SignUpPage() {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.brandingPanel}>
                <div className={styles.logoContainer}>
                    <Image
                        src="/logo-dark-transparent.png"
                        alt="PivotHire AI Logo"
                        width={1280}
                        height={320}
                    />
                </div>
                <div className={styles.quoteContainer}>
                    <blockquote>
                        <p>
                            "We are building <strong>a high-trust network</strong><br/> where quality-driven companies <br/>and skilled freelance professionals <br/><strong>collaborate with confidence</strong>."
                        </p>
                        <footer>The PivotHire Team</footer>
                    </blockquote>
                </div>
            </div>

            <div className={styles.formPanel}>
                <div className={styles.formWrapper}>
                    <Image
                        src="/logo-light-transparent.png"
                        alt="PivotHire AI Logo"
                        width={256}
                        height={50}
                        className={styles.mobileLogo}
                    />
                    <div className={styles.header}>
                        <h1>Create an account</h1>
                        <p>
                            Start your journey with PivotHire AI
                        </p>
                    </div>

                    <SignUpForm />

                    <p className={styles.footerLink}>
                        Already have an account?{" "}
                        <Link href="/signin" className="underline">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

