import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Cookie,
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
  Settings,
  RefreshCw,
  Tv,
  Monitor,
  Smartphone,
  X,
  Filter,
  Star,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function stableIndexFromId(id) {
  const str = String(id || '');
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) % 100000;
  }
  return hash;
}

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
    <button
      onClick={handleCopy}
      data-testid={testId}
      className="p-1.5 rounded bg-white/5 hover:bg-white/10 transition-colors"
      type="button"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-green-400" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-white/40" />
      )}
    </button>
  );
}

function InfoRow({ icon, label, value }) {
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
  filters,
  setFilters,
  planOptions,
  countryOptions,
  disabled = false,
}) {
  const statuses = ['all', 'alive', 'dead'];
  const selectClass =
    'bg-black/50 border border-white/10 text-white/60 text-xs rounded-lg px-3 h-8 outline-none focus:border-green-500/40 cursor-pointer hover:border-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
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
            type="button"
            disabled={disabled}
            onClick={() => setFilters(prev => ({ ...prev, status: s }))}
            className={`px-3 h-8 rounded-lg text-xs font-mono uppercase tracking-wide transition-all border ${
              filters.status === s
                ? s === 'alive'
                  ? 'bg-green-500/20 text-green-400 border-green-500/40'
                  : s === 'dead'
                  ? 'bg-red-500/20 text-red-400 border-red-500/40'
                  : 'bg-white/10 text-white/70 border-white/20'
                : 'bg-transparent text-white/25 border-white/8 hover:border-white/15 hover:text-white/40'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {s}
          </button>
        ))}
      </div>

      <select
        value={filters.plan}
        disabled={disabled}
        onChange={e =>
          setFilters(prev => ({ ...prev, plan: e.target.value }))
        }
        className={selectClass}
      >
        {planOptions.map(p => (
          <option key={p} value={p} className="bg-[#111]">
            {p === 'all' ? 'All Plans' : p}
          </option>
        ))}
      </select>

      <select
        value={filters.country}
        disabled={disabled}
        onChange={e =>
          setFilters(prev => ({ ...prev, country: e.target.value }))
        }
        className={selectClass}
      >
        {countryOptions.map(c => (
          <option key={c} value={c} className="bg-[#111]">
            {c === 'all' ? 'All Countries' : c}
          </option>
        ))}
      </select>

      {(filters.status !== 'all' ||
        filters.plan !== 'all' ||
        filters.country !== 'all') && (
        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            setFilters({ status: 'all', plan: 'all', country: 'all' })
          }
          className="px-3 h-8 rounded-lg text-xs font-mono uppercase tracking-wide text-white/25 border border-white/8 hover:text-red-400 hover:border-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset
        </button>
      )}
    </div>
  );
}

function FreeCookieSmallCard({
  cookie,
  globalIndex,
  isAdmin,
  canFavorite,
  isFavorited,
  onDelete,
  onClick,
  onToggleFavorite,
  isMasterFavoritesView = false,
  showSourceBadge = false,
}) {
  const isAlive = cookie.is_alive !== false;
  const sourceLabel = cookie.source === 'admin' ? 'ADMIN' : 'FREE';

  return (
    <motion.div
      data-testid={`free-cookie-card-${globalIndex}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (Number(globalIndex) % 21) * 0.04 }}
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
          <div
            className={`w-2 h-2 rounded-full shrink-0 ${
              isAlive
                ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]'
                : 'bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.5)]'
            }`}
          />
          <span className="font-mono text-xs text-white/30">
            #{Number(globalIndex) + 1}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Badge
            className={`${
              isAlive
                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                : 'bg-red-500/20 text-red-400 border-red-500/30'
            } border text-[10px] font-mono px-1.5 py-0`}
          >
            {isAlive ? 'ALIVE' : 'DEAD'}
          </Badge>

          {showSourceBadge && (
            <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-mono px-1.5 py-0">
              {sourceLabel}
            </Badge>
          )}

          {canFavorite && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onToggleFavorite(cookie.id);
              }}
              className={`p-1 transition-all ${
                isFavorited
                  ? 'text-yellow-400 hover:text-yellow-300'
                  : 'text-white/15 hover:text-yellow-400'
              }`}
              data-testid={`favorite-btn-${globalIndex}`}
            >
              <Star
                className={`w-3.5 h-3.5 ${isFavorited ? 'fill-yellow-400' : ''}`}
              />
            </button>
          )}

          {isAdmin && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onDelete(cookie);
              }}
              className="text-white/15 hover:text-red-400 transition-colors p-1"
              data-testid={`delete-free-cookie-${globalIndex}`}
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
        <span className="text-white/40 text-xs">{cookie.plan || '—'}</span>
      </div>

      <div className="flex items-center gap-2">
        <Globe className="w-3.5 h-3.5 text-white/20 shrink-0" />
        <span className="text-white/40 text-xs">{cookie.country || '—'}</span>
      </div>

      <div className="mt-3 pt-2 border-t border-white/5 text-[10px] font-mono text-center tracking-widest text-white/15 group-hover:text-green-400 transition-colors duration-200">
        TAP TO USE
      </div>

      {isMasterFavoritesView && cookie.hidden_by_label && (
        <div className="mt-1 text-[10px] text-white/35 font-mono text-center">
          hidden by: {cookie.hidden_by_label}
        </div>
      )}
    </motion.div>
  );
}

