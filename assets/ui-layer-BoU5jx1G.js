var L=Object.defineProperty;var $=(g,t,e)=>t in g?L(g,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):g[t]=e;var o=(g,t,e)=>$(g,typeof t!="symbol"?t+"":t,e);import{s as c,v as T}from"./audio-engine-BeUWSC3H.js";import{H as p,S as F,g as P}from"./games-suite-D2GQfQAT.js";import{H as M,s as v,I as q,r as H}from"./graphics-engine-X3Ho6C59.js";const x=3e3;class N{constructor(t,e,i=document.body){o(this,"el");o(this,"engine");o(this,"callbacks");o(this,"currentModeId","MENU");o(this,"holdTimer",null);o(this,"holdStartTime",0);o(this,"isHoldingHome",!1);o(this,"hintTimeout",null);this.engine=t,this.callbacks=e,this.currentModeId=t.currentSceneId||"MENU",this.el=document.createElement("header"),this.el.className="hud-layer hud-menu-layer",i&&typeof i.appendChild=="function"&&i.appendChild(this.el),this.render()}updateMode(t){this.currentModeId=t;const e=t==="MENU";this.el.className=`hud-layer ${e?"hud-menu-layer":"hud-game-layer"}`,this.render()}render(){const t=this.currentModeId==="MENU",e=this.engine.storyViewMode,i=this.engine.selectedAvatar,n=M.find(r=>r.id===i),s=(n==null?void 0:n.emoji)||"🐷",a=this.engine.storage.isMuted(),l=this.engine.storage.isToddlerLockEnabled();this.el.innerHTML=`
      <div class="hud-top-bar">
        ${t?`
          <div class="hud-brand">
            <span class="hud-brand-sparkle">🌟</span>
            <span class="hud-brand-title">Adventures of Trishu</span>
          </div>
        `:`
          <div class="hud-home-wrapper">
            <button type="button" class="hud-btn-home" id="hud-btn-home" aria-label="Back to Menu">
              <span style="font-size: 1.2rem; line-height: 1;">🏠</span>
              <span>Home ${l?"🔒":""}</span>
              <div class="toddler-lock-progress" id="toddler-progress" style="display: none;">
                <div class="toddler-lock-progress-fill" id="toddler-progress-fill" style="width: 0%;"></div>
              </div>
            </button>
            <div class="toddler-lock-tooltip" id="toddler-hint" style="display: none;">
              Hold 3s to exit 🔒
            </div>
          </div>
        `}

        ${t?`
          <div class="hud-mode-toggle hud-mode-toggle-desktop" role="tablist" aria-label="Game Mode">
            <button type="button" role="tab" class="hud-mode-pill ${e==="journey"?"active":""}" id="tab-journey-dt">
              🗺️ Story Journey
            </button>
            <button type="button" role="tab" class="hud-mode-pill ${e==="grid"?"active":""}" id="tab-grid-dt">
              🎮 Free Play
            </button>
            <button type="button" role="tab" class="hud-mode-pill hud-mode-studio" id="tab-studio-dt" style="background: linear-gradient(135deg, #FFB300, #FF7043); color: #FFF; font-weight: bold;">
              🎨 Art Studio
            </button>
          </div>
        `:""}

        <div class="hud-controls-right">
          ${t?`
            <button type="button" aria-label="Install App" class="hud-btn-icon hud-btn-install" id="hud-btn-install">
              📲
            </button>
            <button type="button" aria-label="Open Adventure Passport" class="hud-btn-icon hud-btn-passport" id="hud-btn-passport">
              📖
            </button>
            <button type="button" aria-label="Select Avatar Hero" class="hud-btn-icon hud-btn-avatar" id="hud-btn-avatar">
              ${s}
            </button>
            <button type="button" aria-label="Open Settings" class="hud-btn-icon hud-btn-settings" id="hud-btn-settings">
              ⚙️
            </button>
            <button type="button" aria-label="Toggle Fullscreen" class="hud-btn-icon hud-btn-fs" id="hud-btn-fs">
              ⛶
            </button>
            <button type="button" aria-label="Toggle Audio" class="hud-btn-icon hud-btn-audio" id="hud-btn-audio">
              ${a?"🔇":"🔊"}
            </button>
          `:""}
        </div>
      </div>

      ${t?`
        <div class="hud-mode-row-mobile">
          <div class="hud-mode-toggle" role="tablist" aria-label="Game Mode">
            <button type="button" role="tab" class="hud-mode-pill ${e==="journey"?"active":""}" id="tab-journey-mb">
              🗺️ Story Journey
            </button>
            <button type="button" role="tab" class="hud-mode-pill ${e==="grid"?"active":""}" id="tab-grid-mb">
              🎮 Free Play
            </button>
            <button type="button" role="tab" class="hud-mode-pill hud-mode-studio" id="tab-studio-mb" style="background: linear-gradient(135deg, #FFB300, #FF7043); color: #FFF; font-weight: bold;">
              🎨 Art Studio
            </button>
          </div>
        </div>
      `:""}
    `,this.bindEvents(t,l)}bindEvents(t,e){if(!this.el||typeof this.el.querySelector!="function")return;if(t){const l=h=>{if(this.engine.storyViewMode===h)return;this.engine.setStoryViewMode(h);const m=this.engine.scenes.get("MENU");m&&(m.scrollY=0,m.scrollVy=0),c.playSFX("click"),p.tap(),this.render()},r=this.el.querySelector("#tab-journey-dt");r&&(r.onclick=()=>l("journey"));const d=this.el.querySelector("#tab-grid-dt");d&&(d.onclick=()=>l("grid"));const u=this.el.querySelector("#tab-journey-mb");u&&(u.onclick=()=>l("journey"));const y=this.el.querySelector("#tab-grid-mb");y&&(y.onclick=()=>l("grid"));const b=this.el.querySelector("#tab-studio-dt");b&&(b.onclick=()=>{c.playSFX("click"),p.tap(),this.engine.changeScene("STUDIO")});const k=this.el.querySelector("#tab-studio-mb");k&&(k.onclick=()=>{c.playSFX("click"),p.tap(),this.engine.changeScene("STUDIO")});const f=this.el.querySelector("#hud-btn-install");f&&(f.onclick=()=>this.callbacks.onOpenInstall());const S=this.el.querySelector("#hud-btn-passport");S&&(S.onclick=()=>this.callbacks.onOpenPassport())}else{const l=this.el.querySelector("#hud-btn-home");l&&(e?(l.onpointerdown=r=>this.handleHomePointerDown(r),l.onpointerup=r=>this.handleHomePointerUp(r),l.onpointercancel=r=>this.handleHomePointerCancel(r),l.onpointerleave=r=>this.handleHomePointerCancel(r)):l.onclick=r=>{r.stopPropagation(),this.callbacks.onGoHome()})}const i=this.el.querySelector("#hud-btn-avatar");i&&(i.onclick=()=>this.callbacks.onOpenAvatarSelect());const n=this.el.querySelector("#hud-btn-settings");n&&(n.onclick=()=>this.callbacks.onOpenSettings());const s=this.el.querySelector("#hud-btn-fs");s&&(s.onclick=()=>this.callbacks.onToggleFullscreen());const a=this.el.querySelector("#hud-btn-audio");a&&(a.onclick=()=>this.callbacks.onToggleMute())}clearHoldTimer(){this.holdTimer!==null&&(clearInterval(this.holdTimer),this.holdTimer=null),this.isHoldingHome=!1;const t=this.el.querySelector("#toddler-progress");t&&(t.style.display="none")}handleHomePointerDown(t){t.stopPropagation(),this.clearHoldTimer(),this.isHoldingHome=!0,this.holdStartTime=Date.now();const e=this.el.querySelector("#toddler-progress"),i=this.el.querySelector("#toddler-progress-fill");e&&(e.style.display="block"),this.holdTimer=window.setInterval(()=>{const n=Date.now()-this.holdStartTime,s=Math.min(1,n/x);i&&(i.style.width=`${Math.round(s*100)}%`),s>=1&&(this.clearHoldTimer(),c.playSFX("fanfare"),p.heavy(),this.callbacks.onGoHome())},30)}handleHomePointerUp(t){if(t.stopPropagation(),this.isHoldingHome){const e=Date.now()-this.holdStartTime;if(this.clearHoldTimer(),e<x){const i=this.el.querySelector("#toddler-hint");i&&(i.style.display="block",this.hintTimeout!==null&&clearTimeout(this.hintTimeout),this.hintTimeout=window.setTimeout(()=>{i&&(i.style.display="none")},2e3))}}}handleHomePointerCancel(t){t.stopPropagation(),this.clearHoldTimer()}destroy(){this.clearHoldTimer(),this.hintTimeout!==null&&clearTimeout(this.hintTimeout),this.el.parentNode&&this.el.parentNode.removeChild(this.el)}}class I{constructor(t=v){o(this,"el",null);o(this,"storage");o(this,"onCloseCallback");o(this,"isUnlocked",!1);o(this,"unlockHoldTimer",null);o(this,"unlockHoldStart",0);this.storage=t}open(t=document.body,e){if(this.el)return;this.onCloseCallback=e;const i=document.createElement("div");i.className="modal-backdrop",i.setAttribute("role","dialog"),i.setAttribute("aria-modal","true"),i.setAttribute("aria-label","Game Settings"),i.onclick=n=>{n.target===i&&this.close()},t.appendChild(i),this.el=i,this.renderContent()}renderContent(){if(!this.el)return;if(!this.isUnlocked){this.el.innerHTML=`
        <div class="modal-card settings-modal">
          <button type="button" class="modal-close-btn" id="modal-close-gate" aria-label="Close settings">✕</button>
          <h2 class="modal-title">🔒 Grown-Ups Only</h2>
          <p style="text-align: center; color: #546E7A; font-size: 1.05rem; margin: 16px 0; font-weight: 600;">
            Hold the button for 3 seconds to open settings:
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <button type="button" class="settings-reset-btn" id="btn-parental-unlock" style="background: linear-gradient(180deg, #FFB300 0%, #FB8C00 100%); border-color: #E65100; font-size: 1.15rem; padding: 14px 28px; width: 100%; max-width: 260px; position: relative; overflow: hidden;">
              Hold 3s to Unlock 🔓
              <div id="parental-progress" style="position: absolute; bottom: 0; left: 0; height: 5px; background: #FFFFFF; width: 0%; transition: width 0.05s linear;"></div>
            </button>
          </div>
        </div>
      `;const h=this.el.querySelector("#modal-close-gate");h&&(h.onclick=()=>this.close());const m=this.el.querySelector("#btn-parental-unlock");m&&(m.onpointerdown=()=>this.startUnlockHold(),m.onpointerup=()=>this.cancelUnlockHold(),m.onpointercancel=()=>this.cancelUnlockHold(),m.onpointerleave=()=>this.cancelUnlockHold());return}const t=this.storage.getBgmVolume(),e=this.storage.getSfxVolume(),i=this.storage.isHapticsEnabled(),n=this.storage.isToddlerLockEnabled(),s=T.isEnabled();this.el.innerHTML=`
      <div class="modal-card settings-modal">
        <button type="button" class="modal-close-btn" id="modal-close-settings" aria-label="Close settings">✕</button>
        <h2 class="modal-title">⚙️ Game Settings</h2>
        
        <div class="settings-group">
          <label class="settings-label" for="setting-bgm">
            <span>🎵 Music Volume</span>
            <span class="settings-val-badge" id="bgm-val-text">${Math.round(t*100)}%</span>
          </label>
          <input type="range" id="setting-bgm" class="volume-slider" min="0" max="1" step="0.05" value="${t}">
        </div>

        <div class="settings-group">
          <label class="settings-label" for="setting-sfx">
            <span>🔊 Sound Effects</span>
            <span class="settings-val-badge" id="sfx-val-text">${Math.round(e*100)}%</span>
          </label>
          <input type="range" id="setting-sfx" class="volume-slider" min="0" max="1" step="0.05" value="${e}">
        </div>

        <div class="settings-row settings-toggle-row">
          <span class="settings-toggle-label">🗣️ Spoken Voice Prompts</span>
          <button type="button" class="settings-toggle-btn ${s?"active":""}" id="toggle-voice">
            ${s?"ON ✅":"OFF ❌"}
          </button>
        </div>

        <div class="settings-row settings-toggle-row">
          <span class="settings-toggle-label">📳 Vibration / Haptics</span>
          <button type="button" class="settings-toggle-btn ${i?"active":""}" id="toggle-haptics">
            ${i?"ON ✅":"OFF ❌"}
          </button>
        </div>

        <div class="settings-row settings-toggle-row">
          <span class="settings-toggle-label">🔒 Toddler Lock (Hold Home 3s)</span>
          <button type="button" class="settings-toggle-btn ${n?"active":""}" id="toggle-toddler-lock">
            ${n?"ON ✅":"OFF ❌"}
          </button>
        </div>

        <div class="settings-danger-zone">
          <button type="button" class="settings-reset-btn" id="btn-reset-scores">
            🏆 Reset High Scores
          </button>
          <div class="settings-reset-feedback" id="reset-feedback" style="display: none;">
            Scores have been reset! ✨
          </div>
        </div>
      </div>
    `;const a=this.el.querySelector("#modal-close-settings");a&&(a.onclick=()=>this.close());const l=this.el.querySelector("#setting-bgm"),r=this.el.querySelector("#bgm-val-text");l&&(l.oninput=()=>{const h=parseFloat(l.value);r.textContent=`${Math.round(h*100)}%`,this.storage.setBgmVolume(h),c.setBgmVolume(h)});const d=this.el.querySelector("#setting-sfx"),u=this.el.querySelector("#sfx-val-text");d&&(d.oninput=()=>{const h=parseFloat(d.value);u.textContent=`${Math.round(h*100)}%`,this.storage.setSfxVolume(h),c.setSfxVolume(h)});const y=this.el.querySelector("#toggle-voice");y&&(y.onclick=()=>{const h=!T.isEnabled();T.setEnabled(h),y.className=`settings-toggle-btn ${h?"active":""}`,y.textContent=h?"ON ✅":"OFF ❌",c.playSFX("click"),h&&T.speak("Voice prompts on!")});const b=this.el.querySelector("#toggle-haptics");b&&(b.onclick=()=>{const h=!this.storage.isHapticsEnabled();this.storage.setHapticsEnabled(h),b.className=`settings-toggle-btn ${h?"active":""}`,b.textContent=h?"ON ✅":"OFF ❌",c.playSFX("click"),h&&p.tap()});const k=this.el.querySelector("#toggle-toddler-lock");k&&(k.onclick=()=>{const h=!this.storage.isToddlerLockEnabled();this.storage.setToddlerLockEnabled(h),k.className=`settings-toggle-btn ${h?"active":""}`,k.textContent=h?"ON ✅":"OFF ❌",c.playSFX("click"),p.tap()});const f=this.el.querySelector("#btn-reset-scores"),S=this.el.querySelector("#reset-feedback");f&&S&&(f.onclick=()=>{this.storage.resetHighScores(),c.playSFX("fanfare"),p.heavy(),S.style.display="block",setTimeout(()=>{S&&(S.style.display="none")},2500)})}startUnlockHold(){this.cancelUnlockHold(),this.unlockHoldStart=Date.now(),c.playSFX("click"),p.tap(),this.unlockHoldTimer=window.setInterval(()=>{var n;const t=Date.now()-this.unlockHoldStart,e=Math.min(100,t/3e3*100),i=(n=this.el)==null?void 0:n.querySelector("#parental-progress");i&&(i.style.width=`${e}%`),t>=3e3&&(this.cancelUnlockHold(),this.isUnlocked=!0,c.playSFX("fanfare"),p.success(),this.renderContent())},50)}cancelUnlockHold(){var e;this.unlockHoldTimer!==null&&(clearInterval(this.unlockHoldTimer),this.unlockHoldTimer=null);const t=(e=this.el)==null?void 0:e.querySelector("#parental-progress");t&&(t.style.width="0%")}close(){this.cancelUnlockHold(),this.isUnlocked=!1,this.el&&(c.playSFX("click"),p.tap(),this.el.parentNode&&this.el.parentNode.removeChild(this.el),this.el=null,this.onCloseCallback&&this.onCloseCallback())}isOpen(){return this.el!==null}}const O=[{id:"all",label:"All ✨"},{id:"head",label:"Hats 👒"},{id:"face",label:"Face 👓"},{id:"back",label:"Capes 🦸"},{id:"feet",label:"Boots 🥾"}];class B{constructor(t,e){o(this,"container");o(this,"activeFilter","all");o(this,"mannequinCanvas",null);o(this,"animFrameId",null);o(this,"pointerGaze",{x:0,y:0});o(this,"hopTimer",0);o(this,"hopVelocity",0);o(this,"hopY",0);o(this,"startTime",Date.now());o(this,"onEquipChange");this.container=t,this.onEquipChange=e}render(){this.container.innerHTML=`
      <div class="wardrobe-container">
        <!-- Live Interactive Mannequin Stage -->
        <div class="wardrobe-mannequin-stage">
          <div class="wardrobe-mannequin-bubble" id="mannequin-box" title="Tap me to hop and play!">
            <canvas id="wardrobe-mannequin-canvas" width="160" height="160" class="wardrobe-canvas"></canvas>
            <div class="wardrobe-mannequin-hint">👆 Tap me!</div>
          </div>
          <div class="wardrobe-mannequin-info">
            <div class="wardrobe-avatar-name" id="wardrobe-avatar-name"></div>
            <button type="button" class="wardrobe-clear-btn" id="wardrobe-clear-btn" title="Remove all accessories">
              🔄 Clear Outfit
            </button>
          </div>
        </div>

        <!-- Slot Filter Pills -->
        <div class="avatar-category-pills wardrobe-filter-pills" id="wardrobe-filter-pills"></div>

        <!-- Accessories Grid -->
        <div class="avatar-grid-scroll wardrobe-grid-scroll">
          <div class="wardrobe-grid" id="wardrobe-grid"></div>
        </div>
      </div>
    `,this.mannequinCanvas=this.container.querySelector("#wardrobe-mannequin-canvas"),this.setupMannequinInteractions(),this.renderFilterPills(),this.renderAccessoryGrid(),this.updateAvatarLabel();const t=this.container.querySelector("#wardrobe-clear-btn");t&&(t.onclick=()=>this.handleClearOutfit()),this.startMannequinLoop()}updateAvatarLabel(){const t=this.container.querySelector("#wardrobe-avatar-name");if(!t)return;const e=v.getSelectedAvatar(),i=M.find(n=>n.id===e);t.textContent=i?`${i.emoji} Dressing up ${i.name}`:"Dressing up hero"}renderFilterPills(){const t=this.container.querySelector("#wardrobe-filter-pills");t&&(t.innerHTML="",O.forEach(e=>{const i=document.createElement("button");i.type="button",i.className=`avatar-pill-btn ${this.activeFilter===e.id?"active":""}`,i.textContent=e.label,i.onclick=()=>{c.playSFX("click"),p.tap(),this.activeFilter=e.id,this.renderFilterPills(),this.renderAccessoryGrid()},t.appendChild(i)}))}renderAccessoryGrid(){const t=this.container.querySelector("#wardrobe-grid");if(!t)return;t.innerHTML="";const e=v.getEquippedAccessories();(this.activeFilter==="all"?q:q.filter(n=>n.slot===this.activeFilter)).forEach(n=>{const s=v.isAccessoryUnlocked(n.id),a=e[n.slot]===n.id,l=document.createElement("button");l.type="button",l.className=`wardrobe-card ${a?"equipped":""} ${s?"":"locked"}`,l.setAttribute("aria-label",`${n.name} ${a?"(Equipped)":""}`),s?(l.innerHTML=`
          <div class="wardrobe-card-emoji">${n.emoji}</div>
          <div class="wardrobe-card-title">${n.name}</div>
          <div class="wardrobe-card-slot">${n.slot.toUpperCase()}</div>
          ${a?'<span class="wardrobe-equipped-badge">✓ Worn</span>':""}
        `,l.onclick=()=>this.handleToggleAccessory(n,a)):(l.innerHTML=`
          <div class="wardrobe-card-emoji">🔒</div>
          <div class="wardrobe-card-title">${n.name}</div>
          <div class="wardrobe-lock-hint">${n.unlockHint||"Unlock in Story Mode!"}</div>
        `,l.onclick=()=>this.handleLockedClick(n)),t.appendChild(l)})}handleToggleAccessory(t,e){e?(v.unequipAccessory(t.slot),c.playSFX("whoosh")):(v.equipAccessory(t.id,t.slot),c.playSFX("eggPop")),p.medium(),this.triggerHop(),this.onEquipChange&&this.onEquipChange(),this.renderAccessoryGrid()}handleLockedClick(t){c.playSFX("crash"),p.tap();const e=t.unlockHint||"Complete Story Mode levels to unlock this outfit!";alert(`🔒 ${t.name} is locked!

${e}`)}handleClearOutfit(){v.unequipAccessory("head"),v.unequipAccessory("face"),v.unequipAccessory("back"),v.unequipAccessory("feet"),c.playSFX("whoosh"),p.tap(),this.triggerHop(),this.onEquipChange&&this.onEquipChange(),this.renderAccessoryGrid()}setupMannequinInteractions(){const t=this.container.querySelector("#mannequin-box");t&&(t.onpointermove=e=>{const i=t.getBoundingClientRect(),n=i.left+i.width/2,s=i.top+i.height/2;this.pointerGaze.x=Math.max(-1,Math.min(1,(e.clientX-n)/(i.width*.4))),this.pointerGaze.y=Math.max(-1,Math.min(1,(e.clientY-s)/(i.height*.4)))},t.onpointerleave=()=>{this.pointerGaze.x=0,this.pointerGaze.y=0},t.onclick=()=>{this.triggerHop();const e=v.getSelectedAvatar(),i=M.find(n=>n.id===e);i&&i.sound?c.playSFX(i.sound):c.playSFX("toddlerGiggle"),p.success()})}triggerHop(){this.hopVelocity=-8}startMannequinLoop(){this.stopMannequinLoop();const t=()=>{this.updateMannequinPhysics(),this.drawMannequin(),this.animFrameId=requestAnimationFrame(t)};this.animFrameId=requestAnimationFrame(t)}updateMannequinPhysics(){(this.hopVelocity!==0||this.hopY<0)&&(this.hopY+=this.hopVelocity,this.hopVelocity+=.6,this.hopY>=0&&(this.hopY=0,this.hopVelocity=0))}drawMannequin(){if(!this.mannequinCanvas)return;const t=this.mannequinCanvas.getContext("2d");if(!t)return;const e=this.mannequinCanvas.width,i=this.mannequinCanvas.height;t.clearRect(0,0,e,i);const s=(Date.now()-this.startTime)/1e3,a=v.getSelectedAvatar(),l=a==="chicken"||a==="duck"?.8:a==="chick"?1:.68,r=e/2,d=i/2+10+this.hopY,u=this.hopY<-1?1.08:1+Math.sin(s*3.5)*.03;H(a,t,r,d,l,{squash:u,jumpY:0,time:s,pointerGaze:this.pointerGaze,expression:this.hopY<-2?"excited":"happy",aura:"sparkle",showAccessories:!0})}stopMannequinLoop(){this.animFrameId!==null&&(cancelAnimationFrame(this.animFrameId),this.animFrameId=null)}destroy(){this.stopMannequinLoop()}}const U=[{id:"all",label:"All 🌟"},{id:"peppa",label:"Peppa Pig 🐷"},{id:"trishu",label:"Trishu Family 👧"},{id:"farm",label:"Farmyard 🐔"}];class V{constructor(t=null){o(this,"el",null);o(this,"engine");o(this,"activeTab","heroes");o(this,"activeCategory","all");o(this,"wardrobeView",null);o(this,"onCloseCallback");o(this,"onAvatarChangeCallback");this.engine=t}open(t=document.body,e,i,n="heroes"){if(this.el)return;this.onAvatarChangeCallback=e,this.onCloseCallback=i,this.activeTab=n;const s=document.createElement("div");s.className="modal-backdrop",s.setAttribute("role","dialog"),s.setAttribute("aria-modal","true"),s.setAttribute("aria-label","Choose Your Hero & Wardrobe"),s.innerHTML=`
      <div class="modal-card avatar-modal-card">
        <div class="avatar-modal-header">
          <div>
            <h2 class="avatar-modal-title">Choose Your Hero! 🌟</h2>
            <p class="avatar-modal-subtitle">Pick who plays and dress them up!</p>
          </div>
          <button type="button" class="avatar-close-btn modal-close-btn" aria-label="Close Avatar Selection">✕</button>
        </div>

        <div class="avatar-main-tabs">
          <button type="button" class="avatar-main-tab ${this.activeTab==="heroes"?"active":""}" id="tab-heroes">
            🎭 Heroes
          </button>
          <button type="button" class="avatar-main-tab ${this.activeTab==="wardrobe"?"active":""}" id="tab-wardrobe">
            👒 Wardrobe
          </button>
        </div>

        <div id="heroes-panel" style="${this.activeTab==="heroes"?"":"display: none;"}">
          <div class="avatar-category-pills" id="avatar-category-pills"></div>
          <div class="avatar-grid-scroll">
            <div class="avatar-grid" id="avatar-grid"></div>
          </div>
        </div>

        <div id="wardrobe-panel" style="${this.activeTab==="wardrobe"?"":"display: none;"}"></div>

        <div class="avatar-modal-footer">
          <button type="button" class="avatar-confirm-btn" id="avatar-confirm-btn">
            Let's Play! 🌟
          </button>
        </div>
      </div>
    `,s.onclick=u=>{u.target===s&&this.close()};const a=s.querySelector(".avatar-close-btn");a.onclick=()=>this.close();const l=s.querySelector("#avatar-confirm-btn");l.onclick=()=>this.close();const r=s.querySelector("#tab-heroes");r.onclick=()=>this.switchTab("heroes");const d=s.querySelector("#tab-wardrobe");d.onclick=()=>this.switchTab("wardrobe"),t.appendChild(s),this.el=s,this.renderCategoryPills(),this.renderGrid(),this.activeTab==="wardrobe"&&this.initWardrobeView()}switchTab(t){var a;if(this.activeTab===t||!this.el)return;this.activeTab=t,c.playSFX("click"),p.tap();const e=this.el.querySelector("#tab-heroes"),i=this.el.querySelector("#tab-wardrobe"),n=this.el.querySelector("#heroes-panel"),s=this.el.querySelector("#wardrobe-panel");t==="heroes"?(e==null||e.classList.add("active"),i==null||i.classList.remove("active"),n&&(n.style.display=""),s&&(s.style.display="none"),(a=this.wardrobeView)==null||a.stopMannequinLoop(),this.renderGrid()):(e==null||e.classList.remove("active"),i==null||i.classList.add("active"),n&&(n.style.display="none"),s&&(s.style.display=""),this.initWardrobeView())}initWardrobeView(){if(!this.el)return;const t=this.el.querySelector("#wardrobe-panel");t&&(this.wardrobeView||(this.wardrobeView=new B(t,()=>{this.renderGrid()})),this.wardrobeView.render())}renderCategoryPills(){if(!this.el)return;const t=this.el.querySelector("#avatar-category-pills");t&&(t.innerHTML="",U.forEach(e=>{const i=document.createElement("button");i.type="button",i.className=`avatar-pill-btn ${this.activeCategory===e.id?"active":""}`,i.textContent=e.label,i.onclick=()=>{c.playSFX("click"),p.tap(),this.activeCategory=e.id,this.renderCategoryPills(),this.renderGrid()},t.appendChild(i)}))}renderGrid(){var n;if(!this.el)return;const t=this.el.querySelector("#avatar-grid");if(!t)return;t.innerHTML="";const e=((n=this.engine)==null?void 0:n.selectedAvatar)||v.getSelectedAvatar();(this.activeCategory==="all"?M:M.filter(s=>s.category===this.activeCategory)).forEach(s=>{const a=e===s.id,l=document.createElement("button");l.type="button",l.className=`avatar-card ${a?"selected":""}`,l.style.backgroundColor=a?"#FFFFFF":"#FAFAFA",l.style.borderColor=a?"#4CAF50":s.borderColor,l.setAttribute("aria-pressed",a?"true":"false"),l.setAttribute("aria-label",`Select ${s.name}`);const r=document.createElement("div");r.className="avatar-card-preview-wrapper",r.style.backgroundColor=s.bgColor;const d=document.createElement("canvas");if(d.width=76,d.height=76,d.className="avatar-canvas-preview",this.drawAvatarPreview(d,s.id,a),r.appendChild(d),a){const y=document.createElement("span");y.className="avatar-card-selected-badge",y.textContent="⭐",r.appendChild(y)}const u=document.createElement("div");u.className="avatar-card-details",u.innerHTML=`
        <span class="avatar-card-name">${s.emoji} ${s.name}</span>
        <span class="avatar-card-subtitle">${s.subtitle}</span>
      `,l.appendChild(r),l.appendChild(u),l.onclick=()=>this.handleSelectAvatar(s),t.appendChild(l)})}drawAvatarPreview(t,e,i){const n=t.getContext("2d");if(!n)return;n.clearRect(0,0,t.width,t.height);let s=.42,a=50,l=38;e==="peppa"||e==="george"?(s=.38,a=52):e==="daddyPig"||e==="mummyPig"||e==="grandpaPig"?(s=.28,a=55):e==="suzySheep"?(s=.34,a=52):e==="trishu"||e==="leo"?(s=.38,a=52):e==="dad"||e==="mom"||e==="grandpa"?(s=.28,a=54):e==="mimi"?(s=.34,a=52):e==="chicken"||e==="duck"?(s=.45,a=48):e==="chick"&&(s=.65,a=46);try{H(e,n,l,a,s,{expression:i?"excited":"happy",muddyBoots:!0,holdingDino:e==="george"||e==="leo",showAccessories:!0})}catch{}}handleSelectAvatar(t){this.engine?this.engine.setSelectedAvatar(t.id):v.setSelectedAvatar(t.id),t.sound&&c.playSFX(t.sound),p.medium(),this.onAvatarChangeCallback&&this.onAvatarChangeCallback(t.id),this.renderGrid()}close(){this.el&&(c.playSFX("click"),p.tap(),this.wardrobeView&&(this.wardrobeView.destroy(),this.wardrobeView=null),this.el.parentNode&&this.el.parentNode.removeChild(this.el),this.el=null,this.onCloseCallback&&this.onCloseCallback())}isOpen(){return this.el!==null}}class X{constructor(t=v){o(this,"el",null);o(this,"storage");o(this,"onCloseCallback");o(this,"onSelectStopCallback");this.storage=t}open(t=document.body,e,i){if(this.el)return;this.onSelectStopCallback=e,this.onCloseCallback=i;const n=this.storage.getStoryProgress(),s=n.passportStamps,a=s.length,l=a>=F.length;let r=0;for(const b of Object.values(n.completedStops))r+=b.stars||0;const d=document.createElement("div");d.className="modal-backdrop",d.setAttribute("role","dialog"),d.setAttribute("aria-modal","true"),d.setAttribute("aria-label","Adventure Passport"),d.innerHTML=`
      <div class="modal-card passport-modal-card">
        <button type="button" class="modal-close-btn passport-close-btn" aria-label="Close Passport">✕</button>
        <h2 style="font-size: 1.5rem; font-weight: 900; color: #E65100; margin: 4px 0 6px;">
          Adventure Passport 📖
        </h2>
        <div style="font-size: 0.95rem; font-weight: 800; color: #5D4037; margin-bottom: 12px;">
          Stamps: ${a} / ${F.length} • Stars: ⭐ ${r}
        </div>

        ${l?`
          <div style="background: linear-gradient(90deg, #FFD54F 0%, #FFB300 100%); border: 2.5px solid #FF8F00; border-radius: 16px; padding: 8px 12px; color: #3E2723; font-weight: 900; font-size: 0.9rem; margin-bottom: 10px;">
            🏆 Grand Master Explorer Trophy Unlocked! 🏆
          </div>
        `:""}

        <div class="passport-grid" id="passport-grid"></div>
      </div>
    `,d.onclick=b=>{b.target===d&&this.close()};const u=d.querySelector(".passport-close-btn");u.onclick=()=>this.close();const y=d.querySelector("#passport-grid");F.forEach((b,k)=>{const f=s.includes(b.stampId),S=n.completedStops[b.id],h=(S==null?void 0:S.stars)||(f?3:0),m=document.createElement("button");m.type="button",m.className=`passport-slot ${f?"unlocked":"locked"}`,m.setAttribute("aria-label",`Stop ${k+1}: ${b.title}. ${f?"Unlocked":"Locked"}`),m.innerHTML=`
        <div class="passport-slot-emoji">${f?b.stampEmoji:"🔒"}</div>
        <div class="passport-slot-name">${f?b.stampName:`Stop ${k+1}`}</div>
        <div class="passport-slot-stars">${f?"⭐".repeat(h):"• • •"}</div>
      `,m.onclick=()=>{c.playSFX("click"),p.tap(),this.close(),this.onSelectStopCallback&&this.onSelectStopCallback(k)},y.appendChild(m)}),t.appendChild(d),this.el=d}close(){this.el&&(c.playSFX("click"),p.tap(),this.el.parentNode&&this.el.parentNode.removeChild(this.el),this.el=null,this.onCloseCallback&&this.onCloseCallback())}isOpen(){return this.el!==null}}class G{constructor(){o(this,"el",null);o(this,"onStartCallback");o(this,"onCloseCallback")}open(t,e=document.body,i,n){if(this.el)return;this.onStartCallback=i,this.onCloseCallback=n;const s=P(t.index),a=document.createElement("div");a.className="modal-backdrop",a.setAttribute("role","dialog"),a.setAttribute("aria-modal","true"),a.setAttribute("aria-label","Story Intro"),a.innerHTML=`
      <div class="modal-card story-intro-card">
        <button type="button" class="modal-close-btn story-intro-close-btn" aria-label="Close Story Intro">✕</button>
        ${s?`
          <div class="story-intro-chapter-pill">
            ${s.emoji} Chapter ${s.id}: ${s.title}
          </div>
        `:""}

        <div class="story-intro-emoji-banner" aria-hidden="true">
          ${t.stampEmoji}
        </div>

        <h2 class="story-intro-title">
          Stop ${t.index+1}: ${t.title}
        </h2>

        <p class="story-intro-blurb">
          ${t.storyBlurb}
        </p>

        <div class="story-intro-goal-box">
          <span>🎯</span>
          <span>Goal: <strong>${t.goalDescription}</strong></span>
        </div>

        <button type="button" class="story-intro-start-btn" id="story-intro-start">
          Let's Play! 🚀
        </button>
      </div>
    `,a.onclick=d=>{d.target===a&&this.close()};const l=a.querySelector(".story-intro-close-btn");l.onclick=()=>this.close();const r=a.querySelector("#story-intro-start");r.onclick=()=>{c.playSFX("fanfare"),p.medium(),this.close(),this.onStartCallback&&this.onStartCallback()},e.appendChild(a),this.el=a}close(){this.el&&(c.playSFX("click"),p.tap(),this.el.parentNode&&this.el.parentNode.removeChild(this.el),this.el=null,this.onCloseCallback&&this.onCloseCallback())}isOpen(){return this.el!==null}}class j{constructor(){o(this,"el",null);o(this,"onNextCallback");o(this,"onReplayCallback");o(this,"onBackToMapCallback")}open(t,e,i,n,s,a=document.body,l,r){if(this.el)return;this.onNextCallback=l==null?void 0:l.onNext,this.onReplayCallback=l==null?void 0:l.onReplay,this.onBackToMapCallback=l==null?void 0:l.onBackToMap,c.playVictoryFanfare(),p.fanfare();const d="⭐".repeat(Math.max(1,Math.min(3,i))),u=document.createElement("div");u.className="modal-backdrop",u.setAttribute("role","dialog"),u.setAttribute("aria-modal","true"),u.setAttribute("aria-label","Story Victory Dialog"),u.innerHTML=`
      <div class="modal-card story-victory-card">
        <h2 style="font-size: 1.5rem; font-weight: 900; color: #E65100; margin: 4px 0;">
          Stop Complete! 🎉
        </h2>

        <div class="story-victory-stamp-box" aria-hidden="true">
          ${t.stampEmoji}
        </div>

        <div class="story-victory-stamp-name">
          ${n?"🌟 New Passport Stamp! 🌟":"Stamp Collected!"}
        </div>
        <div style="font-size: 1rem; font-weight: 800; color: #37474F; margin-bottom: 8px;">
          ${t.stampName}
        </div>
        ${r?`
          <div style="margin: 6px auto; padding: 6px 14px; background: #FFF3E0; border: 2px dashed #FF9800; border-radius: 12px; font-size: 0.95rem; font-weight: 800; color: #E65100; display: inline-block;">
            👒 Wardrobe Unlock: ${r}!
          </div>
        `:""}

        <div class="story-victory-stars" aria-label="${i} stars">
          ${d}
        </div>

        <p class="story-victory-blurb">
          ${t.victoryBlurb}
        </p>

        <div class="story-victory-actions">
          ${s?`
            <button type="button" class="story-victory-next-btn" id="victory-next-btn">
              Next Adventure! ➡️
            </button>
          `:`
            <button type="button" class="story-victory-next-btn" id="victory-next-btn" style="background: linear-gradient(180deg, #FFB300 0%, #F57F17 100%); border-color: #E65100;">
              🏆 Complete Grand Journey! 🏆
            </button>
          `}

          <div class="story-victory-sub-btns">
            <button type="button" class="story-victory-sub-btn" id="victory-replay-btn">
              🔄 Play Again
            </button>
            <button type="button" class="story-victory-sub-btn" id="victory-map-btn">
              🗺️ Story Map
            </button>
          </div>
        </div>
      </div>
    `,u.onclick=f=>{f.target===u&&this.close(this.onBackToMapCallback)};const y=u.querySelector("#victory-next-btn");y.onclick=()=>{c.playSFX("fanfare"),p.medium(),this.close(s?this.onNextCallback:this.onBackToMapCallback)};const b=u.querySelector("#victory-replay-btn");b.onclick=()=>{c.playSFX("click"),p.tap(),this.close(this.onReplayCallback)};const k=u.querySelector("#victory-map-btn");k.onclick=()=>{c.playSFX("click"),p.tap(),this.close(this.onBackToMapCallback)},a.appendChild(u),this.el=u}close(t){this.el&&(this.el.parentNode&&this.el.parentNode.removeChild(this.el),this.el=null,t&&t())}isOpen(){return this.el!==null}}const C=class C{constructor(){o(this,"deferredPrompt",null);o(this,"wakeLockSentinel",null);o(this,"shouldKeepWakeLock",!1);o(this,"waitingServiceWorker",null);o(this,"updatePending",!1);o(this,"listeners",new Map);this.initListeners()}static getInstance(){return C.instance||(C.instance=new C),C.instance}initListeners(){typeof window>"u"||(window.addEventListener("beforeinstallprompt",t=>{this.handleBeforeInstallPrompt(t)}),window.addEventListener("appinstalled",()=>{this.deferredPrompt=null,this.emit("installed"),this.emit("installableChange",!1)}),window.addEventListener("online",()=>{this.emit("connectionChange",!0)}),window.addEventListener("offline",()=>{this.emit("connectionChange",!1)}),typeof document<"u"&&document.addEventListener("visibilitychange",async()=>{document.visibilityState==="visible"&&this.shouldKeepWakeLock&&await this.acquireWakeLock()}))}isOnline(){return typeof navigator>"u"?!0:typeof navigator.onLine=="boolean"?navigator.onLine:!0}isStandalone(){var i,n;if(typeof window>"u")return!1;const t=(i=window.matchMedia)==null?void 0:i.call(window,"(display-mode: standalone)").matches,e=((n=window.navigator)==null?void 0:n.standalone)===!0;return!!(t||e)}isIOS(){if(typeof navigator>"u")return!1;const t=navigator.userAgent||"",e=/iPad|iPhone|iPod/.test(t)&&!(window!=null&&window.MSStream),i=(navigator.platform==="MacIntel"||t.includes("Macintosh"))&&(navigator.maxTouchPoints||0)>1;return!!(e||i)}isInstallable(){return!this.isStandalone()&&this.deferredPrompt!==null}canShowInstallUI(){return this.isStandalone()?!1:this.isInstallable()||this.isIOS()}handleBeforeInstallPrompt(t){typeof(t==null?void 0:t.preventDefault)=="function"&&t.preventDefault(),this.deferredPrompt=t,this.emit("installableChange",!0)}async promptInstall(){if(!this.deferredPrompt)return"unsupported";try{await this.deferredPrompt.prompt();const t=await this.deferredPrompt.userChoice;return t.outcome==="accepted"&&(this.deferredPrompt=null,this.emit("installableChange",!1),this.emit("installed")),t.outcome}catch(t){return console.warn("[PWA] promptInstall failed:",t),"unsupported"}}async requestWakeLock(){return this.shouldKeepWakeLock=!0,this.acquireWakeLock()}async acquireWakeLock(){var t,e;if(typeof navigator>"u"||!("wakeLock"in navigator))return!1;try{return this.wakeLockSentinel&&!this.wakeLockSentinel.released||(this.wakeLockSentinel=await navigator.wakeLock.request("screen"),(e=(t=this.wakeLockSentinel).addEventListener)==null||e.call(t,"release",()=>{this.emit("wakeLockChange",!1)}),this.emit("wakeLockChange",!0)),!0}catch{return!1}}async releaseWakeLock(){if(this.shouldKeepWakeLock=!1,this.wakeLockSentinel&&!this.wakeLockSentinel.released){try{await this.wakeLockSentinel.release()}catch{}this.wakeLockSentinel=null,this.emit("wakeLockChange",!1)}}hasWakeLock(){return!!(this.wakeLockSentinel&&!this.wakeLockSentinel.released)}notifyUpdateAvailable(t){t.waiting&&(this.waitingServiceWorker=t.waiting),this.updatePending=!0,this.emit("updateAvailable")}hasUpdate(){return this.updatePending}skipWaitingAndReload(){this.waitingServiceWorker&&this.waitingServiceWorker.postMessage({type:"SKIP_WAITING"}),typeof navigator<"u"&&"serviceWorker"in navigator?navigator.serviceWorker.addEventListener("controllerchange",()=>{typeof window<"u"&&window.location.reload()}):typeof window<"u"&&window.location.reload()}on(t,e){return this.listeners.has(t)||this.listeners.set(t,new Set),this.listeners.get(t).add(e),()=>this.off(t,e)}off(t,e){const i=this.listeners.get(t);i&&i.delete(e)}emit(t,e){const i=this.listeners.get(t);if(i)for(const n of i)try{n(e)}catch(s){console.error(`[PWA] Error in event listener for ${t}:`,s)}}};o(C,"instance",null);let A=C;const w=A.getInstance();class W{constructor(t=document.body){o(this,"modalEl",null);o(this,"offlinePillEl",null);o(this,"updateToastEl",null);this.setupOfflinePill(t),this.setupUpdateToast(t)}setupOfflinePill(t){const e=document.createElement("div");e.className="offline-pill",e.setAttribute("role","status"),e.setAttribute("aria-live","polite"),e.innerHTML=`
      <span class="offline-pill-dot"></span>
      <span>Offline Mode — All 16 Games Ready!</span>
    `,e.style.display=w.isOnline()?"none":"flex",t.appendChild(e),this.offlinePillEl=e,w.on("connectionChange",i=>{this.offlinePillEl&&(this.offlinePillEl.style.display=i?"none":"flex")})}setupUpdateToast(t){const e=document.createElement("div");e.className="update-toast",e.setAttribute("role","alert"),e.setAttribute("aria-live","assertive"),e.style.display="none",e.innerHTML=`
      <div class="update-toast-content">
        <span class="update-toast-emoji">✨</span>
        <div class="update-toast-text">
          <div class="update-toast-title">Update Ready!</div>
          <div class="update-toast-subtitle">New adventures are available</div>
        </div>
        <button type="button" class="update-toast-btn" id="pwa-update-btn">
          Refresh
        </button>
      </div>
    `;const i=e.querySelector("#pwa-update-btn");i.onclick=()=>{c.playSFX("click"),w.skipWaitingAndReload()},t.appendChild(e),this.updateToastEl=e,w.on("updateAvailable",()=>{this.updateToastEl&&(this.updateToastEl.style.display="block",c.playSFX("fanfare"))})}openInstallModal(t=document.body,e){if(this.modalEl)return;const i=w.isInstallable(),n=w.isIOS(),s=document.createElement("div");s.className="modal-backdrop",s.setAttribute("role","dialog"),s.setAttribute("aria-modal","true"),s.setAttribute("aria-label","Install Trishu App"),s.innerHTML=`
      <div class="modal-card">
        <button type="button" class="modal-close-btn" aria-label="Close dialog">✕</button>
        <div class="modal-hero-badge">
          <img src="./icons/icon-192.png" alt="Trishu App Icon" class="modal-hero-img" />
        </div>
        <h2 id="install-modal-title" class="modal-title">
          Install Trishu App!
        </h2>
        <p class="modal-subtitle">
          Play fullscreen with instant launching and 100% offline play anytime!
        </p>

        ${i?`
          <div>
            <button type="button" class="modal-primary-btn" id="btn-pwa-install">
              <span style="font-size: 1.25rem;">⬇️</span>
              <span>Install to Home Screen</span>
            </button>
          </div>
        `:n?`
          <div class="ios-instructions-box">
            <div style="font-weight: 900; font-size: 0.85rem; margin-bottom: 2px;">
              🍎 Safari iOS Quick Install:
            </div>
            <div class="ios-step-row">
              <span class="ios-step-badge">1</span>
              <span>Tap the <strong>Share button</strong> (⎋ with arrow) in Safari.</span>
            </div>
            <div class="ios-step-row">
              <span class="ios-step-badge">2</span>
              <span>Scroll down and select <strong>"Add to Home Screen"</strong> (➕).</span>
            </div>
            <div class="ios-step-row">
              <span class="ios-step-badge">3</span>
              <span>Tap <strong>"Add"</strong> in top right to start playing!</span>
            </div>
          </div>
        `:`
          <div class="ios-instructions-box" style="text-align: center;">
            To install, open your browser menu (⋮) and choose "Install App" or "Add to Home screen".
          </div>
        `}

        <button type="button" class="modal-link-btn" id="btn-pwa-later">
          Maybe Later
        </button>
      </div>
    `;const a=()=>{c.playSFX("click"),p.tap(),s.parentNode&&s.parentNode.removeChild(s),this.modalEl=null,e&&e()};s.onclick=r=>{r.target===s&&a()},s.querySelector(".modal-close-btn").onclick=a,s.querySelector("#btn-pwa-later").onclick=a;const l=s.querySelector("#btn-pwa-install");l&&(l.onclick=async()=>{c.playSFX("click"),p.tap(),await w.promptInstall()==="accepted"&&(c.playSFX("fanfare"),a())}),t.appendChild(s),this.modalEl=s}}const E=["✨","🐣","⭐","🎈","💖","🥚","🌸","🦖","🐷"];class D{constructor(t=document.body){o(this,"container");o(this,"pointerHandler");this.container=document.createElement("div"),this.container.className="tap-feedback-overlay",t.appendChild(this.container),this.pointerHandler=e=>this.handlePointerDown(e),window.addEventListener("pointerdown",this.pointerHandler,{passive:!0})}handlePointerDown(t){const e=E[Math.floor(Math.random()*E.length)],i=document.createElement("div");i.className="tap-feedback-emoji",i.style.left=`${t.clientX}px`,i.style.top=`${t.clientY}px`,i.textContent=e,this.container.appendChild(i),setTimeout(()=>{i.parentNode===this.container&&this.container.removeChild(i)},700)}destroy(){window.removeEventListener("pointerdown",this.pointerHandler),this.container.parentNode&&this.container.parentNode.removeChild(this.container)}}class K{constructor(t,e=document.body){o(this,"hud");o(this,"settingsModal");o(this,"avatarModal");o(this,"passportModal");o(this,"storyIntroModal");o(this,"storyVictoryModal");o(this,"pwaUI");o(this,"tapFeedback");o(this,"engine");o(this,"container");this.engine=t,this.container=e,this.settingsModal=new I(this.engine.storage),this.avatarModal=new V(this.engine),this.passportModal=new X(this.engine.storage),this.storyIntroModal=new G,this.storyVictoryModal=new j,this.pwaUI=new W(this.container),this.tapFeedback=new D(this.container),this.hud=new N(this.engine,{onGoHome:()=>this.engine.changeScene("MENU"),onToggleMute:()=>{const i=!this.engine.storage.isMuted();this.engine.storage.setMuted(i),c.setMuted(i),this.hud.render()},onToggleFullscreen:()=>this.engine.toggleFullscreen(),onOpenSettings:()=>this.settingsModal.open(this.container,()=>this.hud.render()),onOpenAvatarSelect:()=>this.avatarModal.open(this.container,()=>this.hud.render(),()=>this.hud.render()),onOpenPassport:()=>this.passportModal.open(this.container,i=>this.engine.launchStoryStop(i)),onOpenInstall:()=>this.pwaUI.openInstallModal(this.container)},this.container),this.engine.onStoryIntroCallback=i=>{const n=F[i];n&&this.storyIntroModal.open(n,this.container)},this.engine.onStoryVictoryCallback=(i,n,s,a,l)=>{const r=F[i];if(!r)return;const d=i<F.length-1;this.storyVictoryModal.open(r,n,s,a,d,this.container,{onNext:()=>this.engine.launchStoryStop(i+1),onReplay:()=>this.engine.launchStoryStop(i,!1),onBackToMap:()=>this.engine.changeScene("MENU")},l)},this.engine.onSceneChangeCallback=i=>{this.hud.updateMode(i)}}destroy(){this.hud.destroy(),this.tapFeedback.destroy()}}export{K as U,w as p};
