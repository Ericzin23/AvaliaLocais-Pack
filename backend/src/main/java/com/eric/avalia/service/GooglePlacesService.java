package com.eric.avalia.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@RequiredArgsConstructor
@Slf4j
public class GooglePlacesService {

    @Value("${google.places.apiKey:CHANGE_ME}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    /**
     * Busca locais próximos usando Google Places Nearby Search.
     * Se radiusMeters <= 0, usa rankby=distance (sem raio fixo).
     * Observação: quando rankby=distance é usado, o Google exige "type" ou "keyword".
     */
    public JsonNode nearby(double lat, double lng, String type, Integer radiusMeters) {
        try {
            // Garantir location
            String loc = String.format(Locale.ROOT, "%f,%f", lat, lng);

            // Normalizar type: se vier múltiplos, pegar o primeiro
            String safeType = null;
            if (type != null && !type.isBlank()) {
                safeType = type.split(",")[0].trim();
            }
            // Construir URL com UriComponentsBuilder (encode=true no build)
            UriComponentsBuilder b = UriComponentsBuilder.fromHttpUrl("https://maps.googleapis.com/maps/api/place/nearbysearch/json")
                .queryParam("location", loc)
                .queryParam("language", "pt-BR")
                .queryParam("key", apiKey);

            if (radiusMeters == null || radiusMeters <= 0) {
                // Modo B: rankby=distance (SEM radius)
                b.queryParam("rankby", "distance");
                if (safeType != null && !safeType.isBlank()) {
                    b.queryParam("keyword", safeType);
                } else {
                    throw new IllegalArgumentException("rankby=distance requer keyword ou type");
                }
            } else {
                // Modo A: prominence por radius (SEM rankby)
                b.queryParam("radius", radiusMeters);
                if (safeType != null && !safeType.isBlank()) {
                    b.queryParam("type", safeType);
                }
            }

            String finalUrl = b.build(true).toUriString(); // true = encode
            log.info("Calling Places Nearby: {}", finalUrl.replaceAll("key=[^&]+", "key=REDACTED"));

            String body = restTemplate.getForObject(finalUrl, String.class);
            return mapper.readTree(body);
        } catch (Exception e) {
            log.error("Erro ao chamar Google Places: {}", e.getMessage(), e);
            return mapper.createObjectNode().put("error", e.getMessage());
        }
    }
}