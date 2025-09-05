package com.eric.avalia.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity @Table(name="avaliacao")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Avaliacao {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional=false) @JoinColumn(name="usuario_id")
    private Usuario usuario;

    @ManyToOne(optional=false) @JoinColumn(name="local_id")
    private LocalPlace local;

    @Column(nullable=false)
    private Integer nota; // 0..10

    @Column(length=500)
    private String comentario;

    private String fotoUrl;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
