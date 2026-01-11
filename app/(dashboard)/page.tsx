'use client';

import { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Plus,
  CreditCard as CreditCardIcon,
  ShoppingBag,
  Coffee,
  ArrowUpRight,
  Loader2,
  Wallet
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { NewTransactionModal } from '@/components/transactions/NewTransactionModal';

// Tipos para os dados da API
interface Transaction {
  id: string;
  description: string;
  amount: number | string;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  category?: { name: string };
  paymentMethod?: { name: string };
}

interface CreditCard {
  id: string;
  name: string;
  last_four_digits: string;
  limit: number;
  available_limit: number;
  closing_day: number;
  due_day: number;
  type: string; // mastercard, visa, etc
  color?: string;
}

interface UserProfile {
  firstName: string;
  lastName: string;
}

export default function DashboardPage() {
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(true);

  // Estados de Dados
  const [user, setUser] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);

  // Totais Calculados
  const [financials, setFinancials] = useState({
    balance: 0,
    income: 0,
    expense: 0
  });

  async function fetchData() {
    try {
      setLoading(true);

      // Chamadas Paralelas para performance
      const [userRes, transRes, cardsRes] = await Promise.all([
        api.get('/auth/profile').catch(() => ({ data: { firstName: 'Usuário', lastName: '' } })),
        api.get('/transactions').catch(() => ({ data: [] })),
        api.get('/credit-cards').catch(() => ({ data: [] }))
      ]);

      setUser(userRes.data);

      const txList: Transaction[] = Array.isArray(transRes.data) ? transRes.data : [];
      setTransactions(txList);

      const cardsList: CreditCard[] = Array.isArray(cardsRes.data) ? cardsRes.data : [];
      setCards(cardsList);

      // Calcular Totais do Mês Atual
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      let totalIncome = 0;
      let totalExpense = 0;
      let totalBalance = 0;

      txList.forEach(t => {
        const amount = Number(t.amount);
        const tDate = new Date(t.date);

        // Saldo Geral (considera tudo)
        if (t.type === 'INCOME') totalBalance += amount;
        else totalBalance -= amount;

        // Receita/Despesa (só do mês atual)
        if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
          if (t.type === 'INCOME') totalIncome += amount;
          else totalExpense += amount;
        }
      });

      setFinancials({
        balance: totalBalance,
        income: totalIncome,
        expense: totalExpense
      });

    } catch (error) {
      console.error('Erro ao carregar dashboard', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Pegar as 3 últimas transações
  const recentTransactions = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);

  // Pegar o cartão principal (primeiro da lista) ou null
  const mainCard = cards.length > 0 ? cards[0] : null;

  if (loading) {
    return (
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
        </div>
    );
  }

  return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Olá, {user?.firstName} 👋
            </h1>
            <p className="text-gray-500 mt-1">Aqui está o resumo das suas finanças hoje.</p>
          </div>

          <button
              onClick={() => setIsNewTransactionOpen(true)}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Transação
          </button>
        </div>

        {/* Cards Principais (Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* 1. Saldo Total */}
          <div className="bg-emerald-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-2 -translate-y-2">
              <Wallet className="w-24 h-24" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-emerald-100 text-sm font-medium">Saldo Total</span>
                <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="text-emerald-200 hover:text-white transition-colors"
                >
                  {showBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
              <div className="text-3xl font-bold tracking-tight truncate">
                {showBalance
                    ? `R$ ${financials.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    : '••••••'}
              </div>
              <div className="mt-4 flex items-center text-emerald-100 text-sm">
               <span className="bg-emerald-500/30 px-2 py-1 rounded-lg mr-2 text-xs font-semibold">
                Atual
               </span>
                Calculado via transações
              </div>
            </div>
          </div>

          {/* 2. Receitas */}
          <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-gray-500 font-medium text-sm">Receitas do Mês</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 truncate">
                R$ {financials.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-400 mt-1">Este mês</p>
            </div>
          </div>

          {/* 3. Despesas */}
          <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-50 rounded-lg text-red-600">
                <TrendingDown className="w-5 h-5" />
              </div>
              <span className="text-gray-500 font-medium text-sm">Despesas do Mês</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 truncate">
                R$ {financials.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-400 mt-1">Este mês</p>
            </div>
          </div>
        </div>

        {/* Seção Inferior */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Lista de Transações */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Transações Recentes</h2>
              <Link href="/transactions" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center">
                Ver todas <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden min-h-[200px]">
              {recentTransactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <ShoppingBag className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma transação recente.</p>
                  </div>
              ) : (
                  recentTransactions.map((t) => (
                      <div key={t.id} className="flex items-center p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                        <div className={`
                    h-10 w-10 rounded-full flex items-center justify-center mr-4 shrink-0
                    ${t.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-50 text-red-600'}
                  `}>
                          {t.type === 'INCOME' ? <TrendingUp className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">{t.description}</h4>
                          <p className="text-xs text-gray-500 truncate">
                            {t.category?.name || 'Geral'} • {new Date(t.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <span className={`font-semibold text-sm whitespace-nowrap ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {t.type === 'INCOME' ? '+' : '-'} R$ {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                      </div>
                  ))
              )}
            </div>
          </div>

          {/* Resumo de Cartões */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Meus Cartões</h2>

            {mainCard ? (
                <div
                    className="p-6 rounded-2xl text-white shadow-xl relative overflow-hidden"
                    style={{
                      background: mainCard.color || 'linear-gradient(135deg, #1f2937 0%, #111827 100%)'
                    }}
                >
                  {/* Pattern decorativo */}
                  <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white opacity-10 blur-xl"></div>

                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <span className="font-medium opacity-90 truncate pr-4">{mainCard.name}</span>
                    <CreditCardIcon className="w-6 h-6 opacity-80 shrink-0" />
                  </div>
                  <div className="text-lg tracking-widest mb-2 font-mono relative z-10">
                    **** **** **** {mainCard.last_four_digits}
                  </div>
                  <div className="flex justify-between items-end mt-6 relative z-10">
                    <div>
                      <span className="text-xs opacity-60 block uppercase">Limite Disp.</span>
                      <span className="text-sm font-medium">R$ {Number(mainCard.available_limit).toLocaleString('pt-BR')}</span>
                    </div>
                    <div>
                      <span className="text-xs opacity-60 block uppercase text-right">Vencimento</span>
                      <span className="text-sm font-medium">Dia {mainCard.due_day}</span>
                    </div>
                  </div>
                </div>
            ) : (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center">
                  <p className="text-sm text-gray-500 mb-2">Você ainda não tem cartões.</p>
                  <Link href="/cards" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                    Cadastrar cartão
                  </Link>
                </div>
            )}

            {mainCard && (
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Limite Utilizado</span>
                    <span className="text-gray-900 font-bold">
                  {((1 - (Number(mainCard.available_limit) / Number(mainCard.limit))) * 100).toFixed(0)}%
                </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(1 - (Number(mainCard.available_limit) / Number(mainCard.limit))) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-right">
                    Total: R$ {Number(mainCard.limit).toLocaleString('pt-BR')}
                  </p>
                </div>
            )}
          </div>

        </div>

        <NewTransactionModal
            isOpen={isNewTransactionOpen}
            onClose={() => setIsNewTransactionOpen(false)}
            onSuccess={fetchData} // Recarrega os dados ao criar nova transação
        />
      </div>
  );
}