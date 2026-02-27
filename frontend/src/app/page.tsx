'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

export default function Home() {
    const { token } = useAppSelector((state) => state.auth);
    const router = useRouter();

    useEffect(() => {
        router.replace(token ? '/dashboard' : '/login');
    }, [token, router]);

    return null;
}
