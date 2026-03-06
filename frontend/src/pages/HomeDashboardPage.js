import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Cookie } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function HomeDashboardPage() {
  const { token, user } = useAuth();
  const [counts, setCounts] = useState({ free: 0, admin: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const isMaster = user?.is_master === true;
  const isPremium = user?.tier === 'premium' && !isMaster;
  const canAccessAdmin = isMaster || isPremium;

  useEffect(() => {
    if (!token || !user) return;

    const fetchCounts = async () => {
      setLoading(true);
      try {
        const freeReq = axios.get(`${API}/free-cookies`, {
          headers,
          params: { page: 1, page_size: 1, status: 'all', plan: '', country: '' },
        });
        const adminReq = canAccessAdmin
          ? axios.get(`${API}/admin/admin-cookies`, { headers })
          : Promise.resolve({ data: { cookies: [] } });

        const [freeRes, adminRes] = await Promise.all([freeReq, adminReq]);
        const freeCount = Number(
          freeRes.data?.total ?? freeRes.data?.cookies?.length ?? 0,
        );
        const adminCount = Array.isArray(adminRes.data?.cookies)
          ? adminRes.data.cookies.length
          : 0;

        setCounts({
          free: freeCount,
          admin: adminCount,
          total: freeCount + adminCount,
        });
      } catch {
        toast.error('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [token, user, headers, canAccessAdmin]);

  const tierLabel = isMaster ? 'Master' : isPremium ? 'Premium' : 'Free';

  return (
    <div className="min-h-[calc(100vh-9rem)] bg-[#050505]">
      <div className="max-w-5xl mx-auto px-6 py-4 md:py-6">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-2xl p-6 md:p-8 bg-gradient-to-b from-white/10 to-white/[0.03] border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_8px_24px_rgba(0,0,0,0.6)]">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-normal text-white">
              Hi, <span className="text-primary">{user?.label}</span>!
            </h1>

            <div className="mt-4 flex items-center gap-3">
              <span className="text-white/50 text-sm font-mono">Current tier:</span>
              {isMaster ? (
                <Badge className="text-[10px] font-mono bg-amber-300 text-amber-950 border border-yellow-100/90 shadow-[0_0_10px_rgba(251,191,36,0.55)]">
                  MASTER
                </Badge>
              ) : isPremium ? (
                <Badge className="text-[10px] font-mono bg-purple-600/35 text-purple-200 border border-purple-300/40">
                  PREMIUM
                </Badge>
              ) : (
                <Badge className="text-[10px] font-mono bg-white/10 text-white/50 border border-white/15">
                  FREE
                </Badge>
              )}
              <span className="text-xs text-white/30 font-mono">{tierLabel}</span>
            </div>

            <div className="mt-8 rounded-xl border border-green-500/20 bg-green-500/5 p-5">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <Cookie className="w-4 h-4" />
                <span className="text-xs font-mono uppercase tracking-wide">
                  Current number of all cookies
                </span>
              </div>
              <div className="font-bebas text-4xl tracking-wider text-white">
                {loading ? '...' : counts.total}
              </div>
              {!loading && (
                <p className="text-xs text-white/35 mt-1 font-mono">
                  Free: {counts.free} {canAccessAdmin ? `| Admin: ${counts.admin}` : ''}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
