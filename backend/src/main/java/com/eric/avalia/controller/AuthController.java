package com.eric.avalia.controller;

import com.eric.avalia.dto.LoginRequest;
import com.eric.avalia.dto.RegisterRequest;
import com.eric.avalia.dto.ResetRequest;
import com.eric.avalia.entity.Usuario;
import com.eric.avalia.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController @RequestMapping("/auth") @RequiredArgsConstructor
public class AuthController {
    private final UsuarioService usuarioService;

    private ResponseEntity<Map<String,Object>> bad(String code, String field, String message){
        Map<String,Object> m = new HashMap<>();
        m.put("code", code);
        if(field!=null) m.put("field", field);
        m.put("message", message);
        return ResponseEntity.badRequest().body(m);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        // senha forte
        if (!req.senha().matches("^(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$")) {
            return bad("WEAK_PASSWORD","senha","Senha fraca: mínimo 8, 1 maiúscula, 1 número e 1 símbolo.");
        }
        // domínio (se quiser validar também no backend – opcional)
        String email = req.email().toLowerCase();
        String[] parts = email.split("@");
        if (parts.length!=2) return bad("INVALID_EMAIL","email","E-mail inválido");
        // String[] allowed = {"gmail.com","outlook.com","hotmail.com","yahoo.com"}; // opcional
        // boolean ok = java.util.Arrays.asList(allowed).contains(parts[1]);
        // if(!ok) return bad("UNSUPPORTED_DOMAIN","email","Domínio não suportado");

        boolean existe = usuarioService.buscarPorEmail(req.email()).isPresent();
        if (existe) return bad("EMAIL_EXISTS","email","E-mail já cadastrado");

        Usuario u = Usuario.builder()
                .nome(req.nome())
                .email(req.email())
                .senhaHash(req.senha()) // será criptografada no service
                .dataNascimento(req.dataNascimento())
                .genero(req.genero())
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();
        Usuario salvo = usuarioService.registrar(u);

        return ResponseEntity.ok(Map.of("id", salvo.getId(), "ok", true));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        var opt = usuarioService.buscarPorEmail(req.email());
        if (opt.isEmpty()) return ResponseEntity.status(401).body(Map.of("code","EMAIL_NOT_FOUND","field","email","message","E-mail não cadastrado"));
        var u = opt.get();
        if (!usuarioService.senhaConfere(u, req.senha()))
            return ResponseEntity.status(401).body(Map.of("code","WRONG_PASSWORD","field","senha","message","Senha incorreta"));
        usuarioService.atualizarUltimoLogin(u);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @PostMapping("/forgot")
    public ResponseEntity<?> forgot(@Valid @RequestBody ResetRequest req) {
        var opt = usuarioService.buscarPorEmail(req.email());
        if (opt.isEmpty()) return bad("USER_NOT_FOUND","email","Usuário não encontrado");
        var u = opt.get();
        if (u.getDataNascimento()==null || !u.getDataNascimento().equals(req.dataNascimento())) {
            return ResponseEntity.status(401).body(Map.of("code","BIRTH_MISMATCH","field","dataNascimento","message","Data de nascimento não confere"));
        }
        usuarioService.resetarSenha(u, req.novaSenha());
        return ResponseEntity.ok(Map.of("reset","ok"));
    }
}
