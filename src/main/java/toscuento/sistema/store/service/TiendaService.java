package toscuento.sistema.store.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import toscuento.sistema.store.Repository.TiendaRepository;
import toscuento.sistema.store.model.Tienda;

import java.util.List;
import java.util.Map;

@Service
public class TiendaService {

    public static final Logger logger = LoggerFactory.getLogger(TiendaService.class);

    @Autowired
    private TiendaRepository tiendaRepository;

    public List<Tienda> obtenerTodas(){
        logger.info("Obteniendo todas las tiendas desde la base de datos");
        return tiendaRepository.findAll();
    }

    public Tienda guardar(Tienda tienda){
        logger.info("Guardando una nueva tienda en la base de datos");
        return tiendaRepository.save(tienda);
    }

    //actualización parcial de los datos de la tienda
    public Tienda updateTienda(Integer id, Map<String, Object> fields) throws Exception{
        logger.info("Procesando actualización parcial para la tienda id: " + id);
        Tienda tienda = tiendaRepository.findById(id).orElseThrow();

        if(fields.containsKey("nombreTienda")){
            tienda.setNombreTienda((String) fields.get("nombreTienda"));
        }
        if(fields.containsKey("rfc")){
            tienda.setRfc((String) fields.get("rfc"));
        }
        if (fields.containsKey("urlLogo")){
            tienda.setUrlLogo((String) fields.get("urlLogo"));
        }

        return tiendaRepository.save(tienda);
    }

    public void eliminar(Integer id){
        logger.info("Eliminando tienda de la base de datos id: " + id);
        tiendaRepository.deleteById(id);
    }

    public Tienda obtenerPorUsuarioId(Integer idUsuario){
        logger.info("Buscando tienda para el usuario con id:" +idUsuario);
        return tiendaRepository.findByUsuarioId(idUsuario).orElse(null);
    }

    public Tienda obtenerPorId(Integer id) throws Exception {
        return tiendaRepository.findById(id)
                .orElseThrow(() -> new Exception("Tienda no encontrada con el id: " + id));
    }
}