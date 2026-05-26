const API_ENDPOINT = 'dados/apiAquisicoes.php';

const App = {

  // =========================
  // STATE
  // =========================
  state: {
    tipo: 'geral',
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

    $('.menu-api').on('click', (e) => this.changeTipo(e));

    $('#btnFiltrar').on('click', () => this.loadData());
    $('#btnLimpar').on('click', () => this.clearFilters());
    $('#btnExportAll').on('click', () => this.exportAll());

    $('#frmFornecedor').on('input', () => this.handleSearch());

    $(document).on('click', '.btn-export-excel', (e) => {
      e.stopPropagation();
      this.exportOne($(e.currentTarget).data('id'));
    });

    $(document).on('click', '.entidade-row', (e) => {
      const entCod = $(e.currentTarget).data('ent');
      const entidade = this.state.entidadesCache.find(x => x.ent_cod == entCod);
      if (entidade) this.selectEntidade(entidade);
    });
  },

  // =========================
  // CHANGE TIPO (ANTES ERA API)
  // =========================
  changeTipo(e) {

    const tipo = $(e.currentTarget).data('api');

    if (!tipo || tipo === this.state.tipo) return;

    $('.menu-api').removeClass('active');
    $(e.currentTarget).addClass('active');

    this.state.tipo = tipo;

    this.reset();
    this.loadData();
  },

  // =========================
  // LOAD DATA
  // =========================
  loadData() {

    const fornecedor = $('#frmFornecedor').val()?.trim() || '';

    $('#listaAquisicoes').html('<p>A carregar...</p>');

    const url = `${API_ENDPOINT}?action=full&tipo=${this.state.tipo}&frmFornecedor=${encodeURIComponent(fornecedor)}`;

    fetch(url)
      .then(r => r.text())
      .then(text => {

        let json;

        try {
          json = JSON.parse(text);
        } catch (e) {
          console.error("Resposta inválida do PHP:", text);
          throw new Error("JSON inválido");
        }

        this.state.entidadesCache = json.data || [];
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
  handleSearch() {

    clearTimeout(this.state.debounceTimer);

    this.state.debounceTimer = setTimeout(() => {
      this.applyFilter();
    }, 250);
  },

  applyFilter() {

    const filtro = $('#frmFornecedor').val()?.toLowerCase().trim() || '';

    const result = filtro
      ? this.state.entidadesCache.filter(e =>
          (e.entidade || '').toLowerCase().includes(filtro)
        )
      : this.state.entidadesCache;

    this.state.entidadesVisiveis = result;

    this.render();

    if (result.length === 1) {
      this.selectEntidade(result[0]);
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
  },

  // =========================
  // KPIS
  // =========================
  updateKPIs(entidades) {

    let atual = 0;
    let anterior = 0;
    let AA = 0;
    let ARD = 0;
    let ambas = 0;

    let top = null;
    let topVal = 0;

    entidades.forEach(e => {

      const vAtual = Number(e.total_anoAtual || 0);
      const vAnterior = Number(e.total_anoAnterior || 0);

      const vAA = Number(e.total_atividadeAA || 0);
      const vARD = Number(e.total_atividadeARD || 0);
      const vAmbas = Number(e.total_atividadeAmbas || 0);

      atual += vAtual;
      anterior += vAnterior;
      AA += vAA;
      ARD += vARD;
      ambas += vAmbas;

      if (vAtual > topVal) {
        topVal = vAtual;
        top = e.entidade;
      }
    });

    const kpis = {
      AA,
      ARD,
      Ambas: ambas,
      Entidades: entidades.length,
      Atual: atual,
      Anterior: anterior,
      TopFornecedor: top ? `${top} (${this.money(topVal)})` : '-'
    };

    $('#kpis').html(this.buildKPIs(kpis));
  },

  // =========================
  // KPI HTML
  // =========================
  buildKPIs(kpis) {

    const cfg = [
      { key:'AA', label:'Abastecimento de Água', class:'bg-primary', format:'money' },
      { key:'ARD', label:'Águas Residuais', class:'bg-dark', format:'money' },
      { key:'Ambas', label:'Ambas Atividades', class:'bg-primary', format:'money' },
      { key:'Entidades', label:'Total Entidades', class:'bg-secondary', format:'number' },
      { key:'Atual', label:'Ano Atual', class:'bg-success', format:'money' },
      { key:'Anterior', label:'Ano Anterior', class:'bg-warning', format:'money' },
      { key:'TopFornecedor', label:'Top Fornecedor', class:'bg-dark', format:'text' }
    ];

    return cfg.map(c => {

      let v = kpis[c.key];

      if (c.format === 'money') v = this.money(v);
      if (c.format === 'number') v = v || 0;

      return `
        <div class="col-md-4 mb-2">
          <div class="card text-white ${c.class}">
            <div class="card-body">
              <div class="small">${c.label}</div>
              <div class="${c.format === 'text' ? 'h6' : 'h5 text-right'}">
                ${v}
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
      <div class="table-wrapper">
        <table class="table table-sm table-bordered table-hover bg-white small mb-0">
          <thead class="table-light">
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
        <tr class="entidade-row" data-ent="${e.ent_cod}">
          <td>${this.escape(e.entidade)}</td>
          <td>${(e.processos || []).length}</td>
          <td class="text-right">${this.money(e.total_anoAnterior)}</td>
          <td class="text-right">${this.money(e.total_anoAtual)}</td>
        </tr>
  
        <tr id="${id}" class="collapse">
          <td colspan="4">${this.buildProcessos(e.processos || [])}</td>
        </tr>
      `;
    });
  
    html += `
          </tbody>
        </table>
      </div>
    `;
  
    return html;
  },

  // =========================
  // PROCESSOS
  // =========================
  buildProcessos(processos = []) {

    if (!processos.length) {
      return `<span class="text-muted">Sem processos</span>`;
    }

    return processos.map(p => `
      <div class="border p-2 mb-2">
        <strong>${this.escape(p.designacao)}</strong>
      </div>
    `).join('');
  },

  // =========================
  //SELECT ENTIDADE
  // =========================
  selectEntidade(entidade) {

    this.state.entidadesVisiveis = [entidade];

    this.render();
    this.updateKPIs([entidade]);

    this.renderChart(entidade);
    $('#boxGrafico').show();
  },

  // =========================
  //CHART
  // =========================
  renderChart(entidade) {

    this.destroyChart();

    const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

    const atual = Array(12).fill(0);
    const anterior = Array(12).fill(0);

    const anoAtual = new Date().getFullYear();
    const anoAnterior = anoAtual - 1;

    (entidade.processos || []).forEach(p => {
      (p.faturas || []).forEach(f => {

        if (!f.fatura_data) return;

        const d = new Date(f.fatura_data);
        const m = d.getMonth();
        const y = d.getFullYear();

        const v = Number(f.fatura_valor || 0);

        if (y === anoAtual) atual[m] += v;
        if (y === anoAnterior) anterior[m] += v;
      });
    });

    const ctx = document.getElementById('graficoTotais');

    this.state.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: meses,
        datasets: [
          { label: anoAnterior, data: anterior },
          { label: anoAtual, data: atual }
        ]
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
  //EXPORT
  // =========================
  exportOne(id) {

    const e = this.state.entidadesCache.find(x => x.ent_cod == id);
    if (e) this.exportToExcel([e], `ENTIDADE_${e.entidade}`);
  },

  exportAll() {
    this.exportToExcel(this.state.entidadesVisiveis, 'EXPORT_GLOBAL');
  },

  exportToExcel(entidades, filename) {

    const wb = XLSX.utils.book_new();
    const rows = [];

    entidades.forEach(e => {
      (e.processos || []).forEach(p => {
        (p.faturas || []).forEach(f => {

          rows.push({
            Entidade: e.entidade,
            Processo: p.designacao,
            Fatura: f.fatura,
            Valor: f.fatura_valor
          });

        });
      });
    });

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Dados");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  },

  // =========================
  //UTILS
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
$(document).ready(() => App.init());