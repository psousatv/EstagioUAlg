const API = 'dados/apiAquisicoes.php';

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

    // ✅ EXPORT EXCEL (FIXED)
    $(document).on('click', '.btn-export-excel', (e) => {
      e.stopPropagation();

      const id = $(e.currentTarget).data('id');

      const entidade = this.entidadesCache.find(
        x => String(x.ent_cod) === String(id)
      );

      if (entidade) {
        this.exportExcel(entidade);
      } else {
        console.warn('Entidade não encontrada:', id);
      }
    });

    // ✅ TOGGLE ROW (sem onclick inline)
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
  },

  // =========================
  // RENDER
  // =========================
  render() {
    $('#listaAquisicoes').html(
      this.renderEntidades(this.entidadesVisiveis)
    );

    this.renderGrafico(this.entidadesVisiveis);
  },

  // =========================
  // ENTIDADES (TABLE)
  // =========================
  renderEntidades(entidades) {
    let html = `
      <table class="table table-sm table-bordered table-hover bg-white small">
        <thead class="thead-light">
          <tr>
            <th>Entidade</th>
            <th class="text-right">Total</th>
            <th style="width:120px;">Ações</th>
          </tr>
        </thead>
        <tbody>
    `;

    entidades.forEach(e => {
      const id = `ent_${e.ent_cod}`;

      const total = (e.processos || []).reduce((acc, p) => {
        const v = Number(p.adjudicado);
        return acc + (isNaN(v) ? 0 : v);
      }, 0);

      html += `
        <tr class="entidade-row"
            data-target="${id}"
            data-ent="${e.ent_cod}"
            style="cursor:pointer">

          <td>${this.escapeHtml(e.entidade)}</td>

          <td class="text-right font-weight-bold">
            ${this.formatMoney(total)}
          </td>

          <td>
            <button class="btn btn-sm btn-success btn-export-excel"
              data-id="${e.ent_cod}">
              Excel
            </button>
          </td>
        </tr>

        <tr id="${id}" class="collapse">
          <td colspan="3" class="p-0">
            <div class="p-2">
              ${this.renderProcessos(e.processos || [])}
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
      this.renderGrafico([entidade]);
    } else {
      this.renderGrafico(this.entidadesVisiveis);
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
            <th>Designação</th>
            <th>Ano</th>
            <th class="text-right">Adjudicado</th>
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
          <td>${p.ano_adjudicado || ''}</td>
          <td class="text-right">${this.formatMoney(p.adjudicado)}</td>
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
    const anos = {};
    const labels = new Set();

    entidades.forEach(e => {
      labels.add(e.entidade);

      (e.processos || []).forEach(p => {
        const ano = p.ano_adjudicado || 'N/A';
        const val = Number(p.adjudicado);

        if (!anos[ano]) anos[ano] = {};
        if (!anos[ano][e.entidade]) anos[ano][e.entidade] = 0;

        anos[ano][e.entidade] += isNaN(val) ? 0 : val;
      });
    });

    const years = Object.keys(anos).sort();
    const entidadesList = [...labels];

    const datasets = entidadesList.map(ent => ({
      label: ent,
      data: years.map(y => anos[y][ent] || 0),
      backgroundColor: this.color(ent)
    }));

    if (this.chart) {
      this.chart.data.labels = years;
      this.chart.data.datasets = datasets;
      this.chart.update();
      return;
    }

    const ctx = document.getElementById('graficoTotais');

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: { labels: years, datasets },
      options: {
        responsive: true,
        scales: {
          x: { stacked: true },
          y: { stacked: true }
        }
      }
    });
  },

  // =========================
  // EXCEL
  // =========================
  exportExcel(entidade) {
  if (typeof XLSX === 'undefined') {
    alert('Biblioteca XLSX não carregada!');
    return;
  }

  const wb = XLSX.utils.book_new();
  const processos = entidade.processos || [];

  // =========================
  // PROCESSOS
  // =========================
  const sheetProcessos = processos.map(p => ({
    Entidade: entidade.entidade,
    PADM: p.padm,
    Regime: p.regime,
    Designacao: p.designacao,
    Ano: p.ano_adjudicado,
    Adjudicado: Number(p.adjudicado || 0)
  }));

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(sheetProcessos),
    "Processos"
  );

  // =========================
  // FATURAS (FLATTEN)
  // =========================
  const faturas = [];

  processos.forEach(p => {
    (p.faturas || []).forEach(f => {
      faturas.push({
        Entidade: entidade.entidade,
        PADM: p.padm,
        Designacao: p.designacao,
        Ano: p.ano_adjudicado,
        Fatura: f.fatura,
        Data: f.fatura_data,
        Valor: Number(f.fatura_valor || 0),
        Observações: f.fatura_observacoes,
      });
    });
  });

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(faturas),
    "Faturas"
  );

  // =========================
  // RESUMO
  // =========================
  const total = processos.reduce((acc, p) => {
    const v = Number(p.adjudicado);
    return acc + (isNaN(v) ? 0 : v);
  }, 0);

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet([
      { Indicador: "Entidade", Valor: entidade.entidade },
      { Indicador: "Total Processos", Valor: processos.length },
      { Indicador: "Total Adjudicado", Valor: total }
    ]),
    "Resumo"
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
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
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

const app = App;

$(document).ready(() => App.init());