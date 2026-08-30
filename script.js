/* =========================================================
   ENZAIRO MANGA — script.js
   Sections:
   1. i18n (Hebrew default / English) dictionary + translator
   2. Site data layer (localStorage-backed "database")
   3. Public rendering (hero, about, volumes, reviews)
   4. Toast notifications (one reused element)
   5. "Enter Book" — full-screen manga reader (RTL paging)
   6. Review submission
   7. Admin authentication
   8. Admin dashboard (hero/about/volume management)
   9. Image handling (FileReader + canvas compression)
   10. Nav + scroll reveal + bootstrap
   ========================================================= */

// Runs fn() and swallows/logs any error instead of letting it bubble up and
// abort the rest of the bootstrap sequence. Without this, a single bad
// call (e.g. corrupted localStorage data) would throw during DOMContentLoaded
// and every init*() call listed AFTER it would simply never run — which is
// exactly what a "frozen page with dead buttons" looks like from the outside.
function safeInit(fn, label) {
  try {
    fn();
  } catch (err) {
    console.error(`[Enzairo] "${label}" failed to initialize:`, err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  safeInit(loadSiteData, 'loadSiteData');
  safeInit(() => applyLanguage(currentLang), 'applyLanguage'); // sets dir/lang + translates static text
  safeInit(renderHero, 'renderHero');
  safeInit(renderAbout, 'renderAbout');
  safeInit(renderVolumes, 'renderVolumes');
  safeInit(renderReviews, 'renderReviews');

  safeInit(initNav, 'initNav');
  safeInit(initIsraelClock, 'initIsraelClock');
  safeInit(initVolumesGrid, 'initVolumesGrid'); // ONE delegated click listener for all volume cards
  safeInit(initVolumeDetails, 'initVolumeDetails');
  safeInit(initReader, 'initReader');
  safeInit(initReviewForm, 'initReviewForm');
  safeInit(initAdminAuth, 'initAdminAuth');
  safeInit(initAdminDashboard, 'initAdminDashboard');
  safeInit(initScrollReveal, 'initScrollReveal');

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});



/* =========================================================
   1. I18N
   ---------------------------------------------------------
   Only STATIC chrome text (nav, buttons, section titles,
   labels, messages) is translated. Content the admin types
   in (hero title/subtitle, about text, volume titles/
   descriptions, review text) is left exactly as entered.
   ========================================================= */

let currentLang = 'he'; // Hebrew is the default language per spec

const translations = {
  he: {
    nav_home: 'בית', nav_about: 'על המנגה', nav_volumes: 'כרכים', nav_reviews: 'ביקורות',
    hero_eyebrow: 'כעת בפרסום', hero_badge: 'מומלץ',
    hero_btn_start: 'התחל לקרוא', hero_btn_about: 'על המנגה',
    about_eyebrow: '01 — על המנגה', about_title: 'על המנגה',
    volumes_eyebrow: '02 — הספרייה', volumes_title: 'כרכים',
    volumes_sub: 'כל הכרכים שיצאו לאור עד כה. לחצו על כרך כדי להיכנס אליו.',
    volumes_enter: 'היכנס לספר', volumes_locked: 'נעול', volumes_pages: 'עמודים', volumes_vol_prefix: 'כרך',
    reader_locked_msg: 'הכרך הזה נעול כרגע.',
    reader_empty: 'טרם הועלו עמודים לכרך זה.',
    reader_hint: 'לחצו או החליקו בצד שמאל לעמוד הבא, ובצד ימין לעמוד הקודם',
    reader_page_of: 'עמוד {n} מתוך {total}',
    reader_close_label: 'סגור קורא', reader_next_label: 'עמוד הבא', reader_prev_label: 'עמוד קודם',
    volume_details_title: 'פרטי הכרך', volume_details_pages: 'עמודים זמינים', volume_details_open: 'פתח עמוד', volume_details_no_pages: 'אין עדיין עמודים בכרך זה.', volume_details_close: 'סגור פרטי כרך',
    reviews_eyebrow: '03 — קול הקוראים', reviews_title: 'ביקורות',
    reviews_empty: 'אין עדיין ביקורות — היו הראשונים לכתוב אחת!',
    reviews_form_title: 'השאירו ביקורת',
    reviews_label_name: 'שם', reviews_label_volume: 'כרך', reviews_label_text: 'ביקורת',
    reviews_placeholder_name: 'השם שלך', reviews_placeholder_text: 'מה חשבתם?',
    reviews_submit: 'פרסם ביקורת',
    reviews_success: 'תודה — הביקורת שלך פורסמה!',
    footer_note: 'אתר הדגמה שנבנה לצורכי תיק עבודות. כל השמות בדיוניים.',
    footer_admin: 'ניהול', footer_rights: 'כל הזכויות שמורות.',
    admin_eyebrow: 'גישת ניהול', admin_login_title: 'התחברות',
    admin_login_sub: 'כל אימייל תקין להדגמה — הסיסמה היא מה שקובע.',
    admin_label_email: 'אימייל', admin_label_password: 'סיסמה',
    admin_placeholder_password: 'הזן סיסמה',
    admin_error: 'סיסמה שגויה. נסה שוב.',
    admin_unlock_btn: 'כניסה לפאנל הניהול',
    admin_dashboard_title: 'חדר הבקרה של אנזאירו', admin_logout: 'התנתק',
    admin_tab_hero: 'עמוד הבית', admin_tab_about: 'על המנגה', admin_tab_volumes: 'כרכים',
    admin_hero_title_label: 'כותרת ראשית', admin_hero_subtitle_label: 'תת-כותרת',
    admin_hero_image_label: 'כתובת URL לתמונת הבית', admin_upload_label: 'או העלה תמונה מהמחשב',
    admin_save_btn: 'שמור שינויים',
    admin_about_text_label: 'טקסט על המנגה', admin_about_image_label: 'כתובת URL לתמונה',
    admin_volumes_existing: 'כרכים קיימים', admin_volumes_add_new: '+ כרך חדש',
    admin_edit: 'ערוך', admin_delete: 'מחק',
    admin_form_title_new: 'הוסף כרך חדש', admin_form_title_edit: 'עריכת כרך',
    admin_label_vol_number: 'מספר כרך', admin_label_vol_title: 'כותרת',
    admin_label_vol_desc: 'תיאור', admin_label_vol_cover: 'כתובת URL לעטיפה',
    admin_label_vol_pages: 'עמודי הכרך (הוסיפו כל עמוד ידנית)',
    admin_add_page_url_placeholder: 'הדבק כתובת URL לעמוד', admin_add_page_url_btn: 'הוסף עמוד',
    admin_upload_pages_label: 'או העלה תמונות עמוד (ניתן לבחור כמה יחד)',
    admin_locked_label: 'נעל כרך זה',
    admin_save_volume_btn: 'שמור כרך', admin_cancel_edit_btn: 'בטל',
    admin_no_volumes: 'אין עדיין כרכים.',
    admin_confirm_delete: 'למחוק את הכרך?',
    pages_empty_note: 'לא נוספו עדיין עמודים.',
    toast_hero_saved: 'עמוד הבית עודכן בהצלחה.',
    toast_about_saved: 'קטע "על המנגה" עודכן בהצלחה.',
    toast_volume_saved: 'הכרך נשמר בהצלחה.',
    toast_volume_deleted: 'הכרך נמחק.',
    toast_locked_click: 'הכרך הזה נעול על ידי הצוות.',
    toast_processing: 'מעבד תמונה...',
    toast_image_ready: 'התמונה מוכנה.',
    toast_image_error: 'העלאת התמונה נכשלה. נסו קובץ אחר.',
    toast_pages_added: 'נוספו {n} עמודים.',
    toast_storage_full: 'האחסון המקומי מלא. נסו תמונות קטנות יותר או מחקו תוכן ישן.',
    toast_save_error: 'משהו השתבש בשמירה. נסו שוב.',
    toast_missing_fields: 'נא להוסיף כותרת ותמונת עטיפה לכרך.'
  },
  en: {
    nav_home: 'Home', nav_about: 'About', nav_volumes: 'Volumes', nav_reviews: 'Reviews',
    hero_eyebrow: 'Now Publishing', hero_badge: 'Featured',
    hero_btn_start: 'Start Reading', hero_btn_about: 'About the Manga',
    about_eyebrow: '01 — About the Manga', about_title: 'About the Manga',
    volumes_eyebrow: '02 — The Library', volumes_title: 'Volumes',
    volumes_sub: 'Every volume published so far. Click a volume to enter it.',
    volumes_enter: 'Enter Book', volumes_locked: 'Locked', volumes_pages: 'pages', volumes_vol_prefix: 'Vol.',
    reader_locked_msg: 'This volume is currently locked.',
    reader_empty: 'No pages have been uploaded for this volume yet.',
    reader_hint: 'Tap or swipe left for the next page, right for the previous page',
    reader_page_of: 'Page {n} of {total}',
    reader_close_label: 'Close reader', reader_next_label: 'Next page', reader_prev_label: 'Previous page',
    volume_details_title: 'Volume Details', volume_details_pages: 'Available Pages', volume_details_open: 'Open Page', volume_details_no_pages: 'No pages have been added to this volume yet.', volume_details_close: 'Close volume details',
    reviews_eyebrow: '03 — Reader Voices', reviews_title: 'Reviews',
    reviews_empty: 'No reviews yet — be the first to write one!',
    reviews_form_title: 'Leave a Review',
    reviews_label_name: 'Name', reviews_label_volume: 'Volume', reviews_label_text: 'Review',
    reviews_placeholder_name: 'Your name', reviews_placeholder_text: 'What did you think?',
    reviews_submit: 'Post Review',
    reviews_success: 'Thanks — your review has been posted!',
    footer_note: 'A demo site built for portfolio purposes. All names are fictional.',
    footer_admin: 'Admin', footer_rights: 'All rights reserved.',
    admin_eyebrow: 'Admin Access', admin_login_title: 'Sign In',
    admin_login_sub: 'Any email works for this demo — the passcode is what matters.',
    admin_label_email: 'Email', admin_label_password: 'Password',
    admin_placeholder_password: 'Enter passcode',
    admin_error: 'Incorrect password. Try again.',
    admin_unlock_btn: 'Unlock Admin Panel',
    admin_dashboard_title: 'Enzairo Control Room', admin_logout: 'Log Out',
    admin_tab_hero: 'Home (Hero)', admin_tab_about: 'About Section', admin_tab_volumes: 'Volumes',
    admin_hero_title_label: 'Hero Title', admin_hero_subtitle_label: 'Subtitle',
    admin_hero_image_label: 'Hero Cover Image URL', admin_upload_label: 'Or upload an image',
    admin_save_btn: 'Save Changes',
    admin_about_text_label: 'About Text', admin_about_image_label: 'Image URL',
    admin_volumes_existing: 'Existing Volumes', admin_volumes_add_new: '+ New Volume',
    admin_edit: 'Edit', admin_delete: 'Delete',
    admin_form_title_new: 'Add New Volume', admin_form_title_edit: 'Editing Volume',
    admin_label_vol_number: 'Volume Number', admin_label_vol_title: 'Title',
    admin_label_vol_desc: 'Description', admin_label_vol_cover: 'Cover Image URL',
    admin_label_vol_pages: 'Volume Pages (add every page manually)',
    admin_add_page_url_placeholder: 'Paste a page image URL', admin_add_page_url_btn: 'Add Page',
    admin_upload_pages_label: 'Or upload one or more page images',
    admin_locked_label: 'Lock this volume',
    admin_save_volume_btn: 'Save Volume', admin_cancel_edit_btn: 'Cancel',
    admin_no_volumes: 'No volumes yet.',
    admin_confirm_delete: 'Delete this volume?',
    pages_empty_note: 'No pages added yet.',
    toast_hero_saved: 'Home section updated successfully.',
    toast_about_saved: 'About section updated successfully.',
    toast_volume_saved: 'Volume saved successfully.',
    toast_volume_deleted: 'Volume deleted.',
    toast_locked_click: 'This volume is locked by the team.',
    toast_processing: 'Processing image…',
    toast_image_ready: 'Image ready.',
    toast_image_error: 'Failed to upload image. Try a different file.',
    toast_pages_added: '{n} page(s) added.',
    toast_storage_full: 'Local storage is full. Try smaller images or remove old content.',
    toast_save_error: 'Something went wrong while saving. Please try again.',
    toast_missing_fields: 'Please add a title and a cover image for the volume.'
  }
};

const CONTENT_TRANSLATIONS = {
  'להב לא יכול לבחור את הפצע שלו. הוא יכול רק לבחור מה הוא מגן עליו.': 'A blade cannot choose its wound. It can only choose what it protects.',
  'אנזאירו מספרת את סיפורם של קסין, צייר חצר שאיבד את מעמדו כשהדיו שלו החל לצייר עתידות שטרם קרו, ורייו, רונין שנשבע לחסל שושלת שכבר אינה קיימת. קללה שאף אחד מהם לא ביקש קושרת ביניהם — וסוד שעלול לערער את היציבות השברירית של האימפריה.\n\nבעזרת קווי מכחול חדים ופריימינג קצבי, אנזאירו זכתה לשבחים על היחס הרציני שהיא נותנת לשתיקה, ממש כמו לקרבות החרב.': 'Enzairo tells the story of Kasin, a court painter who loses his status when his ink begins painting futures that have not happened, and Riyo, a ronin sworn to destroy a dynasty that no longer exists. A curse neither of them asked for binds them together — along with a secret that could shatter the empire’s fragile stability.\n\nWith sharp brushwork and rhythmic framing, Enzairo has earned praise for treating silence with the same weight as its sword fights.',
  'הצייר שהדיו שלו דימם': 'The Painter Whose Ink Bled',
  'קסין מאבד את מעמדו בחצר בלילה שבו המכחול שלו מתחיל לצייר דברים שטרם קרו — ואחד מהם הוא מותו שלו.': 'Kasin loses his standing at court on the night his brush begins painting things that have not happened yet — and one of them is his own death.',
  'דרך האפר': 'Path of Ash',
  'גולים ונרדפים, קסין ורייו חוצים את הפרובינציות השרופות, שם הקללה שקושרת ביניהם מתחילה לחשוף את הצד השני שלה.': 'Exiled and hunted, Kasin and Riyo cross the scorched provinces, where the curse binding them begins to reveal its other side.',
  'חצר תשעת החותמות': 'The Court of Nine Seals',
  'הזמנה לגלריה השמורה ביותר בבירה מסתירה מלכודת שתוכננה שבע שנים מראש.': 'An invitation to the most guarded gallery in the capital hides a trap planned seven years in advance.',
  'פנקס הרונין': 'The Ronin Ledger',
  'עברה של רייו תופס אותה בדמות חוב שכתוב בשפה שרק סייפי חרב מתים יכלו לקרוא.': 'Riyo’s past catches up with her in the form of a debt written in a language only dead swordsmen could read.',
  'אימפריה של דיו רטוב': 'Empire of Wet Ink',
  'ייתכן שהכס עצמו נבנה על ציור מזויף — וקסין הוא האדם היחיד בחיים שיכול להוכיח זאת.': 'The throne itself may have been built on a forged painting — and Kasin is the only living person who can prove it.'
};

function localizedContent(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value[currentLang] ?? value.he ?? value.en ?? '';
  }
  if (currentLang === 'en' && Object.prototype.hasOwnProperty.call(CONTENT_TRANSLATIONS, value)) {
    return CONTENT_TRANSLATIONS[value];
  }
  return value ?? '';
}

