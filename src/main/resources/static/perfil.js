// Verificar sesión activa
const clienteId = localStorage.getItem("clienteId");
const usuarioId = localStorage.getItem("usuarioId");

if (!clienteId || !usuarioId) {
  alert("Por favor, inicia sesión para ver tu perfil.");
  window.location.href = "index.html";
}

// Cargar información del perfil
function cargarDatosPerfil() {
  fetch(`http://localhost:8080/cliente/${clienteId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success && data.data) {
        const nombre = data.data.nombreCompleto || data.data.nombre || "";
        const direccion = data.data.direccionEnvio || data.data.direccion || "";

        document.getElementById("perfilNombre").value = nombre;
        document.getElementById("perfilTelefono").value =
          data.data.telefono || "";
        document.getElementById("perfilDireccion").value = direccion;
      }
    })
    .catch((error) => console.error("Error al cargar el perfil:", error));
}

// Guardar cambios del perfil
document
  .getElementById("formEditarPerfil")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const clienteActualizado = {
      nombre: document.getElementById("perfilNombre").value,
      telefono: document.getElementById("perfilTelefono").value,
      direccion: document.getElementById("perfilDireccion").value,
    };

    fetch(`http://localhost:8080/cliente/update/${clienteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clienteActualizado),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("¡Tus datos han sido actualizados exitosamente!");
          cargarDatosPerfil();
        } else {
          alert("Hubo un error al actualizar: " + data.message);
        }
      })
      .catch((error) => console.error("Error al guardar perfil:", error));
  });

// Mostrar historial de compras
function cargarHistorialPerfil() {
  fetch(`http://localhost:8080/orden/cliente/${clienteId}`)
    .then((response) => response.json())
    .then((data) => {
      const contenedor = document.getElementById("listaMisComprasPerfil");

      if (data.success && data.data.length > 0) {
        let html = "";
        data.data.reverse().forEach((orden) => {
          let colorEstado =
            orden.estadoEnvio === "Preparando"
              ? "bg-warning text-dark"
              : orden.estadoEnvio === "Enviado"
                ? "bg-primary"
                : "bg-success";

          let listaArticulos = "";
          if (orden.detalles && orden.detalles.length > 0) {
            orden.detalles.forEach((item) => {
              // Extraer datos incluyendo imagen e ID
              let nombreProd = item.producto
                ? item.producto.titulo
                : "Producto";
              let imagenProd =
                item.producto && item.producto.urlImagen
                  ? item.producto.urlImagen
                  : "https://placehold.co/100x100/eeeeee/333333?text=Sin+Imagen";
              let idProd = item.producto ? item.producto.id : 0;
              let descProd =
                item.producto && item.producto.descripcion
                  ? item.producto.descripcion
                  : "sin-descripcion";
              let nombreUrl = encodeURIComponent(
                nombreProd.trim().toLowerCase().replace(/\s+/g, "-"),
              );

              let descUrl = encodeURIComponent(
                descProd
                  .trim()
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .substring(0, 50),
              );

              // Estructura con imagen miniatura y evento onclick
              listaArticulos += `
               <li class="list-group-item list-group-item-action d-flex justify-content-between align-items-center px-2 py-2" style="font-size: 14px; cursor: pointer;" onclick="window.location.href='detalle.html?id=${idProd}&nombre=${nombreUrl}&descripcion=${descUrl}'">
                    <div class="d-flex align-items-center" style="width: 75%;">
                        <span class="badge bg-light text-dark border me-2">${item.cantidad}x</span>
                        <img src="${imagenProd}" alt="${nombreProd}" style="width: 40px; height: 40px; object-fit: contain; background-color: #ffffff;" class="rounded border me-2 p-1">
                        <span class="text-truncate" title="${nombreProd}">${nombreProd}</span>
                    </div>
                    <span class="text-muted fw-bold">$${formatearPrecio(item.cantidad * item.precioUnitario)}</span>
                </li>`;
            });
          } else {
            listaArticulos = `<li class="list-group-item px-0 py-1 border-0 text-muted small">Detalles no disponibles</li>`;
          }

          html += `
            <div class="card shadow-sm border-0 border-start border-4 border-primary mb-3">
                <div class="card-header bg-white d-flex justify-content-between align-items-center">
                    <small class="text-muted fw-bold">PEDIDO N° ${orden.id}</small>
                    <span class="badge ${colorEstado}">${orden.estadoEnvio || "Procesando"}</span>
                </div>
                <div class="card-body pb-2">
                    <p class="mb-1 fw-bold">Total: $${formatearPrecio(orden.total)}
                    <button onclick="toggleDetallesPerfil(${orden.id})" class="btn btn-sm btn-link p-0 text-decoration-none">Ver artículos comprados ↓</button>

                    <div id="detalles-perfil-${orden.id}" class="mt-2 pt-2 border-top" style="display: none;">
                        <ul class="list-group list-group-flush bg-transparent">
                            ${listaArticulos}
                        </ul>
                    </div>
                </div>
            </div>`;
        });
        contenedor.innerHTML = html;
      } else {
        contenedor.innerHTML =
          '<div class="text-center text-muted p-4">Aún no has realizado ninguna compra.</div>';
      }
    })
    .catch((error) => console.error("Error al cargar historial: ", error));
}

// Alternar vista de detalles del pedido
function toggleDetallesPerfil(idOrden) {
  const caja = document.getElementById(`detalles-perfil-${idOrden}`);
  caja.style.display = caja.style.display === "none" ? "block" : "none";
}

// Cerrar sesión del usuario
document
  .getElementById("btnCerrarSesionPerfil")
  .addEventListener("click", function () {
    localStorage.clear();
    window.location.href = "index.html";
  });
function formatearPrecio(precio) {
  return Number(precio).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
// Inicialización de datos
cargarDatosPerfil();
cargarHistorialPerfil();
