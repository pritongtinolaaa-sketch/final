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
  const [noticeText, setNoticeText] = useState('');
  const [isEditingNotice, setIsEditingNotice] = useState(false);

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

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${API}/admin/notice`, { headers })
      .then(res => setNoticeText(res.data?.message || ''))
      .catch(() => {});
  }, [token, headers]);

  const handleSaveNotice = async () => {
    try {
      await axios.post(`${API}/admin/notice`, { message: noticeText }, { headers });
      setIsEditingNotice(false);
      toast.success('Notice saved!');
    } catch {
      toast.error('Failed to save notice');
    }
  };

  const tierLabel = isMaster ? 'Master' : isPremium ? 'Premium' : 'Free';
  const greetingName = useMemo(() => {
    const raw = String(user?.label || '').trim();
    if (!raw) return 'User';
    return raw
      .toLowerCase()
      .replace(/\b\w/g, m => m.toUpperCase());
  }, [user?.label]);

  return (
    <div className="min-h-[calc(100vh-9rem)] bg-[#050505]">
      <div className="max-w-5xl mx-auto px-6 py-4 md:py-6">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-2xl p-6 md:p-8 bg-gradient-to-b from-white/10 to-white/[0.03] border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_8px_24px_rgba(0,0,0,0.6)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              <div className="flex flex-col">
                <h1 className="text-3xl sm:text-4xl font-sans font-semibold normal-case tracking-normal text-white">
                  Hi, <span className="text-primary">{greetingName}</span>!
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

              <div className="rounded-xl p-5 border border-primary/35 bg-gradient-to-b from-primary/12 to-white/[0.02] shadow-[0_0_20px_rgba(229,9,20,0.2),inset_0_1px_0_rgba(255,255,255,0.2)] h-full min-h-[250px] flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bebas tracking-widest text-primary text-2xl drop-shadow-[0_0_8px_rgba(229,9,20,0.35)]">
                    ADMIN NOTICE
                  </span>
                  {isMaster &&
                    (isEditingNotice ? (
                      <button
                        onClick={handleSaveNotice}
                        className="text-xs text-green-400 hover:text-green-300 font-mono"
                      >
                        SAVE
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsEditingNotice(true)}
                        className="text-xs text-white/30 hover:text-white/60 font-mono"
                      >
                        EDIT
                      </button>
                    ))}
                </div>

                {isMaster && isEditingNotice ? (
                  <textarea
                    value={noticeText}
                    onChange={e => setNoticeText(e.target.value)}
                    className="w-full flex-1 min-h-[170px] bg-black/80 border border-white/10 rounded-xl text-xs text-white/70 p-3 resize-none focus:border-primary focus:outline-none font-mono text-center"
                    placeholder="Type your notice here..."
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-white/75 text-sm font-mono whitespace-pre-wrap text-center leading-relaxed">
                      {noticeText || 'No notice posted.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mt-6 rounded-2xl p-5 md:p-6 bg-gradient-to-b from-white/10 to-white/[0.03] border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_24px_rgba(0,0,0,0.5)]"
        >
          <h2 className="font-bebas tracking-widest text-white text-2xl mb-3">
            HOW TO USE THE SITE
          </h2>
          <ol className="space-y-2 text-sm text-white/70 leading-relaxed list-decimal pl-5">
            <li>
              Open <span className="text-white">Cookie Checker</span> to paste or
              upload cookies and validate them.
            </li>
            <li>
              Review results and export valid cookies from the results section.
            </li>
            <li>
              Browse <span className="text-green-400">Free Cookies</span> and use
              favorites to save cookies you want quick access to.
            </li>
            <li>
              Premium and Master keys can also access{' '}
              <span className="text-purple-400">Admin Cookies</span>.
            </li>
            <li>
              Use the <span className="text-primary">Keys</span> page (Master only)
              to manage key names, tier, sessions, and expiry.
            </li>
          </ol>
        </motion.div>
      </div>
    </div>
  );
}
