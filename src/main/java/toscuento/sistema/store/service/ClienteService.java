package toscuento.sistema.store.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import toscuento.sistema.store.Repository.ClienteRepository;
import toscuento.sistema.store.model.Cliente;

import java.util.List;
import java.util.Map;

@Service
public class ClienteService {

    public static final Logger logger = LoggerFactory.getLogger(ClienteService.class);

    @Autowired
    private ClienteRepository clienteRepository;

    public List<Cliente> obtenerTodos(){
        logger.info("Obteniendo todos los clientes desde la base de datos");
        return clienteRepository.findAll();
    }

    public Cliente guardar(Cliente cliente){
        logger.info("Guardando un nuevo cliente en la base de datos");
        return clienteRepository.save(cliente);
    }

    public Cliente updateCliente(Integer id, Map<String, Object> fields) throws  Exception{
        logger.info("Procesando actualización parcial para el cliente id: " + id);
        Cliente cliente = clienteRepository.findById(id).orElseThrow();

        if(fields.containsKey("nombre")){
            cliente.setNombre((String) fields.get("nombre"));
        }
        if(fields.containsKey("telefono")){
            cliente.setTelefono((String) fields.get("telefono"));
        }
        if (fields.containsKey("direccion")){
            cliente.setDireccion((String) fields.get("direccion"));
        }

        return clienteRepository.save(cliente);
    }

    public void eliminar(Integer id){
        logger.info("Eliminando cliente de la base de datos id: " + id);
        clienteRepository.deleteById(id);
    }
}