function setLocalizedField(obj, field, value) {
  const old = obj[field];
  if (old && typeof old === 'object' && !Array.isArray(old)) {
    obj[field] = { he: old.he ?? '', en: old.en ?? '' };
  } else {
    obj[field] = { he: String(old ?? ''), en: CONTENT_TRANSLATIONS[old] ?? String(old ?? '') };
  }
  obj[field][currentLang] = value;
}

function t(key, replacements) {
  let str = translations[currentLang][key] ?? key;
  if (replacements) {
    Object.keys(replacements).forEach(token => { str = str.replace(`{${token}}`, replacements[token]); });
  }
  return str;
}

function applyLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key] !== undefined) el.textContent = translations[lang][key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[lang][key] !== undefined) el.placeholder = translations[lang][key];
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria-label');
    if (translations[lang][key] !== undefined) el.setAttribute('aria-label', translations[lang][key]);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (translations[lang][key] !== undefined) el.setAttribute('title', translations[lang][key]);
  });

  const langToggle = document.getElementById('langToggle');
  if (langToggle) langToggle.textContent = lang === 'he' ? 'EN' : 'עב';

  updateReaderChevronLabels();

  // Re-render the pieces that mix static words with live data (e.g. "12 pages", "Vol. 3")
  renderVolumes();
  renderReviews();
  renderAdminVolumesList();
}


