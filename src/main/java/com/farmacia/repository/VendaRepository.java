package com.farmacia.repository;

import com.farmacia.model.Venda;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VendaRepository extends JpaRepository<Venda, Long> {

    List<Venda> findAllByOrderByDataHoraDesc();

    List<Venda> findByDataHoraGreaterThanEqualAndDataHoraLessThanOrderByDataHoraDesc(
            LocalDateTime inicio, LocalDateTime fim);

    @Query("SELECT COALESCE(SUM(v.total), 0) FROM Venda v WHERE v.dataHora >= :inicio AND v.dataHora < :fim")
    BigDecimal somarTotal(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    @Query("SELECT COUNT(v) FROM Venda v WHERE v.dataHora >= :inicio AND v.dataHora < :fim")
    long contarVendas(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);
}
