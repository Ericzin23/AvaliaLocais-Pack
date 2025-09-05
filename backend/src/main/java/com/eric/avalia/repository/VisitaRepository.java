package com.eric.avalia.repository;

import com.eric.avalia.entity.Visita;
import com.eric.avalia.entity.LocalPlace;
import com.eric.avalia.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VisitaRepository extends JpaRepository<Visita, Long> {
    List<Visita> findByLocal(LocalPlace local);
    List<Visita> findByUsuario(Usuario usuario);
}
