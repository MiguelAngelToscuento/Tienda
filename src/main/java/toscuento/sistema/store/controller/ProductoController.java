package toscuento.sistema.store.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import toscuento.sistema.store.Repository.ProductoRepository;
import toscuento.sistema.store.model.Producto;
import toscuento.sistema.store.model.Tienda;
import toscuento.sistema.store.service.ProductoService;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.dao.DataIntegrityViolationException;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;


@RestController
@RequestMapping("/producto")
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.DELETE, RequestMethod.PUT})
public class ProductoController {
    private static final Logger logger = LoggerFactory.getLogger(ProductoController.class);

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private ProductoService productoService;

    //buscar con filtro
    @GetMapping("findAll/{q}")
    public ResponseEntity<Map<String, Object>> findAll(@PathVariable("q") String q){
        logger.info("Buscando productos con filtro: "+q);
        try{
            List<Producto> productos = productoService.searchProductos(q);
            return createResponse(Boolean.TRUE, "Búsqueda exitosa", productos, HttpStatus.OK);
        }catch(Exception e){
            logger.error("Error al buscar productos con filtro", e);
            return createError(e);
        }
    }

    //buscar todos los productos
    @GetMapping("/findAll")
    public ResponseEntity<Map<String, Object>> findAll(){
        logger.info("Buscando todos los productos");
        try{
            List<Producto> productos = productoRepository.findByActivoTrue();
            return createResponse(Boolean.TRUE, "Lista de productos", productos, HttpStatus.OK);
        }catch (Exception e){
            logger.error("Error al buscar todos los productos", e);
            return createError(e);
        }
    }

