import type { FullSegment } from '../../types/segments';

export type ReadingLocationState = {
  fromNovel?: number;
  fromExplore?: boolean;
} | null;

export type BackTarget = { path: string; label: string };

type GetBackTargetParams = {
  segment: FullSegment | null;
  fromNovel?: number;
  fromExplore?: boolean;
};

export function getBackTarget({
  segment,
  fromNovel,
  fromExplore,
}: GetBackTargetParams): BackTarget {
  if (fromExplore) {
    return { path: '/explore', label: '← Begin again' };
  }

  if (fromNovel) {
    return {
      path: `/novel/${fromNovel}`,
      label: `← ${segment?.novel_title ?? 'Back'}`,
    };
  }

  if (segment) {
    return {
      path: `/novel/${segment.novel_id}`,
      label: `← ${segment.novel_title}`,
    };
  }

  return { path: '/', label: '← Home' };
}
