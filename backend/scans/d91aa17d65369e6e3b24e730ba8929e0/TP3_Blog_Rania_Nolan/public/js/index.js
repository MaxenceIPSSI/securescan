const goLoginBtn = document.getElementById("goLogin");
const goRegisterBtn = document.getElementById("goRegister");
const createArticleBtn = document.getElementById("createArticle");


goLoginBtn.addEventListener("click", () => window.location.href = "/login");
goRegisterBtn.addEventListener("click", () => window.location.href = "/inscription");


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
}


const initAuthButtons = async () => {
    const loggedIn = await checkAuth();

    if (loggedIn) {
        
        goLoginBtn.style.display = "none";
        goRegisterBtn.style.display = "none";

        
        if (createArticleBtn) {
            createArticleBtn.style.display = "inline-block";
            createArticleBtn.addEventListener("click", () => {
                window.location.href = "/createArticle.html";
            });
        }

        
        const logoutBtn = document.createElement("button");
        logoutBtn.textContent = "Se déconnecter";
        logoutBtn.classList.add("auth-button");
        logoutBtn.addEventListener("click", async () => {
            await fetch("/api/logout", { method: "POST", credentials: "include" });
            window.location.reload();
        });

        document.querySelector(".auth-buttons").appendChild(logoutBtn);

    } else {        
        if (createArticleBtn) createArticleBtn.style.display = "none";
    }
}

initAuthButtons();


const container = document.querySelector('#container');
const list = document.querySelector("#list");


getArticles("/api/article");

async function getArticles(link) {
    try {
        const request = await fetch(link, { method: "GET", headers: { "Content-Type": "application/json" } });

        if (!request.ok) {
            throw new Error("Impossible de récupérer les articles");
        }

        const data = await request.json();
        console.log("Articles récupérés :", data);
        listArticles(data);

    } catch (error) {
        console.error(error);
        container.textContent = "Impossible de charger les articles";
    }
}


function listArticles(articles) {
    list.innerHTML = "";
    articles.forEach(article => {
        const li = document.createElement("li");
        li.classList.add("article-item");

        // Titre article
        const title = document.createElement("span");
        title.textContent = article.title;
        li.appendChild(title);

        // Bouton détails
        const detailBtn = document.createElement("button");
        detailBtn.textContent = "Voir détails";
        detailBtn.addEventListener("click", () => {
            window.location.href = `article.html?id=${article.id}`;
        });
        li.appendChild(detailBtn);

        list.appendChild(li);
    });
}
