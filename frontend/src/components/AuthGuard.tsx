'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { token } = useAppSelector((state) => state.auth);
    const router = useRouter();

    useEffect(() => {
        if (!token) {
            router.replace('/login');
        }
    }, [token, router]);

    if (!token) return null;

    return <>{children}</>;
}
