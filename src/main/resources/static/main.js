// Seleccionar y guardar el rol del usuario (Vendedor/Comprador)
function seleccionarRol(idRol) {
  document.getElementById("regRol").value = idRol;

  if (idRol === 2) {
    document.getElementById("tabVendedor").classList.add("active");
    document.getElementById("tabComprador").classList.remove("active");
  } else {
    document.getElementById("tabComprador").classList.add("active");
    document.getElementById("tabVendedor").classList.remove("active");
  }
  mostrarRegistro();
}

// Mostrar formulario de registro
function mostrarRegistro() {
  document.getElementById("cajaLogin").style.display = "none";
  document.getElementById("cajaRegistro").style.display = "block";
  document.getElementById("botonesRol").style.display = "flex";
}

// Mostrar formulario de inicio de sesión
function mostrarLogin() {
  document.getElementById("botonesRol").style.display = "none";
  document.getElementById("cajaRegistro").style.display = "none";
  document.getElementById("cajaLogin").style.display = "block";
}

// Procesar registro de nuevo usuario
document
  .getElementById("formRegistro")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const correo = document.getElementById("regCorreo").value;
    const contrasena = document.getElementById("regPassword").value;
    const rolSeleccionado = document.getElementById("regRol").value;

    const nuevoUser = {
      correo: correo,
      contrasena: contrasena,
      estado: 1,
      rol: { id: parseInt(rolSeleccionado) },
    };

    //fetch("http://localhost:8080/usuario/save", {
    fetch("/usuario/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoUser),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("¡Usuario registrado con éxito!");
          document.getElementById("formRegistro").reset();
          mostrarLogin();
          document.getElementById("logCorreo").value = correo;
        } else {
          alert("Error: " + data.message);
        }
      })
      .catch((error) => console.error("Error al registrar:", error));
  });

// Procesar inicio de sesión
document.getElementById("formLogin").addEventListener("submit", function (e) {
  e.preventDefault();

  const correo = document.getElementById("logCorreo").value;
  const contrasena = document.getElementById("logPassword").value;

  const credenciales = {
    correo: correo,
    contrasena: contrasena,
  };

  //fetch("http://localhost:8080/usuario/login", {
  fetch("/usuario/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credenciales),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("¡Bienvenido!");
        localStorage.setItem("usuarioId", data.data.id);
        const rolId = data.data.rol.id;

        // Redirección según rol del usuario
        if (rolId === 1) {
          window.location.href = "panel-admin.html";
        } else if (rolId === 2) {
          // Verificar si el vendedor ya tiene una tienda registrada
          //fetch(`http://localhost:8080/tienda/usuario/${data.data.id}`)
          fetch(`/tienda/usuario/${data.data.id}`)
            .then((res) => res.json())
            .then((tiendaData) => {
              if (tiendaData.success && tiendaData.data != null) {
                localStorage.setItem("tiendaId", tiendaData.data.id);
                window.location.href = "dashboard.html";
              } else {
                window.location.href = "registro-tienda.html";
              }
            })
            .catch((error) =>
              console.error("Error al verificar tienda:", error),
            );
        } else if (rolId === 3) {
          // Verificar si el comprador ya tiene datos de envío registrados
          //          fetch(`http://localhost:8080/cliente/usuario/${data.data.id}`)
          fetch(`/cliente/usuario/${data.data.id}`)
            .then((res) => res.json())
            .then((clienteData) => {
              if (clienteData.success && clienteData.data != null) {
                localStorage.setItem("clienteId", clienteData.data.id);
                window.location.href = "catalogo.html";
              } else {
                window.location.href = "registro-cliente.html";
              }
            })
            .catch((error) =>
              console.error("Error al verificar cliente:", error),
            );
        }
      } else {
        alert("Credenciales incorrectas");
      }
    })
    .catch((error) => console.error("Error en el login: ", error));
});

const btnRecuperar = document.getElementById("btnEnviarRecuperacion");

if (btnRecuperar) {
  btnRecuperar.addEventListener("click", function () {
    const email = document.getElementById("inputCorreoRecuperacion").value;

    if (!email) {
      alert("Por favor, ingresa tu correo electrónico.");
      return;
    }

    // Cambiar el botón a estado de carga para evitar doble clic
    btnRecuperar.innerText = "Enviando...";
    btnRecuperar.disabled = true;

    //fetch("http://localhost:8080/usuario/solicitar-recuperacion", {
    fetch("/usuario/solicitar-recuperacion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert(
            "¡Éxito! Revisa tu bandeja de entrada o spam. Te hemos enviado una contraseña temporal.",
          );
          // Ocultar modal limpiamente
          const modalElement = document.getElementById("modalRecuperar");
          const modalInstancia = bootstrap.Modal.getInstance(modalElement);
          modalInstancia.hide();
        } else {
          alert("Error: " + data.message);
        }
      })
      .catch((error) => console.error("Error al recuperar:", error))
      .finally(() => {
        // Restaurar el botón
        btnRecuperar.innerText = "Enviar Correo";
        btnRecuperar.disabled = false;
        document.getElementById("inputCorreoRecuperacion").value = "";
      });
  });
}
