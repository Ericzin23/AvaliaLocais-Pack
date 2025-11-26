package com.eric.avalia.controller;

import com.eric.avalia.repository.AvaliacaoRepository;
import com.eric.avalia.repository.LocalPlaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/tendencias")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TendenciasController {
    
    private final JdbcTemplate jdbcTemplate;
    private final AvaliacaoRepository avaliacaoRepo;
    private final LocalPlaceRepository localRepo;

    /**
     * Retorna overview geral das tendências
     */
    @GetMapping("/overview")
    public ResponseEntity<?> getOverview() {
        Map<String, Object> overview = new HashMap<>();
        
        // Total de avaliações hoje
        String sqlHoje = "SELECT COUNT(*) FROM avaliacao WHERE DATE(created_at) = CURDATE()";
        Integer avaliacoesHoje = jdbcTemplate.queryForObject(sqlHoje, Integer.class);
        
        // Total de avaliações essa semana
        String sqlSemana = "SELECT COUNT(*) FROM avaliacao WHERE YEARWEEK(created_at) = YEARWEEK(CURDATE())";
        Integer avaliacoesSemana = jdbcTemplate.queryForObject(sqlSemana, Integer.class);
        
        // Total de avaliações esse mês
        String sqlMes = "SELECT COUNT(*) FROM avaliacao WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())";
        Integer avaliacoesMes = jdbcTemplate.queryForObject(sqlMes, Integer.class);
        
        // Total geral
        Integer totalAvaliacoes = avaliacaoRepo.findAll().size();
        Integer totalLocais = localRepo.findAll().size();
        
        overview.put("avaliacoesHoje", avaliacoesHoje);
        overview.put("avaliacoesSemana", avaliacoesSemana);
        overview.put("avaliacoesMes", avaliacoesMes);
        overview.put("totalAvaliacoes", totalAvaliacoes);
        overview.put("totalLocais", totalLocais);
        
        return ResponseEntity.ok(overview);
    }

    /**
     * Top locais da semana por categoria
     */
    @GetMapping("/top-semana")
    public ResponseEntity<?> getTopSemana(@RequestParam(defaultValue = "all") String categoria) {
        String sql;
        
        if ("all".equals(categoria)) {
            sql = """
                SELECT 
                    l.id, l.nome, l.categoria, l.endereco,
                    COUNT(a.id) as total_avaliacoes,
                    AVG(a.nota) as nota_media
                FROM avaliacao a
                JOIN local l ON a.local_id = l.id
                WHERE YEARWEEK(a.created_at) = YEARWEEK(CURDATE())
                GROUP BY l.id, l.nome, l.categoria, l.endereco
                ORDER BY total_avaliacoes DESC, nota_media DESC
                LIMIT 10
                """;
        } else {
            sql = """
                SELECT 
                    l.id, l.nome, l.categoria, l.endereco,
                    COUNT(a.id) as total_avaliacoes,
                    AVG(a.nota) as nota_media
                FROM avaliacao a
                JOIN local l ON a.local_id = l.id
                WHERE YEARWEEK(a.created_at) = YEARWEEK(CURDATE())
                AND l.categoria = ?
                GROUP BY l.id, l.nome, l.categoria, l.endereco
                ORDER BY total_avaliacoes DESC, nota_media DESC
                LIMIT 10
                """;
        }
        
        List<Map<String, Object>> results;
        if ("all".equals(categoria)) {
            results = jdbcTemplate.queryForList(sql);
        } else {
            results = jdbcTemplate.queryForList(sql, categoria);
        }
        
        return ResponseEntity.ok(results);
    }

    /**
     * Melhor avaliados de todos os tempos por categoria
     */
    @GetMapping("/melhores-avaliados")
    public ResponseEntity<?> getMelhoresAvaliados(@RequestParam(defaultValue = "all") String categoria) {
        String sql;
        
        if ("all".equals(categoria)) {
            sql = """
                SELECT 
                    l.id, l.nome, l.categoria, l.endereco,
                    COUNT(a.id) as total_avaliacoes,
                    AVG(a.nota) as nota_media
                FROM avaliacao a
                JOIN local l ON a.local_id = l.id
                GROUP BY l.id, l.nome, l.categoria, l.endereco
                HAVING COUNT(a.id) >= 1
                ORDER BY nota_media DESC, total_avaliacoes DESC
                LIMIT 20
                """;
        } else {
            sql = """
                SELECT 
                    l.id, l.nome, l.categoria, l.endereco,
                    COUNT(a.id) as total_avaliacoes,
                    AVG(a.nota) as nota_media
                FROM avaliacao a
                JOIN local l ON a.local_id = l.id
                WHERE l.categoria = ?
                GROUP BY l.id, l.nome, l.categoria, l.endereco
                HAVING COUNT(a.id) >= 1
                ORDER BY nota_media DESC, total_avaliacoes DESC
                LIMIT 20
                """;
        }
        
        List<Map<String, Object>> results;
        if ("all".equals(categoria)) {
            results = jdbcTemplate.queryForList(sql);
        } else {
            results = jdbcTemplate.queryForList(sql, categoria);
        }
        
        return ResponseEntity.ok(results);
    }

    /**
     * Estatísticas por categoria
     */
    @GetMapping("/categorias")
    public ResponseEntity<?> getEstatisticasCategorias() {
        String sql = """
            SELECT 
                l.categoria,
                COUNT(DISTINCT l.id) as total_locais,
                COUNT(a.id) as total_avaliacoes,
                AVG(a.nota) as nota_media,
                COUNT(DISTINCT a.usuario_id) as usuarios_unicos
            FROM local l
            LEFT JOIN avaliacao a ON l.id = a.local_id
            GROUP BY l.categoria
            ORDER BY total_avaliacoes DESC
            """;
        
        List<Map<String, Object>> results = jdbcTemplate.queryForList(sql);
        return ResponseEntity.ok(results);
    }

    /**
     * Tendência de avaliações nos últimos 30 dias
     */
    @GetMapping("/grafico-30dias")
    public ResponseEntity<?> getGrafico30Dias(@RequestParam(defaultValue = "all") String categoria) {
        String sql;
        
        if ("all".equals(categoria)) {
            sql = """
                SELECT 
                    DATE(created_at) as data,
                    COUNT(*) as total_avaliacoes,
                    AVG(nota) as nota_media
                FROM avaliacao
                WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                GROUP BY DATE(created_at)
                ORDER BY data ASC
                """;
        } else {
            sql = """
                SELECT 
                    DATE(a.created_at) as data,
                    COUNT(*) as total_avaliacoes,
                    AVG(a.nota) as nota_media
                FROM avaliacao a
                JOIN local l ON a.local_id = l.id
                WHERE a.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                AND l.categoria = ?
                GROUP BY DATE(a.created_at)
                ORDER BY data ASC
                """;
        }
        
        List<Map<String, Object>> results;
        if ("all".equals(categoria)) {
            results = jdbcTemplate.queryForList(sql);
        } else {
            results = jdbcTemplate.queryForList(sql, categoria);
        }
        
        // Preencher dias sem avaliações com zero
        List<Map<String, Object>> completResults = new ArrayList<>();
        LocalDate hoje = LocalDate.now();
        LocalDate inicio = hoje.minusDays(29);
        
        for (int i = 0; i < 30; i++) {
            LocalDate data = inicio.plusDays(i);
            String dataStr = data.toString();
            
            Optional<Map<String, Object>> found = results.stream()
                .filter(r -> r.get("data").toString().equals(dataStr))
                .findFirst();
            
            Map<String, Object> dia = new HashMap<>();
            dia.put("data", dataStr);
            
            if (found.isPresent()) {
                dia.put("total_avaliacoes", found.get().get("total_avaliacoes"));
                dia.put("nota_media", found.get().get("nota_media"));
            } else {
                dia.put("total_avaliacoes", 0);
                dia.put("nota_media", 0.0);
            }
            
            completResults.add(dia);
        }
        
        return ResponseEntity.ok(completResults);
    }

    /**
     * Distribuição de notas (histograma)
     */
    @GetMapping("/distribuicao-notas")
    public ResponseEntity<?> getDistribuicaoNotas(@RequestParam(defaultValue = "all") String categoria) {
        String sql;
        
        if ("all".equals(categoria)) {
            sql = """
                SELECT 
                    CASE 
                        WHEN nota >= 9 THEN '9-10'
                        WHEN nota >= 7 THEN '7-8'
                        WHEN nota >= 5 THEN '5-6'
                        WHEN nota >= 3 THEN '3-4'
                        ELSE '0-2'
                    END as faixa_nota,
                    COUNT(*) as quantidade
                FROM avaliacao
                GROUP BY faixa_nota
                ORDER BY faixa_nota DESC
                """;
        } else {
            sql = """
                SELECT 
                    CASE 
                        WHEN a.nota >= 9 THEN '9-10'
                        WHEN a.nota >= 7 THEN '7-8'
                        WHEN a.nota >= 5 THEN '5-6'
                        WHEN a.nota >= 3 THEN '3-4'
                        ELSE '0-2'
                    END as faixa_nota,
                    COUNT(*) as quantidade
                FROM avaliacao a
                JOIN local l ON a.local_id = l.id
                WHERE l.categoria = ?
                GROUP BY faixa_nota
                ORDER BY faixa_nota DESC
                """;
        }
        
        List<Map<String, Object>> results;
        if ("all".equals(categoria)) {
            results = jdbcTemplate.queryForList(sql);
        } else {
            results = jdbcTemplate.queryForList(sql, categoria);
        }
        
        return ResponseEntity.ok(results);
    }

    /**
     * Categoria mais popular (mais avaliações recentes)
     */
    @GetMapping("/categoria-em-alta")
    public ResponseEntity<?> getCategoriaEmAlta() {
        String sql = """
            SELECT 
                l.categoria,
                COUNT(*) as avaliacoes_ultimos_7_dias
            FROM avaliacao a
            JOIN local l ON a.local_id = l.id
            WHERE a.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY l.categoria
            ORDER BY avaliacoes_ultimos_7_dias DESC
            LIMIT 1
            """;
        
        List<Map<String, Object>> result = jdbcTemplate.queryForList(sql);
        
        if (result.isEmpty()) {
            return ResponseEntity.ok(Map.of("categoria", "Nenhuma", "avaliacoes_ultimos_7_dias", 0));
        }
        
        return ResponseEntity.ok(result.get(0));
    }

    /**
     * Lista de categorias disponíveis
     */
    @GetMapping("/categorias-lista")
    public ResponseEntity<?> getCategorias() {
        String sql = "SELECT DISTINCT categoria FROM local WHERE categoria IS NOT NULL ORDER BY categoria";
        List<String> categorias = jdbcTemplate.queryForList(sql, String.class);
        return ResponseEntity.ok(categorias);
    }
}
