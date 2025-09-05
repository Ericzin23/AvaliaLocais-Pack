package com.eric.avalia.controller;

import com.eric.avalia.entity.Relatorio;
import com.eric.avalia.repository.RelatorioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController @RequestMapping("/relatorios") @RequiredArgsConstructor
public class RelatoriosController {
    private final RelatorioRepository repo;

    @GetMapping("/top")
    public List<Relatorio> top(@RequestParam(name = "periodo") String periodo) {
        Relatorio.Periodo p = Relatorio.Periodo.valueOf(periodo.toUpperCase());
        return repo.findTop10ByPeriodoOrderByCreatedAtDesc(p);
    }
}
