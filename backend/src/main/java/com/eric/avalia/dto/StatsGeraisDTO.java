package com.eric.avalia.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO para estatísticas gerais do sistema
 * Baseado na view v_stats_gerais
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatsGeraisDTO {
    private Long totalUsuarios;
    private Long novosUsuarios30d;
    private Long totalLocais;
    private Long totalCategorias;
    private Long totalAvaliacoes;
    private Long avaliacoes30d;
    private BigDecimal notaMediaGeral;
    private Long totalVisitas;
    private Long visitas30d;
    private BigDecimal duracaoMediaVisitasMin;
}
