// app/(public)/privacy-policy/page.tsx
import type { Metadata } from 'next';
import styles from '../../styles/legalPage.module.scss'; // 我们将为此创建一个新的样式文件

export const metadata: Metadata = {
    title: 'Privacy Policy',
};

export default function PrivacyPolicyPage() {
    return (
        <div className={styles.legalContainer}>
            <article className={styles.legalContent}>
                <h1>Privacy Policy for PivotHire AI</h1>
                <p><strong>Last Updated:</strong> [Date]</p>

                <p>Welcome to PivotHire AI. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.</p>

                <h2>1. Information We Collect</h2>
                <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
                <ul>
                    <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and demographic information, that you voluntarily give to us when you register with the Site.</li>
                    <li><strong>Usage Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, browser type, operating system, access times, and the pages you have viewed directly before and after accessing the Site.</li>
                </ul>

                <h2>2. Use of Your Information</h2>
                <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
                <ul>
                    <li>Create and manage your account.</li>
                    <li>Match your project with qualified talent.</li>
                    <li>Email you regarding your account or order.</li>
                </ul>

                <h2>3. Disclosure of Your Information</h2>
                <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows: [Details on sharing...]</p>

                {/* 在此处继续添加您的完整隐私政策内容 */}

                <h2>Contact Us</h2>
                <p>If you have questions or comments about this Privacy Policy, please contact us at: [Your Contact Email]</p>
            </article>
        </div>
    );
}