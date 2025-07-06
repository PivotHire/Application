import type {Metadata} from 'next';
import {TalentProfileForm} from "@/components/talent-profile-form";

export const metadata: Metadata = {
    title: 'Profile',
};

export default function ProfilePage() {
    return <TalentProfileForm />;
}