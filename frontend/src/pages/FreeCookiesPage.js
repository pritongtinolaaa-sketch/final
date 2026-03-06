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

// Filter bar that calls onApply so filters trigger fetch
function FilterBar({ filters, onApply, planOptions, countryOptions }) {
  const statuses = ['all', 'alive', 'dead'];
  const selectClass =
    'bg-black/50 border border-white/10 text-white/60 text-xs rounded-lg px-3 h-8 outline-none focus:border-green-500/40 cursor-pointer hover:border-white/20 transition-colors';

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
            onClick={() => onApply({ ...filters, status: s })}
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
        onChange={e => onApply({ ...filters, plan: e.target.value })}
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
        onChange={e =>
          onApply({ ...filters, country: e.target.value })
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
          onClick={() =>
            onApply({ status: 'all', plan: 'all', country: 'all' })
          }
          className="px-3 h-8 rounded-lg text-xs font-mono uppercase tracking-wide text-white/25 border border-white/8 hover:text-red-400 hover:border-red-500/30 transition-all"
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
      transition={{ delay: (globalIndex % 21) * 0.04 }}
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
            #{globalIndex + 1}
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
      toast.error(
        err.response?.data?.detail || 'Failed to activate TV',
      );
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
          {/* keep your original modal body here */}
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

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'favorites'
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [favoriteCookiesMaster, setFavoriteCookiesMaster] = useState([]);
  const [favoriteCookiesOthers, setFavoriteCookiesOthers] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };
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
        status: filtersParam.status,
        plan: filtersParam.plan === 'all' ? '' : filtersParam.plan,
        country: filtersParam.country === 'all' ? '' : filtersParam.country,
      };

      const res = await axios.get(`${API}/free-cookies`, {
        headers,
        params,
      });

      const data = res.data;
      const list = data.cookies || [];
      setCookies(list);
      setTotal(data.total || list.length);
      setTotalPages(data.total_pages || 1);

      const plans = Array.from(
        new Set(list.map(c => c.plan).filter(Boolean)),
      ).sort();
      const countries = Array.from(
        new Set(list.map(c => c.country).filter(Boolean)),
      ).sort();
      setAllPlanOptions(['all', ...plans]);
      setAllCountryOptions(['all', ...countries]);
    } catch {
      toast.error('Failed to load free cookies');
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
      const res = await axios.post(
        `${API}/admin/free-cookies/refresh`,
        {},
        { headers },
      );
      toast.success(res.data.message || 'Tokens refreshed');
      fetchCookies(page, filters);
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
    const normalizedSource = cookieSource;
    const sourceLabel = cookieSource === 'admin' ? 'admin' : 'free';
    const endpoint =
      cookieSource === 'admin'
        ? `${API}/admin/admin-cookies/${cookieId}`
        : `${API}/admin/free-cookies/${cookieId}`;

    if (!window.confirm(`Delete this ${sourceLabel} cookie?`)) return;
    try {
      await axios.delete(endpoint, { headers });
      toast.success(
        cookieSource === 'admin' ? 'Admin cookie deleted' : 'Free cookie deleted',
      );
      setCookies(prev => prev.filter(c => c.id !== cookieId));
      setFavoriteCookiesMaster(prev =>
        prev.filter(
          c =>
            !(
              c.id === cookieId &&
              (c.source === 'admin' ? 'admin' : 'free') === normalizedSource
            ),
        ),
      );
      setFavoriteCookiesOthers(prev =>
        prev.filter(
          c =>
            !(
              c.id === cookieId &&
              (c.source === 'admin' ? 'admin' : 'free') === normalizedSource
            ),
        ),
      );
      setFavoriteIds(prev => {
        const n = new Set(prev);
        n.delete(cookieId);
        return n;
      });
    } catch (err) {
      toast.error(
        err.response?.data?.detail || 'Failed to delete cookie',
      );
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
        const myId = user?.id;
        const mine = all.filter(c => c.hidden_by === myId);
        const others = all.filter(
          c => c.hidden_by && c.hidden_by !== myId,
        );
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

  useEffect(() => {
    if (!token) return;
    fetchCookies(1, filters);
    fetchFavoriteIds();
    fetchLimit();
  }, [token]); // eslint-disable-line

  useEffect(() => {
    if (activeTab === 'favorites') {
      fetchFavorites();
    }
  }, [activeTab]); // eslint-disable-line

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  const handlePageChange = (newPage, filtersParam = filters) => {
    setPage(newPage);
    fetchCookies(newPage, filtersParam);
  };

  const handleFilterApply = newFilters => {
    setFilters(newFilters);
    handlePageChange(1, newFilters);
  };

  const handlePageJump = () => {
    const parsed = Number.parseInt(pageInput, 10);
    if (Number.isNaN(parsed)) {
      setPageInput(String(page));
      return;
    }
    const nextPage = Math.min(totalPages, Math.max(1, parsed));
    handlePageChange(nextPage);
    setPageInput(String(nextPage));
  };

  const publicCookies = useMemo(() => {
    if (isAdmin) return cookies;
    return cookies.filter(c => !favoriteIds.has(c.id));
  }, [cookies, favoriteIds, isAdmin]);

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
        setCookies(prev => prev.filter(c => c.id !== cookieId));
      } else {
        newIds.delete(cookieId);
        toast.success('Removed from favorites');
        if (activeTab === 'favorites') {
          setFavoriteCookiesMaster(prev =>
            prev.filter(c => c.id !== cookieId),
          );
          setFavoriteCookiesOthers(prev =>
            prev.filter(c => c.id !== cookieId),
          );
        }
        fetchCookies(page, filters);
      }
      setFavoriteIds(newIds);
    } catch (err) {
      const msg =
        err.response?.data?.detail || 'Failed to update favorites';
      toast.error(msg);
    }
  };

  const visibleList =
    activeTab === 'favorites'
      ? [...favoriteCookiesMaster, ...favoriteCookiesOthers]
      : publicCookies;

  const selectedIndex = selectedCookie
    ? visibleList.findIndex(c => c.id === selectedCookie.id)
    : -1;

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="max-w-5xl mx-auto px-6 py-6 md:py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Cookie className="w-7 h-7 text-green-400" />
              <div>
                <h1 className="font-bebas text-4xl sm:text-5xl tracking-wider text-white">
                  FREE <span className="text-green-400">COOKIES</span>
                </h1>
                <p className="text-xs text-white/40 mt-1">
                  Public stock for free users. Premium/master can favorite and hide cards for themselves.
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
                Control how many free cookies are visible to non‑premium users, and refresh NFToken for all free cookies.
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
                This will try to re‑generate NFToken for all free cookies.
              </span>
            </div>
          </div>
        )}

        // (imports and helpers stay exactly as in the last full file I sent)
    // Only the main component body matters for your issue:

