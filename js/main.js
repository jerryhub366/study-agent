document.addEventListener('DOMContentLoaded', function () {
  var filterBtns = document.querySelectorAll('.filter-btn');
  var cards = document.querySelectorAll('.case-card');
  var casesGrid = document.getElementById('casesGrid');
  var searchInput = document.getElementById('searchInput');
  var resultsCount = document.getElementById('resultsCount');

  var currentFilter = 'all';
  var currentSearch = '';

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      currentFilter = btn.getAttribute('data-filter');
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      applyFilters();
    });
  });

  if (searchInput) {
    var debounceTimer;
    searchInput.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      var self = this;
      debounceTimer = setTimeout(function () {
        currentSearch = self.value.trim().toLowerCase();
        applyFilters();
      }, 150);
    });
  }

  function applyFilters() {
    var visible = 0;
    var visibleCards = [];

    cards.forEach(function (card) {
      var category = card.getAttribute('data-category');
      var text = card.textContent.toLowerCase();
      var matchesFilter = currentFilter === 'all' || category === currentFilter;
      var matchesSearch = !currentSearch || text.indexOf(currentSearch) !== -1;

      if (matchesFilter && matchesSearch) {
        card.classList.remove('hidden');
        visibleCards.push(card);
        visible++;
      } else {
        card.classList.add('hidden');
        card.classList.remove('revealed');
      }
    });

    staggerReveal(visibleCards);
    updateResultsCount(visible);
    updateEmptyState(visible);
  }

  function staggerReveal(cardList) {
    cardList.forEach(function (card, i) {
      card.classList.remove('revealed');
      setTimeout(function () {
        card.classList.add('revealed');
      }, Math.min(i * 40, 600));
    });
  }

  function updateResultsCount(count) {
    if (!resultsCount) return;
    if (currentFilter === 'all' && !currentSearch) {
      resultsCount.textContent = '';
    } else {
      resultsCount.textContent = '显示 ' + count + ' / ' + cards.length + ' 个案例';
    }
  }

  function updateEmptyState(count) {
    var existing = casesGrid.querySelector('.empty-state');
    if (count === 0) {
      if (!existing) {
        var el = document.createElement('div');
        el.className = 'empty-state';
        el.innerHTML = '<div class="empty-state-icon">🔍</div><div class="empty-state-text">没有找到匹配的案例</div><div class="empty-state-hint">试试其他关键词或筛选条件</div>';
        casesGrid.appendChild(el);
      }
    } else if (existing) {
      existing.remove();
    }
  }

  // Scroll reveal with IntersectionObserver (more reliable than scroll event)
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    cards.forEach(function (card) { observer.observe(card); });

    document.querySelectorAll('.ref-list li').forEach(function (li) { observer.observe(li); });
    document.querySelectorAll('.timeline-item').forEach(function (item) { observer.observe(item); });
  } else {
    cards.forEach(function (card) { card.classList.add('revealed'); });
    document.querySelectorAll('.ref-list li').forEach(function (li) { li.classList.add('revealed'); });
    document.querySelectorAll('.timeline-item').forEach(function (item) { item.classList.add('revealed'); });
  }

  // Scroll progress bar
  var progressBar = document.querySelector('.scroll-progress');
  if (progressBar) {
    window.addEventListener('scroll', function () {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';
    }, { passive: true });
  }

  // Back to top
  var backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', function () {
      backToTop.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // NEW badges
  document.querySelectorAll('.case-card[data-new="true"] .case-header').forEach(function (header) {
    var badge = document.createElement('span');
    badge.className = 'new-badge';
    badge.textContent = 'NEW';
    header.insertBefore(badge, header.querySelector('.level'));
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && document.activeElement !== searchInput && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      if (searchInput) searchInput.focus();
    }
    if (e.key === 'Escape' && document.activeElement === searchInput) {
      searchInput.blur();
      searchInput.value = '';
      currentSearch = '';
      applyFilters();
    }
  });
});
