//guardar perfil
const formPerfil = document.getElementById("formCliente");

if (formPerfil) {
    formPerfil.addEventListener("submit", function (e) {
        e.preventDefault();

        const usuarioId = localStorage.getItem("usuarioId");
        if(!usuarioId){
            alert("Error de sesión. Por favor, inicia sesión nuevamente.");
            window.location.href = "index.html";
            return;
        }

        const nuevoCliente = {
            nombreCompleto: document.getElementById("nombreCliente").value,
            telefono: document.getElementById("telCliente").value,
            direccionEnvio: document.getElementById("dirCliente").value,
            usuario: { id: parseInt(usuarioId) }
        };

        fetch("http://localhost:8080/cliente/save",{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(nuevoCliente),
        })
        .then(response => response.json())
        .then(data => {
            if(data.success){
                alert("¡Perfil guardado con éxito!");
                localStorage.setItem("clienteId", data.data.id);
                window.location.href = "catalogo.html";
            } else {
                alert("Hubo un error: "+ data.message);
            }
        })
        .catch(error => console.error("Error al registrar:", error));
    });
}


// cerrar sesión
const btnSalir = document.getElementById("btnCerrarSesionCat");
if (btnSalir) {
    btnSalir.addEventListener("click", function() {
        localStorage.clear();
        window.location.href = "index.html";
    });
}

// Variables  del carrito
let productosGlobales = []; 
let carrito = JSON.parse(localStorage.getItem("carrito")) || []; 

// checar si el sistema está en catalogo
const contenedorCatalogo = document.getElementById("catalogoGlobal");

if (contenedorCatalogo) {
    
    // buscar un producto
    const inputBusqueda = document.getElementById("inputBusqueda");
    if(inputBusqueda){
        inputBusqueda.addEventListener("input", function(e){
            const texto = e.target.value.toLowerCase();
            const productosFiltrados = productosGlobales.filter(prod =>
                 prod.titulo.toLowerCase().includes(texto) ||
                 prod.categoria.toLowerCase().includes(texto)
            );
            renderizarProductos(productosFiltrados);
        });
    }

    // pagar
    const btnPagar = document.getElementById("btnPagar");
    if(btnPagar){
        btnPagar.addEventListener("click", function (){
            if(carrito.length === 0){
                alert("El carrito está vacío");
                return;
            }

            const clienteId = localStorage.getItem("clienteId");
            if(!clienteId){
                alert("Error: No se encontró tu perfil de cliente. Por favor inicia sesión");
                return;
            }

            const nuevaOrden = {
                cliente: {id: parseInt(clienteId)},
                total: carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0),
                detalles: carrito.map(item => ({
                    producto: {id: parseInt(item.id)},
                    cantidad: parseInt(item.cantidad),
                    precioUnitario: parseFloat(item.precio)
                }))
            };

            fetch("http://localhost:8080/orden/save",{
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(nuevaOrden)
            })
            .then(response => response.json())
            .then(data => {
                if(data.success){
                    alert("Compra realizada con éxito, tu pedido está en camino");
                    carrito=[]; 
                    guardarCarrito();
                    cargarCatalogoCompleto();
                    window.location.reload();
                } else {
                    alert("Hubo un problema al procesar el pago: " + data.message);
                }
            })
            .catch(error => console.error("Error al procesar la compra: ", error));
        });
    }

    // cargar los productos desde el back
    function cargarCatalogoCompleto(){
        fetch('http://localhost:8080/producto/findAll')
        .then(response => response.json())
        .then(data => {
            if(data.success){
                productosGlobales = data.data; 
                renderizarProductos(productosGlobales); 
                actualizarVistaCarrito(); 
            }
        })
        .catch(error => console.error("Error al cargar el catálogo: ", error)); 
    }

    // Iniciar carga
    cargarCatalogoCompleto();
}

