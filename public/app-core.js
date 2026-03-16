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

// Keep user logged in across page refreshes
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
let currentUserAuth = null;
let userDocRef = null;
let gameStateLoaded = false;

console.log('Firebase initialized!');

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
    enhancerInventory: {},
    medals: [],
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
    if (!username || !password) { errorDiv.textContent = 'Please enter username and password'; errorDiv.style.display = 'block'; return; }
    try {
        errorDiv.style.display = 'none';
        await auth.signInWithEmailAndPassword(username + '@aurababymarket.app', password);
    } catch (error) {
        errorDiv.textContent = error.code === 'auth/user-not-found' ? 'Username not found' : error.code === 'auth/wrong-password' ? 'Incorrect password' : 'Login failed';
        errorDiv.style.display = 'block';
    }
}

async function signupUser() {
    const username = document.getElementById('signup-username').value.trim().toLowerCase();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;
    const errorDiv = document.getElementById('signup-error');
    if (!username || username.length < 3 || username.length > 20) { errorDiv.textContent = 'Username must be 3-20 characters'; errorDiv.style.display = 'block'; return; }
    if (!/^[a-z0-9_]+$/.test(username)) { errorDiv.textContent = 'Username: letters, numbers, underscores only'; errorDiv.style.display = 'block'; return; }
    if (['admin','moderator','system','guest','official','support'].includes(username)) { errorDiv.textContent = 'Username is reserved'; errorDiv.style.display = 'block'; return; }
    if (password.length < 6) { errorDiv.textContent = 'Password must be 6+ characters'; errorDiv.style.display = 'block'; return; }
    if (password !== confirmPassword) { errorDiv.textContent = 'Passwords do not match'; errorDiv.style.display = 'block'; return; }
    try {
        errorDiv.style.display = 'none';
        const usernameDoc = await db.collection('usernames').doc(username).get();
        if (usernameDoc.exists) { errorDiv.textContent = 'Username taken'; errorDiv.style.display = 'block'; return; }
        const result = await auth.createUserWithEmailAndPassword(username + '@aurababymarket.app', password);
        await db.collection('usernames').doc(username).set({ uid: result.user.uid, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        await db.collection('users').doc(result.user.uid).set({ username, money: 1000, portfolio: {}, limitedInventory: {}, nameTagsOwned: 0, hasChangedName: false, tradeHistory: [], highestMoney: 1000, highestNetWorth: 1000, priceHistory: [], createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    } catch (error) {
        errorDiv.textContent = 'Signup failed: ' + error.message;
        errorDiv.style.display = 'block';
    }
}

async function loginAnonymous() {
    const errorDiv = document.getElementById('login-error');
    try { errorDiv.style.display = 'none'; await auth.signInAnonymously(); }
    catch (error) { errorDiv.textContent = 'Guest login failed'; errorDiv.style.display = 'block'; }
}

async function logoutUser() {
    if (confirm('Logout? Your progress is saved.')) { await saveGameData(); await auth.signOut(); }
}

// Expose auth functions globally so HTML onclick attributes can find them
// (Babel strict mode wraps the file, so functions aren't auto-global)
window.loginUser = loginUser;
window.signupUser = signupUser;
window.loginAnonymous = loginAnonymous;
window.logoutUser = logoutUser;
window.showLogin = showLogin;
window.showSignup = showSignup;

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
        if (!gameStateLoaded) gameStateLoaded = true;
        // Fire event so React component knows to sync immediately
        window.dispatchEvent(new CustomEvent('gameStateLoaded'));
    } else {
        currentUserAuth = null; userDocRef = null; gameStateLoaded = false;
        document.getElementById('auth-container').style.display = 'flex';
        document.getElementById('game-container').style.display = 'none';
        showLogin();
    }
});

async function loadGameData() {
    if (!userDocRef) return;
    try {
        const doc = await userDocRef.get();
        let username = currentUserAuth.isAnonymous ? 'Guest_' + Date.now() : (currentUserAuth.email || '').split('@')[0] || 'Trader';
        if (doc.exists) {
            const data = doc.data();
            window.gameState = { username: data.username || username, money: data.money !== undefined ? data.money : 1000, portfolio: data.portfolio || {}, limitedInventory: data.limitedInventory || {}, enhancerInventory: data.enhancerInventory || {}, medals: data.medals || [], nameTagsOwned: data.nameTagsOwned || 0, hasChangedName: data.hasChangedName || false, tradeHistory: data.tradeHistory || [], highestMoney: data.highestMoney || 1000, highestNetWorth: data.highestNetWorth || 1000, priceHistory: data.priceHistory || [], createdAt: data.createdAt || null };
        } else {
            window.gameState = { username, money: 1000, portfolio: {}, limitedInventory: {}, enhancerInventory: {}, medals: [], nameTagsOwned: 0, hasChangedName: false, tradeHistory: [], highestMoney: 1000, highestNetWorth: 1000, priceHistory: [], createdAt: new Date() };
            await saveGameData();
        }
    } catch (error) { console.error('Load failed:', error); }
}

async function saveGameData() {
    if (!userDocRef || !window.gameState) return;
    try {
        await userDocRef.set({ username: window.gameState.username, money: window.gameState.money, portfolio: window.gameState.portfolio, limitedInventory: window.gameState.limitedInventory, nameTagsOwned: window.gameState.nameTagsOwned, hasChangedName: window.gameState.hasChangedName, tradeHistory: window.gameState.tradeHistory, highestMoney: window.gameState.highestMoney, highestNetWorth: window.gameState.highestNetWorth, priceHistory: window.gameState.priceHistory, createdAt: window.gameState.createdAt || firebase.firestore.FieldValue.serverTimestamp(), lastSaved: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
    } catch (error) { console.error('Save failed:', error); }
}

setInterval(() => { if (currentUserAuth && window.gameState) saveGameData(); }, 30000);
window.addEventListener('beforeunload', () => { if (currentUserAuth && window.gameState) saveGameData(); });

// ========================================
// MULTIPLAYER + PRICE FUNCTIONS
// ========================================
let multiplayerCurrentUser = null;
auth.onAuthStateChanged((user) => { if (user) multiplayerCurrentUser = user; });

async function initializeGlobalPrices(babyIds, limitedItems) {
    if (!db) return;
    try {
        const priceDoc = await db.collection('globalPrices').doc('current').get();
        if (!priceDoc.exists) {
            const babyPrices = {};
            babyIds.forEach(id => { babyPrices[id] = 150; });
            const limitedValues = {};
            limitedItems.forEach(item => { limitedValues[item.id] = (item.minValue + item.maxValue) / 2; });
            await db.collection('globalPrices').doc('current').set({ babyPrices, limitedValues, priceHistory: [{ timestamp: Date.now(), babyPrices: { ...babyPrices }, limitedValues: { ...limitedValues } }], lastUpdate: firebase.firestore.FieldValue.serverTimestamp(), nextUpdateTime: firebase.firestore.Timestamp.fromDate(new Date(Date.now() + 5 * 60 * 1000)), updateCount: 0 });
        }
    } catch (error) { console.error('Init prices failed:', error); }
}

async function forceUpdateGlobalPrices(babies, limitedItems) {
    if (!db) return false;
    try {
        const priceDoc = await db.collection('globalPrices').doc('current').get();
        if (!priceDoc.exists) { await initializeGlobalPrices(babies.map(b => b.id), limitedItems); return true; }
        const d = priceDoc.data();
        const newBP = { ...d.babyPrices };
        const newLV = { ...d.limitedValues };
        babies.forEach(baby => {
            let p = (newBP[baby.id] || 150) * (1 + (Math.random() * 0.3 - 0.15));
            if (p < 10) p = 10; if (p > 1000) p = 1000;
            newBP[baby.id] = Math.round(p * 100) / 100;
        });
        limitedItems.forEach(item => {
            let v = (newLV[item.id] || (item.minValue + item.maxValue) / 2) * (1 + (Math.random() * 0.2 - 0.1));
            if (v < item.minValue) v = item.minValue; if (v > item.maxValue) v = item.maxValue;
            newLV[item.id] = Math.round(v * 100) / 100;
        });
        const ph = d.priceHistory || [];
        ph.push({ timestamp: Date.now(), babyPrices: { ...newBP }, limitedValues: { ...newLV } });
        if (ph.length > 50) ph.shift();
        await db.collection('globalPrices').doc('current').update({ babyPrices: newBP, limitedValues: newLV, priceHistory: ph, lastUpdate: firebase.firestore.FieldValue.serverTimestamp(), nextUpdateTime: firebase.firestore.Timestamp.fromDate(new Date(Date.now() + 5 * 60 * 1000)), updateCount: (d.updateCount || 0) + 1 });
        return true;
    } catch (error) { console.error('Update failed:', error); return false; }
}

function listenToGlobalPrices(callback) {
    if (!db) return () => {};
    return db.collection('globalPrices').doc('current').onSnapshot((doc) => {
        if (doc.exists) {
            const d = doc.data();
            callback({ babyPrices: d.babyPrices || {}, limitedValues: d.limitedValues || {}, priceHistory: d.priceHistory || [], lastUpdate: d.lastUpdate, nextUpdateTime: d.nextUpdateTime, updateCount: d.updateCount || 0 });
        }
    });
}

async function updateLeaderboard(playerData) {
    if (!multiplayerCurrentUser || !db) return;
    try {
        const netWorth = playerData.money + playerData.portfolioValue + playerData.limitedValue;
        await db.collection('leaderboard').doc(multiplayerCurrentUser.uid).set({ username: playerData.username, netWorth, money: playerData.money, portfolioValue: playerData.portfolioValue, limitedValue: playerData.limitedValue, totalTrades: playerData.tradeHistory.length, babiesOwned: Object.values(playerData.portfolio).reduce((acc,q)=>acc+q,0), limitedsOwned: Object.values(playerData.limitedInventory).reduce((acc,a)=>acc+a.length,0), lastUpdated: firebase.firestore.FieldValue.serverTimestamp() });
    } catch (error) { console.error('Leaderboard update failed:', error); }
}

async function loadLeaderboard() {
    if (!db) return [];
    try {
        const snap = await db.collection('leaderboard').orderBy('netWorth','desc').limit(10).get();
        const leaders = [];
        snap.forEach(doc => leaders.push({ id: doc.id, ...doc.data(), isCurrentUser: multiplayerCurrentUser && doc.id === multiplayerCurrentUser.uid }));
        return leaders;
    } catch (error) { return []; }
}

async function loadAllPlayers() {
    if (!db) return [];
    try {
        const snap = await db.collection('leaderboard').orderBy('lastUpdated','desc').get();
        const players = []; const now = Date.now();
        snap.forEach(doc => {
            const d = doc.data();
            const lastUpdate = d.lastUpdated ? d.lastUpdated.toMillis() : 0;
            players.push({ id: doc.id, ...d, isOnline: (now - lastUpdate) < 5 * 60 * 1000, isCurrentUser: multiplayerCurrentUser && doc.id === multiplayerCurrentUser.uid });
        });
        return players;
    } catch (error) { return []; }
}

// ========================================
// TRADING SYSTEM - FIREBASE FUNCTIONS
// ========================================

async function sendTradeOffer(toUid, toUsername, myOffer, theirRequest, moneyOffer = 0, moneyRequest = 0) {
    if (!multiplayerCurrentUser || !db) return null;
    try {
        if (myOffer.length > 6 || theirRequest.length > 6) { alert('Maximum 6 items per side!'); return null; }
        const ref = await db.collection('tradeOffers').add({
            fromUid: multiplayerCurrentUser.uid,
            fromUsername: window.gameState.username,
            toUid,
            toUsername,
            myOffer,
            theirRequest,
            moneyOffer: moneyOffer || 0,
            moneyRequest: moneyRequest || 0,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return ref.id;
    } catch (error) { console.error('Send trade failed:', error); return null; }
}

async function loadMyTrades() {
    if (!multiplayerCurrentUser || !db) return { sent: [], received: [] };
    try {
        const sentSnap = await db.collection('tradeOffers').where('fromUid','==',multiplayerCurrentUser.uid).where('status','==','pending').orderBy('createdAt','desc').get();
        const recvSnap = await db.collection('tradeOffers').where('toUid','==',multiplayerCurrentUser.uid).where('status','==','pending').orderBy('createdAt','desc').get();
        const sent = [], received = [];
        sentSnap.forEach(doc => sent.push({ id: doc.id, ...doc.data() }));
        recvSnap.forEach(doc => received.push({ id: doc.id, ...doc.data() }));
        return { sent, received };
    } catch (error) { return { sent: [], received: [] }; }
}

function listenToIncomingTrades(callback) {
    if (!multiplayerCurrentUser || !db) return () => {};
    return db.collection('tradeOffers')
        .where('toUid','==',multiplayerCurrentUser.uid)
        .where('status','==','pending')
        .onSnapshot(snap => {
            const trades = [];
            snap.forEach(doc => trades.push({ id: doc.id, ...doc.data() }));
            callback(trades);
        });
}

async function acceptTrade(tradeId, tradeData) {
    if (!multiplayerCurrentUser || !db) return false;
    try {
        const myDoc = await db.collection('users').doc(multiplayerCurrentUser.uid).get();
        const theirDoc = await db.collection('users').doc(tradeData.fromUid).get();
        if (!myDoc.exists || !theirDoc.exists) { alert('Error: User data not found'); return false; }
        const myData = myDoc.data();
        const theirData = theirDoc.data();

        // Validate I have what they're requesting
        for (const item of tradeData.theirRequest) {
            if (item.type === 'baby') {
                if ((myData.portfolio?.[item.id] || 0) < item.quantity) { alert(`You don't have enough ${item.name} (need ${item.quantity}, have ${myData.portfolio?.[item.id] || 0})`); return false; }
            } else if (item.type === 'limited') {
                if ((myData.limitedInventory?.[item.id]?.length || 0) < item.quantity) { alert(`You don't have enough ${item.name}`); return false; }
            } else if (item.type === 'enhancer') {
                if ((myData.enhancerInventory?.[item.id] || 0) < item.quantity) { alert(`You don't have enough ${item.name}`); return false; }
            }
        }
        // Validate they still have what they offered
        for (const item of tradeData.myOffer) {
            if (item.type === 'baby') {
                if ((theirData.portfolio?.[item.id] || 0) < item.quantity) { alert(`${tradeData.fromUsername} no longer has enough ${item.name}`); return false; }
            } else if (item.type === 'limited') {
                if ((theirData.limitedInventory?.[item.id]?.length || 0) < item.quantity) { alert(`${tradeData.fromUsername} no longer has enough ${item.name}`); return false; }
            } else if (item.type === 'enhancer') {
                if ((theirData.enhancerInventory?.[item.id] || 0) < item.quantity) { alert(`${tradeData.fromUsername} no longer has enough ${item.name}`); return false; }
            }
        }

        const myNewPortfolio = { ...myData.portfolio };
        const myNewLI = JSON.parse(JSON.stringify(myData.limitedInventory || {}));
        const myNewEI = { ...(myData.enhancerInventory || {}) };
        const theirNewPortfolio = { ...theirData.portfolio };
        const theirNewLI = JSON.parse(JSON.stringify(theirData.limitedInventory || {}));
        const theirNewEI = { ...(theirData.enhancerInventory || {}) };

        // I give them theirRequest items
        for (const item of tradeData.theirRequest) {
            if (item.type === 'baby') {
                myNewPortfolio[item.id] = (myNewPortfolio[item.id] || 0) - item.quantity;
                theirNewPortfolio[item.id] = (theirNewPortfolio[item.id] || 0) + item.quantity;
            } else if (item.type === 'enhancer') {
                myNewEI[item.id] = (myNewEI[item.id] || 0) - item.quantity;
                theirNewEI[item.id] = (theirNewEI[item.id] || 0) + item.quantity;
            } else {
                const toMove = (myNewLI[item.id] || []).splice(0, item.quantity);
                theirNewLI[item.id] = [...(theirNewLI[item.id] || []), ...toMove];
            }
        }
        // I get their myOffer items
        for (const item of tradeData.myOffer) {
            if (item.type === 'baby') {
                theirNewPortfolio[item.id] = (theirNewPortfolio[item.id] || 0) - item.quantity;
                myNewPortfolio[item.id] = (myNewPortfolio[item.id] || 0) + item.quantity;
            } else if (item.type === 'enhancer') {
                theirNewEI[item.id] = (theirNewEI[item.id] || 0) - item.quantity;
                myNewEI[item.id] = (myNewEI[item.id] || 0) + item.quantity;
            } else {
                const toMove = (theirNewLI[item.id] || []).splice(0, item.quantity);
                myNewLI[item.id] = [...(myNewLI[item.id] || []), ...toMove];
            }
        }

        // Handle money
        const moneyOffer = tradeData.moneyOffer || 0;
        const moneyRequest = tradeData.moneyRequest || 0;
        if (moneyRequest > 0 && (myData.money || 0) < moneyRequest) {
            alert(`You don't have enough money (need $${moneyRequest.toLocaleString()})`); return false;
        }
        if (moneyOffer > 0 && (theirData.money || 0) < moneyOffer) {
            alert(`${tradeData.fromUsername} no longer has enough money`); return false;
        }
        const myNewMoney = (myData.money || 0) - moneyRequest + moneyOffer;
        const theirNewMoney = (theirData.money || 0) - moneyOffer + moneyRequest;

        const batch = db.batch();
        batch.update(db.collection('users').doc(multiplayerCurrentUser.uid), {
            portfolio: myNewPortfolio, limitedInventory: myNewLI, enhancerInventory: myNewEI, money: myNewMoney
        });
        batch.update(db.collection('users').doc(tradeData.fromUid), {
            portfolio: theirNewPortfolio, limitedInventory: theirNewLI, enhancerInventory: theirNewEI, money: theirNewMoney
        });
        batch.update(db.collection('tradeOffers').doc(tradeId), { status: 'accepted', acceptedAt: firebase.firestore.FieldValue.serverTimestamp() });
        await batch.commit();

        window.gameState.portfolio = myNewPortfolio;
        window.gameState.limitedInventory = myNewLI;
        window.gameState.enhancerInventory = myNewEI;
        window.gameState.money = myNewMoney;
        await saveGameData();
        return true;
    } catch (error) { console.error('Accept trade failed:', error); alert('Trade failed: ' + error.message); return false; }
}

async function declineTrade(tradeId) {
    if (!db) return;
    try {
        await db.collection('tradeOffers').doc(tradeId).update({ status: 'declined', declinedAt: firebase.firestore.FieldValue.serverTimestamp() });
    } catch (error) { console.error('Decline trade failed:', error); }
}

async function loadPlayerInventory(uid) {
    if (!db) return null;
    try {
        const doc = await db.collection('users').doc(uid).get();
        if (!doc.exists) return null;
        const d = doc.data();
        return {
            portfolio: d.portfolio || {},
            limitedInventory: d.limitedInventory || {},
            enhancerInventory: d.enhancerInventory || {},
            money: d.money || 0
        };
    } catch(e) { console.error('loadPlayerInventory failed:', e); return null; }
}

async function awardMonthlyMedals() {
    if (!db || !multiplayerCurrentUser) return;
    try {
        const metaRef = db.collection('meta').doc('medalAward');
        const metaDoc = await metaRef.get();
        const now = new Date();
        const thisMonth = `${now.getFullYear()}-${now.getMonth()+1}`;

        if (metaDoc.exists && metaDoc.data().lastAwardedMonth === thisMonth) return; // already done

        // Get top 3
        const snap = await db.collection('leaderboard').orderBy('netWorth','desc').limit(3).get();
        const top3 = snap.docs.map((doc, i) => ({ uid: doc.id, username: doc.data().username, place: i + 1 }));

        const medalDefs = {
            1: { emoji: '🥇', name: 'Gold Champion', desc: `#1 of ${now.toLocaleString('default',{month:'long'})} ${now.getFullYear()}` },
            2: { emoji: '🥈', name: 'Silver Runner-up', desc: `#2 of ${now.toLocaleString('default',{month:'long'})} ${now.getFullYear()}` },
            3: { emoji: '🥉', name: 'Bronze Contender', desc: `#3 of ${now.toLocaleString('default',{month:'long'})} ${now.getFullYear()}` }
        };

        const batch = db.batch();
        for (const player of top3) {
            const medal = { ...medalDefs[player.place], awardedAt: now.toISOString(), month: thisMonth };
            const userRef = db.collection('users').doc(player.uid);
            const userDoc = await userRef.get();
            if (userDoc.exists) {
                const existing = userDoc.data().medals || [];
                batch.update(userRef, { medals: [...existing, medal] });
            }
        }
        batch.set(metaRef, { lastAwardedMonth: thisMonth, awardedAt: firebase.firestore.FieldValue.serverTimestamp(), top3 });
        await batch.commit();
        console.log('🏅 Monthly medals awarded!', top3.map(p=>p.username));
        return top3;
    } catch(e) { console.error('awardMonthlyMedals failed:', e); return null; }
}

window.multiplayer = {
    initializeGlobalPrices, forceUpdateGlobalPrices, listenToGlobalPrices,
    updateLeaderboard, loadLeaderboard, loadAllPlayers, loadPlayerInventory,
    sendTradeOffer, loadMyTrades, listenToIncomingTrades, acceptTrade, declineTrade,
    awardMonthlyMedals
};

console.log('Multiplayer ready!');