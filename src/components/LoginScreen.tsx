"use client";

import { useState } from "react";
import { Mic, Eye, EyeOff } from "lucide-react";

interface LoginScreenProps {
  onSignIn: (email: string, password: string) => Promise<{ error: any }>;
  onSignUp: (email: string, password: string) => Promise<{ error: any }>;
}

export function LoginScreen({ onSignIn, onSignUp }: LoginScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (isSignUp) {
      const { error } = await onSignUp(email, password);
      if (error) {
        setError(error.message);
      } else {
        setSuccess("Conta criada! Verifique seu email para confirmar.");
      }
    } else {
      const { error } = await onSignIn(email, password);
      if (error) {
        setError(
          error.message === "Invalid login credentials"
            ? "Email ou senha incorretos"
            : error.message
        );
      }
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-gray-950">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-900/30 overflow-hidden border-2 border-emerald-500/30">
            <img src="/icon-512.png" alt="MyFinance" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-bold text-gray-100">MyFinance</h1>
          <p className="text-gray-500 mt-1">Controle financeiro por voz</p>
        </div>

        {/* Feature highlights */}
        <div className="mb-8 space-y-2">
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <Mic className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>&quot;Gastei 50 no mercado&quot; — registra na hora</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-600"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-300">
              Senha
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-600"
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-950 border border-red-800 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm text-emerald-400 bg-emerald-950 border border-emerald-800 px-3 py-2 rounded-lg">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3"
          >
            {loading
              ? "Carregando..."
              : isSignUp
              ? "Criar conta"
              : "Entrar"}
          </button>
        </form>

        {/* Toggle sign in / sign up */}
        <p className="text-center text-sm text-gray-500 mt-6">
          {isSignUp ? "Já tem conta?" : "Não tem conta?"}{" "}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
              setSuccess("");
            }}
            className="text-emerald-400 font-medium hover:underline"
          >
            {isSignUp ? "Entrar" : "Criar conta"}
          </button>
        </p>
      </div>
    </main>
  );
}
