import type { GenrePattern } from '@music-reasoning/types'

/**
 * Comprehensive genre pattern database (50 patterns)
 *
 * Each genre has 8+ patterns with metadata including:
 * - Pattern: Roman numeral sequence
 * - Genre: Music genre classification
 * - Weight: Significance score (1-10)
 * - Description: Functional role and context
 * - Examples: Famous songs using this pattern
 * - Era: Historical/stylistic period
 */
export const GENRE_PATTERNS: GenrePattern[] = [
  // ========================================
  // JAZZ PATTERNS (8 patterns)
  // ========================================
  {
    pattern: 'ii-V-I',
    genre: 'jazz',
    weight: 10,
    description: 'Jazz turnaround - the most fundamental progression in jazz',
    examples: [
      'Autumn Leaves - Cannonball Adderley',
      'All The Things You Are - Ella Fitzgerald',
      'Blue Bossa - Joe Henderson',
    ],
    era: 'bebop',
  },
  {
    pattern: 'iii-VI-ii-V',
    genre: 'jazz',
    weight: 9,
    description: 'Extended jazz turnaround with chromatic approach',
    examples: ['Fly Me to the Moon - Frank Sinatra', 'Satin Doll - Duke Ellington'],
    era: 'swing',
  },
  {
    pattern: 'I-vi-ii-V',
    genre: 'jazz',
    weight: 9,
    description: 'Rhythm changes A-section progression',
    examples: ['I Got Rhythm - George Gershwin', 'Anthropology - Charlie Parker'],
    era: 'bebop',
  },
  {
    pattern: 'bII7-I',
    genre: 'jazz',
    weight: 8,
    description: 'Tritone substitution - dominant replacement a tritone away',
    examples: ['Satin Doll - Duke Ellington', 'Have You Met Miss Jones - Chet Baker'],
    era: 'bebop',
  },
  {
    pattern: 'im7-IV7-bVIImaj7',
    genre: 'jazz',
    weight: 7,
    description: 'Minor jazz progression with backdoor resolution',
    examples: ['Softly As In A Morning Sunrise', 'Beautiful Love'],
    era: 'cool-jazz',
  },
  {
    pattern: 'Imaj7-bIIImaj7-bVImaj7-bIImaj7',
    genre: 'jazz',
    weight: 8,
    description: 'Coltrane changes - major thirds cycle modulation',
    examples: ['Giant Steps - John Coltrane', 'Countdown - John Coltrane'],
    era: 'modal-jazz',
  },
  {
    pattern: 'IVmaj7-bVII7-Imaj7',
    genre: 'jazz',
    weight: 7,
    description: 'Backdoor progression - plagal resolution with bVII7',
    examples: ['Ladybird - Tadd Dameron', 'Body and Soul - Coleman Hawkins'],
    era: 'bebop',
  },
  {
    pattern: 'i-IV7-i7-bVII7',
    genre: 'jazz',
    weight: 6,
    description: 'Jazz minor progression with mixolydian IV',
    examples: ['Footprints - Wayne Shorter', 'So What - Miles Davis'],
    era: 'modal-jazz',
  },

  // ========================================
  // POP PATTERNS (8 patterns)
  // ========================================
  {
    pattern: 'I-V-vi-IV',
    genre: 'pop',
    weight: 10,
    description: 'Axis progression - the most popular progression in modern pop',
    examples: ['Let It Be - Beatles', 'No Woman No Cry - Bob Marley', 'Someone Like You - Adele'],
    era: 'modern',
  },
  {
    pattern: 'I-IV-V',
    genre: 'pop',
    weight: 9,
    description: 'Classic three-chord pop progression',
    examples: ['Twist and Shout - Beatles', 'La Bamba - Ritchie Valens', 'Wild Thing - The Troggs'],
    era: '1960s',
  },
  {
    pattern: 'vi-IV-I-V',
    genre: 'pop',
    weight: 9,
    description: 'Sensitive female chord progression - emotional descent',
    examples: ['Basket Case - Green Day', 'Poker Face - Lady Gaga', 'Grenade - Bruno Mars'],
    era: '2000s',
  },
  {
    pattern: 'I-vi-IV-V',
    genre: 'pop',
    weight: 8,
    description: 'Doo-wop progression - classic 1950s sound',
    examples: [
      'Stand By Me - Ben E. King',
      'Every Breath You Take - The Police',
      'Earth Angel - The Penguins',
    ],
    era: '1950s',
  },
  {
    pattern: 'IV-V-iii-vi',
    genre: 'pop',
    weight: 7,
    description: 'Royal road progression - popular in J-pop and K-pop',
    examples: ['Kanashimi wo Yasashisa ni - Little by Little', 'First Love - Utada Hikaru'],
    era: '2000s-jpop',
  },
  {
    pattern: 'I-IV-vi-V',
    genre: 'pop',
    weight: 8,
    description: 'Emotional arc progression - builds tension to resolution',
    examples: ['Apologize - OneRepublic', 'Viva La Vida - Coldplay'],
    era: '2000s',
  },
  {
    pattern: 'vi-V-IV-V',
    genre: 'pop',
    weight: 6,
    description: 'Emotional descent with emphasis on subdominant',
    examples: ['Umbrella - Rihanna', 'Party Rock Anthem - LMFAO'],
    era: '2010s',
  },
  {
    pattern: 'I-V-IV',
    genre: 'pop',
    weight: 8,
    description: 'Simplified axis - three-chord variation',
    examples: ['All The Small Things - Blink-182', 'She Will Be Loved - Maroon 5'],
    era: '2000s',
  },

  // ========================================
  // CLASSICAL PATTERNS (8 patterns)
  // ========================================
  {
    pattern: 'I-IV-V-I',
    genre: 'classical',
    weight: 9,
    description: 'Perfect authentic cadence with subdominant preparation',
    examples: ['Symphony conclusions', 'Hymn endings', 'Classical period works'],
    era: 'classical-period',
  },
  {
    pattern: 'ii-V-I',
    genre: 'classical',
    weight: 8,
    description: 'Common practice cadence with supertonic preparation',
    examples: ['Bach chorales', 'Mozart sonata endings', 'Haydn symphonies'],
    era: 'baroque-classical',
  },
  {
    pattern: 'IV-I',
    genre: 'classical',
    weight: 7,
    description: 'Plagal cadence - "Amen" resolution',
    examples: ['Hymn endings', 'Sacred music', "Handel's Messiah"],
    era: 'baroque',
  },
  {
    pattern: 'I-V',
    genre: 'classical',
    weight: 6,
    description: 'Half cadence - creates expectation and pause',
    examples: ['Phrase endings', 'Section transitions', 'Question-answer phrases'],
    era: 'common-practice',
  },
  {
    pattern: 'V-vi',
    genre: 'classical',
    weight: 7,
    description: 'Deceptive cadence - surprising resolution',
    examples: ['Beethoven symphonies', 'Mozart operas', 'Romantic period works'],
    era: 'classical-romantic',
  },
  {
    pattern: 'I-IV-I-V-I',
    genre: 'classical',
    weight: 6,
    description: 'Baroque sequence with tonic-dominant structure',
    examples: ['Bach preludes', 'Vivaldi concertos', 'Handel suites'],
    era: 'baroque',
  },
  {
    pattern: 'vi-ii-V-I',
    genre: 'classical',
    weight: 7,
    description: 'Circle of fifths progression - descending fifths',
    examples: ['Canon in D - Pachelbel', 'Classical period transitions'],
    era: 'baroque-classical',
  },
  {
    pattern: 'I-vi-ii-V-I',
    genre: 'classical',
    weight: 6,
    description: 'Extended classical progression with deceptive movement',
    examples: ['Romantic period works', 'Extended cadential phrases'],
    era: 'romantic',
  },

  // ========================================
  // ROCK PATTERNS (8 patterns)
  // ========================================
  {
    pattern: 'I-bVII-IV',
    genre: 'rock',
    weight: 9,
    description: 'Rock power progression with modal mixture from aeolian',
    examples: ["Sweet Child O' Mine - Guns N' Roses", 'Stairway to Heaven - Led Zeppelin'],
    era: '1970s-rock',
  },
  {
    pattern: 'I-IV-V',
    genre: 'rock',
    weight: 9,
    description: '12-bar blues foundation adapted for rock',
    examples: ['Johnny B. Goode - Chuck Berry', 'Rock and Roll - Led Zeppelin'],
    era: 'classic-rock',
  },
  {
    pattern: 'i-bVII-bVI-bVII',
    genre: 'rock',
    weight: 8,
    description: 'Minor rock progression with aeolian flavor',
    examples: [
      'Stairway to Heaven intro - Led Zeppelin',
      'All Along The Watchtower - Jimi Hendrix',
    ],
    era: '1960s-70s',
  },
  {
    pattern: 'I-bVII-bVI-IV',
    genre: 'rock',
    weight: 7,
    description: 'Descending rock progression with chromatic bass',
    examples: ['Dream On - Aerosmith', 'Hey Joe - Jimi Hendrix'],
    era: '1970s-rock',
  },
  {
    pattern: 'i-bVI-bVII',
    genre: 'rock',
    weight: 8,
    description: 'Grunge progression - minor with flat submediant',
    examples: ['Smells Like Teen Spirit - Nirvana', 'Come As You Are - Nirvana'],
    era: 'grunge',
  },
  {
    pattern: 'I-V-bVII-IV',
    genre: 'rock',
    weight: 7,
    description: 'Punk rock progression with modal bVII',
    examples: ['Should I Stay or Should I Go - The Clash', 'Teenage Kicks - The Undertones'],
    era: 'punk',
  },
  {
    pattern: 'i-iv-v',
    genre: 'rock',
    weight: 6,
    description: 'Power chord progression - all minor/suspended',
    examples: ['Paranoid - Black Sabbath', 'Iron Man - Black Sabbath'],
    era: 'heavy-metal',
  },
  {
    pattern: 'I-III-IV',
    genre: 'rock',
    weight: 6,
    description: 'Alternative rock progression with major III',
    examples: ['Creep - Radiohead', 'Wonderwall - Oasis'],
    era: 'alternative-rock',
  },

  // ========================================
  // EDM PATTERNS (8 patterns)
  // ========================================
  {
    pattern: 'i-VII-VI-V',
    genre: 'edm',
    weight: 8,
    description: 'EDM build tension - minor key descending progression',
    examples: ['Levels - Avicii', 'Titanium - David Guetta'],
    era: '2010s-edm',
  },
  {
    pattern: 'vi-IV-I-V',
    genre: 'edm',
    weight: 8,
    description: 'Progressive house variation of axis progression',
    examples: ['Wake Me Up - Avicii', "Don't You Worry Child - Swedish House Mafia"],
    era: 'progressive-house',
  },
  {
    pattern: 'i-bVII-bVI-bVII',
    genre: 'edm',
    weight: 7,
    description: 'Dubstep progression with aeolian modal interchange',
    examples: ['Scary Monsters and Nice Sprites - Skrillex', 'Bangarang - Skrillex'],
    era: 'dubstep',
  },
  {
    pattern: 'I-V-vi-iii',
    genre: 'edm',
    weight: 7,
    description: 'Trance progression - uplifting major key sequence',
    examples: ['Adagio for Strings - Tiësto', 'Silence - Delerium (Tiësto Remix)'],
    era: 'trance',
  },
  {
    pattern: 'vi-I-V-IV',
    genre: 'edm',
    weight: 6,
    description: 'House drop progression - relative minor start',
    examples: ['Animals - Martin Garrix', 'Tremor - Dimitri Vegas & Like Mike'],
    era: 'big-room',
  },
  {
    pattern: 'I-bVII-IV',
    genre: 'edm',
    weight: 7,
    description: 'EDM anthem progression with modal bVII',
    examples: ['Clarity - Zedd', 'Spectrum - Zedd'],
    era: '2010s-edm',
  },
  {
    pattern: 'i-v-bVII-bVI',
    genre: 'edm',
    weight: 6,
    description: 'Future bass progression - minor with chromatic bVI',
    examples: ['Say My Name - ODESZA', 'Latch - Disclosure'],
    era: 'future-bass',
  },
  {
    pattern: 'I-IV-bVII-IV',
    genre: 'edm',
    weight: 6,
    description: 'Big room progression with oscillating IV-bVII',
    examples: ['Epic - Sandro Silva & Quintino', 'LRAD - Knife Party'],
    era: 'big-room',
  },

  // ========================================
  // BLUES PATTERNS (8 patterns)
  // ========================================
  {
    pattern: 'I-IV-I-V',
    genre: 'blues',
    weight: 10,
    description: '12-bar blues fundamental structure - simplified',
    examples: ['Sweet Home Chicago - Robert Johnson', 'The Thrill Is Gone - B.B. King'],
    era: 'traditional-blues',
  },
  {
    pattern: 'I-IV-I-V-IV-I',
    genre: 'blues',
    weight: 9,
    description: 'Quick-change blues - IV chord in bar 2',
    examples: ['Stormy Monday - T-Bone Walker', 'Key to the Highway - Big Bill Broonzy'],
    era: 'chicago-blues',
  },
  {
    pattern: 'I7-IV7-I7-V7',
    genre: 'blues',
    weight: 9,
    description: '12-bar blues with dominant 7th voicings',
    examples: ['Crossroads - Robert Johnson', 'Pride and Joy - Stevie Ray Vaughan'],
    era: 'electric-blues',
  },
  {
    pattern: 'I-I-I-I-IV-IV-I-I-V-IV-I-V',
    genre: 'blues',
    weight: 8,
    description: 'Full 12-bar blues progression with turnaround',
    examples: ['Blues standard form', 'Kansas City - Big Joe Turner'],
    era: 'traditional-blues',
  },
  {
    pattern: 'i7-iv7-i7-V7',
    genre: 'blues',
    weight: 7,
    description: 'Minor blues with minor IV and dominant V',
    examples: ['The Thrill Is Gone - B.B. King', 'Red House - Jimi Hendrix'],
    era: 'modern-blues',
  },
  {
    pattern: 'I-bVII-IV',
    genre: 'blues',
    weight: 7,
    description: 'Blues-rock hybrid with modal bVII',
    examples: ['Born Under a Bad Sign - Albert King', 'Sunshine of Your Love - Cream'],
    era: 'blues-rock',
  },
  {
    pattern: 'I-IV-V-IV',
    genre: 'blues',
    weight: 6,
    description: 'Shuffle blues progression with emphasis on IV',
    examples: ['Mustang Sally - Wilson Pickett', 'Hard to Handle - Otis Redding'],
    era: 'soul-blues',
  },
  {
    pattern: 'i7-IV7-bVIImaj7-i7',
    genre: 'blues',
    weight: 6,
    description: 'Jazz blues with sophisticated harmony',
    examples: ["Bag's Groove - Milt Jackson", 'Tenor Madness - Sonny Rollins'],
    era: 'jazz-blues',
  },

  // ========================================
  // CROSS-GENRE PATTERNS (2 patterns)
  // ========================================
  {
    pattern: 'bVI-bVII-I',
    genre: 'rock',
    weight: 7,
    description: 'Mario cadence - chromatic approach to tonic',
    examples: ['Clocks - Coldplay', "Don't Stop Believin' - Journey"],
    era: 'classic-rock',
  },
  {
    pattern: 'i-bIII-bVII-iv',
    genre: 'edm',
    weight: 5,
    description: 'Dark progressive house - minor with chromatic mediant',
    examples: ['Strobe - Deadmau5', 'Language - Porter Robinson'],
    era: 'progressive-house',
  },
]
