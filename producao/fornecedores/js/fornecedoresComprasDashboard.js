const Dashboard = {

  state: {
    raw: [],
    filtered: [],
    charts: {},

    filtros: {
      fornecedor: '',
      ano: null,
      mes: null,
      regime: '',
      valorMin: null,
      valorMax: null
    }
  },

  init() {
    this.bindFilters();
    this.loadData();
  },

  // =========================
  // LOAD
  // =========================
  loadData() {

    fetch('dados/apiAquisicoesGerais.php?action=full')
      .then(r => r.json())
      .then(res => {

        this.state.raw = res.data || [];

        this.buildFilterOptions();
        this.applyFilters();

      });
  },

  // =========================
  // FILTER OPTIONS
  // =========================
  buildFilterOptions() {

    const anos = new Set();
    const regimes = new Set();

    this.state.raw.forEach(e => {
      e.processos?.forEach(p => {

        regimes.add(p.regime);

        p.faturas?.forEach(f => {
          if (f.fatura_data) {
            anos.add(new Date(f.fatura_data).getFullYear());
          }
        });

      });
    });

    $('#fAno').html('<option value="">Todos</option>' +
      [...anos].map(a => `<option>${a}</option>`).join('')
    );

    $('#fRegime').html('<option value="">Todos</option>' +
      [...regimes].map(r => `<option>${r}</option>`).join('')
    );
  },

  // =========================
  // FILTER ENGINE
  // =========================
  applyFilters() {

    const f = this.state.filtros;

    this.state.filtered = this.state.raw.filter(ent => {

      return ent.processos?.some(p => {

        return p.faturas?.some(fat => {

          const d = new Date(fat.fatura_data);
          const valor = Number(fat.fatura_valor || 0);

          return (
            (!f.fornecedor || ent.entidade.toLowerCase().includes(f.fornecedor)) &&
            (!f.ano || d.getFullYear() == f.ano) &&
            (!f.mes || d.getMonth()+1 == f.mes) &&
            (!f.regime || p.regime == f.regime) &&
            (!f.valorMin || valor >= f.valorMin) &&
            (!f.valorMax || valor <= f.valorMax)
          );

        });

      });

    });

    this.updateDashboard();
  },

  // =========================
  // UPDATE
  // =========================
  updateDashboard() {
    this.renderKPIs();
    this.renderTabela();
    this.renderChartMensal();
    this.renderTop();
  },

  // =========================
  // KPIs
  // =========================
  renderKPIs() {

    let total = 0, faturas = 0, processos = 0;

    this.state.filtered.forEach(e => {

      processos += e.processos.length;

      e.processos.forEach(p => {
        p.faturas.forEach(f => {
          total += Number(f.fatura_valor || 0);
          faturas++;
        });
      });

    });

    $('#kpiTotal').text(this.money(total));
    $('#kpiFaturas').text(faturas);
    $('#kpiProcessos').text(processos);
    $('#kpiMedia').text(this.money(total / (processos || 1)));
  },

  // =========================
  // TABELA
  // =========================
  renderTabela() {

    let html = `<table class="table table-sm table-bordered">
      <tr><th>Entidade</th><th>Total €</th></tr>`;

    this.state.filtered.forEach(e => {

      let total = 0;

      e.processos.forEach(p => {
        p.faturas.forEach(f => {
          total += Number(f.fatura_valor || 0);
        });
      });

      html += `<tr>
        <td>${e.entidade}</td>
        <td>${this.money(total)}</td>
      </tr>`;
    });

    $('#tabela').html(html + '</table>');
  },

  // =========================
  // CHART MENSAL
  // =========================
  renderChartMensal() {

    const meses = Array(12).fill(0);

    this.state.filtered.forEach(e => {
      e.processos.forEach(p => {
        p.faturas.forEach(f => {
          if (!f.fatura_data) return;

          const d = new Date(f.fatura_data);
          meses[d.getMonth()] += Number(f.fatura_valor || 0);
        });
      });
    });

    this.createChart('chartMensal', meses, 'Evolução Mensal');
  },

  // =========================
  // TOP ENTIDADES
  // =========================
  renderTop() {

    const map = {};

    this.state.filtered.forEach(e => {

      let total = 0;

      e.processos.forEach(p => {
        p.faturas.forEach(f => {
          total += Number(f.fatura_valor || 0);
        });
      });

      map[e.entidade] = total;
    });

    const sorted = Object.entries(map)
      .sort((a,b) => b[1] - a[1])
      .slice(0,10);

    this.createChart(
      'chartTop',
      sorted.map(x => x[1]),
      'Top Entidades',
      sorted.map(x => x[0])
    );
  },

  // =========================
  // CHART GENERIC
  // =========================
  createChart(id, data, label, labels = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']) {

    if (this.state.charts[id]) {
      this.state.charts[id].destroy();
    }

    this.state.charts[id] = new Chart(document.getElementById(id), {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label, data }]
      }
    });
  },

  // =========================
  // FILTER BIND
  // =========================
  bindFilters() {

    $('#fFornecedor').on('input', e => {
      this.state.filtros.fornecedor = e.target.value.toLowerCase();
      this.applyFilters();
    });

    $('#fAno').on('change', e => {
      this.state.filtros.ano = e.target.value;
      this.applyFilters();
    });

    $('#fMes').on('change', e => {
      this.state.filtros.mes = e.target.value;
      this.applyFilters();
    });

    $('#fRegime').on('change', e => {
      this.state.filtros.regime = e.target.value;
      this.applyFilters();
    });

    $('#fValorMin').on('input', e => {
      this.state.filtros.valorMin = Number(e.target.value);
      this.applyFilters();
    });

    $('#fValorMax').on('input', e => {
      this.state.filtros.valorMax = Number(e.target.value);
      this.applyFilters();
    });
  },

  money(v) {
    return new Intl.NumberFormat('de-DE',{minimumFractionDigits:2}).format(v||0)+'€';
  }

};

$(document).ready(() => Dashboard.init());