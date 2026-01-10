'use client';

import { useState } from 'react';
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
    MoreHorizontal
} from 'lucide-react';
import { NewTransactionModal} from "@/components/transactions/NewTransactionModal";

// --- Tipagem (Simulada) ---
type Transaction = {
    id: string;
    description: string;
    amount: number;
    date: string; // ISO String
    type: 'INCOME' | 'EXPENSE';
    category: string;
    paymentMethod: string;
};

// --- Dados Mockados (Para visualização) ---
const MOCK_TRANSACTIONS: Transaction[] = [
    {
        id: '1',
        description: 'Supermercado Mensal',
        amount: 850.50,
        date: '2025-10-12T14:30:00',
        type: 'EXPENSE',
        category: 'Alimentação',
        paymentMethod: 'Nubank Crédito',
    },
    {
        id: '2',
        description: 'Projeto Freelance',
        amount: 2500.00,
        date: '2025-10-12T10:00:00',
        type: 'INCOME',
        category: 'Salário',
        paymentMethod: 'Conta Inter',
    },
    {
        id: '3',
        description: 'Uber para o trabalho',
        amount: 24.90,
        date: '2025-10-11T18:45:00',
        type: 'EXPENSE',
        category: 'Transporte',
        paymentMethod: 'Nubank Débito',
    },
    {
        id: '4',
        description: 'Netflix',
        amount: 55.90,
        date: '2025-10-10T09:00:00',
        type: 'EXPENSE',
        category: 'Lazer',
        paymentMethod: 'Nubank Crédito',
    },
];

export default function TransactionsPage() {
    const [currentMonth, setCurrentMonth] = useState('Outubro 2025');
    const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false); // Estado do Modal

    // Função auxiliar para agrupar transações por dia
    const groupedTransactions = MOCK_TRANSACTIONS.reduce((groups, transaction) => {
        const date = new Date(transaction.date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
        });

        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(transaction);
        return groups;
    }, {} as Record<string, Transaction[]>);

    // Helper para escolher ícone
    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Alimentação': return <ShoppingBag className="w-5 h-5" />;
            case 'Transporte': return <Car className="w-5 h-5" />;
            case 'Lazer': return <Coffee className="w-5 h-5" />;
            case 'Salário': return <Home className="w-5 h-5" />;
            default: return <MoreHorizontal className="w-5 h-5" />;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* 1. Header & Controles */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Transações</h1>
                    <p className="text-sm text-gray-500">Gerencie suas entradas e saídas.</p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    {/* Seletor de Mês (Visual) */}
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl px-2 shadow-sm">
                        <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-500">
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-medium w-32 text-center text-gray-700">{currentMonth}</span>
                        <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-500">
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Botão Nova Transação (Abre o Modal) */}
                    <button
                        onClick={() => setIsNewTransactionOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 sm:px-4 sm:py-2.5 rounded-xl flex items-center justify-center transition-colors shadow-sm active:scale-95"
                    >
                        <Plus className="w-5 h-5 sm:mr-2" />
                        <span className="hidden sm:inline font-medium">Nova</span>
                    </button>
                </div>
            </div>

            {/* 2. Filtros e Busca */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por nome, loja ou categoria..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all sm:text-sm"
                    />
                </div>

                <button className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                </button>
            </div>

            {/* 3. Lista de Transações */}
            <div className="bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 overflow-hidden">
                {Object.entries(groupedTransactions).map(([date, transactions], index) => (
                    <div key={date}>
                        {/* Header da Data */}
                        <div className={`px-6 py-3 bg-gray-50/50 border-y border-gray-100 flex justify-between items-center ${index === 0 ? 'border-t-0' : ''}`}>
                            <span className="text-sm font-semibold text-gray-600 capitalize">{date}</span>
                            <span className="text-xs text-gray-400 font-medium">
                {transactions.length} transações
              </span>
                        </div>

                        {/* Itens */}
                        <div className="divide-y divide-gray-50">
                            {transactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="group flex items-center p-4 sm:px-6 hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    {/* Ícone */}
                                    <div className={`
                    h-12 w-12 rounded-full flex items-center justify-center mr-4 shrink-0 transition-colors
                    ${transaction.type === 'INCOME'
                                        ? 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200'
                                        : 'bg-red-50 text-red-600 group-hover:bg-red-100'
                                    }
                  `}>
                                        {getCategoryIcon(transaction.category)}
                                    </div>

                                    {/* Detalhes */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="text-sm font-semibold text-gray-900 truncate pr-4">
                                                {transaction.description}
                                            </h3>
                                            <span className={`text-sm font-bold whitespace-nowrap ${
                                                transaction.type === 'INCOME' ? 'text-emerald-600' : 'text-gray-900'
                                            }`}>
                        {transaction.type === 'EXPENSE' ? '- ' : '+ '}
                                                R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                                        </div>

                                        <div className="flex justify-between items-center text-xs text-gray-500">
                                            <div className="flex items-center gap-2">
                        <span className="bg-gray-100 px-2 py-0.5 rounded-md font-medium text-gray-600">
                          {transaction.category}
                        </span>
                                                <span>•</span>
                                                <span>{transaction.paymentMethod}</span>
                                            </div>

                                            {/* Horário (opcional) */}
                                            <span className="hidden sm:inline-block">
                        {new Date(transaction.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Empty State (Caso não tenha transações) */}
                {MOCK_TRANSACTIONS.length === 0 && (
                    <div className="p-12 text-center">
                        <div className="mx-auto h-12 w-12 text-gray-300 mb-4">
                            <ShoppingBag className="w-full h-full" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Nenhuma transação encontrada</h3>
                        <p className="mt-1 text-gray-500">Tente mudar os filtros ou adicione uma nova transação.</p>
                    </div>
                )}
            </div>

            {/* Paginação ou Rodapé */}
            <div className="text-center pb-8">
                <button className="text-sm text-gray-500 hover:text-emerald-600 font-medium transition-colors">
                    Carregar mais transações
                </button>
            </div>

            {/* --- O MODAL ESTÁ AQUI --- */}
            <NewTransactionModal
                isOpen={isNewTransactionOpen}
                onClose={() => setIsNewTransactionOpen(false)}
                onSuccess={() => {
                    console.log('Transação criada! Idealmente aqui recarregaríamos a API.');
                    // ex: refetchTransactions();
                }}
            />

        </div>
    );
}