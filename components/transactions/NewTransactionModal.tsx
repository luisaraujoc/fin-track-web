'use client';

import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2, Calendar, DollarSign, AlignLeft } from 'lucide-react';
import api from '@/lib/api';

// --- Schema de Validação (Zod) ---
const transactionSchema = z.object({
    description: z.string().min(3, 'Descrição muito curta'),
    amount: z.coerce.number().min(0.01, 'O valor deve ser maior que 0'),
    type: z.enum(['INCOME', 'EXPENSE']),
    categoryId: z.string().min(1, 'Selecione uma categoria'),
    paymentMethodId: z.string().min(1, 'Selecione um método de pagamento'),
    date: z.string(),
    isPaid: z.boolean().default(true),
});

// Inferência do tipo final (Output)
type TransactionFormInputs = z.infer<typeof transactionSchema>;

// --- Tipos para os Selects ---
type Category = { id: string; name: string; type: string };
type PaymentMethod = { id: string; name: string };

interface NewTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function NewTransactionModal({ isOpen, onClose, onSuccess }: NewTransactionModalProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<TransactionFormInputs>({
        // CORREÇÃO AQUI: 'as any' resolve o conflito entre z.coerce (unknown) e o tipo estrito (number)
        resolver: zodResolver(transactionSchema) as any,
        defaultValues: {
            type: 'EXPENSE',
            isPaid: true,
            date: new Date().toISOString().split('T')[0], // Hoje YYYY-MM-DD
            amount: 0, // Inicializa com 0 para evitar erro de uncontrolled input
        },
    });

    const selectedType = watch('type');

    // Carregar dados auxiliares ao abrir o modal
    useEffect(() => {
        if (isOpen) {
            // Fetch Categorias
            api.get('/categories').then(res => setCategories(res.data)).catch(() => {
                // Fallback fictício
                setCategories([
                    { id: '1', name: 'Alimentação', type: 'EXPENSE' },
                    { id: '2', name: 'Salário', type: 'INCOME' },
                    { id: '3', name: 'Lazer', type: 'EXPENSE' }
                ]);
            });

            // Fetch Métodos de Pagamento
            api.get('/payment-methods').then(res => setPaymentMethods(res.data)).catch(() => {
                setPaymentMethods([
                    { id: '1', name: 'Nubank Crédito' },
                    { id: '2', name: 'Conta Corrente' }
                ]);
            });
        }
    }, [isOpen]);

    async function handleCreateTransaction(data: TransactionFormInputs) {
        try {
            // Envia para o Backend
            await api.post('/transactions', {
                ...data,
                date: new Date(data.date).toISOString(), // Garante formato ISO completo para o backend
            });

            reset();
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Erro ao criar transação', error);
            alert('Erro ao salvar. Verifique o console.');
        }
    }

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>

                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">

                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">

                                <div className="flex justify-between items-center mb-6">
                                    <Dialog.Title as="h3" className="text-lg font-bold text-gray-900">
                                        Nova Transação
                                    </Dialog.Title>
                                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit(handleCreateTransaction)} className="space-y-4">

                                    {/* Toggle Receita / Despesa */}
                                    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                                        <label className={`
                      flex items-center justify-center py-2 rounded-lg text-sm font-medium cursor-pointer transition-all
                      ${selectedType === 'EXPENSE' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}
                    `}>
                                            <input type="radio" value="EXPENSE" className="hidden" {...register('type')} />
                                            Despesa
                                        </label>
                                        <label className={`
                      flex items-center justify-center py-2 rounded-lg text-sm font-medium cursor-pointer transition-all
                      ${selectedType === 'INCOME' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}
                    `}>
                                            <input type="radio" value="INCOME" className="hidden" {...register('type')} />
                                            Receita
                                        </label>
                                    </div>

                                    {/* Valor (R$) */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Valor</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <DollarSign className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="0,00"
                                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-2xl font-bold text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                {...register('amount')}
                                            />
                                        </div>
                                        {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
                                    </div>

                                    {/* Descrição */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Descrição</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <AlignLeft className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Ex: Compras no mercado"
                                                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                {...register('description')}
                                            />
                                        </div>
                                        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Categoria */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Categoria</label>
                                            <select
                                                className="block w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                                {...register('categoryId')}
                                            >
                                                <option value="">Selecione</option>
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                            {errors.categoryId && <p className="text-xs text-red-500 mt-1">{errors.categoryId.message}</p>}
                                        </div>

                                        {/* Data */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Data</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <input
                                                    type="date"
                                                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                    {...register('date')}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Método de Pagamento */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Conta / Cartão</label>
                                        <select
                                            className="block w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                            {...register('paymentMethodId')}
                                        >
                                            <option value="">Selecione onde vai sair/entrar o dinheiro</option>
                                            {paymentMethods.map(pm => (
                                                <option key={pm.id} value={pm.id}>{pm.name}</option>
                                            ))}
                                        </select>
                                        {errors.paymentMethodId && <p className="text-xs text-red-500 mt-1">{errors.paymentMethodId.message}</p>}
                                    </div>

                                    {/* Checkbox Pago */}
                                    <div className="flex items-center gap-2 mt-2">
                                        <input
                                            type="checkbox"
                                            id="isPaid"
                                            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                            {...register('isPaid')}
                                        />
                                        <label htmlFor="isPaid" className="text-sm text-gray-700">
                                            Essa transação já foi paga/recebida?
                                        </label>
                                    </div>

                                    {/* Botões do Footer */}
                                    <div className="pt-4 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium transition-colors flex justify-center items-center shadow-md disabled:opacity-70"
                                        >
                                            {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Salvar'}
                                        </button>
                                    </div>

                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}