function acceptCookies(){
	document.getElementById('cookie-banner').style.display='none';
	// set all preferences true
	localStorage.setItem('cookieAccepted','true');
	localStorage.setItem('cookie_analytics','true');
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

	function loadPrefs(){
		const analytics = localStorage.getItem('cookie_analytics') === 'true';
		if(analyticsCb) analyticsCb.checked = analytics;
	}

	function showSettings(){ if(settings) settings.style.display='block'; }
	function hideSettings(){ if(settings) settings.style.display='none'; }

	if(openBtn) openBtn.addEventListener('click', ()=>{ loadPrefs(); showSettings(); });
	if(cancelBtn) cancelBtn.addEventListener('click', ()=>{ hideSettings(); });
	if(saveBtn) saveBtn.addEventListener('click', ()=>{
		const analytics = analyticsCb && analyticsCb.checked;
		localStorage.setItem('cookie_analytics', analytics ? 'true' : 'false');
		localStorage.setItem('cookieAccepted','true');
		if(banner) banner.style.display='none';
		hideSettings();
		// optionally initialize analytics here if analytics == true
	});
	if(acceptAll) acceptAll.addEventListener('click', ()=>{ acceptCookies(); });

	// initialize state on load
	document.addEventListener('DOMContentLoaded', ()=>{
		if(localStorage.getItem('cookieAccepted')){
			if(banner) banner.style.display='none';
		}
	});
})();
