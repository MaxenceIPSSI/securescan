 document.addEventListener("DOMContentLoaded", async () => { 
        const form = document.getElementById("createArticleForm");
        const message = document.getElementById("message");

       
        let currentUser = null;
        try {
            const res = await fetch("/api/me");
            const data = await res.json();

            if (data.loggedIn) {
                currentUser = data.user;
                console.log("Utilisateur connecté :", currentUser);
            } else {
                alert("Tu dois être connecté !");
                window.location.href = "/login";
                return;
            }
        } catch (err) {
            console.error(err);
            alert("Erreur serveur !");
            return;
        }

       
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const title = formData.get("title").trim();
            const content = formData.get("content").trim();

            if (!title || !content) {
                message.textContent = "Tous les champs sont requis";
                message.style.color = "red";
                return;
            }

            const payload = {
                title,
                content,
                userId: currentUser.id  
            };

            try {
                const res = await fetch("/api/article", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const result = await res.json();
                console.log("Result reçu :", result);
                message.textContent = result.message || "Article créé !";
                message.style.color = result.success ? "green" : "red";

                if (result.success) form.reset();
            } catch (err) {
                console.error(err);
                message.textContent = "Erreur serveur";
                message.style.color = "red";
            }
        });
    });