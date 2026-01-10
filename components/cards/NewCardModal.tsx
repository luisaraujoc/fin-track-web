'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2, CreditCard, Calendar, Hash, Building, Palette } from 'lucide-react';
import api from '@/lib/api';

// Schema batendo com a Entidade CreditCard
const cardSchema = z.object({
    name: z.string().min(3, 'Nome muito curto'),
    // Enum conforme definido no backend (CreditCardType)
    type: z.enum(['visa', 'mastercard', 'amex', 'elo', 'other']),
    last_four_digits: z.string().length(4, 'Deve ter 4 dígitos').regex(/^\d+$/, 'Apenas números'),
    limit: z.coerce.number().min(1, 'O limite deve ser maior que 0'),
    closing_day: z.coerce.number().min(1).max(31),
    due_day: z.coerce.number().min(1).max(31),
    bank_name: z.string().optional(),
    color: z.string().optional(), // Hex code ou nome
});

type CardFormInputs = z.infer<typeof cardSchema>;

interface NewCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function NewCardModal({ isOpen, onClose, onSuccess }: NewCardModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<CardFormInputs>({
        resolver: zodResolver(cardSchema) as any,
        defaultValues: {
            type: 'mastercard',
            color: '#000000', // Default preto
        },
    });

    const selectedColor = watch('color');

    async function handleCreateCard(data: CardFormInputs) {
        try {
            // O backend espera snake_case nas propriedades, o Zod já garantiu isso
            await api.post('/credit-cards', data);

            reset();
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Erro ao criar cartão', error);
            alert('Erro ao salvar cartão.');
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
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                                <div className="flex justify-between items-center mb-6">
                                    <Dialog.Title as="h3" className="text-lg font-bold text-gray-900">
                                        Adicionar Cartão
                                    </Dialog.Title>
                                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit(handleCreateCard)} className="space-y-4">

                                    {/* Nome do Cartão */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Apelido do Cartão</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <CreditCard className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Ex: Nubank Roxo"
                                                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                                                {...register('name')}
                                            />
                                        </div>
                                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                                    </div>

                                    {/* Banco (Opcional) */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Instituição / Banco</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Building className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Ex: Nubank, Itaú..."
                                                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                                                {...register('bank_name')}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Bandeira (Type) */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Bandeira</label>
                                            <select
                                                className="block w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white capitalize"
                                                {...register('type')}
                                            >
                                                <option value="mastercard">Mastercard</option>
                                                <option value="visa">Visa</option>
                                                <option value="elo">Elo</option>
                                                <option value="amex">Amex</option>
                                                <option value="other">Outro</option>
                                            </select>
                                        </div>

                                        {/* 4 Dígitos */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Final (4 dígitos)</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Hash className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    maxLength={4}
                                                    placeholder="1234"
                                                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                                                    {...register('last_four_digits')}
                                                />
                                            </div>
                                            {errors.last_four_digits && <p className="text-xs text-red-500 mt-1">{errors.last_four_digits.message}</p>}
                                        </div>
                                    </div>

                                    {/* Limite */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Limite Total (R$)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="0,00"
                                            className="block w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
                                            {...register('limit')}
                                        />
                                        {errors.limit && <p className="text-xs text-red-500 mt-1">{errors.limit.message}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Dia Fechamento */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Dia Fechamento</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <input
                                                    type="number"
                                                    min="1" max="31"
                                                    placeholder="Dia"
                                                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                                                    {...register('closing_day')}
                                                />
                                            </div>
                                            {errors.closing_day && <p className="text-xs text-red-500 mt-1">{errors.closing_day.message}</p>}
                                        </div>

                                        {/* Dia Vencimento */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Dia Vencimento</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <input
                                                    type="number"
                                                    min="1" max="31"
                                                    placeholder="Dia"
                                                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                                                    {...register('due_day')}
                                                />
                                            </div>
                                            {errors.due_day && <p className="text-xs text-red-500 mt-1">{errors.due_day.message}</p>}
                                        </div>
                                    </div>

                                    {/* Cor do Cartão (Visual) */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Cor do Cartão</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                className="h-10 w-10 p-1 rounded-lg border border-gray-200 cursor-pointer"
                                                {...register('color')}
                                            />
                                            <span className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 w-full">
                         {selectedColor}
                       </span>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-3">
                                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium">Cancelar</button>
                                        <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium flex justify-center items-center">
                                            {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Salvar Cartão'}
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