package com.farmacia.service;

import com.farmacia.dto.FaturamentoResponse;
import com.farmacia.dto.VendaRequest;
import com.farmacia.exception.RecursoNaoEncontradoException;
import com.farmacia.exception.RegraNegocioException;
import com.farmacia.model.ItemVenda;
import com.farmacia.model.Medicamento;
import com.farmacia.model.Venda;
import com.farmacia.repository.MedicamentoRepository;
import com.farmacia.repository.VendaRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VendaService {

    private final VendaRepository vendaRepository;
    private final MedicamentoRepository medicamentoRepository;

    public VendaService(VendaRepository vendaRepository, MedicamentoRepository medicamentoRepository) {
        this.vendaRepository = vendaRepository;
        this.medicamentoRepository = medicamentoRepository;
    }

    /**
     * Registra a venda e dá baixa no estoque na MESMA transação:
     * se qualquer item falhar, nada é salvo.
     */
    @Transactional
    public Venda registrar(VendaRequest request) {
        if (request == null || request.itens() == null || request.itens().isEmpty()) {
            throw new RegraNegocioException("A venda precisa ter pelo menos um item.");
        }

        Venda venda = new Venda();
        venda.setDataHora(LocalDateTime.now());
        BigDecimal total = BigDecimal.ZERO;

        for (VendaRequest.Item pedido : request.itens()) {
            if (pedido.quantidade() == null || pedido.quantidade() <= 0) {
                throw new RegraNegocioException("A quantidade deve ser maior que zero.");
            }

            Medicamento med = medicamentoRepository.findById(pedido.medicamentoId())
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Medicamento não encontrado."));

            if (med.getValidade() != null && med.getValidade().isBefore(LocalDate.now())) {
                throw new RegraNegocioException("Medicamento vencido: " + med.getNome() + ".");
            }
            if (med.getEstoque() < pedido.quantidade()) {
                throw new RegraNegocioException("Estoque insuficiente para " + med.getNome()
                        + " (disponível: " + med.getEstoque() + ").");
            }

            med.setEstoque(med.getEstoque() - pedido.quantidade());

            ItemVenda item = new ItemVenda();
            item.setVenda(venda);
            item.setMedicamento(med);
            item.setQuantidade(pedido.quantidade());
            item.setPrecoUnitario(med.getPreco());
            venda.getItens().add(item);

            total = total.add(med.getPreco().multiply(BigDecimal.valueOf(pedido.quantidade())));
        }

        venda.setTotal(total);
        return vendaRepository.save(venda);
    }

    @Transactional(readOnly = true)
    public List<Venda> listar(LocalDate inicio, LocalDate fim) {
        if (inicio == null || fim == null) {
            return vendaRepository.findAllByOrderByDataHoraDesc();
        }
        return vendaRepository.findByDataHoraGreaterThanEqualAndDataHoraLessThanOrderByDataHoraDesc(
                inicio.atStartOfDay(), fim.plusDays(1).atStartOfDay());
    }

    @Transactional(readOnly = true)
    public FaturamentoResponse faturamento(LocalDate inicio, LocalDate fim) {
        LocalDateTime de = inicio.atStartOfDay();
        LocalDateTime ate = fim.plusDays(1).atStartOfDay();

        BigDecimal total = vendaRepository.somarTotal(de, ate);
        long qtd = vendaRepository.contarVendas(de, ate);
        BigDecimal ticket = qtd == 0
                ? BigDecimal.ZERO
                : total.divide(BigDecimal.valueOf(qtd), 2, RoundingMode.HALF_UP);

        return new FaturamentoResponse(total, qtd, ticket);
    }
}
