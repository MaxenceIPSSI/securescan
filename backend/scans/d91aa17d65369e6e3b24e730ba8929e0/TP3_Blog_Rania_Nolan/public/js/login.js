const form = document.querySelector("#loginForm"); 

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => data[key] = value);

    try {
        const res = await fetch("http://localhost:8003/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (!res.ok) {
            alert(result.error || "Erreur de connexion");
        } else {
            alert("Connexion réussie !");
            window.location.href = "/index.html"; 
        }
    } catch (err) {
        console.error(err);
        alert("Erreur serveur");
    }
});
