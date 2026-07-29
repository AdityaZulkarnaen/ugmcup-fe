export const LEVELS = [
  { value: 'univ', label: 'Universitas' },
  { value: 'sma', label: 'SMA/SMK' },
];

export const DISCIPLINES = [
  { id: 'univ-tp', level: 'univ', name: 'Tunggal Putra Universitas', type: 'TUNGGAL_PUTRA', isTeamEvent: false, label: 'Tunggal Putra' },
  { id: 'univ-tpi', level: 'univ', name: 'Tunggal Putri Universitas', type: 'TUNGGAL_PUTRI', isTeamEvent: false, label: 'Tunggal Putri' },
  { id: 'univ-gp', level: 'univ', name: 'Ganda Putra Universitas', type: 'GANDA_PUTRA', isTeamEvent: false, label: 'Ganda Putra' },
  { id: 'univ-gpi', level: 'univ', name: 'Ganda Putri Universitas', type: 'GANDA_PUTRI', isTeamEvent: false, label: 'Ganda Putri' },
  { id: 'univ-gc', level: 'univ', name: 'Ganda Campuran Universitas', type: 'GANDA_CAMPURAN', isTeamEvent: false, label: 'Ganda Campuran' },
  { id: 'univ-beregu', level: 'univ', name: 'Beregu Sudirman', type: 'BEREGU', isTeamEvent: true, label: 'Beregu' },

  { id: 'sma-tp', level: 'sma', name: 'Tunggal Putra SMA', type: 'TUNGGAL_PUTRA', isTeamEvent: false, label: 'Tunggal Putra' },
  { id: 'sma-tpi', level: 'sma', name: 'Tunggal Putri SMA', type: 'TUNGGAL_PUTRI', isTeamEvent: false, label: 'Tunggal Putri' },
  { id: 'sma-gp', level: 'sma', name: 'Ganda Putra SMA', type: 'GANDA_PUTRA', isTeamEvent: false, label: 'Ganda Putra' },
  { id: 'sma-gpi', level: 'sma', name: 'Ganda Putri SMA', type: 'GANDA_PUTRI', isTeamEvent: false, label: 'Ganda Putri' },
  { id: 'sma-gc', level: 'sma', name: 'Ganda Campuran SMA', type: 'GANDA_CAMPURAN', isTeamEvent: false, label: 'Ganda Campuran' },
];

// Helper untuk mendapatkan disciplines berdasarkan level (SMA/Univ)
export const getDisciplinesByLevel = (level: string) => {
  return DISCIPLINES.filter(d => d.level === level);
};
