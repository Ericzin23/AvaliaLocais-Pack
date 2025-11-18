package com.eric.avalia.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity @Table(name="usuario")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Usuario {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false)
    private String nome;

    @Column(nullable=false, unique=true)
    private String email;

    @Column(nullable=false)
    private String senhaHash;

    private LocalDate dataNascimento;
    private String genero;
    private String fotoUrl;

    private OffsetDateTime ultimoLoginAt;
    private String expoPushToken;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    // Relacionamentos bidirecionais para garantir integridade referencial
    @OneToMany(mappedBy="usuario", cascade=CascadeType.ALL, orphanRemoval=true)
    @Builder.Default
    private List<Avaliacao> avaliacoes = new ArrayList<>();

    @OneToMany(mappedBy="usuario", cascade=CascadeType.ALL, orphanRemoval=true)
    @Builder.Default
    private List<Visita> visitas = new ArrayList<>();

    @OneToMany(mappedBy="usuario", cascade=CascadeType.ALL, orphanRemoval=true)
    @Builder.Default
    private List<Relatorio> relatorios = new ArrayList<>();
}
