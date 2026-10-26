// Default Books with Explicit Codes & 7-Day Deadline tracking
const defaultBooks = [
    { id: 1, code: "1234", title: "No Longer Human", author: "Osamu Dazai", category: "Classic", cover: "images/osamu.jpg", status: "Available", borrowDate: null, dueDate: null, borrower: null, desc: "A man struggles to reconcile his inner life with the expectations of society." },
    { id: 2, code: "1235", title: "The Metamorphosis", author: "Franz Kafka", category: "Classic", cover: "images/meta.jpg", status: "Available", borrowDate: null, dueDate: null, borrower: null, desc: "Gregor Samsa wakes up one morning transformed into an insect." },
    { id: 3, code: "1236", title: "Night in the Galactic Railroad", author: "Kenji Miyazawa", category: "Sci-Fi", cover: "images/posa.jpg", status: "Available", borrowDate: null, dueDate: null, borrower: null, desc: "A lonely boy embarks on a mystical, wondrous journey across the Milky Way via a celestial train." },
    { id: 4, code: "1237", title: "Tom Midnight Garden", author: "Julian Thorne", category: "Mystery", cover: "images/tom.jpg", status: "Available", borrowDate: null, dueDate: null, borrower: null, desc: "An eerie Victorian estate hides botanical secrets." },
    { id: 5, code: "1238", title: "Anne of the Green Gables", author: "L.M. Montgomery", category: "Classic", cover: "images/anne.jpg", status: "Available", borrowDate: null, dueDate: null, borrower: null, desc: "An imaginative, talkative orphan girl is sent by mistake to live on Prince Edward Island." },
    { id: 6, code: "1239", title: "AI and Machine Learning for Coders", author: "Laurence Morone", category: "Sci-Fi", cover: "images/butiki.jpg", status: "Available", borrowDate: null, dueDate: null, borrower: null, desc: "A programmer's guide to artificial intelligence and machine learning, introducing practical concepts and techniques for building AI models using code." },
    { id: 7, code: "1240", title: "Romeo and Juliet", author: "William Shakespeare", category: "Romance", cover: "images/romeo.jpg", status: "Available", borrowDate: null, dueDate: null, borrower: null, desc: "The timeless tragedy of two star-crossed lovers whose passion defies their family feuds." },
    { id: 8, code: "1241", title: "Isang Kaibigan", author: "Inday Sarah Duterte", category: "Drama", cover: "images/duterte.jpg", status: "Available", borrowDate: null, dueDate: null, borrower: null, desc: "A children's story about an owl whose home is struck by a storm and a parrot that comes to his aid." },
    { id: 9, code: "1242", title: "Velvet Shadows", author: "Andre Norton", category: "Romance", cover: "images/velvet.jpg", status: "Available", borrowDate: null, dueDate: null, borrower: null, desc: "Intrigue and forbidden passion in 1920s Cairo." },
    { id: 10, code: "1243", title: "Echoes of Eternity", author: "Hal M. Helms", category: "Classic", cover: "images/echoes.jpg", status: "Available", borrowDate: null, dueDate: null, borrower: null, desc: "Philosophical reflections on time and memory." }
];

let books = JSON.parse(localStorage.getItem('lib_books')) || defaultBooks;
let stack = JSON.parse(localStorage.getItem('lib_stack')) || [];
let history = JSON.parse(localStorage.getItem('lib_history')) || [];
let reviews = JSON.parse(localStorage.getItem('lib_reviews')) || {};
let currentUser = localStorage.getItem('lib_user') || null;
let likedGenres = JSON.parse(localStorage.getItem('lib_liked_genres')) || [];

// --- Self-Healing Sync: Clear stuck statuses if not actually in the return queue ---
books.forEach(b => {
    if (b.status === 'Pending Return') {
        const inStack = stack.some(s => s.id === b.id || s.code === b.code);
        if (!inStack) {
            b.status = 'Available';
            b.borrower = null;
            b.borrowDate = null;
            b.dueDate = null;
        }
    }
});

function saveData() {
    localStorage.setItem('lib_books', JSON.stringify(books));
    localStorage.setItem('lib_stack', JSON.stringify(stack));
    localStorage.setItem('lib_history', JSON.stringify(history));
    localStorage.setItem('lib_reviews', JSON.stringify(reviews));
    localStorage.setItem('lib_liked_genres', JSON.stringify(likedGenres));
}

function toast(msg) {
    const box = document.getElementById('toast-box');
    if (!box) return;
    const el = document.createElement('div');
    el.className = 'toast-msg';
    el.innerText = msg;
    box.appendChild(el);
    setTimeout(() => el.remove(), 2500);
}

document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
    // Auto-fill any borrower or returner name input fields with the logged-in user
    ['borrower-name', 'returner-name'].forEach(id => {
        const input = document.getElementById(id);
        if (input && currentUser) {
            input.value = currentUser;
        }
    });
});

function checkAuth() {
    const modal = document.getElementById('login-modal');
    if (!currentUser && modal) {
        modal.style.display = 'flex';
    } else if (modal) {
        modal.style.display = 'none';
    }
    const userDisplay = document.getElementById('current-user-display');
    if (userDisplay && currentUser) {
        userDisplay.innerText = currentUser;
    }
}

function handleLogin(e) {
    e.preventDefault();
    const name = document.getElementById('login-username').value.trim();
    if (name) {
        currentUser = name;
        localStorage.setItem('lib_user', currentUser);
        checkAuth();
        toast(`Welcome back, ${currentUser}!`);
        location.reload();
    }
}

function logoutSystem() {
    localStorage.removeItem('lib_user');
    location.reload();
}

function getRemainingDeadline(dueDateStr) {
    if (!dueDateStr) return "N/A";
    const now = new Date();
    const due = new Date(dueDateStr);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "Overdue!";
    return `${diffDays} days remaining`;
}