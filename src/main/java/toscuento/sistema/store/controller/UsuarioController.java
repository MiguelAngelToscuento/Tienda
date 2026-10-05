package toscuento.sistema.store.controller;

import org.aspectj.internal.lang.annotation.ajcITD;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import toscuento.sistema.store.Repository.UsuarioRepository;
import toscuento.sistema.store.model.Usuario;
import toscuento.sistema.store.service.UsuarioService;
import org.springframework.mail.javamail.JavaMailSender;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/usuario")
@CrossOrigin(origins = "*", methods = { RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
        RequestMethod.DELETE })
public class UsuarioController {
    private static final Logger logger = LoggerFactory.getLogger(UsuarioController.class);

    @Autowired
    private UsuarioService usuarioService;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JavaMailSender mailSender;

    @PostMapping("/solicitar-recuperacion")
    public ResponseEntity<Map<String, Object>> solicitarRecuperacion(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        Usuario usuario = usuarioRepository.findByCorreo(email).orElse(null);
        if (usuario == null) {
            return createResponse(false, "No existe una cuenta con ese correo.", null, HttpStatus.NOT_FOUND);
        }

        // generar token
        String token = UUID.randomUUID().toString();
        usuario.setTokenRecuperacion(token);
        usuarioRepository.save(usuario);

        // crear enlace
        String enlace = "http://localhost:8080/restablecer.html?token=" + token;

        try {
            // enviar correo con enlace
            SimpleMailMessage mensaje = new SimpleMailMessage();
            mensaje.setTo(email);
            mensaje.setSubject("Fake Shop Reestablecer contraseña");
            mensaje.setText("Hola,\n\nHaz clic en el siguiente enlace para crear tu nueva contraseña:\n"
                    + enlace + "\n\nSi no solicitaste esto, ignora este correo.");
            mailSender.send(mensaje);
            return createResponse(true, "Te hemos enviado un enlace para restablecer tu contraseña.", null,
                    HttpStatus.OK);
        } catch (Exception e) {
            return createError(e);
        }
    }

    @PostMapping("/reestablecer-contraseña")
    public ResponseEntity<Map<String, Object>> reestablecerContraseña(@RequestBody Map<String, String> payload) {
        String token = payload.get("token");
        String nuevaContraseña = payload.get("contraseña");
        if (token == null || token.isEmpty()) {
            return createResponse(false, "Token inválido.", null, HttpStatus.BAD_REQUEST);
        }

        // buscar el usuario que tenga el token
        Usuario usuario = usuarioRepository.findByTokenRecuperacion(token).orElse(null);
        if (usuario == null) {
            return createResponse(false, "El enlace es inválido o ya fue utilizado.", null, HttpStatus.BAD_REQUEST);
        }
        try {
            // encriptar nueva contraseña
            usuario.setContrasena(passwordEncoder.encode(nuevaContraseña));
            usuario.setTokenRecuperacion(null);
            usuarioRepository.save(usuario);
            return createResponse(true, "Tu contraseña ha sido actualizada con éxito.", null, HttpStatus.OK);
        } catch (Exception e) {
            return createError(e);
        }
    }

    @GetMapping("/findAll/")
    public ResponseEntity<Map<String, Object>> findAll() {
        logger.info("Petición recibida: findAll usuarios");
        try {
            List<Usuario> usuarios = usuarioService.obtenerTodos();
            return createResponse(Boolean.TRUE, "Lista de usuarios", usuarios, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error al buscar todos los usuarios", e);
            return createError(e);
        }
    }

    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> save(@RequestBody Usuario usuario) {
        logger.info("Petición recibida: registrar nuevo usuario");
        try {
            String contrasenaEncriptada = passwordEncoder.encode(usuario.getContrasena());
            usuario.setContrasena(contrasenaEncriptada);
            Usuario usuarioGuardado = usuarioService.registrar(usuario);
            return createResponse(Boolean.TRUE, "Usuario guardado", usuarioGuardado, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error al registrar al usuario", e);
            return createError(e);
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable("id") Integer id,
            @RequestBody Map<String, Object> fields) {
        logger.info("Petición recibida: actualizar usuario id " + id);
        try {
            Usuario usuarioActualizado = usuarioService.updateUsuario(id, fields);
            return createResponse(Boolean.TRUE, "Usuario actualizado", usuarioActualizado, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error al actualizar usuario", e);
            return createError(e);
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable("id") Integer id) {
        logger.info("Petición recibida: eliminar usuario id " + id);
        try {
            usuarioService.eliminar(id);
            return createResponse(Boolean.TRUE, "Usuario eliminado", null, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error al eliminar usuario", e);
            return createError(e);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credenciales) {
        logger.info("Intengo de inicio de sesión");
        try {
            String correo = credenciales.get("correo");
            String contrasena = credenciales.get("contrasena");
            Optional<Usuario> usuario = usuarioRepository.findByCorreo(correo);
            // uso de passwordencoder.matches()
            if (usuario.isPresent() && passwordEncoder.matches(contrasena, usuario.get().getContrasena())) {
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

    private ResponseEntity<Map<String, Object>> createResponse(Boolean success, String message, Object data,
            HttpStatus status) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("message", message);
        response.put("data", data);
        return new ResponseEntity<>(response, status);
    }

    private ResponseEntity<Map<String, Object>> createError(Exception e) {
        return createResponse(Boolean.FALSE, "Ups, algo salió mal", e.fillInStackTrace(),
                HttpStatus.INTERNAL_SERVER_ERROR);
    }
}