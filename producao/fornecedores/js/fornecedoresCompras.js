const APIS = {
  geral: 'dados/apiAquisicoesGerais.php',
  presenciais: 'dados/apiAquisicoesPresenciais.php',
  protocolos: 'dados/apiAquisicoesProtocolos.php'
};

let API = APIS.geral;

const App = {

  chart: null,

  entidadesCache: [],
  entidadesVisiveis: [],
  entidadeAberta: null,

  debounceTimer: null,

  // =========================
  // INIT
  // =========================
  init() {

    const anoAtual = new Date().getFullYear();
    //$('#anoCorrente').val(anoAtual);

    $('.menu-api').removeClass('active');
    $('.menu-api[data-api="geral"]').addClass('active');

    this.bindEvents();
    this.carregarTudo();
  },

  // =========================
  // EVENTS
  // =========================
  bindEvents() {

    // SWITCH API
    $('.menu-api').on('click', (e) => {

      const tipo = $(e.currentTarget).data('api');
      const novaApi = APIS[tipo];

      if (!novaApi) return;

      $('.menu-api').removeClass('active');
      $(e.currentTarget).addClass('active');

      if (API === novaApi) return;

      API = novaApi;

      this.resetEstado();
      this.carregarTudo();
    });

    // FILTRO BOTÃO
    $('#btnFiltrar').on('click', () => this.carregarTudo());
    $('#btnLimpar').on('click', () => {

      // limpar UI
      $('#frmFornecedor').val('');
      $('#anoCorrente').val('');
    
      // reset estado
      this.entidadesVisiveis = this.entidadesCache;
      this.entidadeAberta = null;
    
      // esconder gráfico
      this.hideGrafico();
    
      // render direto sem fetch (mais rápido)
      this.render();
    });

    // INPUT FILTRO
    $('#frmFornecedor').on('input', (e) => {

      clearTimeout(this.debounceTimer);

      this.debounceTimer = setTimeout(() => {

        if (!e.target.value.trim()) {
          this.resetListagem();
        } else {
          this.aplicarFiltro();
        }

      }, 250);
    });

    // EXPORT EXCEL
    $(document).on('click', '.btn-export-excel', (e) => {

      e.stopPropagation();

      const id = $(e.currentTarget).data('id');

      const entidade = this.entidadesCache.find(
        x => String(x.ent_cod) === String(id)
      );

      if (entidade) this.exportExcel(entidade);
    });

    // TOGGLE ENTIDADE
    $(document).on('click', '.entidade-row', (e) => {

      const id = $(e.currentTarget).data('target');
      const entCod = $(e.currentTarget).data('ent');

      this.toggleEntidade(id, entCod);
    });
  },

  // =========================
  // RESET
  // =========================
  resetEstado() {
    this.entidadesCache = [];
    this.entidadesVisiveis = [];
    this.entidadeAberta = null;

    this.hideGrafico();
    $('#listaAquisicoes').html('<p>A carregar...</p>');
  },

  // =========================
  // LOAD
  // =========================
  carregarTudo() {

    const fornecedor = $('#frmFornecedor').val().trim();
    const ano = $('#anoCorrente').val();

    $('#listaAquisicoes').html('<p>A carregar...</p>');

    fetch(`${API}?action=full&frmFornecedor=${encodeURIComponent(fornecedor)}&anoCorrente=${ano}`)
      .then(r => r.json())
      .then(res => {

        this.entidadesCache = res.data || [];
        this.aplicarFiltro();

      })
      .catch(() => {
        $('#listaAquisicoes').html('<p>Erro ao carregar dados</p>');
      });
  },

  // =========================
  // FILTER
  // =========================
  aplicarFiltro() {

    const filtro = $('#frmFornecedor').val().trim().toLowerCase();

    this.entidadesVisiveis = filtro
      ? this.entidadesCache.filter(e =>
          (e.entidade || '').toLowerCase().includes(filtro)
        )
      : this.entidadesCache;

    this.render();

    // 🔥 GRÁFICO SÓ QUANDO HÁ FILTRO
    if (this.entidadesVisiveis.length && filtro) {
      this.renderGrafico(this.entidadesVisiveis);
    } else {
      this.hideGrafico();
    }
  },

  resetListagem() {
    $('#frmFornecedor').val('');
    this.entidadeAberta = null;
    this.aplicarFiltro();
  },

  // =========================
  // RENDER TABLE
  // =========================
  render() {

    if (!this.entidadesVisiveis.length) {
      $('#listaAquisicoes').html('<p>Sem resultados</p>');
      this.hideGrafico();
      return;
    }

    $('#listaAquisicoes').html(
      this.renderEntidades(this.entidadesVisiveis)
    );
  },

  renderEntidades(entidades) {

    const anoAtual = parseInt($('#anoCorrente').val()) || new Date().getFullYear();
    const anoAnterior = anoAtual - 1;

    let html = `
      <table class="table table-sm table-bordered table-hover bg-white small">
        <thead class="thead-light">
          <tr>
            <th>Entidade</th>
            <th>Processos</th>
            <th class="text-center">${anoAnterior}</th>
            <th class="text-center">${anoAtual}</th>
            <th style="width:120px;">Ações</th>
          </tr>
        </thead>
        <tbody>
    `;

    entidades.forEach(e => {

      const id = `ent_${e.ent_cod}`;
      const processos = e.processos || [];

      html += `
        <tr class="entidade-row"
            data-target="${id}"
            data-ent="${e.ent_cod}"
            style="cursor:pointer">

          <td>${this.escapeHtml(e.entidade)}</td>
          <td class="font-weight-bold">${processos.length}</td>
          <td class="text-right font-weight-bold">${this.formatMoney(e.total_anoAnterior)}</td>
          <td class="text-right font-weight-bold">${this.formatMoney(e.total_anoAtual)}</td>

          <td>
            <button class="btn btn-sm btn-success btn-export-excel"
              data-id="${e.ent_cod}">
              Excel
            </button>
          </td>
        </tr>

        <tr id="${id}" class="collapse">
          <td colspan="5">
            ${this.renderProcessos(processos)}
          </td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    return html;
  },

  // =========================
  // TOGGLE ENTIDADE
  // =========================
  toggleEntidade(id, entCod) {

    const el = $(`#${id}`);
    const isOpen = el.hasClass('show');

    if (this.entidadeAberta && this.entidadeAberta !== id) {
      $(`#${this.entidadeAberta}`).collapse('hide');
    }

    el.collapse('toggle');
    this.entidadeAberta = isOpen ? null : id;

    const entidade =
      this.entidadesVisiveis.find(e => e.ent_cod == entCod) ||
      this.entidadesCache.find(e => e.ent_cod == entCod);

    if (entidade && !isOpen) {
      this.renderGrafico([entidade]);
    }
  },

  // =========================
  // PROCESSOS + FATURAS
  // =========================
  renderProcessos(processos) {

    let html = `
      <table class="table table-sm table-bordered small">
        <thead>
          <tr>
            <th>PADM</th>
            <th>Regime</th>
            <th>Processo</th>
            <th>Faturas</th>
          </tr>
        </thead>
        <tbody>
    `;

    processos.forEach(p => {

      html += `
        <tr>
          <td>${this.escapeHtml(p.padm)}</td>
          <td>${this.escapeHtml(p.regime)}</td>
          <td>${this.escapeHtml(p.designacao)}</td>
          <td>${this.renderFaturas(p.faturas || [])}</td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    return html;
  },

  renderFaturas(faturas) {

    if (!faturas.length) {
      return '<span class="text-muted">Sem faturas</span>';
    }

    let html = `<table class="table table-sm mb-0 small">`;

    faturas.forEach(f => {
      html += `
        <tr>
          <td>${this.escapeHtml(f.fatura)}</td>
          <td>${f.fatura_data || ''}</td>
          <td class="text-right">${this.formatMoney(f.fatura_valor)}</td>
          <td>${f.fatura_observacoes || ''}</td>
        </tr>
      `;
    });

    html += `</table>`;
    return html;
  },

  // =========================
  // GRAPH
  // =========================
  renderGrafico(entidades) {

    if (!entidades || !entidades.length) {
      this.hideGrafico();
      return;
    }
  
    this.showGrafico();
  
    const meses = [
      'Jan','Fev','Mar','Abr','Mai','Jun',
      'Jul','Ago','Set','Out','Nov','Dez'
    ];
  
    // =========================
    // 1. AGRUPAR DADOS (PROCESSO + ANO)
    // =========================
    const dados = {};
  
    entidades.forEach(e => {
  
      (e.processos || []).forEach(p => {
  
        const processo = p.designacao || p.padm || 'Sem processo';
  
        (p.faturas || []).forEach(f => {
  
          if (!f.fatura_data) return;
  
          const d = new Date(f.fatura_data);
          if (isNaN(d)) return;
  
          const ano = d.getFullYear();
          const mes = d.getMonth();
  
          const key = `${processo}|${ano}`;
          const valor = Number(f.fatura_valor || 0);
  
          if (!dados[key]) {
            dados[key] = new Array(12).fill(0);
          }
  
          dados[key][mes] += valor;
        });
  
      });
  
    });
  
    const keys = Object.keys(dados);
  
    if (!keys.length) {
      this.hideGrafico();
      return;
    }
  
    // =========================
    // 2. ORDENAÇÃO INTELIGENTE
    //    (Processo A-Z + Ano crescente)
    // =========================
    const sortedKeys = keys.sort((a, b) => {
  
      const [procA, anoA] = a.split('|');
      const [procB, anoB] = b.split('|');
  
      const cmpProc = procA.localeCompare(procB, 'pt', { sensitivity: 'base' });
      if (cmpProc !== 0) return cmpProc;
  
      return Number(anoA) - Number(anoB);
    });
  
    // =========================
    // 3. MAPA DE CORES (ANO)
    // =========================
    const anosUnicos = [...new Set(sortedKeys.map(k => k.split('|')[1]))];
  
    const yearColors = [
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 99, 132, 0.7)',
      'rgba(75, 192, 192, 0.7)',
      'rgba(255, 159, 64, 0.7)',
      'rgba(153, 102, 255, 0.7)'
    ];
  
    const yearColorMap = {};
    anosUnicos.forEach((ano, i) => {
      yearColorMap[ano] = yearColors[i % yearColors.length];
    });
  
    // =========================
    // 4. MAPA DE PATTERNS (PROCESSO)
    // =========================
    const processosUnicos = [
      ...new Set(sortedKeys.map(k => k.split('|')[0]))
    ];
  
    const patternTypes = ['dot', 'line', 'dash', 'cross', 'zigzag'];
  
    const processPatternMap = {};
    processosUnicos.forEach((p, i) => {
      processPatternMap[p] = patternTypes[i % patternTypes.length];
    });
  
    // =========================
    // 5. DATASETS
    // =========================
    const datasets = sortedKeys.map(key => {
  
      const [processo, ano] = key.split('|');
  
      const baseColor = yearColorMap[ano];
      const patternType = processPatternMap[processo];
  
      let background = baseColor;
  
      if (typeof pattern !== 'undefined') {
        background = pattern.draw(patternType, baseColor);
      }
  
      return {
        label: `${processo} (${ano})`,
        data: dados[key],
        backgroundColor: background,
        borderColor: baseColor,
        borderWidth: 1
      };
    });
  
    // =========================
    // 6. CHART UPDATE / CREATE
    // =========================
    if (this.chart) {
      this.chart.data.labels = meses;
      this.chart.data.datasets = datasets;
      this.chart.update();
      return;
    }
  
    const ctx = document.getElementById('graficoTotais');
  
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: meses,
        datasets
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) =>
                `${ctx.dataset.label}: ${this.formatMoney(ctx.raw)}`
            }
          },
          legend: {
            position: 'bottom'
          }
        },
        scales: {
          x: {
            stacked: false
          },
          y: {
            stacked: false,
            ticks: {
              callback: (v) => this.formatMoney(v)
            }
          }
        }
      }
    });
  },

  // =========================
  // MOSTRA / ESCONDE GRÁFICO
  // =========================
  showGrafico() {
    $('#boxGrafico').fadeIn(200);
  },
  
  hideGrafico() {
    $('#boxGrafico').fadeOut(150);
  },
// =========================
  // EXPORT EXCEL (MANTIDO)
  // =========================
  exportExcel(entidade) {

    if (typeof XLSX === 'undefined') {
      alert('XLSX não carregado');
      return;
    }
  
    const wb = XLSX.utils.book_new();
    const processos = entidade.processos || [];
  
    // =========================
    // FLATTEN FATURAS (BASE)
    // =========================
    const faturasFlat = [];
  
    let totalValor = 0;
  
    processos.forEach(p => {
  
      (p.faturas || []).forEach(f => {
  
        const valor = Number(f.fatura_valor || 0);
        totalValor += valor;
  
        faturasFlat.push({
          Entidade: entidade.entidade,
          Processo_PADM: p.padm,
          Processo_Designacao: p.designacao,
          Fatura: f.fatura,
          Data: f.fatura_data,
          Valor: valor,
          Observações: f.fatura_observacoes,
        });
      });
    });
  
    // =========================
    // SHEET 1 - RESUMO ENTIDADE
    // =========================
    const sheetResumo = [{
      Entidade: entidade.entidade,
      Total_Processos: processos.length,
      Total_Faturas: faturasFlat.length,
      Total_Valor: totalValor
    }];
  
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(sheetResumo),
      "Resumo"
    );
  
    // =========================
    // SHEET 2 - PROCESSOS
    // =========================
    const sheetProcessos = processos.map(p => {
  
      const nFaturas = (p.faturas || []).length;
  
      return {
        Entidade: entidade.entidade,
        PADM: p.padm,
        Regime: p.regime,
        Designacao: p.designacao,
        Num_Faturas: nFaturas
      };
    });
  
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(sheetProcessos),
      "Processos"
    );
  
    // =========================
    // SHEET 3 - FATURAS
    // =========================
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(faturasFlat),
      "Faturas"
    );
  
    // =========================
    // EXPORT
    // =========================
    XLSX.writeFile(
      wb,
      `AUDITORIA_${this.sanitize(entidade.entidade)}.xlsx`
    );
  },

  // =========================
  // UTILS
  // =========================
  formatMoney(v) {
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 2
    }).format(v || 0) + '€';
  },

  escapeHtml(t) {
    return $('<div>').text(t || '').html();
  },

  sanitize(s) {
    return (s || '').replace(/[^a-z0-9]/gi, '_').toLowerCase();
  },

  color(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = str.charCodeAt(i) + ((h << 5) - h);
    }
    return `hsl(${h % 360},70%,60%)`;
  }
};

$(document).ready(() => App.init());