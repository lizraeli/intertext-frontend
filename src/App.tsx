import { Routes, Route } from 'react-router-dom';
import { HomePage } from './components/HomePage/HomePage';
import { OpeningScreen } from './components/OpeningScreen/OpeningScreen';
import { NovelScreen } from './components/NovelScreen/NovelScreen';
import { ReadingScreen } from './components/ReadingScreen/ReadingScreen';
import { GrainOverlay } from './components/GrainOverlay/GrainOverlay';

export default function App() {
  return (
    <>
      <GrainOverlay />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<OpeningScreen />} />
        <Route path="/novel/:id" element={<NovelScreen />} />
        <Route path="/segment/:id" element={<ReadingScreen />} />
      </Routes>
    </>
  );
}
