// ===================================
// AURABABY MARKET - MULTIPLAYER GAME
// Main React Application
// ===================================

const { useState, useEffect } = React;

const AurababyMarket = () => {
    // ===================================
    // GAME DATA
    // ===================================
    
    // Baby data with images
    const babies = [
        { id: 1, name: 'Aurababy', image: 'https://i.ibb.co/Y4L448c1/aurababy.jpg' },
        { id: 2, name: 'KingDarren', image: 'https://i.ibb.co/1YGkQ5M4/kingdarren.jpg' },
        { id: 3, name: 'Daniel', image: 'https://i.ibb.co/RTwqxcck/daniel.jpg' },
        { id: 4, name: 'Manuel', image: 'https://i.ibb.co/JRr6BWjb/theonewhocknocks.jpg' },
        { id: 5, name: 'Grant', image: 'https://i.ibb.co/TqHnrtSp/grant.jpg' },
        { id: 6, name: 'Joony', image: 'https://i.ibb.co/fd9Kg05w/output.jpg' },
        { id: 7, name: 'Zoely', image: 'https://i.ibb.co/fVLDq186/zoely.png' },
        { id: 8, name: 'Lemmet', image: 'https://i.ibb.co/TBmZmYYh/newlemmet.jpg' },
        { id: 9, name: 'Kelly', image: 'https://i.ibb.co/Xk2DybZg/kelly.jpg' },
        { id: 10, name: 'Bryce', image: 'https://i.ibb.co/pvgyknnq/bryce.jpg' },
        { id: 11, name: 'FattieBaby', image: 'https://i.ibb.co/FkyMMCRv/fattiebaby.jpg' },
        { id: 12, name: 'Goonerbaby', image: 'https://i.ibb.co/b5DH8g26/goonerbaby.jpg' },
        { id: 13, name: 'Teros', image: 'https://i.ibb.co/Nd6v0WjN/teros.jpg' },
        { id: 14, name: 'Darkbaby', image: 'https://i.ibb.co/vCTDWs40/output-1.jpg' },
        { id: 15, name: 'GangstaBaby', image: 'https://i.ibb.co/TM91vD3z/Officalgangstababy.png' },
        { id: 16, name: 'Poorbaby', image: 'https://i.ibb.co/Nn9v6ZBw/poorbaby.jpg' },
        { id: 17, name: 'RichBaby', image: 'https://i.ibb.co/DDSNbypf/richbaby.jpg' },
        { id: 18, name: 'The Baby That Holds Aura', image: 'https://i.ibb.co/Kx8ZSGCB/The-Baby-That-Holds-Aura.jpg' },
        { id: 19, name: 'JollyBaby', image: 'https://i.ibb.co/bgp5mdQZ/jollybaby.png' },
        { id: 20, name: 'CupidBaby', image: 'https://i.ibb.co/1GbNb2PX/Untitled-4.png' },
        { id: 21, name: 'Judgment Baby', image: 'https://i.ibb.co/TqtxsJ52/judgment.jpg' },
        { id: 22, name: 'Justicen', image: 'https://i.ibb.co/dwkHnD65/Justicebaby.jpg' }
    ];

    // 125 Limited Items! (100 original + 25 NEW premium)
    const limitedItems = [
        // Original 100 items ($500-$4000)
        { id: 'cat', name: 'Lucky Cat', emoji: '🐱', cost: 500, minValue: 300, maxValue: 900 },
        { id: 'dog', name: 'Diamond Dog', emoji: '🐶', cost: 600, minValue: 400, maxValue: 1000 },
        { id: 'panda', name: 'Rare Panda', emoji: '🐼', cost: 800, minValue: 500, maxValue: 1300 },
        { id: 'tiger', name: 'Tiger Spirit', emoji: '🐯', cost: 900, minValue: 600, maxValue: 1500 },
        { id: 'lion', name: 'Lion King', emoji: '🦁', cost: 1000, minValue: 700, maxValue: 1700 },
        { id: 'monkey', name: 'Wise Monkey', emoji: '🐵', cost: 550, minValue: 350, maxValue: 950 },
        { id: 'pig', name: 'Golden Pig', emoji: '🐷', cost: 700, minValue: 450, maxValue: 1200 },
        { id: 'frog', name: 'Prince Frog', emoji: '🐸', cost: 650, minValue: 400, maxValue: 1100 },
        { id: 'hamster', name: 'Cute Hamster', emoji: '🐹', cost: 500, minValue: 300, maxValue: 900 },
        { id: 'rabbit', name: 'Moon Rabbit', emoji: '🐰', cost: 750, minValue: 500, maxValue: 1250 },
        { id: 'crown', name: 'Crown Aura', emoji: '👑', cost: 1000, minValue: 700, maxValue: 1700 },
        { id: 'fire', name: 'Fire Essence', emoji: '🔥', cost: 1500, minValue: 1000, maxValue: 2500 },
        { id: 'lightning', name: 'Lightning Power', emoji: '⚡', cost: 1800, minValue: 1200, maxValue: 3000 },
        { id: 'star', name: 'Star Collector', emoji: '🌟', cost: 2000, minValue: 1500, maxValue: 3500 },
        { id: 'paint', name: 'Rare Paint', emoji: '🎨', cost: 1200, minValue: 800, maxValue: 2000 },
        { id: 'mask', name: 'Mystery Mask', emoji: '🎭', cost: 1600, minValue: 1100, maxValue: 2800 },
        { id: 'music', name: 'Music Note', emoji: '🎵', cost: 1300, minValue: 900, maxValue: 2200 },
        { id: 'magic', name: 'Magic Wand', emoji: '🪄', cost: 1700, minValue: 1200, maxValue: 2900 },
        { id: 'crystal', name: 'Crystal Ball', emoji: '🔮', cost: 1900, minValue: 1400, maxValue: 3200 },
        { id: 'rocket', name: 'Space Rocket', emoji: '🚀', cost: 1500, minValue: 1000, maxValue: 2500 },
        { id: 'diamond', name: 'Diamond Baby', emoji: '💎', cost: 2500, minValue: 2000, maxValue: 4000 },
        { id: 'trophy', name: 'Trophy Gold', emoji: '🏆', cost: 3000, minValue: 2500, maxValue: 5000 },
        { id: 'unicorn', name: 'Unicorn Spirit', emoji: '🦄', cost: 2200, minValue: 1700, maxValue: 3800 },
        { id: 'rainbow', name: 'Rainbow Aura', emoji: '🌈', cost: 2800, minValue: 2200, maxValue: 4500 },
        { id: 'dragon', name: 'Dragon Power', emoji: '🐉', cost: 3500, minValue: 3000, maxValue: 5500 },
        { id: 'gem', name: 'Ruby Gem', emoji: '💍', cost: 2700, minValue: 2100, maxValue: 4300 },
        { id: 'castle', name: 'Royal Castle', emoji: '🏰', cost: 3200, minValue: 2700, maxValue: 5200 },
        { id: 'alien', name: 'Alien Tech', emoji: '👽', cost: 2900, minValue: 2400, maxValue: 4700 },
        { id: 'robot', name: 'Robot Future', emoji: '🤖', cost: 2600, minValue: 2000, maxValue: 4200 },
        { id: 'phoenix', name: 'Phoenix Rising', emoji: '🦅', cost: 3300, minValue: 2800, maxValue: 5300 },
        { id: 'pizza', name: 'Pizza Paradise', emoji: '🍕', cost: 800, minValue: 500, maxValue: 1300 },
        { id: 'burger', name: 'Burger King', emoji: '🍔', cost: 750, minValue: 450, maxValue: 1250 },
        { id: 'sushi', name: 'Sushi Master', emoji: '🍣', cost: 1100, minValue: 700, maxValue: 1800 },
        { id: 'cake', name: 'Birthday Cake', emoji: '🎂', cost: 900, minValue: 600, maxValue: 1500 },
        { id: 'donut', name: 'Sweet Donut', emoji: '🍩', cost: 650, minValue: 400, maxValue: 1100 },
        { id: 'icecream', name: 'Ice Cream', emoji: '🍦', cost: 700, minValue: 450, maxValue: 1200 },
        { id: 'cookie', name: 'Magic Cookie', emoji: '🍪', cost: 600, minValue: 350, maxValue: 1000 },
        { id: 'candy', name: 'Rare Candy', emoji: '🍬', cost: 550, minValue: 300, maxValue: 950 },
        { id: 'watermelon', name: 'Summer Melon', emoji: '🍉', cost: 850, minValue: 550, maxValue: 1400 },
        { id: 'strawberry', name: 'Berry Sweet', emoji: '🍓', cost: 700, minValue: 400, maxValue: 1200 },
        { id: 'key', name: 'Golden Key', emoji: '🔑', cost: 1400, minValue: 1000, maxValue: 2300 },
        { id: 'lock', name: 'Ancient Lock', emoji: '🔒', cost: 1300, minValue: 900, maxValue: 2200 },
        { id: 'bomb', name: 'Boom Bomb', emoji: '💣', cost: 1100, minValue: 700, maxValue: 1900 },
        { id: 'gift', name: 'Mystery Gift', emoji: '🎁', cost: 1500, minValue: 1000, maxValue: 2500 },
        { id: 'balloon', name: 'Party Balloon', emoji: '🎈', cost: 600, minValue: 350, maxValue: 1000 },
        { id: 'dice', name: 'Lucky Dice', emoji: '🎲', cost: 900, minValue: 600, maxValue: 1500 },
        { id: 'magnify', name: 'Magnifier', emoji: '🔍', cost: 800, minValue: 500, maxValue: 1300 },
        { id: 'scissors', name: 'Gold Scissors', emoji: '✂️', cost: 750, minValue: 450, maxValue: 1250 },
        { id: 'hammer', name: 'Thor Hammer', emoji: '🔨', cost: 1200, minValue: 800, maxValue: 2000 },
        { id: 'wrench', name: 'Master Wrench', emoji: '🔧', cost: 950, minValue: 600, maxValue: 1600 },
        { id: 'soccer', name: 'Soccer Star', emoji: '⚽', cost: 1100, minValue: 700, maxValue: 1800 },
        { id: 'basketball', name: 'Hoop Dreams', emoji: '🏀', cost: 1200, minValue: 800, maxValue: 2000 },
        { id: 'football', name: 'Football Pro', emoji: '🏈', cost: 1150, minValue: 750, maxValue: 1900 },
        { id: 'tennis', name: 'Tennis Ace', emoji: '🎾', cost: 1000, minValue: 650, maxValue: 1700 },
        { id: 'baseball', name: 'Home Run', emoji: '⚾', cost: 1050, minValue: 700, maxValue: 1750 },
        { id: 'bowling', name: 'Strike King', emoji: '🎳', cost: 900, minValue: 600, maxValue: 1500 },
        { id: 'golf', name: 'Golf Master', emoji: '⛳', cost: 1300, minValue: 900, maxValue: 2200 },
        { id: 'ski', name: 'Ski Champion', emoji: '⛷️', cost: 1400, minValue: 1000, maxValue: 2300 },
        { id: 'surf', name: 'Wave Rider', emoji: '🏄', cost: 1250, minValue: 850, maxValue: 2100 },
        { id: 'bike', name: 'Speed Bike', emoji: '🚴', cost: 1100, minValue: 700, maxValue: 1850 },
        { id: 'sun', name: 'Sunny Day', emoji: '☀️', cost: 1600, minValue: 1100, maxValue: 2700 },
        { id: 'moon', name: 'Moon Light', emoji: '🌙', cost: 1700, minValue: 1200, maxValue: 2900 },
        { id: 'cloud', name: 'Cloud Nine', emoji: '☁️', cost: 800, minValue: 500, maxValue: 1300 },
        { id: 'snow', name: 'Snowflake', emoji: '❄️', cost: 1000, minValue: 650, maxValue: 1700 },
        { id: 'thunder', name: 'Thunder Storm', emoji: '⛈️', cost: 1500, minValue: 1000, maxValue: 2500 },
        { id: 'tornado', name: 'Tornado Spin', emoji: '🌪️', cost: 1800, minValue: 1300, maxValue: 3000 },
        { id: 'ocean', name: 'Ocean Wave', emoji: '🌊', cost: 1400, minValue: 950, maxValue: 2400 },
        { id: 'volcano', name: 'Volcano Blast', emoji: '🌋', cost: 2000, minValue: 1500, maxValue: 3300 },
        { id: 'earth', name: 'Planet Earth', emoji: '🌍', cost: 2500, minValue: 2000, maxValue: 4000 },
        { id: 'comet', name: 'Comet Tail', emoji: '☄️', cost: 2200, minValue: 1700, maxValue: 3700 },
        { id: 'heart', name: 'Love Heart', emoji: '❤️', cost: 1200, minValue: 800, maxValue: 2000 },
        { id: 'sparkle', name: 'Sparkle Shine', emoji: '✨', cost: 1100, minValue: 700, maxValue: 1850 },
        { id: 'check', name: 'Check Mark', emoji: '✅', cost: 900, minValue: 600, maxValue: 1500 },
        { id: 'cross', name: 'Red Cross', emoji: '❌', cost: 850, minValue: 550, maxValue: 1400 },
        { id: 'warn', name: 'Warning Sign', emoji: '⚠️', cost: 950, minValue: 600, maxValue: 1600 },
        { id: 'recycle', name: 'Eco Recycle', emoji: '♻️', cost: 1000, minValue: 650, maxValue: 1700 },
        { id: 'peace', name: 'Peace Sign', emoji: '☮️', cost: 1300, minValue: 900, maxValue: 2200 },
        { id: 'infinity', name: 'Infinity Loop', emoji: '♾️', cost: 2100, minValue: 1600, maxValue: 3600 },
        { id: 'atom', name: 'Atom Power', emoji: '⚛️', cost: 1900, minValue: 1400, maxValue: 3200 },
        { id: 'yin', name: 'Yin Yang', emoji: '☯️', cost: 1800, minValue: 1300, maxValue: 3000 },
        { id: 'rose', name: 'Red Rose', emoji: '🌹', cost: 1100, minValue: 700, maxValue: 1850 },
        { id: 'tulip', name: 'Tulip Bloom', emoji: '🌷', cost: 1000, minValue: 650, maxValue: 1700 },
        { id: 'sunflower', name: 'Sunflower', emoji: '🌻', cost: 950, minValue: 600, maxValue: 1600 },
        { id: 'cherry', name: 'Cherry Blossom', emoji: '🌸', cost: 1200, minValue: 800, maxValue: 2000 },
        { id: 'bouquet', name: 'Flower Bouquet', emoji: '💐', cost: 1300, minValue: 900, maxValue: 2200 },
        { id: 'cactus', name: 'Desert Cactus', emoji: '🌵', cost: 800, minValue: 500, maxValue: 1300 },
        { id: 'tree', name: 'Life Tree', emoji: '🌳', cost: 1400, minValue: 1000, maxValue: 2300 },
        { id: 'palm', name: 'Palm Tree', emoji: '🌴', cost: 1100, minValue: 700, maxValue: 1850 },
        { id: 'leaf', name: 'Lucky Leaf', emoji: '🍀', cost: 900, minValue: 600, maxValue: 1500 },
        { id: 'maple', name: 'Maple Leaf', emoji: '🍁', cost: 950, minValue: 625, maxValue: 1600 },
        { id: 'computer', name: 'Super Computer', emoji: '💻', cost: 1500, minValue: 1000, maxValue: 2500 },
        { id: 'phone', name: 'Smart Phone', emoji: '📱', cost: 1200, minValue: 800, maxValue: 2000 },
        { id: 'camera', name: 'Pro Camera', emoji: '📷', cost: 1300, minValue: 900, maxValue: 2200 },
        { id: 'battery', name: 'Power Battery', emoji: '🔋', cost: 1000, minValue: 650, maxValue: 1700 },
        { id: 'satellite', name: 'Satellite', emoji: '🛰️', cost: 2000, minValue: 1500, maxValue: 3300 },
        { id: 'ufo', name: 'UFO Ship', emoji: '🛸', cost: 2400, minValue: 1900, maxValue: 3900 },
        { id: 'game', name: 'Game Console', emoji: '🎮', cost: 1400, minValue: 1000, maxValue: 2300 },
        { id: 'joystick', name: 'Joystick Pro', emoji: '🕹️', cost: 1100, minValue: 700, maxValue: 1850 },
        { id: 'dvd', name: 'Retro DVD', emoji: '💿', cost: 800, minValue: 500, maxValue: 1300 },
        { id: 'vr', name: 'VR Goggles', emoji: '🥽', cost: 1800, minValue: 1300, maxValue: 3000 },

        // NEW! 25 PREMIUM LIMITED ITEMS ($10k-$100k+)
        // Legendary Tier ($10k-$20k)
        { id: 'cybergod', name: 'Cyber God', emoji: '👾', cost: 15000, minValue: 10000, maxValue: 25000, tier: 'legendary' },
        { id: 'retroconsole', name: 'Retro Console', emoji: '🎮', cost: 12000, minValue: 8000, maxValue: 20000, tier: 'legendary' },
        { id: 'bullseye', name: 'Bullseye Master', emoji: '🎯', cost: 11000, minValue: 7500, maxValue: 18000, tier: 'legendary' },
        { id: 'circus', name: 'Circus Tent', emoji: '🎪', cost: 13500, minValue: 9000, maxValue: 22000, tier: 'legendary' },
        { id: 'ferris', name: 'Ferris Wheel', emoji: '🎡', cost: 14500, minValue: 9500, maxValue: 23000, tier: 'legendary' },
        { id: 'coaster', name: 'Rollercoaster', emoji: '🎢', cost: 16000, minValue: 11000, maxValue: 26000, tier: 'legendary' },
        { id: 'shield', name: 'Knight Shield', emoji: '🛡️', cost: 11500, minValue: 8000, maxValue: 19000, tier: 'legendary' },
        { id: 'excalibur', name: 'Excalibur Sword', emoji: '⚔️', cost: 17000, minValue: 12000, maxValue: 28000, tier: 'legendary' },
        { id: 'bow', name: 'Archer Bow', emoji: '🏹', cost: 12500, minValue: 8500, maxValue: 20000, tier: 'legendary' },
        { id: 'trident', name: 'Poseidon Trident', emoji: '🔱', cost: 18000, minValue: 13000, maxValue: 30000, tier: 'legendary' },

        // Mythic Tier ($20k-$40k)
        { id: 'galaxycore', name: 'Galaxy Core', emoji: '🌌', cost: 25000, minValue: 18000, maxValue: 40000, tier: 'mythic' },
        { id: 'zeusbolt', name: 'Zeus Bolt', emoji: '⚡', cost: 35000, minValue: 25000, maxValue: 55000, tier: 'mythic' },
        { id: 'shootingstar', name: 'Shooting Star', emoji: '🌠', cost: 28000, minValue: 20000, maxValue: 45000, tier: 'mythic' },
        { id: 'timevortex', name: 'Time Vortex', emoji: '🌀', cost: 32000, minValue: 23000, maxValue: 50000, tier: 'mythic' },
        { id: 'nebula', name: 'Nebula Cloud', emoji: '💫', cost: 30000, minValue: 22000, maxValue: 48000, tier: 'mythic' },
        { id: 'saturn', name: 'Saturn Rings', emoji: '🪐', cost: 27000, minValue: 19000, maxValue: 43000, tier: 'mythic' },
        { id: 'moongoddess', name: 'Moon Goddess', emoji: '🌙', cost: 33000, minValue: 24000, maxValue: 52000, tier: 'mythic' },
        { id: 'meteorstrike', name: 'Meteor Strike', emoji: '☄️', cost: 38000, minValue: 28000, maxValue: 60000, tier: 'mythic' },

        // Cosmic Tier ($40k-$75k)
        { id: 'phoenixrebirth', name: 'Phoenix Rebirth', emoji: '🔥', cost: 50000, minValue: 35000, maxValue: 80000, tier: 'cosmic' },
        { id: 'supernova', name: 'Supernova', emoji: '⭐', cost: 55000, minValue: 40000, maxValue: 88000, tier: 'cosmic' },
        { id: 'northstar', name: 'North Star', emoji: '🌟', cost: 60000, minValue: 45000, maxValue: 95000, tier: 'cosmic' },
        { id: 'bigbang', name: 'Big Bang', emoji: '💥', cost: 65000, minValue: 48000, maxValue: 100000, tier: 'cosmic' },
        { id: 'fireworks', name: 'Firework Show', emoji: '🎆', cost: 45000, minValue: 32000, maxValue: 72000, tier: 'cosmic' },

        // Divine Tier ($75k-$100k+)
        { id: 'cosmicentity', name: 'Cosmic Entity', emoji: '💫', cost: 75000, minValue: 55000, maxValue: 120000, tier: 'divine' },
        { id: 'divinecrown', name: 'Divine Crown', emoji: '🌟', cost: 100000, minValue: 75000, maxValue: 150000, tier: 'divine' }
    ];

    // ===================================
    // STATE MANAGEMENT
    // ===================================
    
    // Load initial state from Firebase-loaded data
    const [money, setMoney] = useState(window.gameState.money);
    const [username, setUsername] = useState(window.gameState.username);
    const [portfolio, setPortfolio] = useState(window.gameState.portfolio);
    const [limitedInventory, setLimitedInventory] = useState(window.gameState.limitedInventory);
    const [limitedMintCounts, setLimitedMintCounts] = useState(window.gameState.limitedMintCounts);
    const [tradeHistory, setTradeHistory] = useState(window.gameState.tradeHistory);
    const [highestMoney, setHighestMoney] = useState(window.gameState.highestMoney);
    const [highestNetWorth, setHighestNetWorth] = useState(window.gameState.highestNetWorth);
    
    // Price state (SYNCHRONIZED GLOBALLY)
    const [prices, setPrices] = useState(() => {
        const p = {};
        babies.forEach(baby => { p[baby.id] = 150; });
        return p;
    });
    
    const [priceHistory, setPriceHistory] = useState(() => {
        const history = {};
        babies.forEach(baby => { history[baby.id] = [{ time: Date.now(), price: 150 }]; });
        return history;
    });
    
    const [limitedValues, setLimitedValues] = useState(() => {
        const values = {};
        limitedItems.forEach(item => {
            values[item.id] = (item.minValue + item.maxValue) / 2;
        });
        return values;
    });
    
    // Projected babies
    const [projectedBabies, setProjectedBabies] = useState([]);
    const [projectedEndTimes, setProjectedEndTimes] = useState({});
    
    // Timers
    const [timeUntilIncome, setTimeUntilIncome] = useState(90);
    const [timeUntilPriceChange, setTimeUntilPriceChange] = useState(1800);
    
    // UI state
    const [currentView, setCurrentView] = useState('market');
    const [selectedBaby, setSelectedBaby] = useState(null);
    const [tradeHistoryTab, setTradeHistoryTab] = useState('all');
    
    // Multiplayer state (NEW!)
    const [leaderboard, setLeaderboard] = useState([]);
    const [tradeAds, setTradeAds] = useState([]);
    const [showPostAdModal, setShowPostAdModal] = useState(false);
    const [selectedAd, setSelectedAd] = useState(null);

    // ===================================
    // SYNC STATE WITH FIREBASE
    // ===================================
    
    useEffect(() => {
        window.gameState.money = money;
        window.gameState.portfolio = portfolio;
        window.gameState.limitedInventory = limitedInventory;
        window.gameState.limitedMintCounts = limitedMintCounts;
        window.gameState.tradeHistory = tradeHistory;
        window.gameState.highestMoney = highestMoney;
        window.gameState.highestNetWorth = highestNetWorth;
        window.gameState.username = username;
    }, [money, portfolio, limitedInventory, limitedMintCounts, tradeHistory, highestMoney, highestNetWorth, username]);

    // Update records
    useEffect(() => {
        if (money > highestMoney) setHighestMoney(money);
        const netWorth = money + getPortfolioValue();
        if (netWorth > highestNetWorth) setHighestNetWorth(netWorth);
    }, [money, portfolio, limitedInventory, limitedValues, prices]);

    // ===================================
    // HELPER FUNCTIONS
    // ===================================
    
    const getPortfolioValue = () => {
        let total = 0;
        Object.keys(portfolio).forEach(babyId => {
            const quantity = portfolio[babyId];
            const price = prices[babyId];
            total += quantity * price;
        });
        Object.keys(limitedInventory).forEach(itemId => {
            const items = limitedInventory[itemId];
            const currentValue = limitedValues[itemId];
            total += items.length * currentValue;
        });
        return Math.round(total * 100) / 100;
    };

    const getPriceChangeColor = (babyId) => {
        const history = priceHistory[babyId];
        if (!history || history.length < 2) return 'black';
        const current = history[history.length - 1].price;
        const previous = history[history.length - 2].price;
        if (current > previous) return 'green';
        if (current < previous) return 'red';
        return 'black';
    };

    const getTierColor = (tier) => {
        switch(tier) {
            case 'legendary': return 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)';
            case 'mythic': return 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)';
            case 'cosmic': return 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)';
            case 'divine': return 'linear-gradient(135deg, #f1c40f 0%, #f39c12 100%)';
            default: return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }
    };

    const getTierBadge = (tier) => {
        switch(tier) {
            case 'legendary': return '⭐ LEGENDARY';
            case 'mythic': return '💜 MYTHIC';
            case 'cosmic': return '🌌 COSMIC';
            case 'divine': return '✨ DIVINE';
            default: return 'LIMITED';
        }
    };

    const getAchievements = () => {
        const achievements = [];
        if (tradeHistory.length > 0) achievements.push({ icon: '✅', name: 'First Trade', desc: 'Made your first trade' });
        if (highestMoney >= 1000000) achievements.push({ icon: '💰', name: 'Millionaire', desc: 'Reached $1,000,000 cash' });
        if (tradeHistory.length >= 100) achievements.push({ icon: '📈', name: '100 Trades', desc: 'Completed 100 trades' });
        
        const totalLimiteds = Object.values(limitedInventory).reduce((sum, arr) => sum + arr.length, 0);
        if (totalLimiteds >= 10) achievements.push({ icon: '💎', name: 'Collector', desc: 'Own 10+ limiteds' });
        
        const totalBabies = Object.values(portfolio).reduce((sum, qty) => sum + qty, 0);
        if (totalBabies >= 50) achievements.push({ icon: '🐋', name: 'Whale', desc: 'Own 50+ babies' });
        
        return achievements;
    };

    const getFilteredTrades = () => {
        switch(tradeHistoryTab) {
            case 'babies':
                return tradeHistory.filter(t => t.type.includes('BABY'));
            case 'limiteds':
                return tradeHistory.filter(t => t.type.includes('LIMITED'));
            default:
                return tradeHistory;
        }
    };

    // ===================================
    // TRADING FUNCTIONS
    // ===================================
    
    const buyBaby = (babyId, babyPrice) => {
        if (money >= babyPrice) {
            setMoney(prev => prev - babyPrice);
            setPortfolio(prev => ({ ...prev, [babyId]: (prev[babyId] || 0) + 1 }));
            
            const baby = babies.find(b => b.id === babyId);
            setTradeHistory(prev => [{
                id: Date.now(),
                type: 'BUY_BABY',
                babyName: baby.name,
                babyId: babyId,
                price: babyPrice,
                quantity: 1,
                timestamp: new Date().toLocaleString()
            }, ...prev]);
            
            saveGameData();
            updateLeaderboard();
        } else {
            alert("Not enough money!");
        }
    };

    const sellBaby = (babyId, babyPrice) => {
        if (portfolio[babyId] && portfolio[babyId] > 0) {
            setMoney(prev => prev + babyPrice);
            setPortfolio(prev => ({ ...prev, [babyId]: prev[babyId] - 1 }));
            
            const baby = babies.find(b => b.id === babyId);
            setTradeHistory(prev => [{
                id: Date.now(),
                type: 'SELL_BABY',
                babyName: baby.name,
                babyId: babyId,
                price: babyPrice,
                quantity: 1,
                timestamp: new Date().toLocaleString()
            }, ...prev]);
            
            saveGameData();
            updateLeaderboard();
        }
    };

    const sellAllBabies = () => {
        let totalEarned = 0;
        const soldBabies = [];
        
        Object.keys(portfolio).forEach(babyId => {
            const quantity = portfolio[babyId];
            if (quantity > 0) {
                const baby = babies.find(b => b.id === parseInt(babyId));
                const currentPrice = prices[babyId];
                const earnings = quantity * currentPrice;
                totalEarned += earnings;
                soldBabies.push({ baby, quantity, price: currentPrice });
            }
        });

        if (totalEarned > 0) {
            setMoney(prev => prev + totalEarned);
            setPortfolio({});
            
            soldBabies.forEach(({ baby, quantity, price }) => {
                setTradeHistory(prev => [{
                    id: Date.now() + Math.random(),
                    type: 'SELL_ALL',
                    babyName: baby.name,
                    babyId: baby.id,
                    price: price,
                    quantity: quantity,
                    timestamp: new Date().toLocaleString()
                }, ...prev]);
            });

            saveGameData();
            updateLeaderboard();
            alert(`Sold all babies for $${totalEarned.toFixed(2)}!`);
        } else {
            alert("You don't own any babies to sell!");
        }
    };

    const buyLimited = (itemId) => {
        const item = limitedItems.find(i => i.id === itemId);
        if (!item) return;

        if (money >= item.cost) {
            const currentCount = limitedMintCounts[itemId] || 0;
            const serialNumber = currentCount + 1;

            setMoney(prev => prev - item.cost);
            setLimitedMintCounts(prev => ({ ...prev, [itemId]: serialNumber }));
            setLimitedInventory(prev => ({
                ...prev,
                [itemId]: [...(prev[itemId] || []), { serialNumber, purchasePrice: item.cost }]
            }));

            setTradeHistory(prev => [{
                id: Date.now(),
                type: 'BUY_LIMITED',
                babyName: `${item.emoji} ${item.name} #${serialNumber}`,
                babyId: itemId,
                price: item.cost,
                quantity: 1,
                timestamp: new Date().toLocaleString()
            }, ...prev]);
            
            saveGameData();
            updateLeaderboard();
        } else {
            alert("Not enough money!");
        }
    };

    const sellLimited = (itemId, serialNumber) => {
        const item = limitedItems.find(i => i.id === itemId);
        const currentValue = limitedValues[itemId];

        setMoney(prev => prev + currentValue);
        setLimitedInventory(prev => ({
            ...prev,
            [itemId]: prev[itemId].filter(i => i.serialNumber !== serialNumber)
        }));

        setTradeHistory(prev => [{
            id: Date.now(),
            type: 'SELL_LIMITED',
            babyName: `${item.emoji} ${item.name} #${serialNumber}`,
            babyId: itemId,
            price: currentValue,
            quantity: 1,
            timestamp: new Date().toLocaleString()
        }, ...prev]);
        
        saveGameData();
        updateLeaderboard();
    };

    // ===================================
    // MULTIPLAYER FUNCTIONS (NEW!)
    // ===================================
    
    const updateLeaderboard = async () => {
        if (!currentUser) return;
        
        try {
            const netWorth = money + getPortfolioValue();
            const totalBabies = Object.values(portfolio).reduce((sum, qty) => sum + qty, 0);
            const totalLimiteds = Object.values(limitedInventory).reduce((sum, arr) => sum + arr.length, 0);
            
            await db.collection('leaderboard').doc(currentUser.uid).set({
                username: username,
                netWorth: netWorth,
                totalTrades: tradeHistory.length,
                babiesOwned: totalBabies,
                limitedsOwned: totalLimiteds,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Leaderboard update failed:', error);
        }
    };

    const loadLeaderboard = async () => {
        try {
            const snapshot = await db.collection('leaderboard')
                .orderBy('netWorth', 'desc')
                .limit(10)
                .get();
            
            const leaders = [];
            snapshot.forEach(doc => {
                leaders.push({ id: doc.id, ...doc.data() });
            });
            
            setLeaderboard(leaders);
        } catch (error) {
            console.error('Load leaderboard failed:', error);
        }
    };

    const loadTradeAds = async () => {
        try {
            const snapshot = await db.collection('tradeAds')
                .where('status', '==', 'active')
                .orderBy('createdAt', 'desc')
                .limit(50)
                .get();
            
            const ads = [];
            snapshot.forEach(doc => {
                ads.push({ id: doc.id, ...doc.data() });
            });
            
            setTradeAds(ads);
        } catch (error) {
            console.error('Load trade ads failed:', error);
        }
    };

    const syncGlobalPrices = async () => {
        try {
            // Try to load global prices
            const priceDoc = await db.collection('globalPrices').doc('current').get();
            
            if (priceDoc.exists) {
                const data = priceDoc.data();
                setPrices(data.babyPrices || prices);
                setLimitedValues(data.limitedValues || limitedValues);
                setProjectedBabies(data.projectedBabies || []);
            } else {
                // Initialize global prices (first player)
                await saveGlobalPrices();
            }
        } catch (error) {
            console.error('Sync prices failed:', error);
        }
    };

    const saveGlobalPrices = async () => {
        try {
            await db.collection('globalPrices').doc('current').set({
                babyPrices: prices,
                limitedValues: limitedValues,
                projectedBabies: projectedBabies,
                lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Save global prices failed:', error);
        }
    };

    // ===================================
    // TIMERS & UPDATES
    // ===================================
    
    // Income timer (90 seconds)
    useEffect(() => {
        const incomeTimer = setInterval(() => {
            setMoney(prev => prev + 200);
            setTimeUntilIncome(90);
        }, 90000);

        const countdown = setInterval(() => {
            setTimeUntilIncome(prev => prev > 0 ? prev - 1 : 90);
        }, 1000);

        return () => {
            clearInterval(incomeTimer);
            clearInterval(countdown);
        };
    }, []);

    // Price change countdown
    useEffect(() => {
        const countdown = setInterval(() => {
            setTimeUntilPriceChange(prev => prev <= 1 ? 1800 : prev - 1);
        }, 1000);
        return () => clearInterval(countdown);
    }, []);

    // Projected baby manager (rare - 5% every 5 min)
    useEffect(() => {
        const projectInterval = setInterval(() => {
            if (Math.random() < 0.05) {
                const randomBaby = babies[Math.floor(Math.random() * babies.length)];
                const duration = 300000 + Math.random() * 300000; // 5-10 minutes
                const endTime = Date.now() + duration;
                
                setProjectedBabies(prev => {
                    if (!prev.includes(randomBaby.id)) {
                        return [...prev, randomBaby.id];
                    }
                    return prev;
                });
                
                setProjectedEndTimes(prev => ({ ...prev, [randomBaby.id]: endTime }));
            }
        }, 300000); // Check every 5 minutes
        return () => clearInterval(projectInterval);
    }, []);

    // Remove expired projected babies
    useEffect(() => {
        const checkInterval = setInterval(() => {
            const now = Date.now();
            setProjectedBabies(prev => {
                return prev.filter(babyId => {
                    const endTime = projectedEndTimes[babyId];
                    return endTime && endTime > now;
                });
            });
        }, 1000);
        return () => clearInterval(checkInterval);
    }, [projectedEndTimes]);

    // Price fluctuation every 30 minutes (SAVES TO FIREBASE!)
    useEffect(() => {
        const priceInterval = setInterval(async () => {
            setPrices(prevPrices => {
                const newPrices = { ...prevPrices };
                babies.forEach(baby => {
                    const isProjected = projectedBabies.includes(baby.id);
                    let changePercent;
                    
                    if (isProjected) {
                        changePercent = Math.random() * -0.20 - 0.05; // -5% to -25%
                    } else {
                        changePercent = (Math.random() * 0.3 - 0.15); // -15% to +15%
                    }
                    
                    const priceChange = newPrices[baby.id] * changePercent;
                    let newPrice = newPrices[baby.id] + priceChange;
                    if (newPrice < 10) newPrice = 10;
                    newPrices[baby.id] = Math.round(newPrice * 100) / 100;
                });
                return newPrices;
            });

            setLimitedValues(prevValues => {
                const newValues = { ...prevValues };
                limitedItems.forEach(item => {
                    const changePercent = (Math.random() * 0.2 - 0.1); // -10% to +10%
                    const valueChange = newValues[item.id] * changePercent;
                    let newValue = newValues[item.id] + valueChange;
                    if (newValue < item.minValue) newValue = item.minValue;
                    if (newValue > item.maxValue) newValue = item.maxValue;
                    newValues[item.id] = Math.round(newValue * 100) / 100;
                });
                return newValues;
            });

            setTimeUntilPriceChange(1800);
            
            // SAVE TO FIREBASE!
            await saveGlobalPrices();
        }, 1800000); // 30 minutes

        return () => clearInterval(priceInterval);
    }, [projectedBabies]);

    // Update price history
    useEffect(() => {
        setPriceHistory(prevHistory => {
            const newHistory = { ...prevHistory };
            babies.forEach(baby => {
                const currentHistory = newHistory[baby.id] || [];
                newHistory[baby.id] = [
                    ...currentHistory,
                    { time: Date.now(), price: prices[baby.id] }
                ].slice(-50);
            });
            return newHistory;
        });
    }, [prices]);

    // Load leaderboard on mount & refresh every 30 seconds
    useEffect(() => {
        if (currentView === 'leaderboard') {
            loadLeaderboard();
            const interval = setInterval(loadLeaderboard, 30000);
            return () => clearInterval(interval);
        }
    }, [currentView]);

    // Load trade ads when viewing trade hub
    useEffect(() => {
        if (currentView === 'tradehub') {
            loadTradeAds();
            const interval = setInterval(loadTradeAds, 30000);
            return () => clearInterval(interval);
        }
    }, [currentView]);

    // Sync global prices on mount
    useEffect(() => {
        syncGlobalPrices();
        const interval = setInterval(syncGlobalPrices, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    // Continue with views in next part...

    // ===================================
    // RENDER - MAIN UI
    // ===================================
    
    return (
        <div style={{ display: 'flex' }}>
            {/* Sidebar */}
            <div className="sidebar">
                <h2>💰 Aurababy Market</h2>
                
                <div className="sidebar-stats">
                    <div>
                        <strong>User:</strong><br/>{username}
                    </div>
                    <div>
                        <strong>Cash:</strong><br/>${money.toLocaleString()}
                    </div>
                    <div>
                        <strong>Portfolio:</strong><br/>${getPortfolioValue().toLocaleString()}
                    </div>
                    <div>
                        <strong>Net Worth:</strong><br/>${(money + getPortfolioValue()).toLocaleString()}
                    </div>
                    <div className="sidebar-timer">
                        Income: {Math.floor(timeUntilIncome / 60)}:{(timeUntilIncome % 60).toString().padStart(2, '0')}
                    </div>
                    <div style={{ fontSize: '12px', color: '#3498db', marginTop: '5px' }}>
                        Prices: {Math.floor(timeUntilPriceChange / 60)}m {timeUntilPriceChange % 60}s
                    </div>
                    {projectedBabies.length > 0 && (
                        <div style={{ fontSize: '11px', color: '#f39c12', marginTop: '5px' }}>
                            ⚠️ {projectedBabies.length} Projected!
                        </div>
                    )}
                </div>

                <button onClick={() => setCurrentView('market')} 
                    className={`nav-button ${currentView === 'market' ? 'active' : ''}`}>
                    🏪 Market
                </button>
                
                <button onClick={() => setCurrentView('store')} 
                    className={`nav-button ${currentView === 'store' ? 'active' : ''}`}>
                    🛒 Limited Store
                </button>
                
                <button onClick={() => setCurrentView('portfolio')} 
                    className={`nav-button ${currentView === 'portfolio' ? 'active' : ''}`}>
                    📊 Portfolio
                </button>
                
                <button onClick={() => setCurrentView('trades')} 
                    className={`nav-button ${currentView === 'trades' ? 'active' : ''}`}>
                    📜 Trades ({tradeHistory.length})
                </button>
                
                <button onClick={() => setCurrentView('profile')} 
                    className={`nav-button ${currentView === 'profile' ? 'active' : ''}`}>
                    👤 Profile
                </button>
                
                <button onClick={() => setCurrentView('leaderboard')} 
                    className={`nav-button ${currentView === 'leaderboard' ? 'active' : ''}`}>
                    🏆 Leaderboard
                </button>
                
                <button onClick={() => setCurrentView('tradehub')} 
                    className={`nav-button ${currentView === 'tradehub' ? 'active' : ''}`}>
                    📢 Trade Hub
                </button>
                
                <button onClick={logoutUser} className="nav-button logout-button">
                    🚪 Logout
                </button>
                
                <div className="sidebar-footer">
                    Auto-saves every 30s<br/>
                    Multiplayer Enabled!<br/>
                    125 Limited Items!
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                {/* Market View */}
                {currentView === 'market' && (
                    <div>
                        <h1 className="view-title">🏪 Baby Market</h1>
                        <p className="view-subtitle">Click any baby to see details. Prices update every 30 minutes globally!</p>
                        
                        {projectedBabies.length > 0 && (
                            <div className="projected-banner">
                                ⚠️ <strong>{projectedBabies.length} BABY{projectedBabies.length > 1 ? 'IES' : ''} PROJECTED!</strong> High prices - will drop soon!
                            </div>
                        )}
                        
                        <div className="card-grid">
                            {babies.map(baby => {
                                const price = prices[baby.id];
                                const owned = portfolio[baby.id] || 0;
                                const isProjected = projectedBabies.includes(baby.id);
                                const timeLeft = isProjected ? Math.max(0, Math.floor((projectedEndTimes[baby.id] - Date.now()) / 1000)) : 0;
                                
                                return (
                                    <div key={baby.id} onClick={() => setSelectedBaby(baby)} 
                                        className={`card ${isProjected ? 'projected-card' : ''}`}
                                        style={{ position: 'relative' }}>
                                        {isProjected && (
                                            <span className="projected-badge">⚠️ PROJECTED</span>
                                        )}
                                        <img src={baby.image} alt={baby.name} />
                                        <h3>{baby.name}</h3>
                                        <div className="card-price" style={{ color: isProjected ? '#e74c3c' : getPriceChangeColor(baby.id) }}>
                                            ${price.toFixed(2)} {isProjected && <span style={{ fontSize: '16px' }}>📉</span>}
                                        </div>
                                        {isProjected && (
                                            <div className="projected-timer">
                                                High! Drops in {Math.floor(timeLeft / 60)}m {timeLeft % 60}s
                                            </div>
                                        )}
                                        {owned > 0 && <div className="card-info" style={{ color: 'blue' }}>You own: {owned}</div>}
                                        <button onClick={(e) => { e.stopPropagation(); buyBaby(baby.id, price); }}
                                            disabled={money < price} 
                                            className="card-button buy-button">
                                            {isProjected ? '⚠️ BUY HIGH' : 'BUY'} ${price.toFixed(2)}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Limited Store View */}
                {currentView === 'store' && (
                    <div>
                        <h1 className="view-title">🛒 Limited Store</h1>
                        <p className="view-subtitle" style={{ color: '#e74c3c' }}>⚠️ 125 Limited Items! Fixed cost, fluctuating value. Serial numbers!</p>
                        
                        <div className="card-grid">
                            {limitedItems.map(item => {
                                const currentValue = limitedValues[item.id];
                                const totalMinted = limitedMintCounts[item.id] || 0;
                                const owned = limitedInventory[item.id] || [];
                                const valueChange = currentValue - item.cost;
                                const valueChangePercent = ((valueChange / item.cost) * 100).toFixed(1);
                                
                                return (
                                    <div key={item.id} className="card limited-card" 
                                        style={{ background: item.tier ? getTierColor(item.tier) : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                        <span className="limited-tier-badge">
                                            {item.tier ? getTierBadge(item.tier) : 'LIMITED'}
                                        </span>
                                        <div className="limited-emoji">{item.emoji}</div>
                                        <h2 style={{ textAlign: 'center', marginBottom: '15px', color: 'white' }}>{item.name}</h2>
                                        <div className="limited-info">
                                            <div style={{ marginBottom: '8px' }}><strong>Cost:</strong> ${item.cost.toLocaleString()} (Fixed)</div>
                                            <div style={{ marginBottom: '8px' }}><strong>Current Value:</strong> ${currentValue.toLocaleString()}</div>
                                            <div style={{ marginBottom: '8px', color: valueChange >= 0 ? '#2ecc71' : '#e74c3c' }}>
                                                <strong>Change:</strong> ${valueChange.toLocaleString()} ({valueChangePercent}%)
                                            </div>
                                            <div style={{ marginBottom: '8px' }}><strong>Range:</strong> ${item.minValue.toLocaleString()} - ${item.maxValue.toLocaleString()}</div>
                                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '8px', marginTop: '8px' }}>
                                                <strong>Total Minted:</strong> {totalMinted}
                                            </div>
                                            {owned.length > 0 && (
                                                <div style={{ borderTop: '1px solid rgba(52, 152, 219, 0.5)', paddingTop: '8px', marginTop: '8px', color: '#3498db' }}>
                                                    <strong>You Own:</strong> {owned.length}
                                                    <div style={{ fontSize: '12px', marginTop: '5px' }}>
                                                        Serial #s: {owned.map(o => o.serialNumber).join(', ')}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="limited-serial">
                                            Next Purchase: <strong>#{totalMinted + 1}</strong>
                                        </div>
                                        <button onClick={() => buyLimited(item.id)} disabled={money < item.cost} 
                                            className="card-button buy-button">
                                            {money >= item.cost ? `BUY for $${item.cost.toLocaleString()}` : 'NOT ENOUGH MONEY'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Portfolio View */}
                {currentView === 'portfolio' && (
                    <div>
                        <div className="flex-between">
                            <h1 className="view-title">📊 Your Portfolio</h1>
                            {Object.keys(portfolio).some(id => portfolio[id] > 0) && (
                                <button onClick={sellAllBabies} className="card-button sell-button" 
                                    style={{ width: 'auto', padding: '15px 30px' }}>
                                    💰 SELL ALL BABIES
                                </button>
                            )}
                        </div>
                        
                        {/* Babies */}
                        {Object.keys(portfolio).some(id => portfolio[id] > 0) ? (
                            <div>
                                <h3 className="mt-20">👶 Babies</h3>
                                <div className="card-grid mt-10">
                                    {babies.map(baby => {
                                        const quantity = portfolio[baby.id] || 0;
                                        if (quantity === 0) return null;
                                        const currentPrice = prices[baby.id];
                                        const totalValue = quantity * currentPrice;
                                        
                                        return (
                                            <div key={baby.id} onClick={() => setSelectedBaby(baby)} className="card">
                                                <img src={baby.image} alt={baby.name} />
                                                <h3>{baby.name}</h3>
                                                <div className="mt-10">
                                                    <div><strong>Quantity:</strong> {quantity}</div>
                                                    <div><strong>Price:</strong> ${currentPrice.toFixed(2)}</div>
                                                    <div className="card-price">${totalValue.toFixed(2)}</div>
                                                </div>
                                                <button onClick={(e) => { e.stopPropagation(); sellBaby(baby.id, currentPrice); }} 
                                                    className="card-button sell-button">
                                                    SELL for ${currentPrice.toFixed(2)}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <p>No babies owned. Visit the Market!</p>
                        )}

                        {/* Limited Items */}
                        {Object.keys(limitedInventory).some(id => limitedInventory[id] && limitedInventory[id].length > 0) && (
                            <div className="mt-30">
                                <h3>✨ Your Limited Items</h3>
                                <div className="card-grid mt-20">
                                    {limitedItems.map(item => {
                                        const owned = limitedInventory[item.id] || [];
                                        if (owned.length === 0) return null;
                                        const currentValue = limitedValues[item.id];
                                        
                                        return owned.map((ownedItem) => (
                                            <div key={`${item.id}-${ownedItem.serialNumber}`} className="card limited-card"
                                                style={{ background: item.tier ? getTierColor(item.tier) : 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)' }}>
                                                <div className="limited-emoji" style={{ fontSize: '60px' }}>{item.emoji}</div>
                                                <h3 style={{ color: 'white', textAlign: 'center' }}>{item.name}</h3>
                                                <div className="limited-serial">
                                                    <div style={{ fontSize: '20px', marginBottom: '5px' }}>#{ownedItem.serialNumber}</div>
                                                    <div style={{ fontSize: '14px' }}>
                                                        {item.tier ? getTierBadge(item.tier) : 'Limited Edition'}
                                                    </div>
                                                </div>
                                                <div className="mt-10" style={{ color: 'white' }}>
                                                    <div><strong>Paid:</strong> ${ownedItem.purchasePrice.toLocaleString()}</div>
                                                    <div><strong>Worth:</strong> ${currentValue.toLocaleString()}</div>
                                                    <div className="card-price" style={{ color: currentValue > ownedItem.purchasePrice ? '#2ecc71' : '#e74c3c' }}>
                                                        P/L: ${(currentValue - ownedItem.purchasePrice).toLocaleString()}
                                                    </div>
                                                </div>
                                                <button onClick={() => sellLimited(item.id, ownedItem.serialNumber)} 
                                                    className="card-button sell-button">
                                                    SELL for ${currentValue.toLocaleString()}
                                                </button>
                                            </div>
                                        ));
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Trade History View */}
                {currentView === 'trades' && (
                    <div>
                        <h1 className="view-title">📜 Trade History</h1>
                        <div className="tabs">
                            <button onClick={() => setTradeHistoryTab('all')} 
                                className={`tab-button ${tradeHistoryTab === 'all' ? 'active' : ''}`}>
                                All Trades
                            </button>
                            <button onClick={() => setTradeHistoryTab('babies')} 
                                className={`tab-button ${tradeHistoryTab === 'babies' ? 'active' : ''}`}>
                                Baby Trades
                            </button>
                            <button onClick={() => setTradeHistoryTab('limiteds')} 
                                className={`tab-button ${tradeHistoryTab === 'limiteds' ? 'active' : ''}`}>
                                Limited Trades
                            </button>
                        </div>
                        {getFilteredTrades().length > 0 ? (
                            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                {getFilteredTrades().map(trade => (
                                    <div key={trade.id} className={`trade-item ${trade.type.includes('SELL') ? 'trade-sell' : 'trade-buy'}`}>
                                        <div className="trade-info">
                                            <strong>{trade.type.replace('_', ' ')}</strong>: {trade.babyName}
                                            <div style={{ fontSize: '14px', color: '#666' }}>{trade.timestamp}</div>
                                        </div>
                                        <div className="trade-price">
                                            ${trade.price.toLocaleString()}
                                            <div style={{ fontSize: '14px' }}>Qty: {trade.quantity}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No trades yet. Start buying and selling!</p>
                        )}
                    </div>
                )}

                {/* Profile View */}
                {currentView === 'profile' && (
                    <div>
                        <h1 className="view-title">👤 Profile</h1>
                        <div className="profile-header">
                            <div className="profile-avatar">👤</div>
                            <h2 style={{ marginBottom: '10px' }}>{username}</h2>
                            {window.gameState.createdAt && (
                                <p style={{ fontSize: '14px', opacity: 0.9 }}>
                                    Member since: {new Date(window.gameState.createdAt).toLocaleDateString()}
                                </p>
                            )}
                        </div>

                        <div className="stats-grid">
                            <div className="stat-card stat-card-blue">
                                <div className="stat-label">Current Cash</div>
                                <div className="stat-value">${money.toLocaleString()}</div>
                            </div>
                            <div className="stat-card stat-card-green">
                                <div className="stat-label">Portfolio Value</div>
                                <div className="stat-value">${getPortfolioValue().toLocaleString()}</div>
                            </div>
                            <div className="stat-card stat-card-purple">
                                <div className="stat-label">Total Net Worth</div>
                                <div className="stat-value">${(money + getPortfolioValue()).toLocaleString()}</div>
                            </div>
                        </div>

                        <h3 className="mt-30 mb-10">🏆 Personal Records</h3>
                        <div className="stats-grid">
                            <div className="stat-card stat-card-orange">
                                <div className="stat-label">Highest Cash</div>
                                <div className="stat-value">${highestMoney.toLocaleString()}</div>
                            </div>
                            <div className="stat-card stat-card-red">
                                <div className="stat-label">Highest Net Worth</div>
                                <div className="stat-value">${highestNetWorth.toLocaleString()}</div>
                            </div>
                            <div className="stat-card stat-card-teal">
                                <div className="stat-label">Total Trades</div>
                                <div className="stat-value">{tradeHistory.length}</div>
                            </div>
                        </div>

                        <h3 className="mt-30 mb-10">📦 Collection</h3>
                        <div className="stats-grid">
                            <div className="stat-card stat-card-dark">
                                <div className="stat-label">Babies Owned</div>
                                <div className="stat-value">
                                    {Object.values(portfolio).reduce((sum, qty) => sum + qty, 0)}
                                </div>
                            </div>
                            <div className="stat-card stat-card-orange">
                                <div className="stat-label">Limiteds Owned</div>
                                <div className="stat-value">
                                    {Object.values(limitedInventory).reduce((sum, arr) => sum + arr.length, 0)}
                                </div>
                            </div>
                        </div>

                        <h3 className="mt-30 mb-10">🏅 Achievements</h3>
                        <div className="stats-grid">
                            {getAchievements().map((achievement, index) => (
                                <div key={index} className="achievement-card">
                                    <div className="achievement-icon">{achievement.icon}</div>
                                    <div className="achievement-info">
                                        <h4>{achievement.name}</h4>
                                        <div className="achievement-desc">{achievement.desc}</div>
                                    </div>
                                </div>
                            ))}
                            {getAchievements().length === 0 && (
                                <div style={{ padding: '20px', background: '#ecf0f1', borderRadius: '10px', color: '#7f8c8d' }}>
                                    <p>Start trading to unlock achievements!</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Leaderboard View (NEW!) */}
                {currentView === 'leaderboard' && (
                    <div>
                        <h1 className="view-title">🏆 Global Leaderboard</h1>
                        <p className="view-subtitle">Top 10 players by net worth • Updates every 30 seconds</p>
                        
                        {leaderboard.length > 0 ? (
                            <div className="leaderboard-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Rank</th>
                                            <th>Player</th>
                                            <th>Net Worth</th>
                                            <th>Trades</th>
                                            <th>Babies</th>
                                            <th>Limiteds</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaderboard.map((player, index) => (
                                            <tr key={player.id} className={player.id === currentUser.uid ? 'leaderboard-highlight' : ''}>
                                                <td><span className="leaderboard-rank">#{index + 1}</span></td>
                                                <td><strong>{player.username}</strong> {player.id === currentUser.uid && '(You)'}</td>
                                                <td>${player.netWorth.toLocaleString()}</td>
                                                <td>{player.totalTrades}</td>
                                                <td>{player.babiesOwned}</td>
                                                <td>{player.limitedsOwned}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p>Loading leaderboard...</p>
                        )}
                    </div>
                )}

                {/* Trade Hub View (NEW!) */}
                {currentView === 'tradehub' && (
                    <div>
                        <h1 className="view-title">📢 Trade Hub</h1>
                        <p className="view-subtitle">Post and browse trade offers from other players!</p>
                        
                        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
                            <strong>⚠️ Coming Soon!</strong> Player-to-player trading is under development. Check back soon!
                        </div>
                        
                        <p style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
                            Trade Hub will allow you to:
                            <br/>• Post trade offers (Upgrades, Downgrades, LF, Selling)
                            <br/>• Browse offers from other players
                            <br/>• Make direct trades
                            <br/>• Counter-offer system
                            <br/><br/>
                            <strong>Stay tuned!</strong>
                        </p>
                    </div>
                )}
            </div>

            {/* Baby Detail Modal */}
            {selectedBaby && (
                <div onClick={() => setSelectedBaby(null)} className="modal-overlay">
                    <div onClick={e => e.stopPropagation()} className="modal">
                        <img src={selectedBaby.image} alt={selectedBaby.name} 
                            style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '10px' }} />
                        <h2 className="mt-20">{selectedBaby.name}</h2>
                        <div className="card-price" style={{ color: getPriceChangeColor(selectedBaby.id), margin: '15px 0' }}>
                            ${prices[selectedBaby.id].toFixed(2)}
                        </div>
                        <div className="mb-20">
                            <div>You own: {portfolio[selectedBaby.id] || 0}</div>
                        </div>
                        <div className="modal-buttons">
                            <button onClick={() => buyBaby(selectedBaby.id, prices[selectedBaby.id])}
                                disabled={money < prices[selectedBaby.id]} 
                                className={`modal-button ${money >= prices[selectedBaby.id] ? 'modal-button-primary' : 'modal-button-cancel'}`}>
                                BUY ${prices[selectedBaby.id].toFixed(2)}
                            </button>
                            {portfolio[selectedBaby.id] > 0 && (
                                <button onClick={() => sellBaby(selectedBaby.id, prices[selectedBaby.id])} 
                                    className="modal-button modal-button-secondary">
                                    SELL ${prices[selectedBaby.id].toFixed(2)}
                                </button>
                            )}
                        </div>
                        <button onClick={() => setSelectedBaby(null)} 
                            className="modal-button modal-button-cancel mt-20" style={{ width: '100%' }}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Render the app
ReactDOM.render(<AurababyMarket />, document.getElementById('root'));
