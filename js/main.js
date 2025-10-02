// Slider
(function () {
  const slider = document.querySelector('.slider');
  const slidesWrap = slider.querySelector('.slides');
  const slides = Array.from(slider.querySelectorAll('.slide'));
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const status = document.getElementById('slideStatus');

  let current = 0;
  const total = slides.length;

  // Відмалювати позицію (перенести трек)
  function goTo(index, animate = true) {
    // нормалізація індексу (циклічне)
    const idx = ((index % total) + total) % total;
    current = idx;
    if (!animate) slidesWrap.style.transition = 'none';
    else slidesWrap.style.transition = '';

    slidesWrap.style.transform = `translateX(-${idx * 100}%)`;

    // оновлюємо статус для screen-reader
    if (status) status.textContent = `Слайд ${idx + 1} з ${total}`;

    // скинути inline transition-none якщо було
    if (!animate) {
      // невеликий timeout, щоб дозволити браузеру застосувати стиль без анімації
      requestAnimationFrame(() => {
        requestAnimationFrame(() => (slidesWrap.style.transition = ''));
      });
    }
  }

  // обробники кнопок
  function prev() {
    goTo(current - 1);
  }
  function next() {
    goTo(current + 1);
  }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  // клавіші ← → (доступність)
  window.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') {
      prev();
    }
    if (e.key === 'ArrowRight') {
      next();
    }
  });

  // базова підтримка swipe для touch-пристроїв
  (function attachTouch() {
    let startX = 0;
    let dx = 0;
    const threshold = 40; // мінімальний рух для свайпу

    slider.addEventListener(
      'touchstart',
      e => {
        if (e.touches.length !== 1) return;
        startX = e.touches[0].clientX;
        dx = 0;
        slidesWrap.style.transition = 'none';
      },
      { passive: true }
    );

    slider.addEventListener(
      'touchmove',
      e => {
        if (e.touches.length !== 1) return;
        dx = e.touches[0].clientX - startX;
        const percent = (dx / slider.clientWidth) * 100;
        slidesWrap.style.transform = `translateX(-${current * 100 - percent}%)`;
      },
      { passive: true }
    );

    slider.addEventListener('touchend', () => {
      slidesWrap.style.transition = '';
      if (Math.abs(dx) > threshold) {
        if (dx > 0) prev();
        else next();
      } else {
        goTo(current); // повернутися назад
      }
    });
  })();

  // При ініціалізації — центровано на поточному
  goTo(0, false);

  // Якщо потрібно — можна слухати resize і додатково робити щось:
  window.addEventListener('resize', () => {
    // тут можна робити позиціонування залежно від розміру, поки просто оновимо трансформ
    goTo(current, false);
  });
})();

// Cards
const tabs = document.querySelectorAll('.tab');
const cards = document.querySelectorAll('.card');
const loadMoreBtn = document.getElementById('loadMore');

let currentFilter = 'all';
let showAll = false;

function filterCards(filter) {
  currentFilter = filter;
  showAll = false;
  loadMoreBtn.textContent = 'Завантажити ще';
  loadMoreBtn.classList.remove('open');

  // Активна вкладка
  tabs.forEach(tab => tab.classList.remove('active'));
  document
    .querySelector(`.tab[data-filter="${filter}"]`)
    .classList.add('active');

  // Сховаємо всі картки
  cards.forEach(card => (card.style.display = 'none'));

  let filteredCards = [];

  if (filter === 'all') {
    const categories = [
      ...new Set(Array.from(cards).map(c => c.dataset.category)),
    ];
    categories.forEach(cat => {
      const catCard = Array.from(cards).find(c => c.dataset.category === cat);
      if (catCard) filteredCards.push(catCard);
    });
  } else {
    filteredCards = Array.from(cards).filter(
      c => c.dataset.category === filter
    );
  }

  // Показуємо максимум 3 картки
  filteredCards.forEach((card, idx) => {
    if (idx < 3) card.style.display = 'block';
  });

  // Кнопка "Завантажити ще" показується, якщо є що ще відкрити
  let hasMore = false;
  if (filter === 'all') {
    const categories = [
      ...new Set(Array.from(cards).map(c => c.dataset.category)),
    ];
    hasMore = categories.some(
      cat =>
        Array.from(cards).filter(c => c.dataset.category === cat).length > 1
    );
  } else {
    hasMore = filteredCards.length > 3;
  }

  loadMoreBtn.style.display = hasMore ? 'inline-flex' : 'none';
}

// Клік по вкладках
tabs.forEach(tab => {
  tab.addEventListener('click', () => filterCards(tab.dataset.filter));
});

// Кнопка "Завантажити ще / Приховати"
loadMoreBtn.addEventListener('click', () => {
  let totalCards;

  if (currentFilter === 'all') {
    totalCards = Array.from(cards);
  } else {
    totalCards = Array.from(cards).filter(
      c => c.dataset.category === currentFilter
    );
  }

  if (!showAll) {
    // Показати всі
    totalCards.forEach(card => (card.style.display = 'block'));
    loadMoreBtn.textContent = 'Приховати';
    loadMoreBtn.classList.add('open');
    showAll = true;
  } else {
    // Повернути до початкових карток
    if (currentFilter === 'all') {
      const categories = [
        ...new Set(Array.from(cards).map(c => c.dataset.category)),
      ];
      cards.forEach(card => (card.style.display = 'none'));
      categories.forEach(cat => {
        const catCard = Array.from(cards).find(c => c.dataset.category === cat);
        if (catCard) catCard.style.display = 'block';
      });
    } else {
      totalCards.forEach((card, idx) => {
        card.style.display = idx < 3 ? 'block' : 'none';
      });
    }

    loadMoreBtn.textContent = 'Завантажити ще';
    loadMoreBtn.classList.remove('open');
    showAll = false;
  }
});

// Ініціалізація
filterCards('all');
