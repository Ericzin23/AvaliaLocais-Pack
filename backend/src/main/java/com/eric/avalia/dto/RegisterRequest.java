package com.eric.avalia.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record RegisterRequest(
    @NotBlank String nome,
    @Email String email,
    @NotBlank String senha,
    @NotNull LocalDate dataNascimento,
    String genero
) {}
