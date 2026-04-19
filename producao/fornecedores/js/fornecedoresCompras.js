const APIS = {
  geral: 'dados/apiAquisicoesGerais.php',
  presenciais: 'dados/apiAquisicoesPresenciais.php',
  protocolos: 'dados/apiAquisicoesProtocolos.php'
};

const App = {

  state: {
    api: APIS.geral,
    chart: null,
    entidadesCache: [],
    entidadesVisiveis: [],
    entidadeAberta: null,
    debounceTimer: null
  },

  // =========================
  // INIT
  // =========================
  init() {
    this.setupUI();
    this.bindEvents();
    this.loadData();
  },

  setupUI() {
    $('.menu-api').removeClass('active');
    $('.menu-api[data-api="geral"]').addClass('active');
  },

  // =========================
  // EVENTS
  // =========================
  bindEvents() {

    $('.menu-api').on('click', (e) => this.handleApiChange(e));

    $('#btnFiltrar').on('click', () => this.loadData());

    $('#btnLimpar').on('click', () => this.clearFilters());

    $('#frmFornecedor').on('input', (e) => this.handleSearch(e));

    $(document).on('click', '.btn-export-excel', (e) => {
      e.stopPropagation();
      this.exportOne($(e.currentTarget).data('id'));
    });

    $(document).on('click', '.btn-export-all-excel', (e) => {
      e.stopPropagation();
      this.exportAll();
    });

    $(document).on('click', '.entidade-row', (e) => {
      this.toggleEntidade(
        $(e.currentTarget).data('target'),
        $(e.currentTarget).data('ent')
      );
    });
  },

  handleApiChange(e) {
    const tipo = $(e.currentTarget).data('api');
    const novaApi = APIS[tipo];

    if (!novaApi || this.state.api === novaApi) return;

    $('.menu-api').removeClass('active');
    $(e.currentTarget).addClass('active');

    this.state.api = novaApi;
    this.reset();
    this.loadData();
  },

  handleSearch(e) {
    clearTimeout(this.state.debounceTimer);

    this.state.debounceTimer = setTimeout(() => {
      const value = e.target.value.trim();

      if (!value) {
        this.resetList();
      } else {
        this.applyFilter();
      }
    }, 250);
  },

  clearFilters() {
    $('#frmFornecedor').val('');
    $('#anoCorrente').val('');

    this.state.entidadesVisiveis = this.state.entidadesCache;
    this.state.entidadeAberta = null;

    this.hideChart();
    this.render();
  },

  // =========================
  // DATA
  // =========================
  loadData() {

    const fornecedor = $('#frmFornecedor').val().trim();
    const ano = $('#anoCorrente').val();

    $('#listaAquisicoes').html('<p>A carregar...</p>');

    fetch(`${this.state.api}?action=full&frmFornecedor=${encodeURIComponent(fornecedor)}&anoCorrente=${ano}`)
      .then(r => r.json())
      .then(res => {
        this.state.entidadesCache = res.data || [];
        this.applyFilter();
      })
      .catch(() => {
        $('#listaAquisicoes').html('<p>Erro ao carregar dados</p>');
      });
  },

  applyFilter() {
    const filtro = $('#frmFornecedor').val().toLowerCase();

    this.state.entidadesVisiveis = filtro
      ? this.state.entidadesCache.filter(e =>
          (e.entidade || '').toLowerCase().includes(filtro)
        )
      : this.state.entidadesCache;

    this.render();

    if (filtro && this.state.entidadesVisiveis.length) {
      this.renderChart(this.state.entidadesVisiveis);
    } else {
      this.hideChart();
    }
  },

  resetList() {
    $('#frmFornecedor').val('');
    this.state.entidadeAberta = null;
    this.applyFilter();
  },

  reset() {
    this.state.entidadesCache = [];
    this.state.entidadesVisiveis = [];
    this.state.entidadeAberta = null;

    this.hideChart();
    $('#listaAquisicoes').html('<p>A carregar...</p>');
  },

  // =========================
  // RENDER
  // =========================
  render() {

    if (!this.state.entidadesVisiveis.length) {
      $('#listaAquisicoes').html('<p>Sem resultados</p>');
      return;
    }

    $('#listaAquisicoes').html(
      this.buildTabela(this.state.entidadesVisiveis)
    );
  },

  buildTabela(entidades) {

    const anoAtual = new Date().getFullYear();
    const anoAnterior = anoAtual - 1;

    let html = `
      <table class="table table-sm table-bordered table-hover bg-white small">
        <thead>
          <tr>
            <th>Entidade</th>
            <th>Processos</th>
            <th>${anoAnterior}</th>
            <th>${anoAtual}</th>
            <th>
              <button class="btn btn-sm btn-success btn-export-all-excel">
                Excel
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
    `;

    entidades.forEach(e => {

      const id = `ent_${e.ent_cod}`;

      html += `
        <tr class="entidade-row" data-target="${id}" data-ent="${e.ent_cod}">
          <td>${this.escape(e.entidade)}</td>
          <td>${(e.processos || []).length}</td>
          <td>${this.money(e.total_anoAnterior)}</td>
          <td>${this.money(e.total_anoAtual)}</td>
          <td>
            <button class="btn btn-sm btn-success btn-export-excel" data-id="${e.ent_cod}">
              Excel
            </button>
          </td>
        </tr>
        <tr id="${id}" class="collapse">
          <td colspan="5">${this.buildProcessos(e.processos)}</td>
        </tr>
      `;
    });

    return html + '</tbody></table>';
  },

  buildProcessos(processos = []) {

    return `
      <table class="table table-sm table-bordered">
        ${processos.map(p => `
          <tr onclick="redirectProcesso(${p.proces_check})">
            <td>${this.escape(p.padm)}</td>
            <td>${this.escape(p.regime)}</td>
            <td>${this.escape(p.designacao)}</td>
            <td>${this.buildFaturas(p.faturas)}</td>
          </tr>
        `).join('')}
      </table>
    `;
  },

  buildFaturas(faturas = []) {

    if (!faturas.length) return 'Sem faturas';

    return `
      <table class="table table-sm">
        ${faturas.map(f => `
          <tr>
            <td>${this.escape(f.fatura)}</td>
            <td>${f.fatura_data || ''}</td>
            <td>${this.money(f.fatura_valor)}</td>
          </tr>
        `).join('')}
      </table>
    `;
  },

  // =========================
  // TOGGLE
  // =========================
  toggleEntidade(id, entCod) {

    const el = $(`#${id}`);
    const isOpen = el.hasClass('show');

    if (this.state.entidadeAberta && this.state.entidadeAberta !== id) {
      $(`#${this.state.entidadeAberta}`).collapse('hide');
    }

    el.collapse('toggle');
    this.state.entidadeAberta = isOpen ? null : id;
  },

  // =========================
  // EXPORT
  // =========================
  exportOne(id) {
    const entidade = this.state.entidadesCache.find(
      e => String(e.ent_cod) === String(id)
    );

    if (entidade) this.exportAll([entidade]);
  },

  exportAll(entidades = this.state.entidadesVisiveis) {

    if (!entidades.length) {
      alert('Sem dados para exportar');
      return;
    }

    const wb = XLSX.utils.book_new();

    const faturas = [];
    const processos = [];

    entidades.forEach(ent => {
      (ent.processos || []).forEach(p => {

        processos.push({
          Entidade: ent.entidade,
          PADM: p.padm,
          Designacao: p.designacao
        });

        (p.faturas || []).forEach(f => {
          faturas.push({
            Entidade: ent.entidade,
            PADM: p.padm,
            Designacao: p.designacao,
            Fatura: f.fatura,
            Valor: f.fatura_valor
          });
        });

      });
    });

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(processos), "Processos");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(faturas), "Faturas");

    XLSX.writeFile(wb, 'AUDITORIA.xlsx');
  },

  // =========================
  // CHART
  // =========================
  renderChart() {
    $('#boxGrafico').show();
  },

  hideChart() {
    $('#boxGrafico').hide();
  },

  // =========================
  // UTILS
  // =========================
  money(v) {
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 2
    }).format(v || 0) + '€';
  },

  escape(t) {
    return $('<div>').text(t || '').html();
  }
};

// =========================
// REDIRECT
// =========================
function redirectProcesso(id) {
  window.location.href =
    `../../producao/processos/processoResults.html?codigoProcesso=${id}`;
}

// =========================
// START
// =========================
$(document).ready(() => App.init());