function FreeCookieModal({
  cookie,
  globalIndex,
  isAdmin,
  canFavorite,
  isFavorited,
  onToggleFavorite,
  onClose,
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
  const cookieSource = cookie.source === 'admin' ? 'admin' : 'free';
  const sourceLabel = cookieSource === 'admin' ? 'ADMIN' : 'FREE';

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
          className="relative w-[calc(100vw-2rem)] sm:w-[500px] max-h-[85vh] bg-[#0a0a0a] border border-white/10 rounded-2xl z-10 flex flex-col overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_24px_48px_rgba(0,0,0,0.8)]"
        >
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div
                className={`w-2 h-2 rounded-full ${
                  isAlive
                    ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]'
                    : 'bg-red-400'
                }`}
              />
              <span className="font-mono text-xs text-white/40">
                {sourceLabel} COOKIE #{Number(globalIndex) + 1}
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
                  type="button"
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
                    className={`w-4 h-4 ${isFavorited ? 'fill-yellow-400' : ''}`}
                  />
                </button>
              )}

              <button
                type="button"
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
                    <Key className="w-4 h-4 text-green-400/60" />
                    <span className="text-xs text-white/40 uppercase tracking-wide">
                      NFToken
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleRefreshToken}
                    disabled={tokenRefreshing}
                    className="flex items-center gap-1 text-[10px] text-white/30 hover:text-green-400 transition-colors disabled:opacity-50"
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
                  <code className="flex-1 font-mono text-xs text-green-400/80 bg-black/40 px-3 py-2 rounded-lg truncate">
                    {currentNftoken}
                  </code>
                  <CopyBtn
                    text={currentNftoken}
                    testId={`nftoken-copy-${globalIndex}`}
                  />
                </div>

                {currentNftokenLink && (
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <a
                      href={currentNftokenLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bebas tracking-widest uppercase bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25 transition-all"
                    >
                      <Link2 className="w-4 h-4" />
                      Open Netflix
                    </a>

                    <a
                      href={`https://www.netflix.com/?nftoken=${currentNftoken}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bebas tracking-widest uppercase bg-blue-500/15 text-blue-300 border border-blue-500/30 hover:bg-blue-500/25 transition-all"
                    >
                      <Smartphone className="w-4 h-4" />
                      Open on Phone
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
                    type="button"
                    onClick={handleTvCode}
                    disabled={tvLoading || !tvCode.trim()}
                    className="bg-blue-500/15 text-blue-300 border border-blue-500/30 hover:bg-blue-500/25 font-bebas tracking-widest uppercase rounded-xl h-10 px-5 shrink-0 flex items-center gap-1.5 disabled:opacity-50"
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
                  Open Netflix on your TV, select &quot;Sign In&quot; and enter
                  the 8-digit code shown.
                </p>
              </div>
            )}

            {isAdmin && cookie.browser_cookies && (
              <div className="border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowBrowserCookies(p => !p)}
                  className="w-full px-5 py-3 flex items-center justify-between text-xs text-green-400/50 hover:text-green-400/80 transition-colors"
                  data-testid={`free-browser-cookies-expand-${globalIndex}`}
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
                      <CopyBtn
                        text={cookie.browser_cookies}
                        testId={`free-browser-cookies-copy-${globalIndex}`}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {isAdmin && cookie.full_cookie && (
              <div className="border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowCookie(p => !p)}
                  className="w-full px-5 py-3 flex items-center justify-between text-xs text-white/30 hover:text-white/50 transition-colors"
                  data-testid={`free-cookie-expand-${globalIndex}`}
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
                      <CopyBtn
                        text={cookie.full_cookie}
                        testId={`free-cookie-copy-${globalIndex}`}
                      />
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

  const [filters, setFilters] = useState({
    status: 'all',
    plan: 'all',
    country: 'all',
  });

  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [allPlanOptions, setAllPlanOptions] = useState(['all']);
  const [allCountryOptions, setAllCountryOptions] = useState(['all']);

  const [activeTab, setActiveTab] = useState('all');
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [favoriteCookiesMaster, setFavoriteCookiesMaster] = useState([]);
  const [favoriteCookiesOthers, setFavoriteCookiesOthers] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token],
  );

  const isAdmin = user?.is_master === true;
  const isPremium = user?.tier === 'premium' && !isAdmin;
  const canFavorite = isAdmin || isPremium;
  const pageSize = 21;

  const fetchCookies = async (pageParam = 1, filtersParam = filters) => {
    setLoading(true);

    try {
      const params = {
        page: pageParam,
        page_size: pageSize,
        status: filtersParam.status === 'all' ? '' : filtersParam.status,
        plan: filtersParam.plan === 'all' ? '' : filtersParam.plan,
        country: filtersParam.country === 'all' ? '' : filtersParam.country,
      };

      const res = await axios.get(`${API}/free-cookies`, {
        headers,
        params,
      });

      const data = res.data || {};
      const list = Array.isArray(data.cookies) ? data.cookies : [];

      setCookies(list);
      setTotal(typeof data.total === 'number' ? data.total : list.length);
      setTotalPages(
        typeof data.total_pages === 'number' && data.total_pages > 0
          ? data.total_pages
          : 1,
      );

      const backendPlans = Array.isArray(data.available_plans)
        ? data.available_plans.filter(Boolean)
        : [];
      const backendCountries = Array.isArray(data.available_countries)
        ? data.available_countries.filter(Boolean)
        : [];

      const fallbackPlans = Array.from(
        new Set(list.map(c => c.plan).filter(Boolean)),
      ).sort();

      const fallbackCountries = Array.from(
        new Set(list.map(c => c.country).filter(Boolean)),
      ).sort();

      setAllPlanOptions([
        'all',
        ...(backendPlans.length > 0 ? backendPlans : fallbackPlans),
      ]);
      setAllCountryOptions([
        'all',
        ...(backendCountries.length > 0 ? backendCountries : fallbackCountries),
      ]);
    } catch (err) {
      console.error('Failed to load free cookies:', err);
      setCookies([]);
      setTotal(0);
      setTotalPages(1);
      toast.error(
        err.response?.data?.detail || 'Failed to load free cookies',
      );
    } finally {
      setLoading(false);
    }
  };

  const saveLimit = async () => {
    const val = parseInt(limitInput, 10);
    if (Number.isNaN(val) || val <= 0) {
      toast.error('Enter a valid positive number');
      return;
    }

    setSavingLimit(true);
    try {
      const res = await axios.patch(
        `${API}/admin/free-cookies/limit`,
        { limit: val },
        { headers },
      );
      toast.success(res.data.message || 'Limit updated');
      setDisplayLimit(val);
      setLimitInput('');
    } catch (err) {
      toast.error(
        err.response?.data?.detail || 'Failed to update free cookies limit',
      );
    } finally {
      setSavingLimit(false);
    }
  };

  const refreshTokens = async () => {
    setRefreshing(true);

    try {
      const batchSize = 25;
      const totalCookies = cookies.length;

      for (let i = 0; i < totalCookies; i += batchSize) {
        const batch = cookies.slice(i, i + batchSize);

        await Promise.all(
          batch.map(cookie => {
            const endpoint = `${API}/free-cookies/${cookie.id}/refresh-token`;
            return axios.post(endpoint, {}, { headers });
          }),
        );
      }

      toast.success('All tokens refreshed');
      await fetchCookies(page, filters);
    } catch (err) {
      toast.error(
        err.response?.data?.detail || 'Failed to refresh free tokens',
      );
    } finally {
      setRefreshing(false);
    }
  };

  const fetchLimit = async () => {
    if (!isAdmin) return;

    try {
      const res = await axios.get(`${API}/admin/free-cookies/limit`, {
        headers,
      });
      if (typeof res.data.limit === 'number') {
        setDisplayLimit(res.data.limit);
      }
    } catch {
      // ignore
    }
  };

  const handleDeleteCookie = async cookieToDelete => {
    if (!isAdmin) return;

    const cookieId =
      typeof cookieToDelete === 'string' ? cookieToDelete : cookieToDelete?.id;

    const cookieSource =
      typeof cookieToDelete === 'object' && cookieToDelete?.source === 'admin'
        ? 'admin'
        : 'free';

    const sourceLabel = cookieSource === 'admin' ? 'admin' : 'free';

    const endpoint =
      cookieSource === 'admin'
        ? `${API}/admin/admin-cookies/${cookieId}`
        : `${API}/admin/free-cookies/${cookieId}`;

    if (!window.confirm(`Delete this ${sourceLabel} cookie?`)) return;

    try {
      await axios.delete(endpoint, { headers });

      toast.success(
        cookieSource === 'admin'
          ? 'Admin cookie deleted'
          : 'Free cookie deleted',
      );

      setCookies(prev => prev.filter(c => c.id !== cookieId));
      setFavoriteCookiesMaster(prev => prev.filter(c => c.id !== cookieId));
      setFavoriteCookiesOthers(prev => prev.filter(c => c.id !== cookieId));
      setFavoriteIds(prev => {
        const next = new Set(prev);
        next.delete(cookieId);
        return next;
      });

      if (selectedCookie?.id === cookieId) {
        setSelectedCookie(null);
        setSelectedGlobalIndex(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete cookie');
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

      const all = (res.data.cookies || []).map(c => ({
        ...c,
        source: c.source === 'admin' ? 'admin' : 'free',
      }));

      if (isAdmin) {
        const mine = all.filter(c => c.is_mine === true);
        const others = all.filter(c => c.is_mine !== true);

        setFavoriteCookiesMaster(mine);
        setFavoriteCookiesOthers(others);
      } else {
        setFavoriteCookiesMaster(all);
        setFavoriteCookiesOthers([]);
      }
    } catch {
      toast.error('Failed to load favorites');
    } finally {
      setFavoritesLoading(false);
    }
  };

  const updateFilters = updater => {
    setPage(1);
    setPageInput('1');
    setFilters(prev =>
      typeof updater === 'function' ? updater(prev) : updater,
    );
  };

  const handlePageChange = newPage => {
    const nextPage = Math.min(totalPages, Math.max(1, newPage));
    setPage(nextPage);
    setPageInput(String(nextPage));
  };

  const handlePageJump = () => {
    const parsed = Number.parseInt(pageInput, 10);
    if (Number.isNaN(parsed)) {
      setPageInput(String(page));
      return;
    }

    handlePageChange(parsed);
  };

  const toggleFavorite = async cookieId => {
    if (!canFavorite) {
      toast.error('Favorites are only for premium and master keys');
      return;
    }

    const isAlreadyFav = favoriteIds.has(cookieId);

    if (!isAdmin && !isAlreadyFav && favoriteIds.size >= 10) {
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
      }

      setFavoriteIds(newIds);

      if (activeTab === 'favorites') {
        await fetchFavorites();
      } else {
        await fetchCookies(page, filters);
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to update favorites';
      toast.error(msg);
    }
  };

  useEffect(() => {
    if (!token || !canFavorite) return;
    fetchFavoriteIds();
  }, [token, canFavorite]);

  useEffect(() => {
    if (!token || !isAdmin) return;
    fetchLimit();
  }, [token, isAdmin]);

  useEffect(() => {
    if (!token || activeTab !== 'all') return;
    fetchCookies(page, filters);
  }, [token, activeTab, page, filters]);

  useEffect(() => {
    if (!token || activeTab !== 'favorites') return;
    fetchFavorites();
  }, [token, activeTab]);

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  const publicCookies = useMemo(() => {
    if (isAdmin) return cookies;
    return cookies.filter(c => !favoriteIds.has(c.id));
  }, [cookies, favoriteIds, isAdmin]);

  const visibleList =
    activeTab === 'favorites'
      ? [...favoriteCookiesMaster, ...favoriteCookiesOthers]
      : publicCookies;

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="max-w-5xl mx-auto px-6 py-6 md:py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Cookie className="w-7 h-7 text-green-400" />
              <div>
                <h1 className="font-bebas text-4xl sm:text-5xl tracking-wider text-white">
                  FREE <span className="text-green-400">COOKIES</span>
                </h1>
                <p className="text-xs text-white/40 mt-1">
                  Public stock for free users. Premium/master can favorite and
                  hide cards for themselves.
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="font-bebas text-lg tracking-widest text-green-400">
                {visibleList.length}/{total} COOKIES
              </div>

              {isPremium && (
                <div className="text-[11px] text-white/40 mt-1">
                  Favorites: {favoriteIds.size}/10
                </div>
              )}

              {isAdmin && (
                <div className="text-[11px] text-white/40 mt-1">
                  MASTER KEY
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <div className="flex items-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-mono uppercase tracking-wide border transition-all ${
              activeTab === 'all'
                ? 'bg-green-500/15 text-green-400 border-green-500/30'
                : 'text-white/30 border-white/8 hover:border-green-500/20 hover:text-green-400/60'
            }`}
          >
            <Cookie className="w-3.5 h-3.5" />
            All Free
          </button>

          {canFavorite && (
            <button
              type="button"
              onClick={() => setActiveTab('favorites')}
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
                  {favoriteIds.size}
                </span>
              )}
            </button>
          )}
        </div>

        {isAdmin && (
          <div className="bg-gradient-to-b from-green-500/10 to-black border border-green-500/30 rounded-2xl p-5 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-4 h-4 text-white/60" />
                <h2 className="font-bebas text-lg tracking-wider text-white">
                  FREE COOKIES CONTROL
                </h2>
              </div>
              <p className="text-xs text-white/40 mb-2">
                Control how many free cookies are visible to non-premium users,
                and refresh NFToken for all free cookies.
              </p>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/50">
                  Current limit:{' '}
                  <span className="font-mono text-green-400">
                    {displayLimit}
                  </span>
                </span>

                <div className="flex items-center gap-1.5">
                  <Input
                    className="w-16 h-8 bg-black/60 border border-white/15 text-xs text-white px-2"
                    value={limitInput}
                    onChange={e => setLimitInput(e.target.value)}
                    placeholder={String(displayLimit)}
                  />
                  <Button
                    size="sm"
                    onClick={saveLimit}
                    disabled={savingLimit}
                    className="h-8 px-3 text-xs bg-green-500/20 hover:bg-green-500/30 text-green-100 border border-green-500/40"
                  >
                    {savingLimit ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      'Set'
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2">
              <Button
                onClick={refreshTokens}
                disabled={refreshing}
                className="bg-green-500/20 hover:bg-green-500/30 text-green-100 border border-green-500/40 h-9 px-4 text-xs font-bebas tracking-widest uppercase flex items-center gap-2"
              >
                {refreshing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                REFRESH TOKENS
              </Button>
              <span className="text-[11px] text-white/40">
                This will try to re-generate NFToken for all free cookies.
              </span>
            </div>
          </div>
        )}

        {activeTab === 'favorites' && canFavorite ? (
          favoritesLoading ? (
            <div className="text-center py-16">
              <Loader2 className="w-8 h-8 text-yellow-400 animate-spin mx-auto" />
            </div>
          ) : !isAdmin ? (
            favoriteCookiesMaster.length === 0 ? (
              <div className="text-center py-16 text-white/40">
                <Star className="w-10 h-10 mx-auto mb-2 text-white/20" />
                <p>No favorites yet.</p>
                <p className="text-xs text-white/30 mt-1">
                  Tap the star on any cookie to add it here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteCookiesMaster.map(cookie => (
                  <FreeCookieSmallCard
                    key={`${cookie.source || 'free'}-${cookie.id}`}
                    cookie={cookie}
                    globalIndex={stableIndexFromId(cookie.id)}
                    isAdmin={isAdmin}
                    canFavorite={canFavorite}
                    isFavorited={favoriteIds.has(cookie.id)}
                    onDelete={handleDeleteCookie}
                    onClick={() => {
                      setSelectedCookie(cookie);
                      setSelectedGlobalIndex(stableIndexFromId(cookie.id));
                    }}
                    onToggleFavorite={toggleFavorite}
                    isMasterFavoritesView={false}
                    showSourceBadge={true}
                  />
                ))}
              </div>
            )
          ) : (
            <>
              <h3 className="text-xs font-mono uppercase tracking-wide text-white/40 mb-2">
                Your favorites
              </h3>

              {favoriteCookiesMaster.length === 0 ? (
                <p className="text-[11px] text-white/30 mb-4">
                  You have no favorites yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {favoriteCookiesMaster.map(cookie => (
                    <FreeCookieSmallCard
                      key={`${cookie.source || 'free'}-${cookie.id}`}
                      cookie={cookie}
                      globalIndex={stableIndexFromId(cookie.id)}
                      isAdmin={isAdmin}
                      canFavorite={canFavorite}
                      isFavorited={favoriteIds.has(cookie.id)}
                      onDelete={handleDeleteCookie}
                      onClick={() => {
                        setSelectedCookie(cookie);
                        setSelectedGlobalIndex(stableIndexFromId(cookie.id));
                      }}
                      onToggleFavorite={toggleFavorite}
                      isMasterFavoritesView={true}
                      showSourceBadge={true}
                    />
                  ))}
                </div>
              )}

              <div className="border-t border-white/10 my-4 pt-3">
                <h3 className="text-xs font-mono uppercase tracking-wide text-white/40 mb-2">
                  Premium users’ favorites
                </h3>
              </div>

              {favoriteCookiesOthers.length === 0 ? (
                <p className="text-[11px] text-white/30">
                  No favorites from premium users yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favoriteCookiesOthers.map(cookie => (
                    <FreeCookieSmallCard
                      key={`${cookie.source || 'free'}-${cookie.id}`}
                      cookie={cookie}
                      globalIndex={stableIndexFromId(cookie.id)}
                      isAdmin={isAdmin}
                      canFavorite={canFavorite}
                      isFavorited={favoriteIds.has(cookie.id)}
                      onDelete={handleDeleteCookie}
                      onClick={() => {
                        setSelectedCookie(cookie);
                        setSelectedGlobalIndex(stableIndexFromId(cookie.id));
                      }}
                      onToggleFavorite={toggleFavorite}
                      isMasterFavoritesView={true}
                      showSourceBadge={true}
                    />
                  ))}
                </div>
              )}
            </>
          )
        ) : loading ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 text-green-400 animate-spin mx-auto" />
          </div>
        ) : (
          <>
            <FilterBar
              filters={filters}
              setFilters={updateFilters}
              planOptions={allPlanOptions}
              countryOptions={allCountryOptions}
              disabled={loading}
            />

            {publicCookies.length === 0 ? (
              <div className="text-center py-16 text-white/40">
                <Cookie className="w-10 h-10 mx-auto mb-2 text-white/20" />
                <p>No cookies match the selected filters.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {publicCookies.map((cookie, idx) => (
                    <FreeCookieSmallCard
                      key={cookie.id}
                      cookie={cookie}
                      globalIndex={(page - 1) * pageSize + idx}
                      isAdmin={isAdmin}
                      canFavorite={canFavorite}
                      isFavorited={favoriteIds.has(cookie.id)}
                      onDelete={handleDeleteCookie}
                      onClick={() => {
                        setSelectedCookie(cookie);
                        setSelectedGlobalIndex((page - 1) * pageSize + idx);
                      }}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-8">
                    <button
                      type="button"
                      disabled={page === 1}
                      onClick={() => handlePageChange(page - 1)}
                      className="text-xs text-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Prev
                    </button>

                    <span className="text-xs text-white/40 font-mono">
                      Page {page} of {totalPages}
                    </span>

                    <div className="flex items-center gap-1">
                      <input
                        value={pageInput}
                        onChange={e => setPageInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handlePageJump()}
                        className="w-14 h-7 bg-black/60 border border-white/15 rounded-md px-2 text-xs text-white/70 outline-none focus:border-green-500/40"
                        inputMode="numeric"
                      />
                      <button
                        type="button"
                        onClick={handlePageJump}
                        className="h-7 px-2 rounded-md border border-white/15 text-[10px] font-mono text-white/50 hover:text-white hover:border-green-500/30 transition-colors"
                      >
                        Go
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={page === totalPages}
                      onClick={() => handlePageChange(page + 1)}
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

        {selectedCookie && (
          <FreeCookieModal
            cookie={selectedCookie}
            globalIndex={selectedGlobalIndex ?? 0}
            isAdmin={isAdmin}
            canFavorite={canFavorite}
            isFavorited={favoriteIds.has(selectedCookie.id)}
            onToggleFavorite={toggleFavorite}
            onClose={() => {
              setSelectedCookie(null);
              setSelectedGlobalIndex(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
