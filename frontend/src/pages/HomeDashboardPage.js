import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Cookie } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const DEFAULT_GUIDE = {
  pc: 'Open Cookie Checker and paste/upload cookies, then review results.',
  mobile: 'Use your phone browser to open saved token links and sign in quickly.',
  tv: 'Open a cookie card, use TV sign-in code, then activate from the site.',
};

export default function HomeDashboardPage() {
  const { token, user } = useAuth();
  const [counts, setCounts] = useState({ free: 0, admin: 0, total: 0 });
  const [grandTotal, setGrandTotal] = useState({ free: 0, admin: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [noticeText, setNoticeText] = useState('');
  const [isEditingNotice, setIsEditingNotice] = useState(false);
  const [guide, setGuide] = useState(DEFAULT_GUIDE);
  const [isEditingGuide, setIsEditingGuide] = useState(false);

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

        const grandTotalReq = axios.get(`${API}/cookies/total-count`, { headers });

        const [freeRes, adminRes, grandTotalRes] = await Promise.all([
          freeReq,
          adminReq,
          grandTotalReq,
        ]);

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

        setGrandTotal({
          free: grandTotalRes.data?.free ?? 0,
          admin: grandTotalRes.data?.admin ?? 0,
          total: grandTotalRes.data?.total ?? 0,
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

  useEffect(() => {
    if (!token) return;

    axios
      .get(`${API}/admin/guide`, { headers })
      .then(res =>
        setGuide({
          pc: res.data?.pc || DEFAULT_GUIDE.pc,
          mobile: res.data?.mobile || DEFAULT_GUIDE.mobile,
          tv: res.data?.tv || DEFAULT_GUIDE.tv,
        }),
      )
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

  const handleSaveGuide = async () => {
    try {
      const payload = {
        pc: String(guide.pc || '').trim(),
        mobile: String(guide.mobile || '').trim(),
        tv: String(guide.tv || '').trim(),
      };

      await axios.post(`${API}/admin/guide`, payload, { headers });

      setGuide({
        pc: payload.pc || DEFAULT_GUIDE.pc,
        mobile: payload.mobile || DEFAULT_GUIDE.mobile,
        tv: payload.tv || DEFAULT_GUIDE.tv,
      });

      setIsEditingGuide(false);
      toast.success('Guide updated');
    } catch {
      toast.error('Failed to update guide');
    }
  };

  const tierLabel = isMaster ? 'Master' : isPremium ? 'Premium' : 'Free';

  const greetingName = useMemo(() => {
    const raw = String(user?.label || '').trim();
    if (!raw) return 'User';

    return raw.toLowerCase().replace(/\b\w/g, m => m.toUpperCase());
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
                    <div className="relative inline-flex items-center justify-center">
                      <Badge className="relative overflow-hidden text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-300 text-amber-950 border border-yellow-100/90 ring-1 ring-amber-200/60 shadow-[0_0_14px_rgba(251,191,36,0.9),0_0_26px_rgba(245,158,11,0.55),inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_1px_rgba(146,64,14,0.35)]">
                        <span className="relative z-10">MASTER</span>

                        <motion.span
                          className="pointer-events-none absolute inset-y-0 left-[-35%] w-[38%] z-0 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/90 to-transparent"
                          animate={{ x: ['0%', '320%'] }}
                          transition={{
                            duration: 2.4,
                            repeat: Infinity,
                            repeatDelay: 1.3,
                            ease: 'easeInOut',
                          }}
                        />
                      </Badge>

                      <motion.span
                        className="pointer-events-none absolute -top-1 left-[18%] h-1 w-1 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.95)]"
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0.5, 1.6, 0.5],
                          y: [0, -3, 0],
                        }}
                        transition={{
                          duration: 1.8,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: 0,
                        }}
                      />

                      <motion.span
                        className="pointer-events-none absolute top-1/2 -right-1 h-1.5 w-1.5 rounded-full bg-yellow-50 shadow-[0_0_10px_rgba(255,248,200,1)]"
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0.4, 1.8, 0.4],
                          x: [0, 2, 0],
                          y: [0, -2, 0],
                        }}
                        transition={{
                          duration: 2.2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: 0.6,
                        }}
                      />

                      <motion.span
                        className="pointer-events-none absolute -bottom-0.5 right-[22%] h-1 w-1 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.95)]"
                        animate={{
                          opacity: [0, 0.9, 0],
                          scale: [0.5, 1.4, 0.5],
                          y: [0, 2, 0],
                        }}
                        transition={{
                          duration: 1.9,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: 1.1,
                        }}
                      />

                      <motion.span
                        className="pointer-events-none absolute -top-1.5 right-[30%] text-[8px] leading-none text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.95)]"
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0.7, 1.15, 0.7],
                          rotate: [0, 25, 0],
                        }}
                        transition={{
                          duration: 2.1,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: 1.5,
                        }}
                      >
                        ✦
                      </motion.span>
                    </div>
                  ) : isPremium ? (
                    <Badge className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600/35 via-violet-500/30 to-purple-600/35 text-purple-200 border border-purple-300/40 ring-1 ring-purple-400/25 shadow-[0_0_8px_rgba(168,85,247,0.35),inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_1px_rgba(46,16,101,0.3)]">
                      PREMIUM
                    </Badge>
                  ) : (
                    <Badge className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-white/10 text-white/40 border border-white/10">
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
                    <>
                      <p className="text-xs text-white/35 mt-1 font-mono">
                        Free: {counts.free}
                        {canAccessAdmin ? ` | Admin: ${counts.admin}` : ''}
                      </p>

                      {!canAccessAdmin && (
                        <div className="mt-3 pt-3 border-t border-white/10 space-y-1">
                          <p className="text-xs font-mono text-white/40">
                            Free tier cookies: <span className="text-green-400">30</span>
                          </p>
                          <p className="text-xs font-mono text-white/40">
                            Premium Tier cookies:{' '}
                            <span className="text-purple-400">{grandTotal.total}</span>
                          </p>
                        </div>
                      )}
                    </>
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bebas tracking-widest text-white text-2xl">
              HOW TO USE THE SITE
            </h2>

            {isMaster &&
              (isEditingGuide ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveGuide}
                    className="text-xs text-green-400 hover:text-green-300 font-mono"
                  >
                    SAVE
                  </button>
                  <button
                    onClick={() => setIsEditingGuide(false)}
                    className="text-xs text-white/30 hover:text-white/60 font-mono"
                  >
                    CANCEL
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingGuide(true)}
                  className="text-xs text-white/30 hover:text-white/60 font-mono"
                >
                  EDIT
                </button>
              ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { key: 'pc', title: 'PC' },
              { key: 'mobile', title: 'MOBILE' },
              { key: 'tv', title: 'TV' },
            ].map(item => (
              <div
                key={item.key}
                className="rounded-xl border border-white/15 bg-black/30 p-4 min-h-[140px]"
              >
                <h3 className="font-bebas tracking-widest text-primary text-xl mb-2">
                  {item.title}
                </h3>

                {isMaster && isEditingGuide ? (
                  <textarea
                    value={guide[item.key]}
                    onChange={e =>
                      setGuide(prev => ({ ...prev, [item.key]: e.target.value }))
                    }
                    className="w-full h-24 bg-black/70 border border-white/10 rounded-lg text-xs text-white/70 p-2 resize-none focus:border-primary focus:outline-none font-mono"
                  />
                ) : (
                  <p className="text-white/70 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                    {guide[item.key]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
