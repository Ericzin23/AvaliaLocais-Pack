package com.eric.avalia.controller;

import com.eric.avalia.entity.LocalPlace;
import com.eric.avalia.repository.LocalPlaceRepository;
import com.eric.avalia.service.GooglePlacesService;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/locais")
@RequiredArgsConstructor
public class LocaisController {
    private final GooglePlacesService placesService;
    private final LocalPlaceRepository localRepo;

    @GetMapping("/nearby")
    public ResponseEntity<?> nearby(@RequestParam(name = "lat") double lat,
                                    @RequestParam(name = "lng") double lng,
                                    @RequestParam(name = "categoria", required = false) String categoria,
                                    @RequestParam(name = "radius", defaultValue = "1500") int radius) {
        // mapeia a categoria pra type do Google
        String type = CategoriaMapper.map(categoria);
        JsonNode result = placesService.nearby(lat, lng, type, radius);
        return ResponseEntity.ok(result); // devolve JSON válido, não string
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getLocal(@PathVariable Long id) {
        Optional<LocalPlace> opt = localRepo.findById(id);
        return opt.<ResponseEntity<?>>map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // util interno para mapear categorias
    static class CategoriaMapper {
        static String map(String cat) {
            if (cat == null) return null;
            return switch (cat.toLowerCase()) {
                case "restaurante" -> "restaurant";
                case "bar" -> "bar";
                case "cafe" -> "cafe";
                case "hotel" -> "lodging";
                case "academia" -> "gym";
                case "hospital" -> "hospital";
                case "escola" -> "school";
                case "mercado" -> "supermarket";
                case "farmacia" -> "pharmacy";
                case "parque" -> "park";
                case "shopping" -> "shopping_mall";
                case "escritorio" -> "point_of_interest";
                default -> null;
            };
        }
    }
}
