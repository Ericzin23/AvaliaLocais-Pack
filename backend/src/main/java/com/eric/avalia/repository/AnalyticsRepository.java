package com.eric.avalia.repository;

import com.eric.avalia.dto.LocalStatsDTO;
import com.eric.avalia.dto.StatsGeraisDTO;
import com.eric.avalia.dto.UsuarioStatsDTO;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository para consultas analíticas otimizadas
 * Usa as views e stored procedures criadas no schema-analytics.sql
 */
@Repository
public interface AnalyticsRepository {
    
    /**
     * Buscar estatísticas completas de um usuário por email
     */
    @Query(value = """
        SELECT 
            id, nome, email, data_nascimento AS dataNascimento, genero, foto_url AS fotoUrl,
            membro_desde AS membroDesde, ultimo_login_at AS ultimoLoginAt,
            total_avaliacoes AS totalAvaliacoes, total_visitas AS totalVisitas,
            total_relatorios AS totalRelatorios, nota_media AS notaMedia,
            locais_unicos_avaliados AS locaisUnicosAvaliados,
            categorias_avaliadas AS categoriasAvaliadas,
            primeira_avaliacao AS primeiraAvaliacao,
            ultima_avaliacao AS ultimaAvaliacao,
            dias_como_membro AS diasComoMembro,
            nivel_usuario AS nivelUsuario
        FROM v_usuario_perfil_completo
        WHERE email = :email
        """, nativeQuery = true)
    Optional<UsuarioStatsDTO> findUsuarioStatsByEmail(@Param("email") String email);
    
    /**
     * Top 100 melhores locais gerais
     */
    @Query(value = """
        SELECT 
            id, nome, categoria, endereco, lat, lng,
            nota_media AS notaMedia,
            total_avaliacoes AS totalAvaliacoes,
            usuarios_unicos AS usuariosUnicos,
            total_visitas AS totalVisitas
        FROM v_top_100_locais
        LIMIT 100
        """, nativeQuery = true)
    List<LocalStatsDTO> findTop100Locais();
    
    /**
     * Top locais de uma categoria específica
     */
    @Query(value = """
        SELECT 
            l.id, l.nome, l.categoria, l.endereco, l.lat, l.lng,
            COALESCE(ls.nota_media, 0.00) AS notaMedia,
            COALESCE(ls.total_avaliacoes, 0) AS totalAvaliacoes,
            COALESCE(ls.usuarios_unicos, 0) AS usuariosUnicos,
            COALESCE(ls.total_visitas, 0) AS totalVisitas
        FROM local l
        LEFT JOIN local_stats ls ON l.id = ls.local_id
        WHERE l.categoria = :categoria
            AND ls.total_avaliacoes >= 3
        ORDER BY ls.nota_media DESC, ls.total_avaliacoes DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<LocalStatsDTO> findTopLocaisByCategoria(
        @Param("categoria") String categoria,
        @Param("limit") int limit
    );
    
    /**
     * Estatísticas gerais do sistema
     */
    @Query(value = """
        SELECT 
            total_usuarios AS totalUsuarios,
            novos_usuarios_30d AS novosUsuarios30d,
            total_locais AS totalLocais,
            total_categorias AS totalCategorias,
            total_avaliacoes AS totalAvaliacoes,
            avaliacoes_30d AS avaliacoes30d,
            nota_media_geral AS notaMediaGeral,
            total_visitas AS totalVisitas,
            visitas_30d AS visitas30d,
            duracao_media_visitas_min AS duracaoMediaVisitasMin
        FROM v_stats_gerais
        """, nativeQuery = true)
    Optional<StatsGeraisDTO> findStatsGerais();
    
    /**
     * Verificar quantos usuários avaliaram comida
     */
    @Query(value = """
        SELECT COUNT(DISTINCT usuario_id) 
        FROM v_usuarios_avaliaram_comida
        """, nativeQuery = true)
    Long countUsuariosAvaliaramComida();
    
    /**
     * Top usuários mais ativos
     */
    @Query(value = """
        SELECT 
            u.id, u.nome, u.email,
            us.total_avaliacoes AS totalAvaliacoes,
            us.nota_media AS notaMedia,
            us.locais_unicos_avaliados AS locaisUnicosAvaliados
        FROM usuario u
        JOIN usuario_stats us ON u.id = us.usuario_id
        ORDER BY us.total_avaliacoes DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<Object[]> findTopUsuariosAtivos(@Param("limit") int limit);
    
    /**
     * Recalcular estatísticas de um usuário (chama stored procedure)
     */
    @Query(value = "CALL sp_recalcular_usuario_stats(:usuarioId)", nativeQuery = true)
    void recalcularUsuarioStats(@Param("usuarioId") Long usuarioId);
    
    /**
     * Recalcular estatísticas de um local (chama stored procedure)
     */
    @Query(value = "CALL sp_recalcular_local_stats(:localId)", nativeQuery = true)
    void recalcularLocalStats(@Param("localId") Long localId);
    
    /**
     * Atualizar todos os rankings de categorias
     */
    @Query(value = "CALL sp_atualizar_categoria_rankings()", nativeQuery = true)
    void atualizarCategoriaRankings();
}
