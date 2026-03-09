import { Routes, Route } from 'react-router-dom';
import { OpeningScreen } from './components/OpeningScreen/OpeningScreen';
import { ReadingScreen } from './components/ReadingScreen/ReadingScreen';
import { GrainOverlay } from './components/GrainOverlay/GrainOverlay';

export default function App() {
  return (
    <>
      <GrainOverlay />
      <Routes>
        <Route path="/" element={<OpeningScreen />} />
        <Route path="/segment/:id" element={<ReadingScreen />} />
      </Routes>
    </>
  );
}
