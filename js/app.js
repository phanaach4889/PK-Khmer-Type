/* ============================================================
   PK Khmer Type — Application Bootstrapper & Lifecycle
   ============================================================ */

async function loadExternalData(){
  try {
    const [kbRes, lsRes, tcRes] = await Promise.all([
      fetch("data/keyboard.json").catch(()=>null),
      fetch("data/lessons.json").catch(()=>null),
      fetch("data/typing-content.json").catch(()=>null)
    ]);
    if(kbRes && kbRes.ok){
      const kbData = await kbRes.json();
      if(typeof applyKeyboardData === "function") applyKeyboardData(kbData);
    }
    if(lsRes && lsRes.ok){
      const lsData = await lsRes.json();
      if(typeof applyLessonsData === "function") applyLessonsData(lsData);
    }
    if(tcRes && tcRes.ok){
      const tcData = await tcRes.json();
      if(typeof applyTypingContentData === "function") applyTypingContentData(tcData);
    }
  } catch(e) {
    // Silent fallback: in-memory data already active
  }
}

function initApp(){
  // Synchronous initial render for zero-delay offline startup
  try { if(typeof buildBoard === "function") buildBoard(); } catch(e){ console.error("buildBoard error:", e); }
  try { if(typeof renderLessonStrip === "function") renderLessonStrip(); } catch(e){ console.error("renderLessonStrip error:", e); }
  try { if(typeof updateHandsOverlay === "function") updateHandsOverlay(); } catch(e){ console.error("updateHandsOverlay error:", e); }
  try { if(typeof updateMasteryStat === "function") updateMasteryStat(); } catch(e){ console.error("updateMasteryStat error:", e); }

  // Async data enrichment when hosted on server
  loadExternalData();

  window.addEventListener("resize", ()=>{
    try { if(typeof updateHandsOverlay === "function") updateHandsOverlay(); } catch(e){}
  });
}

if(document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

// App install (PWA) & Service Worker registration
(function(){
  const installBtn = document.getElementById("installAppBtn");
  let deferredPrompt = null;

  function isStandalone(){
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  }
  function isIOS(){
    return /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  }

  if(!isStandalone() && installBtn){
    window.addEventListener("beforeinstallprompt", (e)=>{
      e.preventDefault();
      deferredPrompt = e;
      installBtn.hidden = false;
    });
    window.addEventListener("appinstalled", ()=>{
      installBtn.hidden = true;
      deferredPrompt = null;
      if(typeof showToast === "function") showToast(pkIcon("smartphone", 18), "Installed", "PK Khmer Type is on your home screen now.");
    });

    if(isIOS() && !deferredPrompt){
      installBtn.hidden = false;
    }

    installBtn.addEventListener("click", async ()=>{
      if(deferredPrompt){
        installBtn.hidden = true;
        deferredPrompt.prompt();
        try{ await deferredPrompt.userChoice; }catch(e){}
        deferredPrompt = null;
        return;
      }
      if(isIOS()){
        if(typeof templeConfirm === "function"){
          await templeConfirm(
            "Tap the Share icon in Safari, then choose \"Add to Home Screen\" to install PK Khmer Type as an app.",
            { title:"Install on iPhone / iPad", icon: pkIcon("smartphone", 24), confirmLabel:"Got it", cancelLabel:"Got it" }
          );
        }
        return;
      }
      if(typeof showToast === "function"){
        showToast(pkIcon("smartphone", 18), "Already installable", "Look for an install icon in your browser address bar.");
      }
    });
  }

  if("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")){
    window.addEventListener("load", ()=>{
      navigator.serviceWorker.register("./sw.js").catch(()=>{});
    });
  }
})();
