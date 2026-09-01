/* ENZAIRO — SITE + READER
   Safe for local files and static hosting. */

const translations = {
  en: {
    navAbout:"About", navWorld:"World", navVolume:"Volume 1", official:"OFFICIAL MANGA PROJECT",
    heroSubtitle:"Four islands. Four cultures. One world on the edge of change.", readVolume:"READ VOLUME 1", explore:"EXPLORE", scroll:"SCROLL TO DISCOVER",
    aboutLabel:"ABOUT THE MANGA", aboutTitle:"A world divided by power.",
    aboutText1:"Enzairo takes place in a world divided between four islands, each with its own culture, abilities and history.",
    aboutText2:"For generations, people born with supernatural abilities shaped the world. But one group believes that these powers are the source of every war.",
    aboutText3:"Their answer is simple: create a world without magic.", cardTitle:"THE BEGINNING", cardText:"Enzan's journey begins on an island that became his only home.",
    worldLabel:"THE WORLD", worldTitle:"Four islands.", island1Title:"WATER ISLAND", island1Text:"A land where water and ice abilities shape everyday life.",
    island2Title:"NINJA ISLAND", island2Text:"A society without magic, built on discipline and training.", island3Title:"JUNGLE ISLAND", island3Text:"A mysterious land filled with nature, healing and ancient knowledge.",
    island4Title:"THE EMPTY ISLAND", island4Text:"An abandoned battlefield where warriors once fought for their islands.", volumeLabel:"VOLUME 01", volumeTitle:"The Beginning",
    volumeDescription:"The first chapter of Enzairo's journey. Discover the world and take the first step into the unknown.", pagesLabel:"PAGES", chapterLabel:"CHAPTER", readNow:"READ NOW",
    finalLabel:"THE JOURNEY BEGINS", startReading:"START READING", footer:"An original manga project.", readerVolume:"VOLUME 01", readerBeginning:"THE BEGINNING",
    reading:"READING VOLUME 01", first:"FIRST", last:"LAST", readerHint:"Use the arrows or your keyboard to turn the pages."
  },
  he: {
    navAbout:"אודות", navWorld:"העולם", navVolume:"כרך 1", official:"פרויקט מנגה מקורי", heroSubtitle:"ארבעה איים. ארבע תרבויות. עולם אחד שנמצא על סף שינוי.",
    readVolume:"קרא את כרך 1", explore:"גלה את העולם", scroll:"גלול כדי לגלות", aboutLabel:"אודות המנגה", aboutTitle:"עולם המחולק לפי כוח.",
    aboutText1:"Enzairo מתרחשת בעולם המחולק לארבעה איים, כאשר לכל אי תרבות, יכולות והיסטוריה משלו.",
    aboutText2:"במשך דורות, אנשים שנולדו עם יכולות מיוחדות עיצבו את העולם. אך קבוצה אחת מאמינה שהכוחות האלה הם המקור לכל המלחמות.",
    aboutText3:"הפתרון שלהם פשוט: ליצור עולם ללא קסם.", cardTitle:"ההתחלה", cardText:"המסע של אנזן מתחיל באי שהפך לבית היחיד שהיה מוכן לקבל אותו.", worldLabel:"העולם", worldTitle:"ארבעה איים.",
    island1Title:"אי המים", island1Text:"אי שבו יכולות המים והקרח הן חלק מרכזי מחיי התושבים.", island2Title:"אי הנינג'ות", island2Text:"חברה ללא קסם, המבוססת על אימונים, משמעת ונחישות.",
    island3Title:"אי הג'ונגל", island3Text:"אי מסתורי המלא בטבע, ריפוי וידע עתיק.", island4Title:"האי הריק", island4Text:"שדה קרב נטוש שבו לוחמים מכל האיים נלחמו בעבר.",
    volumeLabel:"כרך 01", volumeTitle:"ההתחלה", volumeDescription:"הצ'אפטר הראשון במסע של אנזאירו. גלה את העולם וצעד איתו אל הלא נודע.", pagesLabel:"עמודים", chapterLabel:"צ'אפטר", readNow:"קרא עכשיו",
    finalLabel:"המסע מתחיל", startReading:"התחל לקרוא", footer:"פרויקט מנגה מקורי.", readerVolume:"כרך 01", readerBeginning:"ההתחלה", reading:"קורא את כרך 01", first:"ראשון", last:"אחרון", readerHint:"השתמש בחצים או במקלדת כדי לדפדף בין העמודים."
  }
};

const STORAGE_KEY = "enzairo-language";
let currentLanguage = "en";
try { const saved = localStorage.getItem(STORAGE_KEY); if (saved === "en" || saved === "he") currentLanguage = saved; } catch (_) {}

function applyLanguage() {
  const data = translations[currentLanguage];
  document.documentElement.lang = currentLanguage;
  document.documentElement.dir = currentLanguage === "he" ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const value = data[el.dataset.i18n];
    if (value !== undefined) el.textContent = value;
  });
  const button = document.getElementById("languageBtn");
  if (button) {
    button.textContent = currentLanguage === "en" ? "עברית" : "English";
    button.setAttribute("aria-label", currentLanguage === "en" ? "Switch to Hebrew" : "Switch to English");
  }
  try { localStorage.setItem(STORAGE_KEY, currentLanguage); } catch (_) {}
}

function toggleLanguage() {
  currentLanguage = currentLanguage === "en" ? "he" : "en";
  applyLanguage();
}

