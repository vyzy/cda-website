/* ============================================
   Option B: "The Gallery Wall" — Scroll-Driven 3D Grid
   Inspired by Codrops ScrollAnimationsGrid index7
   Vanilla JS — no GSAP, no Lenis
   ============================================ */

(function () {
  'use strict';

  var hasAnime = typeof anime !== 'undefined';
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Scroll-driven 3D animation on grid items ---
  function initScrollGrid() {
    if (reducedMotion) return;

    var container = document.querySelector('.cda-gallery-wall');
    var viewport = document.querySelector('.cda-gallery-wall__viewport');
    var grid = document.querySelector('.cda-gallery-wall__grid');
    var items = document.querySelectorAll('.cda-gallery-wall__item');
    var heroSection = document.querySelector('.cda-hero--gallery');

    if (!container || !grid || !items.length) return;

    // Duplicate grid items 2x for seamless infinite scroll feel
    var originalHTML = grid.innerHTML;
    grid.innerHTML = originalHTML + originalHTML + originalHTML;

    // Re-query after duplication
    items = grid.querySelectorAll('.cda-gallery-wall__item');

    var ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(function () {
        var scrollY = window.pageYOffset;
        var containerTop = container.offsetTop;
        var containerHeight = container.offsetHeight;
        var viewportHeight = window.innerHeight;

        // Progress through the gallery section (0 = top, 1 = bottom)
        var progress = Math.max(0, Math.min(1,
          (scrollY - containerTop) / (containerHeight - viewportHeight)
        ));

        // Move the grid upward — tripled content means more to scroll through
        var gridTranslateY = -progress * 70; // percentage of the tripled grid
        grid.style.transform = 'translateY(' + gridTranslateY + '%)';

        // 3D effect on each item based on its position in viewport
        items.forEach(function (item) {
          var rect = item.getBoundingClientRect();

          // Skip items far off screen for performance
          if (rect.bottom < -200 || rect.top > viewportHeight + 200) return;

          var itemCenter = rect.top + rect.height / 2;
          var viewCenter = viewportHeight / 2;

          // -1 at top of screen, 0 at center, +1 at bottom
          var offset = (itemCenter - viewCenter) / viewportHeight;
          offset = Math.max(-1, Math.min(1, offset));

          // 3D rotation: items above center tilt forward, below tilt back
          var rotateX = offset * 35;
          // Scale: smaller at edges, full size at center
          var scale = 1 - Math.abs(offset) * 0.15;
          // Opacity: fade at extreme edges
          var opacity = 1 - Math.abs(offset) * 0.4;

          item.style.transform = 'perspective(1200px) rotateX(' + rotateX + 'deg) scale(' + scale + ')';
          item.style.opacity = Math.max(0.3, opacity);
        });

        // Toggle fixed overlay visibility when past gallery
        if (heroSection) {
          if (scrollY > containerTop + containerHeight - viewportHeight - 100) {
            heroSection.classList.add('cda-gallery--past');
          } else {
            heroSection.classList.remove('cda-gallery--past');
          }
        }

        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Initial position
  }

  // --- Hero content entrance ---
  function initHeroContent() {
    var content = document.querySelector('.cda-hero--gallery .cda-hero__content');
    if (!content) return;

    if (reducedMotion || !hasAnime) {
      content.style.opacity = '1';
      return;
    }

    content.style.opacity = '0';

    anime.timeline({ easing: 'cubicBezier(0.14, 1, 0.34, 1)' })
      .add({
        targets: '.cda-hero--gallery .cda-hero__title',
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 1000,
        delay: 300
      })
      .add({
        targets: '.cda-hero--gallery .cda-hero__subtitle',
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 800
      }, '-=600')
      .add({
        targets: '.cda-hero--gallery .cda-btn',
        opacity: [0, 1],
        translateY: [15, 0],
        duration: 800
      }, '-=500')
      .add({
        targets: '.cda-hero--gallery .cda-hero__scroll',
        opacity: [0, 0.7],
        duration: 800
      }, '-=400');

    // Show container
    setTimeout(function () {
      content.style.opacity = '1';
    }, 200);
  }

  function init() {
    initScrollGrid();
    initHeroContent();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
