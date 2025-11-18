package com.eric.avalia.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record RegisterRequest(
    @NotBlank String nome,
    @Email String email,
    @NotBlank String senha,
    LocalDate dataNascimento, // Opcional - não mais @NotNull
    String genero
) {}
