package toscuento.sistema.store.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import toscuento.sistema.store.model.Producto;
import java.util.List; // IMPORTANTE: No olvides importar esta librería

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Integer> {

    List<Producto> findByTitulo(String titulo);

    List<Producto> findByDescripcion(String descripcion);

    List<Producto> findByPrecio(Double precio);

    List<Producto> findByCategoria(String categoria);

    List<Producto> findByTiendaId(Integer tiendaId);

}