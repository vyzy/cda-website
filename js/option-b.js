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

        var viewportWidth = window.innerWidth;

        // 3D cylindrical effect — items tilt toward center on both axes
        items.forEach(function (item) {
          var rect = item.getBoundingClientRect();

          // Skip items far off screen for performance
          if (rect.bottom < -200 || rect.top > viewportHeight + 200) return;

          var itemCenterX = rect.left + rect.width / 2;
          var itemCenterY = rect.top + rect.height / 2;
          var viewCenterX = viewportWidth / 2;
          var viewCenterY = viewportHeight / 2;

          // Vertical offset: -1 at top, 0 at center, +1 at bottom
          var offsetY = (itemCenterY - viewCenterY) / viewportHeight;
          offsetY = Math.max(-1, Math.min(1, offsetY));

          // Horizontal offset: -1 at left, 0 at center, +1 at right
          var offsetX = (itemCenterX - viewCenterX) / viewportWidth;
          offsetX = Math.max(-1, Math.min(1, offsetX));

          // Cylindrical tunnel: tilt toward center on both axes
          var rotateX = offsetY * 40;   // top tilts forward, bottom tilts back
          var rotateY = -offsetX * 30;  // left tilts right, right tilts left (toward center)

          // Distance from center (0 at center, 1 at corners)
          var dist = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
          dist = Math.min(1, dist);

          // Scale: larger at center, smaller at edges
          var scale = 1 - dist * 0.2;
          // Opacity: brighter at center, dimmer at edges
          var opacity = 1 - dist * 0.5;

          item.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale(' + scale + ')';
          item.style.opacity = Math.max(0.2, opacity);
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

  // --- Hero content entrance + auto-dismiss after 3s ---
  function initHeroContent() {
    var content = document.querySelector('.cda-hero--gallery .cda-hero__content');
    var scrollHint = document.querySelector('.cda-hero--gallery .cda-hero__scroll');
    if (!content) return;

    if (reducedMotion || !hasAnime) {
      content.style.opacity = '1';
      // Still dismiss after 3s
      setTimeout(function () {
        content.classList.add('cda-hero__content--gone');
        if (scrollHint) scrollHint.style.opacity = '0';
      }, 3000);
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

    // Dismiss title after 3 seconds — scrolls up and fades out
    setTimeout(function () {
      content.classList.add('cda-hero__content--gone');
      if (scrollHint) {
        scrollHint.style.transition = 'opacity 0.6s ease';
        scrollHint.style.opacity = '0';
      }
    }, 3000);
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
