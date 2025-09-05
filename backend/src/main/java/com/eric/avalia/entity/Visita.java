package com.eric.avalia.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity @Table(name="visita")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Visita {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional=false) @JoinColumn(name="usuario_id")
    private Usuario usuario;

    @ManyToOne(optional=false) @JoinColumn(name="local_id")
    private LocalPlace local;

    private OffsetDateTime checkinAt;
    private Double checkinLat;
    private Double checkinLng;

    private OffsetDateTime checkoutAt;
    private Double checkoutLat;
    private Double checkoutLng;

    private Integer duracaoMin; // calculado no checkout
    private OffsetDateTime createdAt;
}
