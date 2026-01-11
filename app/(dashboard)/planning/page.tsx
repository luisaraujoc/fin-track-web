'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Plus, Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { NewForecastModal } from '@/components/planning/NewForecastModal';

// Tipos
interface Forecast {
    id: string;
    name: string;
    amount: number; // Meta
    category: string; // ID da Categoria
    type: 'income' | 'expense';
    period: string;
}

interface Transaction {
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    category?: { id: string };
    date: string;
}

interface Category {
    id: string;
    name: string;
}

interface BudgetGroup {
    categoryId: string;
    categoryName: string;
    planned: number;
    actual: number;
    type: 'income' | 'expense';
    forecastId?: string;
}

export default function PlanningPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [budgets, setBudgets] = useState<BudgetGroup[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Navegação de Mês
    const handleMonthChange = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        if (direction === 'prev') newDate.setMonth(newDate.getMonth() - 1);
        else newDate.setMonth(newDate.getMonth() + 1);
        setCurrentDate(newDate);
    };

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);

            // 1. Definir intervalo do mês
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const startDate = new Date(year, month, 1).toISOString();
            const endDate = new Date(year, month + 1, 0).toISOString();

            // 2. Buscar dados em paralelo
            const [forecastsRes, transactionsRes, categoriesRes] = await Promise.all([
                api.get('/forecasts'), // Ideal seria filtrar por data no backend
                api.get('/transactions'), // Ideal seria filtrar por data no backend
                api.get('/categories')
            ]);

            const forecasts: Forecast[] = Array.isArray(forecastsRes.data) ? forecastsRes.data : [];
            const transactions: Transaction[] = Array.isArray(transactionsRes.data) ? transactionsRes.data : [];
            const categories: Category[] = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];

            // 3. Processar e Cruzar Dados
            const budgetMap = new Map<string, BudgetGroup>();

            // A. Adiciona os Orçamentos (Planejado)
            forecasts.forEach(f => {
                // Filtrar forecasts que batem com o mês (backend simples retorna tudo, filtramos aqui por segurança)
                // Nota: Se o backend Forecast não retornar data, assumimos que é recorrente ou ativo.
                // Vamos assumir que todos os forecasts ativos valem para o mês atual para simplificar o MVP.
                const cat = categories.find(c => c.id === f.category);

                budgetMap.set(f.category, {
                    categoryId: f.category,
                    categoryName: cat ? cat.name : 'Categoria Desconhecida',
                    planned: Number(f.amount),
                    actual: 0,
                    type: f.type,
                    forecastId: f.id
                });
            });

            // B. Soma os Gastos Reais (Actual)
            transactions.forEach(t => {
                const tDate = new Date(t.date);
                // Filtra apenas transações do mês selecionado
                if (tDate.getMonth() === month && tDate.getFullYear() === year && t.category?.id) {
                    const current = budgetMap.get(t.category.id);

                    if (current) {
                        // Se já tem orçamento, soma
                        current.actual += Number(t.amount);
                    } else {
                        // Se não tem orçamento, cria entrada "Sem Planejamento" (Opcional, mas útil)
                        // Para esta tela, vamos focar apenas no que foi planejado, ou mostrar tudo?
                        // Vamos mostrar apenas o que tem orçamento definido para focar no "Planning".
                    }
                }
            });

            setBudgets(Array.from(budgetMap.values()));

        } catch (error) {
            console.error('Erro ao carregar planejamento:', error);
        } finally {
            setLoading(false);
        }
    }, [currentDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Totais Gerais
    const totalPlannedExpense = budgets.filter(b => b.type === 'expense').reduce((acc, b) => acc + b.planned, 0);
    const totalActualExpense = budgets.filter(b => b.type === 'expense').reduce((acc, b) => acc + b.actual, 0);
    const totalPlannedIncome = budgets.filter(b => b.type === 'income').reduce((acc, b) => acc + b.planned, 0);
    const totalActualIncome = budgets.filter(b => b.type === 'income').reduce((acc, b) => acc + b.actual, 0);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Planejamento Mensal</h1>
                    <p className="text-sm text-gray-500">Defina metas e acompanhe seus limites de gastos.</p>
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                    {/* Seletor Mês */}
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl px-2 shadow-sm flex-1 sm:flex-none justify-between">
                        <button onClick={() => handleMonthChange('prev')} className="p-2 hover:bg-gray-50 text-gray-500 rounded-lg"><ArrowLeft className="w-4 h-4" /></button>
                        <span className="text-sm font-medium w-32 text-center text-gray-700 capitalize">
              {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </span>
                        <button onClick={() => handleMonthChange('next')} className="p-2 hover:bg-gray-50 text-gray-500 rounded-lg"><ArrowRight className="w-4 h-4" /></button>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl flex items-center shadow-sm active:scale-95 transition-all"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        <span className="font-medium hidden sm:inline">Definir Meta</span>
                        <span className="font-medium sm:hidden">Novo</span>
                    </button>
                </div>
            </div>

            {/* Resumo Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card Despesas */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Orçamento de Despesas</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                R$ {totalActualExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                <span className="text-sm text-gray-400 font-normal ml-2">
                   / {totalPlannedExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                            </h3>
                        </div>
                        <div className="p-2 bg-red-50 rounded-lg text-red-600"><TrendingDown className="w-5 h-5" /></div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-500 ${totalActualExpense > totalPlannedExpense ? 'bg-red-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min((totalActualExpense / (totalPlannedExpense || 1)) * 100, 100)}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-right">
                        {(totalActualExpense / (totalPlannedExpense || 1) * 100).toFixed(1)}% do planejado
                    </p>
                </div>

                {/* Card Receitas */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Meta de Receitas</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                R$ {totalActualIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                <span className="text-sm text-gray-400 font-normal ml-2">
                   / {totalPlannedIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                            </h3>
                        </div>
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><TrendingUp className="w-5 h-5" /></div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                            className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((totalActualIncome / (totalPlannedIncome || 1)) * 100, 100)}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-right">
                        {(totalActualIncome / (totalPlannedIncome || 1) * 100).toFixed(1)}% atingido
                    </p>
                </div>
            </div>

            {/* Lista de Orçamentos Detalhados */}
            <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900">Detalhes por Categoria</h2>

                {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="animate-spin text-emerald-600" /></div>
                ) : budgets.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <Target className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Nenhum orçamento definido para este mês.</p>
                        <button onClick={() => setIsModalOpen(true)} className="text-emerald-600 font-medium text-sm mt-2 hover:underline">
                            Criar primeiro orçamento
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {budgets.map((budget) => {
                            const percent = (budget.actual / budget.planned) * 100;
                            const isOver = budget.type === 'expense' && percent > 100;
                            const isClose = budget.type === 'expense' && percent > 85;

                            return (
                                <div key={budget.categoryId} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="font-bold text-gray-900 truncate pr-2">{budget.categoryName}</span>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                            budget.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-50 text-red-700'
                                        }`}>
                      {budget.type === 'income' ? 'Receita' : 'Despesa'}
                    </span>
                                    </div>

                                    <div className="flex items-end justify-between mb-2">
                                        <div>
                      <span className="text-2xl font-bold text-gray-900">
                        R$ {budget.actual.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                      </span>
                                            <span className="text-xs text-gray-400 ml-1">
                        de {budget.planned.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                      </span>
                                        </div>

                                        {/* Ícone de Status */}
                                        {isOver ? (
                                            <AlertTriangle className="w-5 h-5 text-red-500" />
                                        ) : percent >= 100 && budget.type === 'income' ? (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        ) : null}
                                    </div>

                                    {/* Barra de Progresso */}
                                    <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-500 ${
                                                isOver ? 'bg-red-500' : isClose ? 'bg-orange-400' : 'bg-emerald-500'
                                            }`}
                                            style={{ width: `${Math.min(percent, 100)}%` }}
                                        />
                                    </div>

                                    <div className="text-xs text-right font-medium">
                     <span className={isOver ? 'text-red-600' : isClose ? 'text-orange-500' : 'text-emerald-600'}>
                       {percent.toFixed(0)}%
                     </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <NewForecastModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchData}
                currentDate={currentDate}
            />
        </div>
    );
}