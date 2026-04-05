// ══════════════════════════════════════════════════════════════
//  🌸 AURABABY MARKET — EASTER SCRIPT PATCH
//  Instructions: paste each section into the correct spot in script.js
// ══════════════════════════════════════════════════════════════


// ──────────────────────────────────────────────────────────────
//  STEP 1 — Add Easter state inside the AurababyMarket component
//  (paste right after the last const [...] = useState(...) line)
// ──────────────────────────────────────────────────────────────

    const [showEggCodePopup, setShowEggCodePopup] = useState(false);
    const [eggCodeData, setEggCodeData] = useState(null);


// ──────────────────────────────────────────────────────────────
//  STEP 2 — Add Easter limited buy handler
//  (paste right before the buyLimited function)
// ──────────────────────────────────────────────────────────────

    const buyEasterLimited = (itemId, cost) => {
        if (money < cost) { alert(`You need $${cost.toLocaleString()} to buy this item!`); return; }
        const item = limitedItems.find(i => i.id === itemId);
        if (!item) return;

        const nm = money - cost;
        const serial = Date.now();
        const ni = { ...limitedInventory, [itemId]: [...(limitedInventory[itemId] || []), { serial, purchaseDate: new Date().toISOString() }] };
        const nt = { id: Date.now(), type: 'BUY_LIMITED', babyName: item.name + ' #' + serial, price: cost, timestamp: new Date().toLocaleString() };
        const nh = [nt, ...tradeHistory];
        setMoney(nm); setLimitedInventory(ni); setTradeHistory(nh);
        window.gameState.money = nm; window.gameState.limitedInventory = ni; window.gameState.tradeHistory = nh;
        saveGameData();

        // If item has an egg code, show the popup!
        if (item.eggCodeItem && item.eggCode) {
            setEggCodeData({ name: item.name, code: item.eggCode, emoji: item.emoji, rarity: item.rarity });
            setShowEggCodePopup(true);
        } else {
            alert(`✅ You bought ${item.emoji} ${item.name}!`);
        }
    };


// ──────────────────────────────────────────────────────────────
//  STEP 3 — Add Easter Tab nav button
//  (paste inside the nav-tabs div, after the last existing nav tab)
// ──────────────────────────────────────────────────────────────

                    ['easter', '🌸 Easter 🥚']


// ──────────────────────────────────────────────────────────────
//  STEP 4 — Easter tab class override in the .map()
//  Change the nav tab rendering to this to give Easter its special colour:
// ──────────────────────────────────────────────────────────────

                ].map(([v, label]) => (
                    <button key={v} onClick={() => setCurrentView(v)}
                        className={`nav-tab ${v === 'easter' ? 'easter-tab' : ''} ${currentView === v ? 'active' : ''}`}>
                        {label}
                    </button>
                ))}


