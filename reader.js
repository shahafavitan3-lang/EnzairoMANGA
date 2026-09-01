/* =========================================================
   ENZAIRO WEBSITE
   LANGUAGE + ANIMATIONS + MANGA READER
========================================================= */


/* =========================================================
   TRANSLATIONS
========================================================= */

const translations = {

    en: {

        navAbout: "About",
        navWorld: "World",
        navVolume: "Volume 1",

        official: "OFFICIAL MANGA PROJECT",

        heroSubtitle:
            "Four islands. Four cultures. One world on the edge of change.",

        readVolume: "READ VOLUME 1",

        explore: "EXPLORE",

        scroll: "SCROLL TO DISCOVER",

        aboutLabel: "ABOUT THE MANGA",

        aboutTitle:
            "A world divided by power.",

        aboutText1:
            "Enzairo takes place in a world divided between four islands, each with its own culture, abilities and history.",

        aboutText2:
            "For generations, people born with supernatural abilities shaped the world. But one group believes that these powers are the source of every war.",

        aboutText3:
            "Their answer is simple: create a world without magic.",

        cardTitle:
            "THE BEGINNING",

        cardText:
            "Enzan's journey begins on an island that became his only home.",

        worldLabel:
            "THE WORLD",

        worldTitle:
            "Four islands.",

        island1Title:
            "WATER ISLAND",

        island1Text:
            "A land where water and ice abilities shape everyday life.",

        island2Title:
            "NINJA ISLAND",

        island2Text:
            "A society without magic, built on discipline and training.",

        island3Title:
            "JUNGLE ISLAND",

        island3Text:
            "A mysterious land filled with nature, healing and ancient knowledge.",

        island4Title:
            "THE EMPTY ISLAND",

        island4Text:
            "An abandoned battlefield where warriors once fought for their islands.",

        volumeLabel:
            "VOLUME 01",

        volumeTitle:
            "The Beginning",

        volumeDescription:
            "The first chapter of Enzairo's journey. Discover the world and take the first step into the unknown.",

        pagesLabel:
            "PAGES",

        chapterLabel:
            "CHAPTER",

        readNow:
            "READ NOW",

        finalLabel:
            "THE JOURNEY BEGINS",

        startReading:
            "START READING",

        footer:
            "An original manga project.",

        readerVolume:
            "VOLUME 01",

        readerBeginning:
            "THE BEGINNING",

        reading:
            "READING VOLUME 01",

        first:
            "FIRST",

        last:
            "LAST",

        readerHint:
            "Use the arrows or your keyboard to turn the pages."

    },


    he: {

        navAbout: "אודות",
        navWorld: "העולם",
        navVolume: "כרך 1",

        official: "פרויקט מנגה מקורי",

        heroSubtitle:
            "ארבעה איים. ארבע תרבויות. עולם אחד שנמצא על סף שינוי.",

        readVolume:
            "קרא את כרך 1",

        explore:
            "גלה את העולם",

        scroll:
            "גלול כדי לגלות",

        aboutLabel:
            "אודות המנגה",

        aboutTitle:
            "עולם המחולק לפי כוח.",

        aboutText1:
            "Enzairo מתרחשת בעולם המחולק לארבעה איים, כאשר לכל אי תרבות, יכולות והיסטוריה משלו.",

        aboutText2:
            "במשך דורות, אנשים שנולדו עם יכולות מיוחדות עיצבו את העולם. אך קבוצה אחת מאמינה שהכוחות האלה הם המקור לכל המלחמות.",

        aboutText3:
            "הפתרון שלהם פשוט: ליצור עולם ללא קסם.",

        cardTitle:
            "ההתחלה",

        cardText:
            "המסע של אנזן מתחיל באי שהפך לבית היחיד שהיה מוכן לקבל אותו.",

        worldLabel:
            "העולם",

        worldTitle:
            "ארבעה איים.",

        island1Title:
            "אי המים",

        island1Text:
            "אי שבו יכולות המים והקרח הן חלק מרכזי מחיי התושבים.",

        island2Title:
            "אי הנינג'ות",

        island2Text:
            "חברה ללא קסם, המבוססת על אימונים, משמעת ונחישות.",

        island3Title:
            "אי הג'ונגל",

        island3Text:
            "אי מסתורי המלא בטבע, ריפוי וידע עתיק.",

        island4Title:
            "האי הריק",

        island4Text:
            "שדה קרב נטוש שבו לוחמים מכל האיים נלחמו בעבר.",

        volumeLabel:
            "כרך 01",

        volumeTitle:
            "ההתחלה",

        volumeDescription:
            "הצ'אפטר הראשון במסע של אנזאירו. גלה את העולם וצעד איתו אל הלא נודע.",

        pagesLabel:
            "עמודים",

        chapterLabel:
            "צ'אפטר",

        readNow:
            "קרא עכשיו",

        finalLabel:
            "המסע מתחיל",

        startReading:
            "התחל לקרוא",

        footer:
            "פרויקט מנגה מקורי.",

        readerVolume:
            "כרך 01",

        readerBeginning:
            "ההתחלה",

        reading:
            "קורא את כרך 01",

        first:
            "ראשון",

        last:
            "אחרון",

        readerHint:
            "השתמש בחצים או במקלדת כדי לדפדף בין העמודים."

    }

};


/* =========================================================
   LANGUAGE
========================================================= */

let currentLanguage =
    localStorage.getItem("enzairo-language") || "en";


