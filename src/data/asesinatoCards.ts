// Asesinato en Hong Kong - Card Data
// Based on Deception: Murder in Hong Kong

import type { AsesinatoClueCard, AsesinatoMeansCard, AsesinatoSceneTile } from '@/types/game';

// ============================================
// CLUE CARDS (Evidencias) - 50 cards
// Physical evidence found at the crime scene
// ============================================

export const CLUE_CARDS: AsesinatoClueCard[] = [
  // Armas (Weapons) - 15 cards
  { id: 'clue-001', name: 'Cuchillo', category: 'Arma' },
  { id: 'clue-002', name: 'Pistola', category: 'Arma' },
  { id: 'clue-003', name: 'Cuerda', category: 'Arma' },
  { id: 'clue-004', name: 'Hacha', category: 'Arma' },
  { id: 'clue-005', name: 'Martillo', category: 'Arma' },
  { id: 'clue-006', name: 'Tijeras', category: 'Arma' },
  { id: 'clue-007', name: 'Destornillador', category: 'Arma' },
  { id: 'clue-008', name: 'Bate de béisbol', category: 'Arma' },
  { id: 'clue-009', name: 'Botella rota', category: 'Arma' },
  { id: 'clue-010', name: 'Candelabro', category: 'Arma' },
  { id: 'clue-011', name: 'Sartén', category: 'Arma' },
  { id: 'clue-012', name: 'Almohada', category: 'Arma' },
  { id: 'clue-013', name: 'Cable eléctrico', category: 'Arma' },
  { id: 'clue-014', name: 'Bolsa de plástico', category: 'Arma' },
  { id: 'clue-015', name: 'Piedra', category: 'Arma' },

  // Objetos (Objects) - 15 cards
  { id: 'clue-016', name: 'Teléfono móvil', category: 'Objeto' },
  { id: 'clue-017', name: 'Llave', category: 'Objeto' },
  { id: 'clue-018', name: 'Carta', category: 'Objeto' },
  { id: 'clue-019', name: 'Fotografía', category: 'Objeto' },
  { id: 'clue-020', name: 'Reloj', category: 'Objeto' },
  { id: 'clue-021', name: 'Anillo', category: 'Objeto' },
  { id: 'clue-022', name: 'Billetera', category: 'Objeto' },
  { id: 'clue-023', name: 'Gafas', category: 'Objeto' },
  { id: 'clue-024', name: 'Collar', category: 'Objeto' },
  { id: 'clue-025', name: 'Pañuelo', category: 'Objeto' },
  { id: 'clue-026', name: 'Guantes', category: 'Objeto' },
  { id: 'clue-027', name: 'Tarjeta de crédito', category: 'Objeto' },
  { id: 'clue-028', name: 'Pasaporte', category: 'Objeto' },
  { id: 'clue-029', name: 'Pendrive USB', category: 'Objeto' },
  { id: 'clue-030', name: 'Cigarrillo', category: 'Objeto' },

  // Sustancias (Substances) - 10 cards
  { id: 'clue-031', name: 'Veneno', category: 'Sustancia' },
  { id: 'clue-032', name: 'Medicamentos', category: 'Sustancia' },
  { id: 'clue-033', name: 'Alcohol', category: 'Sustancia' },
  { id: 'clue-034', name: 'Perfume', category: 'Sustancia' },
  { id: 'clue-035', name: 'Polvo blanco', category: 'Sustancia' },
  { id: 'clue-036', name: 'Lejía', category: 'Sustancia' },
  { id: 'clue-037', name: 'Gasolina', category: 'Sustancia' },
  { id: 'clue-038', name: 'Insecticida', category: 'Sustancia' },
  { id: 'clue-039', name: 'Jeringa', category: 'Sustancia' },
  { id: 'clue-040', name: 'Anticongelante', category: 'Sustancia' },

  // Materiales/Rastros (Materials/Traces) - 10 cards
  { id: 'clue-041', name: 'Fibras de ropa', category: 'Rastro' },
  { id: 'clue-042', name: 'Pelo', category: 'Rastro' },
  { id: 'clue-043', name: 'Huellas dactilares', category: 'Rastro' },
  { id: 'clue-044', name: 'Tierra', category: 'Rastro' },
  { id: 'clue-045', name: 'Cristal roto', category: 'Rastro' },
  { id: 'clue-046', name: 'Sangre', category: 'Rastro' },
  { id: 'clue-047', name: 'Pintura', category: 'Rastro' },
  { id: 'clue-048', name: 'Cinta adhesiva', category: 'Rastro' },
  { id: 'clue-049', name: 'Nota escrita a mano', category: 'Rastro' },
  { id: 'clue-050', name: 'Recibo', category: 'Rastro' },
];

