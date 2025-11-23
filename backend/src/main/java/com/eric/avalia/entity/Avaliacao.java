package com.eric.avalia.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity @Table(name="avaliacao")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Avaliacao {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional=false, fetch=FetchType.LAZY)
    @JoinColumn(name="usuario_id", nullable=false)
    @JsonIgnoreProperties({"avaliacoes", "visitas", "relatorios", "senhaHash"})
    private Usuario usuario;

    @ManyToOne(optional=false, fetch=FetchType.LAZY)
    @JoinColumn(name="local_id", nullable=false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private LocalPlace local;

    @Column(nullable=false)
    private Integer nota; // 0..10

    @Column(length=500)
    private String comentario;

    private String fotoUrl;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
