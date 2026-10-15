// Verificación de sesión de administrador
const usuarioId = localStorage.getItem("usuarioId");
if (!usuarioId) {
  window.location.href = "index.html";
}

let tiendaSeleccionadaId = null;

// Cargar y mostrar lista de tiendas registradas
function cargarTiendasAdmin() {
  //  fetch("http://localhost:8080/tienda/findAll/")
  fetch("/tienda/findAll/")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const tbody = document.getElementById("tablaTiendasBody");
        tbody.innerHTML = "";

        document.getElementById("contadorTiendas").innerText =
          `${data.data.length} Negocios Registrados`;

        data.data.forEach((tienda) => {
          const isActiva = tienda.activo !== false;

          const ventasTotales = tienda.totalVentas || 0;
          const calificacion = tienda.calificacionPromedio || 0;

          const logo = tienda.urlLogo
            ? `<img src="${tienda.urlLogo}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 5px;">`
            : `<span class="text-muted small">Sin logo</span>`;

          const badgeEstado = isActiva
            ? `<span class="badge bg-success">Operando</span>`
            : `<span class="badge bg-danger">Suspendida</span>`;

          // Lógica para evaluar el prestigio de la tienda
          let badgePrestigio = "";
          if (calificacion >= 4.5)
            badgePrestigio = `<span class="badge bg-success">⭐ Muy Buena (${calificacion})</span>`;
          else if (calificacion >= 3.0)
            badgePrestigio = `<span class="badge bg-warning text-dark">⭐ Regular (${calificacion})</span>`;
          else if (calificacion >= 1.0)
            badgePrestigio = `<span class="badge bg-danger">⭐ Mala (${calificacion})</span>`;
          else
            badgePrestigio = `<span class="badge bg-secondary">Sin calificar</span>`;

          // Si está activa, el botón abre el modal. Si no, restaura directamente.
          const btnAccion = isActiva
            ? `<button onclick="prepararSuspension(${tienda.id}, '${tienda.nombreTienda}')" class="btn btn-sm btn-outline-danger w-100">Suspender</button>`
            : `<button onclick="enviarEstadoTienda(${tienda.id}, 'restaurar', '')" class="btn btn-sm btn-outline-success w-100">Restaurar</button>`;

          const filaEstilo = isActiva
            ? ""
            : "opacity: 0.7; background-color: #f8f9fa;";

          tbody.innerHTML += `
                        <tr style="${filaEstilo}">
                            <td class="align-middle fw-bold">${tienda.id}</td>
                            <td class="align-middle">${logo}</td>
                            <td class="align-middle fw-bold">${tienda.nombreTienda}</td>
                            <td class="align-middle font-monospace small">${tienda.rfc}</td>
                            <td class="align-middle text-center fw-bold">${ventasTotales}</td>
                            <td class="align-middle text-center">${badgePrestigio}</td>
                            <td class="align-middle">${badgeEstado}</td>
                            <td class="align-middle text-center">${btnAccion}</td>
                        </tr>
                    `;
        });
      }
    })
    .catch((error) => console.error("Error al cargar tiendas:", error));
}

// Abre la ventana para redactar el motivo de suspensión
window.prepararSuspension = function (idTienda, nombreTienda) {
  tiendaSeleccionadaId = idTienda;
  document.getElementById("nombreTiendaSuspender").innerText = nombreTienda;
  document.getElementById("motivoSuspension").value = "";
  const modal = new bootstrap.Modal(document.getElementById("modalSuspender"));
  modal.show();
};

// Acción del botón del modal para confirmar la suspensión
document
  .getElementById("btnConfirmarSuspension")
  .addEventListener("click", () => {
    const motivo = document.getElementById("motivoSuspension").value;
    if (!motivo.trim()) {
      alert("Debes escribir un motivo para suspender a la tienda.");
      return;
    }

    // Deshabilitar botón para evitar dobles clics
    document.getElementById("btnConfirmarSuspension").innerText = "Enviando...";
    document.getElementById("btnConfirmarSuspension").disabled = true;

    enviarEstadoTienda(tiendaSeleccionadaId, "suspender", motivo);
  });

// Enviar petición al backend
function enviarEstadoTienda(idTienda, accion, motivo) {
  //  fetch(`http://localhost:8080/tienda/toggle-status/${idTienda}`, {
  fetch(`/tienda/toggle-status/${idTienda}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    // Enviamos el motivo en el body de la petición para que el backend arme el correo
    body: JSON.stringify({ motivo: motivo, accion: accion }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert(
          accion === "suspender"
            ? "Tienda suspendida y correo enviado."
            : "Tienda restaurada con éxito.",
        );

        // Si el modal estaba abierto, cerrarlo
        const modalElement = document.getElementById("modalSuspender");
        if (modalElement.classList.contains("show")) {
          const modalInstance = bootstrap.Modal.getInstance(modalElement);
          modalInstance.hide();
          document.getElementById("btnConfirmarSuspension").innerText =
            "Confirmar y Enviar Correo";
          document.getElementById("btnConfirmarSuspension").disabled = false;
        }

        cargarTiendasAdmin();
      } else {
        alert("Error de moderación: " + data.message);
      }
    })
    .catch((error) => console.error("Error:", error));
}

document
  .getElementById("btnCerrarSesionAdmin")
  .addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "index.html";
  });

cargarTiendasAdmin();
