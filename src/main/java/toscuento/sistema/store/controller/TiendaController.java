package toscuento.sistema.store.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import toscuento.sistema.store.Repository.TiendaRepository;
import toscuento.sistema.store.model.Tienda;
import toscuento.sistema.store.service.TiendaService;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

import toscuento.sistema.store.model.Usuario;

@RestController
@RequestMapping("/tienda")
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.DELETE, RequestMethod.PUT})
public class TiendaController {
    private static final Logger logger = LoggerFactory.getLogger(TiendaController.class);

    @Autowired
    private TiendaService tiendaService;
    @Autowired
    private TiendaRepository tiendaRepository;

    @GetMapping("/findAll/")
    public ResponseEntity<Map<String, Object>> findAll(){
        logger.info("Petición recibida: findAll tiendas");
        try{
            List<Tienda> tiendas = tiendaService.obtenerTodas();
            return createResponse(Boolean.TRUE, "Lista de tiendas", tiendas, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error al obtener todas las tiendas", e);
            return createError(e);
        }
    }

    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> save(
            @RequestParam("nombreTienda") String nombreTienda,
            @RequestParam("rfc") String rfc,
            @RequestParam("usuarioId") Integer usuarioId,
            @RequestParam(value = "archivoLogo", required = false) MultipartFile archivoLogo
    ){
        logger.info("Petición recibida: guardar nueva tienda");
        try {
            Tienda tienda = new Tienda();
            tienda.setNombreTienda(nombreTienda);
            tienda.setRfc(rfc);

            //se asigna el usuario
            Usuario usuario = new Usuario();
            usuario.setId(usuarioId);
            tienda.setUsuario(usuario);

            //procesr el logo si es que se subió
            if (archivoLogo != null && !archivoLogo.isEmpty()) {
                String rutaCarpeta = "uploads/logos/"; // Nueva subcarpeta para logos
                Path rutaDirectorio = Paths.get(rutaCarpeta);

                if (!Files.exists(rutaDirectorio)) {
                    Files.createDirectories(rutaDirectorio);
                }

                String nombreOriginal = archivoLogo.getOriginalFilename();
                String extension = nombreOriginal.substring(nombreOriginal.lastIndexOf("."));
                String nombreUnico = UUID.randomUUID().toString() + extension;

                Path rutaFisica = Paths.get(rutaCarpeta + nombreUnico);
                Files.copy(archivoLogo.getInputStream(), rutaFisica);

                tienda.setUrlLogo("/" + rutaCarpeta + nombreUnico);
            }
            Tienda tiendaGuardada = tiendaService.guardar(tienda);
            return createResponse(Boolean.TRUE, "Tienda registrada", tiendaGuardada, HttpStatus.OK);
        }catch (Exception e){
            logger.error("Error al registrar la tienda",e);
            return createError(e);
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable("id") Integer id, @RequestBody Map<String, Object> fields){
        logger.info("Petición recibida: actualizar tienda id " + id);
        try {
            Tienda tiendaActualizada = tiendaService.updateTienda(id, fields);
            return createResponse(Boolean.TRUE, "Tienda actualizada", tiendaActualizada, HttpStatus.OK);
        }catch (Exception e){
            logger.error("Error al actualizar tienda", e);
            return createError(e);
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable("id") Integer id){
        logger.info("Petición recibida: eliminar tienda id " + id);
        try {
            tiendaService.eliminar(id);
            return createResponse(Boolean.TRUE, "Tienda eliminada", null, HttpStatus.OK);
        }catch (Exception e){
            logger.error("Error al eliminar tienda", e);
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

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<Map<String, Object>> getTiendaByUsuario(@PathVariable Integer usuarioId) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Buscamos la tienda usando el método que acabamos de crear en el repositorio
            Optional<Tienda> tienda = tiendaRepository.findByUsuarioId(usuarioId);

            if (tienda.isPresent()) {
                response.put("success", true);
                response.put("message", "Tienda encontrada");
                response.put("data", tienda.get());
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                response.put("success", false);
                response.put("message", "Este usuario no tiene una tienda registrada");
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error interno al buscar la tienda: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/toggle-status/{id}")
    public ResponseEntity<Map<String, Object>> toggleStatus(@PathVariable("id") Integer id){
        logger.info("El superusuario está cambiando el estado de la tienda id: " + id);
        try {
            Tienda tienda = tiendaService.obtenerPorId(id);
            if(tienda == null) throw new Exception("Tienda no encontrada");

            tienda.setActivo(!tienda.getActivo());
            tiendaService.guardar(tienda);

            String estado = tienda.getActivo() ? "reactivada" : "suspendida";
            return createResponse(Boolean.TRUE, "Tienda " + estado + " exitosamente", null, HttpStatus.OK);
        } catch (Exception e){
            logger.error("Error al cambiar estado de la tienda", e);
            return createError(e);
        }
    }


}// fin de la clase

