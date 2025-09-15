$(document).ready(function () {
  const queryParams = getQueryParams();

  const table = $('#processosNested').DataTable({
      ajax: {
          url: 'dados/orcamentoNested.php',
          data: function (d) { return { ...d, ...queryParams }; },
          dataSrc: function (json) {
            // Aqui, passamos tanto os dados das rubricas quanto os totais
            // Adiciona os totais à listaRubricas para que o DataTable consiga acessar diretamente
            json.data.listaRubricas.forEach(function (rubrica) {
                rubrica.totais = json.data.totais;  // Adiciona totais em cada rubrica
            });
            return json.data.listaRubricas; // Retorna a lista de rubricas com os totais incluídos
        }
    },
      paging: false,
      searching: false,
      columnDefs: [{ className: "dt-head-center", targets: "_all" }],
      columns: [
          //{ data: 'orc_rub_cod' },
          //{ data: 'orc_tipo' },
          //{ data: 'orc_descritivo' },
          { data: 'orc_observacoes' }, // É neste campo que se registo a desingação por ser possível existir + de uma "intenção" na Rúbrica
          { data: 'orc_valor_previsto', className: 'dt-body-right', render: $.fn.dataTable.render.number('.', ',', 2, '') },
          { data: 'totais.adjudicado', className: 'dt-body-right', render: $.fn.dataTable.render.number('.', ',', 2, '') },
          { data: 'totais.faturado', className: 'dt-body-right', render: $.fn.dataTable.render.number('.', ',', 2, '') },
          { data: 'totais.saldo', className: 'dt-body-right', render: $.fn.dataTable.render.number('.', ',', 2, '') },
          //{ data: null,
          //  defaultContent: '<a>Em construção</a>'
          // },
          // { data: null,
          //  defaultContent: '<a>Em construção</a>'
          // },
           {
              data: null,
              className: 'details-control dt-center align-middle',
              orderable: false,
              defaultContent: '<button class="btn-detalhe"><i class="fa-solid fa-circle-question"></i></button>'
          }
      ]
  });


  //orc_rub_cod, orc_tipo, orc_descritivo, orc_observacoes, orc_valor_previsto

  // Mostrar nome da rubrica
  table.on('xhr.dt', function (e, settings, json) {
      if (json && json.data && json.data.rubrica) {
          $('#nomeRubrica').text(json.data.rubrica.rubrica + " - " + json.data.rubrica.item);
      }
  });

  // Nested rows
  function format(d) {
    if (!d.processos || d.processos.length === 0) return '<em>Sem processos</em>';

    const formatter = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
    let html = `<table class="table nested table-dark">
                    <thead>
                        <tr>
                            <th>Processo</th>
                            <th class="text-center">Adjudicado</th>
                            <th class="text-center">Faturação</th>
                            <th class="text-center">Saldo</th>
                        </tr>
                    </thead>
                    <tbody>`;

    d.processos.forEach(proc => {
        // Calcula o acumulado usando reduce
        const faturado = (proc.faturas || []).reduce((afa, fa) => afa + parseFloat(fa.fact_valor || 0), 0);
        const adjudicado = parseFloat(proc.proces_val_adjudicacoes || 0);

        const saldo = parseFloat(adjudicado - faturado || 0);

        html += `<tr>
                    <td>${proc.proces_nome}</td>
                    <td class="text-right">${formatter.format(adjudicado)}</td>
                    <td class="text-right">${formatter.format(faturado)}</td>
                    <td class="text-right">${formatter.format(saldo)}</td>
                 </tr>`;
    });

    html += '</tbody></table>';
    return html;
}


  // Toggle nested rows
  $('#processosNested tbody').on('click', 'td.details-control button', function () {
      const tr = $(this).closest('tr');
      const row = table.row(tr);
      const icon = $(this).find('i');
      if (row.child.isShown()) {
          row.child.hide();
          icon.removeClass('fa-circle-info').addClass('fa-circle-question');
      } else {
          row.child(format(row.data())).show();
          icon.removeClass('fa-circle-question').addClass('fa-circle-info');
      }
  });

  function getQueryParams() {
      const params = {};
      const query = new URLSearchParams(window.location.search);
      for (const [key, value] of query.entries()) { params[key] = value; }
      return params;
  }
});
