package com.eric.avalia.repository;

import com.eric.avalia.entity.Avaliacao;
import com.eric.avalia.entity.LocalPlace;
import com.eric.avalia.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {
    List<Avaliacao> findByLocal(LocalPlace local);
    List<Avaliacao> findByUsuario(Usuario usuario);
}
