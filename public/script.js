// ========================================
// FIREBASE CONFIGURATION
// ========================================
const firebaseConfig = {
    apiKey: "AIzaSyBUXT3jdC1miTjbyG5dcuRdd8oSqzT4OMo",
    authDomain: "aurababymarket.firebaseapp.com",
    projectId: "aurababymarket",
    storageBucket: "aurababymarket.firebasestorage.app",
    messagingSenderId: "335246667462",
    appId: "1:335246667462:web:3b39c5bc78e05a674971c7",
    measurementId: "G-KSFT7RBPL3"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
let currentUserAuth = null;
let userDocRef = null;
let gameStateLoaded = false;

console.log('🔥 Firebase initialized!');

// ========================================
// GAME STATE
// ========================================
window.gameState = {
    username: 'Trader',
    money: 1000,
    portfolio: {},
    limitedInventory: {},
    nameTagsOwned: 0,
    hasChangedName: false,
    tradeHistory: [],
    highestMoney: 1000,
    highestNetWorth: 1000,
    priceHistory: [],
    createdAt: null
};

// ========================================
// AUTH FUNCTIONS
// ========================================
function showLogin() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('login-error').style.display = 'none';
    document.getElementById('signup-error').style.display = 'none';
}

function showSignup() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
    document.getElementById('login-error').style.display = 'none';
    document.getElementById('signup-error').style.display = 'none';
}

async function loginUser() {
    const username = document.getElementById('login-username').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    
    if (!username || !password) {
        errorDiv.textContent = 'Please enter username and password';
        errorDiv.style.display = 'block';
        return;
    }
    
    try {
        errorDiv.style.display = 'none';
        const email = username + '@aurababymarket.app';
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            errorDiv.textContent = 'Username not found';
        } else if (error.code === 'auth/wrong-password') {
            errorDiv.textContent = 'Incorrect password';
        } else {
            errorDiv.textContent = 'Login failed';
        }
        errorDiv.style.display = 'block';
    }
}

