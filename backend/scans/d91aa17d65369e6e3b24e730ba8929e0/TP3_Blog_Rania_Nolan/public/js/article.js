const titleEl = document.querySelector("#title");
const contentEl = document.querySelector("#content");
const authorEl = document.querySelector("#author");


const goLoginBtn = document.getElementById("goLogin");
const goRegisterBtn = document.getElementById("goRegister");

const checkAuth = async () => {
    try {
        const res = await fetch("/api/me", {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" }
        });
        const data = await res.json();
        return data.loggedIn;
    } catch {
        return false;
    }
};

const initAuthButtons = async () => {
    const loggedIn = await checkAuth();

    if (loggedIn) {
        goLoginBtn.style.display = "none";
        goRegisterBtn.style.display = "none";

        const logoutBtn = document.createElement("button");
        logoutBtn.textContent = "Se déconnecter";
        logoutBtn.classList.add("auth-button");
        logoutBtn.addEventListener("click", async () => {
            await fetch("/api/logout", { method: "POST", credentials: "include" });
            window.location.reload();
        });
        document.querySelector(".auth-buttons").appendChild(logoutBtn);
    } else {
        goLoginBtn.addEventListener("click", () => window.location.href = "/login");
        goRegisterBtn.addEventListener("click", () => window.location.href = "/inscription");
    }
};

initAuthButtons();


const params = new URLSearchParams(window.location.search);
const articleId = params.get("id");

const getArticle = async (id) => {
    try {
        const response = await fetch(`http://localhost:8003/api/article/${id}`);
        if (!response.ok) throw new Error("Impossible de récupérer l'article");

        const data = await response.json();
        titleEl.textContent = data.title;
        contentEl.textContent = data.content;

        if (data.user) {
            authorEl.textContent = "Auteur : " + data.user.userName;
        }

    } catch (error) {
        console.error(error);
        contentEl.textContent = "Impossible de charger l'article";
    }
};

if (articleId) {
    getArticle(articleId);
}
