/* ===================== Utilidades ===================== */
const $ = (sel) => document.querySelector(sel);
const brl = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const esc = (s) => String(s ?? '').replace(/[&<>"']/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const formatarData = (iso) => iso ? new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR') : '—';
const hojeISO = () => new Date().toLocaleDateString('sv-SE'); // yyyy-mm-dd

let toastTimer;
function toast(msg, erro = false) {
  const el = $('#toast');
  el.textContent = msg;
  el.className = 'mostrar' + (erro ? ' erro' : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.className = ''), 3500);
}

async function api(url, options = {}) {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!res.ok) {
    let msg = 'Erro inesperado. Tente novamente.';
    try { msg = (await res.json()).mensagem || msg; } catch (_) {}
    throw new Error(msg);
  }
  return res.status === 204 ? null : res.json();
}

/* ===================== Abas ===================== */
document.querySelectorAll('.tab').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.painel').forEach((p) => p.classList.remove('ativo'));
    btn.classList.add('active');
    $('#' + btn.dataset.tab).classList.add('ativo');
    if (btn.dataset.tab === 'venda') carregarSelectVenda();
    if (btn.dataset.tab === 'faturamento') consultarFaturamento();
  });
});

/* ===================== Medicamentos ===================== */
let medicamentos = [];

async function carregarMedicamentos() {
  const busca = encodeURIComponent($('#busca').value.trim());
  try {
    medicamentos = await api('/api/medicamentos?busca=' + busca);
    renderMedicamentos();
  } catch (e) { toast(e.message, true); }
}

function renderMedicamentos() {
  const hoje = hojeISO();
  $('#tbody-med').innerHTML = medicamentos.length
    ? medicamentos.map((m) => `
      <tr>
        <td>${esc(m.nome)}</td>
        <td>${esc(m.fabricante) || '—'}</td>
        <td>${brl(m.preco)}</td>
        <td class="${m.estoque < 10 ? 'baixo' : ''}">${m.estoque}${m.estoque < 10 ? ' ⚠ baixo' : ''}</td>
        <td class="${m.validade && m.validade < hoje ? 'vencido' : ''}">${formatarData(m.validade)}${m.validade && m.validade < hoje ? ' (vencido)' : ''}</td>
        <td class="acoes-td">
          <button class="btn pequeno" data-acao="editar" data-id="${m.id}">Editar</button>
          <button class="btn pequeno perigo" data-acao="excluir" data-id="${m.id}">Excluir</button>
        </td>
      </tr>`).join('')
    : '<tr><td colspan="6" class="vazio">Nenhum medicamento cadastrado.</td></tr>';
}

$('#tbody-med').addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-acao]');
  if (!btn) return;
  const id = Number(btn.dataset.id);

  if (btn.dataset.acao === 'editar') {
    const m = medicamentos.find((x) => x.id === id);
    $('#med-id').value = m.id;
    $('#med-nome').value = m.nome;
    $('#med-fabricante').value = m.fabricante ?? '';
    $('#med-preco').value = m.preco;
    $('#med-estoque').value = m.estoque;
    $('#med-validade').value = m.validade ?? '';
    $('#form-titulo').textContent = 'Editar medicamento';
    $('#med-cancelar').hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (confirm('Excluir este medicamento?')) {
    try {
      await api('/api/medicamentos/' + id, { method: 'DELETE' });
      toast('Medicamento excluído.');
      carregarMedicamentos();
    } catch (err) { toast(err.message, true); }
  }
});

function limparFormMed() {
  $('#form-med').reset();
  $('#med-id').value = '';
  $('#form-titulo').textContent = 'Cadastrar medicamento';
  $('#med-cancelar').hidden = true;
}
$('#med-cancelar').addEventListener('click', limparFormMed);

$('#form-med').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = $('#med-id').value;
  const corpo = {
    nome: $('#med-nome').value.trim(),
    fabricante: $('#med-fabricante').value.trim() || null,
    preco: Number($('#med-preco').value),
    estoque: Number($('#med-estoque').value),
    validade: $('#med-validade').value || null,
  };
  try {
    await api(id ? '/api/medicamentos/' + id : '/api/medicamentos', {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(corpo),
    });
    toast(id ? 'Medicamento atualizado!' : 'Medicamento cadastrado!');
    limparFormMed();
    carregarMedicamentos();
  } catch (err) { toast(err.message, true); }
});

let buscaTimer;
$('#busca').addEventListener('input', () => {
  clearTimeout(buscaTimer);
  buscaTimer = setTimeout(carregarMedicamentos, 300);
});

/* ===================== Nova venda ===================== */
let carrinho = []; // { id, nome, preco, qtd }

