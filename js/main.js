// Changelog: aggiunti focus-handling e keyboard support per il pannello cookie
function acceptCookies(){
	document.getElementById('cookie-banner').style.display='none';
	// set all preferences true
	localStorage.setItem('cookieAccepted','true');
	localStorage.setItem('cookie_analytics','true');
	// load analytics only after explicit consent
	loadAnalyticsIfAllowed();
}
if(localStorage.getItem('cookieAccepted')){
	document.getElementById('cookie-banner').style.display='none';
}
const observer=new IntersectionObserver(entries=>{
entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');}});
});
document.querySelectorAll('.fade-in').forEach(el=>observer.observe(el));

// HEADER: rendi più visibile il banner in alto quando si scorre
(function(){
	const header = document.querySelector('.header');
	if(!header) return;
	const threshold = 60;
	function onScroll(){
		if(window.scrollY > threshold){
			header.classList.add('scrolled');
		} else {
			header.classList.remove('scrolled');
		}
	}
	document.addEventListener('scroll', onScroll, {passive:true});
	onScroll();
})();

// Cookie settings UI
(function(){
	const banner = document.getElementById('cookie-banner');
	const openBtn = document.getElementById('open-cookie-settings');
	const settings = document.getElementById('cookie-settings');
	const saveBtn = document.getElementById('save-cookie-prefs');
	const cancelBtn = document.getElementById('cancel-cookie-prefs');
	const acceptAll = document.getElementById('accept-all');
	const analyticsCb = document.getElementById('cookie-analytics');
	let previousFocus = null;

	// utility: find focusable elements inside settings
	function getFocusable(container){
		if(!container) return [];
		return Array.from(container.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'))
			.filter(el=>el.offsetWidth>0 || el.offsetHeight>0 || el === document.activeElement);
	}

	function loadPrefs(){
		const analytics = localStorage.getItem('cookie_analytics') === 'true';
		if(analyticsCb) analyticsCb.checked = analytics;
	}

	function showSettings(){ if(settings) settings.style.display='block'; }
	function hideSettings(){ if(settings) settings.style.display='none'; }

	if(openBtn) openBtn.addEventListener('click', ()=>{
		loadPrefs();
		showSettings();
		// accessibility: manage aria and focus
		if(settings){
			previousFocus = document.activeElement;
			settings.setAttribute('aria-hidden','false');
			openBtn.setAttribute('aria-expanded','true');
			const focusables = getFocusable(settings);
			const first = focusables[0] || settings;
			first.focus();
		}
		// trap focus
		document.addEventListener('keydown', trapKeydown);
	});
	if(cancelBtn) cancelBtn.addEventListener('click', ()=>{ hideSettings(); });
	if(saveBtn) saveBtn.addEventListener('click', ()=>{
		const analytics = analyticsCb && analyticsCb.checked;
		localStorage.setItem('cookie_analytics', analytics ? 'true' : 'false');
		localStorage.setItem('cookieAccepted','true');
		if(banner) banner.style.display='none';
		// restore aria and focus
		if(settings){ settings.setAttribute('aria-hidden','true'); }
		if(openBtn){ openBtn.setAttribute('aria-expanded','false'); }
		if(previousFocus && previousFocus.focus) previousFocus.focus();
		hideSettings();
		document.removeEventListener('keydown', trapKeydown);
		// optionally initialize analytics here if analytics == true
        loadAnalyticsIfAllowed();
	});
	if(acceptAll) acceptAll.addEventListener('click', ()=>{ acceptCookies(); });

	// initialize state on load
	document.addEventListener('DOMContentLoaded', ()=>{
		if(localStorage.getItem('cookieAccepted')){
			if(banner) banner.style.display='none';
		}
	});
})();

// focus trap + Escape support for cookie settings
function trapKeydown(e){
	const settings = document.getElementById('cookie-settings');
	if(!settings || settings.getAttribute('aria-hidden') === 'true') return;
	if(e.key === 'Escape'){
		// close the panel
		settings.setAttribute('aria-hidden','true');
		const openBtn = document.getElementById('open-cookie-settings');
		if(openBtn) openBtn.setAttribute('aria-expanded','false');
		document.removeEventListener('keydown', trapKeydown);
		// restore focus
		try{ if(document.activeElement) document.activeElement.blur(); }catch(_){}
		const prev = document.querySelector('[data-prev-focus]');
		if(prev && prev.focus) prev.focus();
		return;
	}
	if(e.key === 'Tab'){
		const focusables = getFocusable(settings);
		if(focusables.length === 0) { e.preventDefault(); return; }
		const first = focusables[0];
		const last = focusables[focusables.length -1];
		if(e.shiftKey && document.activeElement === first){
			e.preventDefault(); last.focus();
		} else if(!e.shiftKey && document.activeElement === last){
			e.preventDefault(); first.focus();
		}
	}
}

// helper reused by trapKeydown - safe getter
function getFocusable(container){
	if(!container) return [];
	return Array.from(container.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'))
		.filter(el=>el.offsetWidth>0 || el.offsetHeight>0 || el === document.activeElement);
}

// Analytics loader that respects user consent. Set meta[name="analytics-id"] to the GA/GA4 ID.
function getAnalyticsId(){
	const m = document.querySelector('meta[name="analytics-id"]');
	return m ? m.getAttribute('content').trim() : '';
}

function loadAnalyticsIfAllowed(){
	try{
		const id = getAnalyticsId();
		const allowed = localStorage.getItem('cookie_analytics') === 'true';
		if(!id || !allowed) return;
		if(window.gtagLoaded) return;
		const s = document.createElement('script');
		s.async = true;
		s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
		document.head.appendChild(s);
		window.dataLayer = window.dataLayer || [];
		function gtag(){window.dataLayer.push(arguments);} 
		window.gtag = gtag;
		gtag('js', new Date());
		gtag('config', id, { 'anonymize_ip': true });
		window.gtagLoaded = true;
	}catch(e){console.warn('Analytics load failed', e)}
}

// Try to load analytics on page load if consent already given
document.addEventListener('DOMContentLoaded', ()=>{ loadAnalyticsIfAllowed(); });
