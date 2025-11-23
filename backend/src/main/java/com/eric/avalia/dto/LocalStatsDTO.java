package com.eric.avalia.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO para retornar estatísticas de locais
 * Baseado na view v_top_100_locais
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LocalStatsDTO {
    private Long id;
    private String nome;
    private String categoria;
    private String endereco;
    private Double lat;
    private Double lng;
    private BigDecimal notaMedia;
    private Integer totalAvaliacoes;
    private Integer usuariosUnicos;
    private Integer totalVisitas;
    private Integer rankingCategoria; // Posição no ranking da categoria
}
