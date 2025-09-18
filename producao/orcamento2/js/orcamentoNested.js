$(document).ready(function () {
    const queryParams = getQueryParams();
  
    const table = $('#processosNested').DataTable({
      ajax: {
        url: 'dados/orcamentoNested.php',
        data: function (d) { return { ...d, ...queryParams }; },
        dataSrc: function(json) {
            let orcamentos = [];
            json.rubricas.forEach(rub => {
                rub.orcamentos.forEach(orc => {
                    // adiciona dados da rubrica em cada orçamento para exibição
                    orc.descricaoRubrica = rub.descricaoRubrica;
                    orc.codigoRubrica = rub.codigoRubrica;
                    orcamentos.push(orc);
                });
            });
            return orcamentos;
        }
      },
      paging: false,
      searching: false,
      columnDefs: [{ className: "dt-head-center", targets: "_all" }],
      columns: [
        { data: 'descricaoItemOrcamento' }, 
        { data: 'valorItemOrcamentoPrevisto', className: 'dt-body-right', render: $.fn.dataTable.render.number('.', ',', 2, '') },
        { data: 'valorItemOrcamentoAdjudicado', className: 'dt-body-right', render: $.fn.dataTable.render.number('.', ',', 2, '') },
        { data: 'valorItemOrcamentoFaturado', className: 'dt-body-right', render: $.fn.dataTable.render.number('.', ',', 2, '') },
        { 
          data: null, 
          className: 'dt-body-right', 
          render: function(data, type, row) {
              const diff = row.valorItemOrcamentoAdjudicado - row.valorItemOrcamentoFaturado;
              // Formatar para o formato de moeda
              const formattedDiff = new Intl.NumberFormat('de-DE', {style: 'currency', currency: 'EUR'}).format(diff);
              
              return formattedDiff;  // Retorna o valor formatado como moeda

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
  
    // Mostrar nome da rubrica no topo
    table.on('xhr.dt', function (e, settings, json) {
      if (json && json.rubricas && json.rubricas.length > 0) {
        $('#nomeRubrica').text(
            json.rubricas[0].codigoRubrica 
            + ": " + json.rubricas[0].descricaoRubrica
            + " - " + json.rubricas[0].descricaoItem);
      }
    });
  
    // Mostrar valores da rubrica no topo
    table.on('xhr.dt', function (e, settings, json) {
        if (json && json.rubricas && json.rubricas.length > 0) {
            // Função de formatação de moeda
            const formatCurrency = (value) => {
                return new Intl.NumberFormat('de-DE', { 
                    style: 'currency', 
                    currency: 'EUR' 
                }).format(value);
            };

            // Exibir os valores com uma formatação de moeda
            const previsto = formatCurrency(json.rubricas[0].totaisPrevisto);
            const adjudicado = formatCurrency(json.rubricas[0].totaisAdjudicado);
            const faturado = formatCurrency(json.rubricas[0].totaisFaturado);

            // Criar o HTML para a exibição
            $('#valoresRubrica').html(`
                <div class="row text-center">
                    <div class="col-4">
                        <div class="p-2 bg-dark text-white rounded">
                            <strong>Previsto</strong><br>
                            ${previsto}
                        </div>
                    </div>
                    <div class="col-4">
                        <div class="p-2 bg-success text-white rounded">
                            <strong>Adjudicado</strong><br>
                            ${adjudicado}
                        </div>
                    </div>
                    <div class="col-4">
                        <div class="p-2 bg-warning text-dark rounded">
                            </i><strong>Faturado</strong><br>
                            ${faturado}
                        </div>
                    </div>
                    </div>
                    `);
        }
    });


    // Nested rows: mostrar processos e totais
    function format(d) {
      if (!d.processos || d.processos.length === 0) return '<em>Sem orçamentos</em>';
  
      const formatter = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
      let html = `<table class="table nested table-dark">
                    <thead>
                      <tr>
                        <th>Regime</th>
                        <th>Processo</th>
                        <th class="text-center">Adjudicado</th>
                        <th class="text-center">Faturação</th>
                        <th class="text-center">Saldo</th>
                      </tr>
                    </thead>
                    <tbody>`;
  
        d.processos.forEach(proc => {
            //const faturado = (proc.faturas || []).reduce((sum, f) => sum + parseFloat(f.fact_valor || 0), 0);
            const adjudicado = parseFloat(proc.valorProcessoAdjudicado || 0);
            const faturado = parseFloat(proc.valorProcessoFaturado || 0);
            const saldo = parseFloat(proc.saldoProcesso || 0);
            //const saldo = adjudicado - faturado;
            
            html += `<tr>
                        <td>${proc.regime}</td>
                        <td>${proc.descricao}</td>
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
  
    // Função para extrair parâmetros da URL
    function getQueryParams() {
      const params = {};
      const query = new URLSearchParams(window.location.search);
      for (const [key, value] of query.entries()) { params[key] = value; }
      return params;
    }
  });
  