/* =========================================================
   2. SITE DATA LAYER — the "database"
   ---------------------------------------------------------
   Everything the admin can edit lives in one object, persisted
   to localStorage under STORAGE_KEY. Public render functions
   always read from this object, so saving a change in the
   Admin Panel and calling the matching render*() function
   updates the live site instantly — no page reload.
   ========================================================= */

const STORAGE_KEY = 'enzairo_site_data_v3';

const DEFAULT_DATA = {
  hero: {
    title: 'ENZAIRO',
    subtitle: 'להב לא יכול לבחור את הפצע שלו. הוא יכול רק לבחור מה הוא מגן עליו.',
    image: ''
  },
  about: {
    text: 'אנזאירו מספרת את סיפורם של קסין, צייר חצר שאיבד את מעמדו כשהדיו שלו החל לצייר עתידות שטרם קרו, ורייו, רונין שנשבע לחסל שושלת שכבר אינה קיימת. קללה שאף אחד מהם לא ביקש קושרת ביניהם — וסוד שעלול לערער את היציבות השברירית של האימפריה.\n\nבעזרת קווי מכחול חדים ופריימינג קצבי, אנזאירו זכתה לשבחים על היחס הרציני שהיא נותנת לשתיקה, ממש כמו לקרבות החרב.',
    image: ''
  },
  volumes: [
    {
      id: 'v2', number: 2, title: 'דרך האפר',
      description: 'גולים ונרדפים, קסין ורייו חוצים את הפרובינציות השרופות, שם הקללה שקושרת ביניהם מתחילה לחשוף את הצד השני שלה.',
      cover: 'https://picsum.photos/seed/enzairo-vol2/400/560',
      pages: [
        'https://picsum.photos/seed/enzairo-vol2-p1/900/1300',
        'https://picsum.photos/seed/enzairo-vol2-p2/900/1300'
      ],
      locked: false
    },
    {
      id: 'v3', number: 3, title: 'חצר תשעת החותמות',
      description: 'הזמנה לגלריה השמורה ביותר בבירה מסתירה מלכודת שתוכננה שבע שנים מראש.',
      cover: 'https://picsum.photos/seed/enzairo-vol3/400/560',
      pages: [
        'https://picsum.photos/seed/enzairo-vol3-p1/900/1300',
        'https://picsum.photos/seed/enzairo-vol3-p2/900/1300',
        'https://picsum.photos/seed/enzairo-vol3-p3/900/1300'
      ],
      locked: false
    },
    {
      id: 'v4', number: 4, title: 'פנקס הרונין',
      description: 'עברה של רייו תופס אותה בדמות חוב שכתוב בשפה שרק סייפי חרב מתים יכלו לקרוא.',
      cover: 'https://picsum.photos/seed/enzairo-vol4/400/560',
      pages: [],
      locked: true
    },
    {
      id: 'v5', number: 5, title: 'אימפריה של דיו רטוב',
      description: 'ייתכן שהכס עצמו נבנה על ציור מזויף — וקסין הוא האדם היחיד בחיים שיכול להוכיח זאת.',
      cover: 'https://picsum.photos/seed/enzairo-vol5/400/560',
      pages: [],
      locked: true
    }
  ],
  reviews: [] // starts completely empty — no mock/placeholder reviews, ever
};

let siteData = null;

