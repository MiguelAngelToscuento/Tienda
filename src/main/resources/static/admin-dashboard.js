// Verificar que sea un administrador
const usuarioId = localStorage.getItem("usuarioId");
if(!usuarioId){
    window.location.href = "index.html";
}

// Cargar el catálogo completo de tiendas
function cargarTiendasAdmin() {
    fetch("http://localhost:8080/tienda/findAll/")
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                const tbody = document.getElementById("tablaTiendasBody");
                tbody.innerHTML = "";

                document.getElementById("contadorTiendas").innerText = `${data.data.length} Negocios Registrados`;

                data.data.forEach(tienda => {
                    const isActiva = tienda.activo !== false;
                    const logo = tienda.urlLogo ? `<img src="http://localhost:8080${tienda.urlLogo}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 5px;">` : `<span class="text-muted">Sin logo</span>`;

                    const badgeEstado = isActiva
                        ? `<span class="badge bg-success">Operando</span>`
                        : `<span class="badge bg-danger">Suspendida</span>`;

                    const btnAccion = isActiva
                        ? `<button onclick="cambiarEstadoTienda(${tienda.id})" class="btn btn-sm btn-outline-danger">Suspender Tienda</button>`
                        : `<button onclick="cambiarEstadoTienda(${tienda.id})" class="btn btn-sm btn-outline-success">Restaurar Acceso</button>`;

                    // si la tienda está suspendida tiene opacidad
                    const filaEstilo = isActiva ? "" : "opacity: 0.7; background-color: #fdfdfd;";

                    tbody.innerHTML += `
                        <tr style="${filaEstilo}">
                            <td class="align-middle fw-bold">${tienda.id}</td>
                            <td class="align-middle">${logo}</td>
                            <td class="align-middle">${tienda.nombreTienda}</td>
                            <td class="align-middle font-monospace">${tienda.rfc}</td>
                            <td class="align-middle">${badgeEstado}</td>
                            <td class="align-middle text-center">
                                ${btnAccion}
                            </td>
                        </tr>
                    `;
                });
            }
        })
        .catch(error => console.error("Error al cargar tiendas:", error));
}

// Suspender o Reactivar una tienda
function cambiarEstadoTienda(idTienda) {
    if(confirm("¿Estás seguro de modificar el estado operativo de esta tienda?")) {
        fetch(`http://localhost:8080/tienda/toggle-status/${idTienda}`, {
            method: 'PUT'
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                cargarTiendasAdmin(); // Recargar la tabla para ver el cambio de estado
            } else {
                alert("Error de moderación: " + data.message);
            }
        })
        .catch(error => console.error("Error:", error));
    }
}

// Cerrar sesión
document.getElementById("btnCerrarSesionAdmin").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "index.html";
});

// Inicializar
cargarTiendasAdmin();