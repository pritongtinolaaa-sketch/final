import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Key,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Users,
  Monitor,
  Copy,
  X,
  Loader2,
  KeyRound,
  Calendar,
  Clock,
  Shield,
  Crown,
  Star,
  Pencil,
  Activity,
  TimerReset,
  History,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TIER_OPTIONS = ['free', 'premium'];

const TIER_STYLES = {
  master: 'bg-primary/20 text-primary border-primary/30',
  premium: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  free: 'bg-white/10 text-white/50 border-white/20',
};

const GROUP_CONFIG = {
  master: {
    label: 'MASTER',
    icon: Crown,
    accent: 'text-primary',
    border: 'border-primary/20',
    bg: 'from-primary/5 to-transparent',
    badgeBg: 'bg-primary/10 border-primary/20 text-primary',
    description: 'Full access — unlimited devices, all features',
  },
  premium: {
    label: 'PREMIUM',
    icon: Star,
    accent: 'text-purple-400',
    border: 'border-purple-500/20',
    bg: 'from-purple-500/5 to-transparent',
    badgeBg: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    description: 'Premium tier — access to admin cookies & more',
  },
  free: {
    label: 'FREE',
    icon: Key,
    accent: 'text-white/40',
    border: 'border-white/10',
    bg: 'from-white/[0.03] to-transparent',
    badgeBg: 'bg-white/5 border-white/10 text-white/40',
    description: 'Free tier — limited cookie access',
  },
};

