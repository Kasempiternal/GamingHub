// Gaming Hub - Impostor Game Word Pairs
// Each pair has: civilian word, impostor word, and hint for impostor

import type { ImpostorWordPair } from '@/types/game';

export const IMPOSTOR_WORD_PAIRS: ImpostorWordPair[] = [
  // Comida
  { civilian: "Pizza", impostor: "Hamburguesa", hint: "Comida rapida redonda", category: "comida" },
  { civilian: "Helado", impostor: "Yogur", hint: "Lacteo frio dulce", category: "comida" },
  { civilian: "Manzana", impostor: "Pera", hint: "Fruta con semillas", category: "comida" },
  { civilian: "Cafe", impostor: "Te", hint: "Bebida caliente oscura", category: "comida" },
  { civilian: "Chocolate", impostor: "Caramelo", hint: "Dulce marron", category: "comida" },
  { civilian: "Pan", impostor: "Galleta", hint: "Producto de panaderia", category: "comida" },
  { civilian: "Sopa", impostor: "Guiso", hint: "Plato caliente liquido", category: "comida" },
  { civilian: "Ensalada", impostor: "Verduras", hint: "Plato verde saludable", category: "comida" },
  { civilian: "Pasta", impostor: "Arroz", hint: "Carbohidrato principal", category: "comida" },
  { civilian: "Pollo", impostor: "Pavo", hint: "Ave de corral", category: "comida" },
  { civilian: "Queso", impostor: "Mantequilla", hint: "Producto lacteo amarillo", category: "comida" },
  { civilian: "Naranja", impostor: "Mandarina", hint: "Citrico anaranjado", category: "comida" },

  // Animales
  { civilian: "Perro", impostor: "Lobo", hint: "Canino domestico", category: "animales" },
  { civilian: "Gato", impostor: "Tigre", hint: "Felino pequeno", category: "animales" },
  { civilian: "Caballo", impostor: "Burro", hint: "Equino de monta", category: "animales" },
  { civilian: "Leon", impostor: "Tigre", hint: "Felino grande africano", category: "animales" },
  { civilian: "Aguila", impostor: "Halcon", hint: "Ave rapaz grande", category: "animales" },
  { civilian: "Delfin", impostor: "Ballena", hint: "Mamifero marino inteligente", category: "animales" },
  { civilian: "Elefante", impostor: "Hipopotamo", hint: "Animal africano grande", category: "animales" },
  { civilian: "Serpiente", impostor: "Lagarto", hint: "Reptil sin patas", category: "animales" },
  { civilian: "Mariposa", impostor: "Polilla", hint: "Insecto con alas coloridas", category: "animales" },
  { civilian: "Abeja", impostor: "Avispa", hint: "Insecto rayado que vuela", category: "animales" },

  // Lugares
  { civilian: "Playa", impostor: "Piscina", hint: "Lugar con agua para nadar", category: "lugares" },
  { civilian: "Montaña", impostor: "Colina", hint: "Elevacion de terreno", category: "lugares" },
  { civilian: "Hospital", impostor: "Clinica", hint: "Centro de salud", category: "lugares" },
  { civilian: "Escuela", impostor: "Universidad", hint: "Centro educativo", category: "lugares" },
  { civilian: "Cine", impostor: "Teatro", hint: "Lugar de entretenimiento", category: "lugares" },
  { civilian: "Parque", impostor: "Jardin", hint: "Espacio verde publico", category: "lugares" },
  { civilian: "Aeropuerto", impostor: "Estacion", hint: "Lugar de transporte", category: "lugares" },
  { civilian: "Supermercado", impostor: "Tienda", hint: "Lugar para comprar comida", category: "lugares" },
  { civilian: "Biblioteca", impostor: "Libreria", hint: "Lugar con libros", category: "lugares" },
  { civilian: "Gimnasio", impostor: "Estadio", hint: "Lugar para ejercicio", category: "lugares" },

  // Objetos
  { civilian: "Telefono", impostor: "Tablet", hint: "Dispositivo electronico portatil", category: "objetos" },
  { civilian: "Coche", impostor: "Moto", hint: "Vehiculo con ruedas", category: "objetos" },
  { civilian: "Silla", impostor: "Sofa", hint: "Mueble para sentarse", category: "objetos" },
  { civilian: "Cama", impostor: "Colchon", hint: "Para dormir", category: "objetos" },
  { civilian: "Lampara", impostor: "Vela", hint: "Fuente de luz", category: "objetos" },
  { civilian: "Reloj", impostor: "Cronometro", hint: "Mide el tiempo", category: "objetos" },
  { civilian: "Espejo", impostor: "Ventana", hint: "Superficie que refleja", category: "objetos" },
  { civilian: "Libro", impostor: "Revista", hint: "Material de lectura", category: "objetos" },
  { civilian: "Cuchillo", impostor: "Tijeras", hint: "Objeto cortante", category: "objetos" },
  { civilian: "Mochila", impostor: "Bolso", hint: "Para llevar cosas", category: "objetos" },

  // Profesiones
  { civilian: "Doctor", impostor: "Enfermero", hint: "Trabaja en salud", category: "profesiones" },
  { civilian: "Profesor", impostor: "Tutor", hint: "Ensena a otros", category: "profesiones" },
  { civilian: "Policia", impostor: "Guardia", hint: "Protege y vigila", category: "profesiones" },
  { civilian: "Chef", impostor: "Cocinero", hint: "Prepara comida", category: "profesiones" },
  { civilian: "Piloto", impostor: "Conductor", hint: "Maneja transporte", category: "profesiones" },
  { civilian: "Cantante", impostor: "Musico", hint: "Trabaja con musica", category: "profesiones" },
  { civilian: "Actor", impostor: "Comediante", hint: "Trabaja en entretenimiento", category: "profesiones" },
  { civilian: "Fotografo", impostor: "Camarografo", hint: "Captura imagenes", category: "profesiones" },

  // Deportes
  { civilian: "Futbol", impostor: "Rugby", hint: "Deporte con balon", category: "deportes" },
  { civilian: "Baloncesto", impostor: "Voleibol", hint: "Deporte con pelota y red", category: "deportes" },
  { civilian: "Tenis", impostor: "Badminton", hint: "Deporte con raqueta", category: "deportes" },
  { civilian: "Natacion", impostor: "Buceo", hint: "Deporte en agua", category: "deportes" },
  { civilian: "Ciclismo", impostor: "Patinaje", hint: "Deporte sobre ruedas", category: "deportes" },
  { civilian: "Golf", impostor: "Croquet", hint: "Deporte con palo y bola", category: "deportes" },
  { civilian: "Boxeo", impostor: "Lucha", hint: "Deporte de combate", category: "deportes" },
  { civilian: "Esqui", impostor: "Snowboard", hint: "Deporte en nieve", category: "deportes" },

  // Naturaleza
  { civilian: "Sol", impostor: "Luna", hint: "Cuerpo celeste brillante", category: "naturaleza" },
  { civilian: "Rio", impostor: "Lago", hint: "Cuerpo de agua dulce", category: "naturaleza" },
  { civilian: "Arbol", impostor: "Planta", hint: "Ser vivo verde", category: "naturaleza" },
  { civilian: "Rosa", impostor: "Tulipan", hint: "Flor romantica", category: "naturaleza" },
  { civilian: "Lluvia", impostor: "Nieve", hint: "Precipitacion del cielo", category: "naturaleza" },
  { civilian: "Volcán", impostor: "Geyser", hint: "Formacion que expulsa calor", category: "naturaleza" },
  { civilian: "Bosque", impostor: "Selva", hint: "Area con muchos arboles", category: "naturaleza" },
  { civilian: "Desierto", impostor: "Playa", hint: "Lugar con arena", category: "naturaleza" },

  // Tecnologia
  { civilian: "Internet", impostor: "WiFi", hint: "Conexion digital", category: "tecnologia" },
  { civilian: "Computadora", impostor: "Laptop", hint: "Dispositivo para trabajar", category: "tecnologia" },
  { civilian: "Television", impostor: "Monitor", hint: "Pantalla para ver", category: "tecnologia" },
  { civilian: "Camara", impostor: "Webcam", hint: "Captura fotos", category: "tecnologia" },
  { civilian: "Audifono", impostor: "Parlante", hint: "Reproduce sonido", category: "tecnologia" },
  { civilian: "USB", impostor: "Disco duro", hint: "Almacena datos", category: "tecnologia" },

  // Arte y Entretenimiento
  { civilian: "Pelicula", impostor: "Serie", hint: "Entretenimiento visual", category: "entretenimiento" },
  { civilian: "Concierto", impostor: "Festival", hint: "Evento musical", category: "entretenimiento" },
  { civilian: "Pintura", impostor: "Dibujo", hint: "Arte visual", category: "entretenimiento" },
  { civilian: "Guitarra", impostor: "Bajo", hint: "Instrumento de cuerdas", category: "entretenimiento" },
  { civilian: "Piano", impostor: "Organo", hint: "Instrumento de teclas", category: "entretenimiento" },
  { civilian: "Ballet", impostor: "Danza", hint: "Arte del movimiento", category: "entretenimiento" },

  // Ropa
  { civilian: "Camisa", impostor: "Camiseta", hint: "Prenda superior", category: "ropa" },
  { civilian: "Pantalon", impostor: "Shorts", hint: "Prenda para piernas", category: "ropa" },
  { civilian: "Zapatos", impostor: "Sandalias", hint: "Calzado", category: "ropa" },
  { civilian: "Gorro", impostor: "Sombrero", hint: "Prenda para cabeza", category: "ropa" },
  { civilian: "Bufanda", impostor: "Corbata", hint: "Accesorio para cuello", category: "ropa" },
  { civilian: "Guantes", impostor: "Manoplas", hint: "Prenda para manos", category: "ropa" },

  // Transporte
  { civilian: "Avion", impostor: "Helicoptero", hint: "Transporte aereo", category: "transporte" },
  { civilian: "Barco", impostor: "Lancha", hint: "Transporte maritimo", category: "transporte" },
  { civilian: "Tren", impostor: "Metro", hint: "Transporte sobre rieles", category: "transporte" },
  { civilian: "Autobus", impostor: "Tranvia", hint: "Transporte publico", category: "transporte" },
  { civilian: "Taxi", impostor: "Uber", hint: "Transporte privado", category: "transporte" },
  { civilian: "Bicicleta", impostor: "Patineta", hint: "Transporte personal", category: "transporte" },

  // Celebraciones
  { civilian: "Navidad", impostor: "Ano Nuevo", hint: "Fiesta de diciembre", category: "celebraciones" },
  { civilian: "Cumpleanos", impostor: "Aniversario", hint: "Celebracion personal", category: "celebraciones" },
  { civilian: "Boda", impostor: "Compromiso", hint: "Celebracion de amor", category: "celebraciones" },
  { civilian: "Halloween", impostor: "Carnaval", hint: "Fiesta con disfraces", category: "celebraciones" },
  { civilian: "Pascua", impostor: "Semana Santa", hint: "Fiesta religiosa", category: "celebraciones" },

  // Clima
  { civilian: "Tormenta", impostor: "Huracan", hint: "Fenomeno climatico fuerte", category: "clima" },
  { civilian: "Arcoiris", impostor: "Aurora", hint: "Fenomeno colorido en cielo", category: "clima" },
  { civilian: "Niebla", impostor: "Neblina", hint: "Visibilidad reducida", category: "clima" },
  { civilian: "Granizo", impostor: "Aguanieve", hint: "Precipitacion solida", category: "clima" },

  // Emociones
  { civilian: "Alegria", impostor: "Felicidad", hint: "Emocion positiva", category: "emociones" },
  { civilian: "Tristeza", impostor: "Melancolia", hint: "Emocion negativa suave", category: "emociones" },
  { civilian: "Miedo", impostor: "Terror", hint: "Emocion de peligro", category: "emociones" },
  { civilian: "Amor", impostor: "Carino", hint: "Sentimiento romantico", category: "emociones" },
  { civilian: "Sorpresa", impostor: "Asombro", hint: "Reaccion inesperada", category: "emociones" },
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
