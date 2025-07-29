// ---- Firebase Setup ----
const firebaseConfig = {
  apiKey: "AIzaSyAbcqS58TX6OSF_x3DMKWIXgBlZQvOv4e4",
  authDomain: "algolog-tracker.firebaseapp.com",
  projectId: "algolog-tracker",
  storageBucket: "algolog-tracker.appspot.com",
  messagingSenderId: "334508005991",
  appId: "1:334508005991:web:c0d2170b20d7d4b41c52c2",
  measurementId: "G-B7TSEGZJM3"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ---- UI Helpers ----
function getPlatformBadge(platform) {
    switch (platform) {
        case 'LeetCode': return 'badge-leetcode';
        case 'GFG': return 'badge-gfg';
        case 'Codeforces': return 'badge-codeforces';
        default: return 'badge-others';
    }
}
function getDifficultyBadge(diff) {
    switch (diff) {
        case 'Easy': return 'badge-easy';
        case 'Medium': return 'badge-medium';
        case 'Hard': return 'badge-hard';
        default: return '';
    }
}

// ---- App State ----
let problems = [];
let currentUserId = null;

// ---- Firestore: Store and Load Problems ----
function saveProblemsForUser(userId, problemsArr) {
    return db.collection("users").doc(userId)
        .collection("data").doc("myProblems")
        .set({ problems: problemsArr });
}
function getProblemsForUser(userId) {
    return db.collection("users").doc(userId)
        .collection("data").doc("myProblems")
        .get()
        .then(doc => doc.exists ? doc.data().problems || [] : []);
}

// ---- UI Rendering ----
function renderProblems() {
    const list = document.getElementById('problemsList');
    const diff = document.getElementById('filterDifficulty').value;
    const plat = document.getElementById('filterPlatform').value;
    const solved = document.getElementById('filterSolved').value;
    const search = document.getElementById('searchBar').value.toLowerCase();

    list.innerHTML = '';
    problems
        .filter(p => (!diff || p.difficulty === diff))
        .filter(p => (!plat || p.platform === plat))
        .filter(p => (!solved || (solved === 'Solved' ? p.solved : !p.solved)))
        .filter(p =>
            !search ||
            p.title.toLowerCase().includes(search) ||
            p.topic.toLowerCase().includes(search)
        )
        .forEach((p, idx) => {
            const card = document.createElement('div');
            card.className = `problem-card ${p.solved ? 'solved' : 'unsolved'}`;
            card.innerHTML = `
                <div class="problem-title">${p.title}</div>
                <div class="problem-meta">
                    <span class="badge ${getPlatformBadge(p.platform)}">${p.platform}</span>
                    <span class="badge ${getDifficultyBadge(p.difficulty)}">${p.difficulty}</span>
                    <span class="badge badge-topic">${p.topic}</span>
                </div>
                ${p.link ? `<a href="${p.link}" target="_blank" class="problem-link"><i class="bi bi-link-45deg"></i> View Problem</a>` : ""}
                <div class="card-actions">
                    <button class="${p.solved ? "mark-unsolved" : "mark-solved"}" onclick="toggleSolved(${idx})">
                        ${p.solved ? "Mark Unsolved" : "Mark Solved"}
                    </button>
                    <button class="delete" onclick="deleteProblem(${idx})">Delete</button>
                </div>
            `;
            list.appendChild(card);
        });
}

// ---- Problem Actions ----
function syncProblems() {
    if (currentUserId) {
        saveProblemsForUser(currentUserId, problems);
    } else {
        localStorage.setItem('problems', JSON.stringify(problems));
    }
}

document.getElementById('addProblemForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const title = document.getElementById('problemTitle').value.trim();
    const topic = document.getElementById('problemTopic').value.trim();
    const platform = document.getElementById('problemPlatform').value;
    const difficulty = document.getElementById('problemDifficulty').value;
    const link = document.getElementById('problemLink').value.trim();
    const now = Date.now();
    if (!title || !topic || !platform || !difficulty) return;
    problems.push({
        title, topic, platform, difficulty, link, solved: false, addedAt: now
    });
    syncProblems();
    renderProblems();
    this.reset();
    maybeUpdateProfileStats();
});

