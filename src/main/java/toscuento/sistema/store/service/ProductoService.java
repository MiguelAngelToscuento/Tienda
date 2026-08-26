package toscuento.sistema.store.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import toscuento.sistema.store.Repository.ProductoRepository;
import toscuento.sistema.store.model.Producto;

import java.util.List;
import java.util.Map;

@Service
public class ProductoService {

    public static final Logger logger = LoggerFactory.getLogger(ProductoService.class);

    @Autowired
    private ProductoRepository productoRepository; //objeto para contrlar el CRUD en la base de datos

    //actualización de campos parcial
    public Producto updateProducto(Integer id, Map<String, Object> fields) throws Exception{
        logger.info("Procesando actualización parcial para el producto id: " + id);
        Producto producto = productoRepository.findById(id).orElseThrow();

        //seccion de actualización de campos individuales
        if(fields.containsKey("titulo")){
            producto.setTitulo((String) fields.get("titulo"));
        }
        if(fields.containsKey("descripcion")){
            producto.setDescripcion((String) fields.get("descripcion"));
        }
        if(fields.containsKey("categoria")){
            producto.setCategoria((String) fields.get("categoria"));
        }
        if(fields.containsKey("precio")){
            producto.setPrecio((Double.valueOf(fields.get("precio").toString())));
        }
        if(fields.containsKey("stock")){
            producto.setStock((Integer) fields.get("stock"));
        }

        return productoRepository.save(producto); // metodo para guardar el estado del objeto producto
    }

    //busqueda de productos
    public List<Producto> searchProductos(String q){
        logger.info("Buscando producto por: "+q);
        List<Producto> productos = productoRepository.findAll();

        //busqueda general
        if(!q.contains("=")){
            String busqueda = q.toLowerCase();
            return productos.stream().filter(producto ->
                    producto.getTitulo().toLowerCase().contains(busqueda) ||
                            producto.getCategoria().toLowerCase().contains(busqueda) ||
                            producto.getDescripcion().toLowerCase().contains(busqueda)
            ).toList();
        }

        //buscueda por parametros
        String[] properties = q.split(",");
        for(String property : properties){
            String[] propertyEntry = property.split("=");
            if(propertyEntry[0].equals("titulo")){
                productos = productos.stream().filter(p -> p.getTitulo().toLowerCase().contains(propertyEntry[1].toLowerCase())).toList();
            }
            if(propertyEntry[0].equals("categoria")){
                productos = productos.stream().filter(p-> p.getCategoria().toLowerCase().contains(propertyEntry[1].toLowerCase())).toList();
            }
            if(propertyEntry[0].equals("stock")){
                productos = productos.stream().filter(p -> p.getStock().toString().contains(propertyEntry[1].toLowerCase())).toList();
            }
        }
        return productos;
    }

}