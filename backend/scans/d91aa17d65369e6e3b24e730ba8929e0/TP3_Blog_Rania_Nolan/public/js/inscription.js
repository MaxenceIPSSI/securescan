const form = document.getElementById("registerForm");
const message = document.getElementById("inscriptionMessage");
 
form.addEventListener("submit", async (e) => {
    e.preventDefault();
 
    const formData = new FormData(form);
 
    const data = {
        userName: formData.get("userName").trim(),
        mail: formData.get("mail").trim(),
        password: formData.get("password").trim()
    };
 
    console.log("Password envoyé :", data.password); 
 
    try {
        const response = await fetch("/api/inscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
 
        const result = await response.json();
 
       
        message.textContent = result.message;
        message.style.color = result.success ? "green" : "red";
 
        if (result.success) form.reset();
    } catch (err) {
        console.error(err);
        message.textContent = "Erreur serveur";
        message.style.color = "red";
    }
});
 