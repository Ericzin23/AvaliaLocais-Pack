package com.eric.avalia.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity @Table(name="local")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class LocalPlace {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique=true)
    private String googlePlaceId;

    @Column(nullable=false)
    private String nome;

    private String endereco;
    private Double lat;
    private Double lng;
    private String categoria;

    @Column(length = 2048)
    private String horarioJson;
    private String telefone;
    private String website;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
