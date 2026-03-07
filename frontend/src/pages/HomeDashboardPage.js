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

function TierBadge({ label, theme = 'master' }) {
  const isMaster = theme === 'master';

  const badgeClass = isMaster
    ? 'border-yellow-100/90 bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-300 text-amber-950 ring-amber-200/60 shadow-[0_0_14px_rgba(251,191,36,0.9),0_0_26px_rgba(245,158,11,0.55),inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_1px_rgba(146,64,14,0.35)]'
    : 'border-purple-300/40 bg-gradient-to-r from-purple-600/35 via-violet-500/30 to-purple-600/35 text-purple-200 ring-purple-400/25 shadow-[0_0_8px_rgba(168,85,247,0.35),inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_1px_rgba(46,16,101,0.3)]';

  const shineClass = isMaster
    ? 'from-transparent via-white/80 to-transparent'
    : 'from-transparent via-white/70 to-transparent';

  const sparkleLeftClass = isMaster
    ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.98)]'
    : 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]';

  const sparkleTopClass = isMaster
    ? 'text-yellow-50 drop-shadow-[0_0_8px_rgba(255,248,200,1)]'
    : 'text-violet-100 drop-shadow-[0_0_8px_rgba(200,170,255,1)]';

  const sparkleRightClass = isMaster
    ? 'text-yellow-100 drop-shadow-[0_0_10px_rgba(255,248,200,1)]'
    : 'text-purple-200 drop-shadow-[0_0_10px_rgba(168,85,247,0.9)]';

  const sparkleBottomClass = isMaster
    ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.98)]'
    : 'text-violet-100 drop-shadow-[0_0_8px_rgba(216,180,255,0.95)]';

  const orbitOneClass = isMaster
    ? 'bg-amber-100/90 shadow-[0_0_10px_rgba(255,235,160,0.95)]'
    : 'bg-purple-200/90 shadow-[0_0_10px_rgba(168,85,247,0.9)]';

  const orbitTwoClass = isMaster
    ? 'bg-yellow-50/95 shadow-[0_0_8px_rgba(255,245,190,1)]'
    : 'bg-violet-200/95 shadow-[0_0_8px_rgba(200,170,255,1)]';

  const orbitThreeClass = isMaster
    ? 'bg-amber-200/90 shadow-[0_0_8px_rgba(255,220,120,0.95)]'
    : 'bg-fuchsia-200/90 shadow-[0_0_8px_rgba(232,180,255,0.95)]';

  return (
    <div className="relative inline-flex items-center justify-center overflow-visible">
      <div className="relative inline-flex items-center justify-center overflow-visible px-3 py-2">
        <Badge
          className={`relative z-10 overflow-hidden rounded-full border px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider ring-1 ${badgeClass}`}
        >
          <span className="relative z-10">{label}</span>

          <motion.span
            className={`pointer-events-none absolute inset-y-0 left-[-38%] z-0 w-[36%] skew-x-[-20deg] bg-gradient-to-r ${shineClass}`}
            animate={{ x: ['0%', '340%'] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatDelay: 1.2,
              ease: 'easeInOut',
            }}
          />
        </Badge>

        <motion.span
          className={`pointer-events-none absolute left-[-10px] top-1/2 z-20 text-[10px] leading-none ${sparkleLeftClass}`}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.65, 1.15, 0.65],
            x: [0, -1, 0],
            y: [-1, -5, -1],
            rotate: [0, -10, 0],
          }}
          transition={{
            duration: 1.9,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.1,
          }}
        >
          ✦
        </motion.span>

        <motion.span
          className={`pointer-events-none absolute left-[18%] top-[-6px] z-20 text-[9px] leading-none ${sparkleTopClass}`}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.7, 1.1, 0.7],
            y: [0, -4, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.35,
          }}
        >
          ✦
        </motion.span>

        <motion.span
          className={`pointer-events-none absolute right-[-10px] top-1/2 z-20 text-[11px] leading-none ${sparkleRightClass}`}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.65, 1.25, 0.65],
            x: [0, 2, 0],
            y: [0, -3, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 2.1,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.8,
          }}
        >
          ✦
        </motion.span>

        <motion.span
          className={`pointer-events-none absolute bottom-[-4px] right-[22%] z-20 text-[9px] leading-none ${sparkleBottomClass}`}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.7, 1.1, 0.7],
            y: [0, 3, 0],
            rotate: [0, 8, 0],
          }}
          transition={{
            duration: 1.9,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1.25,
          }}
        >
          ✦
        </motion.span>

        <motion.span
          className={`pointer-events-none absolute z-0 h-1.5 w-1.5 rounded-full ${orbitOneClass}`}
          animate={{
            x: [-18, -5, 10, 18, 8, -10, -18],
            y: [0, -10, -12, 0, 10, 8, 0],
            opacity: [0.2, 0.8, 0.95, 0.6, 0.9, 0.5, 0.2],
            scale: [0.75, 1, 1.15, 0.95, 1.1, 0.9, 0.75],
          }}
          transition={{
            duration: 5.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        <motion.span
          className={`pointer-events-none absolute z-0 h-1 w-1 rounded-full ${orbitTwoClass}`}
          animate={{
            x: [16, 4, -10, -18, -8, 12, 16],
            y: [0, 10, 12, 0, -10, -8, 0],
            opacity: [0.2, 0.65, 0.9, 0.55, 0.85, 0.45, 0.2],
            scale: [0.7, 0.95, 1.1, 0.9, 1.05, 0.85, 0.7],
          }}
          transition={{
            duration: 4.8,
            repeat: Infinity,
            ease: 'linear',
            delay: 0.9,
          }}
        />

        <motion.span
          className={`pointer-events-none absolute z-0 h-1 w-1 rounded-full ${orbitThreeClass}`}
          animate={{
            x: [-4, 12, 18, 4, -14, -18, -4],
            y: [-12, -8, 0, 10, 12, 0, -12],
            opacity: [0.15, 0.55, 0.85, 0.55, 0.9, 0.45, 0.15],
            scale: [0.65, 0.9, 1.05, 0.9, 1.05, 0.85, 0.65],
          }}
          transition={{
            duration: 6.2,
            repeat: Infinity,
            ease: 'linear',
            delay: 1.6,
          }}
        />
      </div>
    </div>
  );
}

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
      <div className="mx-auto max-w-5xl px-6 py-4 md:py-6">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-2xl border border-white/20 bg-gradient-to-b from-white/10 to-white/[0.03] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_8px_24px_rgba(0,0,0,0.6)] md:p-8">
            <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2">
              <div className="flex flex-col">
                <h1 className="text-3xl font-sans font-semibold normal-case tracking-normal text-white sm:text-4xl">
                  Hi, <span className="text-primary">{greetingName}</span>!
                </h1>

                <div className="mt-4 flex items-center gap-3">
                  <span className="text-sm font-mono text-white/50">Current tier:</span>

                  {isMaster ? (
                    <TierBadge label="MASTER" theme="master" />
                  ) : isPremium ? (
                    <TierBadge label="PREMIUM" theme="premium" />
                  ) : (
                    <Badge className="rounded-sm border border-white/10 bg-white/10 px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider text-white/40">
                      FREE
                    </Badge>
                  )}

                  <span className="text-xs font-mono text-white/30">{tierLabel}</span>
                </div>

                <div className="mt-8 rounded-xl border border-green-500/20 bg-green-500/5 p-5">
                  <div className="mb-2 flex items-center gap-2 text-green-400">
                    <Cookie className="h-4 w-4" />
                    <span className="text-xs font-mono uppercase tracking-wide">
                      Current number of all cookies
                    </span>
                  </div>

                  <div className="font-bebas text-4xl tracking-wider text-white">
                    {loading ? '...' : counts.total}
                  </div>

                  {!loading && (
                    <>
                      <p className="mt-1 text-xs font-mono text-white/35">
                        Free: {counts.free}
                        {canAccessAdmin ? ` | Admin: ${counts.admin}` : ''}
                      </p>

                      {!canAccessAdmin && (
                        <div className="mt-3 space-y-1 border-t border-white/10 pt-3">
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

              <div className="flex h-full min-h-[250px] flex-col rounded-xl border border-primary/35 bg-gradient-to-b from-primary/12 to-white/[0.02] p-5 shadow-[0_0_20px_rgba(229,9,20,0.2),inset_0_1px_0_rgba(255,255,255,0.2)]">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-bebas text-2xl tracking-widest text-primary drop-shadow-[0_0_8px_rgba(229,9,20,0.35)]">
                    ADMIN NOTICE
                  </span>

                  {isMaster &&
                    (isEditingNotice ? (
                      <button
                        onClick={handleSaveNotice}
                        className="text-xs font-mono text-green-400 hover:text-green-300"
                      >
                        SAVE
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsEditingNotice(true)}
                        className="text-xs font-mono text-white/30 hover:text-white/60"
                      >
                        EDIT
                      </button>
                    ))}
                </div>

                {isMaster && isEditingNotice ? (
                  <textarea
                    value={noticeText}
                    onChange={e => setNoticeText(e.target.value)}
                    className="min-h-[170px] w-full flex-1 resize-none rounded-xl border border-white/10 bg-black/80 p-3 text-center text-xs font-mono text-white/70 outline-none focus:border-primary"
                    placeholder="Type your notice here..."
                  />
                ) : (
                  <div className="flex flex-1 items-center justify-center">
                    <p className="whitespace-pre-wrap text-center text-sm font-mono leading-relaxed text-white/75">
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
          className="mt-6 rounded-2xl border border-white/15 bg-gradient-to-b from-white/10 to-white/[0.03] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_24px_rgba(0,0,0,0.5)] md:p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bebas text-2xl tracking-widest text-white">
              HOW TO USE THE SITE
            </h2>

            {isMaster &&
              (isEditingGuide ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveGuide}
                    className="text-xs font-mono text-green-400 hover:text-green-300"
                  >
                    SAVE
                  </button>
                  <button
                    onClick={() => setIsEditingGuide(false)}
                    className="text-xs font-mono text-white/30 hover:text-white/60"
                  >
                    CANCEL
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingGuide(true)}
                  className="text-xs font-mono text-white/30 hover:text-white/60"
                >
                  EDIT
                </button>
              ))}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { key: 'pc', title: 'PC' },
              { key: 'mobile', title: 'MOBILE' },
              { key: 'tv', title: 'TV' },
            ].map(item => (
              <div
                key={item.key}
                className="min-h-[140px] rounded-xl border border-white/15 bg-black/30 p-4"
              >
                <h3 className="mb-2 font-bebas text-xl tracking-widest text-primary">
                  {item.title}
                </h3>

                {isMaster && isEditingGuide ? (
                  <textarea
                    value={guide[item.key]}
                    onChange={e =>
                      setGuide(prev => ({ ...prev, [item.key]: e.target.value }))
                    }
                    className="h-24 w-full resize-none rounded-lg border border-white/10 bg-black/70 p-2 text-xs font-mono text-white/70 outline-none focus:border-primary"
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-xs font-mono leading-relaxed text-white/70">
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
