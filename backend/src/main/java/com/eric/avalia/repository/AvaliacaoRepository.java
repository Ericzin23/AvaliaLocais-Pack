package com.eric.avalia.repository;

import com.eric.avalia.entity.Avaliacao;
import com.eric.avalia.entity.LocalPlace;
import com.eric.avalia.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {
    List<Avaliacao> findByLocal(LocalPlace local);
    
    @Query("SELECT a FROM Avaliacao a JOIN FETCH a.local JOIN FETCH a.usuario WHERE a.usuario = :usuario")
    List<Avaliacao> findByUsuario(@Param("usuario") Usuario usuario);
}
