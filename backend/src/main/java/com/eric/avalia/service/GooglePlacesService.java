package com.eric.avalia.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
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
            // fallback: se não vier nada, usa "restaurant"
            String safeType = (type != null && !type.isBlank()) ? type : "restaurant";

            StringBuilder url = new StringBuilder("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
            url.append(String.format("?location=%f,%f&language=pt-BR&key=%s", lat, lng, apiKey));

            if (radiusMeters != null && radiusMeters > 0) {
                // Usa raio explícito
                url.append("&radius=").append(radiusMeters);
            } else {
                // Sem raio: retorna sempre os mais próximos
                url.append("&rankby=distance");
            }

            // 🚩 sempre manda type
            url.append("&type=").append(safeType);

            String finalUrl = url.toString();
            System.out.println("[GooglePlacesService] URL gerada: " + finalUrl);

            String body = restTemplate.getForObject(finalUrl, String.class);
            return mapper.readTree(body);
        } catch (Exception e) {
            return mapper.createObjectNode().put("error", e.getMessage());
        }
    }
}