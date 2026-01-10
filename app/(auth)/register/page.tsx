'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Lock, Mail, User, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

// 1. Esquema de Validação (Regras)
const registerSchema = z.object({
    firstName: z.string().min(2, 'O nome deve ter pelo menos 2 letras'),
    lastName: z.string().min(2, 'O sobrenome deve ter pelo menos 2 letras'),
    email: z.string().email('Digite um e-mail válido'),
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [generalError, setGeneralError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormInputs>({
        resolver: zodResolver(registerSchema),
    });

    async function handleRegister(data: RegisterFormInputs) {
        setGeneralError(null);
        try {
            // Ajuste para bater com o DTO do seu backend (CreateUserDto)
            // O seu GoogleStrategy sugere que você usa firstName/lastName
            await api.post('/auth/register', {
                email: data.email,
                password: data.password,
                firstName: data.firstName,
                lastName: data.lastName,
            });

            // Sucesso! Redireciona para o login com uma query de sucesso (opcional)
            router.push('/login?registered=true');

        } catch (error: any) {
            console.error(error);
            if (error.response?.status === 409) {
                setGeneralError('Este e-mail já está em uso.');
            } else {
                setGeneralError('Ocorreu um erro ao criar a conta. Tente novamente.');
            }
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100">

                {/* Link de Voltar */}
                <Link
                    href="/login"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-emerald-600 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Voltar para Login
                </Link>

                {/* Cabeçalho */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-emerald-600 tracking-tight">
                        Crie sua conta
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Comece a organizar sua vida financeira
                    </p>
                </div>

                {/* Erro Geral */}
                {generalError && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-100 animate-in fade-in">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{generalError}</span>
                    </div>
                )}

                <form className="mt-8 space-y-5" onSubmit={handleSubmit(handleRegister)}>

                    {/* Nome e Sobrenome (Grid) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    {...register('firstName')}
                                    placeholder="Seu nome"
                                    className={`block w-full pl-10 pr-3 py-2.5 border ${
                                        errors.firstName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500'
                                    } rounded-lg shadow-sm focus:outline-none focus:ring-1 transition-colors sm:text-sm`}
                                />
                            </div>
                            {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sobrenome</label>
                            <input
                                {...register('lastName')}
                                placeholder="Sobrenome"
                                className={`block w-full px-3 py-2.5 border ${
                                    errors.lastName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500'
                                } rounded-lg shadow-sm focus:outline-none focus:ring-1 transition-colors sm:text-sm`}
                            />
                            {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>}
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                {...register('email')}
                                placeholder="seu@email.com"
                                className={`block w-full pl-10 pr-3 py-2.5 border ${
                                    errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500'
                                } rounded-lg shadow-sm focus:outline-none focus:ring-1 transition-colors sm:text-sm`}
                            />
                        </div>
                        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                    </div>

                    {/* Senha */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                {...register('password')}
                                placeholder="Mínimo 6 caracteres"
                                className={`block w-full pl-10 pr-10 py-2.5 border ${
                                    errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500'
                                } rounded-lg shadow-sm focus:outline-none focus:ring-1 transition-colors sm:text-sm`}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                            </button>
                        </div>
                        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
                    </div>

                    {/* Confirmar Senha */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                {...register('confirmPassword')}
                                placeholder="Repita a senha"
                                className={`block w-full pl-10 pr-3 py-2.5 border ${
                                    errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500'
                                } rounded-lg shadow-sm focus:outline-none focus:ring-1 transition-colors sm:text-sm`}
                            />
                        </div>
                        {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
                    </div>

                    {/* Botão de Ação */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Criar Conta'}
                        </button>
                    </div>

                    <p className="text-center text-sm text-gray-600">
                        Já tem uma conta?{' '}
                        <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
                            Fazer Login
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}