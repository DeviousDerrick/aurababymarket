// ===================================
// AURABABY MARKET - COMPLETE EDITION
// Main Game Application
// ===================================

const { useState, useEffect } = React;

// Market Hours Helper Functions
function isMarketOpen() {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 9 && hour < 21; // 9 AM to 9 PM
}

function getTimeUntilMarketOpen() {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour < 9) {
        const open = new Date();
        open.setHours(9, 0, 0, 0);
        return Math.floor((open - now) / 1000);
    } else {
        const open = new Date();
        open.setDate(open.getDate() + 1);
        open.setHours(9, 0, 0, 0);
        return Math.floor((open - now) / 1000);
    }
}

function getTimeUntilMarketClose() {
    const now = new Date();
    const close = new Date();
    close.setHours(21, 0, 0, 0);
    return Math.floor((close - now) / 1000);
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
        return `${hours}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
}

// Main App Component
const AurababyMarket = () => {
    // ===================================
    // GAME DATA
    // ===================================
    
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

    const limitedItems = [
        { id: 'cat', name: 'Lucky Cat', emoji: '🐱', cost: 500, minValue: 300, maxValue: 900 },
        { id: 'dog', name: 'Diamond Dog', emoji: '🐶', cost: 600, minValue: 400, maxValue: 1000 },
        { id: 'panda', name: 'Rare Panda', emoji: '🐼', cost: 800, minValue: 500, maxValue: 1300 },
        { id: 'crown', name: 'Crown Aura', emoji: '👑', cost: 1000, minValue: 700, maxValue: 1700 },
        { id: 'fire', name: 'Fire Essence', emoji: '🔥', cost: 1500, minValue: 1000, maxValue: 2500 },
        { id: 'diamond', name: 'Diamond Baby', emoji: '💎', cost: 2500, minValue: 2000, maxValue: 4000 },
        { id: 'cybergod', name: 'Cyber God', emoji: '👾', cost: 15000, minValue: 10000, maxValue: 25000, tier: 'legendary' },
        { id: 'divinecrown', name: 'Divine Crown', emoji: '🌟', cost: 100000, minValue: 75000, maxValue: 150000, tier: 'divine' }
    ];

    // ===================================
    // STATE MANAGEMENT
    // ===================================
    
    const [money, setMoney] = useState(window.gameState.money);
    const [username, setUsername] = useState(window.gameState.username);
    const [portfolio, setPortfolio] = useState(window.gameState.portfolio);
    const [limitedInventory, setLimitedInventory] = useState(window.gameState.limitedInventory);
    const [limitedMintCounts, setLimitedMintCounts] = useState(window.gameState.limitedMintCounts);
    const [tradeHistory, setTradeHistory] = useState(window.gameState.tradeHistory);
    const [highestMoney, setHighestMoney] = useState(window.gameState.highestMoney);
    const [highestNetWorth, setHighestNetWorth] = useState(window.gameState.highestNetWorth);
    
    const [prices, setPrices] = useState(() => {
        const p = {};
        babies.forEach(baby => { p[baby.id] = 150; });
        return p;
    });
    
    const [limitedValues, setLimitedValues] = useState(() => {
        const values = {};
        limitedItems.forEach(item => {
            values[item.id] = (item.minValue + item.maxValue) / 2;
        });
        return values;
    });
    
    const [marketOpen, setMarketOpen] = useState(isMarketOpen());
    const [timeUntilChange, setTimeUntilChange] = useState(0);
    
    const [currentView, setCurrentView] = useState('market');
    const [selectedBaby, setSelectedBaby] = useState(null);
    
    // Multiplayer state
    const [leaderboard, setLeaderboard] = useState([]);
    const [tradeAds, setTradeAds] = useState([]);
    const [myRank, setMyRank] = useState(null);
    const [showPostAdModal, setShowPostAdModal] = useState(false);

    // ===================================
    // SYNC STATE WITH FIREBASE
    // ===================================
    
    useEffect(() => {
        window.gameState = { 
            money, portfolio, limitedInventory, limitedMintCounts, 
            tradeHistory, highestMoney, highestNetWorth, username, 
            createdAt: window.gameState.createdAt 
        };
    }, [money, portfolio, limitedInventory, limitedMintCounts, tradeHistory, highestMoney, highestNetWorth, username]);

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
        Object.keys(portfolio).forEach(id => {
            total += (portfolio[id] || 0) * prices[id];
        });
        Object.keys(limitedInventory).forEach(id => {
            const items = limitedInventory[id] || [];
            total += items.length * limitedValues[id];
        });
        return Math.round(total * 100) / 100;
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

    // ===================================
    // TRADING FUNCTIONS
    // ===================================
    
    const updateLeaderboardData = async () => {
        if (window.multiplayer) {
            await window.multiplayer.updateLeaderboard({
                username, money,
                portfolioValue: getPortfolioValue(),
                portfolio, limitedInventory, tradeHistory
            });
        }
    };

    const buyBaby = async (babyId, babyPrice) => {
        if (!marketOpen) {
            alert("Market is closed! Trading hours: 9 AM - 9 PM");
            return;
        }
        
        if (money >= babyPrice) {
            setMoney(prev => prev - babyPrice);
            setPortfolio(prev => ({ ...prev, [babyId]: (prev[babyId] || 0) + 1 }));
            
            const baby = babies.find(b => b.id === babyId);
            setTradeHistory(prev => [{
                id: Date.now(),
                type: 'BUY_BABY',
                babyName: baby.name,
                price: babyPrice,
                timestamp: new Date().toLocaleString()
            }, ...prev]);
            
            saveGameData();
            await updateLeaderboardData();
        }
    };

    const sellBaby = async (babyId, babyPrice) => {
        if (!marketOpen) {
            alert("Market is closed! Trading hours: 9 AM - 9 PM");
            return;
        }
        
        if (portfolio[babyId] && portfolio[babyId] > 0) {
            setMoney(prev => prev + babyPrice);
            setPortfolio(prev => ({ ...prev, [babyId]: prev[babyId] - 1 }));
            
            const baby = babies.find(b => b.id === babyId);
            setTradeHistory(prev => [{
                id: Date.now(),
                type: 'SELL_BABY',
                babyName: baby.name,
                price: babyPrice,
                timestamp: new Date().toLocaleString()
            }, ...prev]);
            
            saveGameData();
            await updateLeaderboardData();
        }
    };

    const buyLimited = async (itemId) => {
        if (!marketOpen) {
            alert("Market is closed! Trading hours: 9 AM - 9 PM");
            return;
        }
        
        const item = limitedItems.find(i => i.id === itemId);
        if (!item || money < item.cost) return;

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
            price: item.cost,
            timestamp: new Date().toLocaleString()
        }, ...prev]);
        
        saveGameData();
        await updateLeaderboardData();
    };

    const sellLimited = async (itemId, serialNumber) => {
        if (!marketOpen) {
            alert("Market is closed! Trading hours: 9 AM - 9 PM");
            return;
        }
        
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
            price: currentValue,
            timestamp: new Date().toLocaleString()
        }, ...prev]);
        
        saveGameData();
        await updateLeaderboardData();
    };

    // ===================================
    // GLOBAL PRICES
    // ===================================
    
    useEffect(() => {
        const loadPrices = async () => {
            if (window.multiplayer) {
                const globalPrices = await window.multiplayer.loadGlobalPrices();
                if (globalPrices && globalPrices.babyPrices) {
                    console.log('✅ Loaded global prices from Firebase!');
                    setPrices(globalPrices.babyPrices);
                    if (globalPrices.limitedValues) {
                        setLimitedValues(globalPrices.limitedValues);
                    }
                } else {
                    console.log('⚠️ Initializing global prices...');
                    const initPrices = {};
                    babies.forEach(b => { initPrices[b.id] = 150; });
                    await window.multiplayer.saveGlobalPrices({
                        babyPrices: initPrices,
                        limitedValues: limitedValues,
                        projectedBabies: []
                    });
                    setPrices(initPrices);
                }
            }
        };
        loadPrices();
    }, []);

    useEffect(() => {
        if (window.multiplayer) {
            const unsubscribe = window.multiplayer.listenToGlobalPrices((newPrices) => {
                console.log('🔄 Real-time price update!');
                if (newPrices.babyPrices) setPrices(newPrices.babyPrices);
                if (newPrices.limitedValues) setLimitedValues(newPrices.limitedValues);
            });
            return () => unsubscribe();
        }
    }, []);

    useEffect(() => {
        const priceInterval = setInterval(async () => {
            if (isMarketOpen()) {
                console.log('📊 Updating prices...');
                const newPrices = { ...prices };
                const newLimitedValues = { ...limitedValues };
                
                babies.forEach(baby => {
                    const changePercent = (Math.random() * 0.3 - 0.15);
                    const priceChange = newPrices[baby.id] * changePercent;
                    let newPrice = newPrices[baby.id] + priceChange;
                    if (newPrice < 10) newPrice = 10;
                    newPrices[baby.id] = Math.round(newPrice * 100) / 100;
                });
                
                limitedItems.forEach(item => {
                    const changePercent = (Math.random() * 0.2 - 0.1);
                    const valueChange = newLimitedValues[item.id] * changePercent;
                    let newValue = newLimitedValues[item.id] + valueChange;
                    if (newValue < item.minValue) newValue = item.minValue;
                    if (newValue > item.maxValue) newValue = item.maxValue;
                    newLimitedValues[item.id] = Math.round(newValue * 100) / 100;
                });
                
                setPrices(newPrices);
                setLimitedValues(newLimitedValues);
                
                if (window.multiplayer) {
                    await window.multiplayer.saveGlobalPrices({
                        babyPrices: newPrices,
                        limitedValues: newLimitedValues,
                        projectedBabies: []
                    });
                    console.log('✅ Saved prices to Firebase!');
                }
            }
        }, 1800000); // 30 minutes
        return () => clearInterval(priceInterval);
    }, [prices, limitedValues]);

    // ===================================
    // MARKET HOURS TIMER
    // ===================================
    
    useEffect(() => {
        const timer = setInterval(() => {
            const isOpen = isMarketOpen();
            setMarketOpen(isOpen);
            
            if (isOpen) {
                setTimeUntilChange(getTimeUntilMarketClose());
            } else {
                setTimeUntilChange(getTimeUntilMarketOpen());
            }
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            if (marketOpen) {
                setMoney(prev => prev + 200);
            }
        }, 90000);
        return () => clearInterval(timer);
    }, [marketOpen]);

    // ===================================
    // LEADERBOARD
    // ===================================
    
    useEffect(() => {
        if (currentView === 'leaderboard' && window.multiplayer) {
            const loadLeaders = async () => {
                const leaders = await window.multiplayer.loadLeaderboard();
                setLeaderboard(leaders);
                
                const rank = await window.multiplayer.getMyRank();
                setMyRank(rank);
            };
            loadLeaders();
            const interval = setInterval(loadLeaders, 30000);
            return () => clearInterval(interval);
        }
    }, [currentView]);

    // ===================================
    // TRADE ADS
    // ===================================
    
    useEffect(() => {
        if (currentView === 'tradehub' && window.multiplayer) {
            const loadAds = async () => {
                const ads = await window.multiplayer.loadTradeAds();
                setTradeAds(ads);
            };
            loadAds();
            const interval = setInterval(loadAds, 30000);
            return () => clearInterval(interval);
        }
    }, [currentView]);

    const postTradeAd = async (adData) => {
        if (window.multiplayer) {
            const adId = await window.multiplayer.postTradeAd({
                username: username,
                type: adData.type,
                offering: adData.offering,
                lookingFor: adData.lookingFor,
                description: adData.description
            });
            if (adId) {
                alert('Trade ad posted successfully!');
                setShowPostAdModal(false);
                // Reload ads
                const ads = await window.multiplayer.loadTradeAds();
                setTradeAds(ads);
            }
        }
    };

    const deleteTradeAd = async (adId) => {
        if (confirm('Delete this trade ad?')) {
            if (window.multiplayer) {
                await window.multiplayer.deleteTradeAd(adId);
                const ads = await window.multiplayer.loadTradeAds();
                setTradeAds(ads);
            }
        }
    };

    // Continue in part 2...

    // ===================================
    // RENDER - MAIN UI
    // ===================================
    
    return (
        <div style={{ display: 'flex' }}>
            {/* Sidebar */}
            <div className="sidebar">
                <h2>💰 Aurababy Market</h2>
                
                <div className="sidebar-stats">
                    <div><strong>User:</strong><br/>{username}</div>
                    <div><strong>Cash:</strong><br/>${money.toLocaleString()}</div>
                    <div><strong>Portfolio:</strong><br/>${getPortfolioValue().toLocaleString()}</div>
                    <div><strong>Net Worth:</strong><br/>${(money + getPortfolioValue()).toLocaleString()}</div>
                    <div style={{ borderTop: '1px solid #7f8c8d', paddingTop: '10px', marginTop: '10px' }}>
                        <strong>Market:</strong><br/>
                        {marketOpen ? (
                            <span style={{ color: '#27ae60' }}>🟢 OPEN</span>
                        ) : (
                            <span style={{ color: '#e74c3c' }}>🔴 CLOSED</span>
                        )}
                    </div>
                    <div style={{ fontSize: '11px', color: '#bdc3c7', marginTop: '5px' }}>
                        {marketOpen ? 'Closes: ' : 'Opens: '}{formatTime(timeUntilChange)}
                    </div>
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
                    Market: 9 AM - 9 PM<br/>
                    Global Prices Sync!
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                {/* MARKET VIEW */}
                {currentView === 'market' && (
                    <div>
                        <h1 className="view-title">🏪 Baby Market</h1>
                        
                        {!marketOpen ? (
                            <div className="market-closed-banner">
                                🔴 <strong>MARKET CLOSED</strong><br/>
                                Trading hours: 9 AM - 9 PM<br/>
                                Opens in: {formatTime(timeUntilChange)}
                            </div>
                        ) : (
                            <div className="market-open-banner">
                                🟢 Market Open | Closes in: {formatTime(timeUntilChange)} | Prices sync globally every 30 min
                            </div>
                        )}
                        
                        <div className="card-grid">
                            {babies.map(baby => {
                                const price = prices[baby.id];
                                const owned = portfolio[baby.id] || 0;
                                
                                return (
                                    <div key={baby.id} className="card" onClick={() => setSelectedBaby(baby)}>
                                        <img src={baby.image} alt={baby.name} />
                                        <h3>{baby.name}</h3>
                                        <div className="card-price">${price.toFixed(2)}</div>
                                        {owned > 0 && <div className="card-info" style={{color:'blue'}}>You own: {owned}</div>}
                                        <button onClick={(e) => { e.stopPropagation(); buyBaby(baby.id, price); }}
                                            disabled={money < price || !marketOpen} 
                                            className="card-button buy-button">
                                            {!marketOpen ? 'MARKET CLOSED' : `BUY $${price.toFixed(2)}`}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* LIMITED STORE VIEW */}
                {currentView === 'store' && (
                    <div>
                        <h1 className="view-title">🛒 Limited Store</h1>
                        <p className="view-subtitle">Serial numbered collectibles with fluctuating values!</p>
                        
                        {!marketOpen && (
                            <div className="market-closed-banner">
                                🔴 Market Closed - Trading starts at 9 AM
                            </div>
                        )}
                        
                        <div className="card-grid">
                            {limitedItems.map(item => {
                                const currentValue = limitedValues[item.id];
                                const totalMinted = limitedMintCounts[item.id] || 0;
                                const owned = limitedInventory[item.id] || [];
                                const valueChange = currentValue - item.cost;
                                const valueChangePercent = ((valueChange / item.cost) * 100).toFixed(1);
                                
                                return (
                                    <div key={item.id} className="card limited-card" 
                                        style={{ background: item.tier ? 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                        <div className="limited-emoji">{item.emoji}</div>
                                        <h2 style={{ textAlign: 'center', marginBottom: '15px', color: 'white' }}>{item.name}</h2>
                                        <div className="limited-info">
                                            <div style={{ marginBottom: '8px' }}><strong>Cost:</strong> ${item.cost.toLocaleString()}</div>
                                            <div style={{ marginBottom: '8px' }}><strong>Value:</strong> ${currentValue.toLocaleString()}</div>
                                            <div style={{ marginBottom: '8px', color: valueChange >= 0 ? '#2ecc71' : '#e74c3c' }}>
                                                <strong>Change:</strong> ${valueChange.toLocaleString()} ({valueChangePercent}%)
                                            </div>
                                            <div style={{ marginBottom: '8px' }}><strong>Minted:</strong> {totalMinted}</div>
                                            {owned.length > 0 && (
                                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '8px', marginTop: '8px', color: '#3498db' }}>
                                                    <strong>You Own:</strong> {owned.length}
                                                </div>
                                            )}
                                        </div>
                                        <button onClick={() => buyLimited(item.id)} disabled={money < item.cost || !marketOpen} 
                                            className="card-button buy-button">
                                            {!marketOpen ? 'MARKET CLOSED' : (money >= item.cost ? `BUY $${item.cost.toLocaleString()}` : 'NOT ENOUGH')}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* PORTFOLIO VIEW */}
                {currentView === 'portfolio' && (
                    <div>
                        <h1 className="view-title">📊 Your Portfolio</h1>
                        
                        {!marketOpen && (
                            <div className="market-closed-banner">
                                🔴 Market Closed - Cannot sell until 9 AM
                            </div>
                        )}
                        
                        {/* Babies */}
                        {Object.keys(portfolio).some(id => portfolio[id] > 0) && (
                            <div>
                                <h3 className="mt-20">👶 Babies</h3>
                                <div className="card-grid mt-10">
                                    {babies.map(baby => {
                                        const quantity = portfolio[baby.id] || 0;
                                        if (quantity === 0) return null;
                                        const currentPrice = prices[baby.id];
                                        
                                        return (
                                            <div key={baby.id} className="card">
                                                <img src={baby.image} alt={baby.name} />
                                                <h3>{baby.name}</h3>
                                                <div><strong>Quantity:</strong> {quantity}</div>
                                                <div className="card-price">${(quantity * currentPrice).toFixed(2)}</div>
                                                <button onClick={() => sellBaby(baby.id, currentPrice)} 
                                                    disabled={!marketOpen}
                                                    className="card-button sell-button">
                                                    {!marketOpen ? 'MARKET CLOSED' : `SELL $${currentPrice.toFixed(2)}`}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
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
                                                style={{ background: 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)' }}>
                                                <div className="limited-emoji" style={{ fontSize: '60px' }}>{item.emoji}</div>
                                                <h3 style={{ color: 'white', textAlign: 'center' }}>{item.name}</h3>
                                                <div className="limited-serial">
                                                    <div style={{ fontSize: '20px', marginBottom: '5px' }}>#{ownedItem.serialNumber}</div>
                                                </div>
                                                <div className="mt-10" style={{ color: 'white' }}>
                                                    <div><strong>Paid:</strong> ${ownedItem.purchasePrice.toLocaleString()}</div>
                                                    <div><strong>Worth:</strong> ${currentValue.toLocaleString()}</div>
                                                    <div className="card-price" style={{ color: currentValue > ownedItem.purchasePrice ? '#2ecc71' : '#e74c3c' }}>
                                                        P/L: ${(currentValue - ownedItem.purchasePrice).toLocaleString()}
                                                    </div>
                                                </div>
                                                <button onClick={() => sellLimited(item.id, ownedItem.serialNumber)} 
                                                    disabled={!marketOpen}
                                                    className="card-button sell-button">
                                                    {!marketOpen ? 'MARKET CLOSED' : `SELL $${currentValue.toLocaleString()}`}
                                                </button>
                                            </div>
                                        ));
                                    })}
                                </div>
                            </div>
                        )}

                        {!Object.keys(portfolio).some(id => portfolio[id] > 0) && 
                         !Object.keys(limitedInventory).some(id => limitedInventory[id] && limitedInventory[id].length > 0) && (
                            <p>No assets owned. Visit the Market and Limited Store!</p>
                        )}
                    </div>
                )}

                {/* TRADE HISTORY VIEW */}
                {currentView === 'trades' && (
                    <div>
                        <h1 className="view-title">📜 Trade History</h1>
                        {tradeHistory.length > 0 ? (
                            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                {tradeHistory.map(trade => (
                                    <div key={trade.id} className={`trade-item ${trade.type.includes('SELL') ? 'trade-sell' : 'trade-buy'}`}>
                                        <div className="trade-info">
                                            <strong>{trade.type.replace('_', ' ')}</strong>: {trade.babyName}
                                            <div style={{ fontSize: '14px', color: '#666' }}>{trade.timestamp}</div>
                                        </div>
                                        <div className="trade-price">
                                            ${trade.price.toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No trades yet. Start buying and selling!</p>
                        )}
                    </div>
                )}

                {/* PROFILE VIEW */}
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

                {/* LEADERBOARD VIEW */}
                {currentView === 'leaderboard' && (
                    <div>
                        <h1 className="view-title">🏆 Global Leaderboard</h1>
                        <p className="view-subtitle">Top 10 players by net worth • Updates every 30 seconds</p>
                        
                        {myRank && (
                            <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
                                <strong>Your Rank: #{myRank.rank}</strong> out of {myRank.totalPlayers} players
                            </div>
                        )}
                        
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
                                            <tr key={player.id} className={player.isCurrentUser ? 'leaderboard-highlight' : ''}>
                                                <td><span className="leaderboard-rank">#{index + 1}</span></td>
                                                <td><strong>{player.username}</strong> {player.isCurrentUser && '(You)'}</td>
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

                {/* TRADE HUB VIEW */}
                {currentView === 'tradehub' && (
                    <div>
                        <h1 className="view-title">📢 Trade Hub</h1>
                        <p className="view-subtitle">Post and browse trade offers from other players!</p>
                        
                        <button className="form-button" style={{ marginBottom: '20px' }} onClick={() => setShowPostAdModal(true)}>
                            ➕ Post New Trade Offer
                        </button>
                        
                        {tradeAds.length > 0 ? (
                            <div>
                                {tradeAds.map(ad => (
                                    <div key={ad.id} className="trade-ad-card">
                                        <div className="trade-ad-header">
                                            <div>
                                                <span className={`trade-ad-type trade-type-${ad.type}`}>
                                                    {ad.type.toUpperCase()}
                                                </span>
                                                <strong> {ad.username}</strong>
                                                {ad.isMyAd && <span style={{ color: '#3498db' }}> (Your Ad)</span>}
                                            </div>
                                            <small>{ad.createdAt && new Date(ad.createdAt.toDate()).toLocaleDateString()}</small>
                                        </div>
                                        <div className="trade-ad-content">
                                            <p><strong>Description:</strong> {ad.description}</p>
                                        </div>
                                        <div className="trade-ad-actions">
                                            {ad.isMyAd ? (
                                                <button className="form-button" style={{ background: '#e74c3c' }} onClick={() => deleteTradeAd(ad.id)}>
                                                    Delete Ad
                                                </button>
                                            ) : (
                                                <button className="form-button">
                                                    Make Offer (Coming Soon)
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
                                <p>No active trade offers. Be the first to post one!</p>
                            </div>
                        )}
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
                        <div className="card-price">${prices[selectedBaby.id].toFixed(2)}</div>
                        <div className="mb-20">You own: {portfolio[selectedBaby.id] || 0}</div>
                        {!marketOpen && (
                            <div style={{ background: '#e74c3c', color: 'white', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>
                                Market Closed - Trading starts at 9 AM
                            </div>
                        )}
                        <div className="modal-buttons">
                            <button onClick={() => buyBaby(selectedBaby.id, prices[selectedBaby.id])}
                                disabled={money < prices[selectedBaby.id] || !marketOpen} 
                                className={`modal-button ${money >= prices[selectedBaby.id] && marketOpen ? 'modal-button-primary' : 'modal-button-cancel'}`}>
                                BUY ${prices[selectedBaby.id].toFixed(2)}
                            </button>
                            {portfolio[selectedBaby.id] > 0 && (
                                <button onClick={() => sellBaby(selectedBaby.id, prices[selectedBaby.id])} 
                                    disabled={!marketOpen}
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

            {/* Post Trade Ad Modal */}
            {showPostAdModal && (
                <div onClick={() => setShowPostAdModal(false)} className="modal-overlay">
                    <div onClick={e => e.stopPropagation()} className="modal">
                        <h2>📢 Post Trade Offer</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            postTradeAd({
                                type: formData.get('type'),
                                description: formData.get('description'),
                                offering: {},
                                lookingFor: {}
                            });
                        }}>
                            <div className="form-group">
                                <label className="form-label">Type:</label>
                                <select name="type" className="form-select" required>
                                    <option value="upgrade">Upgrade (Multiple → One Expensive)</option>
                                    <option value="downgrade">Downgrade (One Expensive → Multiple)</option>
                                    <option value="lf">LF (Looking For)</option>
                                    <option value="selling">Selling</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description:</label>
                                <textarea name="description" className="form-textarea" required
                                    placeholder="e.g., Trading 3x Lucky Cat for Crown Aura"></textarea>
                            </div>
                            <div className="modal-buttons">
                                <button type="submit" className="modal-button modal-button-primary">
                                    Post Offer
                                </button>
                                <button type="button" onClick={() => setShowPostAdModal(false)} className="modal-button modal-button-cancel">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Render the app
ReactDOM.render(<AurababyMarket />, document.getElementById('root'));
