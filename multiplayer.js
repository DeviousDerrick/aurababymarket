// ===================================
// MULTIPLAYER FEATURES
// Global Leaderboard, Trade Hub, Player Trading
// ===================================

// ===================================
// LEADERBOARD SYSTEM
// ===================================

/**
 * Update the leaderboard with current player stats
 * Call this whenever the player makes a trade
 */
async function updateLeaderboard(playerData) {
    if (!currentUser || !db) {
        console.error('Not authenticated or DB not initialized');
        return;
    }
    
    try {
        const netWorth = playerData.money + playerData.portfolioValue;
        const totalBabies = Object.values(playerData.portfolio).reduce((sum, qty) => sum + qty, 0);
        const totalLimiteds = Object.values(playerData.limitedInventory).reduce((sum, arr) => sum + arr.length, 0);
        
        await db.collection('leaderboard').doc(currentUser.uid).set({
            username: playerData.username,
            netWorth: netWorth,
            money: playerData.money,
            portfolioValue: playerData.portfolioValue,
            totalTrades: playerData.tradeHistory.length,
            babiesOwned: totalBabies,
            limitedsOwned: totalLimiteds,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('Leaderboard updated!');
    } catch (error) {
        console.error('Leaderboard update failed:', error);
    }
}

/**
 * Load top 10 players from leaderboard
 * @returns {Array} Array of top 10 players
 */
async function loadLeaderboard() {
    if (!db) {
        console.error('DB not initialized');
        return [];
    }
    
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
                isCurrentUser: currentUser && doc.id === currentUser.uid
            });
        });
        
        console.log('Leaderboard loaded:', leaders.length, 'players');
        return leaders;
    } catch (error) {
        console.error('Load leaderboard failed:', error);
        return [];
    }
}

/**
 * Get current player's rank
 * @returns {Object} {rank, totalPlayers}
 */
async function getMyRank() {
    if (!currentUser || !db) return null;
    
    try {
        const myDoc = await db.collection('leaderboard').doc(currentUser.uid).get();
        if (!myDoc.exists) return null;
        
        const myNetWorth = myDoc.data().netWorth;
        
        const higherRanked = await db.collection('leaderboard')
            .where('netWorth', '>', myNetWorth)
            .get();
        
        const totalPlayers = await db.collection('leaderboard').get();
        
        return {
            rank: higherRanked.size + 1,
            totalPlayers: totalPlayers.size
        };
    } catch (error) {
        console.error('Get rank failed:', error);
        return null;
    }
}

// ===================================
// GLOBAL PRICE SYNC
// ===================================

/**
 * Save current prices to Firebase (for all players to see)
 * Call this every 30 minutes when prices update
 */
async function saveGlobalPrices(pricesData) {
    if (!currentUser || !db) {
        console.error('Not authenticated or DB not initialized');
        return;
    }
    
    try {
        await db.collection('globalPrices').doc('current').set({
            babyPrices: pricesData.babyPrices,
            limitedValues: pricesData.limitedValues,
            projectedBabies: pricesData.projectedBabies || [],
            lastUpdate: firebase.firestore.FieldValue.serverTimestamp(),
            updatedBy: currentUser.uid
        });
        
        console.log('Global prices saved!');
        return true;
    } catch (error) {
        console.error('Save global prices failed:', error);
        return false;
    }
}

/**
 * Load global prices from Firebase
 * @returns {Object} {babyPrices, limitedValues, projectedBabies}
 */
async function loadGlobalPrices() {
    if (!db) {
        console.error('DB not initialized');
        return null;
    }
    
    try {
        const priceDoc = await db.collection('globalPrices').doc('current').get();
        
        if (priceDoc.exists) {
            const data = priceDoc.data();
            console.log('Global prices loaded!');
            return {
                babyPrices: data.babyPrices || {},
                limitedValues: data.limitedValues || {},
                projectedBabies: data.projectedBabies || [],
                lastUpdate: data.lastUpdate
            };
        } else {
            console.log('No global prices found - will initialize');
            return null;
        }
    } catch (error) {
        console.error('Load global prices failed:', error);
        return null;
    }
}

/**
 * Listen to real-time price updates
 * @param {Function} callback - Called when prices change
 * @returns {Function} Unsubscribe function
 */
