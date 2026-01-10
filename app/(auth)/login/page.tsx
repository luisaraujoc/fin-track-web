'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api'; // Certifique-se que o caminho está correto para sua estrutura

// 1. Esquema de validação com Zod
const loginSchema = z.object({
    email: z.string().min(1, 'E-mail é obrigatório').email('Digite um e-mail válido'),
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

// Inferir o tipo a partir do esquema
type LoginFormInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [generalError, setGeneralError] = useState<string | null>(null);

    // 2. Configuração do hook-form
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormInputs>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    // 3. Função de envio do formulário
    async function handleLogin(data: LoginFormInputs) {
        setGeneralError(null);
        try {
            // Chama a rota POST /auth/login do seu backend NestJS
            const response = await api.post('/auth/login', {
                email: data.email,
                password: data.password,
            });

            // O backend retorna { access_token: '...' }
            const { access_token } = response.data;

            // Salva o token no LocalStorage para usar nas próximas requisições
            localStorage.setItem('token', access_token);

            // Redireciona para a página inicial (Dashboard)
            router.refresh(); // Força uma atualização para garantir que o estado de auth seja reconhecido
            router.push('/');

        } catch (error: any) {
            console.error('Erro no login:', error);
            // Tratamento básico de erros HTTP
            if (error.response?.status === 401 || error.response?.status === 404) {
                setGeneralError('E-mail ou senha incorretos.');
            } else {
                setGeneralError('Ocorreu um erro inesperado. Tente novamente mais tarde.');
            }
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100">
                {/* Cabeçalho do Card */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-emerald-600 tracking-tight">
                        Fin-Track
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Bem-vindo de volta! Acesse sua conta.
                    </p>
                </div>

                {/* Mensagem de Erro Geral (ex: credenciais inválidas) */}
                {generalError && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-100 animate-in fade-in slide-in-from-top-1">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{generalError}</span>
                    </div>
                )}

                {/* Formulário */}
                <form className="mt-8 space-y-5" onSubmit={handleSubmit(handleLogin)}>
                    {/* Campo E-mail */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            E-mail
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className={`h-5 w-5 ${errors.email ? 'text-red-400' : 'text-gray-400'}`} />
                            </div>
                            <input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                autoComplete="email"
                                className={`block w-full pl-10 pr-3 py-2.5 border ${
                                    errors.email
                                        ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                                } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors sm:text-sm`}
                                {...register('email')}
                            />
                        </div>
                        {errors.email && (
                            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
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
                                tabIndex={-1} // Evita focar no ícone ao usar Tab
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

                    {/* Botão de Submit */}
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

                    {/* Link para Registro */}
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