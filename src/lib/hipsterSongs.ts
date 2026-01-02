// Curated song catalog for Hipster game
// These songs will be fetched from iTunes API to get preview URLs and album art

export interface CuratedSongData {
  searchQuery: string;  // Search query for iTunes API
  title: string;
  artist: string;
  releaseYear: number;
}

// ~200 recognizable songs from 1950-2025
// Mix of genres: rock, pop, electronic, jazz, latin, etc.
export const CURATED_SONGS: CuratedSongData[] = [
  // 1950s
  { searchQuery: "Johnny B Goode Chuck Berry", title: "Johnny B. Goode", artist: "Chuck Berry", releaseYear: 1958 },
  { searchQuery: "Jailhouse Rock Elvis Presley", title: "Jailhouse Rock", artist: "Elvis Presley", releaseYear: 1957 },
  { searchQuery: "Rock Around The Clock Bill Haley", title: "Rock Around the Clock", artist: "Bill Haley", releaseYear: 1955 },
  { searchQuery: "Great Balls of Fire Jerry Lee Lewis", title: "Great Balls of Fire", artist: "Jerry Lee Lewis", releaseYear: 1957 },
  { searchQuery: "La Bamba Ritchie Valens", title: "La Bamba", artist: "Ritchie Valens", releaseYear: 1958 },

  // 1960s
  { searchQuery: "Twist and Shout Beatles", title: "Twist and Shout", artist: "The Beatles", releaseYear: 1963 },
  { searchQuery: "I Want To Hold Your Hand Beatles", title: "I Want to Hold Your Hand", artist: "The Beatles", releaseYear: 1963 },
  { searchQuery: "Satisfaction Rolling Stones", title: "(I Can't Get No) Satisfaction", artist: "The Rolling Stones", releaseYear: 1965 },
  { searchQuery: "Respect Aretha Franklin", title: "Respect", artist: "Aretha Franklin", releaseYear: 1967 },
  { searchQuery: "What A Wonderful World Louis Armstrong", title: "What a Wonderful World", artist: "Louis Armstrong", releaseYear: 1967 },
  { searchQuery: "Hey Jude Beatles", title: "Hey Jude", artist: "The Beatles", releaseYear: 1968 },
  { searchQuery: "My Girl Temptations", title: "My Girl", artist: "The Temptations", releaseYear: 1964 },
  { searchQuery: "Stand By Me Ben E King", title: "Stand By Me", artist: "Ben E. King", releaseYear: 1961 },
  { searchQuery: "Dancing In The Street Martha Vandellas", title: "Dancing in the Street", artist: "Martha and the Vandellas", releaseYear: 1964 },
  { searchQuery: "Purple Haze Jimi Hendrix", title: "Purple Haze", artist: "Jimi Hendrix", releaseYear: 1967 },

  // 1970s
  { searchQuery: "Bohemian Rhapsody Queen", title: "Bohemian Rhapsody", artist: "Queen", releaseYear: 1975 },
  { searchQuery: "Stairway To Heaven Led Zeppelin", title: "Stairway to Heaven", artist: "Led Zeppelin", releaseYear: 1971 },
  { searchQuery: "Hotel California Eagles", title: "Hotel California", artist: "Eagles", releaseYear: 1977 },
  { searchQuery: "Stayin Alive Bee Gees", title: "Stayin' Alive", artist: "Bee Gees", releaseYear: 1977 },
  { searchQuery: "Imagine John Lennon", title: "Imagine", artist: "John Lennon", releaseYear: 1971 },
  { searchQuery: "Dancing Queen ABBA", title: "Dancing Queen", artist: "ABBA", releaseYear: 1976 },
  { searchQuery: "September Earth Wind Fire", title: "September", artist: "Earth, Wind & Fire", releaseYear: 1978 },
  { searchQuery: "Dont Stop Believin Journey", title: "Don't Stop Believin'", artist: "Journey", releaseYear: 1981 },
  { searchQuery: "Superstition Stevie Wonder", title: "Superstition", artist: "Stevie Wonder", releaseYear: 1972 },
  { searchQuery: "We Will Rock You Queen", title: "We Will Rock You", artist: "Queen", releaseYear: 1977 },
  { searchQuery: "I Will Survive Gloria Gaynor", title: "I Will Survive", artist: "Gloria Gaynor", releaseYear: 1978 },
  { searchQuery: "Le Freak Chic", title: "Le Freak", artist: "Chic", releaseYear: 1978 },
  { searchQuery: "Good Times Chic", title: "Good Times", artist: "Chic", releaseYear: 1979 },
  { searchQuery: "Thriller Michael Jackson", title: "Thriller", artist: "Michael Jackson", releaseYear: 1982 },

  // 1980s
  { searchQuery: "Billie Jean Michael Jackson", title: "Billie Jean", artist: "Michael Jackson", releaseYear: 1983 },
  { searchQuery: "Beat It Michael Jackson", title: "Beat It", artist: "Michael Jackson", releaseYear: 1983 },
  { searchQuery: "Like A Virgin Madonna", title: "Like a Virgin", artist: "Madonna", releaseYear: 1984 },
  { searchQuery: "Material Girl Madonna", title: "Material Girl", artist: "Madonna", releaseYear: 1984 },
  { searchQuery: "Take On Me A-ha", title: "Take On Me", artist: "a-ha", releaseYear: 1985 },
  { searchQuery: "Sweet Child O Mine Guns N Roses", title: "Sweet Child O' Mine", artist: "Guns N' Roses", releaseYear: 1987 },
  { searchQuery: "Livin On A Prayer Bon Jovi", title: "Livin' on a Prayer", artist: "Bon Jovi", releaseYear: 1986 },
  { searchQuery: "Every Breath You Take Police", title: "Every Breath You Take", artist: "The Police", releaseYear: 1983 },
  { searchQuery: "With Or Without You U2", title: "With or Without You", artist: "U2", releaseYear: 1987 },
  { searchQuery: "Pour Some Sugar On Me Def Leppard", title: "Pour Some Sugar on Me", artist: "Def Leppard", releaseYear: 1987 },
  { searchQuery: "Walk Like An Egyptian Bangles", title: "Walk Like an Egyptian", artist: "The Bangles", releaseYear: 1986 },
  { searchQuery: "Girls Just Wanna Have Fun Cyndi Lauper", title: "Girls Just Want to Have Fun", artist: "Cyndi Lauper", releaseYear: 1983 },
  { searchQuery: "Africa Toto", title: "Africa", artist: "Toto", releaseYear: 1982 },
  { searchQuery: "Eye Of The Tiger Survivor", title: "Eye of the Tiger", artist: "Survivor", releaseYear: 1982 },
  { searchQuery: "Jump Van Halen", title: "Jump", artist: "Van Halen", releaseYear: 1984 },
  { searchQuery: "Never Gonna Give You Up Rick Astley", title: "Never Gonna Give You Up", artist: "Rick Astley", releaseYear: 1987 },
  { searchQuery: "Blue Monday New Order", title: "Blue Monday", artist: "New Order", releaseYear: 1983 },
  { searchQuery: "Enjoy The Silence Depeche Mode", title: "Enjoy the Silence", artist: "Depeche Mode", releaseYear: 1990 },

  // 1990s
  { searchQuery: "Smells Like Teen Spirit Nirvana", title: "Smells Like Teen Spirit", artist: "Nirvana", releaseYear: 1991 },
  { searchQuery: "Wonderwall Oasis", title: "Wonderwall", artist: "Oasis", releaseYear: 1995 },
  { searchQuery: "Creep Radiohead", title: "Creep", artist: "Radiohead", releaseYear: 1993 },
  { searchQuery: "Losing My Religion REM", title: "Losing My Religion", artist: "R.E.M.", releaseYear: 1991 },
  { searchQuery: "Under The Bridge Red Hot Chili Peppers", title: "Under the Bridge", artist: "Red Hot Chili Peppers", releaseYear: 1992 },
  { searchQuery: "Black Hole Sun Soundgarden", title: "Black Hole Sun", artist: "Soundgarden", releaseYear: 1994 },
  { searchQuery: "I Will Always Love You Whitney Houston", title: "I Will Always Love You", artist: "Whitney Houston", releaseYear: 1992 },
  { searchQuery: "My Heart Will Go On Celine Dion", title: "My Heart Will Go On", artist: "Celine Dion", releaseYear: 1997 },
  { searchQuery: "...Baby One More Time Britney Spears", title: "...Baby One More Time", artist: "Britney Spears", releaseYear: 1998 },
  { searchQuery: "Wannabe Spice Girls", title: "Wannabe", artist: "Spice Girls", releaseYear: 1996 },
  { searchQuery: "MMMBop Hanson", title: "MMMBop", artist: "Hanson", releaseYear: 1997 },
  { searchQuery: "No Scrubs TLC", title: "No Scrubs", artist: "TLC", releaseYear: 1999 },
  { searchQuery: "Genie In A Bottle Christina Aguilera", title: "Genie in a Bottle", artist: "Christina Aguilera", releaseYear: 1999 },
  { searchQuery: "Livin La Vida Loca Ricky Martin", title: "Livin' la Vida Loca", artist: "Ricky Martin", releaseYear: 1999 },
  { searchQuery: "Macarena Los Del Rio", title: "Macarena", artist: "Los del Río", releaseYear: 1995 },
  { searchQuery: "Blue Da Ba Dee Eiffel 65", title: "Blue (Da Ba Dee)", artist: "Eiffel 65", releaseYear: 1999 },
  { searchQuery: "Around The World Daft Punk", title: "Around the World", artist: "Daft Punk", releaseYear: 1997 },
  { searchQuery: "Bitter Sweet Symphony The Verve", title: "Bitter Sweet Symphony", artist: "The Verve", releaseYear: 1997 },
  { searchQuery: "Kiss From A Rose Seal", title: "Kiss from a Rose", artist: "Seal", releaseYear: 1994 },
  { searchQuery: "Return Of The Mack Mark Morrison", title: "Return of the Mack", artist: "Mark Morrison", releaseYear: 1996 },

  // 2000s
  { searchQuery: "Crazy In Love Beyonce", title: "Crazy in Love", artist: "Beyoncé", releaseYear: 2003 },
  { searchQuery: "Hey Ya Outkast", title: "Hey Ya!", artist: "OutKast", releaseYear: 2003 },
  { searchQuery: "Mr Brightside The Killers", title: "Mr. Brightside", artist: "The Killers", releaseYear: 2004 },
  { searchQuery: "Seven Nation Army White Stripes", title: "Seven Nation Army", artist: "The White Stripes", releaseYear: 2003 },
  { searchQuery: "Toxic Britney Spears", title: "Toxic", artist: "Britney Spears", releaseYear: 2004 },
  { searchQuery: "In Da Club 50 Cent", title: "In Da Club", artist: "50 Cent", releaseYear: 2003 },
  { searchQuery: "Yeah Usher", title: "Yeah!", artist: "Usher", releaseYear: 2004 },
  { searchQuery: "Drop It Like Its Hot Snoop Dogg", title: "Drop It Like It's Hot", artist: "Snoop Dogg", releaseYear: 2004 },
  { searchQuery: "Since U Been Gone Kelly Clarkson", title: "Since U Been Gone", artist: "Kelly Clarkson", releaseYear: 2004 },
  { searchQuery: "Boulevard Of Broken Dreams Green Day", title: "Boulevard of Broken Dreams", artist: "Green Day", releaseYear: 2004 },
  { searchQuery: "Chasing Cars Snow Patrol", title: "Chasing Cars", artist: "Snow Patrol", releaseYear: 2006 },
  { searchQuery: "Umbrella Rihanna", title: "Umbrella", artist: "Rihanna", releaseYear: 2007 },
  { searchQuery: "Poker Face Lady Gaga", title: "Poker Face", artist: "Lady Gaga", releaseYear: 2008 },
  { searchQuery: "Single Ladies Beyonce", title: "Single Ladies", artist: "Beyoncé", releaseYear: 2008 },
  { searchQuery: "I Gotta Feeling Black Eyed Peas", title: "I Gotta Feeling", artist: "Black Eyed Peas", releaseYear: 2009 },
  { searchQuery: "Viva La Vida Coldplay", title: "Viva la Vida", artist: "Coldplay", releaseYear: 2008 },
  { searchQuery: "Hips Dont Lie Shakira", title: "Hips Don't Lie", artist: "Shakira", releaseYear: 2006 },
  { searchQuery: "SexyBack Justin Timberlake", title: "SexyBack", artist: "Justin Timberlake", releaseYear: 2006 },
  { searchQuery: "Rehab Amy Winehouse", title: "Rehab", artist: "Amy Winehouse", releaseYear: 2006 },
  { searchQuery: "Technologic Daft Punk", title: "Technologic", artist: "Daft Punk", releaseYear: 2005 },
  { searchQuery: "Feel Good Inc Gorillaz", title: "Feel Good Inc.", artist: "Gorillaz", releaseYear: 2005 },
  { searchQuery: "Gold Digger Kanye West", title: "Gold Digger", artist: "Kanye West", releaseYear: 2005 },
  { searchQuery: "Clocks Coldplay", title: "Clocks", artist: "Coldplay", releaseYear: 2002 },

  // 2010s
  { searchQuery: "Rolling In The Deep Adele", title: "Rolling in the Deep", artist: "Adele", releaseYear: 2010 },
  { searchQuery: "Someone Like You Adele", title: "Someone Like You", artist: "Adele", releaseYear: 2011 },
  { searchQuery: "Call Me Maybe Carly Rae Jepsen", title: "Call Me Maybe", artist: "Carly Rae Jepsen", releaseYear: 2012 },
  { searchQuery: "Gangnam Style PSY", title: "Gangnam Style", artist: "PSY", releaseYear: 2012 },
  { searchQuery: "Get Lucky Daft Punk", title: "Get Lucky", artist: "Daft Punk", releaseYear: 2013 },
  { searchQuery: "Happy Pharrell Williams", title: "Happy", artist: "Pharrell Williams", releaseYear: 2013 },
  { searchQuery: "Royals Lorde", title: "Royals", artist: "Lorde", releaseYear: 2013 },
  { searchQuery: "Shake It Off Taylor Swift", title: "Shake It Off", artist: "Taylor Swift", releaseYear: 2014 },
  { searchQuery: "Uptown Funk Bruno Mars", title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars", releaseYear: 2014 },
  { searchQuery: "Thinking Out Loud Ed Sheeran", title: "Thinking Out Loud", artist: "Ed Sheeran", releaseYear: 2014 },
  { searchQuery: "Hello Adele", title: "Hello", artist: "Adele", releaseYear: 2015 },
  { searchQuery: "Despacito Luis Fonsi", title: "Despacito", artist: "Luis Fonsi", releaseYear: 2017 },
  { searchQuery: "Shape Of You Ed Sheeran", title: "Shape of You", artist: "Ed Sheeran", releaseYear: 2017 },
  { searchQuery: "Closer Chainsmokers", title: "Closer", artist: "The Chainsmokers", releaseYear: 2016 },
  { searchQuery: "Havana Camila Cabello", title: "Havana", artist: "Camila Cabello", releaseYear: 2017 },
  { searchQuery: "Old Town Road Lil Nas X", title: "Old Town Road", artist: "Lil Nas X", releaseYear: 2019 },
  { searchQuery: "Bad Guy Billie Eilish", title: "bad guy", artist: "Billie Eilish", releaseYear: 2019 },
  { searchQuery: "Blinding Lights The Weeknd", title: "Blinding Lights", artist: "The Weeknd", releaseYear: 2019 },
  { searchQuery: "Senorita Shawn Mendes", title: "Señorita", artist: "Shawn Mendes & Camila Cabello", releaseYear: 2019 },
  { searchQuery: "Dance Monkey Tones And I", title: "Dance Monkey", artist: "Tones and I", releaseYear: 2019 },
  { searchQuery: "Rockstar Post Malone", title: "Rockstar", artist: "Post Malone", releaseYear: 2017 },
  { searchQuery: "Gods Plan Drake", title: "God's Plan", artist: "Drake", releaseYear: 2018 },
  { searchQuery: "Thank U Next Ariana Grande", title: "thank u, next", artist: "Ariana Grande", releaseYear: 2018 },
  { searchQuery: "Sicko Mode Travis Scott", title: "SICKO MODE", artist: "Travis Scott", releaseYear: 2018 },
  { searchQuery: "Sunflower Post Malone", title: "Sunflower", artist: "Post Malone & Swae Lee", releaseYear: 2018 },
  { searchQuery: "Lean On Major Lazer", title: "Lean On", artist: "Major Lazer", releaseYear: 2015 },
  { searchQuery: "Cheap Thrills Sia", title: "Cheap Thrills", artist: "Sia", releaseYear: 2016 },

  // 2020s
  { searchQuery: "Watermelon Sugar Harry Styles", title: "Watermelon Sugar", artist: "Harry Styles", releaseYear: 2020 },
  { searchQuery: "Levitating Dua Lipa", title: "Levitating", artist: "Dua Lipa", releaseYear: 2020 },
  { searchQuery: "Savage Love Jason Derulo", title: "Savage Love", artist: "Jason Derulo", releaseYear: 2020 },
  { searchQuery: "Drivers License Olivia Rodrigo", title: "drivers license", artist: "Olivia Rodrigo", releaseYear: 2021 },
  { searchQuery: "Stay The Kid LAROI", title: "Stay", artist: "The Kid LAROI & Justin Bieber", releaseYear: 2021 },
  { searchQuery: "Montero Lil Nas X", title: "MONTERO (Call Me By Your Name)", artist: "Lil Nas X", releaseYear: 2021 },
  { searchQuery: "Good 4 U Olivia Rodrigo", title: "good 4 u", artist: "Olivia Rodrigo", releaseYear: 2021 },
  { searchQuery: "Kiss Me More Doja Cat", title: "Kiss Me More", artist: "Doja Cat", releaseYear: 2021 },
  { searchQuery: "Peaches Justin Bieber", title: "Peaches", artist: "Justin Bieber", releaseYear: 2021 },
  { searchQuery: "Save Your Tears The Weeknd", title: "Save Your Tears", artist: "The Weeknd", releaseYear: 2020 },
  { searchQuery: "As It Was Harry Styles", title: "As It Was", artist: "Harry Styles", releaseYear: 2022 },
  { searchQuery: "Heat Waves Glass Animals", title: "Heat Waves", artist: "Glass Animals", releaseYear: 2020 },
  { searchQuery: "Running Up That Hill Kate Bush", title: "Running Up That Hill", artist: "Kate Bush", releaseYear: 1985 },
  { searchQuery: "Anti Hero Taylor Swift", title: "Anti-Hero", artist: "Taylor Swift", releaseYear: 2022 },
  { searchQuery: "About Damn Time Lizzo", title: "About Damn Time", artist: "Lizzo", releaseYear: 2022 },
  { searchQuery: "Flowers Miley Cyrus", title: "Flowers", artist: "Miley Cyrus", releaseYear: 2023 },
  { searchQuery: "Kill Bill SZA", title: "Kill Bill", artist: "SZA", releaseYear: 2022 },
  { searchQuery: "Calm Down Rema", title: "Calm Down", artist: "Rema", releaseYear: 2022 },
  { searchQuery: "Unholy Sam Smith", title: "Unholy", artist: "Sam Smith & Kim Petras", releaseYear: 2022 },
  { searchQuery: "Cruel Summer Taylor Swift", title: "Cruel Summer", artist: "Taylor Swift", releaseYear: 2019 },
  { searchQuery: "Vampire Olivia Rodrigo", title: "vampire", artist: "Olivia Rodrigo", releaseYear: 2023 },
  { searchQuery: "Last Night Morgan Wallen", title: "Last Night", artist: "Morgan Wallen", releaseYear: 2023 },
  { searchQuery: "Espresso Sabrina Carpenter", title: "Espresso", artist: "Sabrina Carpenter", releaseYear: 2024 },
  { searchQuery: "Lunch Billie Eilish", title: "LUNCH", artist: "Billie Eilish", releaseYear: 2024 },
  { searchQuery: "Lovin On Me Jack Harlow", title: "Lovin On Me", artist: "Jack Harlow", releaseYear: 2023 },

  // Latin Hits
  { searchQuery: "Gasolina Daddy Yankee", title: "Gasolina", artist: "Daddy Yankee", releaseYear: 2004 },
  { searchQuery: "Bailando Enrique Iglesias", title: "Bailando", artist: "Enrique Iglesias", releaseYear: 2014 },
  { searchQuery: "Vivir Mi Vida Marc Anthony", title: "Vivir Mi Vida", artist: "Marc Anthony", releaseYear: 2013 },
  { searchQuery: "Danza Kuduro Don Omar", title: "Danza Kuduro", artist: "Don Omar", releaseYear: 2010 },
  { searchQuery: "Mi Gente J Balvin", title: "Mi Gente", artist: "J Balvin", releaseYear: 2017 },
  { searchQuery: "Tusa Karol G", title: "Tusa", artist: "Karol G & Nicki Minaj", releaseYear: 2019 },
  { searchQuery: "Baila Conmigo Selena Gomez", title: "Baila Conmigo", artist: "Selena Gomez & Rauw Alejandro", releaseYear: 2021 },
  { searchQuery: "Obsesion Aventura", title: "Obsesión", artist: "Aventura", releaseYear: 2002 },
  { searchQuery: "La Camisa Negra Juanes", title: "La Camisa Negra", artist: "Juanes", releaseYear: 2004 },
  { searchQuery: "Suavemente Elvis Crespo", title: "Suavemente", artist: "Elvis Crespo", releaseYear: 1998 },
  { searchQuery: "Conga Gloria Estefan", title: "Conga", artist: "Gloria Estefan", releaseYear: 1985 },

  // Electronic/EDM
  { searchQuery: "Levels Avicii", title: "Levels", artist: "Avicii", releaseYear: 2011 },
  { searchQuery: "Wake Me Up Avicii", title: "Wake Me Up", artist: "Avicii", releaseYear: 2013 },
  { searchQuery: "Titanium David Guetta", title: "Titanium", artist: "David Guetta ft. Sia", releaseYear: 2011 },
  { searchQuery: "Clarity Zedd", title: "Clarity", artist: "Zedd", releaseYear: 2012 },
  { searchQuery: "Animals Martin Garrix", title: "Animals", artist: "Martin Garrix", releaseYear: 2013 },
  { searchQuery: "Don't You Worry Child Swedish House Mafia", title: "Don't You Worry Child", artist: "Swedish House Mafia", releaseYear: 2012 },
  { searchQuery: "Faded Alan Walker", title: "Faded", artist: "Alan Walker", releaseYear: 2015 },
  { searchQuery: "This Is What You Came For Calvin Harris", title: "This Is What You Came For", artist: "Calvin Harris ft. Rihanna", releaseYear: 2016 },
  { searchQuery: "Scared To Be Lonely Martin Garrix", title: "Scared to Be Lonely", artist: "Martin Garrix & Dua Lipa", releaseYear: 2017 },
  { searchQuery: "Sandstorm Darude", title: "Sandstorm", artist: "Darude", releaseYear: 1999 },

  // Rock Classics
  { searchQuery: "Smoke On The Water Deep Purple", title: "Smoke on the Water", artist: "Deep Purple", releaseYear: 1972 },
  { searchQuery: "Back In Black AC DC", title: "Back in Black", artist: "AC/DC", releaseYear: 1980 },
  { searchQuery: "Highway To Hell AC DC", title: "Highway to Hell", artist: "AC/DC", releaseYear: 1979 },
  { searchQuery: "Paradise City Guns N Roses", title: "Paradise City", artist: "Guns N' Roses", releaseYear: 1988 },
  { searchQuery: "Enter Sandman Metallica", title: "Enter Sandman", artist: "Metallica", releaseYear: 1991 },
  { searchQuery: "Nothing Else Matters Metallica", title: "Nothing Else Matters", artist: "Metallica", releaseYear: 1991 },
  { searchQuery: "Comfortably Numb Pink Floyd", title: "Comfortably Numb", artist: "Pink Floyd", releaseYear: 1979 },
  { searchQuery: "Another Brick In The Wall Pink Floyd", title: "Another Brick in the Wall", artist: "Pink Floyd", releaseYear: 1979 },
  { searchQuery: "Dream On Aerosmith", title: "Dream On", artist: "Aerosmith", releaseYear: 1973 },
  { searchQuery: "Crazy Little Thing Called Love Queen", title: "Crazy Little Thing Called Love", artist: "Queen", releaseYear: 1979 },
  { searchQuery: "Somebody Told Me The Killers", title: "Somebody Told Me", artist: "The Killers", releaseYear: 2004 },
  { searchQuery: "Sex On Fire Kings Of Leon", title: "Sex on Fire", artist: "Kings of Leon", releaseYear: 2008 },
  { searchQuery: "Use Somebody Kings Of Leon", title: "Use Somebody", artist: "Kings of Leon", releaseYear: 2008 },
  { searchQuery: "Radioactive Imagine Dragons", title: "Radioactive", artist: "Imagine Dragons", releaseYear: 2012 },
  { searchQuery: "Believer Imagine Dragons", title: "Believer", artist: "Imagine Dragons", releaseYear: 2017 },

  // Hip-Hop Classics
  { searchQuery: "Rapper's Delight Sugarhill Gang", title: "Rapper's Delight", artist: "The Sugarhill Gang", releaseYear: 1979 },
  { searchQuery: "The Message Grandmaster Flash", title: "The Message", artist: "Grandmaster Flash", releaseYear: 1982 },
  { searchQuery: "Juicy Notorious BIG", title: "Juicy", artist: "The Notorious B.I.G.", releaseYear: 1994 },
  { searchQuery: "California Love Tupac", title: "California Love", artist: "2Pac", releaseYear: 1995 },
  { searchQuery: "Lose Yourself Eminem", title: "Lose Yourself", artist: "Eminem", releaseYear: 2002 },
  { searchQuery: "Stan Eminem", title: "Stan", artist: "Eminem", releaseYear: 2000 },
  { searchQuery: "Stronger Kanye West", title: "Stronger", artist: "Kanye West", releaseYear: 2007 },
  { searchQuery: "Humble Kendrick Lamar", title: "HUMBLE.", artist: "Kendrick Lamar", releaseYear: 2017 },
  { searchQuery: "Hotline Bling Drake", title: "Hotline Bling", artist: "Drake", releaseYear: 2015 },
  { searchQuery: "Empire State Of Mind Jay-Z", title: "Empire State of Mind", artist: "Jay-Z & Alicia Keys", releaseYear: 2009 },

  // Bonus Tracks - More Recent & International
  { searchQuery: "Dua Lipa Don't Start Now", title: "Don't Start Now", artist: "Dua Lipa", releaseYear: 2019 },
  { searchQuery: "Physical Dua Lipa", title: "Physical", artist: "Dua Lipa", releaseYear: 2020 },
  { searchQuery: "Rain On Me Lady Gaga", title: "Rain On Me", artist: "Lady Gaga & Ariana Grande", releaseYear: 2020 },
  { searchQuery: "Dynamite BTS", title: "Dynamite", artist: "BTS", releaseYear: 2020 },
  { searchQuery: "Butter BTS", title: "Butter", artist: "BTS", releaseYear: 2021 },
  { searchQuery: "Permission To Dance BTS", title: "Permission to Dance", artist: "BTS", releaseYear: 2021 },
  { searchQuery: "How You Like That BLACKPINK", title: "How You Like That", artist: "BLACKPINK", releaseYear: 2020 },
  { searchQuery: "Ice Cream BLACKPINK Selena Gomez", title: "Ice Cream", artist: "BLACKPINK & Selena Gomez", releaseYear: 2020 },
  { searchQuery: "Paparazzi Lady Gaga", title: "Paparazzi", artist: "Lady Gaga", releaseYear: 2008 },
  { searchQuery: "Born This Way Lady Gaga", title: "Born This Way", artist: "Lady Gaga", releaseYear: 2011 },
];

// Fisher-Yates shuffle algorithm
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get random songs from the catalog (excludes songs already in pool by title match)
export function getRandomSongsFromCatalog(
  count: number,
  excludeTitles: string[] = []
): CuratedSongData[] {
  const excludeSet = new Set(excludeTitles.map(t => t.toLowerCase()));
  const available = CURATED_SONGS.filter(
    song => !excludeSet.has(song.title.toLowerCase())
  );
  const shuffled = shuffleArray(available);
  return shuffled.slice(0, count);
}
