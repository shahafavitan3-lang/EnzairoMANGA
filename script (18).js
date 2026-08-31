/* ============================= */
/* LOADER */
/* ============================= */

window.addEventListener("load", () => {

    const loader = document.querySelector(".loader");

    if (!loader) return;


    setTimeout(() => {

        loader.style.opacity = "0";


        setTimeout(() => {

            loader.style.display = "none";

        }, 500);


    }, 1000);

});


/* ============================= */
/* HEADER SCROLL */
/* ============================= */

const header = document.querySelector("header");


window.addEventListener("scroll", () => {

    if (!header) return;


    if (window.scrollY > 50) {

        header.classList.add("scrolled");

    } else {

        header.classList.remove("scrolled");

    }

});


/* ============================= */
/* MOBILE MENU */
/* ============================= */

const menu = document.querySelector(".menu");

const nav = document.querySelector("nav");


if (menu && nav) {

    menu.addEventListener("click", () => {

        nav.classList.toggle("active");

    });

}


document.querySelectorAll("nav a").forEach(link => {

    link.addEventListener("click", () => {

        if (nav) {

            nav.classList.remove("active");

        }

    });

});


/* ============================= */
/* TYPING EFFECT */
/* ============================= */

const typing = document.getElementById("typing");


const texts = [

    "Programmer",

    "Web Developer",

    "Application Creator",

    "JavaScript Developer"

];


let textIndex = 0;

let charIndex = 0;

let deleting = false;


function type() {

    if (!typing) return;


    const current = texts[textIndex];


    if (!deleting) {

        typing.textContent =
            current.substring(0, charIndex);


        charIndex++;


        if (charIndex > current.length) {

            deleting = true;

            setTimeout(type, 1200);

            return;

        }

    } else {

        typing.textContent =
            current.substring(0, charIndex);


        charIndex--;


        if (charIndex < 0) {

            deleting = false;

            charIndex = 0;

            textIndex++;


            if (textIndex >= texts.length) {

                textIndex = 0;

            }

        }

    }


    setTimeout(
        type,
        deleting ? 50 : 100
    );

}


type();


/* ============================= */
/* SCROLL REVEAL */
/* ============================= */

const elements =
    document.querySelectorAll(".reveal");


const observer =
    new IntersectionObserver(

        (entries) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("show");

                }

            });

        },

        {
            threshold: 0.15
        }

    );


elements.forEach(element => {

    observer.observe(element);

});


/* ============================= */
/* FIREBASE CONFIG */
/* ============================= */
/* Realtime Database REST API is used directly (no SDK / bundler needed) —
   this keeps script.js a plain script, exactly as it was before. The
   apiKey below is safe to expose in client-side code; what actually
   protects the data is the Database Rules configured in the Firebase
   console (public write to "requests", read locked to a signed-in admin). */

const FIREBASE_DB_URL = "https://enzairo-web-default-rtdb.firebaseio.com";
const FIREBASE_API_KEY = "AIzaSyAGctPicYsR4Oh0OwrriN_wS_zzq_LOEh4";


/* ============================= */
/* CONTACT SYSTEM (synced via Firebase — visible from any device) */
/* ============================= */

const form =
    document.getElementById("contactForm");


if (form) {

    form.addEventListener(
        "submit",

        async (e) => {

            e.preventDefault();


            const message = {

                id:
                    Date.now(),

                name:
                    document.getElementById("name").value,

                email:
                    document.getElementById("email").value,

                phone:
                    document.getElementById("phone").value,

                message:
                    document.getElementById("message").value,

                date:
                    new Date().toLocaleString(),

                status:
                    "New"

            };


            try {

                const res = await fetch(
                    `${FIREBASE_DB_URL}/requests.json`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(message)
                    }
                );

                if (!res.ok) throw new Error("Firebase write failed");

                alert(
                    "Message sent successfully!"
                );

                form.reset();

            } catch (err) {

                console.error("[Portfolio] Failed to send message:", err);

                alert(
                    "Something went wrong sending your message. Please try again."
                );

            }

        }

    );

}


/* ============================= */
/* ADMIN PANEL (view synced messages from any device) */
/* ============================= */

const adminToggle = document.getElementById("adminToggle");
const adminSection = document.getElementById("admin");
const adminLoginForm = document.getElementById("adminLoginForm");
const adminLoginError = document.getElementById("adminLoginError");
const adminPanel = document.getElementById("adminPanel");
const adminWelcome = document.getElementById("adminWelcome");
const adminLogoutBtn = document.getElementById("adminLogoutBtn");
const adminMessagesList = document.getElementById("adminMessagesList");

