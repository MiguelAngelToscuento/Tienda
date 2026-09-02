//seguridad y sesion
const usuarioId = localStorage.getItem("usuarioId");
const tiendaId = localStorage.getItem("tiendaId");

if(!usuarioId){
    alert("Acceso denegado. Por favor, inicia sesión.");
    window.location.href = "index.html";
}

//para el botón de cerrar sesión
document.getElementById("btnCerrarSesion").addEventListener("click", function() {
    //se limía el localStorage para borrar el rastro del usuaio
    localStorage.clear();
    alert("Sesion cerrada correctamente.");
    window.location.href = "index.html";
});


// guardar y actualizar productos

document.getElementById("formProducto").addEventListener("submit", function(e) {
    e.preventDefault();

    const idProducto = document.getElementById("prodId").value; // se lee si hay ids ocultos
    //cada para mandar archivos y textos
    const formData = new FormData();
    formData.append("titulo", document.getElementById("prodNombre").value);
    formData.append("precio", document.getElementById("prodPrecio").value);
    formData.append("stock", document.getElementById("prodStock").value);
    formData.append("categoria", document.getElementById("prodCategoria").value);
    formData.append("descripcion", document.getElementById("prodDescripcion").value);
    formData.append("tiendaId", tiendaId);

    //captura de la imagen
    const inputImagen = document.getElementById("prodImagen");
    //verificacion si elusuario seleccionó un archivo
    if(inputImagen.files.length > 0){
        formData.append("archivoImagen", inputImagen.files[0]);
    }

    // logica si hay un id es put actualizar, si no hay id es post para crear
       const url = idProducto ? `http://localhost:8080/producto/update/${idProducto}` : "http://localhost:8080/producto/save";
       const metodo = idProducto ? "PUT" : "POST";

    fetch(url, {
        method: metodo,
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(idProducto ? "Producto actualizado exitosamente." : "Producto publicado exitosamente.");
            const miModal = document.getElementById('modalAgregarProducto');
            const modalBootstrap = bootstrap.Modal.getOrCreateInstance(miModal);
            modalBootstrap.hide();
            cargarProductos(); // Refrescar la malla
        } else {
            alert("Error al guardar: " + data.message);
        }
    })
    .catch(error => console.error("Error al procesar el producto: ", error));
});

// editar producto
function editarProducto(id, titulo, precio, stock, categoria, descripcion, urlImagen){
    document.getElementById("tituloModalProducto").innerText = "Editar Artículo";

        // Llenar el formulario
        document.getElementById("prodId").value = id;
        document.getElementById("prodNombre").value = titulo;
        document.getElementById("prodPrecio").value = precio;
        document.getElementById("prodStock").value = stock;
        document.getElementById("prodCategoria").value = categoria;
        document.getElementById("prodDescripcion").value = descripcion;
        document.getElementById("prodImagen").value = "";

        const miModal = document.getElementById('modalAgregarProducto');
        const modalBootstrap = bootstrap.Modal.getOrCreateInstance(miModal);
        modalBootstrap.show();
}

// resetar modal
document.getElementById("btnAgregarProd").addEventListener("click", function() {
    document.getElementById("tituloModalProducto").innerText = "Registrar un Artículo";
    document.getElementById("formProducto").reset();
    document.getElementById("prodId").value = "";
});

//eliminar producto

function eliminarProducto(idProducto) {
    const confirmar = confirm("¿Estás seguro de que deseas eliminar este producto?");
    if (confirmar) {
        fetch(`http://localhost:8080/producto/delete/${idProducto}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Producto eliminado.");
                cargarProductos();
            } else {
                alert("Error al eliminar: " + data.message);
            }
        })
        .catch(error => console.error("Error al eliminar producto:", error));
    }
}

//cargar productos

function cargarProductos(){
    fetch(`http://localhost:8080/producto/tienda/${tiendaId}`)
        .then(response => response.json())
        .then(data => {
            const contenedorLista = document.getElementById("listaProductos");

            if(data.success && data.data.length > 0){
                let html = "";
                data.data.forEach(prod => {
                    const imagen = prod.urlImagen || "https://via.placeholder.com/150?text=Sin+Imagen";
                    const isActivo = prod.activo !== false; // true o null es activo
                    const cardEstilo = isActivo ? "" : "opacity: 0.6; filter: grayscale(80%); background-color: #f8f9fa;";
                    const badgeEtiqueta = isActivo ? "" : `<span class="badge bg-danger position-absolute" style="top: 10px; right: 10px; z-index: 2;">Inactivo</span>`;
                    const botonAccion = isActivo
                                            ? `<button onclick="eliminarProducto(${prod.id})" class="btn btn-sm btn-outline-danger">Eliminar</button>`
                                            : `<button onclick="reactivarProducto(${prod.id})" class="btn btn-sm btn-outline-success">Reactivar</button>`;
                   html +=
                                           `<div class="col-md-4 col-sm-6 mb-4">
                                               <div class="card h-100 shadow-sm position-relative" style="${cardEstilo}">
                                                   ${badgeEtiqueta}
                                                   <img src="${imagen}" class="card-img-top" alt="${prod.titulo}" style="height: 200px; object-fit: cover;">
                                                   <div class="card-body">
                                                       <h5 class="card-title text-truncate">${prod.titulo}</h5>
                                                       <p class="card-text text-muted mb-1">Precio: $${prod.precio.toFixed(2)}</p>
                                                       <p class="card-text text-muted">Stock: ${prod.stock} unidades</p>
                                                   </div>
                                                   <div class="card-footer border-top-0 d-flex justify-content-between" style="background-color: transparent;">
                                                       <button onclick="editarProducto(${prod.id}, '${prod.titulo}', ${prod.precio}, ${prod.stock}, '${prod.categoria}', '${prod.descripcion}', '${prod.urlImagen}')" class="btn btn-sm btn-outline-primary">Editar</button>
                                                       ${botonAccion}
                                                   </div>
                                               </div>
                                           </div>`;
                                   });
                contenedorLista.innerHTML = html;
            } else {
                contenedorLista.innerHTML = '<div class="col-12 text-center text-muted"><p>Aún no tienes productos registrados.</p></div>';
            }
        })
        .catch(error => console.error("Error al cargar productos", error));
}


//reactivar producto
// Reactivar producto
function reactivarProducto(idProducto) {
    const confirmar = confirm("¿Deseas volver a activar este producto para que aparezca en el catálogo público?");
    if (confirmar) {
        fetch(`http://localhost:8080/producto/reactivate/${idProducto}`, {
            method: 'PUT'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Producto reactivado exitosamente.");
                cargarProductos();
            } else {
                alert("Error al reactivar: " + data.message);
            }
        })
        .catch(error => console.error("Error al reactivar producto:", error));
    }
}

//cargar info de la tienda en ecabezado
function cargarInfoTienda(){
    const idDelUsuario = localStorage.getItem("usuarioId");
    fetch(`http://localhost:8080/tienda/usuario/${idDelUsuario}`)
    .then(response => response.json())
    .then(data => {
        if(data.success && data.data != null){
            document.getElementById("textoNombreTienda").innerText = data.data.nombreTienda;
            if(data.data.urlLogo){
                const imgLogo = document.getElementById("imgLogoTienda");
                imgLogo.src = data.data.urlLogo;
                imgLogo.style.display = "block";
            }
        }
    })
    .catch(error => console.error("Error al cargar la tienda: ", error));
}

//iniciar
cargarProductos();
cargarInfoTienda();

