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
    this.initUI();
    this.bindEvents();
    this.loadData();

    this.hideChart();
  },

  initUI() {
    $('.menu-api').removeClass('active');
    $('.menu-api[data-api="geral"]').addClass('active');
  },

  // =========================
  // EVENTS
  // =========================
  bindEvents() {

    $('.menu-api').on('click', (e) => this.changeApi(e));

    $('#btnFiltrar').on('click', () => this.loadData());

    $('#btnLimpar').on('click', () => this.clearFilters());

    $('#btnExportAll').on('click', () => this.exportAll());

    $('#frmFornecedor').on('input', (e) => this.handleSearch(e));

    $(document).on('click', '.btn-export-excel', (e) => {
      e.stopPropagation();
      this.exportOne($(e.currentTarget).data('id'));
    });

    $(document).on('click', '.entidade-row', (e) => {

      const entCod = $(e.currentTarget).data('ent');
      const entidade = this.state.entidadesCache.find(e => e.ent_cod == entCod);
    
      if (entidade) {
        this.selectEntidade(entidade);
      }
    });

  },

  // =========================
  // API
  // =========================
  changeApi(e) {

    const tipo = $(e.currentTarget).data('api');
    const novaApi = APIS[tipo];

    if (!novaApi || this.state.api === novaApi) return;

    $('.menu-api').removeClass('active');
    $(e.currentTarget).addClass('active');

    this.state.api = novaApi;

    this.reset();
    this.loadData();
  },

  // =========================
  // LOAD
  // =========================
  loadData() {

    const fornecedor = $('#frmFornecedor').val().trim();

    $('#listaAquisicoes').html('<p>A carregar...</p>');

    fetch(`${this.state.api}?action=full&frmFornecedor=${encodeURIComponent(fornecedor)}`)
      .then(r => r.json())
      .then(res => {

        this.state.entidadesCache = res.data || [];
        this.state.entidadesVisiveis = this.state.entidadesCache;

        this.render();
      })
      .catch(err => {
        console.error(err);
        $('#listaAquisicoes').html('<p>Erro ao carregar dados</p>');
      });
  },

  // =========================
  // SEARCH
  // =========================
  handleSearch(e) {

    clearTimeout(this.state.debounceTimer);

    this.state.debounceTimer = setTimeout(() => {
      this.applyFilter();
    }, 250);
  },

  applyFilter() {

    const filtro = $('#frmFornecedor').val().toLowerCase().trim();
  
    const resultado = filtro
      ? this.state.entidadesCache.filter(e =>
          (e.entidade || '').toLowerCase().includes(filtro)
        )
      : this.state.entidadesCache;
  
    this.state.entidadesVisiveis = resultado;
  
    this.render();
  
    // 👉 se só há 1 entidade, comportamento igual ao clique
    if (resultado.length === 1) {
      this.selectEntidade(resultado[0]);
    } else {
      this.hideChart();
    }
  },

  // =========================
  // CLEAR
  // =========================
  clearFilters() {

    $('#frmFornecedor').val('');

    this.state.entidadesVisiveis = this.state.entidadesCache;
    this.state.entidadeAberta = null;

    this.destroyChart();

    this.render();
  },

  reset() {

    this.state.entidadesCache = [];
    this.state.entidadesVisiveis = [];
    this.state.entidadeAberta = null;

    this.destroyChart();

    $('#listaAquisicoes').html('<p>A carregar...</p>');
  },

  // =========================
  // RENDER
  // =========================
  render() {

    const data = this.state.entidadesVisiveis;

    if (!data.length) {
      $('#listaAquisicoes').html('<p>Sem resultados</p>');
      this.updateKPIs([]);
      this.hideChart();
      return;
    }

    this.updateKPIs(data);

    $('#listaAquisicoes').html(this.buildTable(data));

    //this.hideChart();

  },

  updateKPIs(entidades) {

    let atual = 0;
    let anterior = 0;
    let atividadeAA = 0;
    let atividadeSAR = 0;
    let atividadeAmbas = 0;
  
    let topEntidade = null;
    let topEntidadeValor = 0;
  
    entidades.forEach(e => {
  
      const valorAtual = Number(e.total_anoAtual || 0);
      const valorAnterior = Number(e.total_anoAnterior || 0);
  
      const valorAA = Number(e.total_atividadeAA || 0);
      const valorSAR = Number(e.total_atividadeSAR || 0);
      const valorAmbas = Number(e.total_atividadeAmbas || 0);
  
      atual += valorAtual;
      anterior += valorAnterior;
      atividadeAA += valorAA;
      atividadeSAR += valorSAR;
      atividadeAmbas += valorAmbas;
  
      if (valorAtual > topEntidadeValor) {
        topEntidadeValor = valorAtual;
        topEntidade = e.entidade;
      }
  
    });
  
    // 🔥 NOVO (substitui os $('#kpiXXX'))
    const kpis = {
      AA: atividadeAA,
      SAR: atividadeSAR,
      Ambas: atividadeAmbas,
      Entidades: entidades.length,
      Atual: atual,
      Anterior: anterior,
      TopFornecedor: topEntidade
        ? `${topEntidade} (${this.money(topEntidadeValor)})`
        : '-'
    };
  
    $('#kpis').html(this.buildKPIs(kpis));
  },

  buildKPIs(kpis) {

    const configs = [
      { key: 'AA', label: 'Abastecimento de Água', class: 'bg-primary', format: 'money' },
      { key: 'SAR', label: 'Águas Residuais Domésticas', class: 'bg-dark', format: 'money' },
      { key: 'Ambas', label: 'Ambas as Atividades (AA + SAR)', class: 'bg-primary', format: 'money' },
      { key: 'Entidades', label: 'Total Entidades', class: 'bg-secondary', format: 'number' },
      { key: 'Atual', label: 'Total Ano Atual', class: 'bg-success', format: 'money' },
      { key: 'Anterior', label: 'Total Ano Anterior', class: 'bg-warning', format: 'money' },
      { key: 'TopFornecedor', label: 'Top Fornecedor', class: 'bg-dark', format: 'text' }
    ];
  
    return configs.map(c => {
  
      let valor = kpis[c.key];
  
      if (c.format === 'money') valor = this.money(valor);
      if (c.format === 'number') valor = valor ?? 0;
      if (c.format === 'text') valor = valor || '-';
  
      return `
        <div class="col-md-4 mb-2">
          <div class="card text-white ${c.class}">
            <div class="card-body">
              <div class="small">${c.label}</div>
              <div class="${c.format === 'text' ? 'h6' : 'h5 text-right'}">
                ${valor}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  // =========================
  // TABLE
  // =========================
  buildTable(entidades) {

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
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
    `;

    entidades.forEach(e => {

      const id = `ent_${e.ent_cod}`;

      html += `
        <tr class="entidade-row"
            data-target="${id}"
            data-ent="${e.ent_cod}">

          <td>${this.escape(e.entidade)}</td>
          <td>${(e.processos || []).length}</td>
          <td class="text-right">${this.money(e.total_anoAnterior)}</td>
          <td class="text-right">${this.money(e.total_anoAtual)}</td>

          <td>
            <button class="btn btn-sm btn-success btn-export-excel"
              data-id="${e.ent_cod}">
              Exportar
            </button>
          </td>
        </tr>

        <tr id="${id}" class="collapse">
          <td colspan="5">
            ${this.buildProcessos(e.processos || [])}
          </td>
        </tr>
      `;
    });

    return html + '</tbody></table>';
  },

  // =========================
  // PROCESSOS + FATURAS
  // =========================
  buildProcessos(processos = []) {

    if (!processos.length) {
      return `<span class="text-muted">Sem processos</span>`;
    }

    return `
      <table class="table table-sm table-bordered small">
        <tbody>
          ${processos.map(p => {

            const faturas = p.faturas || [];

            const faturasHtml = faturas.length
              ? `
                <table class="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Fatura</th>
                      <th>Valor</th>
                      <th>Atividade</th>
                      <th>Rubrica</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${faturas.map(f => `
                      <tr>
                        <td>${f.fatura_data || ''}</td>
                        <td>${this.escape(f.fatura)}</td>
                        <td class="text-right">${this.money(f.fatura_valor)}</td>
                        <td>${this.escape(f.fatura_atividade || '')}</td>
                        <td>${this.escape(f.fatura_rubrica || '')}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              `
              : `<span class="text-muted">Sem faturas</span>`;

            return `
              <tr onclick="redirectProcesso(${p.proces_check})">
                <td>${this.escape(p.padm)}</td>
                <td>${this.escape(p.designacao)}</td>
                <td colspan="3">${faturasHtml}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  },

  selectEntidade(entidade) {

  // 1. filtra estado
  this.state.entidadesVisiveis = [entidade];

  // 2. render normal (IMPORTANTE)
  this.render();

  // 3. KPIs
  this.updateKPIs([entidade]);

  // 4. gráfico
  this.renderChart(entidade);
  $('#boxGrafico').show();

  // 5. abrir processos automaticamente (IMPORTANTE)
  setTimeout(() => {

    const firstRow = $('#listaAquisicoes .collapse').first();

    if (firstRow.length) {
      firstRow.addClass('show');
    }

  }, 0);
},

  // =========================
  // TOGGLE + CHART
  // =========================
  toggleEntidade(id, entCod) {

    const el = $(`#${id}`);
    const isOpen = el.hasClass('show');

    if (this.state.entidadeAberta && this.state.entidadeAberta !== id) {
      $(`#${this.state.entidadeAberta}`).collapse('hide');
    }

    el.collapse('toggle');
    this.state.entidadeAberta = isOpen ? null : id;

    const entidade = this.state.entidadesVisiveis.find(e => e.ent_cod == entCod);

    //if (entidade && !isOpen) {
    //  this.selectEntidade(entidade);
    //  this.renderChart(entidade);
    //  $('#boxGrafico').show();

    // 👉 Render processos + faturas noutra div
    //$('#listaAquisicoesFaturas').html(
    //  this.buildProcessos(entidade.processos || [])
    //);
    if (entidade) {
      this.selectEntidade(entidade);

    }
  },

  // =========================
  // CHART
  // =========================
  renderChart(entidade) {

    this.destroyChart();

    const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

    const anoAtual = new Date().getFullYear();
    const anoAnterior = anoAtual - 1;

    const atual = Array(12).fill(0);
    const anterior = Array(12).fill(0);

    (entidade.processos || []).forEach(p => {
      (p.faturas || []).forEach(f => {

        if (!f.fatura_data) return;

        const d = new Date(f.fatura_data);
        const mes = d.getMonth();
        const ano = d.getFullYear();
        const valor = Number(f.fatura_valor || 0);

        if (ano === anoAtual) atual[mes] += valor;
        if (ano === anoAnterior) anterior[mes] += valor;
      });
    });

    const ctx = document.getElementById('graficoTotais');

    this.state.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: meses,
        datasets: [
          { label: anoAnterior, data: anterior, backgroundColor: 'rgba(255,99,132,0.6)' },
          { label: anoAtual, data: atual, backgroundColor: 'rgba(54,162,235,0.6)' }
        ]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: `Fornecedor: ${entidade.entidade}`
          }
        }
      }
    });
  },

  destroyChart() {
    if (this.state.chart) {
      this.state.chart.destroy();
      this.state.chart = null;
    }
    $('#boxGrafico').hide();
  },

  hideChart() {
    $('#boxGrafico').hide();
  },

  // =========================
  // EXPORT
  // =========================
  exportOne(id) {

    const entidade = this.state.entidadesCache.find(e => e.ent_cod == id);

    if (!entidade) return;

    this.exportToExcel([entidade], `ENTIDADE_${entidade.entidade}`);
  },

  exportAll(entidades = this.state.entidadesVisiveis) {

    this.exportToExcel(entidades, 'EXPORT_GLOBAL');
  },

  exportToExcel(entidades, filename) {

    const wb = XLSX.utils.book_new();
    const rows = [];

    entidades.forEach(e => {
      (e.processos || []).forEach(p => {
        (p.faturas || []).forEach(f => {

          rows.push({
            Regime: p.regime,
            Entidade: e.entidade,
            Processo: p.designacao,
            Atividade: f.fatura_atividade,
            Rubrica: f.fatura_rubrica,
            Expediente: f.fatura_expediente,
            Data: f.fatura_data,
            Fatura: f.fatura,
            Valor: f.fatura_valor
          });

        });
      });
    });

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(rows),
      "Dados"
    );

    XLSX.writeFile(wb, `${filename}.xlsx`);
  },

  // =========================
  // UTILS
  // =========================
  money(v) {
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 2
    }).format(v || 0) + '€';
  },

  expediente(str) {
    return `${str[0]}.${str.slice(1, 6)}.${str.slice(6)}`;
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

$(document).ready(() => App.init());