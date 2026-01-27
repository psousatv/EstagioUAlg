
$(document).ready(function () {
  const queryParams = getQueryParams();

  let table;

  // Função para renderizar nested rows
  function formatNested(processos) {
    if (!processos || processos.length === 0) return 'Sem processos';

    const grouped = processos.reduce((acc, proc) => {
      const key = proc.proces_check;
      if (!acc[key]) {
        acc[key] = {
          proces_check: key,
          regime: proc.regime,
          linha_orcamento: proc.linha_orcamento,
          linha_se: proc.linha_se,
          designacao: proc.designacao,
          valor_maximo: proc.val_max,
          adjudicado: 0,
          faturado: 0
        };
      }
      
      acc[key].adjudicado += parseFloat(proc.adjudicado) || 0;
      acc[key].faturado += parseFloat(proc.faturado) || 0;
      return acc;
    }, {});

    const rows = Object.values(grouped).sort((a, b) => a.designacao.localeCompare(b.designacao));

    let html = `
      <table class="table nested table-dark">
        <thead>
          <tr>
            <th>Regime</th>
            <th>Linha ORC.</th>
            <th>Linha SE.</th>
            <th>Designação</th>
            <th class="text-center">Adjudicado</th>
            <th class="text-center">Orçamento</th>
            <th class="text-center">Faturado</th>
            <th class="text-center">Saldo</th>
          </tr>
        </thead>
        <tbody>
    `;

    rows.forEach(proc => {
     
      const saldoProcesso =
      proc.faturado !== 0
          ? proc.valor_maximo - proc.faturado
          : proc.valor_maximo;  
      
      //const saldoProcesso = proc.adjudicado === 0 && proc.faturado === 0 ? proc.previsto :
      //proc.adjudicado > 0 && proc.faturado === 0 ? proc.previsto - proc.adjudicado :
      //proc.previsto === 0 && proc.faturado > 0 ? proc.adjudicado - proc.faturado :
      //proc.previsto - proc.faturado;
      
      //O previsto deve ter como base o plano de pagamentos para que retire os valores de cada ano

      console.table(proc);

      html += `<tr onclick="redirectProcesso(${proc.proces_check})">
        <td>${proc.regime}</td>
        <td>${proc.linha_orcamento}</td>
        <td>${proc.linha_se}</td>
        <td>${proc.designacao}</td>
        <td class="text-right">${Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(proc.adjudicado)}</td>
        <td class="text-right">${Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(proc.valor_maximo)}</td>
        <td class="text-right">${Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(proc.faturado)}</td>
        <td class="text-right">${Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(saldoProcesso)}</td>
      </tr>`;
    });

    html += `</tbody></table>`;
    return html;
  }

  // Inicializa DataTable
table = $('#processosNested').DataTable({
  ajax: {
    url: 'dados/orcamentoNested.php',
    dataSrc: function (json) {
      const rubrica = json.rubrica || {};
      const data = json.data || [];

      // Ordenar pelo tipo
      data.sort((a, b) => a.tipo.localeCompare(b.tipo));

      // Array com a contagem de processos de cada linha
      window.processosPorLinha = data.map(row => Array.isArray(row.processos) ? row.processos.length : 0);

      // Total de processos de todas as linhas
      const totalProcessos = window.processosPorLinha.reduce((sum, qtd) => sum + qtd, 0);

      //console.table(rubrica);
      //console.table(data[0]["ano"]);

      if (data.length > 0) {
        $('#titulo').html(`
          <div class="btn btn-primary col-md-8 d-grid small text-white text-left">
            ${rubrica.rubrica || ''}: ${rubrica.tipo || ''} - ${rubrica.grupo || ''} - ${rubrica.descritivo || ''}
          </div>
          <div class="btn btn-warning">
            <a href="orcamentoNested.html?itemProcurado=${rubrica.rubrica}&anoCorrente=${data[0]["ano"]}" class="text-dark"><i class="fa-solid fa-rotate"></i></a>
          </div>
          <div class="btn btn-primary">
            <a class="text-white" href="orcamentoDashboard.html"><i class="fa-solid fa-search"></i></a>
          </div>
        `);

        const { totalOrcamento, totalAdjudicado, totalFaturado } = data.reduce(
          (acc, r) => {
            acc.totalOrcamento += Number(r.total_orcamento) || 0;
            acc.totalAdjudicado += Number(r.total_adjudicado) || 0;
            acc.totalFaturado += Number(r.total_faturado) || 0;
            return acc;
          },
          { totalOrcamento: 0, totalAdjudicado: 0, totalFaturado: 0 }
        );
        
        const saldoTitulo =
        totalFaturado !== 0
            ? totalOrcamento - totalFaturado
            : totalOrcamento;        

        // Titulo
        $('#valoresRubrica').html(`
          <table class="table table-striped table-md">
            <tr>
              <td class="bg-secondary text-white">Ajudicações</td>
              <td class="bg-secondary text-white text-right">${formatCurrency(totalAdjudicado)}</td>
              
              <td class="bg-primary text-white">Orçamento</td>
              <td class="bg-primary text-white text-right">${formatCurrency(totalOrcamento)}</td>
              
              <td class="bg-success text-white">Faturado</td>
              <td class="bg-success text-white text-right">${formatCurrency(totalFaturado)}</td>
              
              <td class="bg-info text-white">Saldo</td>
              <td class="bg-info text-white text-right">${formatCurrency(saldoTitulo)}</td>
            </tr>
          </table>
        `);
        }

      return data;
    },
    data: function(d) {
      return { ...d, ...queryParams };
    }
  },
  paging: false,
  searching: false,
  select: true,
  columnDefs: [{ className: "dt-head-center", targets: "_all" }],
  order: [[6, 'asc']],
  columns: [
    { data: 'regime' },
    { 
      data: 'descritivo',
      render: function(data, type, row, meta) {
        const totalProcessosLinha = window.processosPorLinha[meta.row] || 0;
        return `${data} <span class="badge bg-info text-white">(${totalProcessosLinha})</span>`;
      }
    },
    { data: 'total_adjudicado', className: 'dt-body-right', render: $.fn.dataTable.render.number('.', ',', 2, '') },
    { data: 'total_orcamento', className: 'dt-body-right', render: $.fn.dataTable.render.number('.', ',', 2, '') },
    { data: 'total_faturado', className: 'dt-body-right', render: $.fn.dataTable.render.number('.', ',', 2, '') },
    {
      data: null,
      className: 'dt-body-right',
      // O saldo de cada linha
      // deve ser considerado a diferença entre o adjudicado e o faturado
      // Caso o item não tenha sido utilizado, usar o previsto
      render: function(data, type, row) {
        const orcamento = row.total_orcamento || 0;
        const adjudicado = row.total_adjudicado || 0;
        const faturado = row.total_faturado || 0;

        const saldoRubricas =
        faturado !== 0
            ? orcamento - faturado
            : orcamento; 

        return $.fn.dataTable.render.number('.', ',', 2, '').display(saldoRubricas);
      }
    },
    {
      data: null,
      className: 'details-control dt-center align-middle',
      orderable: false,
      defaultContent: '<button class="btn-detalhe"><i class="fa-solid fa-circle-info"></i></button>'
    },
    { data: 'tipo', visible: false }
  ]
}
);



  // Nested rows toggle
  $('#processosNested tbody').on('click', 'td.details-control button', function () {
    const tr = $(this).closest('tr');
    const row = table.row(tr);
    const icon = $(this).find('i');

    if (row.child.isShown()) {
      row.child.hide();
      icon.removeClass('fa-circle-info').addClass('fa-circle-minus');
    } else {
      row.child(formatNested(row.data().processos)).show();
      icon.removeClass('fa-circle-minus').addClass('fa-circle-info');
    }
  });
});
  
  
function getQueryParams() {
    const params = {};
    const search = window.location.search;
    const query = new URLSearchParams(search);
    for (const [key, value] of query.entries()) {
      params[key] = value;
    }
    return params;
  };
  
// Função para formatar valores monetários
function formatCurrency(value) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
};

// Ao clicar no processo redireciona para o processo
function redirectProcesso(codigoProcesso){
  var obrasURL = "../../producao/processos/processoResults.html?codigoProcesso=" + codigoProcesso;
  //window.open(obrasURL, "_blank");
  window.location.href = obrasURL;
};
