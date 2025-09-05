package com.eric.avalia.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service @RequiredArgsConstructor
public class Voxme {

    @Value("${google.places.apiKey:CHANGE_ME}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    public JsonNode nearby(double lat, double lng, String categoria, int radiusMeters) {
        try {
            String body = buscarLocaisProximos(lat, lng, radiusMeters, categoria);
            return mapper.readTree(body);
        } catch (Exception e) {
            return mapper.createObjectNode().put("error", e.getMessage());
        }
    }

    public String buscarLocaisProximos(double lat, double lng, int radius, String categoria) {
        CategoryMapper.Category cat = CategoryMapper.resolve(categoria);

        // base obrigatória
        StringBuilder url = new StringBuilder("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
        url.append(String.format("?location=%f,%f&language=pt-BR&key=%s", lat, lng, apiKey));

        if (radius > 0) {
            // usa raio + ordenação por "prominence" (padrão)
            url.append("&radius=").append(radius);
        } else {
            // sem raio: usa rankby=distance (NÃO pode mandar radius junto)
            url.append("&rankby=distance");
        }

        if (cat.type != null) url.append("&type=").append(cat.type);
        if (cat.keyword != null && !cat.keyword.isBlank()) {
            url.append("&keyword=").append(CategoryMapper.encode(cat.keyword));
        }

        return restTemplate.getForObject(url.toString(), String.class);
    }
}
