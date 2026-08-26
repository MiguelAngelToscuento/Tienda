//checar si hay una sesión activa
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


//guardar un nuevo producto
document.getElementById("formProducto").addEventListener("submit", function(e) {
    e.preventDefault();

    const nuevoProducto = {
            titulo: document.getElementById("prodNombre").value,
            precio: parseFloat(document.getElementById("prodPrecio").value),
            stock: parseInt(document.getElementById("prodStock").value),
            urlImagen: document.getElementById("prodImagen").value,

            categoria: document.getElementById("prodCategoria").value,
            descripcion: document.getElementById("prodDescripcion").value,
            tienda: { id: parseInt(tiendaId) }
    };

    fetch("http://localhost:8080/producto/save", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(nuevoProducto)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Producto publicado exitosamente.");
                 //cerrar el modal de bootstrap
                const miModal = document.getElementById('modalAgregarProducto');
                const modalBootstrap = bootstrap.Modal.getOrCreateInstance(miModal);
                modalBootstrap.hide();
                cargarProductos();
            } else {
                alert("Error al guardar: "+data.message);
            }
        })
        .catch(error => console.error("Error al registrar producto", error));
});

// editar producto
function editarProducto(id, titulo, precio, stock, categoria, descripcion, urlImagen) {
    //cambiar el título del modal
    document.getElementById("tituloModalProducto").innerText = "Editar Artículo";
    //llenar el form con datos actualizados
    document.getElementById("prodId").value = id;
    document.getElementById("prodNombre").value = titulo;
    document.getElementById("pordStock").value = stock;
    document.getElementById("prodCategoria").value = categoria;
    document.getElementById("prodDescripcion").value = descripcion;
    document.getElementById("prodImagen").value = urlImgen !== "null"? urlImagen : "";

    //abrir el modal
    const miModal = document.getElementById('modalAgregarProducto');
    const modalBootstrap = bootstrap.Modal.getOrCreateInstance(miModal);
    modalBootstrap.show();
}

// resetear el modal cuando se oprimir agregar producto
document.getElementById("btnAgregarProducto").addEventListener("click", function() {})
document.getElementById("tituloModalProducto").innerText = "Registrar Producto";
document.getElementById("formProducto").reset();
document.getElementById("prodId").value = ""; //limpiar el id oculto

//cargar la lista de productos
function cargarProductos(){
    //se usa el id de la tienda que se guardó arriba
    fetch(`http://localhost:8080/producto/tienda/${tiendaId}`)
        .then(response => response.json())
        .then(data => {
            const contenedorLista = document.getElementById("listaProductos");

            //si la respuesta es exitosa y hay productos
            if(data.success && data.data.length > 0){
                let html = "";
                // se crear un tarjeta por cada producto
                data.data.forEach(prod => {
                    const imagen = prod.urlImagen || "https://via.placeholder.com/150?text=Sin+Imagen";
                    html +=
                        `<div class="col-md-4 col-sm-6 mb-4">
                            <div class="card h-100 shadow-sm">
                                <img src="${imagen}" class="card-img-top" alt="${prod.titulo}" style="height: 200px; object-fit: cover;">
                                <div class="card-body">
                                    <h5 class="card-title">${prod.titulo}</h5>
                                    <p class="card-text text-muted mb-1">Precio: $${prod.precio.toFixed(2)}</p>
                                    <p class="card-text text-muted">Stock: ${prod.stock} unidades</p>
                                </div>
                                <div class="card-footer bg-white border-top-0 d-flex justify-content-between">
                                    <button class="btn btn-sm btn-outline-primary">Editar</button>
                                    <button onclick="eliminarProducto(${prod.id})" class="btn btn-sm btn-outline-danger">Eliminar</button>
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
cargarProductos();
