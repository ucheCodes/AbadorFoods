/* ============================================================
   ABADOR FOODS — main.js
   Carousel | Navbar | Scroll Animations | Counters | Parallax
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     1. CAROUSEL — 6 slides, autoplay, swipe, keyboard, progress
     ============================================================ */
  const SLIDE_DURATION = 5500; // ms per slide
  const TOTAL_SLIDES   = 6;

  const carousel    = document.getElementById('carousel');
  const slides      = carousel ? carousel.querySelectorAll('.carousel-slide') : [];
  const dots        = document.querySelectorAll('.dot');
  const prevBtn     = document.getElementById('prevBtn');
  const nextBtn     = document.getElementById('nextBtn');
  const progressBar = document.getElementById('progressBar');
  const currentNumEl = document.getElementById('slideCurrentNum');

  let currentSlide  = 0;
  let autoplayTimer = null;
  let isAnimating   = false;

  /* -- Format slide number with leading zero -- */
  function formatNum(n) {
    return String(n + 1).padStart(2, '0');
  }

  /* -- Re-trigger CSS animations on the active slide's text -- */
  function resetTextAnimations(slide) {
    const els = slide.querySelectorAll('.slide-tag, .slide-title, .slide-desc, .slide-btns');
    els.forEach(el => {
      el.style.animation = 'none';
      void el.offsetHeight; // reflow
      el.style.animation  = '';
    });
  }

  /* -- Go to a specific slide -- */
  function goToSlide(index, direction) {
    if (isAnimating || index === currentSlide) return;
    isAnimating = true;

    // Deactivate current
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');

    // Update index
    currentSlide = ((index % TOTAL_SLIDES) + TOTAL_SLIDES) % TOTAL_SLIDES;

    // Activate new
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');

    // Update counter
    if (currentNumEl) currentNumEl.textContent = formatNum(currentSlide);

    // Reset text animations
    resetTextAnimations(slides[currentSlide]);

    // Start progress bar
    startProgress();

    // Allow next transition after 800ms (transition duration)
    setTimeout(() => { isAnimating = false; }, 800);
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
    if (!progressBar) return;
    progressBar.style.transition = 'none';
    progressBar.style.width      = '0%';
    void progressBar.offsetHeight;
    progressBar.style.transition = `width ${SLIDE_DURATION}ms linear`;
    progressBar.style.width      = '100%';
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

  /* -- Touch / Swipe -- */
  if (carousel) {
    let touchStartX = 0;

    carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) nextSlide();
        else          prevSlide();
        stopAutoplay();
        startAutoplay();
      }
    }, { passive: true });
  }

  /* -- Keyboard -- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { prevSlide(); stopAutoplay(); startAutoplay(); }
    if (e.key === 'ArrowRight') { nextSlide(); stopAutoplay(); startAutoplay(); }
  });

  /* -- Pause autoplay on hover -- */
  if (carousel) {
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
  }

  /* -- Init -- */
  if (slides.length > 0) {
    startProgress();
    startAutoplay();
  }


  /* ============================================================
     2. NAVBAR — shrink on scroll + mobile hamburger
     ============================================================ */
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    if (navbar) {
      if (scrollY > 50) navbar.classList.add('scrolled');
      else               navbar.classList.remove('scrolled');
    }

    lastScroll = scrollY;
  });

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);

      const spans = hamburger.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity   = '0';
        spans[1].style.transform = 'scaleX(0)';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      }
    });

    // Close menu when any link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      });
    });
  }


  /* ============================================================
     3. SCROLL-TRIGGERED CARD ANIMATIONS
     ============================================================ */
  const cards = document.querySelectorAll('.feature-card');

  if ('IntersectionObserver' in window && cards.length > 0) {
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
      { threshold: 0.18 }
    );
    cards.forEach(card => cardObserver.observe(card));
  } else {
    cards.forEach(card => card.classList.add('visible'));
  }


  /* ============================================================
     4. ANIMATED COUNTERS — stat numbers
     ============================================================ */
  function animateCounter(el, target, duration) {
    duration = duration || 2000;
    const step      = 16;
    const increment = target / (duration / step);
    let   current   = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.floor(current).toLocaleString();
    }, step);
  }

  const statEls = document.querySelectorAll('.stat-num[data-target], .badge-count-num[data-target]');

  if ('IntersectionObserver' in window && statEls.length > 0) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = parseInt(entry.target.dataset.target, 10);
            animateCounter(entry.target, target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    statEls.forEach(el => counterObserver.observe(el));
  }


  /* ============================================================
     5. SMOOTH SCROLL for anchor links
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href   = this.getAttribute('href');
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 78;
        const top    = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  /* ============================================================
     6. SECTION FADE-IN on scroll (about, why sections)
     ============================================================ */
  const fadeEls = document.querySelectorAll(
    '.about-grid, .why-point, .trust-item, .section-header-center'
  );

  if ('IntersectionObserver' in window && fadeEls.length > 0) {
    // Inject base styles
    const style = document.createElement('style');
    style.textContent = `
      .fade-hidden {
        opacity: 0;
        transform: translateY(28px);
        transition: opacity 0.7s ease, transform 0.7s ease;
      }
      .fade-visible {
        opacity: 1 !important;
        transform: none !important;
      }
      .why-point.fade-hidden { transform: translateX(-20px); }
    `;
    document.head.appendChild(style);

    fadeEls.forEach(el => el.classList.add('fade-hidden'));

    const fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('fade-visible'), i * 80);
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    fadeEls.forEach(el => fadeObserver.observe(el));
  }

  /* ============================================================
     7. REVIEWS SLIDER
     ============================================================ */
  const reviewsTrack  = document.getElementById('reviewsTrack');
  const revPrev       = document.getElementById('revPrev');
  const revNext       = document.getElementById('revNext');
  const reviewsDotsCt = document.getElementById('reviewsDots');

  if (reviewsTrack) {
    const reviewCards = reviewsTrack.querySelectorAll('.review-card');
    let revIndex      = 0;
    let revPerPage    = 3; // default desktop

    function getRevPerPage() {
      if (window.innerWidth <= 768) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    }

    function getTotalRevPages() {
      return Math.ceil(reviewCards.length / revPerPage);
    }

    function buildRevDots() {
      reviewsDotsCt.innerHTML = '';
      const pages = getTotalRevPages();
      for (let i = 0; i < pages; i++) {
        const d = document.createElement('button');
        d.className = 'rev-dot' + (i === revIndex ? ' active' : '');
        d.setAttribute('aria-label', 'Go to review page ' + (i + 1));
        d.addEventListener('click', () => { revIndex = i; renderReviews(); });
        reviewsDotsCt.appendChild(d);
      }
    }

    function renderReviews() {
      revPerPage = getRevPerPage();
      const cardW   = reviewsTrack.parentElement.offsetWidth;
      const gapPx   = 24;
      const singleW = (cardW - (gapPx * (revPerPage - 1))) / revPerPage;

      // Set card widths dynamically
      reviewCards.forEach(c => {
        c.style.flex = '0 0 ' + singleW + 'px';
        c.style.minWidth = singleW + 'px';
      });

      // Clamp index
      const maxIndex = getTotalRevPages() - 1;
      if (revIndex > maxIndex) revIndex = maxIndex;
      if (revIndex < 0) revIndex = 0;

      const offset = revIndex * (singleW * revPerPage + gapPx * revPerPage);
      reviewsTrack.style.transform = 'translateX(-' + offset + 'px)';

      // Update dots
      buildRevDots();
    }

    if (revPrev) revPrev.addEventListener('click', () => {
      const maxIndex = getTotalRevPages() - 1;
      revIndex = revIndex <= 0 ? maxIndex : revIndex - 1;
      renderReviews();
    });

    if (revNext) revNext.addEventListener('click', () => {
      const maxIndex = getTotalRevPages() - 1;
      revIndex = revIndex >= maxIndex ? 0 : revIndex + 1;
      renderReviews();
    });

    // Touch swipe for reviews
    let revTouchStartX = 0;
    reviewsTrack.parentElement.addEventListener('touchstart', e => {
      revTouchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    reviewsTrack.parentElement.addEventListener('touchend', e => {
      const diff = revTouchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        const maxIndex = getTotalRevPages() - 1;
        if (diff > 0) revIndex = revIndex >= maxIndex ? 0 : revIndex + 1;
        else          revIndex = revIndex <= 0 ? maxIndex : revIndex - 1;
        renderReviews();
      }
    }, { passive: true });

    // Init and re-render on resize
    renderReviews();
    window.addEventListener('resize', () => {
      revPerPage = getRevPerPage();
      renderReviews();
    });
  }

})();
