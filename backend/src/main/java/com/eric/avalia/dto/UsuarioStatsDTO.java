package com.eric.avalia.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * DTO para retornar estatísticas completas do usuário
 * Baseado na view v_usuario_perfil_completo
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioStatsDTO {
    private Long id;
    private String nome;
    private String email;
    private String dataNascimento;
    private String genero;
    private String fotoUrl;
    private OffsetDateTime membroDesde;
    private OffsetDateTime ultimoLoginAt;
    
    // Estatísticas
    private Integer totalAvaliacoes;
    private Integer totalVisitas;
    private Integer totalRelatorios;
    private BigDecimal notaMedia;
    private Integer locaisUnicosAvaliados;
    private String categoriasAvaliadas; // JSON
    private OffsetDateTime primeiraAvaliacao;
    private OffsetDateTime ultimaAvaliacao;
    private Integer diasComoMembro;
    private String nivelUsuario; // NOVATO, INICIANTE, INTERMEDIÁRIO, AVANÇADO, EXPERT
}
