import { Episode } from '../types';

const base = import.meta.env.BASE_URL;

export const episodes: Episode[] = [
  {
    id: "equallove-kokokko-ep1",
    title: "Equal Love Kokokko!! Episode 1",
    date: "2026-07-04",
    type: "Variety",
    series: "Equal Love Kokokko!!",
    members: [],
    tags: ["variety", "equal-love"],
    subtitles: [],
    servers: [
      { id: 'drive', name: 'Google Drive', videoId: '1mrB_IrU6uO-ta-6Z7xGWJg_NuSg14chN' },
      { id: 'dailymotion', name: 'Dailymotion', videoId: 'k5c6rD2vwW3CR4HlhIm' }
    ],
    subtitleTracks: [],
    subtitleTags: ["Indo", "Eng"],
    thumbnailUrl: `https://www.ntv.co.jp/equal-love/images/taxy5s5k7h9amf0u11x2io9mjv8iw3.jpg`
  },
  {
    id: "equallove-kokokko-ep2",
    title: "Equal Love Kokokko!! Episode 2",
    date: "2026-07-07",
    type: "Variety",
    series: "Equal Love Kokokko!!",
    members: [],
    tags: ["variety", "equal-love"],
    subtitles: [],
    servers: [
      { id: 'dailymotion', name: 'Dailymotion', videoId: 'k5AKaNUtfJgcH0HlhIC' }
    ],
    subtitleTracks: [],
    subtitleTags: ["Indo"],
    thumbnailUrl: `https://www.ntv.co.jp/equal-love/images/taxy5s5k7h9amf0u11x2io9mjv8iw3.jpg`
  },
  {
    id: "equallove-kokokko-ep3",
    title: "Equal Love Kokokko!! Episode 3",
    date: "2026-07-09",
    type: "Variety",
    series: "Equal Love Kokokko!!",
    members: [],
    tags: ["variety", "equal-love"],
    subtitles: [],
    servers: [
      { id: 'dailymotion', name: 'Dailymotion', videoId: 'k3kLxmCLlTeQoAHlhIq' }
    ],
    subtitleTracks: [],
    subtitleTags: ["Eng"],
    thumbnailUrl: `https://www.ntv.co.jp/equal-love/images/taxy5s5k7h9amf0u11x2io9mjv8iw3.jpg`
  },
  {
    id: "equallove-kokokko-ep4",
    title: "Equal Love Kokokko!! Episode 4",
    date: "2026-07-09",
    type: "Variety",
    series: "Equal Love Kokokko!!",
    members: [],
    tags: ["variety", "equal-love"],
    subtitles: [],
    servers: [
      { id: 'dailymotion', name: 'Dailymotion', videoId: 'kg55QIWVKhrJsAHlhIu' }
    ],
    subtitleTracks: [],
    subtitleTags: ["Eng"],
    thumbnailUrl: `https://www.ntv.co.jp/equal-love/images/taxy5s5k7h9amf0u11x2io9mjv8iw3.jpg`
  },
  {
    id: "equallove-kokokko-ep5",
    title: "Equal Love Kokokko!! Episode 5",
    date: "2026-07-09",
    type: "Variety",
    series: "Equal Love Kokokko!!",
    members: [],
    tags: ["variety", "equal-love"],
    subtitles: [],
    servers: [
      { id: 'dailymotion', name: 'Dailymotion', videoId: 'k2rC93xCPInPZjHlhIy' }
    ],
    subtitleTracks: [],
    subtitleTags: ["Eng"],
    thumbnailUrl: `https://www.ntv.co.jp/equal-love/images/taxy5s5k7h9amf0u11x2io9mjv8iw3.jpg`
  },
  {
    id: "kimi-wa-motto-love-ep1",
    title: "Kimi wa Motto =LOVE wo Aiseru ka!!! Episode 1",
    date: "2026-07-09",
    type: "Variety",
    series: "Kimi wa Motto =LOVE wo Aiseru ka!!!",
    members: [],
    tags: ["variety"],
    subtitles: [],
    servers: [
      { id: 'dailymotion', name: 'Dailymotion', videoId: 'k1kMOAPuKKyzWNHzOpA' }
    ],
    subtitleTracks: [],
    subtitleTags: ["Eng"],
    thumbnailUrl: `https://www.fujitv.co.jp/equal-love/photo/main.jpg`
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
      { id: 'drive', name: 'Google Drive', videoId: '1Babc123xyz' }
    ],
    subtitleTracks: [
      { id: 'id', label: 'Indonesia', url: `${base}subtitles/ikonoijoy-tsunhashigo-pesta-minum.vtt` },
      { id: 'en', label: 'English', url: `${base}subtitles/ikonoijoy-tsunhashigo-pesta-minum-en.vtt` }
    ],
    subtitleTags: ["Indo"],
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
    subtitleTags: ["Indo"],
    thumbnailUrl: `${base}thumbnails/ikonoijoy-sanamiri-cooking.png`,
    videoId: "c55LJFTGqo0",
    vttUrl: `${base}subtitles/ikonoijoy-sanamiri-cooking.vtt`
  }
];

