// ========================================
// GENERATORS - Passive Income Machines
// Prices fluctuate every hour like babies
// Income paid every 2 minutes
// Max cost: $100,000
// ========================================
const GENERATORS = [

    // COMMON - Cost $2k-$8k | Income $100-$200 per 2min
    { id: 'baby_farm',      name: 'Baby Farm',        emoji: '🌾', rarity: 'Common',    baseCost: 3000,  minCost: 1500,  maxCost: 7000,   incomeMin: 100, incomeMax: 180 },
    { id: 'milk_stand',     name: 'Milk Stand',        emoji: '🥛', rarity: 'Common',    baseCost: 2500,  minCost: 1200,  maxCost: 6000,   incomeMin: 100, incomeMax: 160 },
    { id: 'toy_shop',       name: 'Toy Shop',          emoji: '🧸', rarity: 'Common',    baseCost: 3500,  minCost: 1800,  maxCost: 7500,   incomeMin: 110, incomeMax: 175 },
    { id: 'baby_garden',    name: 'Baby Garden',       emoji: '🌻', rarity: 'Common',    baseCost: 2000,  minCost: 1000,  maxCost: 5000,   incomeMin: 100, incomeMax: 155 },
    { id: 'lemonade_stand', name: 'Lemonade Stand',    emoji: '🍋', rarity: 'Common',    baseCost: 4000,  minCost: 2000,  maxCost: 8000,   incomeMin: 115, incomeMax: 185 },
    { id: 'cookie_bakery',  name: 'Cookie Bakery',     emoji: '🍪', rarity: 'Common',    baseCost: 4500,  minCost: 2200,  maxCost: 8500,   incomeMin: 120, incomeMax: 200 },

    // RARE - Cost $10k-$30k | Income $250-$400 per 2min
    { id: 'baby_factory',   name: 'Baby Factory',      emoji: '🏭', rarity: 'Rare',      baseCost: 15000, minCost: 8000,  maxCost: 28000,  incomeMin: 280, incomeMax: 380 },
    { id: 'aura_distillery',name: 'Aura Distillery',   emoji: '⚗️', rarity: 'Rare',      baseCost: 12000, minCost: 7000,  maxCost: 25000,  incomeMin: 260, incomeMax: 360 },
    { id: 'baby_mine',      name: 'Baby Mine',          emoji: '⛏️', rarity: 'Rare',      baseCost: 18000, minCost: 10000, maxCost: 30000,  incomeMin: 300, incomeMax: 400 },
    { id: 'gem_foundry',    name: 'Gem Foundry',        emoji: '💎', rarity: 'Rare',      baseCost: 20000, minCost: 12000, maxCost: 32000,  incomeMin: 310, incomeMax: 420 },
    { id: 'power_plant',    name: 'Power Plant',        emoji: '⚡', rarity: 'Rare',      baseCost: 14000, minCost: 8000,  maxCost: 26000,  incomeMin: 270, incomeMax: 370 },
    { id: 'cloud_farm',     name: 'Cloud Farm',         emoji: '☁️', rarity: 'Rare',      baseCost: 11000, minCost: 6000,  maxCost: 22000,  incomeMin: 250, incomeMax: 350 },

    // EPIC - Cost $35k-$65k | Income $450-$650 per 2min
    { id: 'aura_forge',     name: 'Aura Forge',         emoji: '🔥', rarity: 'Epic',      baseCost: 50000, minCost: 30000, maxCost: 65000,  incomeMin: 500, incomeMax: 620 },
    { id: 'baby_megafarm',  name: 'Baby Megafarm',      emoji: '🌍', rarity: 'Epic',      baseCost: 42000, minCost: 25000, maxCost: 58000,  incomeMin: 460, incomeMax: 580 },
    { id: 'void_extractor', name: 'Void Extractor',     emoji: '🕳️', rarity: 'Epic',      baseCost: 58000, minCost: 35000, maxCost: 70000,  incomeMin: 540, incomeMax: 650 },
    { id: 'star_harvester', name: 'Star Harvester',     emoji: '⭐', rarity: 'Epic',      baseCost: 55000, minCost: 33000, maxCost: 68000,  incomeMin: 520, incomeMax: 640 },
    { id: 'cosmic_refinery',name: 'Cosmic Refinery',    emoji: '🌌', rarity: 'Epic',      baseCost: 38000, minCost: 22000, maxCost: 55000,  incomeMin: 450, incomeMax: 570 },

    // LEGENDARY - Cost $70k-$100k | Income $700-$1000 per 2min
    { id: 'aura_reactor',   name: 'Aura Reactor',       emoji: '⚛️', rarity: 'Legendary', baseCost: 85000, minCost: 60000, maxCost: 100000, incomeMin: 800, incomeMax: 950 },
    { id: 'baby_empire',    name: 'Baby Empire',         emoji: '🏰', rarity: 'Legendary', baseCost: 75000, minCost: 55000, maxCost: 95000,  incomeMin: 740, incomeMax: 900 },
    { id: 'time_machine',   name: 'Time Machine',        emoji: '⏰', rarity: 'Legendary', baseCost: 95000, minCost: 65000, maxCost: 100000, incomeMin: 840, incomeMax: 975 },
    { id: 'dragon_foundry', name: 'Dragon Foundry',      emoji: '🐉', rarity: 'Legendary', baseCost: 90000, minCost: 62000, maxCost: 100000, incomeMin: 820, incomeMax: 960 },
    { id: 'nebula_engine',  name: 'Nebula Engine',       emoji: '🌠', rarity: 'Legendary', baseCost: 100000,minCost: 70000, maxCost: 100000, incomeMin: 880, incomeMax: 1000 },

    // DIVINE - Cost $85k-$100k | Income $1000-$1500 per 2min
    { id: 'god_factory',    name: 'God Factory',         emoji: '🔱', rarity: 'Divine',    baseCost: 100000,minCost: 80000, maxCost: 100000, incomeMin: 1200, incomeMax: 1500 },
    { id: 'universe_engine',name: 'Universe Engine',     emoji: '🌌', rarity: 'Divine',    baseCost: 95000, minCost: 75000, maxCost: 100000, incomeMin: 1100, incomeMax: 1400 },
    { id: 'infinity_forge', name: 'Infinity Forge',      emoji: '♾️', rarity: 'Divine',    baseCost: 90000, minCost: 70000, maxCost: 100000, incomeMin: 1050, incomeMax: 1350 },
    { id: 'divine_reactor', name: 'Divine Reactor',      emoji: '✨', rarity: 'Divine',    baseCost: 100000,minCost: 82000, maxCost: 100000, incomeMin: 1300, incomeMax: 1500 },
];

if (typeof module !== 'undefined' && module.exports) { module.exports = GENERATORS; }
