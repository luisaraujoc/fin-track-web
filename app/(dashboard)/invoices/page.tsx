'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    ArrowLeft,
    ArrowRight,
    CreditCard,
    Calendar,
    AlertCircle,
    CheckCircle2,
    Clock,
    FileText,
    Loader2
} from 'lucide-react';
import api from '@/lib/api';

// Interfaces baseadas no padrão do seu backend (snake_case)
interface Invoice {
    id: string;
    month: string; // Ex: '10'
    year: string;  // Ex: '2025'
    amount: number;
    status: 'OPEN' | 'CLOSED' | 'PAID' | 'OVERDUE';
    closing_date: string;
    due_date: string;
    credit_card: {
        id: string;
        name: string;
        last_four_digits: string;
        color?: string;
        brand?: string;
        limit: number;
    };
}

export default function InvoicesPage() {
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());

    // Navegação de Meses
    const handleMonthChange = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        if (direction === 'prev') newDate.setMonth(newDate.getMonth() - 1);
        else newDate.setMonth(newDate.getMonth() + 1);
        setCurrentDate(newDate);
    };

    const fetchInvoices = useCallback(async () => {
        try {
            setLoading(true);

            // O backend idealmente aceita filtros.
            // Se não aceitar, teremos que filtrar no front (exemplo abaixo assume query params)
            const month = (currentDate.getMonth() + 1).toString();
            const year = currentDate.getFullYear().toString();

            // Ajuste a rota conforme seu controller de Invoices
            const response = await api.get('/invoices', {
                params: { month, year }
            });

            // Se o backend retornar paginação, ajuste para response.data.data
            const data = Array.isArray(response.data) ? response.data : [];
            setInvoices(data);
        } catch (error) {
            console.error('Erro ao buscar faturas:', error);
            // Mock de dados caso a API esteja vazia para teste visual
            // setInvoices([]);
        } finally {
            setLoading(false);
        }
    }, [currentDate]);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    // Cálculos de Totais
    const totalAmount = invoices.reduce((acc, inv) => acc + Number(inv.amount), 0);
    const paidAmount = invoices
        .filter(inv => inv.status === 'PAID')
        .reduce((acc, inv) => acc + Number(inv.amount), 0);
    const openAmount = totalAmount - paidAmount;

    // Helpers de UI
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-green-100 text-green-700 border-green-200';
            case 'CLOSED': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'OVERDUE': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-emerald-100 text-emerald-700 border-emerald-200'; // OPEN
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PAID': return 'Paga';
            case 'CLOSED': return 'Fechada';
            case 'OVERDUE': return 'Vencida';
            default: return 'Aberta';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PAID': return <CheckCircle2 className="w-4 h-4 mr-1" />;
            case 'CLOSED': return <FileText className="w-4 h-4 mr-1" />;
            case 'OVERDUE': return <AlertCircle className="w-4 h-4 mr-1" />;
            default: return <Clock className="w-4 h-4 mr-1" />;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header & Navegação de Data */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Faturas</h1>
                    <p className="text-sm text-gray-500">Acompanhe seus gastos mensais por cartão.</p>
                </div>

                <div className="flex items-center bg-white border border-gray-200 rounded-xl px-2 shadow-sm">
                    <button
                        onClick={() => handleMonthChange('prev')}
                        className="p-2 hover:bg-gray-50 rounded-lg text-gray-500 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium w-40 text-center text-gray-700 capitalize select-none">
            {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </span>
                    <button
                        onClick={() => handleMonthChange('next')}
                        className="p-2 hover:bg-gray-50 rounded-lg text-gray-500 transition-colors"
                    >
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Resumo do Mês */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <span className="text-gray-500 text-sm font-medium">Total do Mês</span>
                    <div className="text-2xl font-bold text-gray-900 mt-1">
                        R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <span className="text-gray-500 text-sm font-medium">Em Aberto / Fechado</span>
                    <div className="text-2xl font-bold text-emerald-600 mt-1">
                        R$ {openAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <span className="text-gray-500 text-sm font-medium">Pago</span>
                    <div className="text-2xl font-bold text-gray-400 mt-1">
                        R$ {paidAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                </div>
            </div>

            {/* Lista de Faturas */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                </div>
            ) : invoices.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">Nenhuma fatura encontrada</h3>
                    <p className="text-gray-500 text-sm">Não há registros para o mês selecionado.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {invoices.map((invoice) => {
                        const percentage = (invoice.amount / invoice.credit_card.limit) * 100;
                        const isClosed = invoice.status === 'CLOSED' || invoice.status === 'PAID';

                        return (
                            <div
                                key={invoice.id}
                                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                            >
                                {/* Header do Cartão */}
                                <div className="p-6 pb-4 flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-12 h-8 rounded-md shadow-sm bg-gray-800"
                                            style={{ background: invoice.credit_card.color || '#1f2937' }}
                                        />
                                        <div>
                                            <h3 className="font-bold text-gray-900">{invoice.credit_card.name}</h3>
                                            <p className="text-xs text-gray-500">**** {invoice.credit_card.last_four_digits}</p>
                                        </div>
                                    </div>

                                    {/* Badge de Status */}
                                    <div className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center ${getStatusStyle(invoice.status)}`}>
                                        {getStatusIcon(invoice.status)}
                                        {getStatusLabel(invoice.status)}
                                    </div>
                                </div>

                                <div className="px-6 py-2">
                                    <div className="flex justify-between items-end mb-2">
                                        <div>
                                            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Valor da Fatura</span>
                                            <div className="text-2xl font-bold text-gray-900">
                                                R$ {Number(invoice.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Barra de Progresso do Limite */}
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 mb-1">
                                        <div
                                            className={`h-1.5 rounded-full ${percentage > 90 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                            style={{ width: `${Math.min(percentage, 100)}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span>Usado: {percentage.toFixed(0)}%</span>
                                        <span>Limite: R$ {Number(invoice.credit_card.limit).toLocaleString('pt-BR')}</span>
                                    </div>
                                </div>

                                {/* Footer com Datas */}
                                <div className="bg-gray-50 px-6 py-4 mt-4 border-t border-gray-100 flex justify-between items-center">
                                    <div className="text-xs text-gray-500">
                                        <div className="flex items-center mb-1">
                                            <Calendar className="w-3 h-3 mr-1.5 opacity-70" />
                                            <span>Fecha: {new Date(invoice.closing_date).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                        <div className="flex items-center font-medium text-gray-700">
                                            <AlertCircle className="w-3 h-3 mr-1.5 text-red-500" />
                                            <span>Vence: {new Date(invoice.due_date).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                    </div>

                                    {/* Ação (Só mostra se fechada e não paga) */}
                                    {invoice.status === 'CLOSED' && (
                                        <button className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                                            Pagar Fatura
                                        </button>
                                    )}
                                    {invoice.status === 'OPEN' && (
                                        <button className="text-gray-500 hover:text-emerald-600 text-sm font-medium px-4 py-2 transition-colors">
                                            Ver detalhes
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}