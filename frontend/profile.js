// For demo, static profile. Replace with fetch("/api/profile") in production.
const user = {
  name: "Ullas A.",
  username: "ullassa",
  email: "ullas@example.com",
  location: "India",
  role: "Student",
  accountType: "Free"
};
const problems = JSON.parse(localStorage.getItem("problems") || "[]");
document.getElementById("profileName").textContent = user.name;
document.getElementById("profileUsername").textContent = user.username;
document.getElementById("profileEmail").textContent = user.email;
document.getElementById("profileLocation").textContent = user.location;
document.getElementById("profileRole").textContent = user.role;
document.getElementById("profileAccountType").textContent = user.accountType;
// Stats
const total = problems.length;
const solved = problems.filter(p => p.solved).length;
const rate = total ? Math.round((solved/total)*100) : 0;
document.getElementById("profileTotal").textContent = total;
document.getElementById("profileSolved").textContent = solved;
document.getElementById("profileSuccessRate").textContent = rate + "%";
document.getElementById("profileStreak").textContent = "Coming Soon";
const lastSolved = problems.filter(p=>p.solved).pop();
document.getElementById("profileLastSolved").textContent = lastSolved ? lastSolved.title : "N/A";