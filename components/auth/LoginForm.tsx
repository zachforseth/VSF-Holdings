'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { X, ArrowLeft } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { login } from '@/app/login/actions'

export default function LoginForm() {
    const router = useRouter()
    const [step, setStep] = useState<'email' | 'password'>('email')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [loadingGoogle, setLoadingGoogle] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const supabase = createClient()

    const handleGoogleLogin = async () => {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!url || !key) {
            alert(`MISSING ENV VARS!\nURL: ${url ? 'OK' : 'MISSING'}\nKey: ${key ? 'OK' : 'MISSING'}\nPlease restart your dev server.`);
            return;
        }

        try {
            setLoadingGoogle(true)
            console.log('--- STARTING GOOGLE OAUTH ---')
            console.log('Redirect URI:', `${window.location.origin}/auth/callback`)

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        prompt: 'select_account',
                        access_type: 'offline',
                    }
                },
            })
            if (error) {
                console.error('OAuth Error:', error)
                alert(`Google Sign-In failed: ${error.message}`)
                setLoadingGoogle(false)
            }
        } catch (err: any) {
            console.error('Unexpected OAuth error:', err)
            alert(`Unexpected error: ${err.message || 'Check console'}`)
            setLoadingGoogle(false)
        }
    }

    const handleContinue = (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) {
            setError('Please enter your email')
            return
        }
        setError(null)
        setStep('password')
    }

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData()
        formData.append('email', email)
        formData.append('password', password)

        try {
            const result = await login(formData)

            // If we get a result back, it means there was an error (success redirects)
            if (result && result.error) {
                setError(result.error)
                setLoading(false)
            }
        } catch (err: any) {
            if (err?.message?.includes('NEXT_REDIRECT') || err?.digest?.startsWith('NEXT_REDIRECT')) {
                throw err;
            }
            setError('An unexpected error occurred.')
            setLoading(false)
        }
    }

    return (
        <div className="bg-white p-8 md:p-12 w-full max-w-[480px] relative">
            <Link
                href="/"
                className="fixed top-8 right-8 p-2 text-gray-400 hover:text-gray-600 transition-colors z-50 rounded-full hover:bg-gray-100"
            >
                <X className="w-6 h-6" />
            </Link>

            <div className="text-center mb-10 pt-4">
                <h1 className="text-3xl font-bold text-[#111] font-manrope mb-2 tracking-tight">
                    Sign into your account
                </h1>
                <p className="text-gray-500 text-[15px] leading-relaxed max-w-sm mx-auto">
                    Enter your email address to get started.
                </p>
            </div>

            <div className="space-y-6">
                {step === 'email' ? (
                    <form onSubmit={handleContinue} className="space-y-6">
                        <div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email address"
                                className="w-full h-14 px-4 rounded-xl border border-gray-300 focus:border-blue-600 focus:ring-0 transition-all outline-none text-gray-900 placeholder:text-gray-500 text-[15px] bg-transparent"
                                autoFocus
                                required
                            />
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm font-medium text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full h-14 bg-gray-100 hover:bg-gray-200 text-[#111] font-semibold rounded-full transition-colors text-[15px] border border-transparent shadow-sm"
                        >
                            Continue
                        </button>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loadingGoogle}
                            className="w-full h-14 border border-gray-300 rounded-full flex items-center justify-center gap-2 font-bold text-gray-700 hover:bg-gray-50 transition-colors bg-white mt-4 disabled:opacity-50"
                        >
                            {loadingGoogle ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                                    Connecting to Google...
                                </span>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                                    Continue with Google
                                </>
                            )}
                        </button>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm uppercase tracking-wide">OR</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        <Link href="/signup" className="block w-full">
                            <button
                                type="button"
                                className="w-full h-14 bg-[#4170E8] hover:bg-[#365zbD] text-white font-semibold rounded-full transition-colors text-[15px] shadow-sm hover:shadow-md"
                            >
                                Create Account
                            </button>
                        </Link>
                    </form>
                ) : (
                    <form onSubmit={handleSignIn} className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <button
                                type="button"
                                onClick={() => setStep('email')}
                                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-medium text-gray-900">{email}</span>
                        </div>

                        <div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full h-14 px-4 rounded-xl border border-gray-300 focus:border-blue-600 focus:ring-0 transition-all outline-none text-gray-900 placeholder:text-gray-500 text-[15px] bg-transparent"
                                autoFocus
                                required
                            />
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm font-medium text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-[#111] hover:bg-black text-white font-semibold rounded-full transition-colors text-[15px] shadow-lg disabled:opacity-70"
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
