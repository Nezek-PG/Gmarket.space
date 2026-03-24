
const navbar = document.getElementById('navbar');
let lastScrollY = window.scrollY;
let ticking = false;
const SCROLL_THRESHOLD = 60;    // pixels – avoid hiding on tiny scrolls

function updateNavbar() {
  const currentScrollY = window.scrollY;

  // Only act if scrolled enough
  if (Math.abs(currentScrollY - lastScrollY) < SCROLL_THRESHOLD) {
    ticking = false;
    return;
  }

  if (currentScrollY > lastScrollY && currentScrollY > 120) {
    // scrolling down → hide slowly
    navbar.classList.add('hidden');
  } else {
    // scrolling up or near top → show slowly
    navbar.classList.remove('hidden');
  }

  lastScrollY = currentScrollY;
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(updateNavbar);
    ticking = true;
  }
}, { passive: true });

// Optional: force show navbar when near top of page
window.addEventListener('scroll', () => {
  if (window.scrollY < 80) {
    navbar.classList.remove('hidden');
  }
}, { passive: true });

// Smooth anchor scrolling (unchanged)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href'))?.scrollIntoView({
      behavior: 'smooth'
    });
  });
});

cycisk = document.getElementById("DiscordBTN")
function discord(){
   window.open("https://discord.com/invite/PWkeNuyC2h", "_blank", "noopener,noreferrer");
}

function scrollToHardware() {
  document.querySelector('#hardware').scrollIntoView({ 
    behavior: 'smooth',
    block: 'start'          // możesz zmienić na 'center' jeśli chcesz wycentrować sekcję
  });
}