function changeLanguage() {

    const data = translations[currentLanguage];

    document.documentElement.lang = currentLanguage;

    if (currentLanguage === "he") {
        document.documentElement.dir = "rtl";
    } else {
        document.documentElement.dir = "ltr";
    }


    document
        .querySelectorAll("[data-i18n]")
        .forEach(element => {

            const key = element.dataset.i18n;

            if (data[key]) {
                element.textContent = data[key];
            }

        });


    const languageButton =
        document.getElementById("languageBtn");


    if (languageButton) {

        languageButton.textContent =
            currentLanguage === "en"
                ? "עברית"
                : "English";

    }


    localStorage.setItem(
        "enzairo-language",
        currentLanguage
    );

}


function toggleLanguage() {

    currentLanguage =
        currentLanguage === "en"
            ? "he"
            : "en";

    changeLanguage();

}


const languageButton =
    document.getElementById("languageBtn");


if (languageButton) {

    languageButton.addEventListener(
        "click",
        toggleLanguage
    );

}


/* =========================================================
   SCROLL REVEAL
========================================================= */

const revealElements =
    document.querySelectorAll(".reveal");


const revealObserver =
    new IntersectionObserver(

        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("visible");

                    revealObserver.unobserve(
                        entry.target
                    );

                }

            });

        },

        {
            threshold: 0.12
        }

    );


revealElements.forEach(element => {

    revealObserver.observe(element);

});


/* =========================================================
   MOUSE PARALLAX
========================================================= */

const heroCharacter =
    document.querySelector(".hero-character");


if (heroCharacter) {

    window.addEventListener(
        "mousemove",
        event => {

            const x =
                (event.clientX / window.innerWidth - 0.5);

            const y =
                (event.clientY / window.innerHeight - 0.5);


            heroCharacter.style.transform =
                `translate(${x * 18}px, ${y * 12}px)`;

        }
    );

}


/* =========================================================
   MANGA READER
========================================================= */

const mangaPage =
    document.getElementById("mangaPage");


if (mangaPage) {

    const totalPages = 20;

    let currentPage = 1;


    const pageCounter =
        document.getElementById("pageCounter");

    const progressBar =
        document.getElementById("progressBar");

    const nextBtn =
        document.getElementById("nextBtn");

    const prevBtn =
        document.getElementById("prevBtn");

    const firstBtn =
        document.getElementById("firstBtn");

    const lastBtn =
        document.getElementById("lastBtn");


    /* -----------------------------------------
       LOAD PAGE
    ----------------------------------------- */

    function loadPage(page) {

        if (page < 1) {
            page = 1;
        }

        if (page > totalPages) {
            page = totalPages;
        }


        currentPage = page;


        mangaPage.classList.add("page-changing");


        setTimeout(() => {

            mangaPage.src =
                `pages/page ${currentPage}.png`;

            mangaPage.alt =
                `Manga page ${currentPage}`;

        }, 120);


        setTimeout(() => {

            mangaPage.classList.remove(
                "page-changing"
            );

        }, 300);


        if (pageCounter) {

            pageCounter.textContent =
                `${currentPage} / ${totalPages}`;

        }


        if (progressBar) {

            const progress =
                (currentPage / totalPages) * 100;

            progressBar.style.width =
                `${progress}%`;

        }


        if (prevBtn) {

            prevBtn.disabled =
                currentPage === 1;

        }


        if (nextBtn) {

            nextBtn.disabled =
                currentPage === totalPages;

        }

    }


    /* -----------------------------------------
       NEXT
    ----------------------------------------- */

    if (nextBtn) {

        nextBtn.addEventListener(
            "click",
            () => {

                loadPage(currentPage + 1);

            }
        );

    }


    /* -----------------------------------------
       PREVIOUS
    ----------------------------------------- */

    if (prevBtn) {

        prevBtn.addEventListener(
            "click",
            () => {

                loadPage(currentPage - 1);

            }
        );

    }


    /* -----------------------------------------
       FIRST
    ----------------------------------------- */

    if (firstBtn) {

        firstBtn.addEventListener(
            "click",
            () => {

                loadPage(1);

            }
        );

    }


    /* -----------------------------------------
       LAST
    ----------------------------------------- */

    if (lastBtn) {

        lastBtn.addEventListener(
            "click",
            () => {

                loadPage(totalPages);

            }
        );

    }


    /* -----------------------------------------
       KEYBOARD
    ----------------------------------------- */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "ArrowRight" ||
                event.key === "ArrowDown"
            ) {

                loadPage(currentPage + 1);

            }


            if (
                event.key === "ArrowLeft" ||
                event.key === "ArrowUp"
            ) {

                loadPage(currentPage - 1);

            }

        }
    );


    /* -----------------------------------------
       SWIPE
    ----------------------------------------- */

    let touchStartX = 0;


    mangaPage.addEventListener(
        "touchstart",
        event => {

            touchStartX =
                event.touches[0].clientX;

        }
    );


    mangaPage.addEventListener(
        "touchend",
        event => {

            const touchEndX =
                event.changedTouches[0].clientX;

            const difference =
                touchStartX - touchEndX;


            if (Math.abs(difference) > 50) {

                if (difference > 0) {

                    loadPage(
                        currentPage + 1
                    );

                } else {

                    loadPage(
                        currentPage - 1
                    );

                }

            }

        }
    );


    /* INITIAL PAGE */

    loadPage(1);

}


/* =========================================================
   INITIAL LANGUAGE
========================================================= */

changeLanguage();