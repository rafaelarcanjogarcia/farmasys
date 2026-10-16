package com.farmacia.controller;

import com.farmacia.dto.FaturamentoResponse;
import com.farmacia.dto.VendaRequest;
import com.farmacia.model.Venda;
import com.farmacia.service.VendaService;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class VendaController {

    private final VendaService service;

    public VendaController(VendaService service) {
        this.service = service;
    }

    @PostMapping("/vendas")
    @ResponseStatus(HttpStatus.CREATED)
    public Venda registrar(@RequestBody VendaRequest request) {
        return service.registrar(request);
    }

    @GetMapping("/vendas")
    public List<Venda> listar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        return service.listar(inicio, fim);
    }

    @GetMapping("/faturamento")
    public FaturamentoResponse faturamento(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        return service.faturamento(inicio, fim);
    }
}
