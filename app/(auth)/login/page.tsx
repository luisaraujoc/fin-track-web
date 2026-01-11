'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Lock, User, Loader2, AlertCircle } from 'lucide-react'; // Mudei Mail para User no ícone
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

// 1. Esquema de validação com Zod
const loginSchema = z.object({
    // Aceita string simples (não obriga ser formato de email)
    usernameOrEmail: z.string().min(3, 'Digite seu e-mail ou usuário'),
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [generalError, setGeneralError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormInputs>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            usernameOrEmail: '',
            password: '',
        },
    });

    async function handleLogin(data: LoginFormInputs) {
        setGeneralError(null);
        try {
            // CORREÇÃO: Enviando o nome do campo que o backend espera (usernameOrEmail)
            const response = await api.post('/auth/login', {
                usernameOrEmail: data.usernameOrEmail,
                password: data.password,
            });

            const { access_token } = response.data;

            localStorage.setItem('token', access_token);

            router.refresh();
            router.push('/');
        } catch (error: any) {
            console.error('Erro no login:', error);
            if (error.response?.status === 401) {
                setGeneralError('Usuário/E-mail ou senha incorretos.');
            } else if (error.code === "ERR_NETWORK") {
                setGeneralError('Erro de conexão com o servidor.');
            } else {
                setGeneralError('Ocorreu um erro ao tentar entrar. Tente novamente.');
            }
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-emerald-600 tracking-tight">
                        Fin-Track
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Bem-vindo de volta! Acesse sua conta.
                    </p>
                </div>

                {generalError && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-100 animate-in fade-in slide-in-from-top-1">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{generalError}</span>
                    </div>
                )}

                <form className="mt-8 space-y-5" onSubmit={handleSubmit(handleLogin)}>
                    {/* Campo E-mail ou Usuário */}
                    <div>
                        <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-gray-700 mb-1">
                            E-mail ou Usuário
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className={`h-5 w-5 ${errors.usernameOrEmail ? 'text-red-400' : 'text-gray-400'}`} />
                            </div>
                            <input
                                id="usernameOrEmail"
                                type="text" // Tipo text para aceitar username
                                placeholder="email/username"
                                autoComplete="username"
                                className={`block w-full pl-10 pr-3 py-2.5 border ${
                                    errors.usernameOrEmail
                                        ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                                } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors sm:text-sm`}
                                {...register('usernameOrEmail')}
                            />
                        </div>
                        {errors.usernameOrEmail && (
                            <p className="mt-1 text-xs text-red-600">{errors.usernameOrEmail.message}</p>
                        )}
                    </div>

                    {/* Campo Senha */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Senha
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
                            >
                                Esqueceu?
                            </Link>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className={`h-5 w-5 ${errors.password ? 'text-red-400' : 'text-gray-400'}`} />
                            </div>
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                placeholder="••••••••"
                                className={`block w-full pl-10 pr-10 py-2.5 border ${
                                    errors.password
                                        ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                                } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors sm:text-sm`}
                                {...register('password')}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center z-10"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                        )}
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                        >
                            {isSubmitting ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                'Entrar'
                            )}
                        </button>
                    </div>

                    <div className="relative mt-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Ou continue com</span>
                        </div>
                    </div>

                    <p className="text-center text-sm text-gray-600 mt-4">
                        Não tem uma conta?{' '}
                        <Link href="/register" className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
                            Cadastre-se agora
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}