package com.eric.avalia.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity @Table(name="relatorio")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Relatorio {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional=false) @JoinColumn(name="usuario_id")
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    private Periodo periodo; // SEMANA, FDS

    private OffsetDateTime referenciaInicio;
    private OffsetDateTime referenciaFim;

    @Column(length=10000)
    private String payloadJson;

    private OffsetDateTime createdAt;

    public enum Periodo { SEMANA, FDS }
}
