import { createBrowserRouter } from 'react-router';
import { SplashScreen } from './screens/splash';
import { HomeScreen } from './screens/home';
import { ServiceDetailScreen } from './screens/service-detail';
import { AIAssistantScreen } from './screens/ai-assistant';
import { SearchScreen } from './screens/search';
import { SettingsScreen } from './screens/settings';
import { SettingsNotificationsScreen } from './screens/settings-notifications';
import { SettingsLocationScreen } from './screens/settings-location';
import { SettingsAppInfoScreen } from './screens/settings-app-info';
import { SettingsPrivacyScreen } from './screens/settings-privacy';
import { FirstAidScreen } from './screens/first-aid';
import { InjuryDetailScreen } from './screens/injury-detail';
import { TrackingScreen } from './screens/tracking';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: SplashScreen
  },
  {
    path: '/home',
    Component: HomeScreen
  },
  {
    path: '/service/:id',
    Component: ServiceDetailScreen
  },
  {
    path: '/ai',
    Component: AIAssistantScreen
  },
  {
    path: '/search',
    Component: SearchScreen
  },
  {
    path: '/first-aid',
    Component: FirstAidScreen
  },
  {
    path: '/first-aid/:id',
    Component: InjuryDetailScreen
  },
  {
    path: '/tracking/:serviceId',
    Component: TrackingScreen
  },
  {
    path: '/settings',
    Component: SettingsScreen
  },
  {
    path: '/settings/notifications',
    Component: SettingsNotificationsScreen
  },
  {
    path: '/settings/location',
    Component: SettingsLocationScreen
  },
  {
    path: '/settings/app-info',
    Component: SettingsAppInfoScreen
  },
  {
    path: '/settings/privacy',
    Component: SettingsPrivacyScreen
  },
  {
    path: '*',
    Component: () => (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#F0F0F0] mb-2">404</h1>
          <p className="text-[#8888AA]">Page not found</p>
        </div>
      </div>
    )
  }
]);