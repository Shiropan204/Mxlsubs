import { Episode } from '../../types';

/**
 * IKONOIJOY Channel (YouTube)
 * Konten dari channel YouTube IKONOIJOY
 */

const base = import.meta.env.BASE_URL;

export const ikonoijoy: Episode[] = [
  {
    id: 'ikonoijoy-tsunhashigo-pesta-minum',
    title: '【Ikonoijoy】- Sashihara P & Mirinya Ikutan! Pesta Minum Super Seru dan Bikin Ngakak Ada di Sini 【Tsun Hashigo】',
    date: '2024-02-01',
    type: 'IKONOIJOY Channel',
    members: ['Emiri Otani'],
    tags: [],
    subtitles: [],
    servers: [
      { id: 'youtube', name: 'YouTube', videoId: '2NQTl9nMxfs' },
      { id: 'drive', name: 'Google Drive', videoId: '1Babc123xyz' },
    ],
    subtitleTracks: [
      { id: 'id', label: 'Indonesia', url: `${base}subtitles/ikonoijoy-tsunhashigo-pesta-minum.vtt` },
      { id: 'en', label: 'English', url: `${base}subtitles/ikonoijoy-tsunhashigo-pesta-minum-en.vtt` },
    ],
    subtitleTags: ['Indo'],
    videoId: '2NQTl9nMxfs',
    vttUrl: `${base}subtitles/ikonoijoy-tsunhashigo-pesta-minum.vtt`,
  },
  {
    id: 'ikonoijoy-sanamiri-cooking',
    title: '【Ikonoijoy】- Sanamiri Menjamu Sashihara-san!!! Memasak Camilan dengan Sungguh-Sungguh💖 【Tsunhashigo】',
    date: '2024-01-01',
    type: 'IKONOIJOY Channel',
    members: ['Emiri Otani', 'Sana Morohashi'],
    tags: [],
    subtitles: [],
    servers: [
      { id: 'youtube', name: 'YouTube', videoId: 'c55LJFTGqo0' },
    ],
    subtitleTracks: [
      { id: 'id', label: 'Indonesia', url: `${base}subtitles/ikonoijoy-sanamiri-cooking.vtt` },
    ],
    subtitleTags: ['Indo'],
    thumbnailUrl: `${base}thumbnails/ikonoijoy-sanamiri-cooking.png`,
    videoId: 'c55LJFTGqo0',
    vttUrl: `${base}subtitles/ikonoijoy-sanamiri-cooking.vtt`,
  },
];
