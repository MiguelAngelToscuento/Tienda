
//para el form del cliente comprador
document.getElementById("formCliente").addEventListener("submit", function (e) {
    e.preventDefault(); // prevenir que la página no se recargue

    // se obtiene el Id de la cuenta que se guarda en el login
    const usuarioId = localStorage.getItem("usuarioId");

    if(!usuarioId){
        alert("Error de sesión. Por favor, inicia sesión nuevamente.");
        window.location.href = "index.html";
        return;
    }

    // extraer la info del formulario
    const nombre = document.getElementById("nombreCliente").value;
    const telefono = document.getElementById("telCliente").value;
    const direccion = document.getElementById("dirCliente").value;

    //json para el nuevo cliente
    const nuevoCliente = {
        nombreCompleto: nombre,
        telefono: telefono,
        direccionEnvio: direccion,
        usuario:{
            id: parseInt(usuarioId)
        }
    };

    //se envia por fetch al springboot
    fetch("http://localhost:8080/cliente/save",{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(nuevoCliente),
    })
        .then((response) => response.json())
        .then((data) => {
            if(data.success){
                alert("¡Perfil guardado con éxito!");

                //se guarda el id de cliente para las compras
                localStorage.setItem("clienteId", data.data.id);
                //direccion para el catalogo principal de la tienda
                window.location.href = "catalogo.html";
            } else {
                alert("Hubo un error: "+ data.message);
            }
        })
        .catch((error) => console.error("Error al registrar al cliente: ", error));
});