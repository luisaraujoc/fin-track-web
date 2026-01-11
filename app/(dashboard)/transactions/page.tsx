'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Search,
    Filter,
    Plus,
    ArrowLeft,
    ArrowRight,
    ShoppingBag,
    Coffee,
    Home,
    Car,
    MoreHorizontal,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { NewTransactionModal } from '@/components/transactions/NewTransactionModal';
import api from '@/lib/api';

// --- Tipagem baseada no retorno da API ---
type Transaction = {
    id: string;
    description: string;
    amount: number | string; // Aceita string caso o backend envie decimal como string
    date: string;
    type: 'INCOME' | 'EXPENSE';
    // O backend retorna o objeto da relação
    category?: { id: string; name: string; icon?: string };
    paymentMethod?: { id: string; name: string };
};

export default function TransactionsPage() {
    // Inicializa sempre como array vazio
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [currentDate, setCurrentDate] = useState(new Date());
    const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);

    // Busca Transações
    const fetchTransactions = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const response = await api.get('/transactions');
            const data = response.data;

            // --- CORREÇÃO DE SEGURANÇA ---
            if (Array.isArray(data)) {
                setTransactions(data);
            } else if (data && Array.isArray(data.data)) {
                // Suporte caso o backend passe a retornar paginação { data: [], meta: ... }
                setTransactions(data.data);
            } else {
                console.warn('API retornou formato inesperado em /transactions:', data);
                setTransactions([]); // Fallback para array vazio
            }

        } catch (err) {
            console.error(err);
            setError('Erro ao carregar transações.');
            setTransactions([]); // Garante array vazio no erro
        } finally {
            setLoading(false);
        }
    }, []);

    // Carrega ao iniciar
    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    // --- CORREÇÃO NO REDUCE ---
    // Garante que 'list' seja um array antes de rodar o reduce
    const list = Array.isArray(transactions) ? transactions : [];

    const groupedTransactions = list.reduce((groups, transaction) => {
        // Garante que a data seja válida
        const dateObj = new Date(transaction.date);
        if (isNaN(dateObj.getTime())) return groups; // Pula se data for inválida

        const date = dateObj.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(transaction);
        return groups;
    }, {} as Record<string, Transaction[]>);

    // Helper de Ícone
    const getCategoryIcon = (categoryName?: string) => {
        const name = categoryName?.toLowerCase() || '';
        if (name.includes('food') || name.includes('alimentação') || name.includes('mercado')) return <ShoppingBag className="w-5 h-5" />;
        if (name.includes('transp') || name.includes('uber') || name.includes('combustível')) return <Car className="w-5 h-5" />;
        if (name.includes('lazer') || name.includes('restaurante')) return <Coffee className="w-5 h-5" />;
        if (name.includes('salário') || name.includes('renda') || name.includes('casa')) return <Home className="w-5 h-5" />;
        return <MoreHorizontal className="w-5 h-5" />;
    };

    const handleMonthChange = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        if (direction === 'prev') newDate.setMonth(newDate.getMonth() - 1);
        else newDate.setMonth(newDate.getMonth() + 1);
        setCurrentDate(newDate);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* 1. Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Transações</h1>
                    <p className="text-sm text-gray-500">Gerencie suas entradas e saídas.</p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    {/* Seletor de Mês */}
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl px-2 shadow-sm">
                        <button
                            onClick={() => handleMonthChange('prev')}
                            className="p-2 hover:bg-gray-50 rounded-lg text-gray-500"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-medium w-36 text-center text-gray-700 capitalize">
              {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </span>
                        <button
                            onClick={() => handleMonthChange('next')}
                            className="p-2 hover:bg-gray-50 rounded-lg text-gray-500"
                        >
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        onClick={() => setIsNewTransactionOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 sm:px-4 sm:py-2.5 rounded-xl flex items-center justify-center transition-colors shadow-sm active:scale-95"
                    >
                        <Plus className="w-5 h-5 sm:mr-2" />
                        <span className="hidden sm:inline font-medium">Nova</span>
                    </button>
                </div>
            </div>

            {/* 2. Filtros */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar transação..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all sm:text-sm"
                    />
                </div>
                <button className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                </button>
            </div>

            {/* 3. Lista */}
            <div className="bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 overflow-hidden min-h-[300px]">

                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-2 text-emerald-600" />
                        <p className="text-sm">Carregando transações...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="flex items-center justify-center py-12 text-red-500 bg-red-50 m-4 rounded-xl">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        <span>{error}</span>
                    </div>
                )}

                {!loading && !error && list.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                        <div className="bg-gray-50 p-4 rounded-full mb-4">
                            <ShoppingBag className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Nenhuma transação encontrada</h3>
                        <p className="mt-1 text-gray-500 text-sm max-w-xs mx-auto">
                            Suas compras e receitas aparecerão aqui. Tente adicionar uma nova transação.
                        </p>
                    </div>
                )}

                {!loading && !error && Object.entries(groupedTransactions).map(([date, items], index) => (
                    <div key={date}>
                        <div className={`px-6 py-3 bg-gray-50/50 border-y border-gray-100 flex justify-between items-center ${index === 0 ? 'border-t-0' : ''}`}>
                            <span className="text-sm font-semibold text-gray-600 capitalize">{date}</span>
                            <span className="text-xs text-gray-400 font-medium">
                {items.length} item(s)
              </span>
                        </div>

                        <div className="divide-y divide-gray-50">
                            {items.map((t) => (
                                <div
                                    key={t.id}
                                    className="group flex items-center p-4 sm:px-6 hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    <div className={`
                    h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center mr-4 shrink-0 transition-colors
                    ${t.type === 'INCOME'
                                        ? 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200'
                                        : 'bg-red-50 text-red-600 group-hover:bg-red-100'
                                    }
                  `}>
                                        {getCategoryIcon(t.category?.name)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="text-sm font-semibold text-gray-900 truncate pr-4">
                                                {t.description}
                                            </h3>
                                            <span className={`text-sm font-bold whitespace-nowrap ${
                                                t.type === 'INCOME' ? 'text-emerald-600' : 'text-gray-900'
                                            }`}>
                        {t.type === 'EXPENSE' ? '- ' : '+ '}
                                                R$ {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                                        </div>

                                        <div className="flex justify-between items-center text-xs text-gray-500">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                {t.category && (
                                                    <span className="bg-gray-100 px-2 py-0.5 rounded-md font-medium text-gray-600 truncate">
                            {t.category.name}
                          </span>
                                                )}
                                                {t.paymentMethod && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="truncate">{t.paymentMethod.name}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            <NewTransactionModal
                isOpen={isNewTransactionOpen}
                onClose={() => setIsNewTransactionOpen(false)}
                onSuccess={() => {
                    fetchTransactions();
                }}
            />

        </div>
    );
}