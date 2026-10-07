/*
 * BOLLY KOMBAT — character & dialogue dataset
 * ------------------------------------------------------------
 * This file is the single source of truth for the game. It is plain data:
 *   - characters[]  : roster, outfit/look spec (drives the procedural renderer),
 *                     stats, special / super / fatality moves and dialogues
 *   - stages[]      : arenas
 *   - meta          : announcer + comic hit words
 *
 * Every dialogue has:
 *   text   : Hinglish (Roman) line shown in the speech bubble
 *   hi     : Devanagari version fed to the Hindi text-to-speech voice
 *   source : film / show the line is from ("Parody" = original joke written for this game)
 *   year   : release year of the source (null for parody)
 *   type   : "film"  -> iconic line from the film
 *            "meme"  -> catchphrase / pop-culture meme associated with the star
 *            "parody"-> new funny line in the character's voice
 *   vs     : (optional) only used when fighting this character id (rivalry lines)
 *   on     : which game events can trigger it
 *            intro | hit (lands a hard hit / combo) | hurt (takes a hard hit)
 *            super | win | fatality
 *
 * Run `node tools/export-dataset.mjs` to regenerate data/characters.json.
 */
window.BMK_DATA = {
  meta: {
    title: 'BOLLY KOMBAT',
    subtitle: 'Dhishoom Edition',
    announcer: {
      round: 'ROUND {n}',
      fight: 'LIGHTS... CAMERA... ACTION!',
      finishHim: 'KHATAM KARO ISKO!',
      fatality: 'PACKUP!',
      ko: 'K.O. — DHISHOOM!',
      flawless: 'SUPERHIT! (Flawless)',
      timeOver: 'INTERVAL! (Time Over)',
      draw: 'BOX OFFICE CLASH — DRAW!',
      wins: '{name} WINS — BLOCKBUSTER!'
    },
    hitWords: ['DHISHOOM!', 'DHISHKYAON!', 'DHADAAM!', 'THAAN!', 'KHATAAK!', 'DHAD!', 'PHATAAK!', 'DHAPP!'],
    blockWords: ['TANNN!', 'KHANG!', 'NAHI!'],
    comboWords: { 2: 'WAAH!', 3: 'TAALIYAAN!', 5: 'SEETIYAAN!', 7: 'HOUSEFULL!', 10: '100 CRORE CLUB!' }
  },

  stages: [
    { id: 'marine', name: 'Marine Drive, Mumbai', time: 'Night — Queen\'s Necklace lights' },
    { id: 'ramgarh', name: 'Ramgarh (Sholay)', time: 'Sunset — rocks, dust & the famous water tanki' },
    { id: 'filmcity', name: 'Film City Studio', time: 'Shooting in progress — fake Switzerland backdrop' },
    { id: 'lair', name: 'Mogambo\'s Lair', time: 'Underground — acid pool & HAIL MOGAMBO banners' }
  ],

  characters: [
    /* ───────────────────────────── G.ONE ───────────────────────────── */
    {
      id: 'gone',
      name: 'G.ONE',
      actor: 'Shah Rukh Khan',
      film: 'Ra.One',
      year: 2011,
      alterEgo: 'The video-game superhero who walked out of the screen',
      bio: 'King of Romance, now King of Combat. Opens his arms before every punch.',
      outfit: [
        'Skin-tight matte black bodysuit',
        'Glowing electric-blue circuit lines running down chest, arms and legs',
        'Blue power core glowing in the chest',
        'Black gloves and boots, slick spiky dark hair',
        'Eyes glow blue in power mode'
      ],
      look: {
        skin: '#c48c66', hair: { style: 'spiky', color: '#1a1410' }, brows: '#1a1410',
        mustache: 'none', beard: 'none', eyes: { glow: '#3fe0ff' },
        torso: { type: 'suit', color: '#141519' }, sleeve: '#141519', forearm: '#141519',
        gloves: '#0b0b0d', pants: '#141519', shoes: '#0b0b0d',
        circuits: '#29d4ff', core: '#7ff3ff', build: { w: 1.0, h: 1.0 }
      },
      stats: { speed: 5.0, power: 1.0, defense: 1.0 },
      voice: { pitch: 1.0, rate: 1.0 },
      special: { name: 'Plasma Ball', kind: 'projectile', shape: 'orb', color: '#29d4ff', speed: 11, r: 22, dmg: 70, cd: 70 },
      super: { name: 'H.A.R.T. Blaster', kind: 'beam', color: '#29d4ff' },
      fatality: { name: 'Naam Toh Suna Hoga', kind: 'launch', text: 'Opponent launched into orbit. Signal lost.' },
      dialogues: [
        { text: 'Bade bade deshon mein aisi chhoti chhoti baatein hoti rehti hain, Senorita!', hi: 'बड़े बड़े देशों में ऐसी छोटी छोटी बातें होती रहती हैं, सेनोरीटा!', source: 'Dilwale Dulhania Le Jayenge', year: 1995, type: 'film', on: ['hit', 'win'] },
        { text: 'Hum ek baar jeete hain, ek baar marte hain... aur maar bhi ek hi baar padti hai!', hi: 'हम एक बार जीते हैं, एक बार मरते हैं... और मार भी एक ही बार पड़ती है!', source: 'Kuch Kuch Hota Hai (twisted)', year: 1998, type: 'film', on: ['hit'] },
        { text: 'Hum ek baar jeete hain, ek baar marte hain, shaadi bhi ek baar hoti hai... aur pyaar bhi ek hi baar hota hai.', hi: 'हम एक बार जीते हैं, एक बार मरते हैं, शादी भी एक बार होती है... और प्यार भी एक ही बार होता है।', source: 'Kuch Kuch Hota Hai', year: 1998, type: 'film', on: ['win'] },
        { text: 'Don ko pakadna mushkil hi nahi... naamumkin hai!', hi: 'डॉन को पकड़ना मुश्किल ही नहीं... नामुमकिन है!', source: 'Don', year: 2006, type: 'film', on: ['intro', 'hit'] },
        { text: 'Rahul... naam toh suna hoga.', hi: 'राहुल... नाम तो सुना होगा।', source: 'Dil To Pagal Hai', year: 1997, type: 'film', on: ['intro', 'fatality'] },
        { text: 'Haar kar jeetne wale ko... Baazigar kehte hain!', hi: 'हार कर जीतने वाले को... बाज़ीगर कहते हैं!', source: 'Baazigar', year: 1993, type: 'film', on: ['win', 'super'] },
        { text: 'Picture abhi baaki hai, mere dost!', hi: 'पिक्चर अभी बाकी है, मेरे दोस्त!', source: 'Om Shanti Om', year: 2007, type: 'film', on: ['hurt'] },
        { text: 'Sattar minute... sattar minute hai tumhare paas!', hi: 'सत्तर मिनट... सत्तर मिनट है तुम्हारे पास!', source: 'Chak De! India', year: 2007, type: 'film', on: ['intro'] },
        { text: 'Bete ko haath lagane se pehle... baap se baat kar!', hi: 'बेटे को हाथ लगाने से पहले... बाप से बात कर!', source: 'Jawan', year: 2023, type: 'film', on: ['hit', 'super'] },
        { text: 'K-k-k-k-Kiran!', hi: 'क-क-क-क-किरण!', source: 'Darr', year: 1993, type: 'film', on: ['hurt'] },
        { text: 'Poori kainaat tujhe peetne ki saazish mein lag gayi hai!', hi: 'पूरी कायनात तुझे पीटने की साज़िश में लग गई है!', source: 'Om Shanti Om (twisted)', year: 2007, type: 'film', on: ['super'] },
        { text: 'Main hoon na! ...aur tu? Tu toh gaya.', hi: 'मैं हूँ ना! ...और तू? तू तो गया।', source: 'Main Hoon Na (twisted)', year: 2004, type: 'parody', on: ['hit'] },
        { text: 'Agar buraai ka saath doge, toh uski parchhai hamesha tumhara peecha karegi.', hi: 'अगर बुराई का साथ दोगे, तो उसकी परछाई हमेशा तुम्हारा पीछा करेगी।', source: 'Ra.One (Hindi paraphrase)', year: 2011, type: 'film', on: ['win', 'super'] },
        { text: 'Ra.One... tera H.A.R.T. toh pehle hi mere paas hai!', hi: 'रा.वन... तेरा हार्ट तो पहले ही मेरे पास है!', source: 'Parody (Ra.One)', year: null, type: 'parody', on: ['intro'], vs: 'raone' },
        { text: 'G.One online. Tera game over, mera game on!', hi: 'जी वन ऑनलाइन। तेरा गेम ओवर, मेरा गेम ऑन!', source: 'Parody', year: null, type: 'parody', on: ['intro', 'win'] }
      ]
    },

    /* ───────────────────────────── RA.ONE ───────────────────────────── */
    {
      id: 'raone',
      name: 'RA.ONE',
      actor: 'Arjun Rampal',
      film: 'Ra.One',
      year: 2011,
      alterEgo: 'Rhythm Activated One — the video-game villain who cannot die',
      bio: 'Modern-day Raavan with ten forms. Breaks into cubes, rebuilds himself, and is very angry about it.',
      outfit: [
        'Black armoured bodysuit with glowing RED circuit lines (G.One\'s evil mirror)',
        'Glowing red H.A.R.T. core in the chest',
        'Armoured black shoulder plates',
        'Near-shaved buzz-cut head, stubble, red glowing eyes'
      ],
      look: {
        skin: '#a7846c', hair: { style: 'buzz', color: '#1a1512' }, brows: '#1a1512',
        mustache: 'none', beard: 'stubble', eyes: { glow: '#ff2a2a' },
        torso: { type: 'suit', color: '#0e0e12' }, sleeve: '#0e0e12', forearm: '#0e0e12',
        gloves: '#070709', pants: '#0e0e12', shoes: '#070709',
        circuits: '#ff2a2a', core: '#ff8a7a', armor: '#1d1d24', build: { w: 1.06, h: 1.06 }
      },
      stats: { speed: 5.0, power: 1.08, defense: 1.0 },
      voice: { pitch: 0.7, rate: 0.95 },
      special: { name: 'Cube Teleport', kind: 'teleport', color: '#ff2a2a', dmg: 70, cd: 90 },
      super: { name: 'Dus Sar Ka Raavan', kind: 'rush', variant: 'clones', color: '#ff2a2a' },
      fatality: { name: 'Game Over', kind: 'cubes', text: 'Opponent shattered into red cubes. Insert coin to continue.' },
      dialogues: [
        { text: 'Main Ra.One hoon. Mujhe koi nahi maar sakta... game ka rule hai.', hi: 'मैं रा.वन हूँ। मुझे कोई नहीं मार सकता... गेम का रूल है।', source: 'Parody (Ra.One)', year: null, type: 'parody', on: ['intro'] },
        { text: 'G.One! Duniya ke har kone mein dhoonda tujhe... aaj game khatam!', hi: 'जी.वन! दुनिया के हर कोने में ढूँढा तुझे... आज गेम ख़त्म!', source: 'Parody (Ra.One)', year: null, type: 'parody', on: ['intro'], vs: 'gone' },
        { text: 'Game over!', hi: 'गेम ओवर!', source: 'Parody', year: null, type: 'parody', on: ['hit'] },
        { text: 'Pause ka button nahi hai, bachche. Yeh real life hai.', hi: 'पॉज़ का बटन नहीं है, बच्चे। यह रियल लाइफ़ है।', source: 'Parody', year: null, type: 'parody', on: ['hit'] },
        { text: 'Chammak Challo? Nahi... Chammak DHULLO!', hi: 'छम्मक छल्लो? नहीं... छम्मक धुल्लो!', source: 'Ra.One (song title, twisted)', year: 2011, type: 'parody', on: ['hit', 'win'] },
        { text: 'Dus sar hain mere... aur ek bhi maaf nahi karta!', hi: 'दस सर हैं मेरे... और एक भी माफ़ नहीं करता!', source: 'Parody (Raavan reference)', year: null, type: 'parody', on: ['super'] },
        { text: 'Mere H.A.R.T. ko haath mat lagana!', hi: 'मेरे हार्ट को हाथ मत लगाना!', source: 'Parody (Ra.One)', year: null, type: 'parody', on: ['hurt'] },
        { text: 'Toot gaya? Koi baat nahi... cubes se dobara ban jaunga.', hi: 'टूट गया? कोई बात नहीं... क्यूब्स से दोबारा बन जाऊँगा।', source: 'Parody (Ra.One)', year: null, type: 'parody', on: ['hurt'] },
        { text: 'Level complete. Agla victim, please!', hi: 'लेवल कम्प्लीट। अगला विक्टिम, प्लीज़!', source: 'Parody', year: null, type: 'parody', on: ['win', 'fatality'] }
      ]
    },

    /* ───────────────────────────── KRRISH ───────────────────────────── */
    {
      id: 'krrish',
      name: 'KRRISH',
      actor: 'Hrithik Roshan',
      film: 'Krrish',
      year: 2006,
      alterEgo: 'Krishna Mehra — masked hero with Jaadoo\'s powers',
      bio: 'Six-pack, six fingers on one hand, and one long black coat.',
      outfit: [
        'Black mask covering eyes and upper face, silver edge',
        'Long black leather trench coat',
        'Black shirt, black trousers, black gloves and boots',
        'Medium-length brown-black hair on top of the mask'
      ],
      look: {
        skin: '#d9a47c', hair: { style: 'flow', color: '#2a1d14' }, brows: '#2a1d14',
        mustache: 'none', beard: 'stubble', mask: { color: '#0d0d0f', trim: '#8a8f99' },
        torso: { type: 'coat', color: '#141416', inner: '#0a0a0b' }, sleeve: '#141416', forearm: '#141416',
        gloves: '#0a0a0b', pants: '#101012', shoes: '#0a0a0b',
        coat: { color: '#141416', lining: '#2b2b30' }, build: { w: 1.05, h: 1.03 }
      },
      stats: { speed: 5.8, power: 1.0, defense: 0.95 },
      voice: { pitch: 1.05, rate: 1.05 },
      special: { name: 'Jaadoo Dash', kind: 'dash', color: '#9fd3ff', dmg: 85, cd: 60 },
      super: { name: 'Krrish Rush', kind: 'rush', color: '#9fd3ff' },
      fatality: { name: 'Kaho Naa... Dance Hai', kind: 'dance', text: 'Opponent forced into an Ek Pal Ka Jeena hook step until they collapse.' },
      dialogues: [
        { text: 'Vijay Dinanath Chauhan... poora naam!', hi: 'विजय दीनानाथ चौहान... पूरा नाम!', source: 'Agneepath', year: 2012, type: 'film', on: ['intro'] },
        { text: 'Raja ka beta raja nahi banega... raja wahi banega jo haqdaar hoga!', hi: 'राजा का बेटा राजा नहीं बनेगा... राजा वही बनेगा जो हक़दार होगा!', source: 'Super 30', year: 2019, type: 'film', on: ['hit', 'win'] },
        { text: 'Jaadoo! Dhoop... dhoop!', hi: 'जादू! धूप... धूप!', source: 'Koi... Mil Gaya', year: 2003, type: 'meme', on: ['super'] },
        { text: 'Kaho naa... pyaar hai! ...nahi? Toh le ghoonsa!', hi: 'कहो ना... प्यार है! ...नहीं? तो ले घूँसा!', source: 'Kaho Naa... Pyaar Hai (twisted)', year: 2000, type: 'parody', on: ['hit'] },
        { text: 'Bang Bang!', hi: 'बैंग बैंग!', source: 'Bang Bang!', year: 2014, type: 'meme', on: ['hit'] },
        { text: 'Mask isliye pehenta hoon, taaki tujhe sharminda na hona pade.', hi: 'मास्क इसलिए पहनता हूँ, ताकि तुझे शर्मिंदा न होना पड़े।', source: 'Parody', year: null, type: 'parody', on: ['hit', 'intro'] },
        { text: 'Aah! Mera mask... mera hairstyle!', hi: 'आह! मेरा मास्क... मेरा हेयरस्टाइल!', source: 'Parody', year: null, type: 'parody', on: ['hurt'] },
        { text: 'Krrish ko koi nahi rok sakta... siwaye Mummy ke.', hi: 'कृष को कोई नहीं रोक सकता... सिवाय मम्मी के।', source: 'Parody', year: null, type: 'parody', on: ['win'] },
        { text: 'Pehle dance karunga, phir dhulai. Dono mein expert hoon.', hi: 'पहले डांस करूँगा, फिर धुलाई। दोनों में एक्सपर्ट हूँ।', source: 'Parody', year: null, type: 'parody', on: ['intro', 'fatality'] }
      ]
    },

    /* ───────────────────────────── FLYING JATT ───────────────────────────── */
    {
      id: 'jatt',
      name: 'FLYING JATT',
      actor: 'Tiger Shroff',
      film: 'A Flying Jatt',
      year: 2016,
      alterEgo: 'Aman Dhillon — martial-arts teacher blessed by a sacred tree',
      bio: 'Can fly. Is scared of heights. Still has to buy do kilo lauki on the way home.',
      outfit: [
        'Royal-blue superhero suit with gold piping on the shoulders',
        'Golden khanda emblem on the chest, light-blue collar',
        'Blue turban (patka) and blue eye-mask',
        'Black belt with a big gold buckle, blue coat-tails at the back',
        'White boots with black criss-cross laces'
      ],
      look: {
        skin: '#d6a07a', hair: { style: 'turban', color: '#1f3fbf' }, brows: '#2a1d14',
        mustache: 'none', beard: 'stubble', mask: { color: '#1f3fbf', trim: '#8fd6ff' },
        torso: { type: 'jatt', color: '#1f3fbf', collar: '#8fd6ff' }, sleeve: '#1f3fbf', forearm: '#1f3fbf',
        gloves: null, wristbands: '#f2c230', pants: '#1f3fbf', shoes: '#f4f4f4',
        boots: { color: '#f4f4f4', laces: '#111' }, gold: '#f2c230', emblem: 'khanda',
        coat: { color: '#2448cf', lining: '#16308f', backOnly: true },
        belt: { color: '#141414', buckle: '#e3b53c' }, build: { w: 1.0, h: 1.0 }
      },
      stats: { speed: 5.9, power: 0.98, defense: 0.95 },
      voice: { pitch: 1.15, rate: 1.08 },
      special: { name: 'Flying Kick', kind: 'flykick', color: '#8fd6ff', dmg: 80, cd: 60 },
      super: { name: 'Antariksh Dhulai', kind: 'rush', variant: 'space', color: '#8fd6ff' },
      fatality: { name: 'Pollution-Free Zone', kind: 'space', text: 'Opponent flown into space, where there is no pollution to save them.' },
      dialogues: [
        { text: 'Chhoti bachchi ho kya?', hi: 'छोटी बच्ची हो क्या?', source: 'Heropanti', year: 2014, type: 'film', on: ['hit', 'intro'] },
        { text: 'This Jatt kicks butt!', hi: 'दिस जट किक्स बट!', source: 'A Flying Jatt (poster tagline)', year: 2016, type: 'meme', on: ['super', 'hit'] },
        { text: 'Main udd sakta hoon... bas koi neeche mat dekhne dena!', hi: 'मैं उड़ सकता हूँ... बस कोई नीचे मत देखने देना!', source: 'Parody (A Flying Jatt)', year: null, type: 'parody', on: ['intro'] },
        { text: 'Mummy! Mujhe heights se darr lagta hai!', hi: 'मम्मी! मुझे हाइट्स से डर लगता है!', source: 'Parody (A Flying Jatt)', year: null, type: 'parody', on: ['hurt'] },
        { text: 'Pollution kam karo, warna Flying Jatt aa jayega!', hi: 'पॉल्यूशन कम करो, वरना फ़्लाइंग जट आ जाएगा!', source: 'Parody (A Flying Jatt)', year: null, type: 'parody', on: ['hit', 'win'] },
        { text: 'Jaldi khatam karte hain, ghar pe do kilo lauki bhi le jaani hai.', hi: 'जल्दी ख़त्म करते हैं, घर पे दो किलो लौकी भी ले जानी है।', source: 'Parody (A Flying Jatt)', year: null, type: 'parody', on: ['win', 'intro'] },
        { text: 'Antariksh mein pollution nahi hota... wahan tujhe koi nahi bachayega!', hi: 'अंतरिक्ष में पॉल्यूशन नहीं होता... वहाँ तुझे कोई नहीं बचाएगा!', source: 'Parody (A Flying Jatt climax)', year: null, type: 'parody', on: ['super', 'fatality'] },
        { text: 'Oye! Suit naya hai, mummy ne silwaya hai!', hi: 'ओए! सूट नया है, मम्मी ने सिलवाया है!', source: 'Parody (A Flying Jatt)', year: null, type: 'parody', on: ['hurt'] }
      ]
    },

    /* ───────────────────────────── CHITTI ───────────────────────────── */
    {
      id: 'chitti',
      name: 'CHITTI',
      actor: 'Rajinikanth',
      film: 'Robot / 2.0',
      year: 2010,
      alterEgo: 'Chitti the Robot — speed 1 terahertz, memory 1 zettabyte',
      bio: 'Does not dodge bullets. Bullets dodge him. Shows metal skin when damaged.',
      outfit: [
        'Black leather jacket over dark shirt, black trousers',
        'Signature black sunglasses',
        'Thick wavy black hair',
        'Silver robotic endoskeleton visible through the face when damaged (red eye)'
      ],
      look: {
        skin: '#8a5a3c', hair: { style: 'wavy', color: '#111' }, brows: '#111',
        mustache: 'thin', beard: 'none', glasses: { type: 'shades', frame: '#050505', lens: '#101418' },
        torso: { type: 'jacket', color: '#1c1c1e', inner: '#3a3f4a' }, sleeve: '#1c1c1e', forearm: '#1c1c1e',
        gloves: null, pants: '#141416', shoes: '#050505',
        robot: true, build: { w: 1.0, h: 0.98 }
      },
      stats: { speed: 4.8, power: 1.05, defense: 1.05 },
      voice: { pitch: 0.85, rate: 1.0 },
      special: { name: 'Magnet Bolts', kind: 'projectile', shape: 'bolt', color: '#d6dde6', speed: 15, r: 9, dmg: 28, count: 3, gap: 6, cd: 75 },
      super: { name: 'Chitti Army', kind: 'rush', variant: 'clones', color: '#d6dde6' },
      fatality: { name: 'Ctrl + Alt + Delete', kind: 'delete', text: 'Opponent uninstalled. 0 files remaining.' },
      dialogues: [
        { text: 'Hi! Main hoon Chitti, the Robot. Speed 1 terahertz, memory 1 zettabyte.', hi: 'हाय! मैं हूँ चिट्टी, द रोबोट। स्पीड वन टेराहर्ट्ज़, मेमोरी वन ज़ेटाबाइट।', source: 'Robot', year: 2010, type: 'film', on: ['intro'] },
        { text: 'Mind it!', hi: 'माइंड इट!', source: 'Rajinikanth catchphrase', year: null, type: 'meme', on: ['hit'] },
        { text: 'Rascala!', hi: 'रास्कला!', source: 'Rajinikanth catchphrase', year: null, type: 'meme', on: ['hit'] },
        { text: 'Main ek baar bolta hoon, toh sau baar bolne ke barabar hai!', hi: 'मैं एक बार बोलता हूँ, तो सौ बार बोलने के बराबर है!', source: 'Baashha (Hindi dub)', year: 1995, type: 'film', on: ['hit', 'win'] },
        { text: 'Kabali da!', hi: 'कबाली डा!', source: 'Kabali', year: 2016, type: 'film', on: ['super'] },
        { text: 'Meeehhhh!', hi: 'मैंऽऽऽ!', source: 'Robot (Chitti 2.0)', year: 2010, type: 'meme', on: ['hit', 'hurt'] },
        { text: 'Error 404: Tera defence not found.', hi: 'एरर फ़ोर ज़ीरो फ़ोर: तेरा डिफ़ेंस नॉट फ़ाउंड।', source: 'Parody', year: null, type: 'parody', on: ['hit'] },
        { text: 'Battery low... ek minute, charging pe lagata hoon!', hi: 'बैटरी लो... एक मिनट, चार्जिंग पे लगाता हूँ!', source: 'Parody', year: null, type: 'parody', on: ['hurt'] },
        { text: 'Software update complete. Opponent deleted. Mind it!', hi: 'सॉफ़्टवेयर अपडेट कम्प्लीट। ऑपोनेंट डिलीटेड। माइंड इट!', source: 'Parody', year: null, type: 'parody', on: ['win', 'fatality'] }
      ]
    },

    /* ───────────────────────────── SHAKTIMAAN ───────────────────────────── */
    {
      id: 'shaktimaan',
      name: 'SHAKTIMAAN',
      actor: 'Mukesh Khanna',
      film: 'Shaktimaan (TV)',
      year: 1997,
      alterEgo: 'Gangadhar Vidyadhar Mayadhar Omkarnath Shastri',
      bio: 'India\'s first desi superhero. Spins. Lectures. Spins again.',
      outfit: [
        'Red full bodysuit',
        'Golden chest yoke with a sun/chakra emblem',
        'Golden belt, golden arm bands and golden boots trim',
        'Neatly parted black hair and thick moustache'
      ],
      look: {
        skin: '#c58a62', hair: { style: 'parted', color: '#141010' }, brows: '#141010',
        mustache: 'thick', beard: 'none',
        torso: { type: 'hero', color: '#c8102e' }, sleeve: '#c8102e', forearm: '#c8102e',
        gloves: null, wristbands: '#f2c230', pants: '#c8102e', shoes: '#f2c230',
        gold: '#f2c230', emblem: 'chakra', belt: { color: '#f2c230', buckle: '#fff2a8' }, build: { w: 1.08, h: 1.02 }
      },
      stats: { speed: 4.6, power: 1.08, defense: 1.08 },
      voice: { pitch: 0.9, rate: 0.92 },
      special: { name: 'Shakti Spin', kind: 'spin', color: '#f2c230', dmg: 26, cd: 70 },
      super: { name: 'Om Tornado', kind: 'spin', color: '#f2c230' },
      fatality: { name: 'Sorry Shaktimaan', kind: 'tornado', text: 'Opponent spun into the stratosphere. Choti choti magar moti baat.' },
      dialogues: [
        { text: 'Om... Shaktimaan!', hi: 'ॐ... शक्तिमान!', source: 'Shaktimaan (transformation)', year: 1997, type: 'meme', on: ['intro', 'super'] },
        { text: 'Bolo... Sorry Shaktimaan!', hi: 'बोलो... सॉरी शक्तिमान!', source: 'Shaktimaan', year: 1997, type: 'meme', on: ['hit', 'fatality'] },
        { text: 'Chhoti chhoti magar moti baatein: maar khane se pehle soch lena!', hi: 'छोटी छोटी मगर मोटी बातें: मार खाने से पहले सोच लेना!', source: 'Shaktimaan (segment, twisted)', year: 1997, type: 'parody', on: ['win'] },
        { text: 'Gangadhar hi Shaktimaan hai!', hi: 'गंगाधर ही शक्तिमान है!', source: 'Shaktimaan (meme)', year: 1997, type: 'meme', on: ['hurt', 'intro'] },
        { text: 'Andhera kaayam nahi rahega, Kilvish!', hi: 'अंधेरा कायम नहीं रहेगा, किलविश!', source: 'Shaktimaan (twisted)', year: 1997, type: 'parody', on: ['super'] },
        { text: 'Bachchon, yeh stunt ghar pe try mat karna!', hi: 'बच्चों, यह स्टंट घर पे ट्राई मत करना!', source: 'Parody', year: null, type: 'parody', on: ['hit'] },
        { text: 'Bachchon, roz doodh piyo... aur bure logon ko aise hi dhulo.', hi: 'बच्चों, रोज़ दूध पियो... और बुरे लोगों को ऐसे ही धुलो।', source: 'Parody', year: null, type: 'parody', on: ['win', 'hit'] }
      ]
    },

    /* ───────────────────────────── MR. INDIA ───────────────────────────── */
    {
      id: 'mrindia',
      name: 'MR. INDIA',
      actor: 'Anil Kapoor',
      film: 'Mr. India',
      year: 1987,
      alterEgo: 'Arun Verma — invisible when he wears the watch',
      bio: 'You can\'t see him. You can only see the red light. Then you see stars.',
      outfit: [
        'Grey-brown fedora hat',
        'Long belted trench coat',
        'Shirt and trousers underneath',
        'Iconic thick moustache',
        'Red light visible when invisible'
      ],
      look: {
        skin: '#c99a73', hair: { style: 'curly', color: '#16110d' }, brows: '#16110d',
        mustache: 'thick', beard: 'stubble', hat: { type: 'fedora', color: '#5e5446', band: '#2c261f' },
        torso: { type: 'coat', color: '#7a6c55', inner: '#e8e1cf' }, sleeve: '#7a6c55', forearm: '#7a6c55',
        gloves: null, pants: '#3d3a35', shoes: '#2a211a',
        coat: { color: '#7a6c55', lining: '#5a4e3c' }, belt: { color: '#5a4e3c', buckle: '#b9a77d' }, build: { w: 1.0, h: 1.0 }
      },
      stats: { speed: 5.2, power: 0.98, defense: 0.98 },
      voice: { pitch: 1.1, rate: 1.08 },
      special: { name: 'Gayab!', kind: 'invisible', color: '#ff2b2b', cd: 420 },
      super: { name: 'Invisible Dhulai', kind: 'rush', variant: 'invisible', color: '#ff2b2b' },
      fatality: { name: 'Mr. India Ne Gayab Kar Diya', kind: 'vanish', text: 'Opponent made permanently invisible. Nobody misses them.' },
      dialogues: [
        { text: 'Jhakaas!', hi: 'झक्कास!', source: 'Anil Kapoor catchphrase', year: null, type: 'meme', on: ['hit', 'win'] },
        { text: 'Control Uday, control!', hi: 'कंट्रोल उदय, कंट्रोल!', source: 'Welcome', year: 2007, type: 'film', on: ['hurt'] },
        { text: 'Dikhta nahi hoon... par lagta zor se hoon!', hi: 'दिखता नहीं हूँ... पर लगता ज़ोर से हूँ!', source: 'Parody', year: null, type: 'parody', on: ['hit', 'intro'] },
        { text: 'Laal batti dekhi? Matlab ab tu gaya!', hi: 'लाल बत्ती देखी? मतलब अब तू गया!', source: 'Parody (Mr. India)', year: null, type: 'parody', on: ['super'] },
        { text: 'Calendar! Khaana lao, ladai ke baad bhook lagti hai!', hi: 'कैलेंडर! खाना लाओ, लड़ाई के बाद भूख लगती है!', source: 'Mr. India (twisted)', year: 1987, type: 'parody', on: ['win'] },
        { text: 'Mogambo khush hua? Nahi... ab Mr. India khush hua!', hi: 'मोगैम्बो खुश हुआ? नहीं... अब मिस्टर इंडिया खुश हुआ!', source: 'Mr. India (twisted)', year: 1987, type: 'parody', on: ['win', 'fatality'] },
        { text: 'Ek, do, teen... ab tu dikhega nahi!', hi: 'एक, दो, तीन... अब तू दिखेगा नहीं!', source: 'Parody', year: null, type: 'parody', on: ['intro'] }
      ]
    },

    /* ───────────────────────────── SINGHAM ───────────────────────────── */
    {
      id: 'singham',
      name: 'SINGHAM',
      actor: 'Ajay Devgn',
      film: 'Singham',
      year: 2011,
      alterEgo: 'Inspector Bajirao Singham',
      bio: 'Roars before he punches. Arrives by flipping jeep. Never removes the aviators.',
      outfit: [
        'Khaki police uniform shirt with shoulder epaulettes and stars',
        'Khaki trousers, brown leather belt with brass buckle',
        'Gold-frame aviator sunglasses',
        'Thick moustache, police badge and name plate'
      ],
      look: {
        skin: '#b07a55', hair: { style: 'thick', color: '#0f0c0a' }, brows: '#0f0c0a',
        mustache: 'thick', beard: 'stubble', glasses: { type: 'aviator', frame: '#c9a24a', lens: '#2a2219' },
        torso: { type: 'uniform', color: '#c2a46b' }, sleeve: '#c2a46b', forearm: null,
        gloves: null, pants: '#b39560', shoes: '#140f0b',
        epaulettes: '#c2a46b', badge: true, belt: { color: '#5b3a1f', buckle: '#d8b25a' }, build: { w: 1.08, h: 1.0 }
      },
      stats: { speed: 4.6, power: 1.12, defense: 1.05 },
      voice: { pitch: 0.75, rate: 0.95 },
      special: { name: 'Satakli Shockwave', kind: 'slam', color: '#ffb347', dmg: 75, cd: 80 },
      super: { name: 'Jeep Entry', kind: 'vehicle', color: '#ffffff' },
      fatality: { name: 'Arrest Warrant', kind: 'arrest', text: 'Opponent arrested, loaded in the jeep and sent to Shivgarh lock-up.' },
      dialogues: [
        { text: 'Aata majhi satakli!', hi: 'आता माझी सटकली!', source: 'Singham', year: 2011, type: 'film', on: ['super', 'hit'] },
        { text: '2 aur 3 October ko hum Panjim gaye the... satsang ke liye.', hi: 'दो और तीन अक्टूबर को हम पणजी गए थे... सत्संग के लिए।', source: 'Drishyam', year: 2015, type: 'film', on: ['intro', 'hurt'] },
        { text: 'Meri jeep ki entry dekhi? Ab apni exit dekh!', hi: 'मेरी जीप की एंट्री देखी? अब अपनी एग्ज़िट देख!', source: 'Parody', year: null, type: 'parody', on: ['hit', 'win'] },
        { text: 'Kanoon ke haath lambe hote hain... aur mere ghoonse bhi!', hi: 'कानून के हाथ लंबे होते हैं... और मेरे घूँसे भी!', source: 'Parody (classic Bollywood line)', year: null, type: 'parody', on: ['hit'] },
        { text: 'Dard nahi hota... bas thodi si satakti hai!', hi: 'दर्द नहीं होता... बस थोड़ी सी सटकती है!', source: 'Parody', year: null, type: 'parody', on: ['hurt'] },
        { text: 'Ek pair idhar, ek pair udhar... split bhi main, hit bhi main!', hi: 'एक पैर इधर, एक पैर उधर... स्प्लिट भी मैं, हिट भी मैं!', source: 'Parody (Phool Aur Kaante stunt)', year: null, type: 'parody', on: ['intro', 'win'] },
        { text: 'Chal, thaane chal!', hi: 'चल, थाने चल!', source: 'Parody', year: null, type: 'parody', on: ['fatality'] }
      ]
    },

    /* ───────────────────────────── CHULBUL PANDEY ───────────────────────────── */
    {
      id: 'chulbul',
      name: 'CHULBUL PANDEY',
      actor: 'Salman Khan',
      film: 'Dabangg',
      year: 2010,
      alterEgo: 'Robin Hood Pandey',
      bio: 'Wears his sunglasses on the back of his collar. Nobody knows why. Nobody asks.',
      outfit: [
        'Khaki police uniform, sleeves slightly rolled',
        'Aviator sunglasses hanging on the BACK of the shirt collar',
        'Thick moustache, short spiky hair',
        'Big belt buckle, red handkerchief'
      ],
      look: {
        skin: '#c18b63', hair: { style: 'short', color: '#16110d' }, brows: '#16110d',
        mustache: 'thick', beard: 'none', collarShades: { frame: '#c9a24a', lens: '#2a2219' },
        torso: { type: 'uniform', color: '#bb9a5f', open: true, inner: '#e9e2d0' }, sleeve: '#bb9a5f', forearm: null,
        gloves: null, pants: '#a98a52', shoes: '#140f0b', hanky: '#c4161c',
        epaulettes: '#bb9a5f', badge: true, belt: { color: '#3b2614', buckle: '#e3c15f' }, build: { w: 1.12, h: 1.0 }
      },
      stats: { speed: 4.9, power: 1.1, defense: 1.0 },
      voice: { pitch: 0.95, rate: 1.0 },
      special: { name: 'Boomerang Chashma', kind: 'projectile', shape: 'glasses', color: '#c9a24a', speed: 12, r: 16, dmg: 45, boomerang: true, cd: 80 },
      super: { name: 'Thappad Express', kind: 'rush', variant: 'slap', color: '#ffcf4a' },
      fatality: { name: 'Dabangg Thappad', kind: 'slap', text: 'Opponent slapped into the next district.' },
      dialogues: [
        { text: 'Hum tum mein itne chhed karenge, ki confuse ho jaoge ki saans kahan se le aur paade kahan se!', hi: 'हम तुम में इतने छेद करेंगे, कि कन्फ़्यूज़ हो जाओगे कि साँस कहाँ से लें और पादें कहाँ से!', source: 'Dabangg', year: 2010, type: 'film', on: ['super', 'hit'] },
        { text: 'Swagat nahi karoge hamara?', hi: 'स्वागत नहीं करोगे हमारा?', source: 'Dabangg 2', year: 2012, type: 'film', on: ['intro'] },
        { text: 'Ek baar jo maine commitment kar di, uske baad toh main khud ki bhi nahi sunta!', hi: 'एक बार जो मैंने कमिटमेंट कर दी, उसके बाद तो मैं खुद की भी नहीं सुनता!', source: 'Wanted', year: 2009, type: 'film', on: ['intro', 'hit'] },
        { text: 'Thappad se darr nahi lagta sahab... pyaar se lagta hai!', hi: 'थप्पड़ से डर नहीं लगता साहब... प्यार से लगता है!', source: 'Dabangg', year: 2010, type: 'film', on: ['hurt'] },
        { text: 'Mujh par ek ehsaan karna... ki mujh par koi ehsaan na karna.', hi: 'मुझ पर एक एहसान करना... कि मुझ पर कोई एहसान न करना।', source: 'Maine Pyar Kiya', year: 1989, type: 'film', on: ['win'] },
        { text: 'Tiger zinda hai!', hi: 'टाइगर ज़िंदा है!', source: 'Tiger Zinda Hai', year: 2017, type: 'film', on: ['hurt', 'win'] },
        { text: 'Chashma peeche, ghoonsa aage. Yahi hai Robin Hood Pandey!', hi: 'चश्मा पीछे, घूँसा आगे। यही है रॉबिन हुड पांडे!', source: 'Parody', year: null, type: 'parody', on: ['hit', 'fatality'] }
      ]
    },

    /* ───────────────────────────── GABBAR SINGH ───────────────────────────── */
    {
      id: 'gabbar',
      name: 'GABBAR SINGH',
      actor: 'Amjad Khan',
      film: 'Sholay',
      year: 1975,
      alterEgo: 'The dacoit of Ramgarh — pachaas pachaas kos door tak famous',
      bio: 'Chews tobacco. Asks how many men there were. Every single time.',
      outfit: [
        'Faded olive army fatigues',
        'Brown leather ammunition bandolier across the chest',
        'Scruffy black beard, messy shoulder-length hair',
        'Stained teeth, heavy boots'
      ],
      look: {
        skin: '#9c6b49', hair: { style: 'messy', color: '#120e0b' }, brows: '#120e0b',
        mustache: 'thick', beard: 'scruffy', teeth: '#6b5a2e',
        torso: { type: 'fatigue', color: '#4f5a33' }, sleeve: '#4f5a33', forearm: '#4f5a33',
        gloves: null, pants: '#454e2c', shoes: '#22180f',
        bandolier: { strap: '#5a3b1e', bullet: '#d4a640' }, belt: { color: '#3a2716', buckle: '#8d7a4a' }, build: { w: 1.12, h: 1.0 }
      },
      stats: { speed: 4.5, power: 1.12, defense: 1.02 },
      voice: { pitch: 0.6, rate: 0.9 },
      special: { name: 'Kitne Aadmi The (Pistol)', kind: 'projectile', shape: 'bullet', color: '#ffe08a', speed: 20, r: 6, dmg: 32, count: 2, gap: 10, cd: 70 },
      super: { name: 'Chhe Goliyan', kind: 'volley', color: '#ffe08a' },
      fatality: { name: 'Yeh Haath Humko De De', kind: 'noarms', text: 'Gabbar takes their arms. Thakur sends a sympathy card.' },
      dialogues: [
        { text: 'Kitne aadmi the?', hi: 'कितने आदमी थे?', source: 'Sholay', year: 1975, type: 'film', on: ['intro', 'hit'] },
        { text: 'Jo darr gaya... samjho mar gaya!', hi: 'जो डर गया... समझो मर गया!', source: 'Sholay', year: 1975, type: 'film', on: ['hit', 'super'] },
        { text: 'Yeh haath humko de de, Thakur!', hi: 'ये हाथ हमको दे दे, ठाकुर!', source: 'Sholay', year: 1975, type: 'film', on: ['fatality', 'super'] },
        { text: 'Ab tera kya hoga, Kaalia?', hi: 'अब तेरा क्या होगा, कालिया?', source: 'Sholay', year: 1975, type: 'film', on: ['hit', 'win'] },
        { text: 'Arre O Sambha! Kitna inaam rakhe hai sarkar hum par?', hi: 'अरे ओ सांभा! कितना इनाम रखे है सरकार हम पर?', source: 'Sholay', year: 1975, type: 'film', on: ['intro'] },
        { text: 'Bahut yaarana lagta hai!', hi: 'बहुत याराना लगता है!', source: 'Sholay', year: 1975, type: 'film', on: ['hit'] },
        { text: 'Holi kab hai? Kab hai Holi?', hi: 'होली कब है? कब है होली?', source: 'Sholay', year: 1975, type: 'film', on: ['win', 'hurt'] },
        { text: 'Aaaah! Sambha... tu bas dekhta reh!', hi: 'आआह! सांभा... तू बस देखता रह!', source: 'Parody', year: null, type: 'parody', on: ['hurt'] }
      ]
    },

    /* ───────────────────────────── MOGAMBO (BOSS) ───────────────────────────── */
    {
      id: 'mogambo',
      name: 'MOGAMBO',
      actor: 'Amrish Puri',
      film: 'Mr. India',
      year: 1987,
      alterEgo: 'Supreme villain. Owner of a very large acid tub.',
      bio: 'Final boss. Very easy to please (just lose to him).',
      outfit: [
        'Shiny black ceremonial costume with gold trims',
        'Huge golden shoulder epaulettes',
        'Maroon-lined black cape',
        'Puffed-up wild grey-black hair, fierce eyebrows and kohl-lined eyes'
      ],
      look: {
        skin: '#b07b58', hair: { style: 'puff', color: '#2b2622' }, brows: '#0e0b09',
        mustache: 'none', beard: 'none', kohl: true,
        torso: { type: 'robe', color: '#141214' }, sleeve: '#141214', forearm: '#141214',
        gloves: null, wristbands: '#d4a017', pants: '#141214', shoes: '#d4a017',
        gold: '#d4a017', epaulettes: '#d4a017', cape: { color: '#0d0b0d', inner: '#6e0f1c' },
        belt: { color: '#d4a017', buckle: '#fff0a0' }, build: { w: 1.15, h: 1.04 }
      },
      stats: { speed: 4.3, power: 1.15, defense: 1.1 },
      voice: { pitch: 0.55, rate: 0.85 },
      special: { name: 'Acid Toss', kind: 'projectile', shape: 'acid', color: '#7dff3a', speed: 8, r: 18, dmg: 60, arc: true, cd: 70 },
      super: { name: 'Acid Ray', kind: 'beam', color: '#7dff3a' },
      fatality: { name: 'Acid Ka Kund', kind: 'acid', text: 'Opponent dropped in the acid tub. Mogambo is extremely khush.' },
      dialogues: [
        { text: 'Mogambo khush hua!', hi: 'मोगैम्बो खुश हुआ!', source: 'Mr. India', year: 1987, type: 'film', on: ['hit', 'win', 'fatality'] },
        { text: 'Jaa Simran jaa... jee le apni zindagi!', hi: 'जा सिमरन जा... जी ले अपनी ज़िंदगी!', source: 'Dilwale Dulhania Le Jayenge', year: 1995, type: 'film', on: ['hit'] },
        { text: 'Bolo... Hail Mogambo! Warna acid mein daal dunga!', hi: 'बोलो... हेल मोगैम्बो! वरना एसिड में डाल दूँगा!', source: 'Mr. India (twisted)', year: 1987, type: 'parody', on: ['intro'] },
        { text: 'Mogambo naraaz hua!', hi: 'मोगैम्बो नाराज़ हुआ!', source: 'Mr. India (twisted)', year: 1987, type: 'parody', on: ['hurt'] },
        { text: 'Mogambo ki duniya mein swagat hai!', hi: 'मोगैम्बो की दुनिया में स्वागत है!', source: 'Parody', year: null, type: 'parody', on: ['super', 'intro'] },
        { text: 'Aaj Mogambo bahut, bahut khush hua!', hi: 'आज मोगैम्बो बहुत, बहुत खुश हुआ!', source: 'Mr. India (twisted)', year: 1987, type: 'parody', on: ['win'] }
      ]
    }
  ]
};
