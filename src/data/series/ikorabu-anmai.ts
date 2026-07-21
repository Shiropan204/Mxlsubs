import { Episode } from '../../types';

/**
 * Ikorabu Anmai (YouTube)
 * Konten dari channel YouTube Ikorabu Anmai
 */

const base = import.meta.env.BASE_URL;

export const ikorabuAnmai: Episode[] = [
  {
    id: 'ikorabu-anmai-W_ll5_m4Q8c',
    title: '【We Became Princesses】at Disney Fantasy Springs Hotel',
    date: '2026-07-21',
    type: 'Ikorabu Anmai',
    series: 'ikorabu-anmai',
    members: ['Yamamoto Anna', 'Sasaki Maika'],
    tags: [],
    subtitleTags: ['Indo', 'EN'],
    subtitles: [],
    servers: [
      { id: 'youtube', name: 'YouTube', videoId: 'W_ll5_m4Q8c' },
    ],
    videoId: 'W_ll5_m4Q8c',
    thumbnailUrl: `${base}thumbnails/ikorabu-anmai-disney-princess.jpg`,
    subtitleTracks: [
      { id: 'id', label: 'Indonesia', url: `${base}subtitles/ikorabu-anmai-disney-princess.vtt` },
      { id: 'en', label: 'English', url: `${base}subtitles/ikorabu-anmai-disney-princess-en.vtt` },
    ],
    vttUrl: `${base}subtitles/ikorabu-anmai-disney-princess.vtt`,
  },
];
