(function(){
  // Popup UI module for uBoxLite
  // Provides runtime controls: block count, toggle, add/reset filters

  var popup, blockedCountEl, toggleBtn, addInput, addBtn, resetBtn;

  function createPopup() {
    popup = document.createElement('div');
    popup.id = 'uBoxLite-popup';
    Object.assign(popup.style, {
      position: 'fixed', top: '1em', right: '1em', background: '#222', color: '#fff',
      padding: '1em', borderRadius: '8px', fontFamily: 'sans-serif', fontSize: '13px',
      zIndex: 1000000, boxShadow: '0 2px 10px rgba(0,0,0,0.6)', width: '240px'
    });

    popup.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5em">
        <strong>uBox‑Lite</strong>
        <span id="uBoxLite-close" style="cursor:pointer">✖</span>
      </div>
      <div style="margin-bottom:0.5em">
        <div><strong>Blocked:</strong> <span id="uBoxLite-count">0</span></div>
        <div><strong>Domain:</strong> ${location.hostname}</div>
      </div>
      <button id="uBoxLite-toggle" style="width:100%;margin-bottom:0.5em;">Toggle Blocking</button>
      <div style="display:flex;margin-bottom:0.5em;">
        <input id="uBoxLite-newsel" placeholder="Add selector" style="flex:1;padding:4px;" />
        <button id="uBoxLite-add" style="margin-left:4px;">➕</button>
      </div>
      <button id="uBoxLite-reset" style="width:100%;font-size:11px;">Reset Filters</button>
    `;
    document.body.appendChild(popup);

    blockedCountEl = popup.querySelector('#uBoxLite-count');
    toggleBtn = popup.querySelector('#uBoxLite-toggle');
    addInput = popup.querySelector('#uBoxLite-newsel');
    addBtn = popup.querySelector('#uBoxLite-add');
    resetBtn = popup.querySelector('#uBoxLite-reset');

    popup.querySelector('#uBoxLite-close').onclick = () => popup.remove();
    toggleBtn.onclick = onToggle;
    addBtn.onclick = onAdd;
    resetBtn.onclick = onReset;

    updateToggleLabel();
  }

  function onToggle() {
    var key = 'uBoxLiteEnabled://' + location.hostname;
    var enabled = localStorage.getItem(key) !== 'false';
    localStorage.setItem(key, !enabled);
    updateToggleLabel();
    location.reload();
  }

  function updateToggleLabel() {
    var key = 'uBoxLiteEnabled://' + location.hostname;
    var enabled = localStorage.getItem(key) !== 'false';
    toggleBtn.textContent = enabled ? 'Disable Blocking' : 'Enable Blocking';
  }

  function onAdd() {
    var sel = addInput.value.trim();
    if (!sel) return;
    var customKey = 'uBoxLiteCustom://' + location.hostname;
    var custom = JSON.parse(localStorage.getItem(customKey) || '[]');
    if (custom.indexOf(sel) === -1) {
      custom.push(sel);
      localStorage.setItem(customKey, JSON.stringify(custom));
      alert('Added selector: ' + sel);
      location.reload();
    }
  }

  function onReset() {
    var customKey = 'uBoxLiteCustom://' + location.hostname;
    localStorage.removeItem(customKey);
    alert('Custom filters reset');
    location.reload();
  }

  // Hook into core
  window.uBoxLiteShowPopup = function() {
    var existing = document.getElementById('uBoxLite-popup');
    if (existing) { existing.remove(); return; }
    createPopup();
  };
})();
