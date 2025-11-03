import {Footer} from "@/components/footer";
import styles from "../styles/mainLayout.module.scss";
import Image from "next/image";
import Link from "next/link";

export default function PublicLayout({
                                         children,
                                     }: {
    children: React.ReactNode;
}) {
    return (
        <div className={styles.pageWrapper}>
            <header className={styles.header}>
                <div className={styles.headerLogoGroup}>
                    <Link href="/">
                        <Image
                            src={'/logo-light-transparent.svg'}
                            alt="PivotHire AI Logo"
                            width={200}
                            height={100}
                        />
                    </Link>
                </div>
            </header>
            <main className={styles.mainContent}>
                {children}
            </main>
            <Footer/>
        </div>
    );
}