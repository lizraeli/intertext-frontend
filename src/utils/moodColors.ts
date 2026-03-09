export const MOOD_COLORS: Record<string, string> = {
  melancholic: '#7B9EAE',
  tender: '#C4956A',
  contemplative: '#8A9B7C',
  bittersweet: '#B07A8A',
  satirical: '#8A8AAA',
  nostalgic: '#A89070',
};

export function getMoodColor(mood: string): string {
  return MOOD_COLORS[mood] ?? 'var(--amber)';
}
