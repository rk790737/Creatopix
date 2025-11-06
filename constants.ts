export const PLATFORM_TARGETS = ["Auto", "None", "Instagram Feed", "Instagram Story", "Website Banner", "Print Ad", "Billboard", "Facebook Post", "LinkedIn Banner", "YouTube Thumbnail"];
export const CAMERA_ANGLES = ["Auto", "None", "Full View Shot", "Ultra Macro Shot", "Close Up", "Medium Shot", "Long Shot", "Dutch Angle", "Low Angle", "High Angle", "Eye Level", "Bird's Eye View", "Worm's Eye View", "Over the Shoulder", "Point of View (POV)", "Product Top-Down", "Product 45-Degree Angle", "Product Hero Shot (Low Angle)", "Dynamic Composition", "Model Headshot", "Model Full Body", "Candid Shot", "Action Shot", "Drone Shot", "Gimbal Shot", "Handheld Shot", "Static Shot", "Panning Shot", "Tilt Shot"];

export const SHOOTING_DEVICES = ["Auto", "None", "Professional Camera", "Smartphone"];

export const CAMERA_MODELS = [
  "Auto", 
  "None",
  // Canon
  "Canon EOS 5D Mark IV", 
  "Canon EOS 90D", 
  "Canon 6D Mark II", 
  // Nikon
  "Nikon D850", 
  "Nikon D780", 
  "Nikon D7500", 
  // Sony
  "Sony Alpha 7 IV",
  "Sony Alpha 7R III", 
  "Sony Alpha 580",
  "Sony Alpha 560",
  "Sony Alpha 390",
  // Pentax
  "Pentax K-3 Mark III", 
];

const CANON_EF_LENSES = [
  "Canon EF 50mm f/1.8 STM",
  "Canon EF 85mm f/1.2L II USM",
  "Canon EF 24-70mm f/2.8L II USM",
  "Sigma 35mm f/1.4 DG HSM Art for Canon",
  "Tamron SP 70-200mm f/2.8 Di VC USD G2 for Canon",
];

const NIKON_F_LENSES = [
  "Nikon AF-S 50mm f/1.8G",
  "Nikon AF-S 85mm f/1.8G",
  "AF-S NIKKOR 70-200mm f/2.8E FL ED VR",
  "Sigma 35mm f/1.4 DG HSM Art for Nikon",
  "Tamron SP 24-70mm f/2.8 Di VC USD G2 for Nikon",
];

const SONY_E_LENSES = [
  "Sony FE 50mm f/1.4 GM",
  "Sony FE 85mm f/1.8",
  "Sony FE 24-105mm f/4 G",
  "Sony FE 70-200mm f/2.8 GM OSS II",
  "Sigma 35mm f/1.4 DG DN Art for Sony",
  "Tamron 28-75mm f/2.8 Di III RXD",
];

const SONY_A_LENSES = [
    "Sony 50mm f/1.8 DT SAM",
    "Sony 16-50mm f/2.8 DT SSM",
    "Minolta AF 50mm f/1.7",
];

const PENTAX_K_LENSES = [
    "Pentax SMC FA 50mm f/1.4",
    "Pentax SMC D FA 100mm f/2.8 Macro WR",
];

export const LENSES_BY_CAMERA: { [key: string]: string[] } = {
  "Canon EOS 5D Mark IV": CANON_EF_LENSES, 
  "Canon EOS 90D": CANON_EF_LENSES, 
  "Canon 6D Mark II": CANON_EF_LENSES, 
  "Nikon D850": NIKON_F_LENSES, 
  "Nikon D780": NIKON_F_LENSES, 
  "Nikon D7500": NIKON_F_LENSES, 
  "Sony Alpha 7 IV": SONY_E_LENSES,
  "Sony Alpha 7R III": SONY_E_LENSES, 
  "Sony Alpha 580": SONY_A_LENSES,
  "Sony Alpha 560": SONY_A_LENSES,
  "Sony Alpha 390": SONY_A_LENSES,
  "Pentax K-3 Mark III": PENTAX_K_LENSES, 
};

export const CAMERA_LENSES = [
  "Auto",
  "None",
  ...new Set([
    ...CANON_EF_LENSES,
    ...NIKON_F_LENSES,
    ...SONY_E_LENSES,
    ...SONY_A_LENSES,
    ...PENTAX_K_LENSES
  ])
];

