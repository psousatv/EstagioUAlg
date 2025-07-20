

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

      const totalPrevisto = Number(d.total_previsto) || 0;
      const totalAdjudicado = Number(d.total_adjudicado) || 0;
      const totalFaturado = Number(d.total_faturado) || 0;
      const saldo = Number(totalPrevisto - totalFaturado) || 0;

  //let html =
  //    '<div class="card col-md-12">' +
  //      '<div class="card-body"> '+
  //      '<a class="badge bg-info text-white small">Os valores de orçamento são ajustados para os valores de adjudicação </a>' +
  //        '<table class="table table-responsive table-striped">' +
  //          '<tr>' +
  //           `<td class="bg-primary text-white">Items no Orçamento <span class="badge bg-secondary">(${d.processos.length})</span></td>` +
  //            `<td class="bg-primary text-white">${totalPrevisto.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</td>` +
  //            `<td class="bg-secondary text-white">Processos Adjudicados</td>` +
  //            `<td class="bg-secondary text-white">${totalAdjudicado.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</td>` +
  //            `<td class="bg-success text-white">Valor Faturado</td>` +
  //            `<td class="bg-success text-white">${totalFaturado.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</td>` +
  //            `<td class="bg-info text-white">Saldo</td>` +
  //            `<td class="bg-info text-white">${saldo.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</td>` +
  //          '</tr>' +
  //        '</table>' +
  //      '</div>' +
  //    '</div>';


    let html = '<table class="table nested"><thead><tr>' +
      '<th>Designação</th><th>Adjudicado</th><th>Faturado</th><th>Saldo</th>' +
      '</tr></thead><tbody>';

    d.processos.forEach(proc => {
      html += `<tr>
        <td>${proc.designacao}</td>
        <td>${Number(totalAdjudicado).toLocaleString('pt-PT', { minimumFractionDigits: 2, })}</td>
        <td>${totalFaturado.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2  })}</td>
        <td>${(saldo).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2  })}</td>
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

