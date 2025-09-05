package com.eric.avalia.dto;

import jakarta.validation.constraints.*;

public record ReviewRequest(
    @NotNull Long localId,
    @NotNull @Min(0) @Max(10) Integer nota,
    @Size(max=500) String comentario,
    String fotoUrl
) {}
