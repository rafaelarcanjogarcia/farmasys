package com.farmacia.controller;

import com.farmacia.exception.RecursoNaoEncontradoException;
import com.farmacia.model.Medicamento;
import com.farmacia.repository.MedicamentoRepository;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/medicamentos")
public class MedicamentoController {

    private final MedicamentoRepository repository;

    public MedicamentoController(MedicamentoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Medicamento> listar(@RequestParam(required = false) String busca) {
        if (busca == null || busca.isBlank()) {
            return repository.findByNomeContainingIgnoreCaseOrderByNome("");
        }
        return repository.findByNomeContainingIgnoreCaseOrderByNome(busca.trim());
    }

    @GetMapping("/{id}")
    public Medicamento buscar(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Medicamento não encontrado."));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Medicamento criar(@Valid @RequestBody Medicamento medicamento) {
        medicamento.setId(null);
        return repository.save(medicamento);
    }

    @PutMapping("/{id}")
    public Medicamento atualizar(@PathVariable Long id, @Valid @RequestBody Medicamento dados) {
        Medicamento med = buscar(id);
        med.setNome(dados.getNome());
        med.setFabricante(dados.getFabricante());
        med.setPreco(dados.getPreco());
        med.setEstoque(dados.getEstoque());
        med.setValidade(dados.getValidade());
        return repository.save(med);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {
        buscar(id);
        repository.deleteById(id);
        repository.flush(); // força a checagem de FK aqui, para o handler responder 409
    }
}
