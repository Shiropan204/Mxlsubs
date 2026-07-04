export interface SubtitleCue {
  start: number;
  end: number;
  text: string;
}

export interface SubtitleTrack {
  id: string;
  label: string;
  url: string;
}

export interface VideoServer {
  id: 'youtube' | 'drive' | 'dailymotion';
  name: string;
  videoId: string;
}

export interface Episode {
  id: string;
  title: string;
  videoId?: string; // legacy
  date: string;
  type: 'Variety' | 'Music Video' | 'Concert' | 'Behind the Scenes' | 'IKONOIJOY Channel';
  members: string[];
  tags: string[];
  translatorNotes?: string;
  subtitles: SubtitleCue[];
  vttUrl?: string; // legacy
  servers?: VideoServer[];
  subtitleTracks?: SubtitleTrack[];
  thumbnailUrl?: string;
}

export interface MemberProfile {
  id: string;
  name: string;
  nameRomaji: string;
  birthDate: string;
  birthPlace: string;
  bloodType: string;
  height?: string;
  zodiac?: string;
  color?: string; // Member color if available
  imageUrl?: string;
}
