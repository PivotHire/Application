
"use client";

import Link from 'next/link';
import React from 'react';
import styles from '../app/styles/footer.module.scss';
import {Github, Linkedin, Twitter} from "lucide-react";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.content}>

                <p className={styles.copyrightText}>
                    &copy; {currentYear} PivotHire. All rights reserved.
                </p>

                <nav className={styles.footerNav}>
                    <Link href="/privacy-policy" className={styles.navLink}>
                        Privacy Policy
                    </Link>
                </nav>

                <div className={styles.socialIcons}>
                    <a href="https://github.com/pivothire" target="_blank" rel="noopener noreferrer" aria-label="PivotHire on GitHub" className={styles.socialLink}>
                        <Github className={styles.icon} />
                    </a>
                    <a href="https://x.com/PivotHireAI" target="_blank" rel="noopener noreferrer" aria-label="PivotHire on X" className={styles.socialLink}>
                        <Twitter className={styles.icon} />
                    </a>
                    <a href="https://www.linkedin.com/company/pivothire" target="_blank" rel="noopener noreferrer" aria-label="PivotHire on LinkedIn" className={styles.socialLink}>
                        <Linkedin className={styles.icon} />
                    </a>
                </div>

            </div>
        </footer>
    );
}