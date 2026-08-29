package toscuento.sistema.store.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import toscuento.sistema.store.model.Cliente;
import toscuento.sistema.store.service.ClienteService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/cliente")
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.DELETE, RequestMethod.PUT})
public class ClienteController {
    private static final Logger logger = LoggerFactory.getLogger(ClienteController.class);

    @Autowired
    private ClienteService clienteService;

    @GetMapping("/findAll/")
    public ResponseEntity<Map<String, Object>> findAll(){
        logger.info("Petición recibida: findAll clientes");
        try {
            List<Cliente> clientes = clienteService.obtenerTodos();
            return createResponse(Boolean.TRUE, "Lista de clientes", clientes, HttpStatus.OK);
        }catch (Exception e){
            logger.error("Error al obtener todos los clientes", e);
            return createError(e);
        }
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<Map<String, Object>> findByUsuarioId(@PathVariable("idUsuario") Integer idUsuario){
        logger.info("Petición recibida: buscar cliente por id de usuario " + idUsuario);
        try {
            Cliente cliente = clienteService.findByUsuarioId(idUsuario);

            if(cliente != null) {
                return createResponse(Boolean.TRUE, "Cliente encontrado", cliente, HttpStatus.OK);
            } else {
                return createResponse(Boolean.TRUE, "El cliente aún no tiene perfil", null, HttpStatus.OK);
            }
        } catch (Exception e){
            logger.error("Error al buscar cliente por usuario", e);
            return createError(e);
        }
    }

    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> save(@RequestBody Cliente cliente){
        logger.info("Petición recibida: guardar nuevo cliente");
        try {
            Cliente clienteGuardado = clienteService.guardar(cliente);
            return createResponse(Boolean.TRUE, "Cliente guardado", clienteGuardado, HttpStatus.OK);
        }catch (Exception e){
            logger.error("Error al guardar cliente", e);
            return createError(e);
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable("id") Integer id, @RequestBody Map<String, Object> fields){
        logger.info("Petición recibida: actualizar cliente id " + id);
        try {
            Cliente clienteActualizado = clienteService.updateCliente(id, fields);
            return createResponse(Boolean.TRUE, "Cliente actualizado", clienteActualizado, HttpStatus.OK);
        } catch (Exception e){
            logger.error("Error al actualizar cliente", e);
            return createError(e);
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable("id") Integer id){
        logger.info("Petición recibida: eliminar cliente id " + id);
        try {
            clienteService.eliminar(id);
            return createResponse(Boolean.TRUE, "Cliente eliminado", null, HttpStatus.OK);
        }catch (Exception e){
            logger.error("Error al eliminar cliente", e);
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