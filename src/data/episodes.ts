import { Episode } from '../types';

const base = import.meta.env.BASE_URL;

export const episodes: Episode[] = [
  {
    id: "equallove-kokokko-ep1",
    title: "Equal Love Kokokko!! Episode 1",
    date: "2024-03-01", // Placeholder date, can be updated later
    type: "Variety",
    members: [], // Add members if needed later
    tags: [],
    subtitles: [],
    servers: [
      { id: 'drive', name: 'Google Drive', videoId: '1mrB_IrU6uO-ta-6Z7xGWJg_NuSg14chN' }
    ],
    subtitleTracks: [
      { id: 'id', label: 'Indonesia', url: `${base}subtitles/equallove-kokokko-ep1-id.vtt` },
      { id: 'en', label: 'English', url: `${base}subtitles/equallove-kokokko-ep1-en.vtt` }
    ],
    thumbnailUrl: `https://www.ntv.co.jp/equal-love/images/taxy5s5k7h9amf0u11x2io9mjv8iw3.jpg` // Cover khusus buat genre ini
  },
  {
    id: "ikonoijoy-tsunhashigo-pesta-minum",
    title: "【Ikonoijoy】- Sashihara P & Mirinya Ikutan! Pesta Minum Super Seru dan Bikin Ngakak Ada di Sini 【Tsun Hashigo】",
    date: "2024-02-01",
    type: "IKONOIJOY Channel",
    members: ["Emiri Otani"],
    tags: [],
    subtitles: [],
    servers: [
      { id: 'youtube', name: 'YouTube', videoId: '2NQTl9nMxfs' },
      { id: 'drive', name: 'Google Drive', videoId: '1Babc123xyz' } // Dummy drive video ID just to show it works
    ],
    subtitleTracks: [
      { id: 'id', label: 'Indonesia', url: `${base}subtitles/ikonoijoy-tsunhashigo-pesta-minum.vtt` },
      { id: 'en', label: 'English', url: `${base}subtitles/ikonoijoy-tsunhashigo-pesta-minum-en.vtt` }
    ],
    // Legacy fields for backward compatibility during transition
    videoId: "2NQTl9nMxfs",
    vttUrl: `${base}subtitles/ikonoijoy-tsunhashigo-pesta-minum.vtt`
  },
  {
    id: "ikonoijoy-sanamiri-cooking",
    title: "【Ikonoijoy】- Sanamiri Menjamu Sashihara-san!!! Memasak Camilan dengan Sungguh-Sungguh💖 【Tsunhashigo】",
    date: "2024-01-01",
    type: "IKONOIJOY Channel",
    members: ["Emiri Otani", "Sana Morohashi"],
    tags: [],
    subtitles: [],
    servers: [
      { id: 'youtube', name: 'YouTube', videoId: 'c55LJFTGqo0' }
    ],
    subtitleTracks: [
      { id: 'id', label: 'Indonesia', url: `${base}subtitles/ikonoijoy-sanamiri-cooking.vtt` }
    ],
    thumbnailUrl: `${base}thumbnails/ikonoijoy-sanamiri-cooking.png`,
    // Legacy fields
    videoId: "c55LJFTGqo0",
    vttUrl: `${base}subtitles/ikonoijoy-sanamiri-cooking.vtt`
  }
];

