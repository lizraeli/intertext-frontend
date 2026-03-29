import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RootLayout from './App';
import { HomePage } from './components/HomePage/HomePage';
import { OpeningScreen } from './components/OpeningScreen/OpeningScreen';
import { NovelScreen } from './components/NovelScreen/NovelScreen';
import { ReadingScreen } from './components/ReadingScreen/ReadingScreen';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'explore', Component: OpeningScreen },
      { path: 'novel/:id', Component: NovelScreen },
      { path: 'segment/:id', Component: ReadingScreen },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
