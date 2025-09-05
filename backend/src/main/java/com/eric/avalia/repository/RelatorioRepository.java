package com.eric.avalia.repository;

import com.eric.avalia.entity.Relatorio;
import com.eric.avalia.entity.Relatorio.Periodo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RelatorioRepository extends JpaRepository<Relatorio, Long> {
    List<Relatorio> findTop10ByPeriodoOrderByCreatedAtDesc(Periodo periodo);
}
