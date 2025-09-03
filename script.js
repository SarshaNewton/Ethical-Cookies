/* 
	NO COOKIES ARE ACTUALLY SAVED
	Just a boolean with the name of the "cookie" and it's value ("true" or "false") depending on the option selected
	This is done to simulated the cookie function 🔥
*/


// ===== Elements =====
const landingPanel   = document.getElementById('cookie-landing');
const customizePanel = document.getElementById('cookie-customize');
const acceptBtns      = document.querySelectorAll('.accept-cookies');
const rejectBtns      = document.querySelectorAll('.reject-cookies');
const confirmBtns     = document.querySelectorAll('.confirm-cookies');
const customizeLink   = document.getElementById('customize-link');
const modal           = document.getElementById('cookie-modal');

// ===== Keys / Images =====
const KEYS = ['analytics','preferences','marketing','performance'];

// Map the type of cookie to the topping here!
const IMAGE_TOGGLES = {
  analytics:   'drizzle',
  preferences: 'sprinkles',
  marketing:   'marshmallows',
  performance: 'nuts',
};

const TOPPING = Object.fromEntries(
  Object.entries(IMAGE_TOGGLES).map(([key, id]) => [key, document.getElementById(id)])
);

// Warn if any image is missing
{
  const missing = Object.entries(TOPPING).filter(([, el]) => !el).map(([k]) => IMAGE_TOGGLES[k]);
  if (missing.length) console.warn('Images not found for ids:', missing);
}

// ===== Storage =====
// Saves "cookies" to local storage (just a json with the name of the cookie type and a boolean value next to it)
const CONSENT_KEY = 'consent.v1';
const defaultConsent = { analytics:false, preferences:false, marketing:false, performance:false };
const loadConsent  = () => { try { return JSON.parse(localStorage.getItem(CONSENT_KEY)); } catch { return null; } };
const saveConsent  = (prefs) => localStorage.setItem(CONSENT_KEY, JSON.stringify(prefs));

// ===== State =====
let persisted = loadConsent() || null;                    // last saved choice (or null)
let draft     = { ...(persisted || defaultConsent) };     // what user edits in customize

// ===== Helpers =====
function setTopping(key, on){
  const img = TOPPING[key];
  if (!img) return;
  img.style.opacity = on ? '1' : '0';
}

// Toggle the visibility of the topping based on the checkboxes selected
function syncUIFromState(state){
  KEYS.forEach(k => {
    const input = document.querySelector(`#cookie-${k} > input[type="checkbox"]`);
    if (input) input.checked = !!state[k];
    setTopping(k, !!state[k]);
  });
}

// Open the customize panel
function openCustomize(){
  draft = { ...(persisted || defaultConsent) };
  syncUIFromState(draft);
  if (landingPanel) landingPanel.style.display = 'none';
  if (modal){
    modal.style.display = 'flex';
    modal.style.width  = window.innerWidth  <= 768 ? '100%' : '900px';
    modal.style.height = window.innerHeight <= 768 ? '100%' : '90vh';
  }
  if (customizePanel) customizePanel.style.display = 'flex';
  if (customizeLink) customizeLink.style.display = 'none';
}

// Open the cookie modal
function openCookieModal(){
	modal.style.display = "flex";
	modal.style.width = "500px";
	modal.style.height = "auto";
	landingPanel.style.display ="flex";
}

// Close the entire modal #We're done!
function closeConsentUI(){
  if (modal) modal.style.display = 'none';``
  if (customizePanel) customizePanel.style.display = 'none';
  if (landingPanel) landingPanel.style.display = 'none';
  if (customizeLink) customizeLink.style.display = '';
}

// Remove all "cookies" from local storage
function resetConsentUI(){
  localStorage.removeItem('consent.v1');  
  persisted = {...defaultConsent};
  draft = { analytics:false, preferences:false, marketing:false, performance:false };
  console.log("Cookies removed!");
  syncUIFromState(draft);               
  openCookieModal();                         
}

// ===== Initial paint =====
if (persisted) {
  syncUIFromState(persisted);
  console.log('You already have cookies! ',persisted);
  if (modal) modal.style.display = 'none';
} else {
  syncUIFromState(defaultConsent);
}

// ===== Events =====

// Open customize panel
customizeLink?.addEventListener('click', (e) => { e.preventDefault(); openCustomize();});

//Re open cookie modal
document.getElementById('cookie-settings-link')?.addEventListener('click', (e)=> { e.preventDefault(); openCookieModal();});

// Reset all "cookies"
document.getElementById('reset-cookie-settings').addEventListener('click', (e)=>{ resetConsentUI();});

// Switches (DRAFT ONLY + live preview). Single delegated listener on the panel.
document.getElementById('cookie-customize')?.addEventListener('change', (ev) => {
  if (!ev.target.matches('.switch > input[type="checkbox"]')) return;
  const key = ev.target.closest('.switch').id.replace('cookie-', '');
  draft[key] = ev.target.checked;
  setTopping(key, draft[key]);
});

// Chevron disclosure (rotate control, show/hide adjacent .cookie-info)
document.addEventListener('click', (e)=> {
  const chevron = e.target.closest('.cookie-control .chevron');
  if (!chevron) return;

  const control = chevron.closest('.cookie-control');
  const info = control.nextElementSibling;
  if (!info || !info.classList.contains('cookie-info')) return;

  const open = control.getAttribute('aria-expanded') === 'true';
  control.setAttribute('aria-expanded', String(!open));
  info.hidden = open;
});

// Accept All = persist all true
acceptBtns.forEach(btn => btn.addEventListener('click', () => {
  persisted = Object.fromEntries(KEYS.map(k => [k, true]));
  draft     = { ...persisted };
  saveConsent(persisted);
  syncUIFromState(persisted);
  console.log('You accepted all cookies', persisted);
  closeConsentUI();
}));

// Reject All = persist all false
rejectBtns.forEach(btn => btn.addEventListener('click', () => {
  persisted = { ...defaultConsent };
  draft     = { ...persisted };
  saveConsent(persisted);
  syncUIFromState(persisted);
  console.log('You rejected all cookies', persisted);
  closeConsentUI();
}));

// Confirm = persist current draft
confirmBtns.forEach(btn => btn.addEventListener('click', () => {
  persisted = { ...draft };
  saveConsent(persisted);
  syncUIFromState(persisted);
  console.log('You customized your cookies', persisted);
  closeConsentUI();
}));
