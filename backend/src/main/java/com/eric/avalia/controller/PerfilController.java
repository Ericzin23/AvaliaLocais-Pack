package com.eric.avalia.controller;

import com.eric.avalia.entity.Avaliacao;
import com.eric.avalia.entity.Usuario;
import com.eric.avalia.repository.AvaliacaoRepository;
import com.eric.avalia.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController 
@RequestMapping("/perfil") 
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PerfilController {
    private final UsuarioRepository usuarioRepo;
    private final AvaliacaoRepository avaliacaoRepo;

    /**
     * Buscar dados completos do perfil do usuário
     */
    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader("X-User-Email") String email) {
        try {
            Usuario u = usuarioRepo.findByEmail(email).orElse(null);
            if (u == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Usuário não autenticado"));
            }

            // Dados do usuário (sem senha)
            Map<String, Object> perfil = new HashMap<>();
            perfil.put("id", u.getId());
            perfil.put("nome", u.getNome());
            perfil.put("email", u.getEmail());
            perfil.put("fotoUrl", u.getFotoUrl());
            perfil.put("dataNascimento", u.getDataNascimento());
            perfil.put("genero", u.getGenero());
            perfil.put("createdAt", u.getCreatedAt());

            return ResponseEntity.ok(perfil);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erro ao buscar perfil: " + e.getMessage()));
        }
    }

    /**
     * Atualizar foto do perfil
     */
    @PutMapping("/foto")
    public ResponseEntity<?> atualizarFoto(
            @RequestHeader("X-User-Email") String email,
            @RequestBody Map<String, String> body) {
        try {
            String fotoUrl = body.get("fotoUrl");
            
            if (fotoUrl == null || fotoUrl.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "URL da foto é obrigatória"));
            }

            Optional<Usuario> usuarioOpt = usuarioRepo.findByEmail(email);
            
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Usuário não encontrado"));
            }

            Usuario usuario = usuarioOpt.get();
            usuario.setFotoUrl(fotoUrl);
            usuarioRepo.save(usuario);

            return ResponseEntity.ok(Map.of(
                "message", "Foto atualizada com sucesso",
                "fotoUrl", fotoUrl
            ));
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erro ao atualizar foto: " + e.getMessage()));
        }
    }

    /**
     * Atualizar dados do perfil
     */
    @PutMapping("/atualizar")
    public ResponseEntity<?> atualizarPerfil(
            @RequestHeader("X-User-Email") String email,
            @RequestBody Map<String, Object> dados) {
        try {
            Optional<Usuario> usuarioOpt = usuarioRepo.findByEmail(email);
            
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Usuário não encontrado"));
            }

            Usuario usuario = usuarioOpt.get();

            // Atualizar campos permitidos
            if (dados.containsKey("nome")) {
                usuario.setNome((String) dados.get("nome"));
            }
            
            if (dados.containsKey("dataNascimento") && dados.get("dataNascimento") != null) {
                String dataStr = (String) dados.get("dataNascimento");
                if (!dataStr.isEmpty()) {
                    usuario.setDataNascimento(java.time.LocalDate.parse(dataStr));
                }
            }
            
            if (dados.containsKey("genero")) {
                usuario.setGenero((String) dados.get("genero"));
            }

            usuarioRepo.save(usuario);

            return ResponseEntity.ok(Map.of(
                "message", "Perfil atualizado com sucesso",
                "usuario", Map.of(
                    "id", usuario.getId(),
                    "nome", usuario.getNome(),
                    "email", usuario.getEmail(),
                    "fotoUrl", usuario.getFotoUrl() != null ? usuario.getFotoUrl() : "",
                    "dataNascimento", usuario.getDataNascimento() != null ? usuario.getDataNascimento().toString() : "",
                    "genero", usuario.getGenero() != null ? usuario.getGenero() : ""
                )
            ));
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erro ao atualizar perfil: " + e.getMessage()));
        }
    }

    /**
     * Buscar estatísticas do usuário (mantido por compatibilidade)
     */
    @GetMapping("/estatisticas")
    public ResponseEntity<?> estatisticas(@RequestHeader("X-User-Email") String email) {
        try {
            Usuario u = usuarioRepo.findByEmail(email).orElse(null);
            if (u == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Usuário não autenticado"));
            }

            List<Avaliacao> minhas = avaliacaoRepo.findByUsuario(u);
            double media = minhas.stream()
                .mapToInt(Avaliacao::getNota)
                .average()
                .orElse(0.0);
            
            Map<String, Long> catCount = minhas.stream()
                .collect(Collectors.groupingBy(
                    a -> a.getLocal().getCategoria(), 
                    Collectors.counting()
                ));

            Map<String, Object> resp = new HashMap<>();
            resp.put("totalAvaliacoes", minhas.size());
            resp.put("notaMedia", media);
            resp.put("categoriaMaisComum", catCount.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null));
            resp.put("avaliacoes", minhas);
            
            return ResponseEntity.ok(resp);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erro ao buscar estatísticas: " + e.getMessage()));
        }
    }
}