export default function AdminPage() {
  const { user, token, isMaster } = useAuth();
  const navigate = useNavigate();

  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newLabel, setNewLabel] = useState('');
  const [newMaxDevices, setNewMaxDevices] = useState(1);
  const [customKey, setCustomKey] = useState('');
  const [newTier, setNewTier] = useState('free');
  const [creating, setCreating] = useState(false);

  const [revealedKeys, setRevealedKeys] = useState({});
  const [newKeyValue, setNewKeyValue] = useState(null);
  const [expandedSessions, setExpandedSessions] = useState(null);
  const [editingExpiry, setEditingExpiry] = useState({});
  const [editingTier, setEditingTier] = useState({});
  const [editingLabel, setEditingLabel] = useState({});

  const [trialStats, setTrialStats] = useState({
    active_now: 0,
    claimed_today: 0,
    claimed_24h: 0,
    recent_sessions: [],
  });
  const [trialStatsLoading, setTrialStatsLoading] = useState(true);

  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token],
  );

  const fetchKeys = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/admin/keys`, { headers });
      setKeys(res.data || []);
    } catch {
      toast.error('Failed to load keys');
    } finally {
      setLoading(false);
    }
  }, [headers]);

  const fetchTrialStats = useCallback(async () => {
    try {
      setTrialStatsLoading(true);
      const res = await axios.get(`${API}/admin/trial-stats`, { headers });
      setTrialStats({
        active_now: res.data?.active_now || 0,
        claimed_today: res.data?.claimed_today || 0,
        claimed_24h: res.data?.claimed_24h || 0,
        recent_sessions: res.data?.recent_sessions || [],
      });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load trial stats');
    } finally {
      setTrialStatsLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    if (!isMaster) {
      navigate('/');
      return;
    }

    fetchKeys();
    fetchTrialStats();
  }, [isMaster, navigate, fetchKeys, fetchTrialStats]);

  const createKey = async () => {
    if (!newLabel.trim()) {
      toast.error('Enter a label');
      return;
    }

    setCreating(true);
    try {
      const res = await axios.post(
        `${API}/admin/keys`,
        {
          label: newLabel,
          max_devices: newMaxDevices,
          custom_key: customKey.trim() || undefined,
          tier: newTier,
        },
        { headers },
      );

      setNewKeyValue(res.data.key_value);
      setNewLabel('');
      setNewMaxDevices(1);
      setCustomKey('');
      setNewTier('free');

      await fetchKeys();
      toast.success('Key created');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create key');
    } finally {
      setCreating(false);
    }
  };

  const deleteKey = async (keyId) => {
    try {
      await axios.delete(`${API}/admin/keys/${keyId}`, { headers });
      setKeys(prev => prev.filter(k => k.id !== keyId));
      toast.success('Key deleted');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete');
    }
  };

  const revealKey = async (keyId) => {
    try {
      const res = await axios.get(`${API}/admin/keys/${keyId}/reveal`, {
        headers,
      });
      setRevealedKeys(prev => ({ ...prev, [keyId]: res.data.key_value }));
    } catch {
      toast.error('Failed to reveal key');
    }
  };

  const revokeSession = async (keyId, sessionId) => {
    try {
      await axios.delete(`${API}/admin/keys/${keyId}/sessions/${sessionId}`, {
        headers,
      });
      await fetchKeys();
      toast.success('Session revoked');
    } catch {
      toast.error('Failed to revoke session');
    }
  };

  const updateExpiry = async (keyId, expiresAt) => {
    try {
      await axios.patch(
        `${API}/admin/keys/${keyId}`,
        { expires_at: expiresAt || '' },
        { headers },
      );
      await fetchKeys();
      setEditingExpiry(prev => ({ ...prev, [keyId]: false }));
      toast.success(expiresAt ? 'Expiry updated' : 'Expiry removed');
    } catch {
      toast.error('Failed to update expiry');
    }
  };

  const updateTier = async (keyId, tier) => {
    try {
      await axios.patch(
        `${API}/admin/keys/${keyId}`,
        { tier },
        { headers },
      );
      await fetchKeys();
      setEditingTier(prev => ({ ...prev, [keyId]: false }));
      toast.success(`Tier updated to ${tier}`);
    } catch {
      toast.error('Failed to update tier');
    }
  };

  const updateLabel = async (keyId, label) => {
    const nextLabel = String(label || '').trim();
    if (!nextLabel) {
      toast.error('Name cannot be empty');
      return;
    }

    try {
      await axios.patch(
        `${API}/admin/keys/${keyId}`,
        { label: nextLabel },
        { headers },
      );
      await fetchKeys();
      setEditingLabel(prev => ({ ...prev, [keyId]: false }));
      toast.success('Name updated');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update name');
    }
  };

  const copyText = async (text) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      toast.success('Copied');
    } catch {
      toast.error('Copy failed');
    }
  };

  const getExpiryStatus = (expiresAt) => {
    if (!expiresAt) return null;
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: 'EXPIRED',
        color: 'text-red-400 border-red-500/30 bg-red-500/10',
      };
    }
    if (diffDays <= 3) {
      return {
        label: `${diffDays}d left`,
        color: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
      };
    }
    if (diffDays <= 7) {
      return {
        label: `${diffDays}d left`,
        color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
      };
    }
    return {
      label: `${diffDays}d left`,
      color: 'text-green-400 border-green-500/30 bg-green-500/10',
    };
  };

  const toPhDatetimeLocal = (expiresAt) => {
    if (!expiresAt) return '';
    const phString = new Date(expiresAt).toLocaleString('en-US', {
      timeZone: 'Asia/Manila',
    });
    const phDate = new Date(phString);
    const pad = n => String(n).padStart(2, '0');

    return `${phDate.getFullYear()}-${pad(phDate.getMonth() + 1)}-${pad(
      phDate.getDate(),
    )}T${pad(phDate.getHours())}:${pad(phDate.getMinutes())}`;
  };

  const phLocalToUtc = (val) => {
    if (!val) return '';
    return new Date(`${val}+08:00`).toISOString();
  };

  const formatPHT = (value, withYear = false) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString('en-PH', {
      timeZone: 'Asia/Manila',
      year: withYear ? 'numeric' : undefined,
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const groupedKeys = {
    master: keys.filter(k => k.is_master),
    premium: keys.filter(k => !k.is_master && k.tier === 'premium'),
    free: keys.filter(k => !k.is_master && k.tier !== 'premium'),
  };

  const KeyCard = ({ keyItem, idx }) => {
    const expiryStatus = getExpiryStatus(keyItem.expires_at);
    const tier = keyItem.is_master ? 'master' : (keyItem.tier || 'free');

    return (
      <motion.div
        key={keyItem.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.04 }}
        data-testid={`key-card-${keyItem.id}`}
        className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-white/15 transition-colors"
      >
        <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white font-medium">{keyItem.label}</span>
              <Badge className={`border text-xs capitalize ${TIER_STYLES[tier]}`}>
                {tier === 'master' && <Shield className="w-3 h-3 mr-1" />}
                {tier}
              </Badge>
              {expiryStatus && (
                <Badge className={`border text-xs font-mono ${expiryStatus.color}`}>
                  <Clock className="w-3 h-3 mr-1" />
                  {expiryStatus.label}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 mt-1 text-sm flex-wrap">
              <span className="font-mono text-white/30">••••••••••••</span>
              <span className="flex items-center gap-1 text-white/30">
                <Monitor className="w-3.5 h-3.5" />
                {keyItem.session_count}/{keyItem.max_devices} devices
              </span>

              {keyItem.expires_at && (
                <span className="flex items-center gap-1 text-white/20 text-xs">
                  <Calendar className="w-3 h-3" />
                  Expires{' '}
                  {new Date(keyItem.expires_at).toLocaleString('en-PH', {
                    timeZone: 'Asia/Manila',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}{' '}
                  PHT
                </span>
              )}
            </div>

            {editingExpiry[keyItem.id] && !keyItem.is_master && (
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <Input
                  type="datetime-local"
                  defaultValue={toPhDatetimeLocal(keyItem.expires_at)}
                  id={`expiry-input-${keyItem.id}`}
                  className="bg-black/50 border-white/10 focus:border-primary text-white h-8 w-52 text-xs [color-scheme:dark]"
                />
                <span className="text-[10px] text-white/20 font-mono">
                  PH Time (UTC+8)
                </span>
                <Button
                  size="sm"
                  onClick={() => {
                    const val = document.getElementById(
                      `expiry-input-${keyItem.id}`,
                    ).value;
                    if (!val) return;
                    updateExpiry(keyItem.id, phLocalToUtc(val));
                  }}
                  className="h-8 bg-primary/20 hover:bg-primary/40 text-primary text-xs px-3"
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => updateExpiry(keyItem.id, '')}
                  className="h-8 text-white/30 hover:text-red-400 text-xs px-3"
                >
                  Remove
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setEditingExpiry(prev => ({ ...prev, [keyItem.id]: false }))
                  }
                  className="h-8 text-white/20 hover:text-white px-2"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}

            {editingTier[keyItem.id] && !keyItem.is_master && (
              <div className="flex items-center gap-2 mt-3">
                <select
                  defaultValue={keyItem.tier || 'free'}
                  id={`tier-input-${keyItem.id}`}
                  className="bg-black/50 border border-white/10 focus:border-primary text-white h-8 rounded-md px-3 text-xs outline-none cursor-pointer"
                >
                  {TIER_OPTIONS.map(t => (
                    <option key={t} value={t} className="bg-[#111] capitalize">
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  onClick={() => {
                    const val = document.getElementById(
                      `tier-input-${keyItem.id}`,
                    ).value;
                    updateTier(keyItem.id, val);
                  }}
                  className="h-8 bg-purple-500/20 hover:bg-purple-500/40 text-purple-400 text-xs px-3"
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setEditingTier(prev => ({ ...prev, [keyItem.id]: false }))
                  }
                  className="h-8 text-white/20 hover:text-white px-2"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}

            {editingLabel[keyItem.id] && (
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <Input
                  type="text"
                  defaultValue={keyItem.label}
                  id={`label-input-${keyItem.id}`}
                  className="bg-black/50 border-white/10 focus:border-primary text-white h-8 w-56 text-xs"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const val = document.getElementById(
                        `label-input-${keyItem.id}`,
                      ).value;
                      updateLabel(keyItem.id, val);
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={() => {
                    const val = document.getElementById(
                      `label-input-${keyItem.id}`,
                    ).value;
                    updateLabel(keyItem.id, val);
                  }}
                  className="h-8 bg-primary/20 hover:bg-primary/40 text-primary text-xs px-3"
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setEditingLabel(prev => ({ ...prev, [keyItem.id]: false }))
                  }
                  className="h-8 text-white/20 hover:text-white px-2"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {revealedKeys[keyItem.id] ? (
              <div className="flex items-center gap-2">
                <code className="font-mono text-xs text-green-400 bg-black/60 px-2 py-1 rounded max-w-[200px] truncate">
                  {revealedKeys[keyItem.id]}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyText(revealedKeys[keyItem.id])}
                  className="text-white/30 hover:text-white"
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setRevealedKeys(prev => {
                      const next = { ...prev };
                      delete next[keyItem.id];
                      return next;
                    })
                  }
                  className="text-white/30 hover:text-white"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => revealKey(keyItem.id)}
                className="text-white/30 hover:text-white"
              >
                <Eye className="w-3.5 h-3.5" />
              </Button>
            )}

            {!keyItem.is_master && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setEditingExpiry(prev => ({
                    ...prev,
                    [keyItem.id]: !prev[keyItem.id],
                  }))
                }
                className="text-white/30 hover:text-yellow-400"
                title="Set expiry"
              >
                <Calendar className="w-3.5 h-3.5" />
              </Button>
            )}

            {!keyItem.is_master && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setEditingTier(prev => ({
                    ...prev,
                    [keyItem.id]: !prev[keyItem.id],
                  }))
                }
                className="text-white/30 hover:text-purple-400"
                title="Change tier"
              >
                <Shield className="w-3.5 h-3.5" />
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                setExpandedSessions(expandedSessions === keyItem.id ? null : keyItem.id)
              }
              className="text-white/30 hover:text-white"
            >
              <Users className="w-3.5 h-3.5" />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                setEditingLabel(prev => ({
                  ...prev,
                  [keyItem.id]: !prev[keyItem.id],
                }))
              }
              className="text-white/30 hover:text-primary"
              title="Rename key"
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>

            {!keyItem.is_master && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteKey(keyItem.id)}
                className="text-white/20 hover:text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {expandedSessions === keyItem.id && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-4 pt-2 border-t border-white/5">
                <p className="text-xs text-white/30 uppercase tracking-wide mb-3">
                  Active Sessions
                </p>

                {keyItem.active_sessions?.length > 0 ? (
                  <div className="space-y-2">
                    {keyItem.active_sessions.map((session, si) => (
                      <div
                        key={session.session_id}
                        className="flex items-center justify-between bg-black/40 rounded px-3 py-2"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-400" />
                          <span className="font-mono text-xs text-white/40">
                            {session.session_id.slice(0, 8)}...
                          </span>
                          <span className="text-xs text-white/20">
                            {new Date(session.created_at).toLocaleString('en-PH', {
                              timeZone: 'Asia/Manila',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })}{' '}
                            PHT
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => revokeSession(keyItem.id, session.session_id)}
                          className="h-7 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 text-xs"
                          data-testid={`revoke-session-${si}`}
                        >
                          Revoke
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-white/20">No active sessions</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const KeyGroup = ({ groupKey }) => {
    const config = GROUP_CONFIG[groupKey];
    const groupKeys = groupedKeys[groupKey];
    const Icon = config.icon;

    if (groupKeys.length === 0 && groupKey !== 'free') return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border ${config.border} bg-gradient-to-b ${config.bg} p-5 mb-6`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Icon className={`w-4 h-4 ${config.accent}`} />
            <span className={`font-bebas text-lg tracking-widest ${config.accent}`}>
              {config.label}
            </span>
            <Badge className={`border text-[10px] font-mono px-2 ${config.badgeBg}`}>
              {groupKeys.length} {groupKeys.length === 1 ? 'KEY' : 'KEYS'}
            </Badge>
          </div>
          <span className="text-xs text-white/20 font-mono hidden sm:block">
            {config.description}
          </span>
        </div>

        {groupKeys.length === 0 ? (
          <div className="text-center py-8 text-white/20">
            <Key className="w-8 h-8 mx-auto mb-2 text-white/10" />
            <p className="text-xs font-mono">No {groupKey} keys yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groupKeys.map((keyItem, idx) => (
              <KeyCard key={keyItem.id} keyItem={keyItem} idx={idx} />
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  if (!isMaster) return null;

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="max-w-5xl mx-auto px-6 py-6 md:py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 mb-10">
            <KeyRound className="w-7 h-7 text-primary" />
            <h1
              className="font-bebas text-4xl sm:text-5xl tracking-wider text-white"
              data-testid="admin-title"
            >
              KEY <span className="text-primary">MANAGEMENT</span>
            </h1>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-black/60 backdrop-blur-md border border-green-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-xs text-white/40 uppercase tracking-wide">
                Active Trial Users
              </span>
            </div>
            <div className="font-bebas text-3xl tracking-widest text-green-400">
              {trialStatsLoading ? '...' : trialStats.active_now}
            </div>
            <p className="text-[11px] text-white/25 mt-1">Currently active now</p>
          </div>

          <div className="bg-black/60 backdrop-blur-md border border-blue-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <TimerReset className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-white/40 uppercase tracking-wide">
                Claims Today
              </span>
            </div>
            <div className="font-bebas text-3xl tracking-widest text-blue-400">
              {trialStatsLoading ? '...' : trialStats.claimed_today}
            </div>
            <p className="text-[11px] text-white/25 mt-1">Since 12:00 AM PHT</p>
          </div>

          <div className="bg-black/60 backdrop-blur-md border border-yellow-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <History className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-white/40 uppercase tracking-wide">
                Claims Last 24H
              </span>
            </div>
            <div className="font-bebas text-3xl tracking-widest text-yellow-400">
              {trialStatsLoading ? '...' : trialStats.claimed_24h}
            </div>
            <p className="text-[11px] text-white/25 mt-1">Rolling 24-hour count</p>
          </div>
        </div>

        <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bebas text-xl tracking-wider text-white">
                RECENT TRIAL SESSIONS
              </h2>
              <p className="text-xs text-white/30 mt-1">Latest 20 claim sessions in PHT</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={fetchTrialStats}
              className="text-white/40 hover:text-white"
              disabled={trialStatsLoading}
            >
              {trialStatsLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Refresh'
              )}
            </Button>
          </div>

          {trialStatsLoading ? (
            <div className="text-center py-6">
              <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto" />
            </div>
          ) : trialStats.recent_sessions.length === 0 ? (
            <div className="text-center py-6 text-white/30 text-sm">
              No recent trial sessions.
            </div>
          ) : (
            <div className="space-y-2">
              {trialStats.recent_sessions.map((session) => (
                <div
                  key={session.session_id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-black/40 rounded-xl px-4 py-3 border border-white/5"
                >
                  <div className="flex flex-col">
                    <span className="font-mono text-xs text-white/60">
                      {session.ip || 'Unknown IP'}
                    </span>
                    <span className="text-[11px] text-white/25 mt-1">
                      Session: {session.session_id}
                    </span>
                  </div>

                  <div className="text-[11px] text-white/30 sm:text-right">
                    <div>Created: {formatPHT(session.created_at, true)} PHT</div>
                    <div>Expires: {formatPHT(session.expires_at, true)} PHT</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <AnimatePresence>
          {newKeyValue && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-8 bg-green-500/10 border border-green-500/30 rounded-xl p-5"
              data-testid="new-key-alert"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 font-medium mb-1">New Key Created</p>
                  <p className="text-white/50 text-sm mb-3">
                    Copy this key now. It won't be shown in full again.
                  </p>
                  <code
                    className="font-mono text-green-400 bg-black/40 px-3 py-1.5 rounded text-sm"
                    data-testid="new-key-value"
                  >
                    {newKeyValue}
                  </code>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyText(newKeyValue)}
                    className="text-green-400 hover:bg-green-500/10"
                    data-testid="copy-new-key-btn"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setNewKeyValue(null)}
                    className="text-white/40 hover:text-white"
                    data-testid="dismiss-new-key-btn"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-8"
          data-testid="create-key-form"
        >
          <h2 className="font-bebas text-xl tracking-wider text-white mb-4">
            CREATE NEW KEY
          </h2>

          <div className="flex items-end gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-white/40 uppercase tracking-wide mb-1.5 block">
                Label
              </label>
              <Input
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                placeholder="e.g. John's Key"
                className="bg-black/50 border-white/10 focus:border-primary text-white placeholder:text-white/30 h-11"
                data-testid="create-key-label"
                onKeyDown={e => e.key === 'Enter' && createKey()}
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-white/40 uppercase tracking-wide mb-1.5 block">
                Custom Key <span className="text-white/20">(optional)</span>
              </label>
              <Input
                value={customKey}
                onChange={e => setCustomKey(e.target.value)}
                placeholder="Leave blank for random key"
                className="bg-black/50 border-white/10 focus:border-primary text-white placeholder:text-white/20 h-11 font-mono text-sm"
                data-testid="create-key-custom"
              />
            </div>

            <div className="w-32">
              <label className="text-xs text-white/40 uppercase tracking-wide mb-1.5 block">
                Max Devices
              </label>
              <Input
                type="number"
                min={1}
                max={100}
                value={newMaxDevices}
                onChange={e => setNewMaxDevices(parseInt(e.target.value, 10) || 1)}
                className="bg-black/50 border-white/10 focus:border-primary text-white h-11"
                data-testid="create-key-devices"
              />
            </div>

            <div className="w-36">
              <label className="text-xs text-white/40 uppercase tracking-wide mb-1.5 block">
                Tier
              </label>
              <select
                value={newTier}
                onChange={e => setNewTier(e.target.value)}
                className="w-full bg-black/50 border border-white/10 focus:border-primary text-white h-11 rounded-md px-3 text-sm outline-none cursor-pointer"
                data-testid="create-key-tier"
              >
                {TIER_OPTIONS.map(t => (
                  <option key={t} value={t} className="bg-[#111] capitalize">
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={createKey}
              disabled={creating}
              data-testid="create-key-btn"
              className="bg-primary hover:bg-red-700 text-white font-bebas tracking-widest uppercase rounded-sm shadow-[0_0_15px_rgba(229,9,20,0.4)] transition-all hover:scale-105 active:scale-95 h-11 px-6"
            >
              {creating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  CREATE
                </>
              )}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          </div>
        ) : keys.length === 0 ? (
          <div className="text-center py-12 text-white/30">
            <Key className="w-12 h-12 mx-auto mb-3 text-white/10" />
            <p>No keys found</p>
          </div>
        ) : (
          <>
            <KeyGroup groupKey="master" />
            <KeyGroup groupKey="premium" />
            <KeyGroup groupKey="free" />
          </>
        )}
      </div>
    </div>
  );
}
