

$(document).ready(function () {
  const queryParams = getQueryParams();

  const table = $('#orcamentoTable').DataTable({
    ajax: {
      url: 'orcamento-processos.php', // seu script PHP
      data: function (d) {
        return { ...d, ...queryParams }; // inclui os parâmetros da URL
      }
    },
    columns: [
      { data: 'linhaO' },
      { data: 'descritivo' },
      { data: 'total_previsto' },
      { data: 'total_adjudicado' },
      { data: 'total_faturado' },
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
        <td>${proc.consulta}</td>
        <td>${proc.adjudicado}</td>
        <td>${proc.faturado}</td>
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
