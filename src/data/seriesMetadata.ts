export type SeriesStatus = 'Ongoing' | 'Completed';

export interface SeriesMeta {
  title: string;
  status: SeriesStatus;
}

// Gunakan slug/id stabil sebagai key
export const seriesMetadata: Record<string, SeriesMeta> = {
  'equal-love-kokokko': {
    title: 'Equal Love Kokokko!!',
    status: 'Completed',
  },
  'kimi-wa-motto': {
    title: 'Kimi wa Motto =LOVE wo Aiseru ka!!!',
    status: 'Ongoing',
  },
  'ikonoijoy-channel': {
    title: 'IKONOIJOY Channel',
    status: 'Ongoing',
  },
};

// Helper function dengan fallback
export const getSeriesMeta = (seriesId: string | undefined): SeriesMeta => {
  if (!seriesId) return { title: 'Unknown Series', status: 'Ongoing' };
  return seriesMetadata[seriesId] || { title: seriesId, status: 'Ongoing' };
};
