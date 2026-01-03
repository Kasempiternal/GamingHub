// Shared game definitions used across the app
export interface Game {
  id: string;
  name: string;
  description: string;
  icon: string;
  gradient: string;
  accentColor: string;
  players: string;
  duration: string;
  href: string;
  available: boolean;
  tagline: string;
}

export const games: Game[] = [
  {
    id: 'codigo-secreto',
    name: 'Codigo Secreto',
    description: 'Juego de espias y palabras. Adivina las palabras de tu equipo usando pistas.',
    icon: '🕵️',
    gradient: 'from-amber-600 to-amber-800',
    accentColor: 'amber',
    players: '4-20',
    duration: '15-30 min',
    href: '/codigo-secreto',
    available: true,
    tagline: 'Operacion clasificada',
  },
  {
    id: 'the-mind',
    name: 'The Mind',
    description: 'Sincronizacion mental. Juega cartas en orden sin hablar.',
    icon: '🧠',
    gradient: 'from-sky-500 to-emerald-500',
    accentColor: 'sky',
    players: '2-4',
    duration: '15-25 min',
    href: '/the-mind',
    available: true,
    tagline: 'Conexion telepática',
  },
  {
    id: 'impostor',
    name: 'Impostor',
    description: 'Encuentra al impostor. Todos tienen la misma palabra... excepto uno.',
    icon: '🎭',
    gradient: 'from-red-500 to-amber-500',
    accentColor: 'red',
    players: '3-12',
    duration: '10-20 min',
    href: '/impostor',
    available: true,
    tagline: 'Entre nosotros',
  },
  {
    id: 'scout',
    name: 'SCOUT',
    description: 'Circo de las cartas. Juega sets y escaleras para capturar artistas rivales.',
    icon: '🎪',
    gradient: 'from-red-700 to-amber-500',
    accentColor: 'circus',
    players: '3-5',
    duration: '20-30 min',
    href: '/scout',
    available: true,
    tagline: 'El gran show',
  },
  {
    id: 'hipster',
    name: 'Hipster',
    description: 'Adivina la musica. Ordena canciones por año y demuestra tu conocimiento musical.',
    icon: '🎵',
    gradient: 'from-purple-600 to-pink-500',
    accentColor: 'purple',
    players: '2-12',
    duration: '20-40 min',
    href: '/hipster',
    available: true,
    tagline: 'Melomano',
  },
  {
    id: 'times-up',
    name: '¡Tiempo!',
    description: 'Adivina personajes famosos en 3 rondas. Describe, una palabra, ¡mímica!',
    icon: '⏱️',
    gradient: 'from-orange-500 to-yellow-500',
    accentColor: 'orange',
    players: '4-20',
    duration: '20-40 min',
    href: '/times-up',
    available: true,
    tagline: 'Contrarreloj',
  },
];

// Helper to get a game by ID
export function getGameById(id: string): Game | undefined {
  return games.find((game) => game.id === id);
}

// Helper to get a game by href path
export function getGameByPath(path: string): Game | undefined {
  const gameId = path.split('/')[1]; // Extract first segment after /
  return games.find((game) => game.id === gameId);
}
