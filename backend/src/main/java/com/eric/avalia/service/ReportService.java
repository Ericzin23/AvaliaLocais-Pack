package com.eric.avalia.service;

import com.eric.avalia.entity.Avaliacao;
import com.eric.avalia.entity.Relatorio;
import com.eric.avalia.repository.AvaliacaoRepository;
import com.eric.avalia.repository.RelatorioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class ReportService {
    private final AvaliacaoRepository avaliacaoRepository;
    private final RelatorioRepository relatorioRepository;
    private final ObjectMapper mapper = new ObjectMapper();

    // Semanal: segunda 00:05
    @Scheduled(cron = "0 5 0 * * MON", zone = "America/Cuiaba")
    public void gerarSemanal() { gerar(Relatorio.Periodo.SEMANA, 7); }

    // Fim de semana: segunda 00:10 (referindo ao fim de semana anterior)
    @Scheduled(cron = "0 10 0 * * MON", zone = "America/Cuiaba")
    public void gerarFds() { gerar(Relatorio.Periodo.FDS, 3); }

    private void gerar(Relatorio.Periodo periodo, int dias) {
        OffsetDateTime fim = OffsetDateTime.now(ZoneId.of("America/Cuiaba"));
        OffsetDateTime ini = fim.minusDays(dias);

        // ranking simples por quantidade de avaliações no período
        List<Avaliacao> avs = avaliacaoRepository.findAll().stream()
                .filter(a -> a.getCreatedAt()!=null && a.getCreatedAt().isAfter(ini) && a.getCreatedAt().isBefore(fim))
                .toList();

        Map<Long, List<Avaliacao>> porLocal = avs.stream().collect(Collectors.groupingBy(a -> a.getLocal().getId()));
        List<Map<String, Object>> ranking = porLocal.entrySet().stream()
                .map(e -> {
                    double media = e.getValue().stream().mapToInt(Avaliacao::getNota).average().orElse(0.0);
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("localId", e.getKey());
                    m.put("qtd", e.getValue().size());
                    m.put("media", media);
                    return m;
                })
                .sorted((a,b) -> Integer.compare((int)b.get("qtd"), (int)a.get("qtd")))
                .limit(10)
                .toList();

        try {
            String payload = mapper.writeValueAsString(ranking);
            com.eric.avalia.entity.Relatorio r = com.eric.avalia.entity.Relatorio.builder()
                    .periodo(periodo)
                    .referenciaInicio(ini)
                    .referenciaFim(fim)
                    .payloadJson(payload)
                    .createdAt(OffsetDateTime.now())
                    .build();
            relatorioRepository.save(r);
        } catch (Exception ignored) {}
    }
}
