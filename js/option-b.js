/* ============================================
   Option B: "The Gallery Wall" — Scroll-Driven 3D Grid
   Uses GSAP + ScrollTrigger (not Anime.js)
   ============================================ */

(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Scroll-driven 3D animation on grid items ---
  function initScrollGrid() {
    if (reducedMotion) return;

    var container = document.querySelector('.cda-gallery-wall');
    var grid = document.querySelector('.cda-gallery-wall__grid');
    var items = document.querySelectorAll('.cda-gallery-wall__item');
    var heroSection = document.querySelector('.cda-hero--gallery');

    if (!container || !grid || !items.length) return;

    // Duplicate grid items 2x for the short scroll runway
    var originalHTML = grid.innerHTML;
    grid.innerHTML = originalHTML + originalHTML;
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
        var viewportWidth = window.innerWidth;

        var progress = Math.max(0, Math.min(1,
          (scrollY - containerTop) / (containerHeight - viewportHeight)
        ));

        var maxScroll = 1200;
        var gridTranslateY = -(progress * maxScroll);
        grid.style.transform = 'translate3d(0,' + gridTranslateY + 'px,0)';
        grid.style.perspectiveOrigin = '50% ' + (viewportHeight / 2 - gridTranslateY) + 'px';

        // 3D cylindrical effect
        items.forEach(function (item) {
          var rect = item.getBoundingClientRect();
          if (rect.bottom < -200 || rect.top > viewportHeight + 200) return;

          var itemCenterX = rect.left + rect.width / 2;
          var itemCenterY = rect.top + rect.height / 2;
          var viewCenterX = viewportWidth / 2;
          var viewCenterY = viewportHeight / 2;

          var offsetY = (itemCenterY - viewCenterY) / viewportHeight;
          offsetY = Math.max(-1, Math.min(1, offsetY));
          var offsetX = (itemCenterX - viewCenterX) / viewportWidth;
          offsetX = Math.max(-1, Math.min(1, offsetX));

          var yStrength = offsetY > 0 ? 60 : 45;
          var rotateX = offsetY * yStrength;
          var rotateY = -offsetX * (35 + Math.abs(offsetY) * 20);

          var dist = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
          dist = Math.min(1, dist);
          var opacity = 1 - dist * 0.5;

          item.style.transform = 'rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
          item.style.opacity = Math.max(0.15, opacity);
        });

        // Toggle fixed overlay when past gallery
        if (heroSection) {
          var pastGallery = scrollY > containerTop + containerHeight - viewportHeight * 1.5;
          heroSection.classList.toggle('cda-gallery--past', pastGallery);
        }

        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // --- Hero content: visible on load, fades on scroll ---
  function initHeroContent() {
    var content = document.querySelector('.cda-hero--gallery .cda-hero__content');
    var scrollHint = document.querySelector('.cda-hero--gallery .cda-hero__scroll');
    if (!content) return;

    // Visible immediately — no entrance animation
    content.style.opacity = '1';

    // Scroll-fade: fades out on any scroll
    var fadeDist = 150;
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
