'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, X, ArrowRight, CheckSquare, Square } from 'lucide-react';
// IMPORT THE NEW OTP COMPONENT
import OtpInput from 'react-otp-input';

export default function SignUpPage() {
  // --- STATE MANAGEMENT ---
  const [step, setStep] = useState<'form' | 'verify'>('form');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferredName, setPreferredName] = useState('');
  // OTP State
  const [otpCode, setOtpCode] = useState('');
  const [trustDevice, setTrustDevice] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  // Separate errors for form vs verification to keep UIs clean
  const [formError, setFormError] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const router = useRouter();

  const supabase = createClient();

  // --- PASSWORD LOGIC ---
  const getStrength = (pass: string) => {
    if (pass.length === 0) return 0;
    if (pass.length < 5) return 1;
    if (pass.length < 8) return 2;
    return 3;
  };
  const strength = getStrength(password);
  const strengthColor = ['bg-gray-200', 'bg-red-500', 'bg-amber-500', 'bg-green-500'];
  const strengthWidth = ['w-0', 'w-1/3', 'w-2/3', 'w-full'];

  // --- STEP 1: SIGN UP (SEND CODE) ---
  const handleSignUp = async () => {
    setFormError(null);
    setLoading(true);

    if (password.length < 8) {
      setFormError("Password is too weak.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { full_name: preferredName },
      },
    });

    if (error) {
      // IMPROVED DUPLICATE CHECKING
      if (error.message.toLowerCase().includes("already registered") || error.message.includes("duplicate")) {
        setFormError("This email is already registered.");
      } else {
        setFormError(error.message);
      }
      setLoading(false);
    } else {
      // SUCCESS: Swap to Verify Screen.
      setLoading(false);
      setOtpCode(''); // Reset code input just in case
      setStep('verify');
    }
  };

  // --- RESEND CODE LOGIC ---
  const handleResendCode = async () => {
    setResendLoading(true);
    setVerifyError(null);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    if (error) {
      setVerifyError(error.message);
    } else {
      alert("A new code has been sent to your email.");
    }
    setResendLoading(false);
  };

  // --- STEP 2: VERIFY CODE ---
  const handleVerify = async () => {
    setVerifyError(null);
    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: 'signup',
    });

    if (error) {
      setVerifyError("Invalid or expired code. Please try again.");
      setLoading(false);
    } else {
      // SUCCESS: Now they are verified and logged in.
      // Note: Actual 30-day persistence is complex to set client-side during verify, 
      // but standard Supabase login persists until signout by default.
      router.push('/dashboard');
    }
  };

  const handleGoogleLogin = async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      alert(`MISSING ENV VARS!\nURL: ${url ? 'OK' : 'MISSING'}\nKey: ${key ? 'OK' : 'MISSING'}\nPlease restart your dev server.`);
      return;
    }

    try {
      setLoadingGoogle(true);
      console.log('--- STARTING SIGNUP GOOGLE OAUTH ---');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline',
          }
        },
      });
      if (error) {
        console.error('OAuth Error:', error);
        alert(`Google Sign-In failed: ${error.message}`);
        setLoadingGoogle(false);
      }
    } catch (err: any) {
      console.error('Unexpected OAuth error:', err);
      alert(`Unexpected error: ${err.message || 'Check console'}`);
      setLoadingGoogle(false);
    }
  };

  // --- VIEW 1: THE SIGN UP FORM ---
  if (step === 'form') {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4">
        <Link
          href="/"
          className="fixed top-8 right-8 p-2 text-gray-400 hover:text-gray-600 transition-colors z-50 rounded-full hover:bg-gray-100"
        >
          <X className="h-6 w-6" />
        </Link>
        <div className="relative w-full max-w-md p-4 bg-transparent">

          <h1 className="text-3xl font-bold text-[#111] text-center mb-8 tracking-tight">Create an account</h1>

          <div className="space-y-4">
            <div>
              <label className="sr-only">Preferred name</label>
              <input type="text" placeholder="Preferred name (Optional)" value={preferredName} onChange={(e) => setPreferredName(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-0 transition-all outline-none text-gray-900 placeholder:text-gray-400 bg-white" />
            </div>
            <div>
              <label className="sr-only">Email</label>
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-0 transition-all outline-none text-gray-900 placeholder:text-gray-400 bg-white" />
            </div>
            <div className="relative">
              <label className="sr-only">Password</label>
              <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-0 transition-all outline-none text-gray-900 placeholder:text-gray-400 pr-12 bg-white" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="h-1 w-full bg-gray-100 rounded-full mt-3 overflow-hidden">
            <div className={`h-full transition-all duration-300 ease-out ${strengthColor[strength]} ${strengthWidth[strength]}`} />
          </div>
          <p className={`text-xs mt-2 mb-6 transition-colors ${password.length >= 8 ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
            Password must be at least 8 characters
          </p>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            By signing up, you agree to VSF Holdings <span className="font-bold cursor-pointer hover:underline">Terms of Use</span> and <span className="font-bold cursor-pointer hover:underline">Privacy Policy</span>.
          </p>

          {formError && (
            <div className="text-red-500 text-sm mb-4 text-center bg-red-50 p-3 rounded-lg border border-red-100 flex flex-col gap-1">
              <span>{formError}</span>
              {formError.includes("already registered") && (
                <Link href="/login" className="text-red-700 font-bold underline hover:text-red-800">
                  Log in here
                </Link>
              )}
            </div>
          )}

          <div className="space-y-3">
            <button onClick={handleSignUp} disabled={loading} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Processing...' : 'Create Account'}
            </button>
            <button
              onClick={handleGoogleLogin}
              disabled={loadingGoogle}
              className="w-full h-12 border border-gray-300 rounded-full flex items-center justify-center gap-2 font-bold text-gray-700 hover:bg-gray-50 transition-colors bg-white disabled:opacity-50"
            >
              {loadingGoogle ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                  Connecting...
                </span>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                  Continue with Google
                </>
              )}
            </button>
          </div>
          <div className="mt-8 text-center text-sm text-gray-600">
            Already have an account? <Link href="/login" className="font-bold text-gray-900 hover:underline">Log in here</Link>
          </div>

          {/* --- VISUAL DEBUGGER --- */}
        </div>
      </div>
    );
  }

  // --- VIEW 2: THE VERIFICATION SCREEN ---
  const isSubmitDisabled = loading || otpCode.length < 6;

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4">
      <Link
        href="/"
        className="fixed top-8 right-8 p-2 text-gray-400 hover:text-gray-600 transition-colors z-50 rounded-full hover:bg-gray-100"
      >
        <X className="h-6 w-6" />
      </Link>
      <div className="relative w-full max-w-md p-4 bg-transparent">

        {/* Header */}
        <h1 className="text-3xl font-bold text-[#111] text-center mb-4 tracking-tight">
          We sent you a code
        </h1>

        <p className="text-center text-gray-600 mb-8 text-sm">
          Enter the 6-digit code sent to <br />
          <span className="font-semibold text-gray-900">{email}</span>
        </p>

        {/* THE NEW 6-BOX OTP INPUT */}
        <div className="mb-8 flex justify-center">
          <OtpInput
            value={otpCode}
            onChange={setOtpCode}
            numInputs={6}
            shouldAutoFocus={true}
            renderInput={(props) => <input {...props} />}
            containerStyle={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'center'
            }}
            inputStyle={{
              width: '48px',
              height: '56px',
              fontSize: '24px',
              fontWeight: 'bold',
              borderRadius: '12px',
              border: '1px solid #e5e7eb', // gray-200
              textAlign: 'center',
              color: '#111827', // gray-900
              outline: 'none',
              transition: 'all 0.2s',
              backgroundColor: '#fff'
            }}

          />
        </div>

        {/* Trust Device Checkbox (Functional State) */}
        <button
          onClick={() => setTrustDevice(!trustDevice)}
          className="flex items-center gap-3 mb-8 mx-auto group"
        >
          {trustDevice ? (
            <CheckSquare className="h-6 w-6 text-blue-600" />
          ) : (
            <Square className="h-6 w-6 text-gray-300 group-hover:text-gray-400 transition-colors" />
          )}
          <span className={`text-sm select-none ${trustDevice ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
            I trust this device for 30 days
          </span>
        </button>

        {/* Verification Error */}
        {verifyError && (
          <div className="text-red-500 text-sm mb-6 text-center bg-red-50 p-2 rounded-lg border border-red-100">
            {verifyError}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleResendCode}
            disabled={resendLoading}
            className="flex-1 h-12 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {resendLoading ? 'Sending...' : 'Resend Code'}
          </button>

          {/* VSF BLUE SUBMIT BUTTON */}
          <button
            onClick={handleVerify}
            disabled={isSubmitDisabled}
            className={`flex-1 h-12 font-bold rounded-xl transition-all active:scale-95 ${isSubmitDisabled
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
              }`}
          >
            {loading ? 'Verifying...' : 'Submit'}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600 leading-snug">
            Wrong email?{' '}
            <button onClick={() => setStep('form')} className="text-sm font-bold text-blue-600 hover:underline inline-block">
              Go back
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