// ──────────────────────────────────────────────────────────────
//  STEP 5 — FULL EASTER VIEW
//  Paste this entire block BEFORE the closing </div> of main-content
//  (before the TRADE COMPOSE MODAL comment)
// ──────────────────────────────────────────────────────────────

                {/* ═══ EASTER TAB ═══ */}
                {currentView === 'easter' && (() => {
                    const easterLimiteds  = limitedItems.filter(i => i.easter);
                    const easterGenerators = allGenerators.filter(g => g.easter);
                    const getGenBg = (r) => ({
                        Common:    'linear-gradient(135deg,#a8d5a2,#52b788)',
                        Rare:      'linear-gradient(135deg,#74c69d,#2d6a4f)',
                        Epic:      'linear-gradient(135deg,#b388ff,#7b2ff7)',
                        Legendary: 'linear-gradient(135deg,#f7dc6f,#f39c12)',
                        Divine:    'linear-gradient(135deg,#ffd700,#ff8c00)',
                    }[r] || 'linear-gradient(135deg,#a8d5a2,#52b788)');

                    return (
                        <div>
                            {/* PAGE HEADER */}
                            <div style={{textAlign:'center',marginBottom:'32px'}}>
                                <h1 style={{fontFamily:'"Fredoka One",cursive',fontSize:'clamp(2em,5.5vw,3.8em)',color:'#1b4332',textShadow:'0 0 20px rgba(64,145,108,.4),4px 4px 0 rgba(255,255,255,.6)',letterSpacing:'3px',marginBottom:'8px'}}>
                                    🌸 Easter Special Shop 🥚
                                </h1>
                                <p style={{fontSize:'1em',fontWeight:'700',color:'#2d6a4f',letterSpacing:'1px'}}>
                                    Limited-time Easter items & generators — Spring edition 🐰
                                </p>
                            </div>

                            {/* EGG CODE BANNER */}
                            <div className="easter-section-banner">
                                <span style={{fontSize:'3em',flexShrink:0}}>🌌</span>
                                <div>
                                    <div style={{fontFamily:'"Fredoka One",cursive',fontSize:'1.3em',color:'#1b4332',marginBottom:'4px'}}>
                                        🥚 Egg Hunt — Northern Lights Egg
                                    </div>
                                    <div style={{fontSize:'.9em',color:'rgba(27,67,50,.7)',fontWeight:'700',lineHeight:'1.6'}}>
                                        Buy the <strong>Northern Lights Egg</strong> for $10,000 and receive a secret egg code for the <strong>Aurababy Egg Hunt</strong>! Hidden codes earn you rare rewards. 🔍
                                    </div>
                                </div>
                            </div>

                            {/* EASTER LIMITEDS */}
                            <h2 style={{fontFamily:'"Fredoka One",cursive',fontSize:'1.7em',color:'#1b4332',marginBottom:'16px',display:'flex',alignItems:'center',gap:'12px'}}>
                                💎 Easter Limited Items
                                <span style={{flex:1,height:'2px',background:'linear-gradient(90deg,rgba(27,67,50,.3),transparent)',display:'block'}}></span>
                            </h2>
                            <div className="card-grid" style={{marginBottom:'40px'}}>
                                {easterLimiteds.map(item => {
                                    const owned = limitedInventory[item.id]?.length || 0;
                                    const value = limitedValues[item.id] || (item.minValue + item.maxValue) / 2;
                                    const isSpecial = item.eggCodeItem;
                                    return (
                                        <div key={item.id}
                                            className={`card limited-card ${isSpecial ? 'easter-special' : 'rarity-'+item.rarity.toLowerCase()}`}
                                            onClick={() => setSelectedLimited(item)}
                                            style={isSpecial ? {position:'relative'} : {}}>
                                            {isSpecial && (
                                                <div style={{position:'absolute',top:'-10px',left:'50%',transform:'translateX(-50%)',background:'linear-gradient(135deg,#ffd700,#f9c74f)',color:'#1b4332',fontFamily:'"Fredoka One",cursive',fontSize:'.8em',padding:'4px 16px',borderRadius:'20px',fontWeight:'800',boxShadow:'0 3px 10px rgba(255,215,0,.4)',whiteSpace:'nowrap',zIndex:5}}>
                                                    🥚 EGG HUNT CODE INSIDE!
                                                </div>
                                            )}
                                            <div className={`limited-badge rarity-${item.rarity.toLowerCase()}`}>{item.rarity}</div>
                                            <div className="limited-emoji">{item.emoji}</div>
                                            <h3 className="card-title" style={{color:'white',textAlign:'center'}}>{item.name}</h3>
                                            <div style={{textAlign:'center',color:'rgba(255,255,255,.9)',marginBottom:'10px',fontSize:'13px',fontWeight:'700'}}>
                                                <div>Cost: ${item.cost.toLocaleString()}</div>
                                                <div>Value: ${value.toFixed(0)}</div>
                                                {owned > 0 && <div style={{marginTop:'4px',color:'#ffe566'}}>✅ Owned: {owned}</div>}
                                            </div>
                                            <button
                                                onClick={e => { e.stopPropagation(); buyEasterLimited(item.id, item.cost); }}
                                                disabled={money < item.cost}
                                                className="card-button btn btn-success"
                                                style={isSpecial ? {background:'linear-gradient(135deg,#1b4332,#40916c)',fontFamily:'"Fredoka One",cursive',letterSpacing:'1px'} : {}}>
                                                {isSpecial ? `🌌 BUY & GET CODE — $${item.cost.toLocaleString()}` : `BUY $${item.cost.toLocaleString()}`}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* EASTER GENERATORS */}
                            <h2 style={{fontFamily:'"Fredoka One",cursive',fontSize:'1.7em',color:'#1b4332',marginBottom:'16px',display:'flex',alignItems:'center',gap:'12px'}}>
                                ⛏️ Easter Generators
                                <span style={{flex:1,height:'2px',background:'linear-gradient(90deg,rgba(27,67,50,.3),transparent)',display:'block'}}></span>
                            </h2>
                            <div style={{background:'rgba(255,255,255,.7)',borderRadius:'16px',padding:'16px 20px',marginBottom:'22px',border:'2px solid rgba(64,145,108,.2)',fontSize:'14px',fontWeight:'700',color:'#2d6a4f'}}>
                                🌸 Easter generators are seasonal — they earn passive income every 2 minutes just like regular generators. Stock up while they last!
                            </div>
                            <div className="card-grid">
                                {easterGenerators.map(gen => {
                                    const price = generatorPrices[gen.id] || gen.baseCost;
                                    const owned = generatorInventory[gen.id] || 0;
                                    return (
                                        <div key={gen.id} style={{background:getGenBg(gen.rarity),borderRadius:'18px',padding:'20px',color:'white',position:'relative',boxShadow:`0 4px 18px rgba(0,0,0,.15)`,transition:'transform .3s'}}
                                            onMouseOver={e=>e.currentTarget.style.transform='translateY(-6px)'}
                                            onMouseOut={e=>e.currentTarget.style.transform='translateY(0)'}>
                                            <div style={{position:'absolute',top:'12px',right:'12px',background:'rgba(0,0,0,.28)',padding:'4px 10px',borderRadius:'12px',fontSize:'11px',fontWeight:'800'}}>{gen.rarity}</div>
                                            <div style={{fontSize:'54px',textAlign:'center',marginBottom:'10px'}}>{gen.emoji}</div>
                                            <h3 style={{textAlign:'center',fontSize:'17px',marginBottom:'10px',fontWeight:'800',fontFamily:'"Fredoka One",cursive'}}>{gen.name}</h3>
                                            <div style={{background:'rgba(0,0,0,.22)',borderRadius:'12px',padding:'10px',marginBottom:'10px',textAlign:'center'}}>
                                                <div style={{fontSize:'12px',opacity:.85}}>Earns every 2 min:</div>
                                                <div style={{fontSize:'22px',fontWeight:'800',fontFamily:'"Fredoka One",cursive'}}>${gen.incomeMin.toLocaleString()}–${gen.incomeMax.toLocaleString()}</div>
                                            </div>
                                            {owned > 0 && (
                                                <div style={{background:'rgba(255,255,255,.25)',borderRadius:'10px',padding:'7px',marginBottom:'8px',textAlign:'center',fontWeight:'800',fontSize:'14px'}}>
                                                    ✅ Owned: {owned} → +${(gen.incomeMin*owned).toLocaleString()}/2min
                                                </div>
                                            )}
                                            <button onClick={() => buyGenerator(gen.id)} disabled={money < price}
                                                style={{width:'100%',padding:'13px',border:'none',borderRadius:'10px',background:money>=price?'rgba(255,255,255,.9)':'rgba(255,255,255,.22)',color:money>=price?'#1b4332':'rgba(255,255,255,.5)',fontWeight:'800',fontSize:'15px',cursor:money>=price?'pointer':'not-allowed',fontFamily:'"Fredoka One",cursive',letterSpacing:'1px'}}>
                                                {money >= price ? `BUY $${price.toLocaleString()}` : `Need $${price.toLocaleString()}`}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })()}


// ──────────────────────────────────────────────────────────────
//  STEP 6 — Egg Code Popup Modal
//  Paste this right BEFORE the closing </> of the component return
//  (right before the last line that starts with </>)
// ──────────────────────────────────────────────────────────────

            {/* EGG CODE PURCHASE POPUP */}
            {showEggCodePopup && eggCodeData && (
                <div className="egg-code-popup-overlay" onClick={() => setShowEggCodePopup(false)}>
                    <div className="egg-code-popup" onClick={e => e.stopPropagation()}>
                        <div style={{fontSize:'4em',marginBottom:'12px'}}>{eggCodeData.emoji}</div>
                        <div style={{fontFamily:'"Fredoka One",cursive',fontSize:'1.8em',color:'#1b4332',marginBottom:'6px'}}>{eggCodeData.name}</div>
                        <div style={{fontSize:'.78em',fontWeight:'800',textTransform:'uppercase',letterSpacing:'2px',color:'#886600',background:'rgba(255,215,0,.2)',border:'1px solid rgba(255,215,0,.5)',padding:'4px 14px',borderRadius:'20px',display:'inline-block',marginBottom:'16px'}}>✨ {eggCodeData.rarity}</div>
                        <div style={{fontSize:'.9em',color:'rgba(27,67,50,.65)',marginBottom:'16px',lineHeight:'1.6',fontWeight:'600'}}>
                            🎉 You found a hidden egg! Copy the code below and enter it on the<br/>
                            <strong>🥚 Aurababy Egg Hunt</strong> page to add this egg to your collection!
                        </div>
                        <div style={{background:'#f0f8f4',border:'2px solid #52b788',borderRadius:'14px',padding:'16px',fontFamily:'monospace',fontSize:'1.5em',fontWeight:'900',letterSpacing:'4px',color:'#1b4332',marginBottom:'16px',userSelect:'all'}}>
                            NorthernLights
                        </div>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText('NorthernLights');
                                document.getElementById('egg-copy-btn').textContent = '✅ Copied!';
                                setTimeout(() => { const b = document.getElementById('egg-copy-btn'); if(b) b.textContent = '📋 Copy Code'; }, 2200);
                            }}
                            id="egg-copy-btn"
                            style={{width:'100%',padding:'13px',background:'linear-gradient(135deg,#1b4332,#40916c)',color:'white',fontFamily:'"Fredoka One",cursive',fontSize:'1.05em',letterSpacing:'2px',border:'none',borderRadius:'14px',cursor:'pointer',marginBottom:'10px',boxShadow:'0 4px 12px rgba(27,67,50,.25)'}}>
                            📋 Copy Code
                        </button>
                        <button onClick={() => setShowEggCodePopup(false)}
                            style={{width:'100%',padding:'11px',background:'rgba(27,67,50,.08)',color:'#2d6a4f',fontSize:'.95em',fontWeight:'800',border:'2px solid rgba(64,145,108,.3)',borderRadius:'14px',cursor:'pointer'}}>
                            ✕ Close
                        </button>
                    </div>
                </div>
            )}