// Guards against partial/corrupt localStorage data (e.g. left over from an
// older version of the site, or truncated by a previous quota error).
// Without this, a missing field like `volumes` would make renderVolumes()
// throw "Cannot read properties of undefined" during bootstrap — which,
// being synchronous and un-caught, used to abort every init call queued
// after it. That's the "everything looks frozen" bug class.
function normalizeSiteData(data) {
  const fallback = JSON.parse(JSON.stringify(DEFAULT_DATA));
  if (!data || typeof data !== 'object') return fallback;

  const hero = (data.hero && typeof data.hero === 'object') ? { ...fallback.hero, ...data.hero } : fallback.hero;
  const about = (data.about && typeof data.about === 'object') ? { ...fallback.about, ...data.about } : fallback.about;

  const volumes = Array.isArray(data.volumes)
    ? data.volumes.map((v, i) => ({
        id: v && v.id ? String(v.id) : `v${Date.now()}${i}`,
        number: (v && Number(v.number)) || i + 1,
        title: (v && v.title) || '',
        description: (v && v.description) || '',
        cover: (v && v.cover) || '',
        pages: (v && Array.isArray(v.pages)) ? v.pages : [],
        locked: !!(v && v.locked)
      }))
    : fallback.volumes;

  // Reviews NEVER fall back to seeded/mock data — an empty or invalid
  // array always normalizes to a genuinely empty list, per spec.
  const reviews = Array.isArray(data.reviews)
    ? data.reviews.filter(r => r && typeof r.name === 'string' && (typeof r.text === 'string' || (r.text && typeof r.text === 'object')))
    : [];

  // Upgrade editable text to bilingual values while keeping all existing data intact.
  [hero, about].forEach(section => {
    ['title', 'subtitle', 'text'].forEach(field => {
      if (section[field] !== undefined && typeof section[field] !== 'object') {
        section[field] = { he: String(section[field]), en: CONTENT_TRANSLATIONS[section[field]] ?? String(section[field]) };
      }
    });
  });
  volumes.forEach(vol => {
    ['title', 'description'].forEach(field => {
      if (typeof vol[field] !== 'object') vol[field] = { he: String(vol[field] ?? ''), en: CONTENT_TRANSLATIONS[vol[field]] ?? String(vol[field] ?? '') };
    });
  });

  return { hero, about, volumes, reviews };
}

function loadSiteData() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      siteData = normalizeSiteData(JSON.parse(stored));
      return;
    } catch (err) {
      console.error('[Enzairo] Corrupt data in localStorage, resetting to defaults:', err);
    }
  }
  siteData = JSON.parse(JSON.stringify(DEFAULT_DATA)); // deep clone, never mutate DEFAULT_DATA
  saveSiteData();
}

// Persists siteData to localStorage. CRITICAL: this never throws. Base64
// images can be large, and `localStorage.setItem` throws a QuotaExceededError
// once the browser's storage limit (usually ~5-10MB) is hit. If that error
// were left uncaught, it would abort the REST of whatever submit handler
// called saveSiteData() — skipping the re-render and any success/failure
// feedback, which looks exactly like "clicking Save does nothing". Catching
// it here means every caller always keeps running and the admin always gets
// a toast telling them what happened.
function saveSiteData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(siteData));
    return true;
  } catch (err) {
    console.error('[Enzairo] Failed to save to localStorage:', err);
    const isQuotaError = err && (
      err.name === 'QuotaExceededError' ||
      err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err.code === 22 ||
      err.code === 1014
    );
    showToast(isQuotaError ? t('toast_storage_full') : t('toast_save_error'));
    return false;
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}


/* =========================================================
   3. PUBLIC RENDERING
   ========================================================= */

function renderHero() {
  document.getElementById('heroTitle').textContent = localizedContent(siteData.hero.title);
  document.getElementById('heroSubtitle').textContent = localizedContent(siteData.hero.subtitle);
  document.getElementById('heroImage').src = siteData.hero.image;
}

function renderAbout() {
  document.getElementById('aboutText').textContent = localizedContent(siteData.about.text);
  document.getElementById('aboutImage').src = siteData.about.image;
}

function renderVolumes() {
  const grid = document.getElementById('volumesGrid');
  const volumeSelect = document.getElementById('reviewVolume');

  // Build every card's HTML in one string and assign innerHTML ONCE —
  // far fewer reflows than appending nodes one at a time in a loop.
  grid.innerHTML = siteData.volumes.map(vol => {
    const title = localizedContent(vol.title);
    const description = localizedContent(vol.description);
    const label = `${t('volumes_vol_prefix')} ${vol.number} — ${escapeHtml(title)}`;
    return `
    <article class="volume-card reveal ${vol.locked ? 'is-locked' : ''}" data-volume-id="${vol.id}" tabindex="0" role="button" aria-label="${label}">
      <div class="volume-cover">
        <img src="${vol.cover}" alt="${escapeHtml(title)}" loading="lazy" />
        <span class="volume-num">${t('volumes_vol_prefix')} ${String(vol.number).padStart(2, '0')}</span>
        ${vol.locked ? `<div class="volume-lock-badge">🔒</div>` : ''}
      </div>
      <div class="volume-body">
        <h3 class="volume-title">${escapeHtml(title)}</h3>
        <p class="volume-desc">${escapeHtml(description)}</p>
        <div class="volume-meta">
          <span>${vol.pages.length} ${t('volumes_pages')}</span>
          <span>${label}</span>
        </div>
        <span class="btn ${vol.locked ? 'volume-enter-btn is-locked' : 'btn-primary volume-enter-btn'}">
          ${vol.locked ? '🔒 ' + t('volumes_locked') : t('volumes_enter')}
        </span>
      </div>
    </article>`;
  }).join('');
  observeRevealElements(grid);

  // Keep the review form's volume dropdown in sync with the current volume list
  if (volumeSelect) {
    const previousValue = volumeSelect.value;
    volumeSelect.innerHTML = siteData.volumes.map(vol => {
      const value = `${t('volumes_vol_prefix')} ${vol.number} — ${escapeHtml(localizedContent(vol.title))}`;
      return `<option value="${value}">${value}</option>`;
    }).join('');
    if ([...volumeSelect.options].some(o => o.value === previousValue)) {
      volumeSelect.value = previousValue;
    }
  }
}

/* ---- Event delegation for the volumes grid ----
   ONE listener, attached once at startup, handles clicks AND
   keyboard activation for every current and future volume card.
   This avoids re-binding a listener per card on every re-render,
   which is what keeps the grid fast no matter how many volumes exist. */
function initVolumesGrid() {
  const grid = document.getElementById('volumesGrid');

  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.volume-card');
    if (!card) return;
    handleVolumeCardActivate(card);
  });

  // Keyboard accessibility: Enter/Space activates a focused card
  grid.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.volume-card');
    if (!card) return;
    e.preventDefault();
    handleVolumeCardActivate(card);
  });
}

function handleVolumeCardActivate(card) {
  const vol = siteData.volumes.find(v => v.id === card.dataset.volumeId);
  if (!vol) return;

  if (vol.locked) {
    showToast(t('toast_locked_click'));
    card.classList.add('shake-once');
    setTimeout(() => card.classList.remove('shake-once'), 350);
    return;
  }
  openVolumeDetails(vol);
}


/* =========================================================
   4. TOAST — one reused DOM element for all feedback messages
   ========================================================= */

let toastTimeout = null;

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('visible'), 2600);
}


/* =========================================================
   5. VOLUME DETAILS — intermediate page/chapter selection
   ---------------------------------------------------------
   Clicking an unlocked volume opens this lightweight modal first.
   The reader only starts after the user chooses a specific page.
   Locked volumes never reach this screen.
   ========================================================= */

let detailsVolumeId = null;

