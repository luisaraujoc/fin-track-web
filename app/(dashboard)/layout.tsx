import { Sidebar } from '@/components/Sidebar';

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar (Desktop) */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="md:ml-64 min-h-screen transition-all duration-200">
                {/* Header Mobile (Opcional, visível só em telas pequenas) */}
                <div className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center px-4 sticky top-0 z-20">
                    <span className="font-bold text-emerald-600 text-lg">Fin-Track</span>
                    {/* Aqui entraria um botão de menu hamburguer */}
                </div>

                {/* Conteúdo da Página */}
                <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}