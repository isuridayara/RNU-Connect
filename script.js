// ── SUPABASE CONFIG ─────────────────────────
// Get these from your Supabase Dashboard: Settings > API
const supabaseUrl = 'https://your-project-id.supabase.co';
const supabaseKey = 'your-anon-public-key';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// ── STATE ───────────────────────────────────
let currentUser  = JSON.parse(localStorage.getItem('rnu_user') || 'null');
let authToken    = localStorage.getItem('rnu_token') || null;
let allAlumni    = [];
let activeFilter = 'all';

// ── INITIALIZATION ──────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    updateNavUI();
    loadAlumni();
    loadJobs();
    loadEvents();
});

// ── AUTHENTICATION ──────────────────────────
async function submitLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const btn = document.getElementById('loginBtn');
    
    btn.textContent = 'Signing in...';
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        document.getElementById('loginError').textContent = error.message;
        btn.textContent = 'Sign In';
    } else {
        saveSession(data.session.access_token, data.user.user_metadata);
        closeModal('login');
        showToast(`✅ Welcome back!`);
    }
}

async function submitRegister() {
    const firstName = document.getElementById('regFirst').value.trim();
    const lastName  = document.getElementById('regLast').value.trim();
    const email     = document.getElementById('regEmail').value.trim();
    const password  = document.getElementById('regPassword').value;
    
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { firstName, lastName }
        }
    });

    if (error) {
        document.getElementById('registerError').textContent = error.message;
    } else {
        showToast("🎉 Check your email for a confirmation link!");
        closeModal('register');
    }
}

function signOut() {
    supabase.auth.signOut();
    localStorage.removeItem('rnu_token');
    localStorage.removeItem('rnu_user');
    currentUser = null;
    updateNavUI();
    showToast('👋 Signed out successfully');
}

// ── DATA LOADING ────────────────────────────
async function loadAlumni() {
    try {
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) throw error;
        allAlumni = data || [];
        renderAlumni(allAlumni);
    } catch (err) {
        // Fallback to your original static list if the DB is empty
        document.getElementById('alumniGrid').innerHTML = staticAlumniHTML();
    }
}

// ── UI HELPERS ──────────────────────────────
function updateNavUI() {
    const guest = document.getElementById('guestButtons');
    const userMenu = document.getElementById('userMenu');
    if (currentUser) {
        guest.style.display = 'none';
        userMenu.classList.add('visible');
        document.getElementById('navName').textContent = currentUser.firstName;
        document.getElementById('navAvatar').textContent = currentUser.firstName[0];
    } else {
        guest.style.display = 'flex';
        userMenu.classList.remove('visible');
    }
}

function openModal(id) {
    document.getElementById(id + 'Modal').classList.add('active');
}

function closeModal(id) {
    document.getElementById(id + 'Modal').classList.remove('active');
}

function showToast(msg) {
    const t = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

// ... include other original functions like animateCount(), renderAlumni(), etc.
