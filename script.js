// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});


// ===== FADE-IN ON SCROLL (UPGRADED) =====
const faders = document.querySelectorAll('.fade-in');

const appearOptions = {
    threshold: 0.2,
};

const appearOnScroll = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add('show');
        observer.unobserve(entry.target);
    });
}, appearOptions);

faders.forEach(el => {
    appearOnScroll.observe(el);
});


// ===== STICKY HEADER EFFECT =====
const header = document.querySelector("header");

window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
        header.style.background = "#0B1F3A";
        header.style.boxShadow = "0 2px 10px rgba(0,0,0,0.3)";
    } else {
        header.style.background = "transparent";
        header.style.boxShadow = "none";
    }
});


// ===== ACTIVE NAV LINK =====
const navLinks = document.querySelectorAll("nav a");

navLinks.forEach(link => {
    if (link.href === window.location.href) {
        link.style.color = "#D4AF37";
    }
});


// ===== FORM VALIDATION =====
const form = document.querySelector("form");

if (form) {
    form.addEventListener("submit", function(e) {

        const name = form.querySelector('input[name="name"]');
        const email = form.querySelector('input[name="email"]');
        const message = form.querySelector('textarea[name="message"]');

        if (!name.value || !email.value || !message.value) {
            e.preventDefault();
            alert("Please fill all required fields.");
            return;
        }

        if (!email.value.includes("@")) {
            e.preventDefault();
            alert("Enter a valid email address.");
            return;
        }
    });
}


// ===== BUTTON CLICK FEEDBACK =====
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.style.transform = "scale(0.96)";
        setTimeout(() => {
            btn.style.transform = "scale(1)";
        }, 150);
    });
});
window.addEventListener("scroll", () => {
    const header = document.querySelector("header");

    if (window.scrollY > 20) {
        header.style.boxShadow = "0 2px 10px rgba(0,0,0,0.3)";
    } else {
        header.style.boxShadow = "none";
    }
});
const toggleBtn = document.getElementById("contactToggle");
const options = document.querySelector(".contact-options");

if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
        options.classList.toggle("show");
    });
}