    // buscar por id
    @GetMapping("findById/{id}")
    public ResponseEntity<Map<String, Object>> findById(@PathVariable("id") Integer id){
        logger.info("Buscando producto con id: "+id);
        try{
            Optional<Producto> producto = productoRepository.findById(id);
            if (producto.isPresent()){
                return createResponse(Boolean.TRUE, "Producto encontrado", producto, HttpStatus.OK);
            }else {
                return createResponse(Boolean.FALSE, "Producto no encontrado", null, HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error("Error al buscar el producto con id: ",e);
            return createError(e);
        }
    }

    //guardar un nuevo producto
    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> save(
            @RequestParam("titulo") String titulo,
            @RequestParam("precio") Double precio,
            @RequestParam("stock") Integer stock,
            @RequestParam("categoria") String categoria,
            @RequestParam("descripcion") String descripcion,
            @RequestParam("tiendaId") Integer tiendaId,
            @RequestParam(value = "archivoImagen", required = false) MultipartFile archivoImagen
    ) {
        logger.info("Guardando nuevo producto con imagen");
        try {
            // objeto Producto con los datos
            Producto producto = new Producto();
            producto.setTitulo(titulo);
            producto.setPrecio(precio);
            producto.setStock(stock);
            producto.setCategoria(categoria);
            producto.setDescripcion(descripcion);

            // se asigna la tienda
            Tienda tienda = new Tienda();
            tienda.setId(tiendaId);
            producto.setTienda(tienda);

            // guradar imagen si e usuario sube una
            if (archivoImagen != null && !archivoImagen.isEmpty()) {
                //carpeta donde se guardarán las imagenes
                String rutaCarpeta = "uploads/productos/";
                Path rutaDirectorio = Paths.get(rutaCarpeta);

                // Si la carpeta no existe se crea
                if (!Files.exists(rutaDirectorio)) {
                    Files.createDirectories(rutaDirectorio);
                }

                // generar nombre de la imagen
                String nombreOriginal = archivoImagen.getOriginalFilename();
                String extension = nombreOriginal.substring(nombreOriginal.lastIndexOf("."));
                String nombreUnico = UUID.randomUUID().toString() + extension;

                // guardar la imagen en la máquina
                Path rutaFisica = Paths.get(rutaCarpeta + nombreUnico);
                Files.copy(archivoImagen.getInputStream(), rutaFisica);

                // se guarda la imagen en la base de datos
                producto.setUrlImagen("/" + rutaCarpeta + nombreUnico);
            }

            // 4guardar en la base de datos
            Producto productoGuardado = productoRepository.save(producto);
            return createResponse(Boolean.TRUE, "Producto publicado con éxito", productoGuardado, HttpStatus.OK);

        } catch (Exception e) {
            logger.error("Error al guardar producto con imagen", e);
            return createError(e);
        }
    }

    //eliminar producto
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable("id") Integer id){
        logger.info("Aplcando baja lógica al producto con id: "+id);
        try {
            //se busca el producto en la db
            Producto producto= productoRepository.findById(id)
                    .orElseThrow(() -> new Exception("Producto no encontrado"));
            //apagar estado del producto
            producto.setActivo(false);

            //guardar cambio
            productoRepository.save(producto);
            return createResponse(Boolean.TRUE, "Producto eliminado correctamente", null, HttpStatus.OK);
        }catch (Exception e){
            logger.error("Error al aplicar la baja lógica al producto: "+e);
            return createError(e);
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Map<String, Object>> update(
            @PathVariable("id") Integer id,
            @RequestParam("titulo") String titulo,
            @RequestParam("precio") Double precio,
            @RequestParam("stock") Integer stock,
            @RequestParam("categoria") String categoria,
            @RequestParam("descripcion") String descripcion,

            @RequestParam(value = "archivoImagen", required = false) MultipartFile archivoImagen
    ) {
        logger.info("Actualizando producto con id: " + id);
        try {

            Producto producto = productoRepository.findById(id)
                    .orElseThrow(() -> new Exception("Producto no encontrado"));


            producto.setTitulo(titulo);
            producto.setPrecio(precio);
            producto.setStock(stock);
            producto.setCategoria(categoria);
            producto.setDescripcion(descripcion);
            if (archivoImagen != null && !archivoImagen.isEmpty()) {
                String rutaCarpeta = "uploads/productos/";
                Path rutaDirectorio = Paths.get(rutaCarpeta);

                if (!Files.exists(rutaDirectorio)) {
                    Files.createDirectories(rutaDirectorio);
                }

                String nombreOriginal = archivoImagen.getOriginalFilename();
                String extension = nombreOriginal.substring(nombreOriginal.lastIndexOf("."));
                String nombreUnico = UUID.randomUUID().toString() + extension;

                Path rutaFisica = Paths.get(rutaCarpeta + nombreUnico);
                Files.copy(archivoImagen.getInputStream(), rutaFisica);

                producto.setUrlImagen("/" + rutaCarpeta + nombreUnico);
            }
            Producto productoActualizado = productoRepository.save(producto);
            return createResponse(Boolean.TRUE, "Producto actualizado correctamente", productoActualizado, HttpStatus.OK);

        } catch (Exception e){
            logger.error("Error al actualizar el producto", e);
            return createError(e);
        }
    }


    @GetMapping("/tienda/{idTienda}")
    public ResponseEntity<Map<String, Object>> findByTienda(@PathVariable("idTienda") Integer idTienda){
        logger.info("Buscando productos de la tienda id: " + idTienda);
        try {
            List<Producto> productos = productoRepository.findByTiendaId(idTienda);
            return createResponse(Boolean.TRUE, "Productos de la tienda", productos, HttpStatus.OK);
        } catch (Exception e){
            logger.error("Error al buscar productos de la tienda", e);
            return createError(e);
        }
    }
    private ResponseEntity<Map<String, Object>> createResponse(Boolean success, String message, Object data, HttpStatus status){
        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("message", message);
        response.put("data", data);
        return new ResponseEntity<>(response, status);
    }

    private ResponseEntity<Map<String, Object>> createError(Exception e){
        return createResponse(Boolean.FALSE, "Ups, algo salió mal", e.fillInStackTrace(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @PutMapping("/reactivate/{id}")
    public ResponseEntity<Map<String, Object>> reactivate(@PathVariable("id") Integer id){
        logger.info("Reactivando producto con id: "+id);
        try {
            Producto producto = productoRepository.findById(id)
                    .orElseThrow(() -> new Exception("Producto no encontrado"));
            //encender el producto
            producto.setActivo(true);
            productoRepository.save(producto);
            return createResponse(Boolean.TRUE, "Producto reactivado correctamente", null, HttpStatus.OK);
        }catch (Exception e){
            logger.error("Error al reactivar el producto", e);
            return createError(e);
        }
    }

}//fin de la clse