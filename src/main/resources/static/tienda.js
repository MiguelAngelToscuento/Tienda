//validar que el usuario haya iniciado sesión

const usuarioId = localStorage.getItem("usuarioId");

if(!usuarioId){
    alert("Debes iniciar sesión primero");
    window.location.href = "index.html"; // se redirecciona al usuario a la ventana del login
}

document.getElementById("formTienda").addEventListener("submit", function (e){
    e.preventDefault(); //prevenir que la página no se recargue

    //formData para el envío de texto y archivos
    const formData = new FormData();
    formData.append("nombreTienda", document.getElementById("nombreTienda").value);
    formData.append("rfc", document.getElementById("rfcTienda").value);
    formData.append("usuarioId", usuarioId);

    const inputLogo = document.getElementById("logoTienda");
    if(inputLogo.files.length > 0){
        formData.append("archivoLogo", inputLogo.files[0]);
    }

    fetch("http://localhost:8080/tienda/save", {
            method: "POST",
            body: formData
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
            .catch((error) => console.error("Error: ", error));
});