//mostar los productos
function renderizarProductos(lista){
    const contenedor = document.getElementById("catalogoGlobal");
    if(!contenedor) return;

    if(lista.length === 0){
        contenedor.innerHTML = '<h5 class="text-center w-100 text-muted mt-5">No se encontraron productos.</h5>';
        return;
    }

    let html = "";
    lista.forEach(prod => {
        const imagen = prod.urlImagen || "https://via.placeholder.com/200?text=Sin+Imagen";
        html += `
            <div class="col-md-3 col-sm-6 mb-4">
                <div class="card h-100 shadow-sm border-0">
                    <img src="${imagen}" class="card-img-top" style="height: 180px; object-fit: cover;">
                    <div class="card-body">
                        <span class="badge bg-secondary mb-2">${prod.categoria}</span>
                        <h6 class="card-title text-truncate">${prod.titulo}</h6>
                        <p class="text-success fw-bold fs-5">$${prod.precio.toFixed(2)}</p>
                        <p class="text-muted small mb-0">Stock: ${prod.stock} disponibles</p>
                    </div>
                    <div class="card-footer bg-white border-0 d-grid">
                        <button onclick="agregarAlCarrito(${prod.id}, '${prod.titulo}', ${prod.precio}, ${prod.stock})" class="btn btn-primary btn-sm">Agregar al carrito</button>
                    </div>
                </div>
            </div>
        `;
    });
    contenedor.innerHTML = html;
}

function agregarAlCarrito(id, titulo, precio, stock){
    const itemExistente = carrito.find(item => item.id === id);

    if (itemExistente){
        // verificar si ya alcanzó el máximo
        if (itemExistente.cantidad >= stock) {
            alert("¡Límite alcanzado! No hay más stock disponible de este producto.");
            return; // se detiene la función
        }
        itemExistente.cantidad++;
    } else {
        if (stock <= 0) {
            alert("Este producto está agotado por el momento.");
            return;
        }
        // se guarda el limite de sotck en la memoria del carro
        carrito.push({id, titulo, precio, cantidad: 1, stockMaximo: stock});
    }
    guardarCarrito();
}

function cambiarCantidad(id, delta){
    const item = carrito.find(item => item.id === id);
    if(item){
        // si intentan agregar se revisa que no superen el máximo
        if (delta > 0 && item.cantidad >= item.stockMaximo) {
            alert("No puedes agregar más, has alcanzado el stock disponible.");
            return;
        }

        item.cantidad += delta;
        if(item.cantidad <= 0){
            carrito = carrito.filter(prod => prod.id !== id); 
        }
        guardarCarrito();
    }
}

function guardarCarrito(){
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarVistaCarrito(); 
}

function actualizarVistaCarrito(){
    const contenedor =  document.getElementById("listaCarrito");
    const spanTotal = document.getElementById("totalCarrito");
    const badgeCarrito = document.getElementById("badgeCarrito");

    if(!contenedor) return;

    if(carrito.length === 0){
        contenedor.innerHTML = '<p class="text-muted text-center mt-4">El carrito está vacío</p>';
        spanTotal.innerText = "0.00";
        badgeCarrito.innerText = "0";
        return;
    }

    let html = "";
    let total = 0;
    let cantidadTotal = 0;

    carrito.forEach(item => {
        total += item.precio * item.cantidad;
        cantidadTotal += item.cantidad;
        html += `
            <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                <div style="width: 60%">
                    <h6 class="mb-0 text-truncate">${item.titulo}</h6>
                    <small class="text-muted">$${item.precio.toFixed(2)} c/u</small>
                </div>
                <div class="d-flex align-items-center">
                    <button onclick="cambiarCantidad(${item.id}, -1)" class="btn btn-sm btn-outline-secondary px-2">-</button>
                    <span class="mx-2 fw-bold">${item.cantidad}</span>
                    <button onclick="cambiarCantidad(${item.id}, 1)" class="btn btn-sm btn-outline-secondary px-2">+</button>
                </div>
            </div>
        `;
    });

    contenedor.innerHTML = html;
    spanTotal.innerText = total.toFixed(2);
    badgeCarrito.innerText = cantidadTotal;
}