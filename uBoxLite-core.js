(function(){
  // ========== Configuration ==========
  var base_url = "https://raw.githubusercontent.com/2026chell/ublok-lite/main";

  // ========== XHR Helper ==========
  function http_get(url, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) cb(xhr.responseText);
      else console.error("uBoxLite: HTTP " + xhr.status + " fetching " + url);
    };
    xhr.onerror = function() { console.error("uBoxLite: Network error fetching " + url); };
    xhr.send();
  }

  // ========== Dynamic Loader ==========
  function loadCSS(path, id) {
    if (document.getElementById(id)) return;
    http_get(path, function(txt) {
      var style = document.createElement('style');
      style.id = id;
      style.textContent = txt;
      document.head.appendChild(style);
    });
  }

  function loadJS(path, id, cb) {
    if (document.getElementById(id)) { if (cb) cb(); return; }
    http_get(path, function(txt) {
      var script = document.createElement('script');
      script.id = id;
      script.textContent = txt;
      document.body.appendChild(script);
      if (cb) cb();
    });
  }

  // ========== Core Blocking Logic ==========
  function startBlocking(filterList) {
    var hostname = location.hostname;
    var storageKey = 'uBoxLiteEnabled://' + hostname;
    var enabled = localStorage.getItem(storageKey) !== 'false';
    var blockedCount = 0;
    var selector = filterList.concat(JSON.parse(localStorage.getItem('uBoxLiteCustom://'+hostname)||'[]')).join(',');

    function purge() {
      document.querySelectorAll(selector).forEach(function(el) {
        el.remove(); blockedCount++;
      });
      updateCount();
    }

    var ticking = false;
    var observer = new MutationObserver(function() {
      if (!enabled || ticking) return;
      ticking = true;
      requestAnimationFrame(function() {
        purge();
        ticking = false;
      });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    window.uBoxLiteShowPopup = function() {
      var existing = document.getElementById('uBoxLite-popup');
      if (existing) { existing.remove(); return; }
      var p = document.createElement('div');
      p.id = 'uBoxLite-popup';
      Object.assign(p.style, {
        position:'fixed', top:'1em', right:'1em', background:'#222', color:'#fff',
        padding:'0.8em', borderRadius:'6px', fontFamily:'sans-serif', fontSize:'13px',
        zIndex:1e8, boxShadow:'0 2px 8px rgba(0,0,0,0.5)', minWidth:'200px'
      });
      p.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.6em">'+
                    '<strong>uBox-Lite</strong><span id="uBoxLite-close" style="cursor:pointer">✖</span></div>'+ 
                    '<div><strong>Blocked:</strong> <span id="uBoxLite-count">'+blockedCount+'</span></div>'+ 
                    '<button id="uBoxLite-toggle" style="margin-top:0.5em;">'+(enabled?'Disable':'Enable')+'</button>';
      document.body.appendChild(p);
      p.querySelector('#uBoxLite-close').onclick = function(){ p.remove(); };
      p.querySelector('#uBoxLite-toggle').onclick = function(){
        enabled = !enabled;
        localStorage.setItem(storageKey, enabled);
        location.reload();
      };
    };

    if (enabled) purge();
    if (!window.uBoxLitePopupInitialized) window.uBoxLiteShowPopup();
  }

  // ========== Initialization ==========
  function init() {
    loadCSS(base_url + "/uBoxLite-hide.css", "uBoxLite-hide");
    loadJS(base_url + "/uBoxLite-popup.js", "uBoxLite-popup", function(){
      window.uBoxLitePopupInitialized = true;
    });
    http_get(base_url + "/filters.json", function(txt){
      try {
        var filters = JSON.parse(txt);
        startBlocking(filters);
      } catch (e) {
        console.error("uBoxLite: invalid filters.json", e);
      }
    });
  }

  init();
})();
