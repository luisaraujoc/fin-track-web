'use client';

import { useState } from 'react';
import { Eye, EyeOff, TrendingUp, TrendingDown, Plus, CreditCard, ShoppingBag, Coffee, ArrowUpRight } from 'lucide-react';

export default function DashboardPage() {
  const [showBalance, setShowBalance] = useState(true);

  // Mock data (Substituiremos pela API depois)
  const balance = 12450.00;
  const income = 5200.00;
  const expense = 3100.00;

  return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Olá, Luís 👋
            </h1>
            <p className="text-gray-500 mt-1">Aqui está o resumo das suas finanças hoje.</p>
          </div>

          {/* Botão de Ação Rápida */}
          <button className="inline-flex items-center justify-center px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md active:scale-95">
            <Plus className="w-5 h-5 mr-2" />
            Nova Transação
          </button>
        </div>

        {/* Cards Principais (Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* 1. Saldo Total (Destaque) */}
          <div className="bg-emerald-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden group">
            {/* Decoração de fundo */}
            <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-2 -translate-y-2">
              <CreditCard className="w-24 h-24" />
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
              <div className="text-3xl font-bold tracking-tight">
                {showBalance ? `R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '••••••'}
              </div>
              <div className="mt-4 flex items-center text-emerald-100 text-sm">
              <span className="bg-emerald-500/30 px-2 py-1 rounded-lg mr-2 text-xs font-semibold">
                +12%
              </span>
                em relação ao mês passado
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
              <div className="text-2xl font-bold text-gray-900">
                R$ {income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-400 mt-1">Atualizado há 1 hora</p>
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
              <div className="text-2xl font-bold text-gray-900">
                R$ {expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-400 mt-1">70% do orçamento mensal</p>
            </div>
          </div>
        </div>

        {/* Seção Inferior: Cartões e Transações Recentes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Lista de Transações (Ocupa 2 colunas) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Transações Recentes</h2>
              <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center">
                Ver todas <ArrowUpRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
              {/* Item 1 */}
              <div className="flex items-center p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mr-4">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900">Supermercado Extra</h4>
                  <p className="text-xs text-gray-500">Nubank • Hoje, 14:30</p>
                </div>
                <span className="font-semibold text-red-600 text-sm">- R$ 450,20</span>
              </div>

              {/* Item 2 */}
              <div className="flex items-center p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                  <Coffee className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900">Starbucks</h4>
                  <p className="text-xs text-gray-500">Débito • Ontem</p>
                </div>
                <span className="font-semibold text-red-600 text-sm">- R$ 24,90</span>
              </div>

              {/* Item 3 */}
              <div className="flex items-center p-4 hover:bg-gray-50 transition-colors">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mr-4">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900">Projeto Freelance</h4>
                  <p className="text-xs text-gray-500">Pix • 10 Out</p>
                </div>
                <span className="font-semibold text-emerald-600 text-sm">+ R$ 1.200,00</span>
              </div>
            </div>
          </div>

          {/* Resumo de Cartões (Coluna da Direita) */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Meus Cartões</h2>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl text-white shadow-xl">
              <div className="flex justify-between items-start mb-8">
                <span className="font-medium opacity-80">Nubank</span>
                <CreditCard className="w-6 h-6 opacity-80" />
              </div>
              <div className="text-lg tracking-widest mb-2 font-mono">
                **** **** **** 4829
              </div>
              <div className="flex justify-between items-end mt-6">
                <div>
                  <span className="text-xs opacity-60 block uppercase">Titular</span>
                  <span className="text-sm font-medium">LUIS ARAUJO</span>
                </div>
                <div>
                  <span className="text-xs opacity-60 block uppercase text-right">Validade</span>
                  <span className="text-sm font-medium">12/29</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Fatura Atual</span>
                <span className="text-gray-900 font-bold">R$ 1.420,50</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-right">Fecha em 10 dias</p>
            </div>
          </div>

        </div>
      </div>
  );
}