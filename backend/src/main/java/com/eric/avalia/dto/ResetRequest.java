package com.eric.avalia.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record ResetRequest(
    @Email String email,
    @NotNull LocalDate dataNascimento,
    @NotBlank String novaSenha
) {}
