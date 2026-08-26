package toscuento.sistema.store.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import toscuento.sistema.store.Repository.UsuarioRepository;
import toscuento.sistema.store.model.Usuario;

import java.util.List;
import java.util.Map;

@Service
public class UsuarioService {

    public static final Logger logger = LoggerFactory.getLogger(UsuarioService.class);

    @Autowired
    private UsuarioRepository usuarioRepository;

    public List<Usuario> obtenerTodos(){
        logger.info("Obteniendo todos los usuarios desde la base de datos");
        return usuarioRepository.findAll();
    }

    public Usuario registrar(Usuario usuario){
        logger.info("Iniciando registro de nuevo usuario");
        if(usuario.getCorreo() == null || usuario.getCorreo().isEmpty()){
            logger.error("Fallo de validación: El correo es obligatorio");
            throw new IllegalArgumentException("El correo es obligatorio");
        }
        return usuarioRepository.save(usuario);
    }

    //actualización parcial
    public Usuario updateUsuario(Integer id, Map<String, Object> fields) throws Exception{
        logger.info("Procesando actualización parcial para el usuario id: " + id);
        Usuario usuario = usuarioRepository.findById(id).orElseThrow();

        if(fields.containsKey("correo")){
            usuario.setCorreo((String) fields.get("correo"));
        }
        if(fields.containsKey("contrasena")){
            usuario.setContrasena((String) fields.get("contrasena"));
        }
        if(fields.containsKey("estado")){
            usuario.setEstado((Integer) fields.get("estado"));
        }

        return usuarioRepository.save(usuario);
    }

    public void eliminar(Integer id){
        logger.info("Eliminando usuario de la base de datos id: " + id);
        usuarioRepository.deleteById(id);
    }
}