// ============================================
// MEANS CARDS (Métodos) - 50 cards
// How the murder was committed
// ============================================

export const MEANS_CARDS: AsesinatoMeansCard[] = [
  // Violento (Violent) - 15 cards
  { id: 'means-001', name: 'Apuñalado', category: 'Violento' },
  { id: 'means-002', name: 'Disparado', category: 'Violento' },
  { id: 'means-003', name: 'Golpeado', category: 'Violento' },
  { id: 'means-004', name: 'Estrangulado', category: 'Violento' },
  { id: 'means-005', name: 'Decapitado', category: 'Violento' },
  { id: 'means-006', name: 'Aplastado', category: 'Violento' },
  { id: 'means-007', name: 'Desmembrado', category: 'Violento' },
  { id: 'means-008', name: 'Acuchillado', category: 'Violento' },
  { id: 'means-009', name: 'Degollado', category: 'Violento' },
  { id: 'means-010', name: 'Arrollado', category: 'Violento' },
  { id: 'means-011', name: 'Empalado', category: 'Violento' },
  { id: 'means-012', name: 'Lapidado', category: 'Violento' },
  { id: 'means-013', name: 'Atacado con ácido', category: 'Violento' },
  { id: 'means-014', name: 'Mutilado', category: 'Violento' },
  { id: 'means-015', name: 'Atravesado', category: 'Violento' },

  // Silencioso (Silent/Subtle) - 15 cards
  { id: 'means-016', name: 'Envenenado', category: 'Silencioso' },
  { id: 'means-017', name: 'Asfixiado', category: 'Silencioso' },
  { id: 'means-018', name: 'Ahogado', category: 'Silencioso' },
  { id: 'means-019', name: 'Sofocado', category: 'Silencioso' },
  { id: 'means-020', name: 'Inyectado', category: 'Silencioso' },
  { id: 'means-021', name: 'Intoxicado', category: 'Silencioso' },
  { id: 'means-022', name: 'Hipotermia', category: 'Silencioso' },
  { id: 'means-023', name: 'Inanición', category: 'Silencioso' },
  { id: 'means-024', name: 'Deshidratación', category: 'Silencioso' },
  { id: 'means-025', name: 'Sobredosis', category: 'Silencioso' },
  { id: 'means-026', name: 'Sedado hasta la muerte', category: 'Silencioso' },
  { id: 'means-027', name: 'Privación de oxígeno', category: 'Silencioso' },
  { id: 'means-028', name: 'Reacción alérgica', category: 'Silencioso' },
  { id: 'means-029', name: 'Ataque cardíaco inducido', category: 'Silencioso' },
  { id: 'means-030', name: 'Enterrado vivo', category: 'Silencioso' },

  // Accidental (Staged as accident) - 10 cards
  { id: 'means-031', name: 'Caída', category: 'Accidental' },
  { id: 'means-032', name: 'Electrocutado', category: 'Accidental' },
  { id: 'means-033', name: 'Accidente de tráfico', category: 'Accidental' },
  { id: 'means-034', name: 'Incendio', category: 'Accidental' },
  { id: 'means-035', name: 'Ahogamiento', category: 'Accidental' },
  { id: 'means-036', name: 'Explosión', category: 'Accidental' },
  { id: 'means-037', name: 'Accidente doméstico', category: 'Accidental' },
  { id: 'means-038', name: 'Caída de objetos', category: 'Accidental' },
  { id: 'means-039', name: 'Accidente laboral', category: 'Accidental' },
  { id: 'means-040', name: 'Fuga de gas', category: 'Accidental' },

  // Simulado (Staged) - 10 cards
  { id: 'means-041', name: 'Suicidio simulado', category: 'Simulado' },
  { id: 'means-042', name: 'Robo que salió mal', category: 'Simulado' },
  { id: 'means-043', name: 'Crimen pasional', category: 'Simulado' },
  { id: 'means-044', name: 'Ajuste de cuentas', category: 'Simulado' },
  { id: 'means-045', name: 'Ataque de animal', category: 'Simulado' },
  { id: 'means-046', name: 'Desaparición', category: 'Simulado' },
  { id: 'means-047', name: 'Muerte natural', category: 'Simulado' },
  { id: 'means-048', name: 'Secuestro fallido', category: 'Simulado' },
  { id: 'means-049', name: 'Envenenamiento alimentario', category: 'Simulado' },
  { id: 'means-050', name: 'Error médico', category: 'Simulado' },
];

