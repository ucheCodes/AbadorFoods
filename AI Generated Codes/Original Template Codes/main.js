/* ============================================================
   JELU WELLNESS — main.js
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     1. CAROUSEL
     ============================================================ */
  const SLIDE_DURATION = 5000; // ms per slide

  const carousel       = document.getElementById('carousel');
  const slides         = carousel ? carousel.querySelectorAll('.carousel-slide') : [];
  const dots           = document.querySelectorAll('.dot');
  const prevBtn        = document.getElementById('prevBtn');
  const nextBtn        = document.getElementById('nextBtn');
  const progressBar    = document.getElementById('progressBar');

  let currentSlide     = 0;
  let autoplayTimer    = null;
  let progressTimer    = null;

  function resetSlideAnimations(slide) {
    // Force re-trigger CSS animations by removing/re-adding the active class
    const animated = slide.querySelectorAll('.slide-tag, .slide-title, .slide-desc, .btn-primary, .slide-image');
    animated.forEach(el => {
      el.style.animation = 'none';
      // Trigger reflow
      void el.offsetHeight;
      el.style.animation = '';
    });
  }

  function goToSlide(index) {
    if (index === currentSlide) return;

    // Deactivate current
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');

    // Update index
    currentSlide = (index + slides.length) % slides.length;

    // Activate new
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');

    resetSlideAnimations(slides[currentSlide]);
    startProgress();
  }

  function nextSlide() { goToSlide(currentSlide + 1); }
  function prevSlide() { goToSlide(currentSlide - 1); }

  /* -- Autoplay -- */
  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(nextSlide, SLIDE_DURATION);
  }

  function stopAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }

  /* -- Progress bar -- */
  function startProgress() {
    if (progressBar) {
      progressBar.style.transition = 'none';
      progressBar.style.width = '0%';
      void progressBar.offsetHeight; // reflow
      progressBar.style.transition = `width ${SLIDE_DURATION}ms linear`;
      progressBar.style.width = '100%';
    }
  }

  /* -- Event listeners -- */
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      stopAutoplay();
      startAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      stopAutoplay();
      startAutoplay();
    });
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.dataset.index, 10);
      goToSlide(index);
      stopAutoplay();
      startAutoplay();
    });
  });

  /* -- Touch / Swipe support -- */
  if (carousel) {
    let touchStartX = 0;
    let touchEndX   = 0;

    carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) nextSlide();
        else          prevSlide();
        stopAutoplay();
        startAutoplay();
      }
    }, { passive: true });
  }

  /* -- Keyboard navigation -- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { prevSlide(); stopAutoplay(); startAutoplay(); }
    if (e.key === 'ArrowRight') { nextSlide(); stopAutoplay(); startAutoplay(); }
  });

  /* -- Init carousel -- */
  if (slides.length > 0) {
    startProgress();
    startAutoplay();
  }


  /* ============================================================
     2. NAVBAR — scroll shrink & mobile menu
     ============================================================ */
  const navbar    = document.querySelector('.navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.querySelector('.nav-links');

  window.addEventListener('scroll', () => {
    if (navbar) {
      if (window.scrollY > 40) navbar.classList.add('scrolled');
      else                      navbar.classList.remove('scrolled');
    }
  });

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const isOpen = navLinks.classList.contains('open');
      hamburger.setAttribute('aria-expanded', isOpen);

      // Animate hamburger into × 
      const spans = hamburger.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity   = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      }
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      });
    });
  }


  /* ============================================================
     3. SCROLL-TRIGGERED ANIMATIONS — feature cards
     ============================================================ */
  const cards = document.querySelectorAll('.feature-card');

  if ('IntersectionObserver' in window) {
    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const card  = entry.target;
            const delay = parseInt(card.dataset.delay || '0', 10);
            setTimeout(() => card.classList.add('visible'), delay);
            cardObserver.unobserve(card);
          }
        });
      },
      { threshold: 0.15 }
    );

    cards.forEach(card => cardObserver.observe(card));
  } else {
    // Fallback for old browsers
    cards.forEach(card => card.classList.add('visible'));
  }


  /* ============================================================
     4. ANIMATED COUNTER — stats section
     ============================================================ */
  const statNums = document.querySelectorAll('.stat-num[data-target]');

  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 2000; // ms
    const step     = 16;   // ~60fps
    const increment = target / (duration / step);
    let   current  = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.floor(current).toLocaleString();
    }, step);
  }

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    statNums.forEach(el => counterObserver.observe(el));
  }


  /* ============================================================
     5. SMOOTH SCROLL for anchor links
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80; // navbar height
        const top    = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  /* ============================================================
     6. PARALLAX — hero image blobs on mousemove
     ============================================================ */
  const heroSection = document.getElementById('hero');

  if (heroSection) {
    heroSection.addEventListener('mousemove', (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      const xRatio = (clientX / innerWidth  - 0.5) * 20;
      const yRatio = (clientY / innerHeight - 0.5) * 20;

      const activeSlide = heroSection.querySelector('.carousel-slide.active');
      if (activeSlide) {
        const blob = activeSlide.querySelector('.img-blob');
        if (blob) {
          blob.style.transform = `translate(${xRatio * 0.6}px, ${yRatio * 0.6}px)`;
        }
      }
    });

    heroSection.addEventListener('mouseleave', () => {
      const blob = heroSection.querySelector('.carousel-slide.active .img-blob');
      if (blob) blob.style.transform = 'translate(0, 0)';
    });
  }

})();
