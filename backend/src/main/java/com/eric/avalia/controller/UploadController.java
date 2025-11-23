package com.eric.avalia.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/upload")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
@SuppressWarnings("null")
public class UploadController {

    @Value("${upload.dir:uploads}")
    private String uploadDir;

    /**
     * Upload genérico de arquivo
     */
    @PostMapping
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file,
                                       @RequestHeader(value = "X-User-Email", required = false) String email) {
        try {
            log.info("Upload iniciado - Email: {}, Filename: {}, Size: {}", 
                email, file.getOriginalFilename(), file.getSize());
            
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Arquivo vazio"));
            }

            // Criar diretório se não existir - usar caminho absoluto
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                log.info("Diretório de uploads criado: {}", uploadPath);
            }

            // Gerar nome único para o arquivo
            String originalFilename = file.getOriginalFilename();
            String extension = ".jpg"; // padrão
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String safeEmail = (email != null && !email.isBlank()) 
                ? email.replaceAll("[^a-zA-Z0-9]", "_") 
                : "user";
            String newFilename = safeEmail + "_" + timestamp + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;

            // Salvar arquivo
            Path filePath = uploadPath.resolve(newFilename);
            file.transferTo(filePath.toFile());

            log.info("Arquivo salvo: {} por usuário: {}", newFilename, email);

            // Retornar URL relativa
            String fileUrl = "/uploads/" + newFilename;

            return ResponseEntity.ok(Map.of(
                "url", fileUrl,
                "filename", newFilename,
                "size", file.getSize()
            ));

        } catch (IOException e) {
            log.error("Erro ao fazer upload: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "Erro ao salvar arquivo",
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Erro inesperado no upload: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "Erro inesperado",
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Upload específico para foto de perfil
     * Valida tipo de arquivo e tamanho
     */
    @PostMapping("/foto-perfil")
    public ResponseEntity<?> uploadFotoPerfil(
            @RequestParam("file") MultipartFile file,
            @RequestHeader("X-User-Email") String email) {
        try {
            log.info("Upload foto perfil - Email: {}, Filename: {}, Size: {}", 
                email, file.getOriginalFilename(), file.getSize());
            
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Arquivo vazio"));
            }

            // Validar tipo de arquivo
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Apenas imagens são permitidas"));
            }

            // Validar tamanho (máximo 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Arquivo muito grande (máximo 5MB)"));
            }

            // Criar diretório de perfil
            Path uploadPath = Paths.get(uploadDir, "perfil").toAbsolutePath();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                log.info("Diretório de fotos de perfil criado: {}", uploadPath);
            }

            // Gerar nome único
            String originalFilename = file.getOriginalFilename();
            String extension = ".jpg";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            
            String safeEmail = email.replaceAll("[^a-zA-Z0-9]", "_");
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String newFilename = "perfil_" + safeEmail + "_" + timestamp + extension;

            // Salvar arquivo
            Path filePath = uploadPath.resolve(newFilename);
            file.transferTo(filePath.toFile());

            log.info("Foto de perfil salva: {} para usuário: {}", newFilename, email);

            // Retornar URL relativa
            String fileUrl = "/uploads/perfil/" + newFilename;

            return ResponseEntity.ok(Map.of(
                "url", fileUrl,
                "filename", newFilename,
                "size", file.getSize(),
                "message", "Foto de perfil enviada com sucesso"
            ));

        } catch (IOException e) {
            log.error("Erro ao fazer upload da foto: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "Erro ao salvar foto",
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Erro inesperado no upload da foto: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "Erro inesperado",
                "message", e.getMessage()
            ));
        }
    }
}

