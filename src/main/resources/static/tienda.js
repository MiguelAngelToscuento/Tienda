//validar que el usuario haya iniciado sesión

const usuarioId = localStorage.getItem("usuarioId");

if(!usuarioId){
    alert("Debes iniciar sesión primero");
    window.location.href = "index.html"; // se redirecciona al usuario a la ventana del login
}

document.getElementById("formTienda").addEventListener("submit", function (e){
    e.preventDefault(); //prevenir que la página no se recargue

    //obtener los datos del form
    const nombre = document.getElementById("nombreTienda").value;
    const rfc = document.getElementById("rfcTienda").value;
    const urlLogo = document.getElementById("logoTienda").value;

    //objeto con la info obtenida
    const nuevaTienda = {
        usuario:
            {
                id: parseInt(usuarioId)
            },
        nombreTienda: nombre,
        rfc: rfc,
        urlLogo: urlLogo
    };

    //se manda al TiendaController del java
    fetch("http://localhost:8080/tienda/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaTienda),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                alert("¡Tienda configurada con éxito!");
                // guardar el ID de la tienda
                localStorage.setItem("tiendaId", data.data.id);

                window.location.href = "dashboard.html";
            } else {
                alert("Error al guardar la tienda: " + data.message);
            }
        })
        .catch((error) => console.error("Error: ", error));
});