function initVolumeDetails() {
  const modal = document.getElementById('volumeDetailsView');
  if (!modal) return;

  document.getElementById('closeVolumeDetailsBtn')?.addEventListener('click', closeVolumeDetails);
  modal.addEventListener('click', (e) => {
    if (e.target.closest('[data-close-volume-details]')) closeVolumeDetails();

    const pageButton = e.target.closest('.volume-page-choice');
    if (!pageButton) return;

    const volume = siteData.volumes.find(v => v.id === detailsVolumeId);
    const pageIndex = Number(pageButton.dataset.pageIndex);
    if (!volume || volume.locked || !Number.isInteger(pageIndex) || !volume.pages[pageIndex]) return;

    closeVolumeDetails(false);
    openReader(volume, pageIndex);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!modal.classList.contains('hidden')) closeVolumeDetails();
  });
}

function openVolumeDetails(volume) {
  if (!volume || volume.locked) {
    if (volume?.locked) showToast(t('toast_locked_click'));
    return;
  }

  const modal = document.getElementById('volumeDetailsView');
  if (!modal) return;

  detailsVolumeId = volume.id;
  document.getElementById('volumeDetailsCover').src = volume.cover || '';
  document.getElementById('volumeDetailsCover').alt = localizedContent(volume.title);
  document.getElementById('volumeDetailsTitle').textContent = `${t('volumes_vol_prefix')} ${volume.number} — ${localizedContent(volume.title)}`;
  document.getElementById('volumeDetailsDescription').textContent = localizedContent(volume.description);
  document.getElementById('volumeDetailsPagesLabel').textContent = t('volume_details_pages');

  const grid = document.getElementById('volumePagesGrid');
  if (!volume.pages.length) {
    grid.innerHTML = `<p class="volume-details-empty">${t('volume_details_no_pages')}</p>`;
  } else {
    grid.innerHTML = volume.pages.map((src, index) => `
      <button class="volume-page-choice" type="button" data-page-index="${index}" aria-label="${escapeHtml(t('volume_details_open'))} ${index + 1}">
        <span class="volume-page-thumb">
          <img src="${src}" alt="${escapeHtml(t('volumes_pages'))} ${index + 1}" loading="lazy" />
        </span>
        <span class="volume-page-number">${t('volumes_pages')} ${index + 1}</span>
      </button>
    `).join('');
  }

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('volume-details-open');
  requestAnimationFrame(() => document.getElementById('closeVolumeDetailsBtn')?.focus());
}

function closeVolumeDetails(restoreScroll = true) {
  const modal = document.getElementById('volumeDetailsView');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  detailsVolumeId = null;
  document.body.classList.remove('volume-details-open');
  if (restoreScroll && document.getElementById('readerView')?.classList.contains('hidden')) {
    document.body.style.overflow = '';
  }
}


/* =========================================================
   5. "ENTER BOOK" — FULL-SCREEN MANGA READER
   ---------------------------------------------------------
   HOW IT WORKS:
   Clicking a volume card (via the delegated grid listener above)
   calls openReader(volume), which shows the full-screen #readerView
   container and displays pages[0].

   READING DIRECTION (right-to-left, like a real manga):
   - The reader's stage is split into two invisible halves.
     Clicking/tapping the LEFT half calls nextPage().
     Clicking/tapping the RIGHT half calls prevPage().
   - The same rule applies to swipes: dragging a finger LEFT
     (negative deltaX) calls nextPage(); dragging RIGHT calls
     prevPage(). A `justSwiped` flag briefly suppresses the
     click handler right after a swipe so a single swipe gesture
     doesn't ALSO fire a click and double-advance the page.
   - Arrow keys mirror the same logic: ArrowLeft = next,
     ArrowRight = previous. Escape closes the reader.
   This direction is fixed by the manga's format — it does NOT
   change with the site's Hebrew/English UI language toggle.
   ========================================================= */

let readerPages = [];
let readerIndex = 0;

function initReader() {
  const stage = document.getElementById('readerStage');

  document.getElementById('closeReaderBtn').addEventListener('click', closeReader);

  // --- Click/tap navigation ---
  let justSwiped = false;

  stage.addEventListener('click', (e) => {
    if (justSwiped) return; // ignore the synthetic click that follows a swipe
    const rect = stage.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    if (clickX < rect.width / 2) {
      nextPage(); // left half → next page (RTL reading)
    } else {
      prevPage(); // right half → previous page
    }
  });

  // --- Swipe navigation (touch devices) ---
  let touchStartX = 0;
  const SWIPE_THRESHOLD = 40; // px — below this, treat it as a tap, not a swipe

  stage.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  stage.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const delta = touchEndX - touchStartX;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return; // treat as a tap; let the click handler run

    justSwiped = true;
    if (delta < 0) nextPage(); // swiped left → next page
    else prevPage();            // swiped right → previous page
    setTimeout(() => { justSwiped = false; }, 300);
  }, { passive: true });

  // --- Keyboard navigation while the reader is open ---
  document.addEventListener('keydown', (e) => {
    if (document.getElementById('readerView').classList.contains('hidden')) return;
    if (e.key === 'ArrowLeft') nextPage();
    else if (e.key === 'ArrowRight') prevPage();
    else if (e.key === 'Escape') closeReader();
  });
}

function openReader(volume, startIndex = 0) {
  readerPages = volume.pages || [];
  readerIndex = Math.min(Math.max(0, Number(startIndex) || 0), Math.max(0, readerPages.length - 1));
  document.getElementById('readerTitle').textContent = `${t('volumes_vol_prefix')} ${volume.number} — ${localizedContent(volume.title)}`;
  renderReaderPage();

  const view = document.getElementById('readerView');
  view.classList.remove('hidden');
  document.body.style.overflow = 'hidden'; // lock background scroll while reading

  const hint = document.getElementById('readerHint');
  hint.textContent = t('reader_hint');
  hint.classList.add('visible');
  clearTimeout(openReader._hintTimeout);
  openReader._hintTimeout = setTimeout(() => hint.classList.remove('visible'), 3200);
}

function closeReader() {
  document.getElementById('readerView').classList.add('hidden');
  document.body.style.overflow = '';
}

function nextPage() {
  if (readerIndex < readerPages.length - 1) {
    readerIndex++;
    renderReaderPage();
  }
}

function prevPage() {
  if (readerIndex > 0) {
    readerIndex--;
    renderReaderPage();
  }
}

function renderReaderPage() {
  const img = document.getElementById('readerImage');
  const emptyMsg = document.getElementById('readerEmptyMsg');
  const count = document.getElementById('readerCount');

  if (readerPages.length === 0) {
    img.classList.add('hidden');
    emptyMsg.textContent = t('reader_empty');
    emptyMsg.classList.remove('hidden');
    count.textContent = '';
    return;
  }

  emptyMsg.classList.add('hidden');
  img.classList.remove('hidden');
  img.src = readerPages[readerIndex];
  count.textContent = t('reader_page_of', { n: readerIndex + 1, total: readerPages.length });

  preloadNeighborPages();
}

// Warms the browser cache for the adjacent pages so paging feels instant
function preloadNeighborPages() {
  [readerPages[readerIndex - 1], readerPages[readerIndex + 1]].forEach(src => {
    if (src) { const img = new Image(); img.src = src; }
  });
}

