// Gaming Hub - Impostor Game Word Pairs
// HARD MODE: Words are very similar, hints are vague - requires careful descriptions

import type { ImpostorWordPair } from '@/types/game';

export const IMPOSTOR_WORD_PAIRS: ImpostorWordPair[] = [
  // Conceptos abstractos confusos
  { civilian: "Tiempo", impostor: "Momento", hint: "Pasa", category: "abstracto" },
  { civilian: "Espacio", impostor: "Lugar", hint: "Existe", category: "abstracto" },
  { civilian: "Idea", impostor: "Pensamiento", hint: "Mental", category: "abstracto" },
  { civilian: "Suerte", impostor: "Destino", hint: "Incierto", category: "abstracto" },
  { civilian: "Silencio", impostor: "Calma", hint: "Tranquilo", category: "abstracto" },
  { civilian: "Sombra", impostor: "Oscuridad", hint: "No luz", category: "abstracto" },
  { civilian: "Eco", impostor: "Reflejo", hint: "Repite", category: "abstracto" },
  { civilian: "Vacio", impostor: "Nada", hint: "Ausencia", category: "abstracto" },
  { civilian: "Infinito", impostor: "Eterno", hint: "Sin fin", category: "abstracto" },
  { civilian: "Secreto", impostor: "Misterio", hint: "Oculto", category: "abstracto" },

  // Acciones muy similares
  { civilian: "Caminar", impostor: "Andar", hint: "Pies", category: "acciones" },
  { civilian: "Mirar", impostor: "Ver", hint: "Ojos", category: "acciones" },
  { civilian: "Escuchar", impostor: "Oir", hint: "Sonido", category: "acciones" },
  { civilian: "Hablar", impostor: "Decir", hint: "Boca", category: "acciones" },
  { civilian: "Pensar", impostor: "Creer", hint: "Cabeza", category: "acciones" },
  { civilian: "Sentir", impostor: "Percibir", hint: "Interno", category: "acciones" },
  { civilian: "Recordar", impostor: "Acordarse", hint: "Pasado", category: "acciones" },
  { civilian: "Esperar", impostor: "Aguardar", hint: "Paciencia", category: "acciones" },
  { civilian: "Buscar", impostor: "Encontrar", hint: "Perdido", category: "acciones" },
  { civilian: "Empezar", impostor: "Comenzar", hint: "Inicio", category: "acciones" },
  { civilian: "Terminar", impostor: "Acabar", hint: "Final", category: "acciones" },
  { civilian: "Subir", impostor: "Ascender", hint: "Arriba", category: "acciones" },

  // Casi sinonimos
  { civilian: "Rapido", impostor: "Veloz", hint: "Prisa", category: "sinonimos" },
  { civilian: "Lento", impostor: "Despacio", hint: "Calma", category: "sinonimos" },
  { civilian: "Grande", impostor: "Enorme", hint: "Tamaño", category: "sinonimos" },
  { civilian: "Pequeno", impostor: "Diminuto", hint: "Chico", category: "sinonimos" },
  { civilian: "Bonito", impostor: "Hermoso", hint: "Agrada", category: "sinonimos" },
  { civilian: "Feo", impostor: "Horrible", hint: "Desagrada", category: "sinonimos" },
  { civilian: "Nuevo", impostor: "Reciente", hint: "Fresco", category: "sinonimos" },
  { civilian: "Viejo", impostor: "Antiguo", hint: "Anos", category: "sinonimos" },
  { civilian: "Facil", impostor: "Simple", hint: "Sin esfuerzo", category: "sinonimos" },
  { civilian: "Dificil", impostor: "Complicado", hint: "Esfuerzo", category: "sinonimos" },
  { civilian: "Lleno", impostor: "Completo", hint: "Capacidad", category: "sinonimos" },
  { civilian: "Vacio", impostor: "Hueco", hint: "Nada dentro", category: "sinonimos" },

  // Partes del cuerpo confusas
  { civilian: "Dedo", impostor: "Pulgar", hint: "Extremidad", category: "cuerpo" },
  { civilian: "Brazo", impostor: "Mano", hint: "Extremidad superior", category: "cuerpo" },
  { civilian: "Pierna", impostor: "Pie", hint: "Caminar", category: "cuerpo" },
  { civilian: "Cabeza", impostor: "Cara", hint: "Arriba", category: "cuerpo" },
  { civilian: "Ojo", impostor: "Pupila", hint: "Vision", category: "cuerpo" },
  { civilian: "Oreja", impostor: "Oido", hint: "Escuchar", category: "cuerpo" },
  { civilian: "Boca", impostor: "Labios", hint: "Hablar", category: "cuerpo" },
  { civilian: "Nariz", impostor: "Fosas", hint: "Respirar", category: "cuerpo" },
  { civilian: "Pelo", impostor: "Cabello", hint: "Crece", category: "cuerpo" },
  { civilian: "Piel", impostor: "Cutis", hint: "Cubre", category: "cuerpo" },

  // Tiempo confuso
  { civilian: "Ayer", impostor: "Antes", hint: "No hoy", category: "tiempo" },
  { civilian: "Manana", impostor: "Luego", hint: "Despues", category: "tiempo" },
  { civilian: "Ahora", impostor: "Ya", hint: "Presente", category: "tiempo" },
  { civilian: "Siempre", impostor: "Constantemente", hint: "Continuo", category: "tiempo" },
  { civilian: "Nunca", impostor: "Jamas", hint: "Cero veces", category: "tiempo" },
  { civilian: "Pronto", impostor: "Enseguida", hint: "Poco tiempo", category: "tiempo" },
  { civilian: "Tarde", impostor: "Despues", hint: "No temprano", category: "tiempo" },
  { civilian: "Noche", impostor: "Madrugada", hint: "Oscuro", category: "tiempo" },
  { civilian: "Dia", impostor: "Jornada", hint: "Luz", category: "tiempo" },
  { civilian: "Semana", impostor: "Dias", hint: "Siete", category: "tiempo" },

  // Elementos naturales sutiles
  { civilian: "Agua", impostor: "Liquido", hint: "Fluye", category: "naturaleza" },
  { civilian: "Fuego", impostor: "Llama", hint: "Caliente", category: "naturaleza" },
  { civilian: "Tierra", impostor: "Suelo", hint: "Pisamos", category: "naturaleza" },
  { civilian: "Aire", impostor: "Viento", hint: "Invisible", category: "naturaleza" },
  { civilian: "Piedra", impostor: "Roca", hint: "Duro", category: "naturaleza" },
  { civilian: "Arena", impostor: "Polvo", hint: "Granos", category: "naturaleza" },
  { civilian: "Nube", impostor: "Vapor", hint: "Cielo", category: "naturaleza" },
  { civilian: "Ola", impostor: "Marea", hint: "Mar", category: "naturaleza" },
  { civilian: "Montana", impostor: "Cerro", hint: "Alto", category: "naturaleza" },
  { civilian: "Valle", impostor: "Llanura", hint: "Bajo", category: "naturaleza" },
  { civilian: "Bosque", impostor: "Arboleda", hint: "Arboles", category: "naturaleza" },
  { civilian: "Rio", impostor: "Arroyo", hint: "Corriente", category: "naturaleza" },

  // Sonidos y ruidos
  { civilian: "Ruido", impostor: "Sonido", hint: "Se oye", category: "sonidos" },
  { civilian: "Grito", impostor: "Alarido", hint: "Fuerte", category: "sonidos" },
  { civilian: "Susurro", impostor: "Murmullo", hint: "Bajo", category: "sonidos" },
  { civilian: "Risa", impostor: "Carcajada", hint: "Alegre", category: "sonidos" },
  { civilian: "Llanto", impostor: "Sollozo", hint: "Triste", category: "sonidos" },
  { civilian: "Golpe", impostor: "Impacto", hint: "Choque", category: "sonidos" },
  { civilian: "Explosion", impostor: "Estallido", hint: "Boom", category: "sonidos" },
  { civilian: "Silbido", impostor: "Pitido", hint: "Agudo", category: "sonidos" },

  // Movimientos
  { civilian: "Saltar", impostor: "Brincar", hint: "Aire", category: "movimiento" },
  { civilian: "Correr", impostor: "Trotar", hint: "Rapido", category: "movimiento" },
  { civilian: "Girar", impostor: "Rotar", hint: "Circulo", category: "movimiento" },
  { civilian: "Caer", impostor: "Bajar", hint: "Gravedad", category: "movimiento" },
  { civilian: "Volar", impostor: "Planear", hint: "Aire", category: "movimiento" },
  { civilian: "Nadar", impostor: "Flotar", hint: "Agua", category: "movimiento" },
  { civilian: "Trepar", impostor: "Escalar", hint: "Subir", category: "movimiento" },
  { civilian: "Arrastrar", impostor: "Deslizar", hint: "Suelo", category: "movimiento" },
  { civilian: "Empujar", impostor: "Presionar", hint: "Fuerza", category: "movimiento" },
  { civilian: "Tirar", impostor: "Jalar", hint: "Hacia ti", category: "movimiento" },

  // Estados mentales
  { civilian: "Dormido", impostor: "Inconsciente", hint: "No despierto", category: "estados" },
  { civilian: "Despierto", impostor: "Consciente", hint: "Alerta", category: "estados" },
  { civilian: "Cansado", impostor: "Agotado", hint: "Sin energia", category: "estados" },
  { civilian: "Confundido", impostor: "Perdido", hint: "No entiende", category: "estados" },
  { civilian: "Concentrado", impostor: "Enfocado", hint: "Atencion", category: "estados" },
  { civilian: "Distraido", impostor: "Ausente", hint: "No atencion", category: "estados" },
  { civilian: "Nervioso", impostor: "Ansioso", hint: "Inquieto", category: "estados" },
  { civilian: "Tranquilo", impostor: "Relajado", hint: "En paz", category: "estados" },
  { civilian: "Enojado", impostor: "Furioso", hint: "Molesto", category: "estados" },
  { civilian: "Contento", impostor: "Satisfecho", hint: "Bien", category: "estados" },

  // Cantidades
  { civilian: "Mucho", impostor: "Bastante", hint: "Cantidad", category: "cantidad" },
  { civilian: "Poco", impostor: "Escaso", hint: "Menos", category: "cantidad" },
  { civilian: "Todo", impostor: "Completo", hint: "Entero", category: "cantidad" },
  { civilian: "Nada", impostor: "Cero", hint: "Ausencia", category: "cantidad" },
  { civilian: "Mitad", impostor: "Medio", hint: "Dividido", category: "cantidad" },
  { civilian: "Doble", impostor: "Duplicado", hint: "Dos veces", category: "cantidad" },
  { civilian: "Varios", impostor: "Algunos", hint: "Mas de uno", category: "cantidad" },
  { civilian: "Unico", impostor: "Solo", hint: "Uno", category: "cantidad" },

  // Direcciones
  { civilian: "Arriba", impostor: "Encima", hint: "Superior", category: "direccion" },
  { civilian: "Abajo", impostor: "Debajo", hint: "Inferior", category: "direccion" },
  { civilian: "Adelante", impostor: "Frente", hint: "Enfrente", category: "direccion" },
  { civilian: "Atras", impostor: "Detras", hint: "Espalda", category: "direccion" },
  { civilian: "Izquierda", impostor: "Lado", hint: "Direccion", category: "direccion" },
  { civilian: "Derecha", impostor: "Lado", hint: "Direccion", category: "direccion" },
  { civilian: "Centro", impostor: "Medio", hint: "Entre", category: "direccion" },
  { civilian: "Borde", impostor: "Orilla", hint: "Limite", category: "direccion" },

  // Relaciones
  { civilian: "Amigo", impostor: "Companero", hint: "Cercano", category: "relaciones" },
  { civilian: "Enemigo", impostor: "Rival", hint: "Opuesto", category: "relaciones" },
  { civilian: "Pareja", impostor: "Novio", hint: "Amor", category: "relaciones" },
  { civilian: "Familia", impostor: "Parientes", hint: "Sangre", category: "relaciones" },
  { civilian: "Vecino", impostor: "Cercano", hint: "Al lado", category: "relaciones" },
  { civilian: "Jefe", impostor: "Lider", hint: "Manda", category: "relaciones" },
  { civilian: "Socio", impostor: "Aliado", hint: "Juntos", category: "relaciones" },
  { civilian: "Desconocido", impostor: "Extrano", hint: "No conocido", category: "relaciones" },

  // Sabores y sensaciones
  { civilian: "Dulce", impostor: "Azucarado", hint: "Sabor", category: "sensaciones" },
  { civilian: "Salado", impostor: "Sabroso", hint: "Sabor", category: "sensaciones" },
  { civilian: "Amargo", impostor: "Acido", hint: "Sabor fuerte", category: "sensaciones" },
  { civilian: "Picante", impostor: "Ardiente", hint: "Quema", category: "sensaciones" },
  { civilian: "Frio", impostor: "Helado", hint: "Temperatura", category: "sensaciones" },
  { civilian: "Caliente", impostor: "Tibio", hint: "Temperatura", category: "sensaciones" },
  { civilian: "Suave", impostor: "Blando", hint: "Textura", category: "sensaciones" },
  { civilian: "Duro", impostor: "Rigido", hint: "Textura", category: "sensaciones" },
  { civilian: "Humedo", impostor: "Mojado", hint: "Agua", category: "sensaciones" },
  { civilian: "Seco", impostor: "Arido", hint: "Sin agua", category: "sensaciones" },

  // Colores sutiles
  { civilian: "Rojo", impostor: "Carmesi", hint: "Color calido", category: "colores" },
  { civilian: "Azul", impostor: "Celeste", hint: "Color frio", category: "colores" },
  { civilian: "Verde", impostor: "Esmeralda", hint: "Naturaleza", category: "colores" },
  { civilian: "Amarillo", impostor: "Dorado", hint: "Brillante", category: "colores" },
  { civilian: "Blanco", impostor: "Claro", hint: "Luz", category: "colores" },
  { civilian: "Negro", impostor: "Oscuro", hint: "Ausencia", category: "colores" },
  { civilian: "Gris", impostor: "Plata", hint: "Neutro", category: "colores" },
  { civilian: "Rosa", impostor: "Rosado", hint: "Suave", category: "colores" },

  // Conceptos filosóficos
  { civilian: "Verdad", impostor: "Realidad", hint: "Cierto", category: "filosofia" },
  { civilian: "Mentira", impostor: "Engano", hint: "Falso", category: "filosofia" },
  { civilian: "Bien", impostor: "Correcto", hint: "Positivo", category: "filosofia" },
  { civilian: "Mal", impostor: "Incorrecto", hint: "Negativo", category: "filosofia" },
  { civilian: "Vida", impostor: "Existencia", hint: "Ser", category: "filosofia" },
  { civilian: "Muerte", impostor: "Fin", hint: "Termina", category: "filosofia" },
  { civilian: "Libertad", impostor: "Independencia", hint: "Sin ataduras", category: "filosofia" },
  { civilian: "Justicia", impostor: "Equidad", hint: "Justo", category: "filosofia" },
  { civilian: "Paz", impostor: "Armonia", hint: "Sin conflicto", category: "filosofia" },
  { civilian: "Guerra", impostor: "Conflicto", hint: "Lucha", category: "filosofia" },
];

// Get random word pair for a game
export function getRandomWordPair(): ImpostorWordPair {
  const index = Math.floor(Math.random() * IMPOSTOR_WORD_PAIRS.length);
  return IMPOSTOR_WORD_PAIRS[index];
}

// Get word pairs by category
export function getWordPairsByCategory(category: string): ImpostorWordPair[] {
  return IMPOSTOR_WORD_PAIRS.filter(pair => pair.category === category);
}

// Get all categories
export function getCategories(): string[] {
  return [...new Set(IMPOSTOR_WORD_PAIRS.map(pair => pair.category))];
}

// Total word pairs count
export const TOTAL_WORD_PAIRS = IMPOSTOR_WORD_PAIRS.length;