export const PHONE_MODELS = [
  "Auto",
  "None",
  "iPhone 17 Pro",
  "iPhone 16 Pro",
  "Samsung S25 FE",
  "Samsung Galaxy S25 Ultra",
  "Samsung Galaxy S25 Edge",
  "Samsung Galaxy S23 FE",
  "OnePlus 13R",
  "Motorola Edge 50 Ultra",
  "Oppo Find X9",
  "Vivo V60e",
  "Xiaomi 17",
  "Vivo V60"
];

export const MODEL_TYPES = ["Auto", "None", "Male", "Female", "Non-Binary", "Couple (M/F)", "Couple (M/M)", "Couple (F/F)", "Group of Friends", "Family", "Product Only"];
export const AGE_GENERATIONS = ["Auto", "None", "Gen Alpha (0-9)", "Gen Z (10-25)", "Millennials (26-40)", "Gen X (41-55)", "Baby Boomers (56-75)", "Seniors (75+)", "Adults (18-35)", "Teenagers (13-17)", "Children (5-12)"];

export const SKIN_TEXTURE_OPTIONS = ["Auto", "None", "Smooth Skin", "Oily Skin (Visible Pores)", "Dry Skin (Matte)", "Aged Skin (Wrinkles)", "Acne-Prone Skin", "Visible Pores & Microtexture", "Freckles & Moles", "Visible Scars", "Natural Peach Fuzz"];
export const HAIR_TEXTURE_OPTIONS = ["Auto", "None", "Smooth & Silky", "Wavy & Textured", "Curly & Coiled", "Thick & Voluminous", "Fine & Wispy", "Frizzy & Untamed", "Wet Look", "Braided / Styled", "Graying / Silver Strands"];

export const ENVIRONMENT_TYPES = ["Auto", "None", "Indoor Studio", "Indoor Studio (White BG)", "Indoor Studio (Black BG)", "Indoor Studio (Colored BG)", "Clean Studio (Gradient BG)", "On a Reflective Surface", "On Lush Green Moss", "On a Marble Surface", "On a Wooden Surface", "Submerged in Water", "Outdoor Urban Street", "Outdoor Nature (Forest)", "Outdoor Nature (Beach)", "Cityscape at Night", "Rooftop", "Garden", "Abstract Gradient", "Luxury Interior", "Industrial Warehouse", "Cafe / Restaurant", "Office Setting", "Sci-Fi Landscape", "Party / Event", "Cozy Home Interior", "Train Station Platform", "With/Among People"];
export const LIGHTING_TYPES = ["Auto", "None", "Natural Light", "Natural Sunlight", "Dappled Sunlight", "Golden Hour", "Blue Hour", "Overcast Day", "Softbox Studio", "Studio Product Lighting", "Hard Studio Flash", "Ring Light", "Cinematic Backlight", "Backlit with Glow", "Split Lighting", "Projected Light Patterns", "Gobo Lighting", "Neon Lights", "Candlelight", "Volumetric Lighting", "Hard Contrasting Shadows", "Caustic Reflections", "Night Light"];
export const COLOR_GRADINGS = ["Auto", "None", "Barbie Pink", "Horror (Green/Blue Tint)", "Moody & Dark", "Natural & Earthy", "Film Noir (B&W)", "Vintage Sepia", "Cyberpunk (Neon)", "Pastel Dream", "Vibrant & Saturated", "Teal and Orange", "Wes Anderson Style", "Matrix Green", "Sin City Style"];
export const REALISM_LEVELS = ["Auto", "None", "Photorealistic", "UltraRealistic", "Hyperrealistic", "Historical Realism", "Magic Realism", "Surrealism", "Impressionistic"];
export const PRESENTATION_TYPES = ["Auto", "None", "On Model", "In Model's Hand", "With Model", "Flat Lay", "Laid Straight", "Floating Mockup", "Floating in Mid-Air", "With Ingredient Splash (Water, Cream, Honey)", "On a Pedestal/Podium", "Surrounded by Natural Elements (Flowers, Moss, Wood)", "Minimalist with Hard Shadows", "With Props (Ropes, Fabrics, Geometric shapes)", "Diorama", "Product Grid", "In-Context (e.g., on a table)", "Exploded View", "Lifestyle Scene"];
export const MOOD_TYPES = ["Auto", "None", "Energetic & Vibrant", "Serene & Calm", "Seductive & Alluring", "Intimate & Passionate", "Tender & Loving", "Professional & Clean", "Playful & Whimsical", "Mysterious & Dark", "Romantic & Soft", "Powerful & Confident", "Nostalgic & Retro", "Minimalist & Chic", "Luxurious", "Luxury", "Royale", "Luxury and Royale"];
export const TIME_OF_DAY = ["Auto", "None", "Day", "Afternoon", "Evening", "Night"];
export const AESTHETIC_STYLES = ["Auto", "None", "Glamorous & High Fashion", "Editorial Fashion", "Luxury Skincare Commercial", "Modern Tech Product Ad", "Natural & Organic", "High-Gloss Product Shot", "Avant-Garde", "Edgy & Alternative", "Chic & Minimalist", "Sultry & Evocative", "Sexy & Appealing", "Bold & Dramatic"];
export const PHOTOGRAPHIC_EFFECTS = ["Auto", "None", "Long Exposure Motion Blur", "Ghosting Effect", "Double Exposure", "Cinematic Lens Flare", "Heavy Film Grain", "Light Leaks", "Anamorphic Look"];


