package com.farmacia.dto;

import java.math.BigDecimal;

public record FaturamentoResponse(BigDecimal total, long quantidadeVendas, BigDecimal ticketMedio) {}