async function signupUser() {
    const username = document.getElementById('signup-username').value.trim().toLowerCase();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;
    const errorDiv = document.getElementById('signup-error');
    
    if (!username || username.length < 3 || username.length > 20) {
        errorDiv.textContent = 'Username must be 3-20 characters';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (!/^[a-z0-9_]+$/.test(username)) {
        errorDiv.textContent = 'Username: letters, numbers, underscores only';
        errorDiv.style.display = 'block';
        return;
    }
    
    const reserved = ['admin', 'moderator', 'system', 'guest', 'official', 'support'];
    if (reserved.includes(username)) {
        errorDiv.textContent = 'Username is reserved';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (password.length < 6) {
        errorDiv.textContent = 'Password must be 6+ characters';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (password !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match';
        errorDiv.style.display = 'block';
        return;
    }
    
    try {
        errorDiv.style.display = 'none';
        const email = username + '@aurababymarket.app';
        
        const usernameDoc = await db.collection('usernames').doc(username).get();
        if (usernameDoc.exists) {
            errorDiv.textContent = 'Username taken';
            errorDiv.style.display = 'block';
            return;
        }
        
        const result = await auth.createUserWithEmailAndPassword(email, password);
        
        await db.collection('usernames').doc(username).set({
            uid: result.user.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        await db.collection('users').doc(result.user.uid).set({
            username: username,
            money: 1000,
            portfolio: {},
            limitedInventory: {},
            nameTagsOwned: 0,
            hasChangedName: false,
            tradeHistory: [],
            highestMoney: 1000,
            highestNetWorth: 1000,
            priceHistory: [],
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ Account created:', username);
    } catch (error) {
        errorDiv.textContent = 'Signup failed: ' + error.message;
        errorDiv.style.display = 'block';
    }
}

async function loginAnonymous() {
    const errorDiv = document.getElementById('login-error');
    try {
        errorDiv.style.display = 'none';
        await auth.signInAnonymously();
    } catch (error) {
        errorDiv.textContent = 'Guest login failed';
        errorDiv.style.display = 'block';
    }
}

async function logoutUser() {
    if (confirm('Logout? Your progress is saved.')) {
        await saveGameData();
        await auth.signOut();
    }
}

// ========================================
// DATA MANAGEMENT
// ========================================
auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUserAuth = user;
        userDocRef = db.collection('users').doc(user.uid);
        
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('signup-form').style.display = 'none';
        document.getElementById('loading-screen').style.display = 'block';
        
        await loadGameData();
        
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
        
        if (!gameStateLoaded) {
            gameStateLoaded = true;
        }
    } else {
        currentUserAuth = null;
        userDocRef = null;
        gameStateLoaded = false;
        document.getElementById('auth-container').style.display = 'flex';
        document.getElementById('game-container').style.display = 'none';
        showLogin();
    }
});

async function loadGameData() {
    if (!userDocRef) return;
    
    try {
        const doc = await userDocRef.get();
        
        let username = 'Trader';
        if (currentUserAuth.isAnonymous) {
            username = 'Guest_' + Date.now();
        } else if (currentUserAuth.email) {
            username = currentUserAuth.email.split('@')[0];
        }
        
        if (doc.exists) {
            const data = doc.data();
            window.gameState = {
                username: data.username || username,
                money: data.money !== undefined ? data.money : 1000,
                portfolio: data.portfolio || {},
                limitedInventory: data.limitedInventory || {},
                nameTagsOwned: data.nameTagsOwned || 0,
                hasChangedName: data.hasChangedName || false,
                tradeHistory: data.tradeHistory || [],
                highestMoney: data.highestMoney || 1000,
                highestNetWorth: data.highestNetWorth || 1000,
                priceHistory: data.priceHistory || [],
                createdAt: data.createdAt || null
            };
            console.log('✅ Loaded:', window.gameState.username, '$' + window.gameState.money);
        } else {
            window.gameState = {
                username: username,
                money: 1000,
                portfolio: {},
                limitedInventory: {},
                nameTagsOwned: 0,
                hasChangedName: false,
                tradeHistory: [],
                highestMoney: 1000,
                highestNetWorth: 1000,
                priceHistory: [],
                createdAt: new Date()
            };
            console.log('📝 New user:', username);
            await saveGameData();
        }
    } catch (error) {
        console.error('❌ Load failed:', error);
    }
}

async function saveGameData() {
    if (!userDocRef || !window.gameState) return;
    
    try {
        await userDocRef.set({
            username: window.gameState.username,
            money: window.gameState.money,
            portfolio: window.gameState.portfolio,
            limitedInventory: window.gameState.limitedInventory,
            nameTagsOwned: window.gameState.nameTagsOwned,
            hasChangedName: window.gameState.hasChangedName,
            tradeHistory: window.gameState.tradeHistory,
            highestMoney: window.gameState.highestMoney,
            highestNetWorth: window.gameState.highestNetWorth,
            priceHistory: window.gameState.priceHistory,
            createdAt: window.gameState.createdAt || firebase.firestore.FieldValue.serverTimestamp(),
            lastSaved: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        console.log('💾 Saved!');
    } catch (error) {
        console.error('❌ Save failed:', error);
    }
}

// Auto-save every 30 seconds
setInterval(() => {
    if (currentUserAuth && window.gameState) {
        saveGameData();
    }
}, 30000);

// Save on page close
window.addEventListener('beforeunload', () => {
    if (currentUserAuth && window.gameState) {
        saveGameData();
    }
});

// ========================================
// MULTIPLAYER FUNCTIONS
// ========================================
let multiplayerCurrentUser = null;

auth.onAuthStateChanged((user) => {
    if (user) {
        multiplayerCurrentUser = user;
    }
});

async function initializeGlobalPrices(babyIds, limitedItems) {
    if (!db) return;
    
    try {
        const priceDoc = await db.collection('globalPrices').doc('current').get();
        
        if (!priceDoc.exists) {
            const babyPrices = {};
            babyIds.forEach(id => { babyPrices[id] = 150; });
            
            const limitedValues = {};
            limitedItems.forEach(item => {
                limitedValues[item.id] = (item.minValue + item.maxValue) / 2;
            });
            
            await db.collection('globalPrices').doc('current').set({
                babyPrices: babyPrices,
                limitedValues: limitedValues,
                priceHistory: [{
                    timestamp: Date.now(),
                    babyPrices: { ...babyPrices },
                    limitedValues: { ...limitedValues }
                }],
                lastUpdate: firebase.firestore.FieldValue.serverTimestamp(),
                nextUpdateTime: firebase.firestore.Timestamp.fromDate(
                    new Date(Date.now() + 2 * 60 * 1000)
                ),
                updateCount: 0
            });
        }
    } catch (error) {
        console.error('Init prices failed:', error);
    }
}

async function forceUpdateGlobalPrices(babies, limitedItems) {
    if (!db) return false;
    
    try {
        const priceDoc = await db.collection('globalPrices').doc('current').get();
        
        if (!priceDoc.exists) {
            await initializeGlobalPrices(babies.map(b => b.id), limitedItems);
            return true;
        }
        
        const currentData = priceDoc.data();
        const newBabyPrices = { ...currentData.babyPrices };
        const newLimitedValues = { ...currentData.limitedValues };
        
        babies.forEach(baby => {
            const changePercent = (Math.random() * 0.3 - 0.15);
            const oldPrice = newBabyPrices[baby.id] || 150;
            let newPrice = oldPrice + (oldPrice * changePercent);
            
            if (newPrice < 10) newPrice = 10;
            if (newPrice > 1000) newPrice = 1000;
            
            newBabyPrices[baby.id] = Math.round(newPrice * 100) / 100;
        });
        
        limitedItems.forEach(item => {
            const changePercent = (Math.random() * 0.2 - 0.1);
            const oldValue = newLimitedValues[item.id] || (item.minValue + item.maxValue) / 2;
            let newValue = oldValue + (oldValue * changePercent);
            
            if (newValue < item.minValue) newValue = item.minValue;
            if (newValue > item.maxValue) newValue = item.maxValue;
            
            newLimitedValues[item.id] = Math.round(newValue * 100) / 100;
        });
        
        const priceHistory = currentData.priceHistory || [];
        priceHistory.push({
            timestamp: Date.now(),
            babyPrices: { ...newBabyPrices },
            limitedValues: { ...newLimitedValues }
        });
        
        if (priceHistory.length > 50) {
            priceHistory.shift();
        }
        
        await db.collection('globalPrices').doc('current').update({
            babyPrices: newBabyPrices,
            limitedValues: newLimitedValues,
            priceHistory: priceHistory,
            lastUpdate: firebase.firestore.FieldValue.serverTimestamp(),
            nextUpdateTime: firebase.firestore.Timestamp.fromDate(
                new Date(Date.now() + 2 * 60 * 1000)
            ),
            updateCount: (currentData.updateCount || 0) + 1
        });
        
        return true;
    } catch (error) {
        console.error('Update failed:', error);
        return false;
    }
}

function listenToGlobalPrices(callback) {
    if (!db) return () => {};
    
    const unsubscribe = db.collection('globalPrices').doc('current')
        .onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                callback({
                    babyPrices: data.babyPrices || {},
                    limitedValues: data.limitedValues || {},
                    priceHistory: data.priceHistory || [],
                    lastUpdate: data.lastUpdate,
                    nextUpdateTime: data.nextUpdateTime,
                    updateCount: data.updateCount || 0
                });
            }
        });
    
    return unsubscribe;
}

async function updateLeaderboard(playerData) {
    if (!multiplayerCurrentUser || !db) return;
    
    try {
        const netWorth = playerData.money + playerData.portfolioValue + playerData.limitedValue;
        const totalBabies = Object.values(playerData.portfolio).reduce((sum, qty) => sum + qty, 0);
        const totalLimiteds = Object.values(playerData.limitedInventory).reduce((sum, arr) => sum + arr.length, 0);
        
        await db.collection('leaderboard').doc(multiplayerCurrentUser.uid).set({
            username: playerData.username,
            netWorth: netWorth,
            money: playerData.money,
            portfolioValue: playerData.portfolioValue,
            limitedValue: playerData.limitedValue,
            totalTrades: playerData.tradeHistory.length,
            babiesOwned: totalBabies,
            limitedsOwned: totalLimiteds,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Leaderboard update failed:', error);
    }
}

async function loadLeaderboard() {
    if (!db) return [];
    
    try {
        const snapshot = await db.collection('leaderboard')
            .orderBy('netWorth', 'desc')
            .limit(10)
            .get();
        
        const leaders = [];
        snapshot.forEach(doc => {
            leaders.push({ 
                id: doc.id, 
                ...doc.data(),
                isCurrentUser: multiplayerCurrentUser && doc.id === multiplayerCurrentUser.uid
            });
        });
        
        return leaders;
    } catch (error) {
        console.error('Load leaderboard failed:', error);
        return [];
    }
}

async function loadAllPlayers() {
    if (!db) return [];
    
    try {
        const snapshot = await db.collection('leaderboard')
            .orderBy('lastUpdated', 'desc')
            .get();
        
        const players = [];
        const now = Date.now();
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const lastUpdate = data.lastUpdated ? data.lastUpdated.toMillis() : 0;
            const isOnline = (now - lastUpdate) < 5 * 60 * 1000; // Online if updated in last 5 mins
            
            players.push({ 
                id: doc.id, 
                ...data,
                isOnline: isOnline,
                isCurrentUser: multiplayerCurrentUser && doc.id === multiplayerCurrentUser.uid
            });
        });
        
        return players;
    } catch (error) {
        console.error('Load players failed:', error);
        return [];
    }
}

window.multiplayer = {
    initializeGlobalPrices,
    forceUpdateGlobalPrices,
    listenToGlobalPrices,
    updateLeaderboard,
    loadLeaderboard,
    loadAllPlayers
};

console.log('🎮 Multiplayer ready!');

// ========================================
// REACT GAME COMPONENT
// ========================================
const { useState, useEffect, useRef } = React;

function isMarketOpen() {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 9 && hour < 21;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
}

function getTimeUntilMarketChange() {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour < 9) {
        const open = new Date(now);
        open.setHours(9, 0, 0, 0);
        return Math.floor((open - now) / 1000);
    } else if (hour >= 21) {
        const open = new Date(now);
        open.setDate(open.getDate() + 1);
        open.setHours(9, 0, 0, 0);
        return Math.floor((open - now) / 1000);
    } else {
        const close = new Date(now);
        close.setHours(21, 0, 0, 0);
        return Math.floor((close - now) / 1000);
    }
}

function getTimeUntilNextPriceUpdate(nextUpdateTimestamp) {
    if (!nextUpdateTimestamp) return 120;
    
    const now = Date.now();
    const nextUpdate = nextUpdateTimestamp.toMillis ? nextUpdateTimestamp.toMillis() : nextUpdateTimestamp;
    const diff = Math.floor((nextUpdate - now) / 1000);
    
    return diff > 0 ? diff : 0;
}

const AurababyMarket = () => {
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

    // Load 300 limited items from external file
    const limitedItems = typeof LIMITEDS !== 'undefined' ? LIMITEDS : [];

    const [money, setMoney] = useState(1000);
    const [username, setUsername] = useState('Player');
    const [nameTagsOwned, setNameTagsOwned] = useState(0);
    const [hasChangedName, setHasChangedName] = useState(false);
    const [portfolio, setPortfolio] = useState({});
    const [limitedInventory, setLimitedInventory] = useState({});
    const [tradeHistory, setTradeHistory] = useState([]);
    
    const [prices, setPrices] = useState({});
    const [limitedValues, setLimitedValues] = useState({});
    const [priceHistory, setPriceHistory] = useState([]);
    const [nextUpdateTime, setNextUpdateTime] = useState(null);
    const [updateCount, setUpdateCount] = useState(0);
    const [showUpdateNotice, setShowUpdateNotice] = useState(false);
    
    const [marketOpen, setMarketOpen] = useState(isMarketOpen());
    const [timeUntilChange, setTimeUntilChange] = useState(getTimeUntilMarketChange());
    const [timeUntilPriceUpdate, setTimeUntilPriceUpdate] = useState(120);
    
    const [currentView, setCurrentView] = useState('market');
    const [limitedFilter, setLimitedFilter] = useState('all');
    const [selectedBaby, setSelectedBaby] = useState(null);
    const [selectedLimited, setSelectedLimited] = useState(null);
    
    const [leaderboard, setLeaderboard] = useState([]);
    const [allPlayers, setAllPlayers] = useState([]);
    const [showNameChange, setShowNameChange] = useState(false);
    const [newName, setNewName] = useState('');
    
    const [pricesLoaded, setPricesLoaded] = useState(false);
    
    const previousPricesRef = useRef({});
    const chartRef = useRef(null);

    // Load from window.gameState
    useEffect(() => {
        if (window.gameState) {
            setUsername(window.gameState.username || 'Player');
            setMoney(window.gameState.money || 1000);
            setPortfolio(window.gameState.portfolio || {});
            setLimitedInventory(window.gameState.limitedInventory || {});
            setTradeHistory(window.gameState.tradeHistory || []);
            setNameTagsOwned(window.gameState.nameTagsOwned || 0);
            setHasChangedName(window.gameState.hasChangedName || false);
        }
        
        const syncInterval = setInterval(() => {
            if (window.gameState) {
                setUsername(window.gameState.username);
                setMoney(window.gameState.money);
                setPortfolio(window.gameState.portfolio);
                setLimitedInventory(window.gameState.limitedInventory);
                setTradeHistory(window.gameState.tradeHistory);
                setNameTagsOwned(window.gameState.nameTagsOwned);
                setHasChangedName(window.gameState.hasChangedName);
            }
        }, 1000);
        
        return () => clearInterval(syncInterval);
    }, []);
    
    // Initialize global prices
    useEffect(() => {
        window.multiplayer.initializeGlobalPrices(babies.map(b => b.id), limitedItems);
        
        const unsubscribe = window.multiplayer.listenToGlobalPrices((priceData) => {
            previousPricesRef.current = { ...prices };
            
            setPrices(priceData.babyPrices);
            setLimitedValues(priceData.limitedValues);
            setPriceHistory(priceData.priceHistory || []);
            setNextUpdateTime(priceData.nextUpdateTime);
            setUpdateCount(priceData.updateCount);
            setPricesLoaded(true);
            
            if (priceData.updateCount > 0) {
                setShowUpdateNotice(true);
                setTimeout(() => setShowUpdateNotice(false), 5000);
            }
        });
        
        return () => unsubscribe();
    }, []);
    
    // Price countdown
    useEffect(() => {
        const countdown = setInterval(() => {
            if (nextUpdateTime) {
                setTimeUntilPriceUpdate(getTimeUntilNextPriceUpdate(nextUpdateTime));
            }
        }, 1000);
        
        return () => clearInterval(countdown);
    }, [nextUpdateTime]);
    
    // Auto price update
    useEffect(() => {
        if (!pricesLoaded) return;
        
        const priceUpdater = setInterval(() => {
            if (marketOpen) {
                window.multiplayer.forceUpdateGlobalPrices(babies, limitedItems);
            }
        }, 2 * 60 * 1000);
        
        return () => clearInterval(priceUpdater);
    }, [marketOpen, pricesLoaded]);

    // Market check
    useEffect(() => {
        const statusCheck = setInterval(() => {
            setMarketOpen(isMarketOpen());
            setTimeUntilChange(getTimeUntilMarketChange());
        }, 60000);
        return () => clearInterval(statusCheck);
    }, []);

    // Income
    useEffect(() => {
        const timer = setInterval(() => {
            setMoney(prev => {
                const newMoney = prev + 200;
                window.gameState.money = newMoney;
                saveGameData();
                return newMoney;
            });
        }, 90000);
        return () => clearInterval(timer);
    }, []);

    const getPortfolioValue = () => {
        let total = 0;
        Object.keys(portfolio).forEach(id => {
            total += (portfolio[id] || 0) * (prices[id] || 0);
        });
        return Math.round(total * 100) / 100;
    };

    const getLimitedValue = () => {
        let total = 0;
        Object.keys(limitedInventory).forEach(itemId => {
            const count = limitedInventory[itemId]?.length || 0;
            total += count * (limitedValues[itemId] || 0);
        });
        return Math.round(total * 100) / 100;
    };

    const buyBaby = (babyId, babyPrice) => {
        if (!marketOpen) {
            alert('Market closed! Hours: 9 AM - 9 PM');
            return;
        }
        
        if (money >= babyPrice) {
            const newMoney = money - babyPrice;
            const newPortfolio = { ...portfolio, [babyId]: (portfolio[babyId] || 0) + 1 };
            
            const baby = babies.find(b => b.id === babyId);
            const newTrade = {
                id: Date.now(),
                type: 'BUY',
                babyName: baby.name,
                price: babyPrice,
                timestamp: new Date().toLocaleString()
            };
            const newTradeHistory = [newTrade, ...tradeHistory];
            
            setMoney(newMoney);
            setPortfolio(newPortfolio);
            setTradeHistory(newTradeHistory);
            
            window.gameState.money = newMoney;
            window.gameState.portfolio = newPortfolio;
            window.gameState.tradeHistory = newTradeHistory;
            
            saveGameData();
            
            window.multiplayer.updateLeaderboard({
                username,
                money: newMoney,
                portfolioValue: getPortfolioValue(),
                limitedValue: getLimitedValue(),
                portfolio: newPortfolio,
                limitedInventory,
                tradeHistory: newTradeHistory
            });
        }
    };

    const sellBaby = (babyId, babyPrice) => {
        if (!marketOpen) {
            alert('Market closed!');
            return;
        }
        
        if (portfolio[babyId] && portfolio[babyId] > 0) {
            const newMoney = money + babyPrice;
            const newPortfolio = { ...portfolio, [babyId]: portfolio[babyId] - 1 };
            
            const baby = babies.find(b => b.id === babyId);
            const newTrade = {
                id: Date.now(),
                type: 'SELL',
                babyName: baby.name,
                price: babyPrice,
                timestamp: new Date().toLocaleString()
            };
            const newTradeHistory = [newTrade, ...tradeHistory];
            
            setMoney(newMoney);
            setPortfolio(newPortfolio);
            setTradeHistory(newTradeHistory);
            
            window.gameState.money = newMoney;
            window.gameState.portfolio = newPortfolio;
            window.gameState.tradeHistory = newTradeHistory;
            
            saveGameData();
        }
    };

    const buyLimited = (itemId, itemCost) => {
        if (money >= itemCost) {
            const serialNumber = Date.now();
            const newMoney = money - itemCost;
            
            const item = limitedItems.find(i => i.id === itemId);
            const newInventory = { 
                ...limitedInventory, 
                [itemId]: [...(limitedInventory[itemId] || []), { serial: serialNumber, purchaseDate: new Date().toISOString() }]
            };
            
            const newTrade = {
                id: Date.now(),
                type: 'BUY_LIMITED',
                babyName: item.name + ' #' + serialNumber,
                price: itemCost,
                timestamp: new Date().toLocaleString()
            };
            const newTradeHistory = [newTrade, ...tradeHistory];
            
            setMoney(newMoney);
            setLimitedInventory(newInventory);
            setTradeHistory(newTradeHistory);
            
            window.gameState.money = newMoney;
            window.gameState.limitedInventory = newInventory;
            window.gameState.tradeHistory = newTradeHistory;
            
            saveGameData();
        }
    };

    const handleNameChange = async () => {
        if (!newName || newName.length < 3 || newName.length > 20) {
            alert('Username must be 3-20 characters');
            return;
        }
        
        if (!/^[a-z0-9_]+$/i.test(newName)) {
            alert('Only letters, numbers, and underscores');
            return;
        }
        
        const cost = hasChangedName ? 10000 : 0;
        
        if (money < cost) {
            alert('Not enough money! Need $10,000');
            return;
        }
        
        const newMoney = money - cost;
        const newNameTags = hasChangedName ? nameTagsOwned + 1 : nameTagsOwned;
        
        setUsername(newName);
        setMoney(newMoney);
        setNameTagsOwned(newNameTags);
        setHasChangedName(true);
        setShowNameChange(false);
        setNewName('');
        
        window.gameState.username = newName;
        window.gameState.money = newMoney;
        window.gameState.nameTagsOwned = newNameTags;
        window.gameState.hasChangedName = true;
        
        saveGameData();
        
        alert(hasChangedName ? `Name changed to "${newName}"! +1 Name Tag item!` : `Name set to "${newName}"! (First change is free)`);
    };

    useEffect(() => {
        if (currentView === 'leaderboard') {
            window.multiplayer.loadLeaderboard().then(setLeaderboard);
        } else if (currentView === 'trade') {
            window.multiplayer.loadAllPlayers().then(setAllPlayers);
        }
    }, [currentView]);
    
    const getFilteredLimiteds = () => {
        if (limitedFilter === 'all') return limitedItems;
        return limitedItems.filter(item => item.rarity.toLowerCase() === limitedFilter);
    };
    
    const getPriceChange = (babyId) => {
        const oldPrice = previousPricesRef.current[babyId];
        const newPrice = prices[babyId];
        
        if (!oldPrice || !newPrice || oldPrice === newPrice) return null;
        
        const change = ((newPrice - oldPrice) / oldPrice * 100).toFixed(1);
        return { direction: newPrice > oldPrice ? 'up' : 'down', percentage: Math.abs(change) };
    };

    // Draw chart for selected item
    useEffect(() => {
        if (chartRef.current && (selectedBaby || selectedLimited) && priceHistory.length > 1) {
            const ctx = chartRef.current.getContext('2d');
            if (window.itemChart) window.itemChart.destroy();
            
            const timestamps = priceHistory.map(p => new Date(p.timestamp).toLocaleTimeString());
            let data = [];
            let label = '';
            
            if (selectedBaby) {
                data = priceHistory.map(p => p.babyPrices[selectedBaby.id] || 0);
                label = selectedBaby.name + ' Price';
            } else if (selectedLimited) {
                data = priceHistory.map(p => p.limitedValues[selectedLimited.id] || 0);
                label = selectedLimited.name + ' Value';
            }
            
            window.itemChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: timestamps,
                    datasets: [{
                        label: label,
                        data: data,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: { display: true }
                    }
                }
            });
        }
    }, [selectedBaby, selectedLimited, priceHistory]);

    if (!pricesLoaded) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>
                <div className="loading-spinner"></div>
                <h2>Loading global prices...</h2>
            </div>
        );
    }

    return (
        <>
            <div className="game-header">
                <div className="header-left">
                    <div className="header-title">💰 Aurababy Market</div>
                    <div className="username-display" onClick={() => setShowNameChange(true)}>
                        <span>👤</span>
                        <span>{username}</span>
                        {nameTagsOwned > 0 && <span>🏷️{nameTagsOwned}</span>}
                    </div>
                </div>
                <div className="header-right">
                    <div className="header-stat">
                        <div className="header-stat-label">CASH</div>
                        <div className="header-stat-value">${money.toLocaleString()}</div>
                    </div>
                    <div className="header-stat">
                        <div className="header-stat-label">NET WORTH</div>
                        <div className="header-stat-value">${(money + getPortfolioValue() + getLimitedValue()).toLocaleString()}</div>
                    </div>
                    <button onClick={logoutUser} className="logout-btn">Logout</button>
                </div>
            </div>

            <div className="nav-tabs">
                <button onClick={() => setCurrentView('market')} className={`nav-tab ${currentView === 'market' ? 'active' : ''}`}>
                    🏪 Market
                </button>
                <button onClick={() => setCurrentView('limited')} className={`nav-tab ${currentView === 'limited' ? 'active' : ''}`}>
                    💎 Limiteds (300)
                </button>
                <button onClick={() => setCurrentView('portfolio')} className={`nav-tab ${currentView === 'portfolio' ? 'active' : ''}`}>
                    📊 Portfolio
                </button>
                <button onClick={() => setCurrentView('profile')} className={`nav-tab ${currentView === 'profile' ? 'active' : ''}`}>
                    👤 Profile
                </button>
                <button onClick={() => setCurrentView('trades')} className={`nav-tab ${currentView === 'trades' ? 'active' : ''}`}>
                    📜 History
                </button>
                <button onClick={() => setCurrentView('trade')} className={`nav-tab ${currentView === 'trade' ? 'active' : ''}`}>
                    🤝 Trade
                </button>
                <button onClick={() => setCurrentView('leaderboard')} className={`nav-tab ${currentView === 'leaderboard' ? 'active' : ''}`}>
                    🏆 Leaderboard
                </button>
            </div>

            <div className="main-content">
                {showUpdateNotice && (
                    <div className="banner banner-update">
                        🔥 PRICES UPDATED! #{updateCount} - Watch for changes!
                    </div>
                )}

                {currentView === 'market' && (
                    <div>
                        <h1 className="view-title">🏪 Baby Market</h1>
                        
                        {marketOpen ? (
                            <div className="banner banner-open">
                                ✅ Market Open | Next update: {formatTime(timeUntilPriceUpdate)} | #{updateCount}
                            </div>
                        ) : (
                            <div className="banner banner-closed">
                                ❌ Market Closed | Opens in: {formatTime(timeUntilChange)}
                            </div>
                        )}
                        
                        <div className="card-grid">
                            {babies.map(baby => {
                                const price = prices[baby.id] || 150;
                                const owned = portfolio[baby.id] || 0;
                                const priceChange = getPriceChange(baby.id);
                                
                                return (
                                    <div key={baby.id} className="card" onClick={() => setSelectedBaby(baby)}>
                                        {priceChange && (
                                            <div className={`price-badge price-badge-${priceChange.direction}`}>
                                                {priceChange.direction === 'up' ? '📈' : '📉'} {priceChange.percentage}%
                                            </div>
                                        )}
                                        <img src={baby.image} alt={baby.name} className="card-image" />
                                        <h3 className="card-title">{baby.name}</h3>
                                        <div className="card-price">${price.toFixed(2)}</div>
                                        {owned > 0 && <div className="card-info">Owned: {owned}</div>}
                                        <button onClick={(e) => { e.stopPropagation(); buyBaby(baby.id, price); }}
                                            disabled={money < price || !marketOpen} 
                                            className="card-button btn btn-success">
                                            {marketOpen ? `BUY $${price.toFixed(2)}` : 'CLOSED'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {currentView === 'limited' && (
                    <div>
                        <h1 className="view-title">💎 Limited Store</h1>
                        <p className="view-subtitle">300 items! Collection value only - cannot be sold!</p>
                        
                        <div className="tabs">
                            <button onClick={() => setLimitedFilter('all')} className={`tab-button ${limitedFilter === 'all' ? 'active' : ''}`}>
                                All (300)
                            </button>
                            <button onClick={() => setLimitedFilter('divine')} className={`tab-button ${limitedFilter === 'divine' ? 'active' : ''}`}>
                                🌟 DIVINE 🌟 (8)
                            </button>
                            <button onClick={() => setLimitedFilter('legendary')} className={`tab-button ${limitedFilter === 'legendary' ? 'active' : ''}`}>
                                Legendary
                            </button>
                            <button onClick={() => setLimitedFilter('epic')} className={`tab-button ${limitedFilter === 'epic' ? 'active' : ''}`}>
                                Epic
                            </button>
                            <button onClick={() => setLimitedFilter('rare')} className={`tab-button ${limitedFilter === 'rare' ? 'active' : ''}`}>
                                Rare
                            </button>
                            <button onClick={() => setLimitedFilter('common')} className={`tab-button ${limitedFilter === 'common' ? 'active' : ''}`}>
                                Common
                            </button>
                        </div>
                        
                        <div className="card-grid">
                            {getFilteredLimiteds().map(item => {
                                const owned = limitedInventory[item.id]?.length || 0;
                                const value = limitedValues[item.id] || (item.minValue + item.maxValue) / 2;
                                
                                return (
                                    <div key={item.id} className={`card limited-card rarity-${item.rarity.toLowerCase()}`} onClick={() => setSelectedLimited(item)}>
                                        <div className={`limited-badge rarity-${item.rarity.toLowerCase()}`}>{item.rarity}</div>
                                        <div className="limited-emoji">{item.emoji}</div>
                                        <h3 className="card-title">{item.name}</h3>
                                        <div style={{textAlign: 'center', marginBottom: '10px'}}>
                                            <div style={{fontSize: '14px'}}>Cost: ${item.cost}</div>
                                            <div style={{fontSize: '14px'}}>Value: ${value.toFixed(2)}</div>
                                        </div>
                                        {owned > 0 && <div style={{textAlign: 'center', color: 'white'}}>Owned: {owned}</div>}
                                        <button onClick={(e) => { e.stopPropagation(); buyLimited(item.id, item.cost); }}
                                            disabled={money < item.cost} 
                                            className="card-button btn btn-success">
                                            BUY ${item.cost}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {currentView === 'portfolio' && (
                    <div>
                        <h1 className="view-title">📊 My Portfolio</h1>
                        <p className="view-subtitle">Your investments and collection</p>
                        
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-label">Babies Owned</div>
                                <div className="stat-value">{Object.values(portfolio).reduce((sum, qty) => sum + qty, 0)}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-label">Portfolio Value</div>
                                <div className="stat-value">${getPortfolioValue().toLocaleString()}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-label">Limiteds Owned</div>
                                <div className="stat-value">{Object.values(limitedInventory).reduce((sum, arr) => sum + arr.length, 0)}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-label">Limited Value</div>
                                <div className="stat-value">${getLimitedValue().toLocaleString()}</div>
                            </div>
                        </div>

                        <h2 style={{marginTop: '40px', marginBottom: '20px', fontSize: '28px', fontWeight: '800', color: '#2c3e50'}}>💼 Your Babies</h2>
                        <div className="card-grid">
                            {Object.keys(portfolio).filter(id => portfolio[id] > 0).map(babyId => {
                                const baby = babies.find(b => b.id === parseInt(babyId));
                                const quantity = portfolio[babyId];
                                const price = prices[babyId] || 150;
                                const totalValue = quantity * price;
                                
                                return baby ? (
                                    <div key={babyId} className="card">
                                        <img src={baby.image} alt={baby.name} className="card-image" />
                                        <h3 className="card-title">{baby.name}</h3>
                                        <div className="card-info">Quantity: {quantity}</div>
                                        <div className="card-info">Current Price: ${price.toFixed(2)}</div>
                                        <div className="card-price">${totalValue.toFixed(2)}</div>
                                        <button onClick={() => { sellBaby(parseInt(babyId), price); }}
                                            disabled={!marketOpen}
                                            className="card-button btn btn-danger">
                                            {marketOpen ? `SELL $${price.toFixed(2)}` : 'MARKET CLOSED'}
                                        </button>
                                    </div>
                                ) : null;
                            })}
                        </div>

                        <h2 style={{marginTop: '40px', marginBottom: '20px', fontSize: '28px', fontWeight: '800', color: '#2c3e50'}}>💎 Your Limiteds</h2>
                        <div className="card-grid">
                            {Object.keys(limitedInventory).filter(id => limitedInventory[id].length > 0).map(itemId => {
                                const item = limitedItems.find(i => i.id === itemId);
                                const quantity = limitedInventory[itemId].length;
                                const value = limitedValues[itemId] || 0;
                                const totalValue = quantity * value;
                                
                                return item ? (
                                    <div key={itemId} className={`card limited-card rarity-${item.rarity.toLowerCase()}`}>
                                        <div className={`limited-badge rarity-${item.rarity.toLowerCase()}`}>{item.rarity}</div>
                                        <div className="limited-emoji">{item.emoji}</div>
                                        <h3 className="card-title">{item.name}</h3>
                                        <div style={{textAlign: 'center', color: 'white', marginBottom: '10px'}}>
                                            <div style={{fontSize: '14px'}}>Owned: {quantity}</div>
                                            <div style={{fontSize: '14px'}}>Value Each: ${value.toFixed(2)}</div>
                                        </div>
                                        <div className="card-price" style={{color: 'white'}}>${totalValue.toFixed(2)}</div>
                                        <div style={{textAlign: 'center', fontSize: '12px', color: 'white', marginTop: '10px'}}>
                                            Collection Item - Cannot be sold
                                        </div>
                                    </div>
                                ) : null;
                            })}
                        </div>
                    </div>
                )}

                {currentView === 'profile' && (
                    <div>
                        <div className="profile-header">
                            <div className="profile-username">{username}</div>
                            <div className="profile-joined">Trader Since {window.gameState.createdAt ? new Date(window.gameState.createdAt).toLocaleDateString() : 'Today'}</div>
                        </div>

                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-label">Net Worth</div>
                                <div className="stat-value">${(money + getPortfolioValue() + getLimitedValue()).toLocaleString()}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-label">Cash Balance</div>
                                <div className="stat-value">${money.toLocaleString()}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-label">Total Trades</div>
                                <div className="stat-value">{tradeHistory.length}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-label">Name Tags</div>
                                <div className="stat-value">🏷️ {nameTagsOwned}</div>
                            </div>
                        </div>
                    </div>
                )}

                {currentView === 'trades' && (
                    <div>
                        <h1 className="view-title">📜 Trade History</h1>
                        <p className="view-subtitle">All your transactions</p>
                        
                        {tradeHistory.length === 0 ? (
                            <div style={{textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px'}}>
                                <h3 style={{fontSize: '24px', color: '#7f8c8d'}}>No trades yet!</h3>
                                <p style={{marginTop: '10px', color: '#95a5a6'}}>Start trading to see your history here</p>
                            </div>
                        ) : (
                            <div>
                                {tradeHistory.map(trade => (
                                    <div key={trade.id} className={`trade-item ${trade.type.startsWith('BUY') ? 'trade-buy' : 'trade-sell'}`}>
                                        <div className="trade-info">
                                            <strong>{trade.type}</strong> - {trade.babyName}
                                            <div style={{fontSize: '14px', color: '#7f8c8d', marginTop: '5px'}}>
                                                {trade.timestamp}
                                            </div>
                                        </div>
                                        <div className="trade-price">
                                            {trade.type.startsWith('BUY') ? '-' : '+'}${trade.price.toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {currentView === 'trade' && (
                    <div>
                        <h1 className="view-title">🤝 Player Trading</h1>
                        <p className="view-subtitle">Trade with other players (Coming Soon)</p>
                        
                        <h2 style={{marginTop: '30px', marginBottom: '20px', fontSize: '24px', fontWeight: '800', color: '#27ae60'}}>
                            🟢 Online Players
                        </h2>
                        <div className="player-list">
                            {allPlayers.filter(p => p.isOnline && !p.isCurrentUser).map(player => (
                                <div key={player.id} className="player-card player-online">
                                    <div className="player-status status-online"></div>
                                    <div className="player-name">{player.username}</div>
                                    <div className="player-info">Net Worth: ${player.netWorth?.toLocaleString() || 0}</div>
                                    <div className="player-info">Babies: {player.babiesOwned || 0} | Limiteds: {player.limitedsOwned || 0}</div>
                                    <button className="btn btn-primary" style={{width: '100%', marginTop: '10px'}} disabled>
                                        Trade (Coming Soon)
                                    </button>
                                </div>
                            ))}
                            {allPlayers.filter(p => p.isOnline && !p.isCurrentUser).length === 0 && (
                                <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '40px', background: 'white', borderRadius: '15px'}}>
                                    <h3 style={{color: '#7f8c8d'}}>No players online right now</h3>
                                </div>
                            )}
                        </div>

                        <h2 style={{marginTop: '40px', marginBottom: '20px', fontSize: '24px', fontWeight: '800', color: '#95a5a6'}}>
                            ⚫ Offline Players
                        </h2>
                        <div className="player-list">
                            {allPlayers.filter(p => !p.isOnline && !p.isCurrentUser).slice(0, 20).map(player => (
                                <div key={player.id} className="player-card player-offline">
                                    <div className="player-status status-offline"></div>
                                    <div className="player-name">{player.username}</div>
                                    <div className="player-info">Net Worth: ${player.netWorth?.toLocaleString() || 0}</div>
                                    <div className="player-info">Babies: {player.babiesOwned || 0} | Limiteds: {player.limitedsOwned || 0}</div>
                                    <button className="btn btn-primary" style={{width: '100%', marginTop: '10px'}} disabled>
                                        Trade (Coming Soon)
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {currentView === 'leaderboard' && (
                    <div>
                        <h1 className="view-title">🏆 Leaderboard</h1>
                        
                        {leaderboard.length > 0 ? (
                            <div className="leaderboard-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Rank</th>
                                            <th>Username</th>
                                            <th>Net Worth</th>
                                            <th>Babies</th>
                                            <th>Limiteds</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaderboard.map((player, idx) => (
                                            <tr key={player.id} className={player.isCurrentUser ? 'leaderboard-highlight' : ''}>
                                                <td className="leaderboard-rank">#{idx + 1}</td>
                                                <td><strong>{player.username}</strong> {player.isCurrentUser && '(You)'}</td>
                                                <td>${player.netWorth?.toLocaleString() || 0}</td>
                                                <td>{player.babiesOwned || 0}</td>
                                                <td>{player.limitedsOwned || 0}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p>Loading...</p>
                        )}
                    </div>
                )}
            </div>

            {showNameChange && (
                <div className="modal-overlay" onClick={() => setShowNameChange(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2 className="modal-title">Change Username</h2>
                        
                        <div className="name-change-section">
                            <div className="name-change-title">Current: {username}</div>
                            <div className="name-change-cost">
                                {hasChangedName ? '💰 Cost: $10,000 (gives Name Tag item 🏷️)' : '✨ First change is FREE!'}
                            </div>
                            
                            <input 
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value.toLowerCase())}
                                className="name-input"
                                placeholder="Enter new username"
                            />
                            
                            <div className="modal-buttons">
                                <button onClick={handleNameChange} className="modal-button btn btn-success">
                                    Confirm Change
                                </button>
                                <button onClick={() => setShowNameChange(false)} className="modal-button btn btn-danger">
                                    Cancel
                                </button>
                            </div>
                        </div>
                        
                        {nameTagsOwned > 0 && (
                            <div style={{marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '10px', textAlign: 'center'}}>
                                <strong>Name Tags Owned: 🏷️ {nameTagsOwned}</strong>
                                <div style={{fontSize: '14px', marginTop: '8px', color: '#666'}}>
                                    These can be traded with other players!
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {(selectedBaby || selectedLimited) && (
                <div className="modal-overlay" onClick={() => { setSelectedBaby(null); setSelectedLimited(null); }}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        {selectedBaby && (
                            <>
                                <img src={selectedBaby.image} alt={selectedBaby.name} style={{width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '15px', marginBottom: '20px'}} />
                                <h2 className="modal-title">{selectedBaby.name}</h2>
                                <div className="card-price">${(prices[selectedBaby.id] || 150).toFixed(2)}</div>
                                <div className="card-info">You own: {portfolio[selectedBaby.id] || 0}</div>
                                
                                {priceHistory.length > 1 && (
                                    <div className="modal-chart">
                                        <canvas ref={chartRef} height="120"></canvas>
                                    </div>
                                )}
                                
                                <div className="modal-buttons">
                                    <button onClick={() => { buyBaby(selectedBaby.id, prices[selectedBaby.id]); setSelectedBaby(null); }}
                                        disabled={money < prices[selectedBaby.id] || !marketOpen} 
                                        className="modal-button btn btn-success">
                                        BUY ${(prices[selectedBaby.id] || 150).toFixed(2)}
                                    </button>
                                    {portfolio[selectedBaby.id] > 0 && (
                                        <button onClick={() => { sellBaby(selectedBaby.id, prices[selectedBaby.id]); setSelectedBaby(null); }} 
                                            disabled={!marketOpen}
                                            className="modal-button btn btn-danger">
                                            SELL ${(prices[selectedBaby.id] || 150).toFixed(2)}
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                        
                        {selectedLimited && (
                            <>
                                <div className="limited-emoji">{selectedLimited.emoji}</div>
                                <h2 className="modal-title">{selectedLimited.name}</h2>
                                <div className={`limited-badge rarity-${selectedLimited.rarity.toLowerCase()}`} style={{position: 'relative', display: 'inline-block', marginBottom: '15px'}}>
                                    {selectedLimited.rarity}
                                </div>
                                <div style={{textAlign: 'center', marginBottom: '20px'}}>
                                    <div>Cost: ${selectedLimited.cost}</div>
                                    <div>Current Value: ${(limitedValues[selectedLimited.id] || 0).toFixed(2)}</div>
                                    <div style={{fontSize: '14px', color: '#e74c3c', marginTop: '8px', fontWeight: '800'}}>
                                        Collection item - Cannot be sold!
                                    </div>
                                </div>
                                
                                {priceHistory.length > 1 && (
                                    <div className="modal-chart">
                                        <canvas ref={chartRef} height="120"></canvas>
                                    </div>
                                )}
                                
                                <button onClick={() => { buyLimited(selectedLimited.id, selectedLimited.cost); setSelectedLimited(null); }}
                                    disabled={money < selectedLimited.cost} 
                                    className="modal-button btn btn-success" style={{width: '100%', marginTop: '20px'}}>
                                    BUY ${selectedLimited.cost}
                                </button>
                            </>
                        )}
                        
                        <button onClick={() => { setSelectedBaby(null); setSelectedLimited(null); }} 
                            className="modal-button btn btn-danger" style={{width: '100%', marginTop: '15px'}}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

ReactDOM.render(<AurababyMarket />, document.getElementById('root'));