['filterDifficulty', 'filterPlatform', 'filterSolved', 'searchBar'].forEach(id =>
    document.getElementById(id).addEventListener('input', renderProblems)
);

function toggleSolved(idx) {
    problems[idx].solved = !problems[idx].solved;
    if (problems[idx].solved) problems[idx].solvedAt = Date.now();
    syncProblems();
    renderProblems();
    maybeUpdateProfileStats();
}
function deleteProblem(idx) {
    problems.splice(idx, 1);
    syncProblems();
    renderProblems();
    maybeUpdateProfileStats();
}

// ---- Export ----
document.getElementById('exportBtn').addEventListener('click', function() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(problems, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "dsa_problems.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
});

// ---- Dark Mode ----
document.getElementById('darkModeToggle').addEventListener('click', function() {
    document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', document.body.classList.contains('dark') ? "1" : "0");
});
if (localStorage.getItem('darkMode') === "1") {
    document.body.classList.add('dark');
}

// ---- Auth UI Elements ----
const authModal = document.getElementById('authModal');
const closeAuthModal = document.getElementById('closeAuthModal');
const authForm = document.getElementById('authForm');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const authErrorMsg = document.getElementById('authErrorMsg');
const authModeTitle = document.getElementById('authModeTitle');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const switchToLogin = document.getElementById('switchToLogin');
const switchToSignup = document.getElementById('switchToSignup');
const userInfoBar = document.getElementById('userInfoBar');
const userEmailDisplay = document.getElementById('userEmailDisplay');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');

let isSignupMode = true;

function showAuthModal(signup = true) {
    isSignupMode = signup;
    authModeTitle.textContent = signup ? "Sign Up" : "Login";
    authSubmitBtn.textContent = signup ? "Sign Up" : "Login";
    switchToLogin.classList.toggle('hidden', !signup);
    switchToSignup.classList.toggle('hidden', signup);
    authErrorMsg.textContent = "";
    authModal.classList.remove('hidden');
}
function hideAuthModal() {
    authModal.classList.add('hidden');
    authForm.reset();
    authErrorMsg.textContent = "";
}
closeAuthModal.onclick = hideAuthModal;
loginBtn.onclick = () => showAuthModal(false);
switchToLogin.onclick = () => showAuthModal(false);
switchToSignup.onclick = () => showAuthModal(true);

// ---- Profile Details Modal Logic ----
function showProfileDetailsModal() {
  document.getElementById("profileDetailsModal").classList.remove("hidden");
}
function hideProfileDetailsModal() {
  document.getElementById("profileDetailsModal").classList.add("hidden");
  document.getElementById("profileDetailsForm").reset();
}

// ---- Save Profile to MongoDB Backend ----
async function saveUserProfileToMongo(profile) {
    try {
        const response = await fetch('http://localhost:4000/api/user', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(profile)
        });
        const result = await response.json();
        if (!result.success) {
            alert('Failed to save profile: ' + (result.message || 'Unknown error'));
        }
    } catch (err) {
        alert('Error saving profile: ' + err.message);
    }
}

// ---- Load Profile from MongoDB Backend ----
async function loadUserProfileFromMongo(email) {
    try {
        const response = await fetch('http://localhost:4000/api/user/' + encodeURIComponent(email));
        const result = await response.json();
        if (result.success && result.user) {
            return result.user;
        }
        return null;
    } catch (err) {
        return null;
    }
}

