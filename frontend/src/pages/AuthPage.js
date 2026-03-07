import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Shield, Key, Loader2, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

const LINKVERTISE_URL = 'https://link-hub.net/4075828/ngOtBP408Mcl';

export default function AuthPage() {
  const [accessKey, setAccessKey] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accessKey.trim()) return;
    setSubmitting(true);
    try {
      await login(accessKey);
      toast.success('Access granted');
      navigate('/');
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        toast.error('Login timed out. Please try again.');
      } else if (!err.response) {
        toast.error('Cannot reach server. Check backend URL/network.');
      } else {
        toast.error(err.response?.data?.detail || 'Login failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrialAccess = () => {
    sessionStorage.setItem('trial_from_ad', '1');
    window.location.href = LINKVERTISE_URL;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#050505] overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(229,9,20,0.06) 0%, transparent 60%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-md p-6 md:p-8">
          <div className="text-center mb-5">
            <Shield className="w-9 h-9 text-primary mx-auto mb-2" />
            <h1
              className="font-bebas text-4xl sm:text-5xl tracking-wider text-white"
              data-testid="auth-title"
            >
              SCHIRO
            </h1>
            <p className="text-primary font-bebas text-lg tracking-widest mt-1">
              COOKIE CHECKER
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="auth-form">
            <div className="relative">
              <Key className="absolute left-3 top-3.5 h-4 w-4 text-white/30" />
              <Input
                data-testid="auth-key-input"
                type="password"
                placeholder="Enter access key"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                required
                autoComplete="off"
                className="pl-10 bg-black/50 border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/50 text-white placeholder:text-white/30 rounded-sm h-12 font-mono"
              />
            </div>

            <Button
              type="submit"
              data-testid="auth-submit-btn"
              disabled={submitting || !accessKey.trim()}
              className="w-full h-12 bg-primary hover:bg-red-700 text-white font-bebas tracking-widest text-lg uppercase rounded-sm shadow-[0_0_15px_rgba(229,9,20,0.4)] transition-all hover:scale-[1.02] active:scale-95"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ACCESS'}
            </Button>

            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/20 text-xs font-mono">OR</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <Button
              type="button"
              data-testid="auth-trial-btn"
              disabled={submitting}
              onClick={handleTrialAccess}
              className="w-full h-12 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bebas tracking-widest text-lg uppercase rounded-sm transition-all hover:scale-[1.02] active:scale-95"
            >
              <Gift className="w-5 h-5 mr-2" />
              GET 30-MIN FREE ACCESS
            </Button>
          </form>

          <p className="text-center text-white/20 text-xs mt-5">
            Access keys are provided by the administrator
          </p>
        </div>
      </motion.div>
    </div>
  );
}
