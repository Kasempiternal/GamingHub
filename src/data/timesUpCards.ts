export interface TimesUpCardData {
  name: string;
  category: 'celebrity' | 'fiction' | 'sports' | 'historical' | 'music';
}

export const TIMESUP_CARDS: TimesUpCardData[] = [
  // CELEBRITIES (actors, singers, influencers)
  { name: 'Bad Bunny', category: 'celebrity' },
  { name: 'Shakira', category: 'celebrity' },
  { name: 'Jennifer Lopez', category: 'celebrity' },
  { name: 'Penélope Cruz', category: 'celebrity' },
  { name: 'Antonio Banderas', category: 'celebrity' },
  { name: 'Salma Hayek', category: 'celebrity' },
  { name: 'Sofia Vergara', category: 'celebrity' },
  { name: 'Dwayne Johnson', category: 'celebrity' },
  { name: 'Leonardo DiCaprio', category: 'celebrity' },
  { name: 'Brad Pitt', category: 'celebrity' },
  { name: 'Angelina Jolie', category: 'celebrity' },
  { name: 'Johnny Depp', category: 'celebrity' },
  { name: 'Tom Hanks', category: 'celebrity' },
  { name: 'Will Smith', category: 'celebrity' },
  { name: 'Scarlett Johansson', category: 'celebrity' },
  { name: 'Robert Downey Jr.', category: 'celebrity' },
  { name: 'Chris Hemsworth', category: 'celebrity' },
  { name: 'Margot Robbie', category: 'celebrity' },
  { name: 'Zendaya', category: 'celebrity' },
  { name: 'Timothée Chalamet', category: 'celebrity' },
  { name: 'Eugenio Derbez', category: 'celebrity' },
  { name: 'Gael García Bernal', category: 'celebrity' },
  { name: 'Diego Luna', category: 'celebrity' },
  { name: 'Ana de Armas', category: 'celebrity' },
  { name: 'Javier Bardem', category: 'celebrity' },
  { name: 'Rosalía', category: 'celebrity' },
  { name: 'Pedro Pascal', category: 'celebrity' },
  { name: 'Anya Taylor-Joy', category: 'celebrity' },
  { name: 'Ryan Gosling', category: 'celebrity' },
  { name: 'Meryl Streep', category: 'celebrity' },
  { name: 'Morgan Freeman', category: 'celebrity' },
  { name: 'Keanu Reeves', category: 'celebrity' },
  { name: 'Tom Cruise', category: 'celebrity' },
  { name: 'Emma Watson', category: 'celebrity' },
  { name: 'Daniel Radcliffe', category: 'celebrity' },
  { name: 'Lin-Manuel Miranda', category: 'celebrity' },
  { name: 'Ricky Martin', category: 'celebrity' },
  { name: 'Enrique Iglesias', category: 'celebrity' },
  { name: 'Daddy Yankee', category: 'celebrity' },
  { name: 'Kim Kardashian', category: 'celebrity' },
  { name: 'Oprah Winfrey', category: 'celebrity' },
  { name: 'Ellen DeGeneres', category: 'celebrity' },
  { name: 'Mr. Beast', category: 'celebrity' },
  { name: 'PewDiePie', category: 'celebrity' },
  { name: 'El Rubius', category: 'celebrity' },
  { name: 'Ibai Llanos', category: 'celebrity' },
  { name: 'Auronplay', category: 'celebrity' },
  { name: 'Luisito Comunica', category: 'celebrity' },
  { name: 'Karol G', category: 'celebrity' },
  { name: 'J Balvin', category: 'celebrity' },

  // FICTION (movies, TV, anime, video games, literature)
  { name: 'Harry Potter', category: 'fiction' },
  { name: 'Hermione Granger', category: 'fiction' },
  { name: 'Darth Vader', category: 'fiction' },
  { name: 'Luke Skywalker', category: 'fiction' },
  { name: 'Yoda', category: 'fiction' },
  { name: 'Spider-Man', category: 'fiction' },
  { name: 'Batman', category: 'fiction' },
  { name: 'Superman', category: 'fiction' },
  { name: 'Wonder Woman', category: 'fiction' },
  { name: 'Iron Man', category: 'fiction' },
  { name: 'Capitán América', category: 'fiction' },
  { name: 'Thor', category: 'fiction' },
  { name: 'Hulk', category: 'fiction' },
  { name: 'Thanos', category: 'fiction' },
  { name: 'Mickey Mouse', category: 'fiction' },
  { name: 'Elsa', category: 'fiction' },
  { name: 'Woody', category: 'fiction' },
  { name: 'Buzz Lightyear', category: 'fiction' },
  { name: 'Shrek', category: 'fiction' },
  { name: 'Pikachu', category: 'fiction' },
  { name: 'Goku', category: 'fiction' },
  { name: 'Naruto', category: 'fiction' },
  { name: 'Luffy', category: 'fiction' },
  { name: 'Mario Bros', category: 'fiction' },
  { name: 'Luigi', category: 'fiction' },
  { name: 'Link', category: 'fiction' },
  { name: 'Zelda', category: 'fiction' },
  { name: 'Sonic', category: 'fiction' },
  { name: 'Pinocho', category: 'fiction' },
  { name: 'Cenicienta', category: 'fiction' },
  { name: 'Blancanieves', category: 'fiction' },
  { name: 'La Sirenita', category: 'fiction' },
  { name: 'Simba', category: 'fiction' },
  { name: 'Nemo', category: 'fiction' },
  { name: 'Dory', category: 'fiction' },
  { name: 'Jack Sparrow', category: 'fiction' },
  { name: 'Indiana Jones', category: 'fiction' },
  { name: 'James Bond', category: 'fiction' },
  { name: 'Sherlock Holmes', category: 'fiction' },
  { name: 'Don Quijote', category: 'fiction' },
  { name: 'Gandalf', category: 'fiction' },
  { name: 'Frodo Bolsón', category: 'fiction' },
  { name: 'Jon Snow', category: 'fiction' },
  { name: 'Daenerys Targaryen', category: 'fiction' },
  { name: 'Walter White', category: 'fiction' },
  { name: 'El Profesor', category: 'fiction' },
  { name: 'Tokio', category: 'fiction' },
  { name: 'El Chavo del 8', category: 'fiction' },
  { name: 'Bob Esponja', category: 'fiction' },
  { name: 'Patrick Estrella', category: 'fiction' },
  { name: 'Homero Simpson', category: 'fiction' },
  { name: 'Bart Simpson', category: 'fiction' },
  { name: 'Peter Griffin', category: 'fiction' },
  { name: 'Rick Sanchez', category: 'fiction' },
  { name: 'Morty Smith', category: 'fiction' },
  { name: 'Vegeta', category: 'fiction' },
  { name: 'Sasuke Uchiha', category: 'fiction' },
  { name: 'Eren Jaeger', category: 'fiction' },
  { name: 'Levi Ackerman', category: 'fiction' },
  { name: 'Tanjiro Kamado', category: 'fiction' },
  { name: 'Kratos', category: 'fiction' },
  { name: 'Master Chief', category: 'fiction' },
  { name: 'Lara Croft', category: 'fiction' },
  { name: 'Geralt de Rivia', category: 'fiction' },

  // SPORTS (football/soccer, basketball, tennis, etc.)
  { name: 'Lionel Messi', category: 'sports' },
  { name: 'Cristiano Ronaldo', category: 'sports' },
  { name: 'Neymar Jr.', category: 'sports' },
  { name: 'Kylian Mbappé', category: 'sports' },
  { name: 'Diego Maradona', category: 'sports' },
  { name: 'Pelé', category: 'sports' },
  { name: 'Zinedine Zidane', category: 'sports' },
  { name: 'Ronaldinho', category: 'sports' },
  { name: 'David Beckham', category: 'sports' },
  { name: 'Iker Casillas', category: 'sports' },
  { name: 'Andrés Iniesta', category: 'sports' },
  { name: 'Xavi Hernández', category: 'sports' },
  { name: 'Gerard Piqué', category: 'sports' },
  { name: 'Sergio Ramos', category: 'sports' },
  { name: 'Luka Modric', category: 'sports' },
  { name: 'Erling Haaland', category: 'sports' },
  { name: 'Robert Lewandowski', category: 'sports' },
  { name: 'Vinicius Jr.', category: 'sports' },
  { name: 'Jude Bellingham', category: 'sports' },
  { name: 'Pedri', category: 'sports' },
  { name: 'Michael Jordan', category: 'sports' },
  { name: 'LeBron James', category: 'sports' },
  { name: 'Kobe Bryant', category: 'sports' },
  { name: 'Stephen Curry', category: 'sports' },
  { name: 'Shaquille O\'Neal', category: 'sports' },
  { name: 'Rafael Nadal', category: 'sports' },
  { name: 'Roger Federer', category: 'sports' },
  { name: 'Novak Djokovic', category: 'sports' },
  { name: 'Carlos Alcaraz', category: 'sports' },
  { name: 'Serena Williams', category: 'sports' },
  { name: 'Usain Bolt', category: 'sports' },
  { name: 'Mike Tyson', category: 'sports' },
  { name: 'Muhammad Ali', category: 'sports' },
  { name: 'Canelo Álvarez', category: 'sports' },
  { name: 'Conor McGregor', category: 'sports' },
  { name: 'Lewis Hamilton', category: 'sports' },
  { name: 'Fernando Alonso', category: 'sports' },
  { name: 'Tiger Woods', category: 'sports' },
  { name: 'Tom Brady', category: 'sports' },
  { name: 'Manu Ginóbili', category: 'sports' },

  // HISTORICAL (scientists, artists, inventors, leaders)
  { name: 'Leonardo da Vinci', category: 'historical' },
  { name: 'Albert Einstein', category: 'historical' },
  { name: 'Isaac Newton', category: 'historical' },
  { name: 'Marie Curie', category: 'historical' },
  { name: 'Galileo Galilei', category: 'historical' },
  { name: 'Charles Darwin', category: 'historical' },
  { name: 'Nikola Tesla', category: 'historical' },
  { name: 'Thomas Edison', category: 'historical' },
  { name: 'Steve Jobs', category: 'historical' },
  { name: 'Elon Musk', category: 'historical' },
  { name: 'Bill Gates', category: 'historical' },
  { name: 'Mark Zuckerberg', category: 'historical' },
  { name: 'Pablo Picasso', category: 'historical' },
  { name: 'Salvador Dalí', category: 'historical' },
  { name: 'Frida Kahlo', category: 'historical' },
  { name: 'Vincent van Gogh', category: 'historical' },
  { name: 'Miguel de Cervantes', category: 'historical' },
  { name: 'William Shakespeare', category: 'historical' },
  { name: 'Cleopatra', category: 'historical' },
  { name: 'Julio César', category: 'historical' },
  { name: 'Napoleón Bonaparte', category: 'historical' },
  { name: 'Alejandro Magno', category: 'historical' },
  { name: 'Cristóbal Colón', category: 'historical' },
  { name: 'Simón Bolívar', category: 'historical' },
  { name: 'Abraham Lincoln', category: 'historical' },
  { name: 'Winston Churchill', category: 'historical' },
  { name: 'Mahatma Gandhi', category: 'historical' },
  { name: 'Nelson Mandela', category: 'historical' },
  { name: 'Martin Luther King', category: 'historical' },
  { name: 'Che Guevara', category: 'historical' },

  // MUSIC (bands, solo artists, classical composers)
  { name: 'Taylor Swift', category: 'music' },
  { name: 'Beyoncé', category: 'music' },
  { name: 'Michael Jackson', category: 'music' },
  { name: 'Madonna', category: 'music' },
  { name: 'Elvis Presley', category: 'music' },
  { name: 'Freddie Mercury', category: 'music' },
  { name: 'John Lennon', category: 'music' },
  { name: 'Paul McCartney', category: 'music' },
  { name: 'Mick Jagger', category: 'music' },
  { name: 'David Bowie', category: 'music' },
  { name: 'Prince', category: 'music' },
  { name: 'Bob Marley', category: 'music' },
  { name: 'Whitney Houston', category: 'music' },
  { name: 'Celine Dion', category: 'music' },
  { name: 'Adele', category: 'music' },
  { name: 'Ed Sheeran', category: 'music' },
  { name: 'Bruno Mars', category: 'music' },
  { name: 'Ariana Grande', category: 'music' },
  { name: 'Lady Gaga', category: 'music' },
  { name: 'Billie Eilish', category: 'music' },
  { name: 'Drake', category: 'music' },
  { name: 'Kanye West', category: 'music' },
  { name: 'Eminem', category: 'music' },
  { name: 'The Weeknd', category: 'music' },
  { name: 'Dua Lipa', category: 'music' },
  { name: 'Justin Bieber', category: 'music' },
  { name: 'Selena Gomez', category: 'music' },
  { name: 'Ozuna', category: 'music' },
  { name: 'Maluma', category: 'music' },
  { name: 'Anuel AA', category: 'music' },
  { name: 'Rauw Alejandro', category: 'music' },
  { name: 'Peso Pluma', category: 'music' },
  { name: 'Luis Miguel', category: 'music' },
  { name: 'Juan Gabriel', category: 'music' },
  { name: 'Vicente Fernández', category: 'music' },
  { name: 'Alejandro Sanz', category: 'music' },
  { name: 'Juanes', category: 'music' },
  { name: 'Carlos Vives', category: 'music' },
  { name: 'Maná', category: 'music' },
  { name: 'Julio Iglesias', category: 'music' },
  { name: 'Ludwig van Beethoven', category: 'music' },
  { name: 'Wolfgang Amadeus Mozart', category: 'music' },
  { name: 'Johann Sebastian Bach', category: 'music' },
  { name: 'Frédéric Chopin', category: 'music' },
  { name: 'BTS', category: 'music' },
];

/**
 * Get random cards for a game session
 * @param count Number of cards to return
 * @returns Array of randomly selected cards
 */
export function getRandomCards(count: number): TimesUpCardData[] {
  const shuffled = [...TIMESUP_CARDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Get random cards filtered by category
 * @param count Number of cards to return
 * @param categories Categories to include
 * @returns Array of randomly selected cards from specified categories
 */
export function getRandomCardsByCategory(
  count: number,
  categories: TimesUpCardData['category'][]
): TimesUpCardData[] {
  const filtered = TIMESUP_CARDS.filter((card) =>
    categories.includes(card.category)
  );
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Get cards count by category
 * @returns Object with count per category
 */
export function getCardCountByCategory(): Record<TimesUpCardData['category'], number> {
  return TIMESUP_CARDS.reduce(
    (acc, card) => {
      acc[card.category]++;
      return acc;
    },
    {
      celebrity: 0,
      fiction: 0,
      sports: 0,
      historical: 0,
      music: 0,
    }
  );
}

export const TOTAL_CARDS = TIMESUP_CARDS.length;