function updateReaderChevronLabels() {
  const left = document.getElementById('readerChevronLeft');
  const right = document.getElementById('readerChevronRight');
  const close = document.getElementById('closeReaderBtn');
  if (left) left.setAttribute('aria-label', t('reader_next_label'));
  if (right) right.setAttribute('aria-label', t('reader_prev_label'));
  if (close) close.setAttribute('aria-label', t('reader_close_label'));
}


/* =========================================================
   6. REVIEWS
   ---------------------------------------------------------
   Reviews live in siteData.reviews (starts as an empty array —
   no seeded/mock reviews). Submissions are pushed into that
   array and persisted to localStorage immediately.
   ========================================================= */

function volumeLabelById(id) {
  const vol = siteData.volumes.find(v => v.id === id);
  return vol ? `${t('volumes_vol_prefix')} ${vol.number} — ${localizedContent(vol.title)}` : '';
}

function renderReviews() {
  const list = document.getElementById('reviewsList');

  if (siteData.reviews.length === 0) {
    list.innerHTML = `<div class="reviews-empty">${t('reviews_empty')}</div>`;
    return;
  }

  list.innerHTML = siteData.reviews.map(r => `
    <div class="review-card reveal">
      <div class="review-top">
        <span class="review-name">${escapeHtml(r.name)}</span>
        <span class="review-volume">${escapeHtml(r.volumeId ? volumeLabelById(r.volumeId) : localizedContent(r.volume))}</span>
      </div>
      <p class="review-text">"${escapeHtml(localizedContent(r.text))}"</p>
    </div>
  `).join('');
  observeRevealElements(list);
}

function initReviewForm() {
  const reviewForm = document.getElementById('reviewForm');
  const reviewSuccess = document.getElementById('reviewSuccess');

  reviewForm.addEventListener('submit', (e) => {
    e.preventDefault(); // critical: stop the browser from reloading the page

    try {
      const name = document.getElementById('reviewName').value.trim();
      const volume = document.getElementById('reviewVolume').value;
      const text = document.getElementById('reviewText').value.trim();
      if (!name || !text) return;

      const selectedVolume = siteData.volumes.find(v => `${t('volumes_vol_prefix')} ${v.number} — ${localizedContent(v.title)}` === volume);
      siteData.reviews.unshift({ name, volumeId: selectedVolume?.id || '', volume, text: { he: currentLang === 'he' ? text : '', en: currentLang === 'en' ? text : '' } });
      const saved = saveSiteData();
      renderReviews();
      reviewForm.reset();

      if (saved) {
        reviewSuccess.classList.remove('hidden');
        setTimeout(() => reviewSuccess.classList.add('hidden'), 2500);
      }
    } catch (err) {
      console.error('[Enzairo] Failed to submit review:', err);
      showToast(t('toast_save_error'));
    }
  });
}


/* =========================================================
   7. ADMIN AUTHENTICATION
   ---------------------------------------------------------
   How it works:
   - The Admin section starts LOCKED: only the login form
     (#adminLoginPanel) is visible, the dashboard is hidden.
   - On submit, e.preventDefault() stops the browser's default
     "submit and reload the page" behavior. We then read the
     password field and compare it against ONE hardcoded
     string: "4545". The email is only checked for "not empty" —
     any email is accepted as long as the password matches.
   - Correct password → hide the login panel, reveal the
     dashboard, remember the unlocked state for this browser
     tab via sessionStorage (so a reload during the same
     session doesn't ask again; closing the tab clears it).
   - Wrong password → inline error message + a quick shake;
     the view stays on the login form.
   This is a CLIENT-SIDE-ONLY demo — there's no server, so this
   is not real security, just the UX pattern for a gated area.
   ========================================================= */

const ADMIN_PASSWORD = '4545'; // <-- the only accepted password
const ADMIN_SESSION_KEY = 'enzairo_admin_authenticated';

function initAdminAuth() {
  const loginPanel = document.getElementById('adminLoginPanel');
  const dashboard = document.getElementById('adminDashboard');
  const loginForm = document.getElementById('adminLoginForm');
  const loginError = document.getElementById('adminLoginError');

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const password = document.getElementById('adminPassword').value;

    if (password === ADMIN_PASSWORD) {
      loginError.classList.add('hidden');
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      unlockAdmin();
    } else {
      loginError.classList.remove('hidden');
      loginForm.classList.remove('shake-once');
      // Force a restart without stacking timers or listeners.
      void loginForm.offsetWidth;
      loginForm.classList.add('shake-once');
    }
  });

  document.getElementById('adminLogoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    loginPanel.classList.remove('hidden');
    dashboard.classList.add('hidden');
  });

  if (sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true') {
    unlockAdmin();
  }

  function unlockAdmin() {
    loginPanel.classList.add('hidden');
    dashboard.classList.remove('hidden');
    populateAdminForms();
    renderAdminVolumesList();
  }
}

function openAdminModal() {
  const modal = document.getElementById('admin');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('admin-modal-open');

  const focusTarget = !document.getElementById('adminLoginPanel').classList.contains('hidden')
    ? document.getElementById('adminEmail')
    : document.getElementById('adminCloseBtn');
  requestAnimationFrame(() => focusTarget?.focus());
}

function closeAdminModal() {
  const modal = document.getElementById('admin');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('admin-modal-open');
  document.getElementById('adminOpenBtn')?.focus();
}



/* =========================================================
   8. ADMIN DASHBOARD — Hero / About / Volumes management
   ========================================================= */

let editingVolumeId = null;   // null = creating a new volume
let tempPages = [];           // pages array being built/edited in the volume form

function initAdminDashboard() {
  initAdminTabs();
  initHeroForm();
  initAboutForm();
  initVolumeForm();
  initAdminVolumesList();     // delegated listener for the Edit/Delete buttons
  initLangToggle();
}

function initAdminTabs() {
  const tabs = document.querySelectorAll('.admin-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(b => b.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.admin-panel-tab').forEach(panel => panel.classList.add('hidden'));
      document.getElementById(`tab-${tab.dataset.tab}`).classList.remove('hidden');
    });
  });
}

function populateAdminForms() {
  document.getElementById('heroTitleInput').value = localizedContent(siteData.hero.title);
  document.getElementById('heroSubtitleInput').value = localizedContent(siteData.hero.subtitle);
  document.getElementById('heroImageInput').value = siteData.hero.image;
  renderImagePreview('heroImagePreview', siteData.hero.image);

  document.getElementById('aboutTextInput').value = localizedContent(siteData.about.text);
  document.getElementById('aboutImageInput').value = siteData.about.image;
  renderImagePreview('aboutImagePreview', siteData.about.image);

  resetVolumeForm();
}

function renderImagePreview(containerId, src) {
  const container = document.getElementById(containerId);
  container.innerHTML = src ? `<img src="${src}" alt="Preview" />` : '';
}