export const POSE_TYPES = [
  "Auto",
  "None",
  // --- Single Model: Standing ---
  "Standing Power Pose",
  "Simple Standing (Arms Relaxed)",
  "Crossed Arms (Confident)",
  "One Leg Bent (Relaxed)",
  "Hands in Pockets (Casual/Confident)",
  "Side Profile",
  
  // --- Single Model: Action & Leaning ---
  "Walking Pose (Dynamic)",
  "Leaning Against Wall (Casual)",
  "Action Pose (Running/Dancing)",
  "Jumping (Energetic)",
  "Looking Over Shoulder / Half Turn",
  
  // --- Single Model: Sitting ---
  "Sitting on Floor",
  "Sitting on Chair (Relaxed)",
  "Sitting on Chair (Formal, Straight Back)",
  "Crossed Legs (Casual)",
  "Hands on Knees (Symmetrical)",
  "Leaning Forward (Engaging/Thoughtful)",
  "Crouching/Squatting (Athletic)",
  "Lying Down Elegantly",

  // --- Single Model: Upper Body / Close-Up ---
  "Contemplative/Thinking Pose",
  "Hand on Chin (Thoughtful)",
  "Touching Hair",
  "Folded Hands Near Face",
  
  // --- Couple ---
  "Couple Holding Hands and Walking",
  "Couple Embracing Warmly",
  "Couple in a close embrace",
  "Couple sharing an intimate moment (non-explicit)",
  "Couple Looking at Each Other Lovingly",
  "Couple Back-to-Back",
  "Playful Piggyback Ride",
  "Couple Dancing",
  "Couple Sharing a Laugh",

  // --- Model with Product ---
  "Model Holding Product to Camera",
  "Model Using Product Naturally",
  "Model Interacting with Product",
  "Model Looking at the Product",
  "Unboxing the Product with Excitement",
  "Product as Part of an Outfit (e.g., watch, bag)",
  "Lifestyle: Model with Product in a Scene",
  "Product on a Surface, Model's Hand Nearby",
];

export const MODEL_EXPRESSIONS = [
  "Auto",
  "None",
  "Happy / Joyful",
  "Sad / Melancholic",
  "Angry / Intense",
  "Surprised / Shocked",
  "Fearful / Scared",
  "Disgusted",
  "Contemptuous",
  "Playful / Cheeky",
  "Seductive / Alluring",
  "Bold / Fierce",
  "Confident / Smug",
  "Shy / Coy",
  "Serene / Calm",
  "Moody / Brooding",
  "Whimsical / Dreamy",
  "Determined / Focused",
  "Arrogant / Haughty",
  "Confused / Puzzled",
  "Bored / Indifferent",
  "Excited / Eager",
  "Hopeful / Optimistic",
  "Anxious / Worried",
  "Stern / Serious",
  "Thoughtful / Pensive",
  "Vulnerable",
  "Ecstatic",
  "Mischievous",
  "Innocent",
  "Powerful",
];

export const DESIGN_TRENDS = ["Brutalism", "Nostalgic 90s", "Maximalism", "Glassmorphism", "Claymorphism", "Y2K Aesthetic", "Eco-Friendly Design", "AI-Abstract", "Anti-Design"];

export const ASPECT_RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:2"];

export const PALETTE = {
  green: '#a0eec0',
  cyan: '#23b5d3',
  purple: '#a882dd',
  peach: '#ffc09f',
  yellow: '#ffee93',
};