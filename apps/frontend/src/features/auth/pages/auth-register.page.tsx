import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister } from '@/features/auth/hooks/use-auth';
import { useState } from 'react';
import { Lock, Mail, User, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { registerSchema } from '@/features/auth/auth.schema';
import type { RegisterFormValues } from '@/features/auth/auth.schema';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/components/ui/card';

export default function AuthRegisterPage() {
  const registerMutation = useRegister();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormValues) => {
    setGeneralError(null);
    setSuccess(false);
    registerMutation.mutate(
      { email: data.email, password: data.password, fullName: data.fullName },
      {
        onSuccess: () => {
          setSuccess(true);
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        },
        onError: (err: any) => {
          const message = err.response?.data?.message || err.message || 'Registrasi gagal';
          setGeneralError(message);
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <Card className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border-slate-800 shadow-2xl relative z-10">
        <CardHeader className="text-center mb-2">
          <CardTitle className="text-3xl font-extrabold text-slate-100 tracking-tight">Screener Trade</CardTitle>
          <CardDescription className="text-sm text-slate-400 mt-2">
            Daftar akun baru untuk mulai memantau dan menganalisis saham.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Errors display */}
          {generalError && (
            <div className="mb-6 p-4 bg-red-950/40 border border-red-800/60 text-red-200 rounded-lg flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Success display */}
          {success && (
            <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 rounded-lg flex items-start gap-3 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Registrasi berhasil! Mengarahkan ke halaman login...</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name field */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  type="text"
                  placeholder="Nama Anda"
                  className={`pl-10 ${
                    errors.fullName ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-800 focus-visible:ring-indigo-500'
                  }`}
                  {...register('fullName')}
                />
              </div>
              {errors.fullName && <p className="text-xs text-red-400">{errors.fullName.message}</p>}
            </div>

            {/* Email field */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  type="email"
                  placeholder="nama@email.com"
                  className={`pl-10 ${
                    errors.email ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-800 focus-visible:ring-indigo-500'
                  }`}
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`pl-10 pr-10 ${
                    errors.password ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-800 focus-visible:ring-indigo-500'
                  }`}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={registerMutation.isPending || success}
              className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors shadow-lg shadow-indigo-950/50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {registerMutation.isPending ? 'Sedang mendaftar...' : 'Daftar'}
            </Button>
          </form>

          <div className="mt-8 text-center border-t border-slate-800 pt-6">
            <p className="text-sm text-slate-400">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Masuk
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
