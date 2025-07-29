// ---- Helper: Dark Mode ----
document.getElementById('darkModeToggle').onclick = function() {
  document.body.classList.toggle('dark');
  localStorage.setItem('darkMode', document.body.classList.contains('dark') ? "1" : "0");
};
if (localStorage.getItem('darkMode') === "1") document.body.classList.add('dark');

// ---- Problems Data (DEMO: localStorage, replace with backend API for prod) ----
let problems = JSON.parse(localStorage.getItem("problems") || "[]");
function renderProblems() {
  const list = document.getElementById('problemsList');
  const plat = document.getElementById('filterPlatform').value;
  const diff = document.getElementById('filterDifficulty').value;
  const solved = document.getElementById('filterSolved').value;
  const search = document.getElementById('searchBar').value.toLowerCase();
  list.innerHTML = '';
  problems
    .filter(p => (!plat || p.platform === plat))
    .filter(p => (!diff || p.difficulty === diff))
    .filter(p => (!solved || (solved === 'Solved' ? p.solved : !p.solved)))
    .filter(p => !search || p.title.toLowerCase().includes(search) || p.topic.toLowerCase().includes(search))
    .forEach((p, i) => {
      const card = document.createElement('div');
      card.className = 'problem-card';
      card.innerHTML = `
        <div><b>${p.title}</b></div>
        <div><span>${p.topic}</span> | <span>${p.platform}</span> | <span>${p.difficulty}</span></div>
        <div><a href="${p.link}" target="_blank">${p.link ? "Link" : ""}</a></div>
        <div>Status: <b style="color:${p.solved ? "#388e3c" : "#d32f2f"}">${p.solved ? "Solved" : "Unsolved"}</b></div>
        <button onclick="toggleSolved(${i})">${p.solved ? "Mark Unsolved" : "Mark Solved"}</button>
        <button onclick="deleteProblem(${i})">Delete</button>
      `;
      list.appendChild(card);
    });
}
window.toggleSolved = function(idx) {
  problems[idx].solved = !problems[idx].solved;
  saveProblems(); renderProblems();
};
window.deleteProblem = function(idx) {
  problems.splice(idx, 1);
  saveProblems(); renderProblems();
};
function saveProblems() { localStorage.setItem("problems", JSON.stringify(problems)); }

// ---- Add Problem ----
document.getElementById('addProblemForm').onsubmit = function(e) {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const topic = document.getElementById('topic').value.trim();
  const platform = document.getElementById('platform').value;
  const difficulty = document.getElementById('difficulty').value;
  const link = document.getElementById('link').value.trim();
  if (!title || !topic || !platform || !difficulty) return;
  problems.push({ title, topic, platform, difficulty, link, solved: false });
  saveProblems(); renderProblems();
  this.reset();
};
// ---- Filters ----
['filterPlatform','filterDifficulty','filterSolved','searchBar'].forEach(id =>
  document.getElementById(id).addEventListener('input', renderProblems)
);
window.onload = renderProblems;