// ============================================
// SCENE TILES (Fichas de Escena) - 24 tiles
// Each tile has 6 options for the Forensic Scientist to choose from
// ============================================

// Special tiles (always visible)
export const CAUSE_OF_DEATH_TILE: Omit<AsesinatoSceneTile, 'selectedOption' | 'isLocked'> = {
  id: 'tile-cause',
  title: 'Causa de Muerte',
  options: ['Asfixia', 'Trauma severo', 'Envenenamiento', 'Pérdida de sangre', 'Enfermedad/Debilidad', 'Otros'],
};

export const LOCATION_TILE: Omit<AsesinatoSceneTile, 'selectedOption' | 'isLocked'> = {
  id: 'tile-location',
  title: 'Ubicación del Crimen',
  options: ['Casa/Apartamento', 'Oficina/Trabajo', 'Exterior/Calle', 'Vehículo', 'Lugar público', 'Lugar abandonado'],
};

// Regular scene tiles (4 randomly selected per round)
export const SCENE_TILES: Array<Omit<AsesinatoSceneTile, 'selectedOption' | 'isLocked'>> = [
  {
    id: 'tile-001',
    title: 'Hora del Crimen',
    options: ['Madrugada (0-6h)', 'Mañana (6-12h)', 'Mediodía (12-14h)', 'Tarde (14-18h)', 'Noche (18-24h)', 'Desconocida'],
  },
  {
    id: 'tile-002',
    title: 'Estado del Cadáver',
    options: ['Intacto', 'Desfigurado', 'Desmembrado', 'Quemado', 'Congelado', 'Descompuesto'],
  },
  {
    id: 'tile-003',
    title: 'Personalidad del Asesino',
    options: ['Frío/Calculador', 'Impulsivo', 'Meticuloso', 'Sádico', 'Arrepentido', 'Profesional'],
  },
  {
    id: 'tile-004',
    title: 'Clima',
    options: ['Soleado', 'Lluvioso', 'Nevado', 'Ventoso', 'Caluroso', 'Nublado'],
  },
  {
    id: 'tile-005',
    title: 'Día de la Semana',
    options: ['Lunes-Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo', 'Día festivo'],
  },
  {
    id: 'tile-006',
    title: 'Relación con Víctima',
    options: ['Familia', 'Amigo', 'Colega', 'Amante', 'Desconocido', 'Enemigo'],
  },
  {
    id: 'tile-007',
    title: 'Pistas Dejadas',
    options: ['Huella dactilar', 'ADN', 'Testigo ocular', 'Video/Grabación', 'Audio', 'Ninguna'],
  },
  {
    id: 'tile-008',
    title: 'Motivo',
    options: ['Dinero', 'Venganza', 'Celos', 'Secreto', 'Locura', 'Sin motivo aparente'],
  },
  {
    id: 'tile-009',
    title: 'Duración del Crimen',
    options: ['Segundos', 'Minutos', 'Horas', 'Días', 'Muy planificado', 'Oportunista'],
  },
  {
    id: 'tile-010',
    title: 'Vestimenta del Asesino',
    options: ['Formal', 'Casual', 'Disfrazado', 'Uniforme', 'Ropa oscura', 'Normal/Común'],
  },
  {
    id: 'tile-011',
    title: 'Género del Asesino',
    options: ['Masculino', 'Femenino', 'Joven', 'Adulto', 'Mayor', 'Indefinido'],
  },
  {
    id: 'tile-012',
    title: 'Huella Social',
    options: ['Rico', 'Clase media', 'Pobre', 'Famoso', 'Anónimo', 'Criminal conocido'],
  },
  {
    id: 'tile-013',
    title: 'Ocupación del Asesino',
    options: ['Profesional', 'Obrero', 'Estudiante', 'Desempleado', 'Jubilado', 'Ilegal'],
  },
  {
    id: 'tile-014',
    title: 'Transporte',
    options: ['A pie', 'Coche', 'Moto', 'Transporte público', 'Bicicleta', 'Ninguno/En el lugar'],
  },
  {
    id: 'tile-015',
    title: 'Tamaño del Arma',
    options: ['Muy pequeña', 'Pequeña', 'Mediana', 'Grande', 'Muy grande', 'Sin arma física'],
  },
  {
    id: 'tile-016',
    title: 'Expresión del Cadáver',
    options: ['Pacífico', 'Sorprendido', 'Aterrorizado', 'Enojado', 'Triste', 'Sin expresión'],
  },
  {
    id: 'tile-017',
    title: 'Número de Víctimas',
    options: ['Una', 'Dos', 'Tres o más', 'Familia entera', 'Grupo', 'Solo el objetivo'],
  },
  {
    id: 'tile-018',
    title: 'Evidencia en la Escena',
    options: ['Abundante', 'Poca', 'Limpiada', 'Plantada', 'Caótica', 'Ninguna'],
  },
  {
    id: 'tile-019',
    title: 'Posición del Cuerpo',
    options: ['Boca arriba', 'Boca abajo', 'Sentado', 'De pie', 'Escondido', 'Posicionado'],
  },
  {
    id: 'tile-020',
    title: 'Interior vs Exterior',
    options: ['Interior', 'Exterior', 'Ambos', 'Subterráneo', 'Elevado', 'Agua'],
  },
  {
    id: 'tile-021',
    title: 'Complejidad del Crimen',
    options: ['Simple', 'Elaborado', 'Caótico', 'Ritualista', 'Técnico', 'Brutal'],
  },
  {
    id: 'tile-022',
    title: 'Testigos',
    options: ['Ninguno', 'Uno', 'Varios', 'Multitud', 'Cámaras', 'Animales'],
  },
  {
    id: 'tile-023',
    title: 'Iluminación',
    options: ['Día claro', 'Noche oscura', 'Artificial', 'Tenue', 'Intermitente', 'Natural'],
  },
  {
    id: 'tile-024',
    title: 'Sonido',
    options: ['Silencioso', 'Ruidoso', 'Música', 'Gritos', 'Disparo', 'Amortiguado'],
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

// Get shuffled clue cards
export function getShuffledClueCards(): AsesinatoClueCard[] {
  return [...CLUE_CARDS].sort(() => Math.random() - 0.5);
}

// Get shuffled means cards
export function getShuffledMeansCards(): AsesinatoMeansCard[] {
  return [...MEANS_CARDS].sort(() => Math.random() - 0.5);
}

// Get random scene tiles (excluding the special ones)
export function getRandomSceneTiles(count: number, excludeIds: string[] = []): AsesinatoSceneTile[] {
  const available = SCENE_TILES.filter(t => !excludeIds.includes(t.id));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(tile => ({
    ...tile,
    selectedOption: null,
    isLocked: false,
  }));
}

// Get the special cause of death tile
export function getCauseOfDeathTile(): AsesinatoSceneTile {
  return {
    ...CAUSE_OF_DEATH_TILE,
    selectedOption: null,
    isLocked: false,
  };
}

// Get the special location tile
export function getLocationTile(): AsesinatoSceneTile {
  return {
    ...LOCATION_TILE,
    selectedOption: null,
    isLocked: false,
  };
}

// Get all available scene tiles for replacement
export function getAllSceneTiles(): AsesinatoSceneTile[] {
  return SCENE_TILES.map(tile => ({
    ...tile,
    selectedOption: null,
    isLocked: false,
  }));
}

// Stats
export const TOTAL_CLUE_CARDS = CLUE_CARDS.length;
export const TOTAL_MEANS_CARDS = MEANS_CARDS.length;
export const TOTAL_SCENE_TILES = SCENE_TILES.length;
