import { useNavigate } from 'react-router';
import { ArrowLeft, Shield } from 'lucide-react';
import { BottomNav } from '../components/bottom-nav';

const sections = [
  {
    title: 'Location Data',
    content:
      'RoadSoS uses your device GPS to locate nearby emergency services. Your location is processed entirely on your device and sent only to OpenStreetMap Overpass API to query nearby services. We do not store, track, or transmit your location to any proprietary server. Location data is cached locally on your device (in sessionStorage and localStorage) to speed up repeated use and is never shared with third parties.',
  },
  {
    title: 'Data Storage',
    content:
      'All app data is stored locally on your device using your browser\'s localStorage and sessionStorage. This includes cached service results, your notification preferences, and your last known location. No data is stored on external servers. You can clear all cached data at any time from Settings > Location Services.',
  },
  {
    title: 'Third-Party Services',
    content:
      'RoadSoS queries the following open-source services to provide live data:\n\n' +
      '\u2022 Overpass API (overpass-api.de) — queries OpenStreetMap for nearby hospitals, police stations, and ambulance services.\n' +
      '\u2022 OSRM (router.project-osrm.org) — calculates driving routes for the vehicle tracking feature.\n' +
      '\u2022 ESRI World Imagery — provides satellite map tiles.\n\n' +
      'These services receive your approximate location as part of the API query. Refer to their respective privacy policies for how they handle this data.',
  },
  {
    title: 'No Account Required',
    content:
      'RoadSoS does not require registration, login, or any personal information. There are no user accounts, no email collection, and no analytics tracking. The app is designed to work instantly with zero personal data.',
  },
  {
    title: 'Notifications',
    content:
      'If you enable browser notifications, they are handled entirely by your device. RoadSoS does not use push notification servers. Notification preferences are stored locally and can be changed at any time from Settings > Notifications.',
  },
  {
    title: 'Offline Usage',
    content:
      'RoadSoS is a Progressive Web App (PWA) that caches essential resources using a service worker. Once installed, the app works offline using previously cached map tiles, service data, and first-aid guides. No network requests are made when you are offline.',
  },
  {
    title: 'Children\'s Privacy',
    content:
      'RoadSoS does not knowingly collect any personal information from anyone, including children. Since no personal data is collected at all, there are no special provisions needed for minors.',
  },
  {
    title: 'Changes to This Policy',
    content:
      'This privacy policy may be updated from time to time. Any changes will be reflected in the app. Since RoadSoS collects no personal data, changes are unlikely to affect your privacy.',
  },
];

export function SettingsPrivacyScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0D0D0D] pb-20">
      <div className="bg-[#1A1A2E] px-4 py-3 flex items-center gap-3 border-b border-[#8888AA]/20 sticky top-0 z-10">
        <button
          onClick={() => navigate('/settings')}
          className="w-10 h-10 rounded-full bg-[#2A2A3E] flex items-center justify-center hover:bg-[#333344] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#F0F0F0]" />
        </button>
        <span className="font-semibold text-[#F0F0F0]">Privacy Policy</span>
      </div>

      <div className="p-4 space-y-5">
        {/* Header */}
        <div className="bg-[#1A1A2E] rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#06D6A0]/20 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#06D6A0]" />
            </div>
            <div>
              <p className="font-semibold text-[#F0F0F0]">Your Privacy Matters</p>
              <p className="text-xs text-[#8888AA]">Last updated: April 2026</p>
            </div>
          </div>
          <p className="text-sm text-[#8888AA] leading-relaxed">
            RoadSoS is designed with privacy at its core. No accounts, no tracking, no personal data collection. Everything stays on your device.
          </p>
        </div>

        {/* Policy Sections */}
        {sections.map((section, i) => (
          <div key={i} className="bg-[#1A1A2E] rounded-2xl p-5">
            <h3 className="font-semibold text-[#F0F0F0] mb-2">{section.title}</h3>
            <p className="text-sm text-[#8888AA] leading-relaxed whitespace-pre-line">{section.content}</p>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