function listenToGlobalPrices(callback) {
    if (!db) {
        console.error('DB not initialized');
        return () => {};
    }
    
    const unsubscribe = db.collection('globalPrices').doc('current')
        .onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                console.log('Real-time price update received!');
                callback({
                    babyPrices: data.babyPrices || {},
                    limitedValues: data.limitedValues || {},
                    projectedBabies: data.projectedBabies || []
                });
            }
        }, (error) => {
            console.error('Price listener error:', error);
        });
    
    return unsubscribe;
}

// ===================================
// TRADE ADS SYSTEM
// ===================================

/**
 * Post a new trade ad
 * @param {Object} adData - Trade ad details
 * @returns {String} Ad ID
 */
async function postTradeAd(adData) {
    if (!currentUser || !db) {
        console.error('Not authenticated or DB not initialized');
        return null;
    }
    
    try {
        const ad = {
            userId: currentUser.uid,
            username: adData.username,
            type: adData.type, // 'upgrade', 'downgrade', 'lf', 'selling'
            offering: adData.offering || {
                items: [], // Array of limited item IDs
                babies: {}, // {babyId: quantity}
                cash: 0
            },
            lookingFor: adData.lookingFor || {
                items: [],
                babies: {},
                cash: 0,
                description: '' // e.g., "Any 5 legendaries"
            },
            description: adData.description || '',
            status: 'active',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            expiresAt: firebase.firestore.Timestamp.fromDate(
                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            )
        };
        
        const docRef = await db.collection('tradeAds').add(ad);
        console.log('Trade ad posted!', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Post trade ad failed:', error);
        return null;
    }
}

/**
 * Load all active trade ads
 * @param {String} filterType - Filter by ad type (optional)
 * @returns {Array} Array of trade ads
 */
async function loadTradeAds(filterType = null) {
    if (!db) {
        console.error('DB not initialized');
        return [];
    }
    
    try {
        let query = db.collection('tradeAds')
            .where('status', '==', 'active')
            .orderBy('createdAt', 'desc')
            .limit(50);
        
        if (filterType) {
            query = query.where('type', '==', filterType);
        }
        
        const snapshot = await query.get();
        
        const ads = [];
        snapshot.forEach(doc => {
            ads.push({ 
                id: doc.id, 
                ...doc.data(),
                isMyAd: currentUser && doc.data().userId === currentUser.uid
            });
        });
        
        console.log('Trade ads loaded:', ads.length);
        return ads;
    } catch (error) {
        console.error('Load trade ads failed:', error);
        return [];
    }
}

/**
 * Delete a trade ad (only your own)
 * @param {String} adId - Ad ID to delete
 */
async function deleteTradeAd(adId) {
    if (!currentUser || !db) {
        console.error('Not authenticated or DB not initialized');
        return false;
    }
    
    try {
        const adDoc = await db.collection('tradeAds').doc(adId).get();
        
        if (!adDoc.exists) {
            console.error('Ad not found');
            return false;
        }
        
        if (adDoc.data().userId !== currentUser.uid) {
            console.error('Cannot delete another users ad');
            return false;
        }
        
        await db.collection('tradeAds').doc(adId).update({
            status: 'cancelled',
            cancelledAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('Trade ad deleted!');
        return true;
    } catch (error) {
        console.error('Delete trade ad failed:', error);
        return false;
    }
}

/**
 * Listen to real-time trade ads
 * @param {Function} callback - Called when ads change
 * @returns {Function} Unsubscribe function
 */
function listenToTradeAds(callback) {
    if (!db) {
        console.error('DB not initialized');
        return () => {};
    }
    
    const unsubscribe = db.collection('tradeAds')
        .where('status', '==', 'active')
        .orderBy('createdAt', 'desc')
        .limit(50)
        .onSnapshot((snapshot) => {
            const ads = [];
            snapshot.forEach(doc => {
                ads.push({ 
                    id: doc.id, 
                    ...doc.data(),
                    isMyAd: currentUser && doc.data().userId === currentUser.uid
                });
            });
            console.log('Real-time trade ads update:', ads.length);
            callback(ads);
        }, (error) => {
            console.error('Trade ads listener error:', error);
        });
    
    return unsubscribe;
}

// ===================================
// PLAYER-TO-PLAYER TRADING
// ===================================

/**
 * Send a trade offer in response to an ad
 * @param {String} adId - The ad you're responding to
 * @param {Object} offerData - Your offer details
 * @returns {String} Offer ID
 */
async function sendTradeOffer(adId, offerData) {
    if (!currentUser || !db) {
        console.error('Not authenticated or DB not initialized');
        return null;
    }
    
    try {
        // Get the original ad
        const adDoc = await db.collection('tradeAds').doc(adId).get();
        if (!adDoc.exists) {
            console.error('Ad not found');
            return null;
        }
        
        const ad = adDoc.data();
        
        // Can't trade with yourself
        if (ad.userId === currentUser.uid) {
            console.error('Cannot trade with yourself');
            return null;
        }
        
        const offer = {
            adId: adId,
            adOwnerId: ad.userId,
            adOwnerUsername: ad.username,
            offeredBy: currentUser.uid,
            offeredByUsername: offerData.username,
            offering: offerData.offering, // What you're giving
            message: offerData.message || '',
            status: 'pending', // pending, accepted, rejected, completed
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        const docRef = await db.collection('tradeOffers').add(offer);
        console.log('Trade offer sent!', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Send trade offer failed:', error);
        return null;
    }
}

/**
 * Accept a trade offer (and execute the trade)
 * @param {String} offerId - Offer ID to accept
 * @param {Object} gameState - Current game state to verify inventory
 * @returns {Boolean} Success
 */
async function acceptTradeOffer(offerId, gameState) {
    if (!currentUser || !db) {
        console.error('Not authenticated or DB not initialized');
        return false;
    }
    
    try {
        const offerDoc = await db.collection('tradeOffers').doc(offerId).get();
        if (!offerDoc.exists) {
            console.error('Offer not found');
            return false;
        }
        
        const offer = offerDoc.data();
        
        // Only ad owner can accept
        if (offer.adOwnerId !== currentUser.uid) {
            console.error('Only ad owner can accept');
            return false;
        }
        
        // Get the original ad
        const adDoc = await db.collection('tradeAds').doc(offer.adId).get();
        if (!adDoc.exists) {
            console.error('Original ad not found');
            return false;
        }
        
        const ad = adDoc.data();
        
        // Verify both players have the items
        // (This would need to be done on the client side before calling)
        
        // Create trade record
        const trade = {
            player1: currentUser.uid,
            player1Username: ad.username,
            player1Gave: ad.offering,
            player2: offer.offeredBy,
            player2Username: offer.offeredByUsername,
            player2Gave: offer.offering,
            adId: offer.adId,
            offerId: offerId,
            status: 'completed',
            completedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('playerTrades').add(trade);
        
        // Update offer status
        await db.collection('tradeOffers').doc(offerId).update({
            status: 'accepted',
            acceptedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Mark ad as completed
        await db.collection('tradeAds').doc(offer.adId).update({
            status: 'completed',
            completedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('Trade completed!');
        return true;
    } catch (error) {
        console.error('Accept trade offer failed:', error);
        return false;
    }
}

/**
 * Reject a trade offer
 * @param {String} offerId - Offer ID to reject
 * @returns {Boolean} Success
 */
async function rejectTradeOffer(offerId) {
    if (!currentUser || !db) {
        console.error('Not authenticated or DB not initialized');
        return false;
    }
    
    try {
        const offerDoc = await db.collection('tradeOffers').doc(offerId).get();
        if (!offerDoc.exists) {
            console.error('Offer not found');
            return false;
        }
        
        const offer = offerDoc.data();
        
        // Only ad owner can reject
        if (offer.adOwnerId !== currentUser.uid) {
            console.error('Only ad owner can reject');
            return false;
        }
        
        await db.collection('tradeOffers').doc(offerId).update({
            status: 'rejected',
            rejectedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('Trade offer rejected');
        return true;
    } catch (error) {
        console.error('Reject trade offer failed:', error);
        return false;
    }
}

/**
 * Load incoming trade offers for current user
 * @returns {Array} Array of offers
 */
async function loadMyTradeOffers() {
    if (!currentUser || !db) {
        console.error('Not authenticated or DB not initialized');
        return [];
    }
    
    try {
        const snapshot = await db.collection('tradeOffers')
            .where('adOwnerId', '==', currentUser.uid)
            .where('status', '==', 'pending')
            .orderBy('createdAt', 'desc')
            .get();
        
        const offers = [];
        snapshot.forEach(doc => {
            offers.push({ id: doc.id, ...doc.data() });
        });
        
        console.log('My trade offers loaded:', offers.length);
        return offers;
    } catch (error) {
        console.error('Load my trade offers failed:', error);
        return [];
    }
}

/**
 * Listen to real-time trade offers for current user
 * @param {Function} callback - Called when new offer arrives
 * @returns {Function} Unsubscribe function
 */
function listenToMyTradeOffers(callback) {
    if (!currentUser || !db) {
        console.error('Not authenticated or DB not initialized');
        return () => {};
    }
    
    const unsubscribe = db.collection('tradeOffers')
        .where('adOwnerId', '==', currentUser.uid)
        .where('status', '==', 'pending')
        .orderBy('createdAt', 'desc')
        .onSnapshot((snapshot) => {
            const offers = [];
            snapshot.forEach(doc => {
                offers.push({ id: doc.id, ...doc.data() });
            });
            console.log('Real-time trade offers update:', offers.length);
            callback(offers);
        }, (error) => {
            console.error('Trade offers listener error:', error);
        });
    
    return unsubscribe;
}

/**
 * Get player trade history (trades with other players)
 * @returns {Array} Array of completed trades
 */
async function getPlayerTradeHistory() {
    if (!currentUser || !db) {
        console.error('Not authenticated or DB not initialized');
        return [];
    }
    
    try {
        const snapshot1 = await db.collection('playerTrades')
            .where('player1', '==', currentUser.uid)
            .orderBy('completedAt', 'desc')
            .limit(20)
            .get();
        
        const snapshot2 = await db.collection('playerTrades')
            .where('player2', '==', currentUser.uid)
            .orderBy('completedAt', 'desc')
            .limit(20)
            .get();
        
        const trades = [];
        snapshot1.forEach(doc => {
            trades.push({ id: doc.id, ...doc.data(), myRole: 'player1' });
        });
        snapshot2.forEach(doc => {
            trades.push({ id: doc.id, ...doc.data(), myRole: 'player2' });
        });
        
        // Sort by date
        trades.sort((a, b) => {
            const aTime = a.completedAt?.toMillis() || 0;
            const bTime = b.completedAt?.toMillis() || 0;
            return bTime - aTime;
        });
        
        console.log('Player trade history loaded:', trades.length);
        return trades;
    } catch (error) {
        console.error('Load player trade history failed:', error);
        return [];
    }
}

// ===================================
// NOTIFICATIONS
// ===================================

/**
 * Send a notification to a user
 * @param {String} userId - User to notify
 * @param {Object} notificationData - Notification details
 */
async function sendNotification(userId, notificationData) {
    if (!db) {
        console.error('DB not initialized');
        return false;
    }
    
    try {
        await db.collection('notifications').add({
            userId: userId,
            type: notificationData.type, // 'trade_offer', 'trade_accepted', etc.
            title: notificationData.title,
            message: notificationData.message,
            data: notificationData.data || {},
            read: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('Notification sent!');
        return true;
    } catch (error) {
        console.error('Send notification failed:', error);
        return false;
    }
}

/**
 * Listen to real-time notifications
 * @param {Function} callback - Called when new notification arrives
 * @returns {Function} Unsubscribe function
 */
function listenToNotifications(callback) {
    if (!currentUser || !db) {
        console.error('Not authenticated or DB not initialized');
        return () => {};
    }
    
    const unsubscribe = db.collection('notifications')
        .where('userId', '==', currentUser.uid)
        .where('read', '==', false)
        .orderBy('createdAt', 'desc')
        .onSnapshot((snapshot) => {
            const notifications = [];
            snapshot.forEach(doc => {
                notifications.push({ id: doc.id, ...doc.data() });
            });
            console.log('New notifications:', notifications.length);
            callback(notifications);
        }, (error) => {
            console.error('Notifications listener error:', error);
        });
    
    return unsubscribe;
}

/**
 * Mark notification as read
 * @param {String} notificationId - Notification ID
 */
async function markNotificationRead(notificationId) {
    if (!db) return;
    
    try {
        await db.collection('notifications').doc(notificationId).update({
            read: true,
            readAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Mark notification read failed:', error);
    }
}

// ===================================
// EXPORT FUNCTIONS (for use in app.js)
// ===================================

// Make functions globally available
window.multiplayer = {
    // Leaderboard
    updateLeaderboard,
    loadLeaderboard,
    getMyRank,
    
    // Global Prices
    saveGlobalPrices,
    loadGlobalPrices,
    listenToGlobalPrices,
    
    // Trade Ads
    postTradeAd,
    loadTradeAds,
    deleteTradeAd,
    listenToTradeAds,
    
    // Player Trading
    sendTradeOffer,
    acceptTradeOffer,
    rejectTradeOffer,
    loadMyTradeOffers,
    listenToMyTradeOffers,
    getPlayerTradeHistory,
    
    // Notifications
    sendNotification,
    listenToNotifications,
    markNotificationRead
};

console.log('Multiplayer module loaded! Access via window.multiplayer');
