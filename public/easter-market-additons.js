// ══════════════════════════════════════════════════════════════
//  🥚 EASTER LIMITEDS — paste at the very TOP of the LIMITEDS array
//  in limiteds.js, right after: const LIMITEDS = [
// ══════════════════════════════════════════════════════════════

    // ── 🌌 NORTHERN LIGHTS EGG (Special Egg Hunt Code Item - $10,000) ──
    // Buying this triggers the egg code popup with code: NorthernLights
    { id: 'northern_lights_egg', name: 'Northern Lights Egg', emoji: '🌌', cost: 10000, minValue: 8000, maxValue: 18000, rarity: 'Divine', easter: true, eggCode: 'NorthernLights', eggCodeItem: true },

    // ── ✨ EASTER DIVINE ──
    { id: 'easter_crown', name: 'Easter Crown', emoji: '🪺', cost: 5800, minValue: 4200, maxValue: 12000, rarity: 'Divine', easter: true },

    // ── 🔥 EASTER LEGENDARY ──
    { id: 'golden_easter_egg', name: 'Golden Easter Egg', emoji: '🥚', cost: 3600, minValue: 1600, maxValue: 7200, rarity: 'Legendary', easter: true },
    { id: 'spring_phoenix', name: 'Spring Phoenix', emoji: '🌸', cost: 3400, minValue: 1500, maxValue: 6800, rarity: 'Legendary', easter: true },

    // ── 💜 EASTER EPIC ──
    { id: 'baby_chick_plush', name: 'Baby Chick Plush', emoji: '🐣', cost: 2100, minValue: 750, maxValue: 4200, rarity: 'Epic', easter: true },
    { id: 'easter_bunny_plush', name: 'Easter Bunny Plush', emoji: '🐰', cost: 1900, minValue: 650, maxValue: 3800, rarity: 'Epic', easter: true },

    // ── 💧 EASTER RARE ──
    { id: 'spring_wreath', name: 'Spring Wreath', emoji: '🌷', cost: 1400, minValue: 950, maxValue: 2800, rarity: 'Rare', easter: true },
    { id: 'chocolate_egg', name: 'Chocolate Egg', emoji: '🍫', cost: 1200, minValue: 800, maxValue: 2400, rarity: 'Rare', easter: true },

// ══════════════════════════════════════════════════════════════
//  🥚 EASTER GENERATORS — paste at the very TOP of the GENERATORS array
//  in generators.js, right after: const GENERATORS = [
// ══════════════════════════════════════════════════════════════

    // Easter seasonal generators
    { id: 'easter_egg_factory', name: 'Easter Egg Factory', emoji: '🥚', rarity: 'Common',    baseCost: 4500,  minCost: 2500,  maxCost: 9000,   incomeMin: 130, incomeMax: 210, easter: true },
    { id: 'bunny_warren',       name: 'Bunny Warren',       emoji: '🐰', rarity: 'Rare',      baseCost: 16000, minCost: 9000,  maxCost: 28000,  incomeMin: 290, incomeMax: 390, easter: true },
    { id: 'spring_garden',      name: 'Spring Garden',      emoji: '🌸', rarity: 'Epic',      baseCost: 48000, minCost: 28000, maxCost: 65000,  incomeMin: 510, incomeMax: 630, easter: true },
    { id: 'easter_kingdom',     name: 'Easter Kingdom',     emoji: '🏰', rarity: 'Legendary', baseCost: 82000, minCost: 58000, maxCost: 100000, incomeMin: 820, incomeMax: 970, easter: true },
