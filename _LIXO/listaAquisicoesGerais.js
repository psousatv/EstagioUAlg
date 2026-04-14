const API = 'dados/apiAquisicoesGerais.php';

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
    this.bindEvents();
    this.carregarTudo();
  },

  // =========================
  // EVENTS
  // =========================
  bindEvents() {

    $('#btnFiltrar').on('click', () => this.carregarTudo());

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

      if (entidade) {
        this.exportExcel(entidade);
      }
    });

    // TOGGLE ENTIDADE
    $(document).on('click', '.entidade-row', (e) => {

      const id = $(e.currentTarget).data('target');
      const entCod = $(e.currentTarget).data('ent');

      this.toggleEntidade(id, entCod);
    });
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

  resetListagem() {
    $('#frmFornecedor').val('');
    this.entidadeAberta = null;
    this.aplicarFiltro();
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
  
    // 👇 lógica do gráfico
    if (filtro && this.entidadesVisiveis.length) {
      this.showGrafico();
      this.renderGrafico(this.entidadesVisiveis);
    } else {
      this.hideGrafico();
    }
  },

  // =========================
  // RENDER MAIN
  // =========================
  render() {

    $('#listaAquisicoes').html(
      this.renderEntidades(this.entidadesVisiveis)
    );

    //this.renderGrafico(this.entidadesVisiveis);

  },

  // =========================
  // ENTIDADES (MANTIDO UI ANTIGA)
  // =========================
  renderEntidades(entidades) {

    let html = `
      <table class="table table-sm table-bordered table-hover bg-white small">
        <thead class="thead-light">
          <tr>
            <th>Entidade</th>
            <th>Processos</th>
            <th class="text-center">Ano Anterior</th>
            <th class="text-center">Ano Atual</th>
            <th style="width:120px;">Ações</th>
          </tr>
        </thead>
        <tbody>
    `;

    entidades.forEach(e => {

      const id = `ent_${e.ent_cod}`;
      const processos = e.processos || [];

      // contar processos únicos
      const totalProcessos = processos.length;

      html += `
        <tr class="entidade-row"
            data-target="${id}"
            data-ent="${e.ent_cod}"
            style="cursor:pointer">

          <td>${this.escapeHtml(e.entidade)}</td>

          <td class="font-weight-bold">${totalProcessos}</td>

          <td class="text-right font-weight-bold">${this.formatMoney(e.total_anterior)}</td>
          <td class="text-right font-weight-bold">${this.formatMoney(e.total_atual)}</td>

          <td>
            <button class="btn btn-sm btn-success btn-export-excel"
              data-id="${e.ent_cod}">
              Excel
            </button>
          </td>
        </tr>

        <tr id="${id}" class="collapse">
          <td colspan="4" class="p-0">
            <div class="p-2">
              ${this.renderProcessos(processos)}
            </div>
          </td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    return html;
  },

  // =========================
  // TOGGLE
  // =========================
  toggleEntidade(id, entCod) {

    if (this.entidadeAberta && this.entidadeAberta !== id) {
      $(`#${this.entidadeAberta}`).collapse('hide');
    }
  
    const el = $(`#${id}`);
    const isOpen = el.hasClass('show');
  
    el.collapse('toggle');
    this.entidadeAberta = isOpen ? null : id;
  
    const entidade =
      this.entidadesVisiveis.find(e => e.ent_cod == entCod) ||
      this.entidadesCache.find(e => e.ent_cod == entCod);
  
    if (entidade && !isOpen) {
      // 👉 abrir entidade
      this.showGrafico();
      this.renderGrafico([entidade]);
    } else {
      // 👉 fechar entidade
      const filtro = $('#frmFornecedor').val().trim();
  
      if (filtro) {
        this.showGrafico();
        this.renderGrafico(this.entidadesVisiveis);
      } else {
        this.hideGrafico();
      }
    }
  },

  // =========================
  // PROCESSOS
  // =========================
  renderProcessos(processos) {

    let html = `
      <table class="table table-sm table-bordered table-hover small">
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

      const faturas = p.faturas || [];

      html += `
        <tr>
          <td>${this.escapeHtml(p.padm || '')}</td>
          <td>${this.escapeHtml(p.regime || '')}</td>
          <td>${this.escapeHtml(p.designacao || '')}</td>
          <td>
            ${this.renderFaturas(faturas)}
          </td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    return html;
  },

  // =========================
  // FATURAS
  // =========================
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
  // GRAPH (COMPATÍVEL NOVO MODELO)
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
  
    const dados = {}; 
  
    // =========================
    // AGRUPAR DADOS
    // =========================
    entidades.forEach(e => {
  
      const nome = e.entidade;
  
      (e.processos || []).forEach(p => {
  
        (p.faturas || []).forEach(f => {
  
          if (!f.fatura_data) return;
  
          const d = new Date(f.fatura_data);
          if (isNaN(d)) return;
  
          const ano = d.getFullYear();
          const mes = d.getMonth();
  
          const key = `${nome}|${ano}`;
          const valor = Number(f.fatura_valor || 0);
  
          if (!dados[key]) {
            dados[key] = new Array(12).fill(0);
          }
  
          dados[key][mes] += valor;
        });
      });
    });
  
    // =========================
    // SEM DADOS
    // =========================
    if (!Object.keys(dados).length) {
      this.hideGrafico();
      return;
    }
  
    // =========================
    // PADRÕES POR ANO
    // =========================
    const patternTypes = ['solid', 'line', 'dash', 'cross', 'zigzag'];
  
    const anosUnicos = [
      ...new Set(Object.keys(dados).map(k => k.split('|')[1]))
    ];
  
    const yearPatternMap = {};
  
    anosUnicos.forEach((ano, i) => {
      yearPatternMap[ano] = patternTypes[i % patternTypes.length];
    });
  
    // =========================
    // DATASETS
    // =========================
    const datasets = Object.keys(dados).map(key => {
  
      const [nome, ano] = key.split('|');
  
      const baseColor = this.color(nome);
  
      let background;
  
      const patternType = yearPatternMap[ano];
  
      if (typeof pattern !== 'undefined') {
        background = pattern.draw(patternType, baseColor);
      } else {
        background = baseColor; // fallback
      }
  
      return {
        label: `${nome} (${ano})`,
        data: dados[key],
        backgroundColor: background,
        borderColor: baseColor,
        borderWidth: 1
      };
    });
  
    // =========================
    // UPDATE / CREATE CHART
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