

$(document).ready(function () {
  const queryParams = getQueryParams();

  const table = $('#orcamentoTable').DataTable({
    ajax: {
      url: 'dados/datatablesNested.php', // seu script PHP
      data: function (d) {
        return { ...d, ...queryParams }; // inclui os parâmetros da URL
      }
    },
    columns: [
      { data: 'linhaO' },
      { data: 'descritivo' },
      { data: 'total_previsto', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '') },
      { data: 'total_adjudicado', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '') },
      { data: 'total_faturado', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '') },
      {
        data: null,
        className: 'details-control',
        orderable: false,
        defaultContent: '<button>+</button>'
      }
    ]
  });

  // Nested rows como antes
  function format(d) {
    if (!d.processos || d.processos.length === 0) return 'Sem processos';

    let html = '<table class="table nested"><thead><tr>' +
      '<th>Designação</th><th>Procedimento</th><th>PADM</th><th>Consulta</th><th>Adjudicado</th><th>Faturado</th>' +
      '</tr></thead><tbody>';

    d.processos.forEach(proc => {
      html += `<tr>
        <td>${proc.designacao}</td>
        <td>${proc.procedimento}</td>
        <td>${proc.padm}</td>
        <td>${Number(proc.consulta).toLocaleString('pt-PT')}</td>
        <td>${Number(proc.adjudicado).toLocaleString('pt-PT')}</td>
        <td>${Number(proc.faturado).toLocaleString('pt-PT')}</td>
      </tr>`;

    });

    html += '</tbody></table>';
    return html;
  }

  $('#orcamentoTable tbody').on('click', 'td.details-control button', function () {
    const tr = $(this).closest('tr');
    const row = table.row(tr);

    if (row.child.isShown()) {
      row.child.hide();
      $(this).text('+');
    } else {
      row.child(format(row.data())).show();
      $(this).text('−');
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

