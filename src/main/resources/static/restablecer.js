// Extraer el token secreto de la URL (ej. ?token=abcd-1234)
const params = new URLSearchParams(window.location.search);
const tokenUrl = params.get("token");

if (!tokenUrl) {
  alert("Enlace inválido. Vuelve a solicitar la recuperación.");
  window.location.href = "index.html";
}

document
  .getElementById("formRestablecer")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const pass1 = document.getElementById("nuevaPassword").value;
    const pass2 = document.getElementById("confirmarPassword").value;

    if (pass1 !== pass2) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    const btn = document.getElementById("btnGuardar");
    btn.innerText = "Guardando...";
    btn.disabled = true;

    //fetch("http://localhost:8080/usuario/reestablecer-contraseña", {
    fetch("/usuario/reestablecer-contraseña", {
      method: "POST",
      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({ token: tokenUrl, contraseña: pass1 }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("¡Listo! Tu contraseña ha sido cambiada.");
          window.location.href = "index.html"; // Mandarlo a iniciar sesión
        } else {
          alert("Error: " + data.message);
          btn.innerText = "Guardar Contraseña";
          btn.disabled = false;
        }
      })
      .catch((err) => {
        console.error(err);
        alert("Ocurrió un error en el servidor.");
        btn.innerText = "Guardar Contraseña";
        btn.disabled = false;
      });
  });
