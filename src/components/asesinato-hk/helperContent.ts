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
    murderer: {
      title: 'Eres el Asesino',
      emoji: '🔪',
      tips: [
        'Pronto elegiras UNA evidencia y UN metodo de tus cartas',
        'El Cientifico Forense conocera tu crimen',
        'Debes desviar las sospechas de los investigadores',
      ],
    },
    accomplice: {
      title: 'Eres el Complice',
      emoji: '🤝',
      tips: [
        'Conoces al asesino y pronto sabras su crimen',
        'Ayuda a desviar sospechas sin revelar tu identidad',
        'Si atrapan al asesino, tambien pierdes',
      ],
    },
    witness: {
      title: 'Eres el Testigo',
      emoji: '👁',
      tips: [
        'Viste quien es el asesino y el complice',
        'NO conoces cual fue el crimen exacto',
        'Ten cuidado de no revelarte demasiado',
      ],
    },
    investigator: {
      title: 'Eres un Investigador',
      emoji: '🔍',
      tips: [
        'Tu objetivo es identificar al asesino, la evidencia y el metodo',
        'Analiza las pistas del Cientifico Forense',
        'Solo tienes UNA acusacion - usala sabiamente',
      ],
    },
  },

  murderSelection: {
    murderer: {
      title: 'Elige tu crimen',
      emoji: '💀',
      tips: [
        'Selecciona UNA carta de evidencia de tu mano',
        'Selecciona UNA carta de metodo de tu mano',
        'Elige combinaciones dificiles de adivinar',
      ],
    },
    forensicScientist: {
      title: 'Noche del crimen',
      emoji: '🌙',
      tips: [
        'El asesino esta eligiendo su crimen',
        'Pronto conoceras la solucion y deberas dar pistas',
      ],
    },
    accomplice: {
      title: 'Noche del crimen',
      emoji: '🌙',
      tips: [
        'Tu companero asesino esta eligiendo el crimen',
        'Pronto conoceras la solucion para ayudar a encubrir',
      ],
    },
    witness: {
      title: 'Noche del crimen',
      emoji: '🌙',
      tips: [
        'El asesino esta eligiendo su crimen',
        'Tu sabes quien es, pero no que eligio',
      ],
    },
    investigator: {
      title: 'Noche del crimen',
      emoji: '🌙',
      tips: [
        'El asesino esta eligiendo su crimen',
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
    murderer: {
      title: 'Observa las pistas',
      emoji: '😈',
      tips: [
        'Conoces el crimen - usa las pistas para confundir',
        'Sugiere interpretaciones alternativas de las pistas',
        'No te delates defendiendote demasiado',
      ],
    },
    accomplice: {
      title: 'Ayuda a confundir',
      emoji: '🎭',
      tips: [
        'Conoces el crimen - ayuda a desviar sospechas',
        'Sugiere pistas falsas o interpretaciones erroneas',
        'Actua como un investigador normal',
      ],
    },
    witness: {
      title: 'El forense da pistas',
      emoji: '👀',
      tips: [
        'Observa las pistas del Cientifico Forense',
        'Recuerda quien es el asesino cuando analices',
        'Puedes dar pistas sutiles sin revelarte',
      ],
    },
    investigator: {
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
    murderer: {
      title: 'Defiendete',
      emoji: '🗣',
      tips: [
        'Participa activamente sin ser sospechoso',
        'Apunta sospechas hacia otros jugadores',
        'Defiende tus cartas de forma natural',
      ],
    },
    accomplice: {
      title: 'Ayuda al asesino',
      emoji: '🛡',
      tips: [
        'Defiende sutilmente al asesino',
        'Sugiere otras combinaciones de cartas',
        'No seas demasiado obvio en tu defensa',
      ],
    },
    witness: {
      title: 'Guia la discusion',
      emoji: '💡',
      tips: [
        'Puedes dirigir sospechas hacia el asesino',
        'Cuidado: el asesino podria descubrir que eres testigo',
        'Se sutil para no exponerte',
      ],
    },
    investigator: {
      title: 'Investiga y acusa',
      emoji: '🎯',
      tips: [
        'Analiza las pistas y las cartas de cada jugador',
        'Discute tus teorias con otros investigadores',
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

  // Try role-specific content first
  if (role && phaseContent[role]) {
    return phaseContent[role]!;
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