// ---- Profile Details Form Submission ----
document.getElementById("profileDetailsForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const profile = {
        email: user.email,
        name: document.getElementById("profileNameInput").value,
        username: document.getElementById("profileUsernameInput").value,
        location: document.getElementById("profileLocationInput").value,
        role: document.getElementById("profileRoleInput").value,
        accountType: document.getElementById("profileAccountTypeInput").value
    };

    await saveUserProfileToMongo(profile);

    // Update UI
    document.getElementById("profileName").textContent = profile.name;
    document.getElementById("profileUsername").textContent = profile.username;
    document.getElementById("profileEmail").textContent = profile.email;
    document.getElementById("profileRole").textContent = profile.role;
    document.getElementById("profileAccountType").textContent = profile.accountType;
    document.getElementById("profileLocation").textContent = profile.location;

    hideProfileDetailsModal();
});

// ---- Auth State Handling ----
auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUserId = user.uid;
        document.getElementById("loginBtn").classList.add("hidden");
        document.getElementById("logoutBtn").classList.remove("hidden");
        document.getElementById("userEmailDisplay").textContent = user.email;

        // Load user problems from Firestore
        getProblemsForUser(user.uid).then(userProblems => {
            problems = userProblems;
            renderProblems();
            maybeUpdateProfileStats();
        });

        // Load profile data from MongoDB
        const mongoProfile = await loadUserProfileFromMongo(user.email);
        if (mongoProfile) {
            document.getElementById("profileName").textContent = mongoProfile.name || "N/A";
            document.getElementById("profileUsername").textContent = mongoProfile.username || "N/A";
            document.getElementById("profileEmail").textContent = mongoProfile.email || "N/A";
            document.getElementById("profileRole").textContent = mongoProfile.role || "Student";
            document.getElementById("profileAccountType").textContent = mongoProfile.accountType || "Free";
            document.getElementById("profileLocation").textContent = mongoProfile.location || "N/A";
        } else {
            // New user - show profile details form
            showProfileDetailsModal();
        }
    } else {
        currentUserId = null;
        document.getElementById("userEmailDisplay").textContent = "";
        document.getElementById("loginBtn").classList.remove("hidden");
        document.getElementById("logoutBtn").classList.add("hidden");
        problems = JSON.parse(localStorage.getItem('problems')) || [];
        renderProblems();
        maybeUpdateProfileStats();
        [
          "profileName", "profileUsername", "profileEmail", "profileRole",
          "profileAccountType", "profileJoined", "profileLocation",
          "profileUID", "profileVerified"
        ].forEach(id => {
          document.getElementById(id).textContent = "N/A";
        });
    }
});

// ---- Section Navigation ----
function showSection(sectionId) {
    ["problemsMainSection","profileSection","progressSection","settingsSection"].forEach(id=>{
        let el=document.getElementById(id); if(el) el.classList.add('hidden');
    });
    if (document.getElementById(sectionId))
        document.getElementById(sectionId).classList.remove("hidden");
    // Highlight active nav
    document.querySelectorAll('.sidebar nav ul li').forEach(li=>li.classList.remove('active'));
    if(sectionId==="problemsMainSection") document.getElementById("navProblems").classList.add('active');
    if(sectionId==="profileSection") document.getElementById("navProfile").classList.add('active');
    if(sectionId==="progressSection") document.getElementById("navProgress").classList.add('active');
    if(sectionId==="settingsSection") document.getElementById("navSettings").classList.add('active');
}
document.getElementById("navProfile").addEventListener("click", function () {
    showSection("profileSection");
    renderUserProfile();
});
document.getElementById("navProblems").addEventListener("click", function () {
    showSection("problemsMainSection");
});
document.getElementById("navProgress").addEventListener("click", function () {
    showSection("progressSection");
});
document.getElementById("navSettings").addEventListener("click", function () {
    showSection("settingsSection");
});

