//funcion para cambiar entre pestañas y guardar el rol
function seleccionarRol(idRol){
    document.getElementById("regRol").value = idRol;

    //se cambia el color de las pestañas
    if(idRol === 2){
        document.getElementById("tabVendedor").classList.add("active");
        document.getElementById("tabComprador").classList.remove("active");
    } else {
        document.getElementById("tabComprador").classList.add("active");
        document.getElementById("tabVendedor").classList.remove("active");
    }
    mostrarRegistro();
}

//funcion para cambiar entre registro y login
function mostrarRegistro(){
    document.getElementById("cajaLogin").style.display = "none";
    document.getElementById("cajaRegistro").style.display = "block";
    document.getElementById("botonesRol").style.display = "flex";
}

function mostrarLogin(){
    document.getElementById("botonesRol").style.display = "none";
    document.getElementById("cajaRegistro").style.display = "none";
    document.getElementById("cajaLogin").style.display = "block";

}

//para el registro
document
  .getElementById("formRegistro")
  .addEventListener("submit", function (e) {
    e.preventDefault(); // evitar que la pagina no se revargue

    const correo = document.getElementById("regCorreo").value; // obtener el correo del formulario
    const contrasena = document.getElementById("regPassword").value; // obtener la contrasena del form

      const rolSeleccionado = document.getElementById("regRol").value;
    const nuevoUser = {
      // info del nuevo usuario
      correo: correo,
      contrasena: contrasena,
      estado: 1,
      rol: { id: parseInt(rolSeleccionado) },
    };

    fetch("http://localhost:8080/usuario/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoUser),
    })
      .then((response) => response.json())
      .then((data) => {
          console.log("info", data);
        if (data.success) {
          alert("¡Usuario registrado con éxito");
          document.getElementById("formRegistro").reset(); // el formulario se vacia
        } else {
          alert("Error: " + data.message);
        }
      })
      .catch((error) => console.error("Error: ", error));
  });

// para el login
document.getElementById("formLogin").addEventListener("submit", function (e) {
  e.preventDefault(); // prevenir que se recargue la pagina

  const correo = document.getElementById("logCorreo").value;
  const contrasena = document.getElementById("logPassword").value;

  const credenciales = {
    correo: correo,
    contrasena: contrasena,
  }; //info del usuario ya registrado en el login

    fetch("http://localhost:8080/usuario/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credenciales),
    })
        .then((response) => response.json())
        .then((data) => {

            //  Primero se checa que el correo y contraseña sean correctos
            if (data.success) {
                alert("¡Bienvenido!");
                localStorage.setItem("usuarioId", data.data.id);
                const rolId = data.data.rol.id;
                if(rolId === 1){
                    window.location.href="panel-admin.html";
                } else if(rolId === 2){
                    // se le pregunta a java si el usuario ya tiene tienda
                    fetch(`http://localhost:8080/tienda/usuario/${data.data.id}`)
                        .then(res => res.json())
                        .then(tiendaData => {

                            // 3. Aquí adentro, la variable tiendaData ya existe
                            if(tiendaData.success && tiendaData.data != null) {
                                // Ya tiene tienda, lo mandamos a sus productos
                                localStorage.setItem("tiendaId", tiendaData.data.id);
                                window.location.href = "dashboard.html";
                            } else {
                                // Es nuevo, lo mandamos a crear el perfil de su negocio
                                window.location.href = "registro-tienda.html";
                            }

                        })
                        .catch(error => console.error("Error al verificar tienda:", error));
                } else if(rolId === 3){
                    // Se le pregunta a Java si el usuario ya tiene datos de envío (perfil de cliente)
                    fetch(`http://localhost:8080/cliente/usuario/${data.data.id}`)
                        .then(res => res.json())
                        .then(clienteData => {
                            if(clienteData.success && clienteData.data != null) {
                                // Ya tiene perfil, se guarda su id de cliente y se manda al catálogo
                                localStorage.setItem("clienteId", clienteData.data.id);
                                window.location.href = "catalogo.html";
                            } else {
                                // Es nuevo, se a registrar sus datos de envío
                                window.location.href = "registro-cliente.html";
                            }
                        })
                        .catch(error => console.error("Error al verificar cliente:", error));
                }
            } else {
                alert("Credenciales incorrectas");
            }

        })
        .catch((error) => console.error("Error en el login: ", error));
});
