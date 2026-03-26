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

    // Duplicate grid items to fill the scroll runway (4x = ~20 rows = 5000px)
    var originalHTML = grid.innerHTML;
    grid.innerHTML = originalHTML + originalHTML + originalHTML + originalHTML;

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
        // Scroll grid via translateY
        // Cap scroll distance to show a reasonable amount of the grid
        // We want to scroll through ~3000px of grid content during the 300vh scroll
        var maxScroll = 3000;
        var gridTranslateY = -(progress * maxScroll);
        grid.style.transform = 'translate3d(0,' + gridTranslateY + 'px,0)';

        // Update perspective-origin to track the visual center of the viewport
        // relative to the grid's current position
        grid.style.perspectiveOrigin = '50% ' + (viewportHeight / 2 - gridTranslateY) + 'px';

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
          // Parent has perspective — no perspective() needed here
          var rotateX = offsetY * 45;   // top tilts forward, bottom tilts back
          var rotateY = -offsetX * 35;  // left tilts right, right tilts left (toward center)

          // Distance from center (0 at center, 1 at corners)
          var dist = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
          dist = Math.min(1, dist);

          // Opacity: brighter at center, dimmer at edges
          var opacity = 1 - dist * 0.5;

          // No perspective() — parent viewport's perspective creates shared vanishing point
          // This is what makes the trapezoid/tunnel effect work
          item.style.transform = 'rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
          item.style.opacity = Math.max(0.15, opacity);
        });

        // Toggle fixed overlay visibility when past gallery
        if (heroSection) {
          var pastGallery = scrollY > containerTop + containerHeight - viewportHeight * 1.5;
          heroSection.classList.toggle('cda-gallery--past', pastGallery);
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

    // Fade out text the instant user starts scrolling — tied to scroll position
    var fadeDist = 150; // fully gone by 150px scroll
    function onScrollFade() {
      var y = window.pageYOffset;
      var opacity = Math.max(0, 1 - (y / fadeDist));
      content.style.opacity = opacity;
      content.style.transform = 'translate(-50%, calc(-50% - ' + (y * 0.5) + 'px))';
      if (scrollHint) scrollHint.style.opacity = Math.max(0, opacity - 0.3);
    }
    window.addEventListener('scroll', onScrollFade, { passive: true });
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
