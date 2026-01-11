'use client';

import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2, Target, Calendar } from 'lucide-react';
import api from '@/lib/api';

// Schema alinhado com o CreateForecastDto do backend
const forecastSchema = z.object({
    amount: z.coerce.number().min(0.01, 'Defina um valor maior que zero'),
    categoryId: z.string().min(1, 'Selecione uma categoria'),
    // Campos ocultos ou auto-calculados
    name: z.string().optional(),
    type: z.enum(['income', 'expense']), // minúsculo conforme seu enum backend
    start_date: z.string(),
    end_date: z.string(),
});

type ForecastFormInputs = z.infer<typeof forecastSchema>;

interface Category {
    id: string;
    name: string;
    type: 'INCOME' | 'EXPENSE';
}

interface NewForecastModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    currentDate: Date; // Para saber o mês do planejamento
}

export function NewForecastModal({ isOpen, onClose, onSuccess, currentDate }: NewForecastModalProps) {
    const [categories, setCategories] = useState<Category[]>([]);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ForecastFormInputs>({
        resolver: zodResolver(forecastSchema) as any,
    });

    const selectedCategoryId = watch('categoryId');

    // Carrega categorias ao abrir
    useEffect(() => {
        if (isOpen) {
            api.get('/categories').then(res => setCategories(res.data)).catch(console.error);

            // Define datas automaticamente (Primeiro e Último dia do mês selecionado)
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const startDate = new Date(year, month, 1).toISOString().split('T')[0];
            const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

            setValue('start_date', startDate);
            setValue('end_date', endDate);
        }
    }, [isOpen, currentDate, setValue]);

    // Ao selecionar categoria, preenche Nome e Tipo automaticamente
    useEffect(() => {
        const category = categories.find(c => c.id === selectedCategoryId);
        if (category) {
            setValue('name', `Orçamento: ${category.name}`);
            // Converte INCOME/EXPENSE para income/expense (backend espera minúsculo no Forecast)
            setValue('type', category.type.toLowerCase() as 'income' | 'expense');
        }
    }, [selectedCategoryId, categories, setValue]);

    async function handleCreateForecast(data: ForecastFormInputs) {
        try {
            await api.post('/forecasts', {
                ...data,
                period: 'monthly', // Fixo para este módulo
                category: data.categoryId, // Backend espera string, enviamos o ID para vincular
                description: 'Planejamento mensal via web'
            });
            reset();
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Erro ao criar planejamento', error);
            alert('Erro ao salvar. Verifique se já não existe um planejamento para esta categoria.');
        }
    }

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">

                            <div className="flex justify-between items-center mb-6">
                                <Dialog.Title as="h3" className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-emerald-600" />
                                    Novo Orçamento
                                </Dialog.Title>
                                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="mb-4 bg-emerald-50 p-3 rounded-lg text-sm text-emerald-800 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Planejamento para: <strong>{currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</strong>
                            </div>

                            <form onSubmit={handleSubmit(handleCreateForecast)} className="space-y-4">

                                {/* Categoria */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Categoria</label>
                                    <select
                                        className="block w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500"
                                        {...register('categoryId')}
                                    >
                                        <option value="">Selecione uma categoria...</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name} ({cat.type === 'EXPENSE' ? 'Despesa' : 'Receita'})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.categoryId && <p className="text-xs text-red-500 mt-1">{errors.categoryId.message}</p>}
                                </div>

                                {/* Valor Meta */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Valor Limite / Meta (R$)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0,00"
                                        className="block w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold text-lg"
                                        {...register('amount')}
                                    />
                                    {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium">Cancelar</button>
                                    <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium flex justify-center items-center">
                                        {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Definir Meta'}
                                    </button>
                                </div>
                            </form>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}