package toscuento.sistema.store.service;



import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import toscuento.sistema.store.Repository.RolRepository;
import toscuento.sistema.store.model.Rol;


@Service
public class RolService {

    private static final Logger logger = LoggerFactory.getLogger(RolService.class);

    @Autowired
    private RolRepository rolRepository;

    public Rol guardarRol(Rol rol) {
        logger.info("Guardando nuevo rol en la base de datos: ", rol.getNombreRol());
        return rolRepository.save(rol);
    }
}