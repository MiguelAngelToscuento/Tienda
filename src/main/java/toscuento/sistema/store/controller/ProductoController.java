package toscuento.sistema.store.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import toscuento.sistema.store.Repository.ProductoRepository;
import toscuento.sistema.store.model.Producto;
import toscuento.sistema.store.service.ProductoService;

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
            List<Producto> productos = productoRepository.findAll();
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
    public ResponseEntity<Map<String, Object>> save(@RequestBody Producto producto){
        logger.info("Guardando nuevo producto");
        try {
            Producto productoGuardado = productoRepository.save(producto);
            return createResponse(Boolean.TRUE, "Producto guardado correctamente", productoGuardado, HttpStatus.OK);
        }catch (Exception e){
            logger.error("Error al guardar producto", e);
            return createError(e);
        }
    }

    //eliminar producto
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable("id") Integer id){
        logger.info("Eliminando producto con id: "+id);
        try {
            productoRepository.deleteById(id);
            return createResponse(Boolean.TRUE, "Producto eliminado correctamente", null, HttpStatus.OK);
        }catch (Exception e){
            logger.error("Error al eliminar el producto", e);
            return createError(e);
        }
    }

    //actualizar producto
    @PutMapping("/update/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable("id") Integer id, @RequestBody Map<String, Object> fields){
        logger.info("Actualizando producto con id: "+id);
        try {
            Producto productoActualizado = productoService.updateProducto(id, fields);
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
}