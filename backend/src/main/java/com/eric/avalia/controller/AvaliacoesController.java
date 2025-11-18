package com.eric.avalia.controller;

import com.eric.avalia.dto.ReviewRequest;
import com.eric.avalia.entity.Avaliacao;
import com.eric.avalia.entity.LocalPlace;
import com.eric.avalia.entity.Usuario;
import com.eric.avalia.repository.AvaliacaoRepository;
import com.eric.avalia.repository.LocalPlaceRepository;
import com.eric.avalia.repository.UsuarioRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/avaliacoes")
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AvaliacoesController {
    private final AvaliacaoRepository repo;
    private final UsuarioRepository usuarioRepo;
    private final LocalPlaceRepository localRepo;

    @PostMapping
    public ResponseEntity<?> criar(@Valid @RequestBody ReviewRequest req,
                                   @RequestHeader("X-User-Email") String email) {
        // Buscar ou criar usuário demo
        Usuario u = usuarioRepo.findByEmail(email).orElseGet(() -> {
            Usuario novoUsuario = Usuario.builder()
                    .email(email)
                    .nome("Usuário Demo")
                    .senhaHash("demo123") // senha simples para demo
                    .createdAt(OffsetDateTime.now())
                    .updatedAt(OffsetDateTime.now())
                    .build();
            return usuarioRepo.save(novoUsuario);
        });

        LocalPlace l = localRepo.findById(req.localId()).orElse(null);
        if (l == null) return ResponseEntity.badRequest().body("Local inválido");

        Avaliacao a = Avaliacao.builder()
                .usuario(u).local(l)
                .nota(req.nota())
                .comentario(req.comentario())
                .fotoUrl(req.fotoUrl())
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();
        return ResponseEntity.ok(repo.save(a));
    }

    @GetMapping("/local/{localId}")
    public List<Avaliacao> porLocal(@PathVariable Long localId) {
        LocalPlace l = localRepo.findById(localId).orElseThrow();
        return repo.findByLocal(l);
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<Avaliacao> porUsuario(@PathVariable Long usuarioId) {
        Usuario u = usuarioRepo.findById(usuarioId).orElseThrow();
        return repo.findByUsuario(u);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable Long id, @Valid @RequestBody ReviewRequest req,
                                    @RequestHeader("X-User-Email") String email) {
        var a = repo.findById(id).orElse(null);
        if (a == null) return ResponseEntity.notFound().build();
        if (!a.getUsuario().getEmail().equals(email)) return ResponseEntity.status(403).body("Proibido");

        a.setNota(req.nota());
        a.setComentario(req.comentario());
        a.setFotoUrl(req.fotoUrl());
        a.setUpdatedAt(OffsetDateTime.now());
        return ResponseEntity.ok(repo.save(a));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(@PathVariable Long id,
                                     @RequestHeader("X-User-Email") String email) {
        var a = repo.findById(id).orElse(null);
        if (a == null) return ResponseEntity.notFound().build();
        if (!a.getUsuario().getEmail().equals(email)) return ResponseEntity.status(403).body("Proibido");

        repo.delete(a);
        return ResponseEntity.ok(Map.of("deleted", true));
    }
}
