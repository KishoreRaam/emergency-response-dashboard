import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Bell, BellOff, BellRing, AlertTriangle, CheckCircle } from 'lucide-react';
import { BottomNav } from '../components/bottom-nav';

const PREF_KEY = 'roadsos_notif_prefs';

interface NotifPrefs {
  emergencyAlerts: boolean;
  serviceUpdates: boolean;
  offlineAlerts: boolean;
}

function loadPrefs(): NotifPrefs {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { emergencyAlerts: true, serviceUpdates: true, offlineAlerts: true };
}

function savePrefs(prefs: NotifPrefs) {
  localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
}

export function SettingsNotificationsScreen() {
  const navigate = useNavigate();
  const [permission, setPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );
  const [prefs, setPrefs] = useState<NotifPrefs>(loadPrefs);
  const [requesting, setRequesting] = useState(false);

  const supported = 'Notification' in window;

  const requestPermission = useCallback(async () => {
    if (!supported) return;
    setRequesting(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        new Notification('RoadSoS', { body: 'Emergency notifications enabled', icon: '/icons/icon-192.png' });
      }
    } catch {}
    setRequesting(false);
  }, [supported]);

  useEffect(() => {
    if (supported) setPermission(Notification.permission);
  }, [supported]);

  const togglePref = (key: keyof NotifPrefs) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    savePrefs(updated);
  };

  const statusColor = permission === 'granted' ? '#06D6A0' : permission === 'denied' ? '#D62828' : '#FFB703';
  const statusText = permission === 'granted' ? 'Enabled' : permission === 'denied' ? 'Blocked' : 'Not set';
  const StatusIcon = permission === 'granted' ? CheckCircle : permission === 'denied' ? BellOff : AlertTriangle;

  return (
    <div className="min-h-screen bg-[#0D0D0D] pb-20">
      <div className="bg-[#1A1A2E] px-4 py-3 flex items-center gap-3 border-b border-[#8888AA]/20 sticky top-0 z-10">
        <button
          onClick={() => navigate('/settings')}
          className="w-10 h-10 rounded-full bg-[#2A2A3E] flex items-center justify-center hover:bg-[#333344] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#F0F0F0]" />
        </button>
        <span className="font-semibold text-[#F0F0F0]">Notifications</span>
      </div>

      <div className="p-4 space-y-6">
        {/* Permission Status */}
        <div className="bg-[#1A1A2E] rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${statusColor}20` }}>
              <StatusIcon className="w-6 h-6" style={{ color: statusColor }} />
            </div>
            <div>
              <p className="font-semibold text-[#F0F0F0]">Browser Notifications</p>
              <p className="text-sm" style={{ color: statusColor }}>{statusText}</p>
            </div>
          </div>

          {!supported ? (
            <p className="text-sm text-[#8888AA]">Your browser does not support notifications.</p>
          ) : permission === 'denied' ? (
            <p className="text-sm text-[#8888AA]">
              Notifications are blocked. To enable them, open your browser settings and allow notifications for this site.
            </p>
          ) : permission !== 'granted' ? (
            <button
              onClick={requestPermission}
              disabled={requesting}
              className="w-full bg-[#D62828] hover:bg-[#B81F1F] disabled:opacity-50 text-white px-5 py-3 rounded-full font-semibold flex items-center justify-center gap-2 transition-colors active:scale-95"
            >
              <BellRing className="w-4 h-4" />
              {requesting ? 'Requesting...' : 'Enable Notifications'}
            </button>
          ) : null}
        </div>

        {/* Alert Preferences */}
        <div>
          <h2 className="text-sm font-semibold text-[#8888AA] mb-3 px-2">ALERT PREFERENCES</h2>
          <div className="bg-[#1A1A2E] rounded-2xl overflow-hidden">
            <div className="px-4 py-4 flex items-center justify-between border-b border-[#8888AA]/10">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-[#D62828]" />
                <div>
                  <p className="text-[#F0F0F0] font-medium">Emergency Alerts</p>
                  <p className="text-xs text-[#8888AA]">Critical safety notifications</p>
                </div>
              </div>
              <button
                onClick={() => togglePref('emergencyAlerts')}
                className={`w-12 h-7 rounded-full transition-colors relative ${prefs.emergencyAlerts ? 'bg-[#06D6A0]' : 'bg-[#8888AA]/30'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${prefs.emergencyAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="px-4 py-4 flex items-center justify-between border-b border-[#8888AA]/10">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-[#023E8A]" />
                <div>
                  <p className="text-[#F0F0F0] font-medium">Service Updates</p>
                  <p className="text-xs text-[#8888AA]">Changes to nearby services</p>
                </div>
              </div>
              <button
                onClick={() => togglePref('serviceUpdates')}
                className={`w-12 h-7 rounded-full transition-colors relative ${prefs.serviceUpdates ? 'bg-[#06D6A0]' : 'bg-[#8888AA]/30'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${prefs.serviceUpdates ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-[#FFB703]" />
                <div>
                  <p className="text-[#F0F0F0] font-medium">Offline Alerts</p>
                  <p className="text-xs text-[#8888AA]">Notify when going offline</p>
                </div>
              </div>
              <button
                onClick={() => togglePref('offlineAlerts')}
                className={`w-12 h-7 rounded-full transition-colors relative ${prefs.offlineAlerts ? 'bg-[#06D6A0]' : 'bg-[#8888AA]/30'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${prefs.offlineAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
