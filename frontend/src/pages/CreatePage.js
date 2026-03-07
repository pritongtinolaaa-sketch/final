import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Shield, Loader2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import axios from 'axios';

const API_BASE = 'https://cookie-checker.preview.emergentagent.com';

export default function ClaimPage() {
  const [status, setStatus] = useState('claiming'); // claiming | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const { setToken } = useAuth(); // see note below
  const navigate = useNavigate();

  useEffect(() => {
    const claim = async () => {
      try {
        const { data } = await axios.post(
          `${API_BASE}/api/free-tier/claim`,
          {},
          { timeout: 15000, withCredentials: true }
        );
        setToken(data.token, data.user);
        setStatus('success');
        toast.success('30-minute trial access granted!');
        setTimeout(() => navigate('/'), 2000);
      } catch (err) {
        const msg =
          err.response?.data?.detail ||
          (err.code === 'ECONNABORTED' ? 'Request timed out.' : 'Unable to claim trial access.');
        setErrorMsg(msg);
        setStatus('error');
      }
    };

    claim();
  }, []);

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
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-md p-6 md:p-8 text-center space-y-4">
          <Shield className="w-9 h-9 text-primary mx-auto" />
          <h1 className="font-bebas text-4xl tracking-wider text-white">SCHIRO</h1>
          <p className="text-primary font-bebas text-lg tracking-widest">COOKIE CHECKER</p>

          {status === 'claiming' && (
            <>
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mt-4" />
              <p className="text-white/50 text-sm font-mono">Activating your trial...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <Clock className="w-8 h-8 text-green-400 mx-auto mt-4" />
              <p className="text-green-400 font-bebas text-2xl tracking-widest">ACCESS GRANTED</p>
              <p className="text-white/50 text-sm font-mono">
                You have 30 minutes of free access. Redirecting...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <p className="text-red-400 font-bebas text-2xl tracking-widest">ACCESS DENIED</p>
              <p className="text-white/50 text-sm font-mono">{errorMsg}</p>
              <Button
                onClick={() => navigate('/auth')}
                className="w-full h-12 bg-primary hover:bg-red-700 text-white font-bebas tracking-widest text-lg uppercase rounded-sm mt-2"
              >
                BACK TO LOGIN
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