async function carregarSelectVenda() {
  try {
    const lista = await api('/api/medicamentos');
    const hoje = hojeISO();
    const disponiveis = lista.filter((m) => m.estoque > 0 && !(m.validade && m.validade < hoje));
    $('#venda-med').innerHTML = disponiveis.length
      ? disponiveis.map((m) =>
          `<option value="${m.id}" data-nome="${esc(m.nome)}" data-preco="${m.preco}" data-estoque="${m.estoque}">
            ${esc(m.nome)} — ${brl(m.preco)} (estoque: ${m.estoque})</option>`).join('')
      : '<option value="">Sem medicamentos disponíveis</option>';
  } catch (e) { toast(e.message, true); }
}

$('#venda-add').addEventListener('click', () => {
  const opt = $('#venda-med').selectedOptions[0];
  if (!opt || !opt.value) return toast('Selecione um medicamento.', true);

  const qtd = parseInt($('#venda-qtd').value, 10);
  if (!qtd || qtd < 1) return toast('Informe uma quantidade válida.', true);

  const id = Number(opt.value);
  const estoque = Number(opt.dataset.estoque);
  const existente = carrinho.find((i) => i.id === id);
  const novaQtd = (existente ? existente.qtd : 0) + qtd;

  if (novaQtd > estoque) return toast(`Estoque insuficiente (disponível: ${estoque}).`, true);

  if (existente) existente.qtd = novaQtd;
  else carrinho.push({ id, nome: opt.dataset.nome, preco: Number(opt.dataset.preco), qtd });

  $('#venda-qtd').value = 1;
  renderCarrinho();
});

function renderCarrinho() {
  $('#tbody-carrinho').innerHTML = carrinho.length
    ? carrinho.map((i, idx) => `
      <tr>
        <td>${esc(i.nome)}</td>
        <td>${i.qtd}</td>
        <td>${brl(i.preco)}</td>
        <td>${brl(i.preco * i.qtd)}</td>
        <td><button class="btn pequeno perigo" data-remover="${idx}">Remover</button></td>
      </tr>`).join('')
    : '<tr><td colspan="5" class="vazio">Carrinho vazio.</td></tr>';
  $('#venda-total').textContent = brl(carrinho.reduce((s, i) => s + i.preco * i.qtd, 0));
}

$('#tbody-carrinho').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-remover]');
  if (!btn) return;
  carrinho.splice(Number(btn.dataset.remover), 1);
  renderCarrinho();
});

$('#venda-finalizar').addEventListener('click', async () => {
  if (!carrinho.length) return toast('Adicione ao menos um item.', true);
  try {
    const venda = await api('/api/vendas', {
      method: 'POST',
      body: JSON.stringify({ itens: carrinho.map((i) => ({ medicamentoId: i.id, quantidade: i.qtd })) }),
    });
    toast(`Venda #${venda.id} registrada: ${brl(venda.total)}`);
    carrinho = [];
    renderCarrinho();
    carregarSelectVenda();
    carregarMedicamentos();
  } catch (err) { toast(err.message, true); }
});

/* ===================== Faturamento ===================== */
async function consultarFaturamento() {
  const inicio = $('#fat-inicio').value;
  const fim = $('#fat-fim').value;
  if (!inicio || !fim) return;
  if (inicio > fim) return toast('A data inicial deve ser anterior à final.', true);

  try {
    const [fat, vendas] = await Promise.all([
      api(`/api/faturamento?inicio=${inicio}&fim=${fim}`),
      api(`/api/vendas?inicio=${inicio}&fim=${fim}`),
    ]);
    $('#fat-total').textContent = brl(fat.total);
    $('#fat-qtd').textContent = fat.quantidadeVendas;
    $('#fat-ticket').textContent = brl(fat.ticketMedio);

    $('#tbody-vendas').innerHTML = vendas.length
      ? vendas.map((v) => `
        <tr>
          <td>${v.id}</td>
          <td>${new Date(v.dataHora).toLocaleString('pt-BR')}</td>
          <td>${v.itens.map((i) => `${i.quantidade}× ${esc(i.medicamento.nome)}`).join(', ')}</td>
          <td>${brl(v.total)}</td>
        </tr>`).join('')
      : '<tr><td colspan="4" class="vazio">Nenhuma venda no período.</td></tr>';
  } catch (e) { toast(e.message, true); }
}
$('#fat-buscar').addEventListener('click', consultarFaturamento);

/* ===================== Inicialização ===================== */
(function iniciar() {
  const hoje = new Date();
  $('#fat-inicio').value = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toLocaleDateString('sv-SE');
  $('#fat-fim').value = hojeISO();
  renderCarrinho();
  carregarMedicamentos();
})();
