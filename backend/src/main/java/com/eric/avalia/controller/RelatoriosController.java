package com.eric.avalia.controller;

import com.eric.avalia.entity.Relatorio;
import com.eric.avalia.entity.Usuario;
import com.eric.avalia.repository.RelatorioRepository;
import com.eric.avalia.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;

@RestController
@RequestMapping("/relatorios")
@RequiredArgsConstructor
@SuppressWarnings("null")
public class RelatoriosController {
    private final RelatorioRepository repo;
    private final UsuarioRepository usuarioRepo;

    @GetMapping("/top")
    public ResponseEntity<?> top(@RequestParam(name = "periodo") String periodo,
                                  @RequestHeader("X-User-Email") String email) {
        Usuario u = usuarioRepo.findByEmail(email).orElse(null);
        if (u == null) return ResponseEntity.status(401).body("Usuário não autenticado");

        Relatorio.Periodo p = Relatorio.Periodo.valueOf(periodo.toUpperCase());
        // Buscar apenas relatórios do usuário logado
        return ResponseEntity.ok(repo.findByUsuarioAndPeriodoOrderByCreatedAtDesc(u, p));
    }

    @PostMapping
    public ResponseEntity<?> criar(@RequestBody Relatorio req,
                                   @RequestHeader("X-User-Email") String email) {
        Usuario u = usuarioRepo.findByEmail(email).orElse(null);
        if (u == null) return ResponseEntity.status(401).body("Usuário não autenticado");

        Relatorio r = Relatorio.builder()
                .usuario(u)
                .periodo(req.getPeriodo())
                .referenciaInicio(req.getReferenciaInicio())
                .referenciaFim(req.getReferenciaFim())
                .payloadJson(req.getPayloadJson())
                .createdAt(OffsetDateTime.now())
                .build();

        return ResponseEntity.ok(repo.save(r));
    }
}
