package com.eric.avalia.controller;

import com.eric.avalia.entity.Avaliacao;
import com.eric.avalia.entity.Usuario;
import com.eric.avalia.repository.AvaliacaoRepository;
import com.eric.avalia.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController @RequestMapping("/perfil") @RequiredArgsConstructor
public class PerfilController {
    private final UsuarioRepository usuarioRepo;
    private final AvaliacaoRepository avaliacaoRepo;

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader("X-User-Email") String email) {
        Usuario u = usuarioRepo.findByEmail(email).orElse(null);
        if (u == null) return ResponseEntity.status(401).body("Usuário não autenticado");

        List<Avaliacao> minhas = avaliacaoRepo.findByUsuario(u);
        double media = minhas.stream().mapToInt(Avaliacao::getNota).average().orElse(0.0);
        Map<String, Long> catCount = minhas.stream().collect(Collectors.groupingBy(a -> a.getLocal().getCategoria(), Collectors.counting()));

        Map<String, Object> resp = new HashMap<>();
        resp.put("usuario", u);
        resp.put("totalAvaliacoes", minhas.size());
        resp.put("notaMedia", media);
        resp.put("categoriaMaisComum", catCount.entrySet().stream().max(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse(null));
        resp.put("avaliacoes", minhas);
        return ResponseEntity.ok(resp);
    }
}