/* =========================================================
   9. IMAGE HANDLING — FileReader + canvas compression
   ---------------------------------------------------------
   Every image upload (hero, about, volume cover, manga pages)
   goes through this same pipeline:
   1. readFileAsDataUrl() — read the raw file as a base64 data URL.
   2. compressImageFile() — decode it into an <img>, draw it onto
      a canvas scaled down to a max dimension, and re-export it
      as a JPEG at a fixed quality. This can shrink a multi-MB
      phone photo down to a few hundred KB, which matters a lot
      once several manga pages are stored as base64 strings in
      localStorage (which usually caps out around 5-10MB total).
   3. processImageFile() — the function everyone actually calls.
      It tries the compressed version first; if canvas processing
      fails for any reason (corrupt file, unsupported format), it
      falls back to the raw, uncompressed data URL instead of
      failing the upload outright.
   ========================================================= */

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('File could not be read'));
    reader.readAsDataURL(file);
  });
}

function compressImageFile(file, maxDimension, quality) {
  return readFileAsDataUrl(file).then(dataUrl => new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = () => reject(new Error('Image could not be decoded'));
    img.onload = () => {
      try {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round(height * (maxDimension / width));
            width = maxDimension;
          } else {
            width = Math.round(width * (maxDimension / height));
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch (err) {
        reject(err);
      }
    };
    img.src = dataUrl;
  }));
}

async function processImageFile(file, maxDimension, quality) {
  try {
    return await compressImageFile(file, maxDimension, quality);
  } catch (err) {
    console.warn('[Enzairo] Image compression failed, using the original file instead:', err);
    return await readFileAsDataUrl(file); // still works, just uncompressed
  }
}

/* ---- Hero form ---- */
function initHeroForm() {
  document.getElementById('heroImageInput').addEventListener('input', (e) => {
    renderImagePreview('heroImagePreview', e.target.value);
  });

  document.getElementById('heroImageFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;
    try {
      const dataUrl = await processImageFile(file, 1200, 0.85);
      document.getElementById('heroImageInput').value = dataUrl;
      renderImagePreview('heroImagePreview', dataUrl);
      showToast(t('toast_image_ready'));
    } catch (err) {
      console.error('[Enzairo] Hero image upload failed:', err);
      showToast(t('toast_image_error'));
    }
  });

  document.getElementById('heroForm').addEventListener('submit', (e) => {
    e.preventDefault(); // critical fix: no reload, no lost data
    try {
      const heroTitle = document.getElementById('heroTitleInput').value.trim();
      const heroSubtitle = document.getElementById('heroSubtitleInput').value.trim();
      setLocalizedField(siteData.hero, 'title', heroTitle || localizedContent(siteData.hero.title));
      setLocalizedField(siteData.hero, 'subtitle', heroSubtitle);
      siteData.hero.image = document.getElementById('heroImageInput').value.trim() || siteData.hero.image;
      const saved = saveSiteData();
      renderHero(); // updates the public Hero section immediately, regardless of persistence outcome
      if (saved) showToast(t('toast_hero_saved')); // saveSiteData() already toasted on failure
    } catch (err) {
      console.error('[Enzairo] Failed to save Hero section:', err);
      showToast(t('toast_save_error'));
    }
  });
}

/* ---- About form ---- */
function initAboutForm() {
  document.getElementById('aboutImageInput').addEventListener('input', (e) => {
    renderImagePreview('aboutImagePreview', e.target.value);
  });

  document.getElementById('aboutImageFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      const dataUrl = await processImageFile(file, 1200, 0.85);
      document.getElementById('aboutImageInput').value = dataUrl;
      renderImagePreview('aboutImagePreview', dataUrl);
      showToast(t('toast_image_ready'));
    } catch (err) {
      console.error('[Enzairo] About image upload failed:', err);
      showToast(t('toast_image_error'));
    }
  });

  document.getElementById('aboutForm').addEventListener('submit', (e) => {
    e.preventDefault(); // critical fix: no reload, no lost data
    try {
      setLocalizedField(siteData.about, 'text', document.getElementById('aboutTextInput').value.trim());
      siteData.about.image = document.getElementById('aboutImageInput').value.trim() || siteData.about.image;
      const saved = saveSiteData();
      renderAbout();
      if (saved) showToast(t('toast_about_saved'));
    } catch (err) {
      console.error('[Enzairo] Failed to save About section:', err);
      showToast(t('toast_save_error'));
    }
  });
}

/* ---- Volumes: existing list (delegated) ---- */

function renderAdminVolumesList() {
  const container = document.getElementById('adminVolumesList');
  if (!container) return;

  if (siteData.volumes.length === 0) {
    container.innerHTML = `<p class="admin-empty-note">${t('admin_no_volumes')}</p>`;
    return;
  }

  container.innerHTML = siteData.volumes
    .slice()
    .sort((a, b) => a.number - b.number)
    .map(vol => `
      <div class="admin-volume-row">
        <img src="${vol.cover}" alt="${escapeHtml(title)}" />
        <div class="admin-volume-info">
          <strong>${t('volumes_vol_prefix')} ${vol.number} — ${escapeHtml(localizedContent(vol.title))}</strong>
          <span>${vol.pages.length} ${t('volumes_pages')} · ${vol.locked ? '🔒 ' + t('volumes_locked') : '✓'}</span>
        </div>
        <div class="row-actions">
          <button class="btn btn-ghost btn-small" type="button" data-edit="${vol.id}">${t('admin_edit')}</button>
          <button class="btn btn-danger btn-small" type="button" data-delete="${vol.id}">${t('admin_delete')}</button>
        </div>
      </div>
    `).join('');
}

// ONE delegated listener for the whole admin volumes list — attached once,
// keeps working correctly no matter how many times the list re-renders.
function initAdminVolumesList() {
  const container = document.getElementById('adminVolumesList');

  container.addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-edit]');
    if (editBtn) { loadVolumeIntoForm(editBtn.dataset.edit); return; }

    const deleteBtn = e.target.closest('[data-delete]');
    if (deleteBtn) {
      if (!confirm(t('admin_confirm_delete'))) return;
      siteData.volumes = siteData.volumes.filter(v => v.id !== deleteBtn.dataset.delete);
      const saved = saveSiteData();
      renderAdminVolumesList();
      renderVolumes(); // reflect the deletion on the public site immediately
      if (editingVolumeId === deleteBtn.dataset.delete) resetVolumeForm();
      if (saved) showToast(t('toast_volume_deleted'));
    }
  });
}

