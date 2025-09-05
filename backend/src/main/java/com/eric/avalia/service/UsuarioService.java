package com.eric.avalia.service;

import com.eric.avalia.entity.Usuario;
import com.eric.avalia.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.Optional;

@Service @RequiredArgsConstructor
public class UsuarioService {
    private final UsuarioRepository repo;
    private final PasswordEncoder encoder;

    public Usuario registrar(Usuario uPlain) {
        uPlain.setSenhaHash(encoder.encode(uPlain.getSenhaHash())); // senhaHash vindo como plaintext para simplificar
        uPlain.setCreatedAt(OffsetDateTime.now());
        uPlain.setUpdatedAt(OffsetDateTime.now());
        return repo.save(uPlain);
    }

    public Optional<Usuario> buscarPorEmail(String email) {
        return repo.findByEmail(email);
    }

    public boolean senhaConfere(Usuario u, String senhaPura) {
        return encoder.matches(senhaPura, u.getSenhaHash());
    }

    public void atualizarUltimoLogin(Usuario u) {
        u.setUltimoLoginAt(OffsetDateTime.now());
        repo.save(u);
    }

    public void resetarSenha(Usuario u, String novaSenhaHash) {
        u.setSenhaHash(encoder.encode(novaSenhaHash));
        u.setUpdatedAt(OffsetDateTime.now());
        repo.save(u);
    }
}
