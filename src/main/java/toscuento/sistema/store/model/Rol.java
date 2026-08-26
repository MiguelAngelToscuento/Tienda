package toscuento.sistema.store.model;

import jakarta.persistence.*;

@Entity
@Table(name = "roles")
public class Rol {
    //atributos de la clase RolRepository
   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Integer id;

   @Column(name = "nombre_rol")
    private String nombreRol;

   // métodos getters y setters para acceso a los atributos privados de la clase

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNombreRol() {
        return nombreRol;
    }

    public void setNombreRol(String nombreRol) {
        this.nombreRol = nombreRol;
    }
}