// ---- Profile Rendering ----
function renderUserProfile() {
    const user = auth.currentUser;
    if (!user) {
        [
          'profileName','profileUsername','profileEmail','profileLocation','profileRole','profileAccountType',
          'profileJoined','profileUID','profileVerified','profileTotal','profileSolved','profileUnsolved','profileSuccessRate',
          'profileLastActive','profileStreak','profileRecentAdded','profileLastSolved'
        ].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.textContent = (id === "profileAccountType") ? "Free" : "N/A";
        });
        document.getElementById('profileRecentAdded') && (document.getElementById('profileRecentAdded').innerHTML = "<li>N/A</li>");
        document.getElementById('profileResetPW').onclick = null;
        return;
    }
    db.collection("users").doc(user.uid).get().then(doc => {
        const info = doc.exists ? doc.data() : {};
        document.getElementById('profileName').textContent = user.displayName || info.name || "N/A";
        document.getElementById('profileUsername').textContent = info.username || "N/A";
        document.getElementById('profileEmail').textContent = user.email || "N/A";
        document.getElementById('profileLocation').textContent = info.location || "N/A";
        document.getElementById('profileRole').textContent = info.role || "Student";
        document.getElementById('profileAccountType').textContent = info.accountType || "Free";
        document.getElementById('profileJoined').textContent = info.joinedDate
            ? (info.joinedDate.toDate ? info.joinedDate.toDate().toLocaleDateString() : info.joinedDate)
            : (user.metadata && user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "N/A");
        document.getElementById('profileUID').textContent = user.uid;
        document.getElementById('profileVerified').textContent = user.emailVerified ? "Yes" : "No";
    });

    // Performance
    const total = problems.length;
    const solved = problems.filter(p => p.solved).length;
    const unsolved = total - solved;
    const rate = total ? Math.round((solved / total) * 100) : 0;
    document.getElementById('profileTotal').textContent = total;
    document.getElementById('profileSolved').textContent = solved;
    document.getElementById('profileUnsolved').textContent = unsolved;
    document.getElementById('profileSuccessRate').textContent = total ? rate + "%" : "0%";

    // Last Active
    let lastActive = null;
    if (problems.length > 0) {
        lastActive = problems.reduce((max, p) => {
            if (p.addedAt && (!max || p.addedAt > max)) return p.addedAt;
            if (p.solvedAt && (!max || p.solvedAt > max)) return p.solvedAt;
            return max;
        }, null);
    }
    document.getElementById('profileLastActive').textContent = lastActive ? new Date(lastActive).toLocaleDateString() : "N/A";
    document.getElementById('profileStreak').textContent = "Coming Soon";

    // Recent Activity: Last 5 added
    const recent = [...problems].sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0)).slice(0, 5);
    document.getElementById('profileRecentAdded').innerHTML = recent.length ? recent.map(p =>
        `<li>${p.title} <span style="color:#888;font-size:0.97em">(${p.addedAt ? new Date(p.addedAt).toLocaleDateString() : "N/A"})</span></li>`
    ).join("") : "<li>N/A</li>";

    // Last solved
    const solvedProblems = problems.filter(p => p.solved && p.solvedAt);
    if (solvedProblems.length > 0) {
        solvedProblems.sort((a,b)=>b.solvedAt-a.solvedAt);
        const last = solvedProblems[0];
        document.getElementById('profileLastSolved').textContent = `${last.title} (${new Date(last.solvedAt).toLocaleDateString()})`;
    } else {
        document.getElementById('profileLastSolved').textContent = "N/A";
    }

    // Password Reset
    document.getElementById('profileResetPW').onclick = function() {
        auth.sendPasswordResetEmail(user.email).then(()=>{
            document.getElementById('pwResetMsg').textContent = "Email sent!";
            setTimeout(()=>document.getElementById('pwResetMsg').textContent="", 3000);
        }).catch(err=>{
            document.getElementById('pwResetMsg').textContent = "Error: " + err.message;
            setTimeout(()=>document.getElementById('pwResetMsg').textContent="", 3000);
        });
    };
}

// ---- Problems Stats Helper ----
function maybeUpdateProfileStats() {
    renderUserProfile();
}

// ---- Show problems by default ----
showSection('problemsMainSection');