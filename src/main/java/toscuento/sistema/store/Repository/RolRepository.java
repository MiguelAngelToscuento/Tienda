package toscuento.sistema.store.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import toscuento.sistema.store.model.Rol;

@Repository
public interface RolRepository extends JpaRepository<Rol, Integer> {
}
