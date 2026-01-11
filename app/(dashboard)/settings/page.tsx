'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    User,
    Settings,
    Globe,
    DollarSign,
    Lock,
    LogOut,
    Loader2,
    Save,
    CheckCircle2,
    Bell
} from 'lucide-react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

// --- Schema de Validação ---
const settingsSchema = z.object({
    firstName: z.string().min(2, 'Nome muito curto'),
    lastName: z.string().min(2, 'Sobrenome muito curto'),
    currency: z.enum(['BRL', 'USD', 'EUR']),
    language: z.enum(['pt-BR', 'en-US', 'es-ES']),
});

type SettingsFormInputs = z.infer<typeof settingsSchema>;

interface UserProfile {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    currency: 'BRL' | 'USD' | 'EUR';
    language: 'pt-BR' | 'en-US' | 'es-ES';
    // timezone, etc...
}

export default function SettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [successMsg, setSuccessMsg] = useState('');
    const [user, setUser] = useState<UserProfile | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<SettingsFormInputs>({
        resolver: zodResolver(settingsSchema),
    });

    // Carregar dados iniciais
    useEffect(() => {
        async function loadProfile() {
            try {
                const response = await api.get('/auth/profile');
                const userData = response.data;
                setUser(userData);

                // Preencher formulário
                setValue('firstName', userData.firstName);
                setValue('lastName', userData.lastName);
                setValue('currency', userData.currency || 'BRL');
                setValue('language', userData.language || 'pt-BR');
            } catch (error) {
                console.error('Erro ao carregar perfil', error);
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, [setValue]);

    // Salvar Alterações
    async function handleSaveSettings(data: SettingsFormInputs) {
        if (!user) return;
        setSuccessMsg('');
        try {
            // Endpoint PATCH /users/:id
            await api.patch(`/users/${user.id}`, {
                firstName: data.firstName,
                lastName: data.lastName,
                currency: data.currency,
                language: data.language
            });

            setSuccessMsg('Configurações salvas com sucesso!');

            // Remove mensagem de sucesso após 3s
            setTimeout(() => setSuccessMsg(''), 3000);

            // Atualiza estado local para refletir na UI imediatamente
            setUser({ ...user, ...data });

        } catch (error) {
            console.error('Erro ao salvar', error);
            alert('Erro ao salvar alterações. Tente novamente.');
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    <Settings className="w-6 h-6 text-emerald-600" />
                    Configurações
                </h1>
                <p className="text-sm text-gray-500 mt-1">Gerencie seu perfil e preferências da aplicação.</p>
            </div>

            {/* Mensagem de Sucesso Flutuante */}
            {successMsg && (
                <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-right z-50">
                    <CheckCircle2 className="w-5 h-5" />
                    {successMsg}
                </div>
            )}

            <form onSubmit={handleSubmit(handleSaveSettings)} className="space-y-6">

                {/* Seção 1: Perfil Público */}
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Perfil</h2>
                            <p className="text-xs text-gray-500">Informações pessoais visíveis na conta.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Campos Readonly */}
                        <div className="opacity-70">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Usuário (Imutável)</label>
                            <input
                                disabled
                                value={user?.username}
                                className="block w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <div className="opacity-70">
                            <label className="block text-xs font-medium text-gray-500 mb-1">E-mail (Imutável)</label>
                            <input
                                disabled
                                value={user?.email}
                                className="block w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                        </div>

                        {/* Campos Editáveis */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Nome</label>
                            <input
                                {...register('firstName')}
                                className="block w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                            />
                            {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Sobrenome</label>
                            <input
                                {...register('lastName')}
                                className="block w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                            />
                            {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>}
                        </div>
                    </div>
                </div>

                {/* Seção 2: Preferências Regionais */}
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Globe className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Preferências</h2>
                            <p className="text-xs text-gray-500">Personalize sua experiência global.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Moeda Principal</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <select
                                    {...register('currency')}
                                    className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                                >
                                    <option value="BRL">Real Brasileiro (BRL)</option>
                                    <option value="USD">Dólar Americano (USD)</option>
                                    <option value="EUR">Euro (EUR)</option>
                                </select>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">Isso altera o símbolo monetário em todo o app.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Idioma</label>
                            <select
                                {...register('language')}
                                className="block w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                            >
                                <option value="pt-BR">Português (Brasil)</option>
                                <option value="en-US">English (US)</option>
                                <option value="es-ES">Español</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Seção 3: Notificações (Simulação) */}
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm opacity-80">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Notificações</h2>
                            <p className="text-xs text-gray-500">Controle o que você recebe por e-mail.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Alertas de Vencimento de Fatura</span>
                            <div className="w-10 h-6 bg-emerald-600 rounded-full relative cursor-pointer">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Relatório Semanal</span>
                            <div className="w-10 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botão Salvar Fixo/Sticky ou no final */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-all shadow-md active:scale-95 disabled:opacity-70"
                    >
                        {isSubmitting ? (
                            <Loader2 className="animate-spin w-5 h-5 mr-2" />
                        ) : (
                            <Save className="w-5 h-5 mr-2" />
                        )}
                        Salvar Alterações
                    </button>
                </div>
            </form>

            {/* Zona de Perigo / Logout */}
            <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-sm font-bold text-red-600 mb-4 uppercase tracking-wider">Zona de Risco</h3>
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex items-center justify-between">
                    <div>
                        <h4 className="font-bold text-red-900">Sair da Conta</h4>
                        <p className="text-sm text-red-700 mt-1">Desconecta seu dispositivo atual.</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-white border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair
                    </button>
                </div>
            </div>
        </div>
    );
}