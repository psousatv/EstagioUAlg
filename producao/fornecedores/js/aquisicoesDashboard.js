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

      const entidade = this.state.entidadesCache.find(
        x => x.ent_cod == entCod
      );

      if (entidade) {
        this.selectEntidade(entidade);
      }
    });
  },

  // =========================
  // CHANGE TIPO
  // =========================
  changeTipo(e) {

    const tipo = $(e.currentTarget).data('api');

    if (!tipo || tipo === this.state.tipo) {
      return;
    }

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

    const fornecedor =
      $('#frmFornecedor').val()?.trim() || '';

    $('#listaAquisicoes').html('<p>A carregar...</p>');

    const url =
      `${API_ENDPOINT}?action=full`
      + `&tipo=${this.state.tipo}`
      + `&frmFornecedor=${encodeURIComponent(fornecedor)}`;

    fetch(url)
      .then(r => r.text())
      .then(text => {

        let json;

        try {

          json = JSON.parse(text);

        } catch (e) {

          console.error('Resposta inválida do PHP:', text);

          throw new Error('JSON inválido');
        }

        this.state.entidadesCache = json.data || [];

        this.state.entidadesVisiveis =
          this.state.entidadesCache;

        this.render();
      })
      .catch(err => {

        console.error(err);

        $('#listaAquisicoes').html(
          '<p>Erro ao carregar dados</p>'
        );
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

    const filtro =
      $('#frmFornecedor')
        .val()
        ?.toLowerCase()
        .trim() || '';

    const resultado = filtro
      ? this.state.entidadesCache.filter(e =>
          (e.entidade || '')
            .toLowerCase()
            .includes(filtro)
        )
      : this.state.entidadesCache;

    this.state.entidadesVisiveis = resultado;

    this.render();

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

    this.state.entidadesVisiveis =
      this.state.entidadesCache;

    this.state.entidadeAberta = null;

    this.destroyChart();

    this.render();
  },

  reset() {

    this.state.entidadesCache = [];
    this.state.entidadesVisiveis = [];
    this.state.entidadeAberta = null;

    this.destroyChart();

    $('#listaAquisicoes').html(
      '<p>A carregar...</p>'
    );
  },

  // =========================
  // RENDER
  // =========================
  render() {

    const data = this.state.entidadesVisiveis;

    if (!data.length) {

      $('#listaAquisicoes').html(
        '<p>Sem resultados</p>'
      );

      this.updateKPIs([]);

      this.hideChart();

      return;
    }

    this.updateKPIs(data);

    $('#listaAquisicoes').html(
      this.buildTable(data)
    );
  },

  // =========================
  // KPIS
  // =========================
  updateKPIs(entidades) {

    let atual = 0;
    let anterior = 0;

    let atividadeAA = 0;
    let atividadeARD = 0;
    let atividadeAmbas = 0;

    let topEntidade = null;
    let topEntidadeValor = 0;

    entidades.forEach(e => {

      const valorAtual =
        Number(e.total_anoAtual || 0);

      const valorAnterior =
        Number(e.total_anoAnterior || 0);

      const valorAA =
        Number(e.total_atividadeAA || 0);

      const valorARD =
        Number(e.total_atividadeARD || 0);

      const valorAmbas =
        Number(e.total_atividadeAmbas || 0);

      atual += valorAtual;
      anterior += valorAnterior;

      atividadeAA += valorAA;
      atividadeARD += valorARD;
      atividadeAmbas += valorAmbas;

      if (valorAtual > topEntidadeValor) {

        topEntidadeValor = valorAtual;

        topEntidade = e.entidade;
      }
    });

    const kpis = {
      AA: atividadeAA,
      ARD: atividadeARD,
      Ambas: atividadeAmbas,
      Entidades: entidades.length,
      Atual: atual,
      Anterior: anterior,
      TopFornecedor: topEntidade
        ? `${topEntidade} (${this.money(topEntidadeValor)})`
        : '-'
    };

    $('#kpis').html(
      this.buildKPIs(kpis)
    );
  },

  // =========================
  // KPI HTML
  // =========================
  buildKPIs(kpis) {

    const configs = [

      {
        key: 'AA',
        label: 'Abastecimento de Água',
        class: 'bg-primary',
        format: 'money'
      },

      {
        key: 'ARD',
        label: 'Águas Residuais',
        class: 'bg-dark',
        format: 'money'
      },

      {
        key: 'Ambas',
        label: 'Ambas Atividades',
        class: 'bg-primary',
        format: 'money'
      },

      {
        key: 'Entidades',
        label: 'Total Entidades',
        class: 'bg-secondary',
        format: 'number'
      },

      {
        key: 'Atual',
        label: 'Ano Atual',
        class: 'bg-success',
        format: 'money'
      },

      {
        key: 'Anterior',
        label: 'Ano Anterior',
        class: 'bg-warning',
        format: 'money'
      },

      {
        key: 'TopFornecedor',
        label: 'Top Fornecedor',
        class: 'bg-dark',
        format: 'text'
      }
    ];

    return configs.map(c => {

      let valor = kpis[c.key];

      if (c.format === 'money') {
        valor = this.money(valor);
      }

      if (c.format === 'number') {
        valor = valor ?? 0;
      }

      if (c.format === 'text') {
        valor = valor || '-';
      }

      return `
        <div class="col-md-4 mb-2">
          <div class="card text-white ${c.class}">
            <div class="card-body">

              <div class="small">
                ${c.label}
              </div>

              <div class="${
                c.format === 'text'
                  ? 'h6'
                  : 'h5 text-right'
              }">
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

    const anoAtual =
      new Date().getFullYear();

    const anoAnterior =
      anoAtual - 1;

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
        <tr class="entidade-row"
            data-target="${id}"
            data-ent="${e.ent_cod}">

          <td>
            ${this.escape(e.entidade)}
          </td>

          <td>
            ${(e.processos || []).length}
          </td>

          <td class="text-right">
            ${this.money(e.total_anoAnterior)}
          </td>

          <td class="text-right">
            ${this.money(e.total_anoAtual)}
          </td>

          <td>

            <div class="d-flex justify-content-center">

              <button
                class="btn btn-sm btn-success btn-export-excel"
                data-id="${e.ent_cod}">

                <i class="fas fa-file-excel"></i>

              </button>

            </div>

          </td>
        </tr>

        <tr id="${id}" class="collapse">

          <td colspan="5">

            ${this.buildProcessos(
              e.processos || []
            )}

          </td>

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
  // PROCESSOS + FATURAS
  // =========================
  buildProcessos(processos = []) {

    if (!processos.length) {

      return `
        <span class="text-muted">
          Sem processos
        </span>
      `;
    }

    return `
      <table class="table table-sm table-bordered small">

        <tbody>

          ${processos.map(p => {

            const faturas = p.faturas || [];

            const faturasHtml = faturas.length

              ? `
                <table class="table table-sm mb-0">

                  <thead class="thead-dark">

                    <tr>
                      <th>Expediente</th>
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

                        <td>
                          ${this.expediente(
                            f.fatura_expediente
                          ) || ''}
                        </td>

                        <td>
                          ${f.fatura_data || ''}
                        </td>

                        <td>
                          ${this.escape(f.fatura)}
                        </td>

                        <td class="text-right">
                          ${this.money(
                            f.fatura_valor
                          )}
                        </td>

                        <td>
                          ${this.escape(
                            f.fatura_atividade || ''
                          )}
                        </td>

                        <td>
                          ${this.escape(
                            f.fatura_rubrica || ''
                          )}
                        </td>

                      </tr>

                    `).join('')}

                  </tbody>

                </table>
              `

              : `
                <span class="text-muted">
                  Sem faturas
                </span>
              `;

            return `
              <tr onclick="redirectProcesso(${p.proces_check})">

                <td>
                  ${this.escape(p.regime || '')}
                </td>

                <td>
                  ${this.escape(p.padm || '')}
                </td>

                <td>
                  ${this.escape(
                    p.designacao || ''
                  )}
                </td>

                <td colspan="3">
                  ${faturasHtml}
                </td>

              </tr>
            `;

          }).join('')}

        </tbody>

      </table>
    `;
  },

  // =========================
  // SELECT ENTIDADE
  // =========================
  selectEntidade(entidade) {

    this.state.entidadesVisiveis = [entidade];

    this.render();

    this.updateKPIs([entidade]);

    this.renderChart(entidade);

    $('#boxGrafico').show();

    // abrir automaticamente
    setTimeout(() => {

      const firstRow =
        $('#listaAquisicoes .collapse').first();

      if (firstRow.length) {
        firstRow.addClass('show');
      }

    }, 0);
  },

  // =========================
  // CHART
  // =========================
  renderChart(entidade) {

    this.destroyChart();

    const meses = [
      'Jan','Fev','Mar','Abr',
      'Mai','Jun','Jul','Ago',
      'Set','Out','Nov','Dez'
    ];

    const atual = Array(12).fill(0);

    const anterior = Array(12).fill(0);

    const anoAtual =
      new Date().getFullYear();

    const anoAnterior =
      anoAtual - 1;

    (entidade.processos || []).forEach(p => {

      (p.faturas || []).forEach(f => {

        if (!f.fatura_data) {
          return;
        }

        const d = new Date(f.fatura_data);

        const mes = d.getMonth();

        const ano = d.getFullYear();

        const valor =
          Number(f.fatura_valor || 0);

        if (ano === anoAtual) {
          atual[mes] += valor;
        }

        if (ano === anoAnterior) {
          anterior[mes] += valor;
        }
      });
    });

    const ctx =
      document.getElementById(
        'graficoTotais'
      );

    this.state.chart = new Chart(ctx, {

      type: 'bar',

      data: {

        labels: meses,

        datasets: [

          {
            label: anoAnterior,
            data: anterior,
            backgroundColor:
              'rgba(255,99,132,0.6)'
          },

          {
            label: anoAtual,
            data: atual,
            backgroundColor:
              'rgba(54,162,235,0.6)'
          }
        ]
      },

      options: {

        plugins: {

          title: {

            display: true,

            text:
              `Fornecedor: ${entidade.entidade}`
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

    const entidade =
      this.state.entidadesCache.find(
        x => x.ent_cod == id
      );

    if (!entidade) {
      return;
    }

    this.exportToExcel(
      [entidade],
      `ENTIDADE_${entidade.entidade}`
    );
  },

  exportAll() {

    this.exportToExcel(
      this.state.entidadesVisiveis,
      'EXPORT_GLOBAL'
    );
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
      'Dados'
    );

    XLSX.writeFile(
      wb,
      `${filename}.xlsx`
    );
  },

  // =========================
  // UTILS
  // =========================
  money(v) {

    return new Intl.NumberFormat(
      'de-DE',
      {
        minimumFractionDigits: 2
      }
    ).format(v || 0) + '€';
  },

  expediente(str) {

    return str
      ? `${str[0]}.${str.slice(1, 6)}.${str.slice(6)}`
      : '';
  },

  escape(t) {

    return $('<div>')
      .text(t || '')
      .html();
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
$(document).ready(() => App.init());