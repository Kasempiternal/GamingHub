// Wavelength Spectrum Cards - Spanish Edition
// Each card has two opposing concepts on a spectrum

import type { WavelengthSpectrumCard } from '@/types/game';

export const SPECTRUM_CARDS: WavelengthSpectrumCard[] = [
  // Temperature / Sensation
  { id: '1', leftConcept: 'Frío', rightConcept: 'Caliente' },
  { id: '2', leftConcept: 'Suave', rightConcept: 'Áspero' },
  { id: '3', leftConcept: 'Ligero', rightConcept: 'Pesado' },
  { id: '4', leftConcept: 'Lento', rightConcept: 'Rápido' },
  { id: '5', leftConcept: 'Silencioso', rightConcept: 'Ruidoso' },

  // Quality / Value
  { id: '6', leftConcept: 'Barato', rightConcept: 'Caro' },
  { id: '7', leftConcept: 'Malo', rightConcept: 'Bueno' },
  { id: '8', leftConcept: 'Feo', rightConcept: 'Bonito' },
  { id: '9', leftConcept: 'Aburrido', rightConcept: 'Emocionante' },
  { id: '10', leftConcept: 'Normal', rightConcept: 'Raro' },

  // Difficulty / Complexity
  { id: '11', leftConcept: 'Fácil', rightConcept: 'Difícil' },
  { id: '12', leftConcept: 'Simple', rightConcept: 'Complicado' },
  { id: '13', leftConcept: 'Seguro', rightConcept: 'Peligroso' },
  { id: '14', leftConcept: 'Común', rightConcept: 'Exclusivo' },
  { id: '15', leftConcept: 'Necesario', rightConcept: 'Innecesario' },

  // Size / Quantity
  { id: '16', leftConcept: 'Pequeño', rightConcept: 'Grande' },
  { id: '17', leftConcept: 'Corto', rightConcept: 'Largo' },
  { id: '18', leftConcept: 'Poco', rightConcept: 'Mucho' },
  { id: '19', leftConcept: 'Vacío', rightConcept: 'Lleno' },
  { id: '20', leftConcept: 'Estrecho', rightConcept: 'Ancho' },

  // Age / Time
  { id: '21', leftConcept: 'Joven', rightConcept: 'Viejo' },
  { id: '22', leftConcept: 'Antiguo', rightConcept: 'Moderno' },
  { id: '23', leftConcept: 'Pasado de moda', rightConcept: 'A la moda' },
  { id: '24', leftConcept: 'Temporal', rightConcept: 'Permanente' },
  { id: '25', leftConcept: 'Nuevo', rightConcept: 'Usado' },

  // Emotion / Feeling
  { id: '26', leftConcept: 'Triste', rightConcept: 'Feliz' },
  { id: '27', leftConcept: 'Relajado', rightConcept: 'Estresado' },
  { id: '28', leftConcept: 'Tímido', rightConcept: 'Extrovertido' },
  { id: '29', leftConcept: 'Serio', rightConcept: 'Gracioso' },
  { id: '30', leftConcept: 'Romántico', rightConcept: 'Realista' },

  // Social / Cultural
  { id: '31', leftConcept: 'Informal', rightConcept: 'Formal' },
  { id: '32', leftConcept: 'Privado', rightConcept: 'Público' },
  { id: '33', leftConcept: 'Local', rightConcept: 'Internacional' },
  { id: '34', leftConcept: 'Tradicional', rightConcept: 'Innovador' },
  { id: '35', leftConcept: 'Amateur', rightConcept: 'Profesional' },

  // Food / Taste
  { id: '36', leftConcept: 'Dulce', rightConcept: 'Salado' },
  { id: '37', leftConcept: 'Suave', rightConcept: 'Picante' },
  { id: '38', leftConcept: 'Saludable', rightConcept: 'Poco saludable' },
  { id: '39', leftConcept: 'Crudo', rightConcept: 'Cocido' },
  { id: '40', leftConcept: 'Vegetariano', rightConcept: 'Carnívoro' },

  // Fame / Recognition
  { id: '41', leftConcept: 'Desconocido', rightConcept: 'Famoso' },
  { id: '42', leftConcept: 'Infravalorado', rightConcept: 'Sobrevalorado' },
  { id: '43', leftConcept: 'De culto', rightConcept: 'Mainstream' },
  { id: '44', leftConcept: 'Fracaso', rightConcept: 'Éxito' },
  { id: '45', leftConcept: 'Olvidado', rightConcept: 'Icónico' },

  // Morality / Character
  { id: '46', leftConcept: 'Villano', rightConcept: 'Héroe' },
  { id: '47', leftConcept: 'Egoísta', rightConcept: 'Generoso' },
  { id: '48', leftConcept: 'Cobarde', rightConcept: 'Valiente' },
  { id: '49', leftConcept: 'Torpe', rightConcept: 'Hábil' },
  { id: '50', leftConcept: 'Tonto', rightConcept: 'Inteligente' },

  // Physical
  { id: '51', leftConcept: 'Débil', rightConcept: 'Fuerte' },
  { id: '52', leftConcept: 'Seco', rightConcept: 'Húmedo' },
  { id: '53', leftConcept: 'Blando', rightConcept: 'Duro' },
  { id: '54', leftConcept: 'Oscuro', rightConcept: 'Brillante' },
  { id: '55', leftConcept: 'Bajo', rightConcept: 'Alto' },

  // Abstract
  { id: '56', leftConcept: 'Real', rightConcept: 'Ficticio' },
  { id: '57', leftConcept: 'Concreto', rightConcept: 'Abstracto' },
  { id: '58', leftConcept: 'Lógico', rightConcept: 'Creativo' },
  { id: '59', leftConcept: 'Práctico', rightConcept: 'Teórico' },
  { id: '60', leftConcept: 'Certeza', rightConcept: 'Misterio' },
];

// Utility function to get a random unused card
export function getRandomCard(usedIds: string[]): WavelengthSpectrumCard {
  const availableCards = SPECTRUM_CARDS.filter(card => !usedIds.includes(card.id));

  // If all cards used, reset
  if (availableCards.length === 0) {
    return SPECTRUM_CARDS[Math.floor(Math.random() * SPECTRUM_CARDS.length)];
  }

  return availableCards[Math.floor(Math.random() * availableCards.length)];
}

// Shuffle array utility
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
