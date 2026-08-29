package toscuento.sistema.store.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import toscuento.sistema.store.model.Orden;

public interface OrdenRepository extends JpaRepository<Orden, Integer> {
}
