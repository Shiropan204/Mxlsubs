import { Episode } from '../types';
import { equalLoveKokokko } from './series/equal-love-kokokko';
import { kimiWaMotto } from './series/kimi-wa-motto';
import { ikonoijoy } from './series/ikonoijoy';

/**
 * Gabungan semua episode dari tiap series.
 * Untuk tambah series baru, buat file di /series/ lalu import di sini.
 */
export const episodes: Episode[] = [
  ...equalLoveKokokko,
  ...kimiWaMotto,
  ...ikonoijoy,
];