export default function FreeCookiesPage() {
  // ...all the state, effects, helpers, toggleFavorite, etc. exactly as in the last file...

  // keep everything from the previous full file unchanged
  // down to the return below:

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="max-w-5xl mx-auto px-6 py-6 md:py-10">
        {/* header */}
        {/* ...same header and tabs as before... */}

        {isAdmin && (
          /* admin control card ... unchanged */
        )}

        {activeTab === 'favorites' && canFavorite ? (
          favoritesLoading ? (
            <div className="text-center py-16">
              <Loader2 className="w-8 h-8 text-yellow-400 animate-spin mx-auto" />
            </div>
          ) : !isAdmin ? (
            // PREMIUM (non‑master): all favorites in one list
            favoriteCookiesMaster.length === 0 ? (
              <div className="text-center py-16 text-white/40">
                <Star className="w-10 h-10 mx-auto mb-2 text-white/20" />
                <p>No favorites yet.</p>
                <p className="text-xs text-white/30 mt-1">
                  Click the star on any card in All Free to add it here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteCookiesMaster.map((cookie, idx) => (
                  <FreeCookieSmallCard
                    key={`${cookie.id}-${cookie.source}-${idx}`}
                    cookie={cookie}
                    globalIndex={idx}
                    isAdmin={isAdmin}
                    canFavorite={canFavorite}
                    isFavorited={favoriteIds.has(cookie.id)}
                    onDelete={handleDeleteCookie}
                    onClick={() => {
                      setSelectedCookie(cookie);
                      setSelectedGlobalIndex(idx);
                    }}
                    onToggleFavorite={toggleFavorite}
                    showSourceBadge
                  />
                ))}
              </div>
            )
          ) : (
            // MASTER: split into my favorites and others’ hidden cookies
            <>
              <h2 className="font-bebas text-lg tracking-wider text-white mb-3">
                My Favorites
              </h2>
              {favoriteCookiesMaster.length === 0 ? (
                <div className="text-center py-10 text-white/40 border border-dashed border-white/10 rounded-xl mb-6">
                  <Star className="w-8 h-8 mx-auto mb-2 text-white/20" />
                  <p>No favorites yet for this master key.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {favoriteCookiesMaster.map((cookie, idx) => (
                    <FreeCookieSmallCard
                      key={`mine-${cookie.id}-${cookie.source}-${idx}`}
                      cookie={cookie}
                      globalIndex={idx}
                      isAdmin={isAdmin}
                      canFavorite={canFavorite}
                      isFavorited={favoriteIds.has(cookie.id)}
                      onDelete={handleDeleteCookie}
                      onClick={() => {
                        setSelectedCookie(cookie);
                        setSelectedGlobalIndex(idx);
                      }}
                      onToggleFavorite={toggleFavorite}
                      isMasterFavoritesView
                      showSourceBadge
                    />
                  ))}
                </div>
              )}

              <h2 className="font-bebas text-lg tracking-wider text-white mb-3">
                Hidden by Other Keys
              </h2>
              {favoriteCookiesOthers.length === 0 ? (
                <div className="text-center py-6 text-white/35 text-xs border border-dashed border-white/10 rounded-xl">
                  <p>No favorites from other keys.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favoriteCookiesOthers.map((cookie, idx) => (
                    <FreeCookieSmallCard
                      key={`others-${cookie.id}-${cookie.source}-${idx}`}
                      cookie={cookie}
                      globalIndex={idx}
                      isAdmin={isAdmin}
                      canFavorite={canFavorite}
                      isFavorited={favoriteIds.has(cookie.id)}
                      onDelete={handleDeleteCookie}
                      onClick={() => {
                        setSelectedCookie(cookie);
                        setSelectedGlobalIndex(idx);
                      }}
                      onToggleFavorite={toggleFavorite}
                      isMasterFavoritesView
                      showSourceBadge
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
        ) : publicCookies.length === 0 ? (
          <div className="text-center py-16 text-white/40">
            <Cookie className="w-10 h-10 mx-auto mb-2 text-white/20" />
            <p>No free cookies available.</p>
          </div>
        ) : (
          <>
            <FilterBar
              filters={filters}
              onApply={handleFilterApply}
              planOptions={allPlanOptions}
              countryOptions={allCountryOptions}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleList.map((cookie, idx) => (
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
                    setSelectedGlobalIndex(
                      (page - 1) * pageSize + idx,
                    );
                  }}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  disabled={page === 1}
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
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
                    onClick={handlePageJump}
                    className="h-7 px-2 rounded-md border border-white/15 text-[10px] font-mono text-white/50 hover:text-white hover:border-green-500/30 transition-colors"
                  >
                    Go
                  </button>
                </div>
                <button
                  disabled={page === totalPages}
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, page + 1))
                  }
                  className="text-xs text-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
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

          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 text-green-400 animate-spin mx-auto" />
          </div>
        ) : publicCookies.length === 0 ? (
          <div className="text-center py-16 text-white/40">
            <Cookie className="w-10 h-10 mx-auto mb-2 text-white/20" />
            <p>No free cookies available.</p>
          </div>
        ) : (
          <>
            <FilterBar
              filters={filters}
              onApply={handleFilterApply}
              planOptions={allPlanOptions}
              countryOptions={allCountryOptions}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleList.map((cookie, idx) => (
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
                    setSelectedGlobalIndex(
                      (page - 1) * pageSize + idx,
                    );
                  }}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  disabled={page === 1}
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
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
                    onClick={handlePageJump}
                    className="h-7 px-2 rounded-md border border-white/15 text-[10px] font-mono text-white/50 hover:text-white hover:border-green-500/30 transition-colors"
                  >
                    Go
                  </button>
                </div>
                <button
                  disabled={page === totalPages}
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, page + 1))
                  }
                  className="text-xs text-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
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
