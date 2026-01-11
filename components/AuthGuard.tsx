'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        // Verifica se estamos no browser
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');

            if (!token) {
                // Se não tem token, manda pro login imediatamente
                router.replace('/login');
            } else {
                // Se tem token, permite renderizar (a validade real será testada pelas chamadas de API)
                setIsAuthorized(true);
            }
        }
    }, [router]);

    // Enquanto verifica, não mostra nada ou mostra um loading
    if (!isAuthorized) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return <>{children}</>;
}