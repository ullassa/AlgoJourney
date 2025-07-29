// Your Firebase Config
const firebaseConfig = {
apiKey: "AIzaSyAbcqS58TX6OSF_x3DMKWIXgBlZQvOv4e4",
  authDomain: "algolog-tracker.firebaseapp.com",
  projectId: "algolog-tracker",
  // ... Add other fields if needed
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Load user info when authenticated
auth.onAuthStateChanged(async (user) => {
  if (user) {
    document.getElementById("userEmail").textContent = user.email;
    document.getElementById("joinedDate").textContent = new Date(user.metadata.creationTime).toDateString();

    const docRef = db.collection("users").doc(user.uid);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const data = docSnap.data();

      document.getElementById("userName").textContent = data.name || "No Name";
      document.getElementById("totalProblems").textContent = data.totalProblems || 0;
      document.getElementById("solvedCount").textContent = data.solved || 0;
      document.getElementById("unsolvedCount").textContent = data.unsolved || 0;
      document.getElementById("lastActive").textContent = data.lastActive || "--";

      const solved = data.solved || 0;
      const total = data.totalProblems || 0;
      const rate = total > 0 ? Math.round((solved / total) * 100) : 0;
      document.getElementById("successRate").textContent = rate + "%";
    } else {
      document.getElementById("userName").textContent = "New User";
    }
  } else {
    window.location.href = "index.html"; // Redirect to home if not logged in
  }
});