function initReveal() {
  const elements = document.querySelectorAll(".reveal");
  if (!elements.length) return;
  if (!("IntersectionObserver" in window)) { elements.forEach(el => el.classList.add("visible")); return; }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); } });
  }, { threshold: 0.08, rootMargin: "0px 0px -30px 0px" });
  elements.forEach(el => observer.observe(el));
}

function initNavbar() {
  const navbar = document.querySelector(".navbar");
  const links = [...document.querySelectorAll('.navbar nav a[href^="#"]')];
  if (!navbar && !links.length) return;
  const update = () => {
    if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 24);
    const y = window.scrollY + 180;
    let active = "";
    links.forEach(link => { const section = document.querySelector(link.getAttribute("href")); if (section && section.offsetTop <= y) active = link.getAttribute("href"); });
    links.forEach(link => link.classList.toggle("active", link.getAttribute("href") === active));
  };
  update(); window.addEventListener("scroll", update, { passive: true });
}

function initParallax() {
  const character = document.querySelector(".hero-character");
  if (!character || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let raf = 0;
  window.addEventListener("mousemove", e => {
    if (window.innerWidth < 900) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const x = (e.clientX / window.innerWidth - 0.5) * 10;
      const y = (e.clientY / window.innerHeight - 0.5) * 6;
      character.style.transform = `translate3d(${x}px,${y}px,0)`;
    });
  }, { passive: true });
}

function initReader() {
  const mangaPage = document.getElementById("mangaPage");
  if (!mangaPage) return;

  const totalPages = 20;
  let currentPage = 1;
  let timer = null;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchMoved = false;

  const pageCounter = document.getElementById("pageCounter");
  const progressBar = document.getElementById("progressBar");
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");
  const firstBtn = document.getElementById("firstBtn");
  const lastBtn = document.getElementById("lastBtn");

  const pagePath = n => `pages/page ${n}.png`;

  // Only preload the nearby pages. Preloading all 20 large manga images can freeze low-memory devices.
  const preload = n => {
    if (n < 1 || n > totalPages) return;
    const img = new Image(); img.src = pagePath(n);
  };

  function updateUI() {
    if (pageCounter) pageCounter.textContent = `${currentPage} / ${totalPages}`;
    if (progressBar) progressBar.style.width = `${(currentPage / totalPages) * 100}%`;
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
  }

  function loadPage(page, instant = false) {
    const nextPage = Math.max(1, Math.min(totalPages, Number(page) || 1));
    if (nextPage === currentPage && mangaPage.getAttribute("src") === pagePath(currentPage)) { updateUI(); return; }
    currentPage = nextPage;
    clearTimeout(timer);
    const change = () => {
      mangaPage.classList.add("page-changing");
      const newSrc = pagePath(currentPage);
      const probe = new Image();
      probe.onload = () => {
        mangaPage.src = newSrc;
        mangaPage.alt = `Manga page ${currentPage}`;
        mangaPage.classList.remove("page-changing");
      };
      probe.onerror = () => {
        mangaPage.classList.remove("page-changing");
        console.error(`Could not load manga page: ${newSrc}`);
      };
      probe.src = newSrc;
      preload(currentPage - 1); preload(currentPage + 1);
      updateUI();
    };
    if (instant) change(); else timer = setTimeout(change, 80);
  }

  nextBtn?.addEventListener("click", () => loadPage(currentPage + 1));
  prevBtn?.addEventListener("click", () => loadPage(currentPage - 1));
  firstBtn?.addEventListener("click", () => loadPage(1));
  lastBtn?.addEventListener("click", () => loadPage(totalPages));

  document.addEventListener("keydown", e => {
    if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "PageDown") { e.preventDefault(); loadPage(currentPage + 1); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); loadPage(currentPage - 1); }
    else if (e.key === "Home") { e.preventDefault(); loadPage(1); }
    else if (e.key === "End") { e.preventDefault(); loadPage(totalPages); }
  });

  mangaPage.addEventListener("touchstart", e => {
    const t = e.changedTouches[0]; touchStartX = t.clientX; touchStartY = t.clientY; touchMoved = false;
  }, { passive: true });
  mangaPage.addEventListener("touchmove", e => {
    const t = e.changedTouches[0];
    if (Math.abs(t.clientX - touchStartX) > 12 || Math.abs(t.clientY - touchStartY) > 12) touchMoved = true;
  }, { passive: true });
  mangaPage.addEventListener("touchend", e => {
    const t = e.changedTouches[0]; const dx = t.clientX - touchStartX; const dy = t.clientY - touchStartY;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) loadPage(dx < 0 ? currentPage + 1 : currentPage - 1);
  }, { passive: true });

  // Desktop/mobile click navigation without double-triggering touch swipes.
  mangaPage.addEventListener("click", e => {
    if (window.innerWidth > 900 || touchMoved) return;
    const rect = mangaPage.getBoundingClientRect();
    loadPage(e.clientX < rect.left + rect.width / 2 ? currentPage - 1 : currentPage + 1);
  });

  mangaPage.addEventListener("dragstart", e => e.preventDefault());
  mangaPage.addEventListener("contextmenu", e => { if (window.innerWidth <= 900) e.preventDefault(); });
  mangaPage.addEventListener("error", () => console.error("Manga image failed to load:", mangaPage.src));
  preload(2);
  updateUI();
}

document.addEventListener("DOMContentLoaded", () => {
  applyLanguage();
  document.getElementById("languageBtn")?.addEventListener("click", toggleLanguage);
  initReveal();
  initNavbar();
  initParallax();
  initReader();
});
