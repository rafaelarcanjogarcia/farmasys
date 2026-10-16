package com.farmacia.repository;

import com.farmacia.model.Medicamento;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicamentoRepository extends JpaRepository<Medicamento, Long> {
    List<Medicamento> findByNomeContainingIgnoreCaseOrderByNome(String nome);
}
