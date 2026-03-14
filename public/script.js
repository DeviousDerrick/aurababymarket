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
            window.gameState = { username: data.username || username, money: data.money !== undefined ? data.money : 1000, portfolio: data.portfolio || {}, limitedInventory: data.limitedInventory || {}, nameTagsOwned: data.nameTagsOwned || 0, hasChangedName: data.hasChangedName || false, tradeHistory: data.tradeHistory || [], highestMoney: data.highestMoney || 1000, highestNetWorth: data.highestNetWorth || 1000, priceHistory: data.priceHistory || [], createdAt: data.createdAt || null };
        } else {
            window.gameState = { username, money: 1000, portfolio: {}, limitedInventory: {}, nameTagsOwned: 0, hasChangedName: false, tradeHistory: [], highestMoney: 1000, highestNetWorth: 1000, priceHistory: [], createdAt: new Date() };
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
        await db.collection('leaderboard').doc(multiplayerCurrentUser.uid).set({ username: playerData.username, netWorth, money: playerData.money, portfolioValue: playerData.portfolioValue, limitedValue: playerData.limitedValue, totalTrades: playerData.tradeHistory.length, babiesOwned: Object.values(playerData.portfolio).reduce((s,q)=>s+q,0), limitedsOwned: Object.values(playerData.limitedInventory).reduce((s,a)=>s+a.length,0), lastUpdated: firebase.firestore.FieldValue.serverTimestamp() });
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

// ========================================
// REACT GAME COMPONENT
// ========================================
const { useState, useEffect, useRef } = React;

function isMarketOpen() { const h = new Date().getHours(); return h >= 9 && h < 21; }
function formatTime(s) { return `${Math.floor(s/60)}m ${s%60}s`; }
function getTimeUntilMarketChange() {
    const now = new Date(); const hour = now.getHours();
    if (hour < 9) { const o = new Date(now); o.setHours(9,0,0,0); return Math.floor((o-now)/1000); }
    if (hour >= 21) { const o = new Date(now); o.setDate(o.getDate()+1); o.setHours(9,0,0,0); return Math.floor((o-now)/1000); }
    const c = new Date(now); c.setHours(21,0,0,0); return Math.floor((c-now)/1000);
}
function getTimeUntilNextPriceUpdate(ts) {
    if (!ts) return 120;
    const next = ts.toMillis ? ts.toMillis() : ts;
    const diff = Math.floor((next - Date.now()) / 1000);
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
        { id: 22, name: 'Justicen', image: 'https://i.ibb.co/dwkHnD65/Justicebaby.jpg' },
        { id: 23, name: '10k Visitor Baby', image: 'https://i.ibb.co/LXtBYtRS/10kvsitorbaby.jpg' },
        { id: 24, name: 'Celestial Baby', image: 'https://i.ibb.co/ZrRkg40/celestialbaby.png' },
        { id: 25, name: 'Divine Baby', image: 'https://i.ibb.co/4wbYY3hJ/divinebaby.png' },
        { id: 26, name: 'Magma Baby', image: 'https://i.ibb.co/0y0N7y48/magmababy.jpg' },
        { id: 27, name: 'Electricity Baby', image: 'https://i.ibb.co/VcSNb6Th/electrcitiybaby.jpg' },
        { id: 28, name: 'Robotic Baby', image: 'https://i.ibb.co/6RGq7HLH/robotbaby.jpg' },
        { id: 29, name: 'Pirate Baby', image: 'https://i.ibb.co/9HSx5QG5/piratebaby.jpg' },
        { id: 30, name: 'Vampire Baby', image: 'https://i.ibb.co/JZ8Q7B8/vampirebaby.jpg' },
        { id: 31, name: 'Golem Baby', image: 'https://i.ibb.co/N6WJfmNm/golembaby.jpg' },
        { id: 32, name: 'Chrono Warden Baby', image: 'https://i.ibb.co/0RHM9TJJ/chronowardenbaby.jpg' },
        { id: 33, name: 'Soul Baby', image: 'https://i.ibb.co/zhJ5PpWm/soulbaby.jpg' },
        { id: 34, name: 'Veil Baby', image: 'https://i.ibb.co/8LxwP1b8/veil.jpg' },
        { id: 35, name: 'Ringmaster Baby', image: 'https://i.ibb.co/dspvJHkq/fancybaby.jpg' }
    ];

    const limitedItems = typeof LIMITEDS !== 'undefined' ? LIMITEDS : [];
    const allEnhancers = typeof ENHANCERS !== 'undefined' ? ENHANCERS : [];

    const [money, setMoney] = useState(1000);
    const [username, setUsername] = useState('Player');
    const [nameTagsOwned, setNameTagsOwned] = useState(0);
    const [hasChangedName, setHasChangedName] = useState(false);
    const [portfolio, setPortfolio] = useState({});
    const [limitedInventory, setLimitedInventory] = useState({});
    const [tradeHistory, setTradeHistory] = useState([]);
    const [enhancerInventory, setEnhancerInventory] = useState({});
    const [prices, setPrices] = useState({});
    const [limitedValues, setLimitedValues] = useState({});
    const [priceHistory, setPriceHistory] = useState([]);
    const [nextUpdateTime, setNextUpdateTime] = useState(null);
    const [updateCount, setUpdateCount] = useState(0);
    const [showUpdateNotice, setShowUpdateNotice] = useState(false);
    const [pricesLoaded, setPricesLoaded] = useState(false);
    const [marketOpen, setMarketOpen] = useState(isMarketOpen());
    const [timeUntilChange, setTimeUntilChange] = useState(getTimeUntilMarketChange());
    const [timeUntilPriceUpdate, setTimeUntilPriceUpdate] = useState(120);
    const [currentView, setCurrentView] = useState('market');
    const [limitedFilter, setLimitedFilter] = useState('all');
    const [selectedBaby, setSelectedBaby] = useState(null);
    const [selectedLimited, setSelectedLimited] = useState(null);
    const [showNameChange, setShowNameChange] = useState(false);
    const [newName, setNewName] = useState('');
    const [leaderboard, setLeaderboard] = useState([]);
    const [allPlayers, setAllPlayers] = useState([]);
    const [medals, setMedals] = useState([]);

    // Enhancer state
    const [enhancerFilter, setEnhancerFilter] = useState('all');
    const [applyModal, setApplyModal] = useState(null);
    const [pickEnhModal, setPickEnhModal] = useState(false);

    // Trade state
    const [showTradeModal, setShowTradeModal] = useState(false);
    const [moneyOffer, setMoneyOffer] = useState(0);
    const [moneyRequest, setMoneyRequest] = useState(0);
    const [tradeTargetData, setTradeTargetData] = useState(null);
    const [tradeTarget, setTradeTarget] = useState(null);
    const [myOffer, setMyOffer] = useState([]);
    const [theirRequest, setTheirRequest] = useState([]);
    const [incomingTrades, setIncomingTrades] = useState([]);
    const [sentTrades, setSentTrades] = useState([]);
    const [tradeTab, setTradeTab] = useState('players');
    const [addingSlot, setAddingSlot] = useState(null);
    const [tradeSuccess, setTradeSuccess] = useState('');

    const previousPricesRef = useRef({});
    const chartRef = useRef(null);

    useEffect(() => {
        if (window.gameState) {
            setUsername(window.gameState.username || 'Player');
            setMoney(window.gameState.money || 1000);
            setPortfolio(window.gameState.portfolio || {});
            setLimitedInventory(window.gameState.limitedInventory || {});
            setTradeHistory(window.gameState.tradeHistory || []);
            setNameTagsOwned(window.gameState.nameTagsOwned || 0);
            setHasChangedName(window.gameState.hasChangedName || false);
            setEnhancerInventory(window.gameState.enhancerInventory || {});
            setMedals(window.gameState.medals || []);
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
                setEnhancerInventory(window.gameState.enhancerInventory || {});
                setMedals(window.gameState.medals || []);
            }
        }, 1000);
        return () => clearInterval(syncInterval);
    }, []);

    useEffect(() => {
        window.multiplayer.initializeGlobalPrices(babies.map(b => b.id), limitedItems);
        const unsub = window.multiplayer.listenToGlobalPrices((priceData) => {
            previousPricesRef.current = { ...prices };
            setPrices(priceData.babyPrices); setLimitedValues(priceData.limitedValues);
            setPriceHistory(priceData.priceHistory || []); setNextUpdateTime(priceData.nextUpdateTime);
            setUpdateCount(priceData.updateCount); setPricesLoaded(true);
            if (priceData.updateCount > 0) { setShowUpdateNotice(true); setTimeout(() => setShowUpdateNotice(false), 5000); }
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        const t = setInterval(() => { if (nextUpdateTime) setTimeUntilPriceUpdate(getTimeUntilNextPriceUpdate(nextUpdateTime)); }, 1000);
        return () => clearInterval(t);
    }, [nextUpdateTime]);

    useEffect(() => {
        if (!pricesLoaded) return;
        const t = setInterval(() => { if (marketOpen) window.multiplayer.forceUpdateGlobalPrices(babies, limitedItems); }, 5 * 60 * 1000);
        return () => clearInterval(t);
    }, [marketOpen, pricesLoaded]);

    useEffect(() => {
        const t = setInterval(() => { setMarketOpen(isMarketOpen()); setTimeUntilChange(getTimeUntilMarketChange()); }, 60000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        const t = setInterval(() => { setMoney(prev => { const n = prev + 200; window.gameState.money = n; saveGameData(); return n; }); }, 90000);
        return () => clearInterval(t);
    }, []);

    // Real-time incoming trades listener
    useEffect(() => {
        const unsub = window.multiplayer.listenToIncomingTrades((trades) => { setIncomingTrades(trades); });
        return () => unsub();
    }, []);

    useEffect(() => {
        if (currentView === 'leaderboard') window.multiplayer.loadLeaderboard().then(setLeaderboard);
        if (currentView === 'trade') {
            window.multiplayer.loadAllPlayers().then(setAllPlayers);
            window.multiplayer.loadMyTrades().then(({ sent }) => setSentTrades(sent));
        }
    }, [currentView]);

    const getPortfolioValue = () => {
        let t = 0;
        Object.keys(portfolio).forEach(id => { t += (portfolio[id] || 0) * (prices[id] || 0); });
        return Math.round(t * 100) / 100;
    };
    const getLimitedValue = () => {
        let t = 0;
        Object.keys(limitedInventory).forEach(id => { t += (limitedInventory[id]?.length || 0) * (limitedValues[id] || 0); });
        return Math.round(t * 100) / 100;
    };
    const getPriceChange = (id) => {
        const o = previousPricesRef.current[id]; const n = prices[id];
        if (!o || !n || o === n) return null;
        return { direction: n > o ? 'up' : 'down', percentage: Math.abs(((n - o) / o * 100).toFixed(1)) };
    };

    const buyBaby = (babyId, price) => {
        if (!marketOpen) { alert('Market closed! Hours: 9 AM - 9 PM'); return; }
        if (money >= price) {
            const nm = money - price;
            const np = { ...portfolio, [babyId]: (portfolio[babyId] || 0) + 1 };
            const nt = { id: Date.now(), type: 'BUY', babyName: babies.find(b => b.id === babyId).name, price, timestamp: new Date().toLocaleString() };
            const nh = [nt, ...tradeHistory];
            setMoney(nm); setPortfolio(np); setTradeHistory(nh);
            window.gameState.money = nm; window.gameState.portfolio = np; window.gameState.tradeHistory = nh;
            saveGameData();
            window.multiplayer.updateLeaderboard({ username, money: nm, portfolioValue: getPortfolioValue(), limitedValue: getLimitedValue(), portfolio: np, limitedInventory, tradeHistory: nh });
        }
    };

    const sellBaby = (babyId, price) => {
        if (!marketOpen) { alert('Market closed!'); return; }
        if (portfolio[babyId] && portfolio[babyId] > 0) {
            const nm = money + price;
            const np = { ...portfolio, [babyId]: portfolio[babyId] - 1 };
            const nt = { id: Date.now(), type: 'SELL', babyName: babies.find(b => b.id === babyId).name, price, timestamp: new Date().toLocaleString() };
            const nh = [nt, ...tradeHistory];
            setMoney(nm); setPortfolio(np); setTradeHistory(nh);
            window.gameState.money = nm; window.gameState.portfolio = np; window.gameState.tradeHistory = nh;
            saveGameData();
        }
    };

    const buyLimited = (itemId, cost) => {
        if (money >= cost) {
            const nm = money - cost;
            const item = limitedItems.find(i => i.id === itemId);
            const serial = Date.now();
            const ni = { ...limitedInventory, [itemId]: [...(limitedInventory[itemId] || []), { serial, purchaseDate: new Date().toISOString() }] };
            const nt = { id: Date.now(), type: 'BUY_LIMITED', babyName: item.name + ' #' + serial, price: cost, timestamp: new Date().toLocaleString() };
            const nh = [nt, ...tradeHistory];
            setMoney(nm); setLimitedInventory(ni); setTradeHistory(nh);
            window.gameState.money = nm; window.gameState.limitedInventory = ni; window.gameState.tradeHistory = nh;
            saveGameData();
        }
    };

    const handleNameChange = async () => {
        if (!newName || newName.length < 3 || newName.length > 20) { alert('Username must be 3-20 characters'); return; }
        if (!/^[a-z0-9_]+$/i.test(newName)) { alert('Only letters, numbers, underscores'); return; }
        const cost = hasChangedName ? 10000 : 0;
        if (money < cost) { alert('Not enough money! Need $10,000'); return; }
        const nm = money - cost;
        const nnt = hasChangedName ? nameTagsOwned + 1 : nameTagsOwned;
        setUsername(newName); setMoney(nm); setNameTagsOwned(nnt); setHasChangedName(true); setShowNameChange(false); setNewName('');
        window.gameState.username = newName; window.gameState.money = nm; window.gameState.nameTagsOwned = nnt; window.gameState.hasChangedName = true;
        saveGameData();
        alert(hasChangedName ? `Name changed to "${newName}"! +1 Name Tag!` : `Name set to "${newName}"! (First change free)`);
    };

    // ---- TRADING ----
    const openTradeWith = async (player) => {
        setTradeTarget(player);
        setMyOffer([]); setTheirRequest([]);
        setMoneyOffer(0); setMoneyRequest(0);
        setTradeTargetData(null);
        setShowTradeModal(true); setAddingSlot(null);
        // Load their actual inventory so we only show what they own
        const inv = await window.multiplayer.loadPlayerInventory(player.id);
        setTradeTargetData(inv);
    };

    // Check and award monthly medals on the 15th
    useEffect(() => {
        const now = new Date();
        if (now.getDate() === 15) {
            window.multiplayer.awardMonthlyMedals().then(winners => {
                if (winners) {
                    const me = winners.find(w => w.uid === multiplayerCurrentUser?.uid);
                    if (me) {
                        setTimeout(() => alert(`🏅 Congratulations! You placed #${me.place} this month and earned a medal!`), 2000);
                        // Reload medals from Firebase
                        loadGameData().then(() => {
                            if (window.gameState.medals) setMedals(window.gameState.medals);
                        });
                    }
                }
            });
        }
    }, []);

    // ── QTY PICKER ITEM: inline quantity selector so no prompt() needed ──
    const QtyPickerItem = ({ label, sub, emoji, imgSrc, max, onAdd }) => {
        const [qty, setQty] = React.useState(1);
        const capped = Math.min(qty, max === 9999 ? qty : max);
        return (
            <div style={{background:'white',border:'2px solid #e0e0e0',borderRadius:'12px',padding:'10px',width:'118px',textAlign:'center',flexShrink:0,boxShadow:'0 2px 6px rgba(0,0,0,0.07)'}}>
                {imgSrc
                    ? <img src={imgSrc} alt={label} style={{width:'52px',height:'52px',objectFit:'cover',borderRadius:'8px',marginBottom:'5px'}} />
                    : <div style={{fontSize:'30px',marginBottom:'5px'}}>{emoji}</div>}
                <div style={{fontSize:'11px',fontWeight:'800',color:'#2c3e50',marginBottom:'2px',lineHeight:'1.3',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'98px'}}>{label}</div>
                <div style={{fontSize:'10px',color:'#888',marginBottom:'7px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'98px'}}>{sub}</div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'5px',marginBottom:'7px'}}>
                    <button onMouseDown={e=>{e.preventDefault();setQty(q=>Math.max(1,q-1));}}
                        style={{width:'24px',height:'24px',borderRadius:'50%',border:'2px solid #667eea',background:'white',cursor:'pointer',fontWeight:'900',fontSize:'16px',lineHeight:'1',padding:'0'}}>−</button>
                    <span style={{fontWeight:'800',fontSize:'15px',minWidth:'24px',textAlign:'center'}}>{capped}</span>
                    <button onMouseDown={e=>{e.preventDefault();setQty(q=>q+1);}}
                        style={{width:'24px',height:'24px',borderRadius:'50%',border:'2px solid #667eea',background:'white',cursor:'pointer',fontWeight:'900',fontSize:'16px',lineHeight:'1',padding:'0'}}>+</button>
                </div>
                <button onMouseDown={e=>{e.preventDefault();onAdd(capped);setQty(1);}}
                    style={{width:'100%',padding:'7px',border:'none',borderRadius:'8px',background:'linear-gradient(135deg,#667eea,#764ba2)',color:'white',fontWeight:'800',fontSize:'12px',cursor:'pointer'}}>
                    Add ×{capped}
                </button>
            </div>
        );
    };

    const addTradeSlot = (side, type, item, quantity) => {
        const list = side === 'offer' ? myOffer : theirRequest;
        const existing = list.find(x => x.type === type && x.id === item.id);
        if (list.length >= 6 && !existing) { alert('Max 6 items per side!'); setAddingSlot(null); return; }
        const emoji = (type === 'limited' || type === 'enhancer') ? item.emoji : '👶';
        const extra = type === 'enhancer' ? { boost: item.boost, rarity: item.rarity } : {};
        const slot = { type, id: item.id, name: item.name, emoji, quantity, ...extra };
        if (side === 'offer') {
            setMyOffer(prev => {
                const ex = prev.find(s => s.type === type && s.id === item.id);
                return ex ? prev.map(s => s.type === type && s.id === item.id ? { ...s, quantity: s.quantity + quantity } : s) : [...prev, slot];
            });
        } else {
            setTheirRequest(prev => {
                const ex = prev.find(s => s.type === type && s.id === item.id);
                return ex ? prev.map(s => s.type === type && s.id === item.id ? { ...s, quantity: s.quantity + quantity } : s) : [...prev, slot];
            });
        }
        setAddingSlot(null);
    };

    const removeTradeSlot = (side, index) => {
        if (side === 'offer') setMyOffer(p => p.filter((_,i) => i !== index));
        else setTheirRequest(p => p.filter((_,i) => i !== index));
    };

    const submitTradeOffer = async () => {
        if (!tradeTarget) return;
        if (myOffer.length === 0 && theirRequest.length === 0 && moneyOffer === 0 && moneyRequest === 0) {
            alert('Add at least one item or some money to the trade!'); return;
        }
        if (moneyOffer > 0 && moneyOffer > money) { alert(`You only have $${money.toLocaleString()}`); return; }
        for (const slot of myOffer) {
            if (slot.type === 'baby' && (portfolio[slot.id] || 0) < slot.quantity) { alert(`You don't have ${slot.quantity}x ${slot.name}`); return; }
            if (slot.type === 'limited' && (limitedInventory[slot.id]?.length || 0) < slot.quantity) { alert(`You don't have ${slot.quantity}x ${slot.name}`); return; }
            if (slot.type === 'enhancer' && (enhancerInventory[slot.id] || 0) < slot.quantity) { alert(`You don't have ${slot.quantity}x ${slot.name}`); return; }
        }
        const offerId = await window.multiplayer.sendTradeOffer(
            tradeTarget.id, tradeTarget.username, myOffer, theirRequest, moneyOffer, moneyRequest
        );
        if (offerId) {
            setShowTradeModal(false);
            setMoneyOffer(0); setMoneyRequest(0);
            setTradeSuccess(`Trade offer sent to ${tradeTarget.username}!`);
            setTimeout(() => setTradeSuccess(''), 4000);
            window.multiplayer.loadMyTrades().then(({ sent }) => setSentTrades(sent));
        } else {
            alert('Failed to send trade. Try again.');
        }
    };

    const handleAcceptTrade = async (trade) => {
        const ok = await window.multiplayer.acceptTrade(trade.id, trade);
        if (ok) { setTradeSuccess('Trade accepted! Items have been swapped.'); setTimeout(() => setTradeSuccess(''), 4000); }
    };

    const handleDeclineTrade = async (tradeId) => {
        await window.multiplayer.declineTrade(tradeId);
    };

    const getFilteredLimiteds = () => limitedFilter === 'all' ? limitedItems : limitedItems.filter(i => i.rarity.toLowerCase() === limitedFilter);

    useEffect(() => {
        if (chartRef.current && (selectedBaby || selectedLimited) && priceHistory.length > 1) {
            const ctx = chartRef.current.getContext('2d');
            if (window.itemChart) window.itemChart.destroy();
            const labels = priceHistory.map(p => new Date(p.timestamp).toLocaleTimeString());
            let data = [], label = '';
            if (selectedBaby) { data = priceHistory.map(p => p.babyPrices[selectedBaby.id] || 0); label = selectedBaby.name; }
            else { data = priceHistory.map(p => p.limitedValues[selectedLimited.id] || 0); label = selectedLimited.name; }
            window.itemChart = new Chart(ctx, { type: 'line', data: { labels, datasets: [{ label, data, borderColor: '#667eea', backgroundColor: 'rgba(102,126,234,0.1)', borderWidth: 3, fill: true, tension: 0.4 }] }, options: { responsive: true, maintainAspectRatio: true } });
        }
    }, [selectedBaby, selectedLimited, priceHistory]);

    if (!pricesLoaded) return (
        <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>
            <div className="loading-spinner"></div>
            <h2>Loading global prices...</h2>
        </div>
    );

    const pendingCount = incomingTrades.length;

    // Inline styles for trade UI
    const tradeSlotStyle = (color) => ({ background: color === 'red' ? '#fdf2f2' : '#eafaf1', border: `2px solid ${color === 'red' ? '#e74c3c' : '#27ae60'}`, borderRadius: '10px', padding: '10px 12px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' });
    const pickerItemStyle = { background: 'white', border: '2px solid #e0e0e0', borderRadius: '10px', padding: '10px', cursor: 'pointer', textAlign: 'center', minWidth: '95px', transition: 'border-color 0.2s' };

    return (
        <>
            {/* HEADER */}
            <div className="game-header">
                <div className="header-left">
                    <div className="header-title">Aurababy Market</div>
                    <div className="username-display" onClick={() => setShowNameChange(true)}>
                        <span>👤</span><span>{username}</span>
                        {nameTagsOwned > 0 && <span>🏷️{nameTagsOwned}</span>}
                    </div>
                </div>
                <div className="header-right">
                    <div className="header-stat"><div className="header-stat-label">CASH</div><div className="header-stat-value">${money.toLocaleString()}</div></div>
                    <div className="header-stat"><div className="header-stat-label">NET WORTH</div><div className="header-stat-value">${(money + getPortfolioValue() + getLimitedValue()).toLocaleString()}</div></div>
                    <button onClick={logoutUser} className="logout-btn">Logout</button>
                </div>
            </div>

            {/* NAV */}
            <div className="nav-tabs">
                {[
                    ['market','🏪 Market'],
                    ['limited','💎 Limiteds (300)'],
                    ['enhancers','🧪 Enhancers'],
                    ['portfolio','📊 Portfolio'],
                    ['profile','👤 Profile'],
                    ['trades','📜 History'],
                    ['trade', pendingCount > 0 ? `🤝 Trade 🔴${pendingCount}` : '🤝 Trade'],
                    ['leaderboard','🏆 Leaderboard']
                ].map(([v, label]) => (
                    <button key={v} onClick={() => setCurrentView(v)} className={`nav-tab ${currentView === v ? 'active' : ''}`}>{label}</button>
                ))}
            </div>

            <div className="main-content">
                {showUpdateNotice && <div className="banner banner-update">🔥 PRICES UPDATED! #{updateCount}</div>}
                {tradeSuccess && (
                    <div className="banner" style={{background:'linear-gradient(135deg,#27ae60,#229954)',marginBottom:'15px'}}>
                        ✅ {tradeSuccess}
                    </div>
                )}

                {/* MARKET */}
                {currentView === 'market' && (
                    <div>
                        <h1 className="view-title">🏪 Baby Market</h1>
                        {marketOpen
                            ? <div className="banner banner-open">✅ Market Open | Next update: {formatTime(timeUntilPriceUpdate)} | #{updateCount}</div>
                            : <div className="banner banner-closed">❌ Market Closed | Opens in: {formatTime(timeUntilChange)}</div>}
                        <div className="card-grid">
                            {babies.map(baby => {
                                const price = prices[baby.id] || 150;
                                const owned = portfolio[baby.id] || 0;
                                const pc = getPriceChange(baby.id);
                                return (
                                    <div key={baby.id} className="card" onClick={() => setSelectedBaby(baby)}>
                                        {pc && <div className={`price-badge price-badge-${pc.direction}`}>{pc.direction === 'up' ? '📈' : '📉'} {pc.percentage}%</div>}
                                        <img src={baby.image} alt={baby.name} className="card-image" />
                                        <h3 className="card-title">{baby.name}</h3>
                                        <div className="card-price">${price.toFixed(2)}</div>
                                        {owned > 0 && <div className="card-info">Owned: {owned}</div>}
                                        <button onClick={(e) => { e.stopPropagation(); buyBaby(baby.id, price); }} disabled={money < price || !marketOpen} className="card-button btn btn-success">
                                            {marketOpen ? `BUY $${price.toFixed(2)}` : 'CLOSED'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ENHANCERS */}
                {currentView === 'enhancers' && (
                    <div>
                        <h1 className="view-title">🧪 Enhancer Shop</h1>
                        <p className="view-subtitle">Apply enhancers to your limiteds to permanently boost their value! Enhancers are also tradeable.</p>
                        <div style={{ background:'white', borderRadius:'15px', padding:'20px', marginBottom:'25px', boxShadow:'0 4px 15px rgba(0,0,0,0.08)', borderLeft:'5px solid #9b59b6' }}>
                            <h3 style={{ marginBottom:'10px', color:'#2c3e50' }}>⚡ How It Works</h3>
                            <p style={{ color:'#666', lineHeight:'1.7' }}>Buy an enhancer below → Go to <strong>Portfolio</strong> → Click <strong>Apply Enhancer</strong> on any limited → permanently boosts that item's value! Enhancers can also be traded.</p>
                            <div style={{ display:'flex', gap:'10px', marginTop:'12px', flexWrap:'wrap' }}>
                                {[['Common','#95a5a6','7-11%','$1k-2k'],['Rare','#3498db','12-24%','$2.5k-5k'],['Epic','#9b59b6','25-40%','$6k-10k'],['Legendary','#f39c12','50-75%','$11k-25k'],['Divine','#e91e63','100-200%','$30k-50k']].map(([r,c,b,cost]) => (
                                    <div key={r} style={{ background:c, color:'white', padding:'8px 14px', borderRadius:'20px', fontSize:'13px', fontWeight:'800' }}>{r}: +{b} ({cost})</div>
                                ))}
                            </div>
                        </div>
                        <div style={{ display:'flex', gap:'15px', marginBottom:'20px', flexWrap:'wrap', alignItems:'center' }}>
                            <div style={{ background:'white', padding:'12px 20px', borderRadius:'12px', boxShadow:'0 4px 15px rgba(0,0,0,0.08)', fontWeight:'800', fontSize:'16px' }}>
                                🧪 You Own: {Object.values(enhancerInventory).reduce((s,n) => s+n, 0)} enhancers
                            </div>
                        </div>
                        <div className="tabs" style={{ marginBottom:'20px' }}>
                            {[['all','All (200)'],['owned','⭐ Owned'],['common','Common'],['rare','Rare'],['epic','Epic'],['legendary','Legendary'],['divine','✨ Divine']].map(([f,label]) => (
                                <button key={f} onClick={() => setEnhancerFilter(f)} className={`tab-button ${enhancerFilter===f?'active':''}`}>{label}</button>
                            ))}
                        </div>
                        <div className="card-grid">
                            {getFilteredEnhancers().map(enh => {
                                const owned = enhancerInventory[enh.id] || 0;
                                const isDivine = enh.rarity === 'Divine';
                                return (
                                    <div key={enh.id} style={{ background: getEnhancerRarityBg(enh.rarity), borderRadius:'18px', padding:'18px', color:'white', position:'relative', boxShadow: isDivine ? '0 0 30px rgba(255,0,255,0.6)' : '0 4px 15px rgba(0,0,0,0.15)', animation: isDivine ? 'divine-glow 3s ease-in-out infinite' : 'none' }}>
                                        <div style={{ position:'absolute', top:'12px', right:'12px', background:'rgba(0,0,0,0.3)', padding:'4px 10px', borderRadius:'12px', fontSize:'11px', fontWeight:'800' }}>{enh.rarity}</div>
                                        <div style={{ fontSize:'54px', textAlign:'center', marginBottom:'10px' }}>{enh.emoji}</div>
                                        <h3 style={{ textAlign:'center', fontSize:'16px', marginBottom:'8px', fontWeight:'800' }}>{enh.name}</h3>
                                        <div style={{ textAlign:'center', background:'rgba(0,0,0,0.25)', borderRadius:'20px', padding:'7px 14px', marginBottom:'10px', fontSize:'22px', fontWeight:'800' }}>+{enh.boost}% VALUE</div>
                                        <div style={{ fontSize:'12px', opacity:0.85, textAlign:'center', marginBottom:'8px' }}>Category: {enh.category}</div>
                                        {owned > 0 && <div style={{ textAlign:'center', background:'rgba(255,255,255,0.3)', borderRadius:'10px', padding:'5px', marginBottom:'8px', fontWeight:'800', fontSize:'14px' }}>✅ Owned: {owned}</div>}
                                        <button onClick={() => buyEnhancer(enh.id)} disabled={money < enh.cost}
                                            style={{ width:'100%', padding:'12px', border:'none', borderRadius:'10px', background: money>=enh.cost ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.25)', color: money>=enh.cost ? '#2c3e50' : 'rgba(255,255,255,0.6)', fontWeight:'800', fontSize:'15px', cursor: money>=enh.cost ? 'pointer' : 'not-allowed' }}>
                                            {money >= enh.cost ? `BUY $${enh.cost.toLocaleString()}` : `Need $${enh.cost.toLocaleString()}`}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* LIMITEDS */}
                {currentView === 'limited' && (
                    <div>
                        <h1 className="view-title">💎 Limited Store</h1>
                        <p className="view-subtitle">300 items! Limiteds can be traded with other players.</p>
                        <div className="tabs">
                            {[['all','All (300)'],['divine','🌟 Divine (8)'],['legendary','Legendary'],['epic','Epic'],['rare','Rare'],['common','Common']].map(([f, l]) => (
                                <button key={f} onClick={() => setLimitedFilter(f)} className={`tab-button ${limitedFilter === f ? 'active' : ''}`}>{l}</button>
                            ))}
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
                                        <div style={{textAlign:'center',marginBottom:'10px'}}>
                                            <div style={{fontSize:'14px'}}>Cost: ${item.cost.toLocaleString()}</div>
                                            <div style={{fontSize:'14px'}}>Value: ${value.toFixed(2)}</div>
                                        </div>
                                        {owned > 0 && <div style={{textAlign:'center',color:'white',fontSize:'14px',marginBottom:'8px'}}>Owned: {owned}</div>}
                                        <button onClick={(e) => { e.stopPropagation(); buyLimited(item.id, item.cost); }} disabled={money < item.cost} className="card-button btn btn-success">
                                            BUY ${item.cost.toLocaleString()}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* PORTFOLIO */}
                {currentView === 'portfolio' && (
                    <div>
                        <h1 className="view-title">📊 My Portfolio</h1>
                        <div className="stats-grid">
                            <div className="stat-card"><div className="stat-label">Babies Owned</div><div className="stat-value">{Object.values(portfolio).reduce((s,q)=>s+q,0)}</div></div>
                            <div className="stat-card"><div className="stat-label">Portfolio Value</div><div className="stat-value">${getPortfolioValue().toLocaleString()}</div></div>
                            <div className="stat-card"><div className="stat-label">Limiteds Owned</div><div className="stat-value">{Object.values(limitedInventory).reduce((s,a)=>s+a.length,0)}</div></div>
                            <div className="stat-card"><div className="stat-label">Limited Value</div><div className="stat-value">${getLimitedValue().toLocaleString()}</div></div>
                        </div>
                        <h2 style={{marginTop:'40px',marginBottom:'20px',fontSize:'28px',fontWeight:'800',color:'#2c3e50'}}>💼 Your Babies</h2>
                        <div className="card-grid">
                            {Object.keys(portfolio).filter(id => portfolio[id] > 0).map(babyId => {
                                const baby = babies.find(b => b.id === parseInt(babyId));
                                const qty = portfolio[babyId]; const price = prices[babyId] || 150;
                                return baby ? (
                                    <div key={babyId} className="card">
                                        <img src={baby.image} alt={baby.name} className="card-image" />
                                        <h3 className="card-title">{baby.name}</h3>
                                        <div className="card-info">Quantity: {qty}</div>
                                        <div className="card-info">Price: ${price.toFixed(2)}</div>
                                        <div className="card-price">${(qty * price).toFixed(2)}</div>
                                        <button onClick={() => sellBaby(parseInt(babyId), price)} disabled={!marketOpen} className="card-button btn btn-danger">
                                            {marketOpen ? `SELL $${price.toFixed(2)}` : 'MARKET CLOSED'}
                                        </button>
                                    </div>
                                ) : null;
                            })}
                        </div>
                        <h2 style={{marginTop:'40px',marginBottom:'20px',fontSize:'28px',fontWeight:'800',color:'#2c3e50'}}>💎 Your Limiteds</h2>
                        <div className="card-grid">
                            {Object.keys(limitedInventory).filter(id => limitedInventory[id].length > 0).map(itemId => {
                                const item = limitedItems.find(i => i.id === itemId);
                                const qty = limitedInventory[itemId].length; const value = limitedValues[itemId] || 0;
                                return item ? (
                                    <div key={itemId} className={`card limited-card rarity-${item.rarity.toLowerCase()}`}>
                                        <div className={`limited-badge rarity-${item.rarity.toLowerCase()}`}>{item.rarity}</div>
                                        <div className="limited-emoji">{item.emoji}</div>
                                        <h3 className="card-title">{item.name}</h3>
                                        <div style={{textAlign:'center',color:'white',marginBottom:'10px'}}>
                                            <div>Owned: {qty}</div>
                                            <div>Value Each: ${value.toFixed(2)}</div>
                                        </div>
                                        <div className="card-price" style={{color:'white'}}>${(qty * value).toFixed(2)}</div>
                                        <div style={{textAlign:'center',fontSize:'12px',color:'rgba(255,255,255,0.8)',marginTop:'8px'}}>Trade via the 🤝 Trade tab!</div>
                                    </div>
                                ) : null;
                            })}
                        </div>
                    </div>
                )}

                {/* PROFILE */}
                {currentView === 'profile' && (
                    <div>
                        <div className="profile-header" style={{position:'relative'}}>
                            <div style={{fontSize:'64px',marginBottom:'10px'}}>👤</div>
                            <div className="profile-username">{username}</div>
                            <div className="profile-joined">
                                Trader Since {window.gameState.createdAt ? new Date(window.gameState.createdAt).toLocaleDateString() : 'Today'}
                            </div>
                            {medals.length > 0 && (
                                <div style={{marginTop:'15px',display:'flex',gap:'10px',justifyContent:'center',flexWrap:'wrap'}}>
                                    {medals.map((m, i) => (
                                        <div key={i} title={m.desc} style={{background:'rgba(255,255,255,0.2)',borderRadius:'12px',padding:'8px 14px',fontSize:'13px',fontWeight:'800',display:'flex',alignItems:'center',gap:'6px'}}>
                                            <span style={{fontSize:'22px'}}>{m.emoji}</span>
                                            <div>
                                                <div>{m.name}</div>
                                                <div style={{fontSize:'11px',opacity:0.85}}>{m.desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ── STATS GRID ── */}
                        <div className="stats-grid">
                            <div className="stat-card" style={{borderColor:'#667eea'}}>
                                <div className="stat-label">💰 Net Worth</div>
                                <div className="stat-value" style={{fontSize:'28px'}}>${(money + getPortfolioValue() + getLimitedValue()).toLocaleString()}</div>
                            </div>
                            <div className="stat-card" style={{borderColor:'#27ae60'}}>
                                <div className="stat-label">💵 Cash Balance</div>
                                <div className="stat-value" style={{fontSize:'28px'}}>${money.toLocaleString()}</div>
                            </div>
                            <div className="stat-card" style={{borderColor:'#3498db'}}>
                                <div className="stat-label">📊 Portfolio Value</div>
                                <div className="stat-value" style={{fontSize:'28px'}}>${getPortfolioValue().toLocaleString()}</div>
                            </div>
                            <div className="stat-card" style={{borderColor:'#9b59b6'}}>
                                <div className="stat-label">💎 Limited Value</div>
                                <div className="stat-value" style={{fontSize:'28px'}}>${getLimitedValue().toLocaleString()}</div>
                            </div>
                            <div className="stat-card" style={{borderColor:'#e67e22'}}>
                                <div className="stat-label">🔄 Total Trades</div>
                                <div className="stat-value" style={{fontSize:'28px'}}>{tradeHistory.length}</div>
                            </div>
                            <div className="stat-card" style={{borderColor:'#e74c3c'}}>
                                <div className="stat-label">👶 Babies Owned</div>
                                <div className="stat-value" style={{fontSize:'28px'}}>{Object.values(portfolio).reduce((s,q)=>s+q,0)}</div>
                            </div>
                            <div className="stat-card" style={{borderColor:'#1abc9c'}}>
                                <div className="stat-label">💎 Limiteds Owned</div>
                                <div className="stat-value" style={{fontSize:'28px'}}>{Object.values(limitedInventory).reduce((s,a)=>s+a.length,0)}</div>
                            </div>
                            <div className="stat-card" style={{borderColor:'#9b59b6'}}>
                                <div className="stat-label">🧪 Enhancers Owned</div>
                                <div className="stat-value" style={{fontSize:'28px'}}>{Object.values(enhancerInventory).reduce((s,n)=>s+n,0)}</div>
                            </div>
                            <div className="stat-card" style={{borderColor:'#f39c12'}}>
                                <div className="stat-label">🏷️ Name Tags</div>
                                <div className="stat-value" style={{fontSize:'28px'}}>{nameTagsOwned}</div>
                            </div>
                            <div className="stat-card" style={{borderColor:'#e74c3c'}}>
                                <div className="stat-label">🏅 Medals Earned</div>
                                <div className="stat-value" style={{fontSize:'28px'}}>{medals.length}</div>
                            </div>
                        </div>

                        {/* ── ACHIEVEMENTS ── */}
                        <h2 style={{fontSize:'26px',fontWeight:'800',color:'#2c3e50',marginTop:'40px',marginBottom:'20px'}}>🏆 Achievements</h2>
                        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:'15px'}}>
                            {[
                                { cond: tradeHistory.length >= 1, icon:'✅', name:'First Trade', desc:'Made your first trade' },
                                { cond: tradeHistory.length >= 10, icon:'📈', name:'Active Trader', desc:'10 trades completed' },
                                { cond: tradeHistory.length >= 100, icon:'💹', name:'Trade Machine', desc:'100 trades completed' },
                                { cond: money >= 10000, icon:'💰', name:'Getting Rich', desc:'Reached $10,000 cash' },
                                { cond: money >= 100000, icon:'🤑', name:'Six Figures', desc:'Reached $100,000 cash' },
                                { cond: money >= 1000000, icon:'💎', name:'Millionaire', desc:'Reached $1,000,000 cash' },
                                { cond: Object.values(portfolio).reduce((s,q)=>s+q,0) >= 10, icon:'👶', name:'Baby Collector', desc:'Own 10+ babies' },
                                { cond: Object.values(portfolio).reduce((s,q)=>s+q,0) >= 50, icon:'🐋', name:'Whale', desc:'Own 50+ babies' },
                                { cond: Object.values(limitedInventory).reduce((s,a)=>s+a.length,0) >= 5, icon:'✨', name:'Limited Hunter', desc:'Own 5+ limited items' },
                                { cond: Object.values(limitedInventory).reduce((s,a)=>s+a.length,0) >= 25, icon:'🏆', name:'Limited Legend', desc:'Own 25+ limited items' },
                                { cond: Object.values(enhancerInventory).reduce((s,n)=>s+n,0) >= 1, icon:'🧪', name:'Enhancer', desc:'Bought your first enhancer' },
                                { cond: Object.values(enhancerInventory).reduce((s,n)=>s+n,0) >= 10, icon:'⚗️', name:'Alchemist', desc:'Own 10+ enhancers' },
                                { cond: medals.length >= 1, icon:'🏅', name:'Medal Winner', desc:'Earned a monthly medal' },
                                { cond: medals.some(m=>m.emoji==='🥇'), icon:'🥇', name:'Champion', desc:'Placed #1 in a monthly ranking' },
                            ].map((a, i) => (
                                <div key={i} style={{background: a.cond ? 'white' : '#f8f9fa', borderRadius:'14px', padding:'16px', boxShadow: a.cond ? '0 4px 15px rgba(0,0,0,0.1)' : 'none', borderLeft: `5px solid ${a.cond ? '#667eea' : '#e0e0e0'}`, opacity: a.cond ? 1 : 0.5, display:'flex', alignItems:'center', gap:'12px'}}>
                                    <span style={{fontSize:'28px'}}>{a.icon}</span>
                                    <div>
                                        <div style={{fontWeight:'800',fontSize:'15px',color: a.cond ? '#2c3e50' : '#999'}}>{a.name}</div>
                                        <div style={{fontSize:'12px',color:'#7f8c8d'}}>{a.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── MEDALS ── */}
                        {medals.length > 0 && (
                            <>
                                <h2 style={{fontSize:'26px',fontWeight:'800',color:'#2c3e50',marginTop:'40px',marginBottom:'20px'}}>🏅 Your Medals</h2>
                                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:'15px'}}>
                                    {medals.map((m, i) => (
                                        <div key={i} style={{background: m.emoji==='🥇' ? 'linear-gradient(135deg,#f7dc6f,#f39c12)' : m.emoji==='🥈' ? 'linear-gradient(135deg,#d7dbdd,#95a5a6)' : 'linear-gradient(135deg,#f0b27a,#ca6f1e)', borderRadius:'16px', padding:'20px', color:'white', textAlign:'center', boxShadow:'0 6px 20px rgba(0,0,0,0.15)'}}>
                                            <div style={{fontSize:'48px',marginBottom:'8px'}}>{m.emoji}</div>
                                            <div style={{fontWeight:'800',fontSize:'17px',marginBottom:'4px'}}>{m.name}</div>
                                            <div style={{fontSize:'12px',opacity:0.9}}>{m.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
                {/* HISTORY */}
                {currentView === 'trades' && (
                    <div>
                        <h1 className="view-title">📜 Trade History</h1>
                        {tradeHistory.length === 0 ? (
                            <div style={{textAlign:'center',padding:'60px',background:'white',borderRadius:'20px'}}><h3 style={{color:'#7f8c8d'}}>No trades yet!</h3></div>
                        ) : tradeHistory.map(trade => (
                            <div key={trade.id} className={`trade-item ${trade.type.startsWith('BUY') ? 'trade-buy' : 'trade-sell'}`}>
                                <div className="trade-info">
                                    <strong>{trade.type}</strong> - {trade.babyName}
                                    <div style={{fontSize:'14px',color:'#7f8c8d',marginTop:'5px'}}>{trade.timestamp}</div>
                                </div>
                                <div className="trade-price">{trade.type.startsWith('BUY') ? '-' : '+'}${trade.price.toFixed(2)}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ===== TRADE HUB ===== */}
                {currentView === 'trade' && (
                    <div>
                        <h1 className="view-title">🤝 Player Trading</h1>

                        {/* Sub-tabs */}
                        <div className="tabs" style={{marginBottom:'25px'}}>
                            <button onClick={() => setTradeTab('players')} className={`tab-button ${tradeTab === 'players' ? 'active' : ''}`}>👥 Players</button>
                            <button onClick={() => setTradeTab('incoming')} className={`tab-button ${tradeTab === 'incoming' ? 'active' : ''}`}>
                                📥 Incoming
                                {incomingTrades.length > 0 && <span style={{background:'#e74c3c',color:'white',borderRadius:'50%',padding:'2px 8px',marginLeft:'6px',fontSize:'12px'}}>{incomingTrades.length}</span>}
                            </button>
                            <button onClick={() => { setTradeTab('sent'); window.multiplayer.loadMyTrades().then(({sent}) => setSentTrades(sent)); }} className={`tab-button ${tradeTab === 'sent' ? 'active' : ''}`}>
                                📤 Sent{sentTrades.length > 0 ? ` (${sentTrades.length})` : ''}
                            </button>
                        </div>

                        {/* PLAYERS */}
                        {tradeTab === 'players' && (
                            <>
                                <div style={{background:'#e8f4fd',padding:'14px 18px',borderRadius:'12px',marginBottom:'25px',fontSize:'14px',fontWeight:'600',color:'#2980b9'}}>
                                    💡 Click <strong>🤝 Trade</strong> on any player to build and send a trade offer. Up to <strong>6 items per side</strong> — mix babies (with quantity) and limiteds freely!
                                </div>
                                <h3 style={{fontSize:'20px',fontWeight:'800',color:'#27ae60',marginBottom:'15px'}}>🟢 Online Players</h3>
                                <div className="player-list">
                                    {allPlayers.filter(p => p.isOnline && !p.isCurrentUser).map(player => (
                                        <div key={player.id} className="player-card player-online">
                                            <div className="player-status status-online"></div>
                                            <div className="player-name">{player.username}</div>
                                            <div className="player-info">Net Worth: ${player.netWorth?.toLocaleString() || 0}</div>
                                            <div className="player-info">Babies: {player.babiesOwned || 0} | Limiteds: {player.limitedsOwned || 0}</div>
                                            <button className="btn btn-primary" style={{width:'100%',marginTop:'10px'}} onClick={() => openTradeWith(player)}>🤝 Trade</button>
                                        </div>
                                    ))}
                                    {allPlayers.filter(p => p.isOnline && !p.isCurrentUser).length === 0 && (
                                        <div style={{gridColumn:'1/-1',textAlign:'center',padding:'40px',background:'white',borderRadius:'15px'}}>
                                            <h3 style={{color:'#7f8c8d'}}>No players online right now</h3>
                                            <p style={{color:'#95a5a6',marginTop:'8px'}}>You can still send trade offers to offline players below</p>
                                        </div>
                                    )}
                                </div>
                                <h3 style={{fontSize:'20px',fontWeight:'800',color:'#95a5a6',margin:'30px 0 15px'}}>⚫ Offline Players</h3>
                                <div className="player-list">
                                    {allPlayers.filter(p => !p.isOnline && !p.isCurrentUser).slice(0, 20).map(player => (
                                        <div key={player.id} className="player-card player-offline">
                                            <div className="player-status status-offline"></div>
                                            <div className="player-name">{player.username}</div>
                                            <div className="player-info">Net Worth: ${player.netWorth?.toLocaleString() || 0}</div>
                                            <div className="player-info">Babies: {player.babiesOwned || 0} | Limiteds: {player.limitedsOwned || 0}</div>
                                            <button className="btn btn-primary" style={{width:'100%',marginTop:'10px'}} onClick={() => openTradeWith(player)}>🤝 Send Trade Offer</button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* INCOMING */}
                        {tradeTab === 'incoming' && (
                            <div>
                                <h3 style={{fontSize:'22px',fontWeight:'800',marginBottom:'20px'}}>📥 Incoming Trade Offers</h3>
                                {incomingTrades.length === 0 ? (
                                    <div style={{textAlign:'center',padding:'60px',background:'white',borderRadius:'20px'}}>
                                        <h3 style={{color:'#7f8c8d'}}>No pending offers</h3>
                                        <p style={{color:'#95a5a6',marginTop:'10px'}}>Trade offers from other players will appear here</p>
                                    </div>
                                ) : incomingTrades.map(trade => (
                                    <div key={trade.id} style={{background:'white',borderRadius:'20px',padding:'25px',marginBottom:'20px',boxShadow:'0 4px 15px rgba(0,0,0,0.08)',borderLeft:'5px solid #667eea'}}>
                                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
                                            <strong style={{fontSize:'20px',color:'#2c3e50'}}>From: {trade.fromUsername}</strong>
                                            <small style={{color:'#999'}}>{trade.createdAt?.toDate ? trade.createdAt.toDate().toLocaleString() : 'Just now'}</small>
                                        </div>
                                        <div style={{display:'grid',gridTemplateColumns:'1fr 40px 1fr',gap:'15px',alignItems:'start',marginBottom:'20px'}}>
                                            <div>
                                                <div style={{fontWeight:'800',marginBottom:'10px',color:'#27ae60',fontSize:'15px'}}>They're offering:</div>
                                                {(trade.moneyOffer > 0) && (
                                                    <div style={{...tradeSlotStyle('green'),marginBottom:'6px'}}>
                                                        <span style={{fontSize:'20px'}}>💵</span>
                                                        <span style={{flex:1,marginLeft:'8px',fontWeight:'700',fontSize:'14px'}}>${trade.moneyOffer.toLocaleString()} cash</span>
                                                    </div>
                                                )}
                                                {trade.myOffer.length === 0 && !trade.moneyOffer
                                                    ? <div style={{color:'#aaa',fontStyle:'italic',padding:'10px',background:'#f9f9f9',borderRadius:'8px'}}>Nothing</div>
                                                    : trade.myOffer.map((slot, i) => (
                                                        <div key={i} style={tradeSlotStyle('green')}>
                                                            <span style={{fontSize:'20px'}}>{slot.emoji}</span>
                                                            <span style={{flex:1,marginLeft:'8px',fontWeight:'700',fontSize:'14px'}}>{slot.quantity > 1 ? `${slot.quantity}x ` : ''}{slot.name}{slot.boost ? ` (+${slot.boost}%)` : ''}</span>
                                                        </div>
                                                    ))}
                                            </div>
                                            <div style={{textAlign:'center',paddingTop:'35px',fontSize:'24px'}}>⇄</div>
                                            <div>
                                                <div style={{fontWeight:'800',marginBottom:'10px',color:'#e74c3c',fontSize:'15px'}}>They want from you:</div>
                                                {(trade.moneyRequest > 0) && (
                                                    <div style={{...tradeSlotStyle('red'),marginBottom:'6px'}}>
                                                        <span style={{fontSize:'20px'}}>💵</span>
                                                        <span style={{flex:1,marginLeft:'8px',fontWeight:'700',fontSize:'14px'}}>${trade.moneyRequest.toLocaleString()} cash from you</span>
                                                    </div>
                                                )}
                                                {trade.theirRequest.length === 0 && !trade.moneyRequest
                                                    ? <div style={{color:'#aaa',fontStyle:'italic',padding:'10px',background:'#f9f9f9',borderRadius:'8px'}}>Nothing</div>
                                                    : trade.theirRequest.map((slot, i) => (
                                                        <div key={i} style={tradeSlotStyle('red')}>
                                                            <span style={{fontSize:'20px'}}>{slot.emoji}</span>
                                                            <span style={{flex:1,marginLeft:'8px',fontWeight:'700',fontSize:'14px'}}>{slot.quantity > 1 ? `${slot.quantity}x ` : ''}{slot.name}{slot.boost ? ` (+${slot.boost}%)` : ''}</span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                        <div style={{display:'flex',gap:'12px'}}>
                                            <button onClick={() => handleAcceptTrade(trade)} className="btn btn-success" style={{flex:1,padding:'14px',fontSize:'16px'}}>✅ Accept</button>
                                            <button onClick={() => handleDeclineTrade(trade.id)} className="btn btn-danger" style={{flex:1,padding:'14px',fontSize:'16px'}}>❌ Decline</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* SENT */}
                        {tradeTab === 'sent' && (
                            <div>
                                <h3 style={{fontSize:'22px',fontWeight:'800',marginBottom:'20px'}}>📤 Sent Trade Offers</h3>
                                {sentTrades.length === 0 ? (
                                    <div style={{textAlign:'center',padding:'60px',background:'white',borderRadius:'20px'}}>
                                        <h3 style={{color:'#7f8c8d'}}>No pending sent offers</h3>
                                    </div>
                                ) : sentTrades.map(trade => (
                                    <div key={trade.id} style={{background:'white',borderRadius:'20px',padding:'25px',marginBottom:'20px',boxShadow:'0 4px 15px rgba(0,0,0,0.08)',borderLeft:'5px solid #f39c12'}}>
                                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
                                            <strong style={{fontSize:'20px',color:'#2c3e50'}}>To: {trade.toUsername}</strong>
                                            <span style={{background:'#fff3cd',color:'#856404',padding:'5px 12px',borderRadius:'20px',fontWeight:'700',fontSize:'13px'}}>⏳ Pending</span>
                                        </div>
                                        <div style={{display:'grid',gridTemplateColumns:'1fr 40px 1fr',gap:'15px',alignItems:'start',marginBottom:'20px'}}>
                                            <div>
                                                <div style={{fontWeight:'800',marginBottom:'10px',color:'#e74c3c',fontSize:'15px'}}>You're giving:</div>
                                                {trade.myOffer.map((slot, i) => (
                                                    <div key={i} style={tradeSlotStyle('red')}>
                                                        <span style={{fontSize:'20px'}}>{slot.emoji}</span>
                                                        <span style={{flex:1,marginLeft:'8px',fontWeight:'700',fontSize:'14px'}}>{slot.quantity > 1 ? `${slot.quantity}x ` : ''}{slot.name}{slot.boost ? ` (+${slot.boost}%)` : ''}</span>
                                                    </div>
                                                ))}
                                                {trade.myOffer.length === 0 && <div style={{color:'#aaa',fontStyle:'italic'}}>Nothing</div>}
                                            </div>
                                            <div style={{textAlign:'center',paddingTop:'35px',fontSize:'24px'}}>⇄</div>
                                            <div>
                                                <div style={{fontWeight:'800',marginBottom:'10px',color:'#27ae60',fontSize:'15px'}}>You want:</div>
                                                {trade.theirRequest.map((slot, i) => (
                                                    <div key={i} style={tradeSlotStyle('green')}>
                                                        <span style={{fontSize:'20px'}}>{slot.emoji}</span>
                                                        <span style={{flex:1,marginLeft:'8px',fontWeight:'700',fontSize:'14px'}}>{slot.quantity > 1 ? `${slot.quantity}x ` : ''}{slot.name}{slot.boost ? ` (+${slot.boost}%)` : ''}</span>
                                                    </div>
                                                ))}
                                                {trade.theirRequest.length === 0 && <div style={{color:'#aaa',fontStyle:'italic'}}>Nothing</div>}
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeclineTrade(trade.id)} className="btn btn-danger" style={{width:'100%'}}>🗑️ Cancel Offer</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* LEADERBOARD */}
                {currentView === 'leaderboard' && (
                    <div>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:'10px',flexWrap:'wrap',gap:'12px'}}>
                            <div>
                                <h1 className="view-title" style={{marginBottom:'4px'}}>🏆 Global Leaderboard</h1>
                                <p className="view-subtitle" style={{marginBottom:0}}>Top players by net worth · 🏅 Medals awarded to top 3 on the 15th of each month</p>
                            </div>
                            <button onClick={() => window.multiplayer.loadLeaderboard().then(setLeaderboard)} className="btn btn-primary" style={{padding:'10px 20px',fontSize:'14px'}}>🔄 Refresh</button>
                        </div>

                        {/* Medal countdown */}
                        {(() => {
                            const now = new Date();
                            const day = now.getDate();
                            const daysLeft = day <= 15 ? 15 - day : (new Date(now.getFullYear(), now.getMonth()+1, 15) - now) / 86400000;
                            return (
                                <div style={{background:'linear-gradient(135deg,#f7dc6f,#f39c12)',borderRadius:'14px',padding:'16px 22px',marginBottom:'25px',display:'flex',alignItems:'center',gap:'15px',boxShadow:'0 4px 15px rgba(243,156,18,0.3)'}}>
                                    <span style={{fontSize:'32px'}}>🏅</span>
                                    <div>
                                        <div style={{fontWeight:'800',fontSize:'16px',color:'#2c3e50'}}>Monthly Medal Awards</div>
                                        <div style={{fontSize:'13px',color:'#5d4037',fontWeight:'600'}}>
                                            {day === 15 ? '🎉 Medal day is TODAY! Awards will be given to the top 3 players!' : `Top 3 players earn exclusive medals on the 15th · ${Math.ceil(daysLeft)} day${Math.ceil(daysLeft)!==1?'s':''} away`}
                                        </div>
                                    </div>
                                    <div style={{marginLeft:'auto',textAlign:'center'}}>
                                        <div style={{display:'flex',gap:'6px'}}>
                                            {['🥇','🥈','🥉'].map((m,i) => <span key={i} style={{fontSize:'28px'}}>{m}</span>)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {leaderboard.length > 0 ? (
                            <div style={{background:'white',borderRadius:'20px',overflow:'hidden',boxShadow:'0 4px 15px rgba(0,0,0,0.08)'}}>
                                {leaderboard.map((player, idx) => {
                                    const rankEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null;
                                    const rowBg = idx === 0 ? 'linear-gradient(135deg,rgba(247,220,111,0.15),rgba(243,156,18,0.1))' : idx === 1 ? 'linear-gradient(135deg,rgba(215,219,221,0.15),rgba(149,165,166,0.1))' : idx === 2 ? 'linear-gradient(135deg,rgba(240,178,122,0.15),rgba(202,111,30,0.1))' : 'white';
                                    return (
                                        <div key={player.id} style={{display:'grid',gridTemplateColumns:'64px 1fr auto auto auto auto',alignItems:'center',padding:'16px 22px',background: player.isCurrentUser ? 'linear-gradient(135deg,rgba(102,126,234,0.12),rgba(118,75,162,0.08))' : rowBg, borderBottom:'1px solid #f0f0f0', borderLeft: player.isCurrentUser ? '5px solid #667eea' : 'none'}}>
                                            <div style={{textAlign:'center'}}>
                                                {rankEmoji ? <span style={{fontSize:'32px'}}>{rankEmoji}</span> : <span style={{fontSize:'22px',fontWeight:'800',color:'#95a5a6'}}>#{idx+1}</span>}
                                            </div>
                                            <div>
                                                <div style={{fontWeight:'800',fontSize:'17px',color:'#2c3e50',display:'flex',alignItems:'center',gap:'8px'}}>
                                                    {player.username} {player.isCurrentUser && <span style={{background:'#667eea',color:'white',fontSize:'11px',padding:'2px 8px',borderRadius:'10px',fontWeight:'700'}}>YOU</span>}
                                                </div>
                                                <div style={{fontSize:'12px',color:'#95a5a6',marginTop:'2px'}}>
                                                    {player.totalTrades || 0} trades
                                                </div>
                                            </div>
                                            <div style={{textAlign:'right',marginRight:'20px'}}>
                                                <div style={{fontSize:'11px',color:'#95a5a6',fontWeight:'600'}}>NET WORTH</div>
                                                <div style={{fontWeight:'800',fontSize:'17px',color:'#2c3e50'}}>${player.netWorth?.toLocaleString() || 0}</div>
                                            </div>
                                            <div style={{textAlign:'right',marginRight:'20px'}}>
                                                <div style={{fontSize:'11px',color:'#95a5a6',fontWeight:'600'}}>👶 BABIES</div>
                                                <div style={{fontWeight:'800',fontSize:'16px'}}>{player.babiesOwned || 0}</div>
                                            </div>
                                            <div style={{textAlign:'right',marginRight:'20px'}}>
                                                <div style={{fontSize:'11px',color:'#95a5a6',fontWeight:'600'}}>💎 LIMITEDS</div>
                                                <div style={{fontWeight:'800',fontSize:'16px'}}>{player.limitedsOwned || 0}</div>
                                            </div>
                                            <div style={{textAlign:'right'}}>
                                                <div style={{fontSize:'11px',color:'#95a5a6',fontWeight:'600'}}>CASH</div>
                                                <div style={{fontWeight:'800',fontSize:'14px',color:'#27ae60'}}>${player.money?.toLocaleString() || 0}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{textAlign:'center',padding:'60px',background:'white',borderRadius:'20px'}}>
                                <div className="loading-spinner" style={{margin:'0 auto 15px'}}></div>
                                <p style={{color:'#7f8c8d'}}>Loading leaderboard...</p>
                            </div>
                        )}
                    </div>
                )}
            {/* ===== TRADE COMPOSE MODAL ===== */}
            {showTradeModal && tradeTarget && (
                <div className="modal-overlay" onClick={() => { if (!addingSlot) setShowTradeModal(false); }}>
                    <div className="modal" style={{maxWidth:'820px'}} onClick={e => e.stopPropagation()}>
                        <h2 className="modal-title">🤝 Trade with {tradeTarget.username}</h2>

                        {!tradeTargetData && (
                            <div style={{textAlign:'center',padding:'20px',color:'#667eea',fontWeight:'700'}}>
                                <div className="loading-spinner" style={{width:'30px',height:'30px',margin:'0 auto 10px'}}></div>
                                Loading {tradeTarget.username}'s inventory...
                            </div>
                        )}

                        {tradeTargetData && (
                        <div style={{display:'grid',gridTemplateColumns:'1fr 44px 1fr',gap:'16px',alignItems:'start'}}>

                            {/* ── YOU GIVE ── */}
                            <div style={{background:'#fff5f5',borderRadius:'14px',padding:'14px',border:'2px solid #fcc'}}>
                                <div style={{fontWeight:'800',fontSize:'16px',color:'#e74c3c',marginBottom:'10px'}}>
                                    📤 You Give ({myOffer.length}/6)
                                </div>

                                {/* Money offer */}
                                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'10px',background:'white',borderRadius:'10px',padding:'8px 12px',border:'1px solid #eee'}}>
                                    <span style={{fontSize:'18px'}}>💵</span>
                                    <span style={{fontWeight:'700',fontSize:'13px',flex:1}}>Add Cash:</span>
                                    <input type="number" min="0" max={money} value={moneyOffer || ''}
                                        onChange={e => setMoneyOffer(Math.min(money, Math.max(0, parseInt(e.target.value)||0)))}
                                        placeholder="$0"
                                        style={{width:'90px',padding:'5px 8px',border:'1px solid #ddd',borderRadius:'8px',fontWeight:'800',fontSize:'14px',textAlign:'right'}} />
                                </div>
                                {moneyOffer > 0 && (
                                    <div style={{background:'#e8f5e9',borderRadius:'8px',padding:'7px 10px',marginBottom:'8px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                                        <span style={{fontWeight:'700',fontSize:'13px'}}>💵 ${moneyOffer.toLocaleString()} cash</span>
                                        <button onClick={() => setMoneyOffer(0)} style={{background:'none',border:'none',color:'#e74c3c',cursor:'pointer',fontSize:'16px',fontWeight:'800'}}>✕</button>
                                    </div>
                                )}

                                {myOffer.map((slot, i) => (
                                    <div key={i} style={{display:'flex',alignItems:'center',gap:'8px',background:'white',borderRadius:'9px',padding:'8px',marginBottom:'6px',border:'1px solid #eee'}}>
                                        {slot.type==='baby' ? <img src={slot.image||babies.find(b=>b.id===slot.id)?.image} alt="" style={{width:'32px',height:'32px',borderRadius:'6px',objectFit:'cover'}} /> : <span style={{fontSize:'22px'}}>{slot.emoji}</span>}
                                        <span style={{flex:1,fontWeight:'700',fontSize:'13px'}}>{slot.quantity > 1 ? `${slot.quantity}× ` : ''}{slot.name}{slot.boost ? ` +${slot.boost}%` : ''}</span>
                                        <button onClick={() => removeTradeSlot('offer', i)} style={{background:'none',border:'none',cursor:'pointer',color:'#e74c3c',fontSize:'18px',padding:'0 2px',fontWeight:'800'}}>✕</button>
                                    </div>
                                ))}
                                {myOffer.length < 6 && addingSlot !== 'offer' && (
                                    <button onClick={() => setAddingSlot('offer')} style={{width:'100%',padding:'9px',marginTop:'4px',border:'2px dashed #e74c3c',borderRadius:'10px',background:'none',color:'#e74c3c',fontWeight:'800',cursor:'pointer',fontSize:'14px'}}>+ Add Item</button>
                                )}
                            </div>

                            <div style={{textAlign:'center',paddingTop:'50px',fontSize:'26px',color:'#95a5a6'}}>⇄</div>

                            {/* ── YOU GET ── */}
                            <div style={{background:'#f0fff4',borderRadius:'14px',padding:'14px',border:'2px solid #c3e6cb'}}>
                                <div style={{fontWeight:'800',fontSize:'16px',color:'#27ae60',marginBottom:'10px'}}>
                                    📥 You Get ({theirRequest.length}/6)
                                </div>

                                {/* Money request */}
                                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'10px',background:'white',borderRadius:'10px',padding:'8px 12px',border:'1px solid #eee'}}>
                                    <span style={{fontSize:'18px'}}>💵</span>
                                    <span style={{fontWeight:'700',fontSize:'13px',flex:1}}>Request Cash:</span>
                                    <input type="number" min="0" value={moneyRequest || ''}
                                        onChange={e => setMoneyRequest(Math.max(0, parseInt(e.target.value)||0))}
                                        placeholder="$0"
                                        style={{width:'90px',padding:'5px 8px',border:'1px solid #ddd',borderRadius:'8px',fontWeight:'800',fontSize:'14px',textAlign:'right'}} />
                                </div>
                                {moneyRequest > 0 && (
                                    <div style={{background:'#e8f5e9',borderRadius:'8px',padding:'7px 10px',marginBottom:'8px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                                        <span style={{fontWeight:'700',fontSize:'13px'}}>💵 ${moneyRequest.toLocaleString()} cash</span>
                                        <button onClick={() => setMoneyRequest(0)} style={{background:'none',border:'none',color:'#e74c3c',cursor:'pointer',fontSize:'16px',fontWeight:'800'}}>✕</button>
                                    </div>
                                )}

                                {theirRequest.map((slot, i) => (
                                    <div key={i} style={{display:'flex',alignItems:'center',gap:'8px',background:'white',borderRadius:'9px',padding:'8px',marginBottom:'6px',border:'1px solid #eee'}}>
                                        {slot.type==='baby' ? <img src={slot.image||babies.find(b=>b.id===slot.id)?.image} alt="" style={{width:'32px',height:'32px',borderRadius:'6px',objectFit:'cover'}} /> : <span style={{fontSize:'22px'}}>{slot.emoji}</span>}
                                        <span style={{flex:1,fontWeight:'700',fontSize:'13px'}}>{slot.quantity > 1 ? `${slot.quantity}× ` : ''}{slot.name}{slot.boost ? ` +${slot.boost}%` : ''}</span>
                                        <button onClick={() => removeTradeSlot('request', i)} style={{background:'none',border:'none',cursor:'pointer',color:'#27ae60',fontSize:'18px',padding:'0 2px',fontWeight:'800'}}>✕</button>
                                    </div>
                                ))}
                                {theirRequest.length < 6 && addingSlot !== 'request' && (
                                    <button onClick={() => setAddingSlot('request')} style={{width:'100%',padding:'9px',marginTop:'4px',border:'2px dashed #27ae60',borderRadius:'10px',background:'none',color:'#27ae60',fontWeight:'800',cursor:'pointer',fontSize:'14px'}}>+ Add Item</button>
                                )}
                            </div>
                        </div>
                        )}

                        {/* ── ITEM PICKER ── */}
                        {addingSlot && tradeTargetData && (
                            <div style={{marginTop:'18px',background:'#f8f9fa',borderRadius:'14px',padding:'18px',maxHeight:'400px',overflowY:'auto'}}>
                                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
                                    <strong style={{fontSize:'15px',color:'#2c3e50'}}>
                                        {addingSlot === 'offer' ? '📤 Your items to give:' : `📥 ${tradeTarget.username}'s items to request:`}
                                    </strong>
                                    <button onClick={() => setAddingSlot(null)} style={{background:'#e74c3c',color:'white',border:'none',borderRadius:'8px',padding:'5px 12px',cursor:'pointer',fontWeight:'700'}}>✕ Close</button>
                                </div>

                                {/* BABIES */}
                                {(() => {
                                    const src = addingSlot === 'offer'
                                        ? babies.filter(b => (portfolio[b.id]||0) > 0)
                                        : babies.filter(b => (tradeTargetData.portfolio?.[b.id]||0) > 0);
                                    return src.length > 0 ? (
                                        <>
                                            <div style={{fontWeight:'800',color:'#2c3e50',marginBottom:'8px',fontSize:'13px'}}>👶 Babies:</div>
                                            <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'14px'}}>
                                                {src.map(baby => {
                                                    const alreadyIn = (addingSlot==='offer' ? myOffer : theirRequest).find(x=>x.type==='baby'&&x.id===baby.id)?.quantity||0;
                                                    const avail = addingSlot==='offer'
                                                        ? (portfolio[baby.id]||0) - alreadyIn
                                                        : (tradeTargetData.portfolio?.[baby.id]||0) - alreadyIn;
                                                    if (avail <= 0) return null;
                                                    return <QtyPickerItem key={baby.id} label={baby.name} sub={`Has: ${avail}`} imgSrc={baby.image} max={avail} onAdd={qty => addTradeSlot(addingSlot,'baby',baby,qty)} />;
                                                })}
                                            </div>
                                        </>
                                    ) : <p style={{color:'#999',fontSize:'13px',marginBottom:'12px',fontStyle:'italic'}}>No babies {addingSlot==='offer'?'owned':'available from '+tradeTarget.username}</p>;
                                })()}

                                {/* LIMITEDS */}
                                {(() => {
                                    const src = addingSlot === 'offer'
                                        ? limitedItems.filter(i => (limitedInventory[i.id]?.length||0) > 0)
                                        : limitedItems.filter(i => (tradeTargetData.limitedInventory?.[i.id]?.length||0) > 0);
                                    return src.length > 0 ? (
                                        <>
                                            <div style={{fontWeight:'800',color:'#2c3e50',marginBottom:'8px',fontSize:'13px'}}>💎 Limiteds:</div>
                                            <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'14px'}}>
                                                {src.map(item => {
                                                    const alreadyIn = (addingSlot==='offer' ? myOffer : theirRequest).find(x=>x.type==='limited'&&x.id===item.id)?.quantity||0;
                                                    const avail = addingSlot==='offer'
                                                        ? (limitedInventory[item.id]?.length||0) - alreadyIn
                                                        : (tradeTargetData.limitedInventory?.[item.id]?.length||0) - alreadyIn;
                                                    if (avail <= 0) return null;
                                                    return <QtyPickerItem key={item.id} label={item.name} sub={`Has: ${avail} · ${item.rarity}`} emoji={item.emoji} max={avail} onAdd={qty => addTradeSlot(addingSlot,'limited',item,qty)} />;
                                                })}
                                            </div>
                                        </>
                                    ) : <p style={{color:'#999',fontSize:'13px',marginBottom:'12px',fontStyle:'italic'}}>No limiteds {addingSlot==='offer'?'owned':'available from '+tradeTarget.username}</p>;
                                })()}

                                {/* ENHANCERS */}
                                {(() => {
                                    const src = addingSlot === 'offer'
                                        ? allEnhancers.filter(e => (enhancerInventory[e.id]||0) > 0)
                                        : allEnhancers.filter(e => (tradeTargetData.enhancerInventory?.[e.id]||0) > 0);
                                    return src.length > 0 ? (
                                        <>
                                            <div style={{fontWeight:'800',color:'#9b59b6',marginBottom:'8px',fontSize:'13px'}}>🧪 Enhancers:</div>
                                            <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'8px'}}>
                                                {src.map(enh => {
                                                    const alreadyIn = (addingSlot==='offer' ? myOffer : theirRequest).find(x=>x.type==='enhancer'&&x.id===enh.id)?.quantity||0;
                                                    const avail = addingSlot==='offer'
                                                        ? (enhancerInventory[enh.id]||0) - alreadyIn
                                                        : (tradeTargetData.enhancerInventory?.[enh.id]||0) - alreadyIn;
                                                    if (avail <= 0) return null;
                                                    return <QtyPickerItem key={enh.id} label={enh.name} sub={`+${enh.boost}% · Has: ${avail}`} emoji={enh.emoji} max={avail} onAdd={qty => addTradeSlot(addingSlot,'enhancer',enh,qty)} />;
                                                })}
                                            </div>
                                        </>
                                    ) : <p style={{color:'#999',fontSize:'13px',fontStyle:'italic'}}>No enhancers {addingSlot==='offer'?'owned':'available from '+tradeTarget.username}</p>;
                                })()}
                            </div>
                        )}

                        <div className="modal-buttons" style={{marginTop:'20px'}}>
                            <button onClick={submitTradeOffer} className="modal-button btn btn-success" style={{flex:2,fontSize:'16px'}}>
                                📤 Send Trade Offer to {tradeTarget.username}
                            </button>
                            <button onClick={() => { setShowTradeModal(false); setMoneyOffer(0); setMoneyRequest(0); }} className="modal-button btn btn-danger" style={{flex:1}}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* APPLY ENHANCER MODAL */}
            {applyModal && (
                <div className="modal-overlay" onClick={() => setApplyModal(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth:'700px' }}>
                        <h2 className="modal-title">🧪 Apply Enhancer</h2>
                        <p style={{ color:'#666', marginBottom:'20px' }}>Choose an enhancer from your inventory. This permanently boosts your limited item's value!</p>
                        {Object.values(enhancerInventory).reduce((s,n) => s+n, 0) === 0 ? (
                            <div style={{ textAlign:'center', padding:'40px', background:'#f8f9fa', borderRadius:'15px' }}>
                                <div style={{ fontSize:'48px', marginBottom:'15px' }}>🧪</div>
                                <h3 style={{ color:'#7f8c8d' }}>No enhancers owned!</h3>
                                <p style={{ color:'#bdc3c7', marginTop:'8px' }}>Visit the Enhancers tab to buy some first.</p>
                                <button onClick={() => { setApplyModal(null); setCurrentView('enhancers'); }} className="btn btn-primary" style={{ marginTop:'15px' }}>Go to Enhancer Shop</button>
                            </div>
                        ) : (
                            <div>
                                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))', gap:'12px', maxHeight:'450px', overflowY:'auto', paddingRight:'4px' }}>
                                    {allEnhancers.filter(e => (enhancerInventory[e.id] || 0) > 0).map(enh => (
                                        <div key={enh.id} onClick={() => applyEnhancer(applyModal.itemId, applyModal.serial, enh.id)}
                                            style={{ background: getEnhancerRarityBg(enh.rarity), borderRadius:'14px', padding:'14px', color:'white', cursor:'pointer', textAlign:'center', transition:'transform 0.2s', boxShadow: enh.rarity==='Divine' ? '0 0 20px rgba(255,0,255,0.5)' : '0 3px 10px rgba(0,0,0,0.2)' }}
                                            onMouseOver={e => e.currentTarget.style.transform='scale(1.05)'}
                                            onMouseOut={e => e.currentTarget.style.transform='scale(1)'}>
                                            <div style={{ fontSize:'36px', marginBottom:'6px' }}>{enh.emoji}</div>
                                            <div style={{ fontWeight:'800', fontSize:'13px', marginBottom:'4px' }}>{enh.name}</div>
                                            <div style={{ background:'rgba(0,0,0,0.25)', borderRadius:'12px', padding:'4px 8px', fontSize:'16px', fontWeight:'800', marginBottom:'6px' }}>+{enh.boost}%</div>
                                            <div style={{ fontSize:'12px', opacity:0.9, marginBottom:'8px' }}>Owned: {enhancerInventory[enh.id]}</div>
                                            <div style={{ background:'rgba(255,255,255,0.9)', color:'#2c3e50', borderRadius:'8px', padding:'6px', fontSize:'13px', fontWeight:'800' }}>TAP TO APPLY</div>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => setApplyModal(null)} className="btn btn-danger" style={{ width:'100%', marginTop:'20px' }}>Cancel</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* NAME CHANGE */}
            {showNameChange && (
                <div className="modal-overlay" onClick={() => setShowNameChange(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2 className="modal-title">Change Username</h2>
                        <div className="name-change-section">
                            <div className="name-change-title">Current: {username}</div>
                            <div className="name-change-cost">{hasChangedName ? '💰 Cost: $10,000 (gives Name Tag 🏷️)' : '✨ First change is FREE!'}</div>
                            <input type="text" value={newName} onChange={e => setNewName(e.target.value.toLowerCase())} className="name-input" placeholder="Enter new username" />
                            <div className="modal-buttons">
                                <button onClick={handleNameChange} className="modal-button btn btn-success">Confirm</button>
                                <button onClick={() => setShowNameChange(false)} className="modal-button btn btn-danger">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ITEM DETAIL */}
            {(selectedBaby || selectedLimited) && (
                <div className="modal-overlay" onClick={() => { setSelectedBaby(null); setSelectedLimited(null); }}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        {selectedBaby && (
                            <>
                                <img src={selectedBaby.image} alt={selectedBaby.name} style={{width:'100%',maxHeight:'300px',objectFit:'cover',borderRadius:'15px',marginBottom:'20px'}} />
                                <h2 className="modal-title">{selectedBaby.name}</h2>
                                <div className="card-price">${(prices[selectedBaby.id] || 150).toFixed(2)}</div>
                                <div className="card-info">You own: {portfolio[selectedBaby.id] || 0}</div>
                                {priceHistory.length > 1 && <div className="modal-chart"><canvas ref={chartRef} height="120"></canvas></div>}
                                <div className="modal-buttons">
                                    <button onClick={() => { buyBaby(selectedBaby.id, prices[selectedBaby.id]); setSelectedBaby(null); }} disabled={money < prices[selectedBaby.id] || !marketOpen} className="modal-button btn btn-success">BUY ${(prices[selectedBaby.id]||150).toFixed(2)}</button>
                                    {portfolio[selectedBaby.id] > 0 && <button onClick={() => { sellBaby(selectedBaby.id, prices[selectedBaby.id]); setSelectedBaby(null); }} disabled={!marketOpen} className="modal-button btn btn-danger">SELL ${(prices[selectedBaby.id]||150).toFixed(2)}</button>}
                                </div>
                            </>
                        )}
                        {selectedLimited && (
                            <>
                                <div className="limited-emoji">{selectedLimited.emoji}</div>
                                <h2 className="modal-title">{selectedLimited.name}</h2>
                                <div className={`limited-badge rarity-${selectedLimited.rarity.toLowerCase()}`} style={{position:'relative',display:'inline-block',marginBottom:'15px'}}>{selectedLimited.rarity}</div>
                                <div style={{textAlign:'center',marginBottom:'20px'}}>
                                    <div>Cost: ${selectedLimited.cost.toLocaleString()}</div>
                                    <div>Current Value: ${(limitedValues[selectedLimited.id]||0).toFixed(2)}</div>
                                </div>
                                {priceHistory.length > 1 && <div className="modal-chart"><canvas ref={chartRef} height="120"></canvas></div>}
                                <button onClick={() => { buyLimited(selectedLimited.id, selectedLimited.cost); setSelectedLimited(null); }} disabled={money < selectedLimited.cost} className="modal-button btn btn-success" style={{width:'100%',marginTop:'20px'}}>BUY ${selectedLimited.cost.toLocaleString()}</button>
                            </>
                        )}
                        <button onClick={() => { setSelectedBaby(null); setSelectedLimited(null); }} className="modal-button btn btn-danger" style={{width:'100%',marginTop:'15px'}}>Close</button>
                    </div>
                </div>
            )}
        </>
    );
};

ReactDOM.render(<AurababyMarket />, document.getElementById('root'));
