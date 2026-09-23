// Verificar sesión activa del usuario
const usuarioId = localStorage.getItem("usuarioId");

if (!usuarioId) {
  alert("Debes iniciar sesión primero");
  window.location.href = "index.html";
}

// Guardar perfil de la nueva tienda
document.getElementById("formTienda").addEventListener("submit", function (e) {
  e.preventDefault();

  // Preparar los datos y archivos para el envío
  const formData = new FormData();
  formData.append("nombreTienda", document.getElementById("nombreTienda").value);
  formData.append("rfc", document.getElementById("rfcTienda").value);
  formData.append("usuarioId", usuarioId);

  // Adjuntar el archivo del logo si el usuario seleccionó uno
  const inputLogo = document.getElementById("logoTienda");
  if (inputLogo.files.length > 0) {
    formData.append("archivoLogo", inputLogo.files[0]);
  }

  // Enviar los datos de la tienda al servidor
  fetch("http://localhost:8080/tienda/save", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("¡Tienda configurada con éxito!");
        localStorage.setItem("tiendaId", data.data.id);
        window.location.href = "dashboard.html";
      } else {
        alert("Error al guardar la tienda: " + data.message);
      }
    })
    .catch((error) => console.error("Error al registrar tienda: ", error));
});