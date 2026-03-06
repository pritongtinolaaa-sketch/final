import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Gift, Trash2, Copy, Check, Loader2, Mail, CreditCard, Globe, Calendar,
  Clock, Users, Key, Link2, Settings, RefreshCw, Tv, Monitor, Smartphone, X, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function CopyBtn({ text, testId }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    toast.success('Copied');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} data-testid={testId} className="p-1.5 rounded bg-white/5 hover:bg-white/10 transition-colors">
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-white/40" />}
    </button>
  );
}

function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3">
      <span className="text-white/20">{icon}</span>
      <span className="text-white/40 text-xs uppercase tracking-wide w-24 shrink-0">{label}</span>
      <span className="text-white/90 text-sm font-medium truncate">{value}</span>
    </div>
  );
}

function FilterBar({ filters, setFilters, planOptions, countryOptions }) {
  const statuses = ['all', 'alive', 'dead'];

  const selectClass = "bg-black/50 border border-white/10 text-white/60 text-xs rounded-lg px-3 h-8 outline-none focus:border-green-500/40 cursor-pointer hover:border-white/20 transition-colors";

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
      <div className="flex items-center gap-1.5 text-white/20 mr-1">
        <Filter className="w-3.5 h-3.5" />
        <span className="text-xs font-mono uppercase tracking-wide">Filter</span>
      </div>
      <div className="flex items-center gap-1">
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setFilters(f => ({ ...f, status: s }))}
            className={`px-3 h-8 rounded-lg text-xs font-mono uppercase tracking-wide transition-all border ${
              filters.status === s
                ? s === 'alive'
                  ? 'bg-green-500/20 text-green-400 border-green-500/40'
                  : s === 'dead'
                  ? 'bg-red-500/20 text-red-400 border-red-500/40'
                  : 'bg-white/10 text-white/70 border-white/20'
                : 'bg-transparent text-white/25 border-white/8 hover:border-white/15 hover:text-white/40'
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <select
        value={filters.plan}
        onChange={e => setFilters(f => ({ ...f, plan: e.target.value }))}
        className={selectClass}
      >
        {planOptions.map(p => (
          <option key={p} value={p} className="bg-[#111]">{p === 'all' ? 'All Plans' : p}</option>
        ))}
      </select>
      <select
        value={filters.country}
        onChange={e => setFilters(f => ({ ...f, country: e.target.value }))}
        className={selectClass}
      >
        {countryOptions.map(c => (
          <option key={c} value={c} className="bg-[#111]">{c === 'all' ? 'All Countries' : c}</option>
        ))}
      </select>
      {(filters.status !== 'all' || filters.plan !== 'all' || filters.country !== 'all') && (
        <button
          onClick={() => setFilters({ status: 'all', plan: 'all', country: 'all' })}
          className="px-3 h-8 rounded-lg text-xs font-mono uppercase tracking-wide text-white/25 border border-white/8 hover:text-red-400 hover:border-red-500/30 transition-all"
        >
          Reset
        </button>
      )}
    </div>
  );
}

function FreeCookieSmallCard({ cookie, globalIndex, isAdmin, onDelete, onClick }) {
  const isAlive = cookie.is_alive !== false;
  return (
    <motion.div
      data-testid={`free-cookie-card-${globalIndex}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (globalIndex % 20) * 0.04 }}
      onClick={onClick}
      className={`group cursor-pointer rounded-xl p-4 transition-all duration-150
        bg-gradient-to-b from-white/10 to-white/[0.03]
        border border-white/20
        shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.4),0_8px_24px_rgba(0,0,0,0.6)]
        hover:from-white/[0.13] hover:to-white/[0.05]
        hover:border-green-500/40
        hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.5),0_12px_32px_rgba(0,0,0,0.7)]
        active:scale-[0.97]`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full shrink-0 ${isAlive ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]' : 'bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.5)]'}`} />
          <span className="font-mono text-xs text-white/30">#{globalIndex + 1}</span>
        </div>

        <Badge className={`${isAlive ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'} border text-[10px] font-mono px-1.5 py-0`}>
          {isAlive ? 'ALIVE' : 'DEAD'}
        </Badge>

        {isAdmin && (
          <button
            onClick={e => { e.stopPropagation(); onDelete(cookie.id); }}
            className="text-white/15 hover:text-red-400 transition-colors p-1"
            data-testid={`delete-free-cookie-${globalIndex}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-1.5">
        <Mail className="w-3.5 h-3.5 text-white/20 shrink-0" />
        <span className="text-white/70 text-xs font-mono truncate">{cookie.email || '—'}</span>
      </div>
      <div className="flex items-center gap-2 mb-1.5">
        <CreditCard className="w-3.5 h-3.5 text-white/20 shrink-0" />
        <span className="text-white/40 text-xs">{cookie.plan || '—'}</span>
      </div>
      <div className="flex items-center gap-2">
        <Globe className="w-3.5 h-3.5 text-white/20 shrink-0" />
        <span className="text-white/40 text-xs">{cookie.country || '—'}</span>
      </div>
      <div className="mt-3 pt-2 border-t border-white/5 text-[10px] font-mono text-center tracking-widest text-white/15 group-hover:text-green-400 transition-colors duration-200">
        TAP TO USE
      </div>
    </motion.div>
  );
}

function FreeCookieModal({ cookie, globalIndex, isAdmin, onClose }) {
  const [tvCode, setTvCode] = useState('');
  const [tvLoading, setTvLoading] = useState(false);
  const [tvResult, setTvResult] = useState(null);
  const [tokenRefreshing, setTokenRefreshing] = useState(false);
  const [currentNftoken, setCurrentNftoken] = useState(cookie.nftoken);
  const [currentNftokenLink, setCurrentNftokenLink] = useState(cookie.nftoken_link);
  const [lastRefreshed, setLastRefreshed] = useState(cookie.last_refreshed);
  const [showCookie, setShowCookie] = useState(false);
  const [showBrowserCookies, setShowBrowserCookies] = useState(false);
  const { token } = useAuth();
  const isAlive = cookie.is_alive !== false;

  const handleTvCode = async () => {
    if (!tvCode.trim()) { toast.error('Enter the code from your TV'); return; }
    setTvLoading(true);
    setTvResult(null);
    try {
      const res = await axios.post(`${API}/tv-code`, { code: tvCode, cookie_id: cookie.id }, { headers: { Authorization: `Bearer ${token}` } });
      setTvResult(res.data);
      if (res.data.success) toast.success(res.data.message);
      else toast.error(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to activate TV');
    } finally {
      setTvLoading(false);
    }
  };

  const handleRefreshToken = async () => {
    setTokenRefreshing(true);
    try {
      const res = await axios.post(`${API}/free-cookies/${cookie.id}/refresh-token`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setCurrentNftoken(res.data.nftoken);
      setCurrentNftokenLink(res.data.nftoken_link);
      setLastRefreshed(new Date().toISOString());
      toast.success('Token refreshed!');
    } catch {
      toast.error('Failed to refresh token');
    } finally {
      setTokenRefreshing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-40 flex items-center justify-center pt-16">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative w-[calc(100vw-2rem)] sm:w-[500px] max-h-[85vh] bg-[#0a0a0a] border border-white/10 rounded-2xl z-10 flex flex-col overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_24px_48px_rgba(0,0,0,0.8)]"
        >
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${isAlive ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]' : 'bg-red-400'}`} />
              <span className="font-mono text-xs text-white/40">FREE COOKIE #{globalIndex + 1}</span>
              <Badge className={`${isAlive ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'} border text-[10px] font-mono px-1.5`}>
                {isAlive ? 'ALIVE' : 'DEAD'}
              </Badge>
              {lastRefreshed && (
                <span className="text-[10px] text-white/15 font-mono flex items-center gap-1">
                  <RefreshCw className="w-2.5 h-2.5" />
                  {new Date(lastRefreshed).toLocaleTimeString()}
                </span>
              )}
            </div>
            <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1">
            <div className="px-5 py-4 space-y-3">
              <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={cookie.email} />
              <InfoRow icon={<CreditCard className="w-4 h-4" />} label="Plan" value={cookie.plan} />
              <InfoRow icon={<Globe className="w-4 h-4" />} label="Country" value={cookie.country} />
              <InfoRow icon={<Calendar className="w-4 h-4" />} label="Since" value={cookie.member_since} />
              <InfoRow icon={<Clock className="w-4 h-4" />} label="Next Bill" value={cookie.next_billing} />
              {cookie.profiles?.length > 0 && (
                <InfoRow icon={<Users className="w-4 h-4" />} label="Profiles" value={cookie.profiles.join(', ')} />
              )}
            </div>

            {currentNftoken && (
              <div className="px-5 py-4 border-t border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-primary/60" />
                    <span className="text-xs text-white/40 uppercase tracking-wide">NFToken</span>
                  </div>
                  <button
                    onClick={handleRefreshToken}
                    disabled={tokenRefreshing}
                    data-testid={`refresh-nftoken-${globalIndex}`}
                    className="flex items-center gap-1 text-[10px] text-white/30 hover:text-green-400 transition-colors disabled:opacity-50"
                  >
                    {tokenRefreshing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    <span className="uppercase tracking-wide font-mono">Refresh Token</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 font-mono text-xs text-primary/80 bg-black/40 px-3 py-2 rounded-lg truncate" data-testid={`free-nftoken-${globalIndex}`}>
                    {currentNftoken}
                  </code>
                  <CopyBtn text={currentNftoken} testId={`free-nftoken-copy-${globalIndex}`} />
                </div>
                {currentNftokenLink && (
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <a href={currentNftokenLink} target="_blank" rel="noopener noreferrer" data-testid={`free-nftoken-link-${globalIndex}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bebas tracking-widest uppercase bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 transition-all">
                      <Link2 className="w-4 h-4" /> Open Netflix with Token
                    </a>
                    <a href={`https://www.netflix.com/unsupported?nftoken=${currentNftoken}`} target="_blank" rel="noopener noreferrer" data-testid={`free-nftoken-unsupported-${globalIndex}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bebas tracking-widest uppercase bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25 transition-all">
                      <Smartphone className="w-4 h-4" /> Open in Phone
                    </a>
                  </div>
                )}
              </div>
            )}

            {isAlive && (
              <div className="px-5 py-4 border-t border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <Tv className="w-4 h-4 text-blue-400/60" />
                  <span className="text-xs text-white/40 uppercase tracking-wide">Sign In on TV</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={tvCode}
                    onChange={e => setTvCode(e.target.value)}
                    placeholder="Enter TV code (e.g. 12345678)"
                    className="bg-black/50 border-white/10 focus:border-blue-400 text-white placeholder:text-white/20 h-10 font-mono text-sm rounded-xl"
                    data-testid={`tv-code-input-${globalIndex}`}
                    disabled={tvLoading}
                    onKeyDown={e => e.key === 'Enter' && handleTvCode()}
                  />
                  <Button
                    onClick={handleTvCode}
                    disabled={tvLoading || !tvCode.trim()}
                    data-testid={`tv-code-submit-${globalIndex}`}
                    className="bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25 font-bebas tracking-widest uppercase rounded-xl h-10 px-5 shrink-0"
                  >
                    {tvLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Monitor className="w-4 h-4 mr-1.5" />ACTIVATE</>}
                  </Button>
                </div>
                {tvResult && (
                  <div className={`mt-2 text-xs px-3 py-2 rounded-xl ${tvResult.success ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`} data-testid={`tv-code-result-${globalIndex}`}>
                    {tvResult.message}
                  </div>
                )}
                <p className="text-[10px] text-white/15 mt-2">Open Netflix on your TV, select "Sign In" and enter the 8-digit code shown.</p>
              </div>
            )}

            {isAdmin && cookie.browser_cookies && (
              <div className="border-t border-white/5">
                <button onClick={() => setShowBrowserCookies(p => !p)} className="w-full px-5 py-3 flex items-center justify-between text-xs text-green-400/50 hover:text-green-400/80 transition-colors" data-testid={`free-browser-cookies-expand-${globalIndex}`}>
                  <span className="font-mono uppercase tracking-wide">{showBrowserCookies ? 'Hide' : 'View'} Browser Cookies</span>
                  <span className={`transition-transform duration-200 inline-block ${showBrowserCookies ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {showBrowserCookies && (
                  <div className="relative px-5 pb-4">
                    <pre className="text-xs font-mono text-green-400/60 bg-black/60 rounded-xl p-4 overflow-x-auto max-h-40 overflow-y-auto whitespace-pre-wrap break-all">{cookie.browser_cookies}</pre>
                    <div className="absolute top-2 right-7"><CopyBtn text={cookie.browser_cookies} testId={`free-browser-cookies-copy-${globalIndex}`} /></div>
                  </div>
                )}
              </div>
            )}

            {isAdmin && cookie.full_cookie && (
              <div className="border-t border-white/5">
                <button onClick={() => setShowCookie(p => !p)} className="w-full px-5 py-3 flex items-center justify-between text-xs text-white/30 hover:text-white/50 transition-colors" data-testid={`free-cookie-expand-${globalIndex}`}>
                  <span className="font-mono uppercase tracking-wide">{showCookie ? 'Hide' : 'View'} Original Cookie</span>
                  <span className={`transition-transform duration-200 inline-block ${showCookie ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {showCookie && (
                  <div className="relative px-5 pb-4">
                    <pre className="text-xs font-mono text-white/40 bg-black/60 rounded-xl p-4 overflow-x-auto max-h-40 overflow-y-auto whitespace-pre-wrap break-all">{cookie.full_cookie}</pre>
                    <div className="absolute top-2 right-7"><CopyBtn text={cookie.full_cookie} testId={`free-cookie-copy-${globalIndex}`} /></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default function FreeCookiesPage() {
  const { user, token } = useAuth();
  const [cookies, setCookies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayLimit, setDisplayLimit] = useState(10);
  const [limitInput, setLimitInput] = useState('');
  const [savingLimit, setSavingLimit] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCookie, setSelectedCookie] = useState(null);
  const [selectedGlobalIndex, setSelectedGlobalIndex] = useState(null);
  const [filters, setFilters] = useState({ status: 'all', plan: 'all', country: 'all' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // ✅ Plan & country options built from ALL fetched cookies across pages
  const [allPlanOptions, setAllPlanOptions] = useState(['all']);
  const [allCountryOptions, setAllCountryOptions] = useState(['all']);

  const headers = { Authorization: `Bearer ${token}` };
  const isAdmin = user?.is_master === true;
  const isPremium = user?.tier === 'premium' && !isAdmin;
  const pageSize = 20;

  // ✅ Fetch filter options once on mount (unfiltered, just to populate dropdowns)
  useEffect(() => {
    if (!user) return;
    fetchFilterOptions();
  }, [user]); // eslint-disable-line

  // ✅ Re-fetch cookies whenever page OR filters change
  useEffect(() => {
    if (!user) return;
    fetchCookies(page, filters);
  }, [user, page, filters]); // eslint-disable-line

  // ✅ Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filters.status, filters.plan, filters.country]);

  // ✅ Fetch all unique plans & countries for dropdown options (unfiltered)
  const fetchFilterOptions = async () => {
    try {
      const endpoint = isAdmin ? `${API}/admin/free-cookies` : `${API}/free-cookies`;
      const res = await axios.get(endpoint, {
        headers,
        params: { page: 1, page_size: 500, status: 'all', plan: '', country: '' }
      });
      const all = res.data.cookies || [];

      const planOrder = ['Basic', 'Basic with ads', 'Mobile', 'Standard with ads', 'Standard (HD)', 'Premium (UHD)'];
      const planSet = new Set(all.map(c => c.plan).filter(Boolean));
      const sortedPlans = Array.from(planSet).sort((a, b) => {
        const ai = planOrder.findIndex(o => a.includes(o.split(' ')[0]));
        const bi = planOrder.findIndex(o => b.includes(o.split(' ')[0]));
        if (ai === -1 && bi === -1) return a.localeCompare(b);
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      });
      setAllPlanOptions(['all', ...sortedPlans]);

      const countrySet = new Set(all.map(c => c.country).filter(Boolean));
      setAllCountryOptions(['all', ...Array.from(countrySet).sort()]);
    } catch {
      // silently fail — dropdowns will just show "all"
    }
  };

  // ✅ fetchCookies now sends status, plan, country to backend
  const fetchCookies = async (currentPage = 1, currentFilters = filters) => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        page_size: pageSize,
        status: currentFilters.status,
        plan: currentFilters.plan === 'all' ? '' : currentFilters.plan,
        country: currentFilters.country === 'all' ? '' : currentFilters.country,
      };

      if (isAdmin) {
        const res = await axios.get(`${API}/admin/free-cookies`, { headers, params });
        setCookies(res.data.cookies);
        setTotalPages(res.data.total_pages);
        setTotal(res.data.total);
        setDisplayLimit(res.data.display_limit);
        setLimitInput(String(res.data.display_limit));
      } else {
        const res = await axios.get(`${API}/free-cookies`, { headers, params });
        setCookies(res.data.cookies);
        setTotalPages(res.data.total_pages);
        setTotal(res.data.total);
      }
    } catch {
      toast.error('Failed to load free cookies');
    } finally {
      setLoading(false);
    }
  };

  const deleteCookie = async (cookieId) => {
    try {
      await axios.delete(`${API}/admin/free-cookies/${cookieId}`, { headers });
      setCookies(prev => prev.filter(c => c.id !== cookieId));
      if (selectedCookie?.id === cookieId) setSelectedCookie(null);
      toast.success('Free cookie removed');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const updateLimit = async () => {
    const val = parseInt(limitInput);
    if (!val || val < 1) { toast.error('Enter a valid number'); return; }
    setSavingLimit(true);
    try {
      await axios.patch(`${API}/admin/free-cookies/limit`, { limit: val }, { headers });
      setDisplayLimit(val);
      toast.success(`Display limit set to ${val}`);
    } catch {
      toast.error('Failed to update limit');
    } finally {
      setSavingLimit(false);
    }
  };

  const refreshTokens = async () => {
    setRefreshing(true);
    try {
      const res = await axios.post(`${API}/admin/free-cookies/refresh`, {}, { headers });
      toast.success(res.data.message);
      fetchCookies(page, filters);
      fetchFilterOptions();
    } catch {
      toast.error('Failed to refresh tokens');
    } finally {
      setRefreshing(false);
    }
  };

  const getGlobalIndex = (localIdx) => (page - 1) * pageSize + localIdx;

  function Pagination() {
    const [inputVal, setInputVal] = useState(String(page));

    useEffect(() => {
      setInputVal(String(page));
    }, []); // eslint-disable-line

    if (totalPages <= 1) return null;

    const handleJump = (e) => {
      if (e.key === 'Enter') {
        const val = parseInt(inputVal);
        if (val >= 1 && val <= totalPages) {
          setPage(val);
        } else {
          setInputVal(String(page));
          toast.error(`Enter a page between 1 and ${totalPages}`);
        }
      }
    };

    const btnClass = (p) =>
      `px-3 h-8 rounded-lg text-xs font-mono border transition-all ${
        page === p
          ? 'bg-green-500/20 text-green-400 border-green-500/40'
          : 'text-white/30 border-white/10 hover:border-white/20 hover:text-white/60'
      }`;

    const siblings = 2;
    const rangeStart = Math.max(2, page - siblings);
    const rangeEnd = Math.min(totalPages - 1, page + siblings);
    const pages = [];

    pages.push(1);
    if (rangeStart > 2) pages.push('left-ellipsis');
    for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
    if (rangeEnd < totalPages - 1) pages.push('right-ellipsis');
    if (totalPages > 1) pages.push(totalPages);

    return (
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 h-8 rounded-lg text-xs font-mono text-white/30 border border-white/10 hover:border-white/20 hover:text-white/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          &lt;
        </button>

        {pages.map((p, i) => {
          if (p === 'left-ellipsis' || p === 'right-ellipsis') {
            return <span key={p} className="text-white/20 text-xs font-mono px-1">...</span>;
          }
          if (p === page) {
            return (
              <input
                key="current"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={inputVal}
                onChange={e => setInputVal(e.target.value.replace(/\D/g, ''))}
                onKeyDown={handleJump}
                onBlur={() => setInputVal(String(page))}
                className="w-14 h-8 rounded-lg text-xs font-mono text-center text-green-400 bg-green-500/20 border border-green-500/40 focus:border-green-500/60 outline-none transition-all appearance-none"
              />
            );
          }
          return <button key={p} onClick={() => setPage(p)} className={btnClass(p)}>{p}</button>;
        })}

        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-3 h-8 rounded-lg text-xs font-mono text-white/30 border border-white/10 hover:border-white/20 hover:text-white/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          &gt;
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="max-w-5xl mx-auto px-6 py-6 md:py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <Gift className="w-7 h-7 text-green-400" />
              <h1 className="font-bebas text-4xl sm:text-5xl tracking-wider text-white" data-testid="free-cookies-title">
                FREE <span className="text-green-400">COOKIES</span>
              </h1>
            </div>
            {!loading && total > 0 && (
              <div className="flex flex-col items-center gap-1">
                <span className="font-bebas text-lg tracking-widest text-green-400">
                  {total} COOKIES AVAILABLE
                </span>
                {!isPremium && !isAdmin && (
                  <span className="text-[10px] font-mono text-white/25 tracking-wide">
                    Upgrade to{' '}
                    <span className="text-purple-400 font-semibold">PREMIUM</span>
                    {' '}tier to see all cookies
                  </span>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-b from-white/10 to-white/[0.03] border border-white/20 rounded-2xl p-6 mb-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_8px_24px_rgba(0,0,0,0.6)]"
            data-testid="free-cookies-admin-controls"
          >
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-4 h-4 text-white/40" />
              <h2 className="font-bebas text-lg tracking-wider text-white">DISPLAY SETTINGS</h2>
            </div>
            <div className="flex items-end gap-4">
              <div className="w-48">
                <label className="text-xs text-white/40 uppercase tracking-wide mb-1.5 block">Max cookies shown to free tier</label>
                <Input type="number" min={1} value={limitInput} onChange={e => setLimitInput(e.target.value)} className="bg-black/50 border-white/10 focus:border-primary text-white h-10 rounded-xl" data-testid="free-cookies-limit-input" />
              </div>
              <Button onClick={updateLimit} disabled={savingLimit} data-testid="save-limit-btn" className="bg-primary hover:bg-red-700 text-white font-bebas tracking-widest uppercase rounded-xl h-10 px-6">
                {savingLimit ? <Loader2 className="w-4 h-4 animate-spin" /> : 'SAVE'}
              </Button>
              <div className="ml-auto">
                <Badge className="bg-white/5 text-white/40 border border-white/10 text-xs">{total} total / {displayLimit} shown to free tier</Badge>
              </div>
            </div>
            <p className="text-xs text-white/20 mt-3">Free tier users see up to this many cookies. Premium users always see up to 500. Master sees all.</p>
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-4">
              <Button onClick={refreshTokens} disabled={refreshing || total === 0} data-testid="refresh-tokens-btn" className="bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 font-bebas tracking-widest uppercase rounded-xl h-10 px-6">
                {refreshing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                REFRESH TOKENS NOW
              </Button>
              <span className="text-xs text-white/20">Force-refresh all NFTokens immediately</span>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          </div>
        ) : total === 0 && filters.status === 'all' && !filters.plan && !filters.country ? (
          <div className="text-center py-20 text-white/30">
            <Gift className="w-12 h-12 mx-auto mb-3 text-white/10" />
            <p>No free cookies available</p>
            {!isAdmin && !isPremium && <p className="text-xs text-white/15 mt-1">Check back later — the admin will add some!</p>}
            {isAdmin && <p className="text-xs text-white/15 mt-1">Check cookies on the Dashboard, then add valid ones here.</p>}
          </div>
        ) : (
          <>
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              planOptions={allPlanOptions}
              countryOptions={allCountryOptions}
            />

            {cookies.length === 0 ? (
              <div className="text-center py-16 text-white/30">
                <Filter className="w-10 h-10 mx-auto mb-3 text-white/10" />
                <p>No cookies match your filters</p>
                <button onClick={() => setFilters({ status: 'all', plan: 'all', country: 'all' })} className="mt-2 text-xs text-white/20 hover:text-green-400 transition-colors font-mono">
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {cookies.map((cookie, idx) => (
                  <FreeCookieSmallCard
                    key={cookie.id}
                    cookie={cookie}
                    globalIndex={getGlobalIndex(idx)}
                    isAdmin={isAdmin}
                    onDelete={deleteCookie}
                    onClick={() => {
                      setSelectedCookie(cookie);
                      setSelectedGlobalIndex(getGlobalIndex(idx));
                    }}
                  />
                ))}
              </div>
            )}

            <div className="mt-8">
              <Pagination />
            </div>
          </>
        )}
      </div>

      {selectedCookie && (
        <FreeCookieModal
          cookie={selectedCookie}
          globalIndex={selectedGlobalIndex}
          isAdmin={isAdmin}
          onClose={() => { setSelectedCookie(null); setSelectedGlobalIndex(null); }}
        />
      )}
    </div>
  );
}
