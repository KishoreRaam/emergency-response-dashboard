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

  const statusColor = permission === 'granted' ? '#10B981' : permission === 'denied' ? '#DC2626' : '#F59E0B';
  const statusText = permission === 'granted' ? 'Enabled' : permission === 'denied' ? 'Blocked' : 'Not set';
  const StatusIcon = permission === 'granted' ? CheckCircle : permission === 'denied' ? BellOff : AlertTriangle;

  return (
    <div className="min-h-screen bg-[#FAFBFC] pb-20">
      <div className="bg-[#FFFFFF] px-4 py-3 flex items-center gap-3 border-b border-[#E5E7EB] sticky top-0 z-10">
        <button
          onClick={() => navigate('/settings')}
          className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#111827]" />
        </button>
        <span className="font-semibold text-[#111827]">Notifications</span>
      </div>

      <div className="p-4 space-y-6">
        {/* Permission Status */}
        <div className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#E5E7EB]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${statusColor}20` }}>
              <StatusIcon className="w-6 h-6" style={{ color: statusColor }} />
            </div>
            <div>
              <p className="font-semibold text-[#111827]">Browser Notifications</p>
              <p className="text-sm" style={{ color: statusColor }}>{statusText}</p>
            </div>
          </div>

          {!supported ? (
            <p className="text-sm text-[#6B7280]">Your browser does not support notifications.</p>
          ) : permission === 'denied' ? (
            <p className="text-sm text-[#6B7280]">
              Notifications are blocked. To enable them, open your browser settings and allow notifications for this site.
            </p>
          ) : permission !== 'granted' ? (
            <button
              onClick={requestPermission}
              disabled={requesting}
              className="w-full bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-50 text-white px-5 py-3 rounded-full font-semibold flex items-center justify-center gap-2 transition-colors active:scale-95"
            >
              <BellRing className="w-4 h-4" />
              {requesting ? 'Requesting...' : 'Enable Notifications'}
            </button>
          ) : null}
        </div>

        {/* Alert Preferences */}
        <div>
          <h2 className="text-sm font-semibold text-[#6B7280] mb-3 px-2">ALERT PREFERENCES</h2>
          <div className="bg-[#FFFFFF] rounded-2xl overflow-hidden border border-[#E5E7EB]">
            <div className="px-4 py-4 flex items-center justify-between border-b border-[#E5E7EB]">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-[#DC2626]" />
                <div>
                  <p className="text-[#111827] font-medium">Emergency Alerts</p>
                  <p className="text-xs text-[#6B7280]">Critical safety notifications</p>
                </div>
              </div>
              <button
                onClick={() => togglePref('emergencyAlerts')}
                className={`w-12 h-7 rounded-full transition-colors relative ${prefs.emergencyAlerts ? 'bg-[#10B981]' : 'bg-[#E5E7EB]'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${prefs.emergencyAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="px-4 py-4 flex items-center justify-between border-b border-[#E5E7EB]">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-[#06B6D4]" />
                <div>
                  <p className="text-[#111827] font-medium">Service Updates</p>
                  <p className="text-xs text-[#6B7280]">Changes to nearby services</p>
                </div>
              </div>
              <button
                onClick={() => togglePref('serviceUpdates')}
                className={`w-12 h-7 rounded-full transition-colors relative ${prefs.serviceUpdates ? 'bg-[#10B981]' : 'bg-[#E5E7EB]'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${prefs.serviceUpdates ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-[#F59E0B]" />
                <div>
                  <p className="text-[#111827] font-medium">Offline Alerts</p>
                  <p className="text-xs text-[#6B7280]">Notify when going offline</p>
                </div>
              </div>
              <button
                onClick={() => togglePref('offlineAlerts')}
                className={`w-12 h-7 rounded-full transition-colors relative ${prefs.offlineAlerts ? 'bg-[#10B981]' : 'bg-[#E5E7EB]'}`}
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
