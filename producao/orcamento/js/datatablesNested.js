

$(document).ready(function () {
  const queryParams = getQueryParams();

  const table = $('#processosNested').DataTable({
    ajax: {
      url: 'dados/datatablesNested.php',
      data: function (d) {
        return { ...d, ...queryParams };
      }
    },
    paging: false,
    searching: false,
    select: true,
    "columnDefs": [
        {"className": "dt-head-center", "targets": "_all"}
      ],
    columns: [
      { data: 'linhaO' },
      { data: 'descritivo' },
      { data: 'total_previsto', className: 'dt-body-right', render: $.fn.dataTable.render.number('.', ',', 2, '') },
      { data: 'total_adjudicado', className: 'dt-body-right', render: $.fn.dataTable.render.number('.', ',', 2, '') },
      { data: 'total_faturado', className: 'dt-body-right', render: $.fn.dataTable.render.number('.', ',', 2, '') },
      {
        data: null,
        className: 'dt-body-right',
        render: function (data, type, row) {
          let diff = 0;
          
          const previsto = parseFloat(row.total_previsto) || 0;
          const adjudicado = parseFloat(row.total_adjudicado) || 0;
          const faturado = parseFloat(row.total_faturado) || 0;

          if (adjudicado === 0 && faturado === 0) {
            diff = previsto;
          } else if (adjudicado > 0 && faturado === 0){
            diff = previsto - adjudicado;
          } else {
            diff = previsto - faturado;
          }

          return $.fn.dataTable.render.number('.', ',', 2, '').display(diff);
        }
      },
      {
        data: null,
        className: 'details-control dt-center align-middle',
        orderable: false,
        defaultContent: '<button class="btn-detalhe"><i class="fa-solid fa-circle-question"></i></button>'
      }
    ]
  });

  // Nested rows como antes
  function format(d) {
    if (!d.processos || d.processos.length === 0) return 'Sem processos';

      //var rubricaAdjudicado = Number(d.processos.total_adjudicado) || 0;
      //var rubricaFaturado = Number(d.processos.total_faturado) || 0;
      //var rubricaSaldo = Number(rubricaAdjudicado - rubricaFaturado) || 0;
    
    let html = `
      <table class="table nested table-dark">
        <thead>
          <tr>
            <th>Designação</th>
            <th class="text-center align-middle">Adjudicado</th>
            <th class="text-center align-middle">Faturado</th>
            <th class="text-center align-middle">Saldo</th>
          </tr>
        </thead>
        <tbody>`;

    i = 0;
    var processosAdjudicado = 0;
    var processosFaturado = 0;
    var processosSaldo = 0;
    
    d.processos.forEach(proc => {
      processosAdjudicado += d.processos[i]['adjudicado'];
      processosFaturado += d.processos[i]['faturado'];
      processosSaldo = processosAdjudicado - processosFaturado;
      
      html += `<tr>
        <td onclick="redirectProcesso(${d.processos[i]['proces_check']})">${proc.designacao}</td>
        <td class="text-right">${Intl.NumberFormat("de-DE", {style: "currency", currency:"EUR"}).format(processosAdjudicado)}</td>
        <td class="text-right">${Intl.NumberFormat("de-DE", {style: "currency", currency:"EUR"}).format(processosFaturado)}</td>
        <td class="text-right">${Intl.NumberFormat("de-DE", {style: "currency", currency:"EUR"}).format(processosSaldo)}</td>
      </tr>`;

      i += 1

    });

    html += `
        </tbody>
      </table>`;

    return html;
  }

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
});


function getQueryParams() {
    const params = {};
    const search = window.location.search;
    const query = new URLSearchParams(search);
    for (const [key, value] of query.entries()) {
      params[key] = value;
    }
    return params;
  }

