import type { AsesinatoPhase, AsesinatoRole } from '@/types/game';

export interface HelperContent {
  title: string;
  emoji: string;
  tips: string[];
}

type HelperContentMap = {
  [phase in AsesinatoPhase]: {
    [role in AsesinatoRole | 'default']?: HelperContent;
  };
};

const helperContent: HelperContentMap = {
  lobby: {
    default: {
      title: 'Esperando jugadores',
      emoji: '👥',
      tips: [
        'Se necesitan minimo 4 jugadores para iniciar',
        'Comparte el codigo de sala con tus amigos',
        'El host puede iniciar cuando todos esten listos',
      ],
    },
  },

  roleReveal: {
    forensicScientist: {
      title: 'Eres el Cientifico Forense',
      emoji: '🔬',
      tips: [
        'Conoceras el crimen cuando el asesino lo seleccione',
        'Tu unica forma de comunicarte es a traves de las fichas de escena',
        'NO puedes hablar ni gesticular - solo colocar marcadores',
      ],
    },
    // All non-FS players see this neutral message
    default: {
      title: 'Tu rol secreto',
      emoji: '🎭',
      tips: [
        'Manten presionado para ver tu rol',
        'No dejes que otros vean tu pantalla',
        'Recuerda bien tu objetivo',
      ],
    },
  },

  murderSelection: {
    forensicScientist: {
      title: 'Noche del crimen',
      emoji: '🌙',
      tips: [
        'El asesino esta eligiendo su crimen',
        'Pronto conoceras la solucion y deberas dar pistas',
      ],
    },
    // All non-FS players see the same neutral message
    default: {
      title: 'Noche del crimen',
      emoji: '🌙',
      tips: [
        'Manten los ojos cerrados',
        'El crimen se esta cometiendo',
        'Pronto comenzara la investigacion',
      ],
    },
  },

  clueGiving: {
    forensicScientist: {
      title: 'Coloca las pistas',
      emoji: '📍',
      tips: [
        'Selecciona UNA opcion en cada ficha de escena',
        'Las pistas deben apuntar a la evidencia Y el metodo',
        'NO puedes hablar ni hacer gestos',
        'En rondas 2-3 puedes reemplazar una ficha',
      ],
    },
    // All non-FS players see the same tips
    default: {
      title: 'El forense da pistas',
      emoji: '🧩',
      tips: [
        'Observa que opciones selecciona el forense',
        'Piensa que evidencia y metodo encajan',
        'Prepara tu teoria para la discusion',
      ],
    },
  },

  discussion: {
    forensicScientist: {
      title: 'Discusion en curso',
      emoji: '🤫',
      tips: [
        'NO puedes hablar ni dar indicaciones',
        'Puedes avanzar a la siguiente ronda cuando quieras',
        'En la ultima ronda el juego terminara automaticamente',
      ],
    },
    // All non-FS players see the same tips
    default: {
      title: 'Investiga y acusa',
      emoji: '🎯',
      tips: [
        'Analiza las pistas y las cartas de cada jugador',
        'Discute tus teorias con otros jugadores',
        'Solo tienes UNA acusacion - asegurate antes de usarla',
      ],
    },
  },

  finished: {
    default: {
      title: 'Partida terminada',
      emoji: '🏁',
      tips: [
        'Revisa los roles de todos los jugadores',
        'Analiza las pistas del forense vs la solucion',
        'El host puede iniciar una nueva partida',
      ],
    },
  },
};

export function getHelperContent(
  phase: AsesinatoPhase,
  role: AsesinatoRole | null
): HelperContent {
  const phaseContent = helperContent[phase];

  // IMPORTANT: Only show role-specific content to Forensic Scientist
  // Everyone else sees investigator tips to prevent role leaking via helper
  if (role === 'forensicScientist' && phaseContent.forensicScientist) {
    return phaseContent.forensicScientist;
  }

  // For all other roles, show investigator content (or default)
  // This prevents nearby players from seeing role-specific tips
  if (phaseContent.investigator) {
    return phaseContent.investigator;
  }

  // Fall back to default content
  if (phaseContent.default) {
    return phaseContent.default;
  }

  // Ultimate fallback
  return {
    title: 'Asesinato en Hong Kong',
    emoji: '🔪',
    tips: ['Juega y disfruta del juego'],
  };
}