// sessionStorage only avoids re-typing the password on every reload
// within THIS browser tab — it is not what makes the data cross-device.
// The data itself lives in Firebase; this is just a login convenience.
const ADMIN_SESSION_KEY = "portfolioAdminSession";


function escapeHtml(str) {

    const div = document.createElement("div");

    div.textContent = str || "";

    return div.innerHTML;

}


function showAdminPanel(idToken, email) {

    if (adminLoginForm) adminLoginForm.classList.add("hidden");

    if (adminPanel) adminPanel.classList.remove("hidden");

    if (adminWelcome) adminWelcome.textContent = `Logged in as ${email}`;

    loadAdminMessages(idToken);

}


function showAdminLogin() {

    if (adminPanel) adminPanel.classList.add("hidden");

    if (adminLoginForm) adminLoginForm.classList.remove("hidden");

}


async function loadAdminMessages(idToken) {

    if (!adminMessagesList) return;

    adminMessagesList.innerHTML = "<p>Loading messages...</p>";

    try {

        const res = await fetch(
            `${FIREBASE_DB_URL}/requests.json?auth=${idToken}`
        );

        if (!res.ok) throw new Error("Failed to load messages");

        const data = await res.json();

        const entries = data ? Object.entries(data) : [];

        entries.sort(
            (a, b) => (b[1].id || 0) - (a[1].id || 0)
        );


        if (entries.length === 0) {

            adminMessagesList.innerHTML = "<p>No messages yet.</p>";

            return;

        }


        adminMessagesList.innerHTML = entries.map(([key, msg]) => `
            <div class="message-card">
                <div class="message-top">
                    <strong>${escapeHtml(msg.name)}</strong>
                    <span>${escapeHtml(msg.date)}</span>
                </div>
                <p>${escapeHtml(msg.email)}${msg.phone ? " · " + escapeHtml(msg.phone) : ""}</p>
                <p class="message-text">${escapeHtml(msg.message)}</p>
            </div>
        `).join("");

    } catch (err) {

        console.error("[Portfolio] Failed to load admin messages:", err);

        adminMessagesList.innerHTML = "<p>Failed to load messages. Try logging out and back in.</p>";

    }

}


if (adminToggle && adminSection) {

    adminToggle.addEventListener("click", (e) => {

        e.preventDefault();

        adminSection.classList.remove("hidden");

        adminSection.scrollIntoView({ behavior: "smooth" });

    });

}


if (adminLoginForm) {

    adminLoginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        if (adminLoginError) adminLoginError.classList.add("hidden");


        const email = document.getElementById("adminEmail").value.trim();

        const password = document.getElementById("adminPassword").value;


        try {

            const res = await fetch(
                `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password, returnSecureToken: true })
                }
            );

            const data = await res.json();

            if (!res.ok) throw new Error(data.error?.message || "Login failed");


            sessionStorage.setItem(
                ADMIN_SESSION_KEY,
                JSON.stringify({ idToken: data.idToken, email: data.email })
            );

            showAdminPanel(data.idToken, data.email);

            adminLoginForm.reset();

        } catch (err) {

            console.error("[Portfolio] Admin login failed:", err);

            if (adminLoginError) {

                adminLoginError.textContent = "Login failed. Check your email and password.";

                adminLoginError.classList.remove("hidden");

            }

        }

    });

}


if (adminLogoutBtn) {

    adminLogoutBtn.addEventListener("click", () => {

        sessionStorage.removeItem(ADMIN_SESSION_KEY);

        showAdminLogin();

    });

}


// Restores an existing login after a page reload, as long as it's still
// within the same browser tab/session — so the admin isn't forced to log
// in again every time they refresh the page.
(function restoreAdminSession() {

    if (!adminLoginForm) return;

    const saved = sessionStorage.getItem(ADMIN_SESSION_KEY);

    if (!saved) return;


    try {

        const { idToken, email } = JSON.parse(saved);

        if (idToken) showAdminPanel(idToken, email);

    } catch (err) {

        sessionStorage.removeItem(ADMIN_SESSION_KEY);

    }

})();


/* ============================= */
/* SMOOTH NAVIGATION */
/* ============================= */

document
    .querySelectorAll('a[href^="#"]:not(#adminToggle)')
    .forEach(anchor => {

        anchor.addEventListener(
            "click",

            function (e) {

                const target =
                    document.querySelector(
                        this.getAttribute("href")
                    );


                if (!target) return;


                e.preventDefault();


                target.scrollIntoView({

                    behavior: "smooth"

                });

            }

        );

    });
