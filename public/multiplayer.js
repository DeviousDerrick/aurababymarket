// ===================================
// AUTHENTICATION LOGIC
// ===================================

let currentUser = null;
let userDocRef = null;
let gameStateLoaded = false;

// Global game state for Firebase saving
window.gameState = {
    username: 'Trader',
    money: 1000,
    portfolio: {},
    limitedInventory: {},
    limitedMintCounts: {},
    tradeHistory: [],
    highestMoney: 1000,
    highestNetWorth: 1000,
    createdAt: null
};

// ===================================
// AUTH UI FUNCTIONS
// ===================================

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

// ===================================
// LOGIN
// ===================================

async function loginUser() {
    const username = document.getElementById('login-username').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    
    if (!username || !password) {
        errorDiv.textContent = 'Please enter username and password';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (username.length < 3 || username.length > 20) {
        errorDiv.textContent = 'Username must be 3-20 characters';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (!/^[a-z0-9_]+$/.test(username)) {
        errorDiv.textContent = 'Username can only contain letters, numbers, and underscores';
        errorDiv.style.display = 'block';
        return;
    }
    
    try {
        errorDiv.style.display = 'none';
        const email = username + '@aurababymarket.app';
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            errorDiv.textContent = 'Username not found. Please sign up first.';
        } else if (error.code === 'auth/wrong-password') {
            errorDiv.textContent = 'Incorrect password';
        } else {
            errorDiv.textContent = 'Login failed. Please try again.';
        }
        errorDiv.style.display = 'block';
    }
}

// ===================================
// SIGNUP
// ===================================

async function signupUser() {
    const username = document.getElementById('signup-username').value.trim().toLowerCase();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;
    const errorDiv = document.getElementById('signup-error');
    
    if (!username) {
        errorDiv.textContent = 'Please enter a username';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (username.length < 3 || username.length > 20) {
        errorDiv.textContent = 'Username must be 3-20 characters';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (!/^[a-z0-9_]+$/.test(username)) {
        errorDiv.textContent = 'Username can only contain letters, numbers, and underscores';
        errorDiv.style.display = 'block';
        return;
    }
    
    const reserved = ['admin', 'moderator', 'system', 'guest', 'official', 'support'];
    if (reserved.includes(username)) {
        errorDiv.textContent = 'This username is reserved';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (!password) {
        errorDiv.textContent = 'Please enter a password';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (password.length < 6) {
        errorDiv.textContent = 'Password must be at least 6 characters';
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
        
        // Check if username exists
        const usernameDoc = await db.collection('usernames').doc(username).get();
        if (usernameDoc.exists) {
            errorDiv.textContent = 'Username already taken. Please choose another.';
            errorDiv.style.display = 'block';
            return;
        }
        
        // Create account
        const result = await auth.createUserWithEmailAndPassword(email, password);
        
        // Store username mapping
        await db.collection('usernames').doc(username).set({
            uid: result.user.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Create initial user document
        await db.collection('users').doc(result.user.uid).set({
            username: username,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            errorDiv.textContent = 'Username already taken. Please choose another.';
        } else if (error.code === 'auth/weak-password') {
            errorDiv.textContent = 'Password is too weak. Use at least 6 characters.';
        } else {
            errorDiv.textContent = 'Signup failed: ' + error.message;
        }
        errorDiv.style.display = 'block';
    }
}

// ===================================
// ANONYMOUS LOGIN
// ===================================

async function loginAnonymous() {
    const errorDiv = document.getElementById('login-error');
    try {
        errorDiv.style.display = 'none';
        await auth.signInAnonymously();
    } catch (error) {
        errorDiv.textContent = 'Guest login failed. Please try again.';
        errorDiv.style.display = 'block';
    }
}

// ===================================
// LOGOUT
// ===================================

async function logoutUser() {
    if (confirm('Are you sure you want to logout? Your progress is saved automatically.')) {
        await saveGameData();
        await auth.signOut();
    }
}

// ===================================
// AUTH STATE OBSERVER
// ===================================

auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUser = user;
        userDocRef = db.collection('users').doc(user.uid);
        
        // Show loading
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('signup-form').style.display = 'none';
        document.getElementById('loading-screen').style.display = 'block';
        
        // Load game data
        await loadGameData();
        
        // Hide auth, show game
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
        
        // Initialize game (React will mount)
        if (!gameStateLoaded) {
            gameStateLoaded = true;
        }
    } else {
        currentUser = null;
        userDocRef = null;
        gameStateLoaded = false;
        document.getElementById('auth-container').style.display = 'flex';
        document.getElementById('game-container').style.display = 'none';
        showLogin();
    }
});

// ===================================
// SAVE/LOAD FUNCTIONS
// ===================================

async function loadGameData() {
    if (!userDocRef) return;
    
    try {
        const doc = await userDocRef.get();
        if (doc.exists) {
            const data = doc.data();
            window.gameState = {
                username: data.username || (currentUser.isAnonymous ? 'Guest' : 'Trader'),
                money: data.money !== undefined ? data.money : 1000,
                portfolio: data.portfolio || {},
                limitedInventory: data.limitedInventory || {},
                limitedMintCounts: data.limitedMintCounts || {},
                tradeHistory: data.tradeHistory || [],
                highestMoney: data.highestMoney || 1000,
                highestNetWorth: data.highestNetWorth || 1000,
                createdAt: data.createdAt || null
            };
            console.log('Game data loaded!', window.gameState);
        } else {
            // New user - create initial document
            const username = currentUser.isAnonymous ? 'Guest' : 'Trader';
            window.gameState = {
                username: username,
                money: 1000,
                portfolio: {},
                limitedInventory: {},
                limitedMintCounts: {},
                tradeHistory: [],
                highestMoney: 1000,
                highestNetWorth: 1000,
                createdAt: new Date()
            };
            await saveGameData();
        }
    } catch (error) {
        console.error('Load failed:', error);
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
            limitedMintCounts: window.gameState.limitedMintCounts,
            tradeHistory: window.gameState.tradeHistory,
            highestMoney: window.gameState.highestMoney,
            highestNetWorth: window.gameState.highestNetWorth,
            createdAt: window.gameState.createdAt || firebase.firestore.FieldValue.serverTimestamp(),
            lastSaved: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        console.log('Game saved!');
    } catch (error) {
        console.error('Save failed:', error);
    }
}

// Auto-save every 30 seconds
setInterval(() => {
    if (currentUser && window.gameState) {
        saveGameData();
    }
}, 30000);

// Save before closing
window.addEventListener('beforeunload', () => {
    if (currentUser && window.gameState) {
        saveGameData();
    }
});
