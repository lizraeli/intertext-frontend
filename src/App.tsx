import { Outlet } from 'react-router-dom';
import { GrainOverlay } from './components/GrainOverlay/GrainOverlay';

export default function RootLayout() {
  return (
    <>
      <GrainOverlay />
      <Outlet />
    </>
  );
}
