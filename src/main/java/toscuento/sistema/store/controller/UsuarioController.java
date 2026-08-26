package toscuento.sistema.store.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import toscuento.sistema.store.Repository.UsuarioRepository;
import toscuento.sistema.store.model.Usuario;
import toscuento.sistema.store.service.UsuarioService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/usuario")
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
public class UsuarioController {
    private static final Logger logger = LoggerFactory.getLogger(UsuarioController.class);

    @Autowired
    private UsuarioService usuarioService;
    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping("/findAll/")
    public ResponseEntity<Map<String, Object>> findAll(){
        logger.info("Petición recibida: findAll usuarios");
        try {
            List<Usuario> usuarios = usuarioService.obtenerTodos();
            return createResponse(Boolean.TRUE, "Lista de usuarios", usuarios, HttpStatus.OK);
        }catch (Exception e){
            logger.error("Error al buscar todos los usuarios", e);
            return createError(e);
        }
    }

    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> save(@RequestBody Usuario usuario){
        logger.info("Petición recibida: registrar nuevo usuario");
        try{
            Usuario usuarioGuardado = usuarioService.registrar(usuario);
            return createResponse(Boolean.TRUE, "Usuario guardado", usuarioGuardado, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error al registrar al usuario", e);
            return createError(e);
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable("id") Integer id, @RequestBody Map<String, Object> fields){
        logger.info("Petición recibida: actualizar usuario id " + id);
        try{
            Usuario usuarioActualizado = usuarioService.updateUsuario(id, fields);
            return createResponse(Boolean.TRUE, "Usuario actualizado", usuarioActualizado, HttpStatus.OK);
        }catch(Exception e){
            logger.error("Error al actualizar usuario", e);
            return createError(e);
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable("id") Integer id){
        logger.info("Petición recibida: eliminar usuario id " + id);
        try{
            usuarioService.eliminar(id);
            return createResponse(Boolean.TRUE, "Usuario eliminado", null, HttpStatus.OK);
        }catch(Exception e){
            logger.error("Error al eliminar usuario", e);
            return createError(e);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credenciales) {
        logger.info("Intento de inicio de sesión");
        try {
            String correo = credenciales.get("correo");
            String contrasena = credenciales.get("contrasena");

            Optional<Usuario> usuario = usuarioRepository.findByCorreo(correo);

            if (usuario.isPresent() && usuario.get().getContrasena().equals(contrasena)) {

                Usuario usuarioLogueado = usuario.get();

                return createResponse(Boolean.TRUE, "¡Bienvenido!", usuarioLogueado, HttpStatus.OK);
            } else {
                return createResponse(Boolean.FALSE, "Correo o contraseña incorrectos", null, HttpStatus.UNAUTHORIZED);
            }

        } catch (Exception e) {
            logger.error("Error en el login", e);
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