import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ShieldCheck,
  Trash2,
  Copy,
  Check,
  Loader2,
  Mail,
  CreditCard,
  Globe,
  Calendar,
  Clock,
  Users,
  Key,
  Link2,
  RefreshCw,
  Tv,
  Monitor,
  Smartphone,
  X,
  Settings,
  Filter,
  Star,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function CopyBtn({ text, testId }: { text: string; testId?: string }) {
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
    <button
      onClick={handleCopy}
      data-testid={testId}
      className="p-1.5 rounded bg-white/5 hover:bg-white/10 transition-colors"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-green-400" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-white/40" />
      )}
    </button>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3">
      <span className="text-white/20">{icon}</span>
      <span className="text-white/40 text-xs uppercase tracking-wide w-24 shrink-0">
        {label}
      </span>
      <span className="text-white/90 text-sm font-medium truncate">
        {value}
      </span>
    </div>
  );
}

function FilterBar({
  cookies,
  filters,
  setFilters,
}: {
  cookies: any[];
  filters: { status: string; plan: string; country: string };
  setFilters: (f: { status: string; plan: string; country: string }) => void;
}) {
  const statuses = ['all', 'alive', 'dead'];

  const plans = useMemo(() => {
    const set = new Set(cookies.map(c => c.plan).filter(Boolean));
    const order = [
      'Basic',
      'Basic with ads',
      'Mobile',
      'Standard with ads',
      'Standard HD',
      'Premium UHD',
    ];
    const sorted = Array.from(set).sort((a, b) => {
      const ai = order.findIndex(o => a.toLowerCase().includes(o.split(' ')[0].toLowerCase()));
      const bi = order.findIndex(o => b.toLowerCase().includes(o.split(' ')[0].toLowerCase()));
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
    return ['all', ...sorted];
  }, [cookies]);

  const countries = useMemo(() => {
    const set = new Set(cookies.map(c => c.country).filter(Boolean));
    return ['all', ...Array.from(set).sort()];
  }, [cookies]);

  const selectClass =
    'bg-black/50 border border-white/10 text-white/60 text-xs rounded-lg px-3 h-8 outline-none focus:border-purple-500/40 cursor-pointer hover:border-white/20 transition-colors';

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <div className="flex items-center gap-1.5 text-white/20 mr-1">
        <Filter className="w-3.5 h-3.5" />
        <span className="text-xs font-mono uppercase tracking-wide">
          Filter
        </span>
      </div>
      <div className="flex items-center gap-1">
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setFilters({ ...filters, status: s })}
            className={`px-3 h-8 rounded-lg text-xs font-mono uppercase tracking-wide transition-all border ${
              filters.status === s
                ? s === 'alive'
                  ? 'bg-green-500/20 text-green-400 border-green-500/40'
                  : s === 'dead'
                  ? 'bg-red-500/20 text-red-400 border-red-500/40'
                  : 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                : 'bg-transparent text-white/25 border-white/8 hover:border-white/15 hover:text-white/40'
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <select
        value={filters.plan}
        onChange={e => setFilters({ ...filters, plan: e.target.value })}
        className={selectClass}
      >
        {plans.map(p => (
          <option key={p} value={p} className="bg-[#111]">
            {p === 'all' ? 'All Plans' : p}
          </option>
        ))}
      </select>
      <select
        value={filters.country}
        onChange={e => setFilters({ ...filters, country: e.target.value })}
        className={selectClass}
      >
        {countries.map(c => (
          <option key={c} value={c} className="bg-[#111]">
            {c === 'all' ? 'All Countries' : c}
          </option>
        ))}
      </select>
      {(filters.status !== 'all' ||
        filters.plan !== 'all' ||
        filters.country !== 'all') && (
        <button
          onClick={() =>
            setFilters({ status: 'all', plan: 'all', country: 'all' })
          }
          className="px-3 h-8 rounded-lg text-xs font-mono uppercase tracking-wide text-white/25 border border-white/8 hover:text-red-400 hover:border-red-500/30 transition-all"
        >
          Reset
        </button>
      )}
    </div>
  );
}

function AdminCookieSmallCard({
  cookie,
  index,
  onDelete,
  onClick,
  isInFreeCookies,
  isAdmin,
  canFavorite,
  isFavorited,
  onToggleFavorite,
}: {
  cookie: any;
  index: number;
  onDelete: (cookie: any) => void;
  onClick: () => void;
  isInFreeCookies: boolean;
  isAdmin: boolean;
  canFavorite: boolean;
  isFavorited: boolean;
  onToggleFavorite: (id: string) => void;
}) {
  const isAlive = cookie.is_alive !== false;
  const sourceLabel = cookie.source === 'free' ? 'FREE' : 'ADMIN';
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index % 21) * 0.04 }}
      onClick={onClick}
      className={`group cursor-pointer rounded-xl p-4 transition-all duration-150
        bg-gradient-to-b from-purple-500/10 to-white/[0.03]
        border border-purple-500/20
        shadow-[inset_0_1px_0_rgba(168,85,247,0.15),inset_0_-1px_0_rgba(0,0,0,0.4),0_8px_24px_rgba(0,0,0,0.6)]
        hover:from-purple-500/[0.15] hover:to-white/[0.05]
        hover:border-purple-500/40
        active:scale-[0.97]`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className={`w-2 h-2 rounded-full shrink-0 ${
              isAlive
                ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]'
                : 'bg-red-400'
            }`}
          />
          <span className="font-mono text-xs text-white/30">
            #{index + 1}
          </span>
          <Badge
            className={`${
              isAlive
                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                : 'bg-red-500/20 text-red-400 border-red-500/30'
            } border text-[10px] font-mono px-1.5 py-0`}
          >
            {isAlive ? 'ALIVE' : 'DEAD'}
          </Badge>
          {sourceLabel && (
            <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-mono px-1.5 py-0">
              {sourceLabel}
            </Badge>
          )}
          {isInFreeCookies && (
            <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] font-mono px-1.5 py-0">
              IN FREE
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {canFavorite && (
            <button
              onClick={e => {
                e.stopPropagation();
                onToggleFavorite(cookie.id);
              }}
              className={`p-1 transition-all ${
                isFavorited
                  ? 'text-yellow-400 hover:text-yellow-300'
                  : 'text-white/15 hover:text-yellow-400'
              }`}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  isFavorited ? 'fill-yellow-400' : ''
                }`}
              />
            </button>
          )}
          {isAdmin && (
            <button
              onClick={e => {
                e.stopPropagation();
                onDelete(cookie);
              }}
              className="text-white/15 hover:text-red-400 transition-colors p-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-1.5">
        <Mail className="w-3.5 h-3.5 text-white/20 shrink-0" />
        <span className="text-white/70 text-xs font-mono truncate">
          {cookie.email || '—'}
        </span>
      </div>
      <div className="flex items-center gap-2 mb-1.5">
        <CreditCard className="w-3.5 h-3.5 text-white/20 shrink-0" />
        <span className="text-white/40 text-xs">
          {cookie.plan || '—'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Globe className="w-3.5 h-3.5 text-white/20 shrink-0" />
        <span className="text-white/40 text-xs">
          {cookie.country || '—'}
        </span>
      </div>
      <div className="mt-3 pt-2 border-t border-white/5 text-[10px] font-mono text-center tracking-widest text-white/15 group-hover:text-purple-400 transition-colors duration-200">
        TAP TO USE
      </div>
    </motion.div>
  );
}

function AdminCookieModal({
  cookie,
  index,
  onClose,
  isInFreeCookies,
  isAdmin,
  canFavorite,
  isFavorited,
  onToggleFavorite,
}: {
  cookie: any;
  index: number;
  onClose: () => void;
  isInFreeCookies: boolean;
  isAdmin: boolean;
  canFavorite: boolean;
  isFavorited: boolean;
  onToggleFavorite: (id: string) => void;
}) {
  const [tvCode, setTvCode] = useState('');
  const [tvLoading, setTvLoading] = useState(false);
  const [tvResult, setTvResult] = useState(null);
  const [tokenRefreshing, setTokenRefreshing] = useState(false);
  const [currentNftoken, setCurrentNftoken] = useState(cookie.nftoken);
  const [currentNftokenLink, setCurrentNftokenLink] = useState(
    cookie.nftoken_link,
  );
  const [lastRefreshed, setLastRefreshed] = useState(cookie.last_refreshed);
  const [showCookie, setShowCookie] = useState(false);
  const [showBrowserCookies, setShowBrowserCookies] = useState(false);
  const { token } = useAuth();
  const isAlive = cookie.is_alive !== false;
  const cookieSource = cookie.source === 'free' ? 'free' : 'admin';
  const sourceLabel = cookieSource === 'free' ? 'FREE' : 'ADMIN';

  const handleTvCode = async () => {
    if (!tvCode.trim()) {
      toast.error('Enter the code from your TV');
      return;
    }
    setTvLoading(true);
    setTvResult(null);
    try {
      const res = await axios.post(
        `${API}/tv-code`,
        { code: tvCode, cookie_id: cookie.id, cookie_source: cookieSource },
        { headers: { Authorization: `Bearer ${token}` } },
      );
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
      const refreshEndpoint =
        cookieSource === 'admin'
          ? `${API}/admin/admin-cookies/${cookie.id}/refresh-token`
          : `${API}/free-cookies/${cookie.id}/refresh-token`;
      const res = await axios.post(
        refreshEndpoint,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative w-[calc(100vw-2rem)] sm:w-[500px] max-h-[85vh] bg-[#0a0a0a] border border-purple-500/20 rounded-2xl z-10 flex flex-col overflow-hidden shadow-[inset_0_1px_0_rgba(168,85,247,0.1),0_24px_48px_rgba(0,0,0,0.8)]"
        >
          <div className="px-5 py-4 border-b border-purple-500/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 flex-wrap">
              <div
                className={`w-2 h-2 rounded-full ${
                  isAlive
                    ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]'
                    : 'bg-red-400'
                }`}
              />
              <span className="font-mono text-xs text-white/40">
                {sourceLabel} COOKIE #{index + 1}
              </span>
              <Badge
                className={`${
                  isAlive
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                } border text-[10px] font-mono px-1.5`}
              >
                {isAlive ? 'ALIVE' : 'DEAD'}
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-mono px-1.5">
                {sourceLabel}
              </Badge>
              {isInFreeCookies && (
                <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] font-mono px-1.5">
                  IN FREE COOKIES
                </Badge>
              )}
              {lastRefreshed && (
                <span className="text-[10px] text-white/15 font-mono flex items-center gap-1">
                  <RefreshCw className="w-2.5 h-2.5" />
                  {new Date(lastRefreshed).toLocaleTimeString()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {canFavorite && (
                <button
                  onClick={() => onToggleFavorite(cookie.id)}
                  className={`p-1.5 rounded-lg transition-all ${
                    isFavorited
                      ? 'text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20'
                      : 'text-white/20 hover:text-yellow-400 hover:bg-yellow-400/10'
                  }`}
                  title={
                    isFavorited
                      ? 'Remove from favorites'
                      : 'Add to favorites'
                  }
                >
                  <Star
                    className={`w-4 h-4 ${
                      isFavorited ? 'fill-yellow-400' : ''
                    }`}
                  />
                </button>
              )}
              <button
                onClick={onClose}
                className="text-white/30 hover:text-white transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            <div className="px-5 py-4 space-y-3">
              <InfoRow
                icon={<Mail className="w-4 h-4" />}
                label="Email"
                value={cookie.email}
              />
              <InfoRow
                icon={<CreditCard className="w-4 h-4" />}
                label="Plan"
                value={cookie.plan}
              />
              <InfoRow
                icon={<Globe className="w-4 h-4" />}
                label="Country"
                value={cookie.country}
              />
              <InfoRow
                icon={<Calendar className="w-4 h-4" />}
                label="Since"
                value={cookie.member_since}
              />
              <InfoRow
                icon={<Clock className="w-4 h-4" />}
                label="Next Bill"
                value={cookie.next_billing}
              />
              {cookie.profiles?.length > 0 && (
                <InfoRow
                  icon={<Users className="w-4 h-4" />}
                  label="Profiles"
                  value={cookie.profiles.join(', ')}
                />
              )}
            </div>

            {currentNftoken && (
              <div className="px-5 py-4 border-t border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-purple-400/60" />
                    <span className="text-xs text-white/40 uppercase tracking-wide">
                      NFToken
                    </span>
                  </div>
                  <button
                    onClick={handleRefreshToken}
                    disabled={tokenRefreshing}
                    className="flex items-center gap-1 text-[10px] text-white/30 hover:text-purple-400 transition-colors disabled:opacity-50"
                  >
                    {tokenRefreshing ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3 h-3" />
                    )}
                    <span className="uppercase tracking-wide font-mono">
                      Refresh Token
                    </span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 font-mono text-xs text-purple-400/80 bg-black/40 px-3 py-2 rounded-lg truncate">
                    {currentNftoken}
                  </code>
                  <CopyBtn text={currentNftoken} />
                </div>
                {currentNftokenLink && (
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <a
                      href={currentNftokenLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bebas tracking-widest uppercase bg-purple-500/15 text-purple-400 border border-purple-500/30 hover:bg-purple-500/25 transition-all"
                    >
                      <Link2 className="w-4 h-4" />
                      Open Netflix with Token
                    </a>
                    <a
                      href={`https://www.netflix.com/unsupported?nftoken=${currentNftoken}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bebas tracking-widest uppercase bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25 transition-all"
                    >
                      <Smartphone className="w-4 h-4" />
                      Open in Phone
                    </a>
                  </div>
                )}
              </div>
            )}

            {isAlive && (
              <div className="px-5 py-4 border-t border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <Tv className="w-4 h-4 text-blue-400/60" />
                  <span className="text-xs text-white/40 uppercase tracking-wide">
                    Sign In on TV
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    value={tvCode}
                    onChange={e => setTvCode(e.target.value)}
                    placeholder="Enter TV code (e.g. 12345678)"
                    className="flex-1 bg-black/50 border border-white/10 focus:border-blue-400 text-white placeholder:text-white/20 h-10 font-mono text-sm rounded-xl px-3 outline-none"
                    disabled={tvLoading}
                    onKeyDown={e => e.key === 'Enter' && handleTvCode()}
                  />
                  <button
                    onClick={handleTvCode}
                    disabled={tvLoading || !tvCode.trim()}
                    className="bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25 font-bebas tracking-widest uppercase rounded-xl h-10 px-5 shrink-0 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {tvLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Monitor className="w-4 h-4" />
                        ACTIVATE
                      </>
                    )}
                  </button>
                </div>
                {tvResult && (
                  <div
                    className={`mt-2 text-xs px-3 py-2 rounded-xl ${
                      tvResult.success
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {tvResult.message}
                  </div>
                )}
                <p className="text-[10px] text-white/15 mt-2">
                  Open Netflix on your TV, select "Sign In" and enter the
                  8‑digit code shown.
                </p>
              </div>
            )}

            {isAdmin && cookie.browser_cookies && (
              <div className="border-t border-white/5">
                <button
                  onClick={() => setShowBrowserCookies(p => !p)}
                  className="w-full px-5 py-3 flex items-center justify-between text-xs text-green-400/50 hover:text-green-400/80 transition-colors"
                >
                  <span className="font-mono uppercase tracking-wide">
                    {showBrowserCookies ? 'Hide' : 'View'} Browser Cookies
                  </span>
                  <span
                    className={`transition-transform duration-200 inline-block ${
                      showBrowserCookies ? 'rotate-180' : ''
                    }`}
                  >
                    ▾
                  </span>
                </button>
                {showBrowserCookies && (
                  <div className="relative px-5 pb-4">
                    <pre className="text-xs font-mono text-green-400/60 bg-black/60 rounded-xl p-4 overflow-x-auto max-h-40 overflow-y-auto whitespace-pre-wrap break-all">
                      {cookie.browser_cookies}
                    </pre>
                    <div className="absolute top-2 right-7">
                      <CopyBtn text={cookie.browser_cookies} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {isAdmin && cookie.full_cookie && (
              <div className="border-t border-white/5">
                <button
                  onClick={() => setShowCookie(p => !p)}
                  className="w-full px-5 py-3 flex items-center justify-between text-xs text-white/30 hover:text-white/50 transition-colors"
                >
                  <span className="font-mono uppercase tracking-wide">
                    {showCookie ? 'Hide' : 'View'} Original Cookie
                  </span>
                  <span
                    className={`transition-transform duration-200 inline-block ${
                      showCookie ? 'rotate-180' : ''
                    }`}
                  >
                    ▾
                  </span>
                </button>
                {showCookie && (
                  <div className="relative px-5 pb-4">
                    <pre className="text-xs font-mono text-white/40 bg-black/60 rounded-xl p-4 overflow-x-auto max-h-40 overflow-y-auto whitespace-pre-wrap break-all">
                      {cookie.full_cookie}
                    </pre>
                    <div className="absolute top-2 right-7">
                      <CopyBtn text={cookie.full_cookie} />
                    </div>
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

export default function AdminCookiesPage() {
  const { token, user } = useAuth();
  const [cookies, setCookies] = useState([]);
  const [freeCookieEmails, setFreeCookieEmails] = useState(
    new Set(),
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCookie, setSelectedCookie] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    plan: 'all',
    country: 'all',
  });

  const [activeTab, setActiveTab] = useState('all');
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [favoriteCookies, setFavoriteCookies] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  const [page, setPage] = useState(1);
  const pageSize = 21;

  const headers = { Authorization: `Bearer ${token}` };
  const isAdmin = user?.is_master === true;
  const isPremium = user?.tier === 'premium' && !isAdmin;
  const canAccess = isAdmin || isPremium;
  const canFavorite = isAdmin || isPremium;

  const fetchAll = async () => {
    setLoading(true);
    try {
      const adminRes = await axios.get(`${API}/admin/admin-cookies`, {
        headers,
      });
      setCookies(adminRes.data.cookies || []);
      if (isAdmin) {
        const freeRes = await axios.get(`${API}/admin/free-cookies`, {
          headers,
        });
        setFreeCookieEmails(
          new Set((freeRes.data.cookies || []).map((c: any) => c.email)),
        );
      }
      setPage(1);
    } catch {
      toast.error('Failed to load admin cookies');
    } finally {
      setLoading(false);
    }
  };

  const fetchFavoriteIds = async () => {
    if (!canFavorite) return;
    try {
      const res = await axios.get(`${API}/favorites/ids`, { headers });
      setFavoriteIds(new Set(res.data.favorites || []));
    } catch {
      // ignore
    }
  };

  const fetchFavorites = async () => {
    if (!canFavorite) return;
    setFavoritesLoading(true);
    try {
      const res = await axios.get(`${API}/favorites`, { headers });
      setFavoriteCookies(res.data.cookies || []);
      setPage(1);
    } catch {
      toast.error('Failed to load favorites');
    } finally {
      setFavoritesLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !user || !canAccess) return;
    fetchAll();
    fetchFavoriteIds();
  }, [token, user]); // eslint-disable-line

  useEffect(() => {
    if (activeTab === 'favorites') {
      fetchFavorites();
    }
  }, [activeTab]); // eslint-disable-line

  const filteredCookies = useMemo(() => {
    return cookies.filter(c => {
      if (filters.status === 'alive' && c.is_alive === false) return false;
      if (filters.status === 'dead' && c.is_alive !== false) return false;
      if (filters.plan !== 'all' && c.plan !== filters.plan) return false;
      if (filters.country !== 'all' && c.country !== filters.country)
        return false;
      return true;
    });
  }, [cookies, filters]);

  // Hide favorites from All tab for non-master (like Free page)
  const publicCookies = useMemo(() => {
    if (isAdmin) return filteredCookies;
    return filteredCookies.filter(c => !favoriteIds.has(c.id));
  }, [filteredCookies, favoriteIds, isAdmin]);

  const totalForTab =
    activeTab === 'favorites' ? favoriteCookies.length : publicCookies.length;

  const totalPages = Math.max(1, Math.ceil(totalForTab / pageSize));

  const pagedCookies = useMemo(() => {
    const list = activeTab === 'favorites' ? favoriteCookies : publicCookies;
    const start = (page - 1) * pageSize;
    return list.slice(start, start + pageSize);
  }, [activeTab, favoriteCookies, publicCookies, page, pageSize]);

  const toggleFavorite = async (cookieId: string) => {
    if (!canFavorite) {
      toast.error('Favorites are only for premium and master keys');
      return;
    }
    const isAlready = favoriteIds.has(cookieId);
    if (!isAdmin && !isAlready && favoriteIds.size >= 10) {
      toast.error('Premium keys can only favorite up to 10 cookies');
      return;
    }

    try {
      const res = await axios.post(
        `${API}/favorites/${cookieId}`,
        {},
        { headers },
      );
      const newIds = new Set(favoriteIds);
      if (res.data.favorited) {
        newIds.add(cookieId);
        toast.success('Added to favorites ★');
      } else {
        newIds.delete(cookieId);
        toast.success('Removed from favorites');
        if (activeTab === 'favorites') {
          setFavoriteCookies(prev => prev.filter(c => c.id !== cookieId));
        }
      }
      setFavoriteIds(newIds);
    } catch {
      toast.error('Failed to update favorites');
    }
  };

  const deleteCookie = async (cookieToDelete: any) => {
    const cookieId =
      typeof cookieToDelete === 'string' ? cookieToDelete : cookieToDelete?.id;
    const cookieSource =
      typeof cookieToDelete === 'object' && cookieToDelete?.source === 'free'
        ? 'free'
        : 'admin';
    const normalizedSource = cookieSource;
    const endpoint =
      cookieSource === 'admin'
        ? `${API}/admin/admin-cookies/${cookieId}`
        : `${API}/admin/free-cookies/${cookieId}`;

    try {
      await axios.delete(endpoint, {
        headers,
      });
      setCookies(prev => prev.filter(c => c.id !== cookieId));
      setFavoriteCookies(prev =>
        prev.filter(
          c =>
            !(
              c.id === cookieId &&
              (c.source === 'free' ? 'free' : 'admin') === normalizedSource
            ),
        ),
      );
      const newIds = new Set(favoriteIds);
      newIds.delete(cookieId);
      setFavoriteIds(newIds);
      if (
        selectedCookie?.id === cookieId &&
        (selectedCookie?.source === 'free' ? 'free' : 'admin') ===
          normalizedSource
      ) {
        setSelectedCookie(null);
      }
      toast.success(
        cookieSource === 'admin' ? 'Admin cookie removed' : 'Free cookie removed',
      );
    } catch {
      toast.error('Failed to delete');
    }
  };

  const refreshTokens = async () => {
    setRefreshing(true);
    try {
      const res = await axios.post(
        `${API}/admin/admin-cookies/refresh`,
        {},
        { headers },
      );
      toast.success(res.data.message || 'Tokens refreshed');
      fetchAll();
    } catch {
      toast.error('Failed to refresh tokens');
    } finally {
      setRefreshing(false);
    }
  };

  if (user && !canAccess) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-white/10" />
          <p className="text-white/30 font-mono">
            Premium access required.
          </p>
          <p className="text-white/15 text-xs mt-1 font-mono">
            Upgrade your key to access admin cookies.
          </p>
        </div>
      </div>
    );
  }

  const selectedList = activeTab === 'favorites' ? favoriteCookies : publicCookies;
  const selectedIndex = selectedCookie
    ? selectedList.findIndex(
        c =>
          c.id === selectedCookie.id &&
          (c.source === 'free' ? 'free' : 'admin') ===
            (selectedCookie.source === 'free' ? 'free' : 'admin'),
      )
    : -1;

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="max-w-5xl mx-auto px-6 py-6 md:py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <ShieldCheck className="w-7 h-7 text-purple-400" />
              <h1 className="font-bebas text-4xl sm:text-5xl tracking-wider text-white">
                ADMIN <span className="text-purple-400">COOKIES</span>
              </h1>
            </div>
            {!loading && cookies.length > 0 && (
              <span className="font-bebas text-lg tracking-widest text-purple-400">
                {totalForTab}/{cookies.length} COOKIES
              </span>
            )}
          </div>
        </motion.div>

        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => {
              setActiveTab('all');
              setPage(1);
            }}
            className={`flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-mono uppercase tracking-wide border transition-all ${
              activeTab === 'all'
                ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                : 'text-white/30 border-white/8 hover:border-purple-500/20 hover:text-purple-400/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> All Cookies
          </button>
          <button
            onClick={() => {
              setActiveTab('favorites');
              setPage(1);
            }}
            className={`flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-mono uppercase tracking-wide border transition-all ${
              activeTab === 'favorites'
                ? 'bg-yellow-400/15 text-yellow-400 border-yellow-400/30'
                : 'text-white/30 border-white/8 hover:border-yellow-400/20 hover:text-yellow-400/60'
            }`}
          >
            <Star
              className={`w-3.5 h-3.5 ${
                activeTab === 'favorites' ? 'fill-yellow-400' : ''
              }`}
            />
            Favorites
            {favoriteIds.size > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono bg-white/10 text-white/40">
                {[...favoriteIds].filter(id =>
                  cookies.some(c => c.id === id),
                ).length || favoriteIds.size}
              </span>
            )}
          </button>
        </div>

        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-b from-purple-500/10 to-white/[0.03] border border-purple-500/20 rounded-2xl p-6 mb-8 shadow-[inset_0_1px_0_rgba(168,85,247,0.15),0_8px_24px_rgba(0,0,0,0.6)]"
          >
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-4 h-4 text-white/40" />
              <h2 className="font-bebas text-lg tracking-wider text-white">
                ADMIN CONTROLS
              </h2>
            </div>
            <p className="text-xs text-white/20 mb-4">
              Private cookies visible to admins and premium users. Add cookies
              by checking them on the Dashboard and clicking{' '}
              <span className="font-mono">Add to Admin Cookies</span>. An{' '}
              <span className="text-green-400 font-mono">IN FREE</span> badge
              means the cookie also exists in the Free Cookies page.
            </p>
            <div className="flex items-center gap-4">
              <Button
                onClick={refreshTokens}
                disabled={refreshing || cookies.length === 0}
                className="bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 font-bebas tracking-widest uppercase rounded-xl h-10 px-6"
              >
                {refreshing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                REFRESH TOKENS NOW
              </Button>
              <span className="text-xs text-white/20">
                Force-refresh NFTokens for all admin cookies.
              </span>
            </div>
          </motion.div>
        )}

        {activeTab === 'favorites' ? (
          favoritesLoading ? (
            <div className="text-center py-20">
              <Loader2 className="w-8 h-8 text-yellow-400 animate-spin mx-auto" />
            </div>
          ) : favoriteCookies.length === 0 ? (
            <div className="text-center py-20 text-white/30">
              <Star className="w-12 h-12 mx-auto mb-3 text-white/10" />
              <p>No favorites yet</p>
              <p className="text-xs text-white/15 mt-1">
                Tap the ★ on any cookie to save it here.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4">
                {pagedCookies.map((cookie, idx) => (
                  <AdminCookieSmallCard
                    key={cookie.id}
                    cookie={cookie}
                    index={(page - 1) * pageSize + idx}
                    isAdmin={isAdmin}
                    canFavorite={canFavorite}
                    isFavorited={true}
                    onDelete={deleteCookie}
                    onToggleFavorite={toggleFavorite}
                    isInFreeCookies={
                      cookie.source === 'free' || freeCookieEmails.has(cookie.email)
                    }
                    onClick={() => setSelectedCookie(cookie)}
                  />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-8">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="text-xs text-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Prev
                  </button>
                  <span className="text-xs text-white/40 font-mono">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="text-xs text-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )
        ) : loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
          </div>
        ) : cookies.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-white/10" />
            <p>No admin cookies yet</p>
            {isAdmin && (
              <p className="text-xs text-white/15 mt-1">
                Check cookies on the Dashboard, then add valid ones here.
              </p>
            )}
          </div>
        ) : (
          <>
            <FilterBar
              cookies={cookies}
              filters={filters}
              setFilters={f => {
                setFilters(f);
                setPage(1);
              }}
            />
            {publicCookies.length === 0 ? (
              <div className="text-center py-16 text-white/30">
                <Filter className="w-10 h-10 mx-auto mb-3 text-white/10" />
                <p>No cookies match your filters</p>
                <button
                  onClick={() => {
                    setFilters({ status: 'all', plan: 'all', country: 'all' });
                    setPage(1);
                  }}
                  className="mt-2 text-xs text-white/20 hover:text-purple-400 transition-colors font-mono"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-4">
                  {pagedCookies.map((cookie, idx) => (
                    <AdminCookieSmallCard
                      key={cookie.id}
                      cookie={cookie}
                      index={(page - 1) * pageSize + idx}
                      isAdmin={isAdmin}
                      canFavorite={canFavorite}
                      isFavorited={favoriteIds.has(cookie.id)}
                      onDelete={deleteCookie}
                      onToggleFavorite={toggleFavorite}
                      isInFreeCookies={freeCookieEmails.has(cookie.email)}
                      onClick={() => setSelectedCookie(cookie)}
                    />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-8">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className="text-xs text-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Prev
                    </button>
                    <span className="text-xs text-white/40 font-mono">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      disabled={page === totalPages}
                      onClick={() =>
                        setPage(p => Math.min(totalPages, p + 1))
                      }
                      className="text-xs text-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {selectedCookie && (
        <AdminCookieModal
          cookie={selectedCookie}
          index={selectedIndex >= 0 ? selectedIndex : 0}
          isAdmin={isAdmin}
          canFavorite={canFavorite}
          isFavorited={favoriteIds.has(selectedCookie.id)}
          onToggleFavorite={toggleFavorite}
          onClose={() => setSelectedCookie(null)}
          isInFreeCookies={freeCookieEmails.has(selectedCookie.email)}
        />
      )}
    </div>
  );
}
