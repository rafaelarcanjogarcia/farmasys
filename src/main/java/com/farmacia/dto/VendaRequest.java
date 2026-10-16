package com.farmacia.dto;

import java.util.List;

public record VendaRequest(List<Item> itens) {
    public record Item(Long medicamentoId, Integer quantidade) {}
}
