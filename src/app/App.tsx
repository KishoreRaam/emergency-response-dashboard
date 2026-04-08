import { RouterProvider } from 'react-router';
import { router } from './routes';
import { PwaUpdater } from './components/pwa-updater';

export default function App() {
  return (
    <>
      <PwaUpdater />
      <RouterProvider router={router} />
    </>
  );
}
