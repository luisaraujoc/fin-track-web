'use client';

import { useState, useEffect } from 'react';
import { Plus, CreditCard, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { NewCardModal } from '@/components/cards/NewCardModal';
import api from '@/lib/api';

// Interface baseada na Entidade CreditCard do Backend
interface CreditCardData {
    id: string;
    name: string;
    bank_name?: string;
    type: 'visa' | 'mastercard' | 'elo' | 'amex' | 'other';
    last_four_digits: string;
    limit: number; // vem como string ou number dependendo do driver do banco, mas axios costuma converter se for json
    available_limit: number;
    closing_day: number;
    due_day: number;
    color?: string;
    // Campos virtuais
    currentInvoice?: any; // Ajustar conforme DTO de fatura se necessário
}

export default function CardsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cards, setCards] = useState<CreditCardData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Função para buscar cartões da API
    async function fetchCards() {
        try {
            setLoading(true);
            const response = await api.get('/credit-cards');
            setCards(response.data);
        } catch (err) {
            console.error(err);
            setError('Não foi possível carregar seus cartões.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCards();
    }, []);

    async function handleDeleteCard(id: string) {
        if(!confirm('Tem certeza que deseja excluir este cartão?')) return;
        try {
            await api.delete(`/credit-cards/${id}`);
            fetchCards(); // Recarrega a lista
        } catch (err) {
            alert('Erro ao excluir cartão');
        }
    }

    // Helper para cor do cartão (fallback se o usuário não escolheu cor)
    const getCardStyle = (card: CreditCardData) => {
        if (card.color) {
            return { backgroundColor: card.color, color: '#FFF' };
        }
        // Fallback gradients
        switch (card.type) {
            case 'mastercard': return { background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)', color: '#FFF' };
            case 'visa': return { background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: '#FFF' };
            default: return { background: 'linear-gradient(135deg, #1f2937 0%, #4b5563 100%)', color: '#FFF' };
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Meus Cartões</h1>
                    <p className="text-sm text-gray-500">Gerencie seus limites e faturas.</p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl flex items-center shadow-sm active:scale-95 transition-all"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    <span className="font-medium">Adicionar Cartão</span>
                </button>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                </div>
            )}

            {/* Error State */}
            {!loading && error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {/* Grid de Cartões */}
            {!loading && !error && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {cards.map((card) => {
                        // Cálculos básicos (se limit for string, converte)
                        const limit = Number(card.limit);
                        const available = Number(card.available_limit);
                        const used = limit - available;
                        const usagePercent = limit > 0 ? (used / limit) * 100 : 0;

                        // Valor da fatura atual (mockado ou vindo de currentInvoice)
                        const currentInvoiceValue = used; // Simplificação se não tivermos a fatura detalhada ainda

                        return (
                            <div key={card.id} className="bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 overflow-hidden flex flex-col sm:flex-row">

                                {/* Visual do Cartão (Esquerda) */}
                                <div
                                    className="p-6 w-full sm:w-72 flex flex-col justify-between relative text-white shadow-inner"
                                    style={getCardStyle(card)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="font-bold text-lg block">{card.name}</span>
                                            {card.bank_name && <span className="text-xs opacity-80">{card.bank_name}</span>}
                                        </div>
                                        <span className="font-bold text-sm opacity-90 uppercase tracking-wider">{card.type}</span>
                                    </div>

                                    <div className="mt-8 mb-4">
                                        <div className="text-lg tracking-widest font-mono opacity-90">
                                            **** **** **** {card.last_four_digits}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end text-xs opacity-90">
                                        <div>
                                            <span className="block uppercase text-[10px] opacity-70">Fechamento</span>
                                            <span className="font-semibold text-sm">Dia {card.closing_day}</span>
                                        </div>
                                        <div>
                                            <span className="block uppercase text-[10px] opacity-70 text-right">Vencimento</span>
                                            <span className="font-semibold text-sm">Dia {card.due_day}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Detalhes da Fatura (Direita) */}
                                <div className="p-6 flex-1 flex flex-col justify-center">
                                    <div className="space-y-4">

                                        {/* Fatura Atual (Estimada pelo utilizado) */}
                                        <div>
                                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Gasto Atual</span>
                                            <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-bold text-gray-900">
                          R$ {currentInvoiceValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                                            </div>
                                        </div>

                                        {/* Barra de Limite */}
                                        <div>
                                            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                                                <span>Limite utilizado</span>
                                                <span>{usagePercent.toFixed(0)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className={`h-2 rounded-full transition-all duration-500 ${usagePercent > 80 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between mt-2 text-xs">
                        <span className="text-emerald-600 font-medium">
                          Disponível: R$ {available.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                                                <span className="text-gray-400">
                          Total: R$ {limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                                            </div>
                                        </div>

                                        {/* Ações */}
                                        <div className="pt-4 border-t border-gray-50 flex gap-2">
                                            <button className="flex-1 text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                                                Ver Fatura
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCard(card.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                                                title="Excluir cartão"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Empty State */}
                    {cards.length === 0 && (
                        <div
                            onClick={() => setIsModalOpen(true)}
                            className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-all group min-h-[200px]"
                        >
                            <div className="bg-gray-50 p-4 rounded-full mb-4 group-hover:bg-white group-hover:shadow-sm transition-all">
                                <CreditCard className="w-8 h-8 text-gray-400 group-hover:text-emerald-500" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Nenhum cartão cadastrado</h3>
                            <p className="text-gray-500 text-sm mt-1">Clique para adicionar seu primeiro cartão de crédito.</p>
                        </div>
                    )}
                </div>
            )}

            <NewCardModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchCards}
            />
        </div>
    );
}