function loadVolumeIntoForm(id) {
  const vol = siteData.volumes.find(v => v.id === id);
  if (!vol) return;

  editingVolumeId = vol.id;
  tempPages = [...vol.pages];

  document.getElementById('volumeFormTitle').textContent = t('admin_form_title_edit');
  document.getElementById('volumeEditingId').value = vol.id;
  document.getElementById('volumeNumberInput').value = vol.number;
  document.getElementById('volumeTitleInput').value = localizedContent(vol.title);
  document.getElementById('volumeDescInput').value = localizedContent(vol.description);
  document.getElementById('volumeCoverInput').value = vol.cover;
  document.getElementById('volumeLockedInput').checked = vol.locked;
  renderImagePreview('volumeCoverPreview', vol.cover);
  renderPagesList();

  document.getElementById('volumeForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function resetVolumeForm() {
  editingVolumeId = null;
  tempPages = [];
  document.getElementById('volumeForm').reset();
  document.getElementById('volumeFormTitle').textContent = t('admin_form_title_new');
  document.getElementById('volumeEditingId').value = '';
  document.getElementById('volumeCoverPreview').innerHTML = '';
  const nextNumber = siteData.volumes.length ? Math.max(...siteData.volumes.map(v => v.number)) + 1 : 1;
  document.getElementById('volumeNumberInput').value = nextNumber;
  renderPagesList();
}

// Pages are NEVER auto-counted or invented — this list only ever shows
// exactly what's in tempPages, which the admin built by hand below.
function renderPagesList() {
  const list = document.getElementById('pagesList');

  if (tempPages.length === 0) {
    list.innerHTML = `<p class="pages-empty-note">${t('pages_empty_note')}</p>`;
    return;
  }

  list.innerHTML = tempPages.map((src, i) => `
    <div class="page-thumb">
      <img src="${src}" alt="Page ${i + 1}" />
      <button type="button" data-remove-page="${i}" aria-label="Remove page">×</button>
    </div>
  `).join('');
}

function initVolumeForm() {
  document.getElementById('newVolumeBtn').addEventListener('click', resetVolumeForm);
  document.getElementById('cancelVolumeEditBtn').addEventListener('click', resetVolumeForm);

  document.getElementById('volumeCoverInput').addEventListener('input', (e) => {
    renderImagePreview('volumeCoverPreview', e.target.value);
  });

  document.getElementById('volumeCoverFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      const dataUrl = await processImageFile(file, 1200, 0.85);
      document.getElementById('volumeCoverInput').value = dataUrl;
      renderImagePreview('volumeCoverPreview', dataUrl);
      showToast(t('toast_image_ready'));
    } catch (err) {
      console.error('[Enzairo] Volume cover upload failed:', err);
      showToast(t('toast_image_error'));
    }
  });

  // Add a page via pasted URL
  document.getElementById('addPageUrlBtn').addEventListener('click', () => {
    const input = document.getElementById('pageUrlInput');
    const url = input.value.trim();
    if (!url) return;
    tempPages.push(url);
    input.value = '';
    renderPagesList();
  });

  // Add pages via multi-file upload. Each file is compressed and turned into
  // its own base64 data URL, added to tempPages exactly once — nothing here
  // is generated, guessed, or auto-counted; it's only ever what was uploaded.
  // Processed sequentially (await in a loop) so pages land in the order the
  // admin picked them, and one bad file can't stop the rest from working.
  document.getElementById('pagesFileInput').addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    e.target.value = ''; // allow re-selecting the same file(s) again later
    if (files.length === 0) return;

    showToast(t('toast_processing'));
    let successCount = 0;
    for (const file of files) {
      try {
        const dataUrl = await processImageFile(file, 1400, 0.82);
        tempPages.push(dataUrl);
        successCount++;
      } catch (err) {
        console.error('[Enzairo] A page image failed to upload:', file.name, err);
      }
    }
    renderPagesList();
    showToast(successCount > 0 ? t('toast_pages_added', { n: successCount }) : t('toast_image_error'));
  });

  // ONE delegated listener for every "remove page" button, current and future
  document.getElementById('pagesList').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-remove-page]');
    if (!btn) return;
    tempPages.splice(Number(btn.dataset.removePage), 1);
    renderPagesList();
  });

  document.getElementById('volumeForm').addEventListener('submit', (e) => {
    e.preventDefault(); // <-- critical fix: this is what makes "Save Volume" actually work

    try {
      const volumeData = {
        id: editingVolumeId || `v${Date.now()}`,
        number: Number(document.getElementById('volumeNumberInput').value) || 1,
        title: document.getElementById('volumeTitleInput').value.trim(),
        description: document.getElementById('volumeDescInput').value.trim(),
        cover: document.getElementById('volumeCoverInput').value.trim(),
        pages: [...tempPages],
        locked: document.getElementById('volumeLockedInput').checked
      };

      // Fixed: this used to fail SILENTLY (a bare `return`) if the title or
      // cover was missing, which looked identical to "the Save button is
      // broken". Now it tells the admin exactly what's missing.
      if (!volumeData.title || !volumeData.cover) {
        showToast(t('toast_missing_fields'));
        return;
      }

      if (editingVolumeId) {
        const idx = siteData.volumes.findIndex(v => v.id === editingVolumeId);
        if (idx !== -1) {
          const old = siteData.volumes[idx];
          setLocalizedField(old, 'title', volumeData.title);
          setLocalizedField(old, 'description', volumeData.description);
          siteData.volumes[idx] = { ...old, ...volumeData, title: old.title, description: old.description };
        }
      } else {
        volumeData.title = { he: currentLang === 'he' ? volumeData.title : '', en: currentLang === 'en' ? volumeData.title : '' };
        volumeData.description = { he: currentLang === 'he' ? volumeData.description : '', en: currentLang === 'en' ? volumeData.description : '' };
        siteData.volumes.push(volumeData);
      }

      const saved = saveSiteData();     // persist to localStorage (quota-safe, never throws)
      renderVolumes();                  // public library updates immediately, no reload
      renderAdminVolumesList();
      if (saved) showToast(t('toast_volume_saved')); // saveSiteData() already toasted on failure
      resetVolumeForm();
    } catch (err) {
      console.error('[Enzairo] Failed to save volume:', err);
      showToast(t('toast_save_error'));
    }
  });
}


/* =========================================================
   Language toggle button
   ========================================================= */

function initLangToggle() {
  document.getElementById('langToggle').addEventListener('click', () => {
    applyLanguage(currentLang === 'he' ? 'en' : 'he');
  });
}


/* =========================================================
   9. NAV + SCROLL REVEAL
   ========================================================= */

function initNav() {
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.addEventListener('click', (e) => {
    const adminTrigger = e.target.closest('#adminOpenBtn');
    if (adminTrigger) {
      e.preventDefault();
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      openAdminModal();
      return;
    }

    if (e.target.closest('a, button')) {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  const footerAdmin = document.getElementById('footerAdminOpenBtn');
  footerAdmin?.addEventListener('click', (e) => {
    e.preventDefault();
    openAdminModal();
  });

  document.getElementById('adminCloseBtn')?.addEventListener('click', closeAdminModal);
  document.getElementById('admin')?.addEventListener('click', (e) => {
    if (e.target.closest('[data-close-admin]')) closeAdminModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !document.getElementById('admin')?.classList.contains('hidden')) {
      closeAdminModal();
    }
  });
}


let revealObserver = null;

function observeRevealElements(root = document) {
  if (!revealObserver) return;
  root.querySelectorAll?.('.reveal:not(.is-visible)').forEach(el => revealObserver.observe(el));
}

function initScrollReveal() {
  revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15 });

  observeRevealElements(document);
}

function initIsraelClock() {
  const clock = document.getElementById('liveClock');
  if (!clock) return;

  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jerusalem',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const update = () => {
    clock.textContent = formatter.format(new Date());
  };

  update();
  setInterval(update, 1000);
}
