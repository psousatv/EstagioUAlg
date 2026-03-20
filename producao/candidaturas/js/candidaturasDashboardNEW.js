$(document).ready(function () {

    // Funções auxiliares
    function formatCurrency(value) {
        return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
    }

    function formatPercent(value) {
        return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // Fetch do JSON gerado pelo PHP
    fetch('dados/candidaturasDashboard.php')
        .then(res => res.json())
        .then(data => {

            // Preparar array plano com todas as candidaturas de todos os programas
            let candidaturas = [];
            data.forEach(prog => {
                prog.candidaturas.forEach(cand => {
                    // Somar valores de todos os processos da candidatura
                    const totalElegivel = cand.processos.reduce((sum, p) => sum + (p.elegivel || p.adjudicado || 0), 0);
                    const totalAdjudicado = cand.processos.reduce((sum, p) => sum + (p.adjudicado || 0), 0);
                    const totalFaturado = cand.processos.reduce((sum, p) => sum + (p.faturado || 0), 0);
                    const totalRecebido = cand.processos.reduce((sum, p) => sum + (p.recebido || 0), 0);

                    // FR % e ER % por candidatura
                    const frPercent = totalFaturado ? (totalRecebido / totalFaturado) : 0;
                    const erPercent = totalElegivel ? (totalRecebido / totalElegivel) : 0;

                    candidaturas.push({
                        candidatura: cand.candidatura,
                        taxa: cand.taxa,
                        elegivel: totalElegivel,
                        adjudicado: totalAdjudicado,
                        faturado: totalFaturado,
                        recebido: totalRecebido,
                        fr_percent: frPercent,
                        er_percent: erPercent
                    });
                });
            });

            // Inicializar DataTable
            $('#tabelaCandidaturas').DataTable({
                data: candidaturas,
                columns: [
                    { data: 'candidatura' },
                    { data: 'taxa', className: 'dt-body-right' },
                    { data: 'elegivel', className: 'dt-body-right', render: formatCurrency },
                    { data: 'adjudicado', className: 'dt-body-right', render: formatCurrency },
                    { data: 'faturado', className: 'dt-body-right', render: formatCurrency },
                    { data: 'recebido', className: 'dt-body-right', render: formatCurrency },
                    { data: 'fr_percent', className: 'dt-body-right', render: formatPercent },
                    { data: 'er_percent', className: 'dt-body-right', render: formatPercent }
                ],
                paging: true,
                pageLength: 10,
                searching: false,
                ordering: true,
                order: [[0, 'asc']],
                footerCallback: function (row, data, start, end, display) {
                    const api = this.api();

                    const sumColumn = (col) => api.column(col).data().reduce((a, b) => a + (b || 0), 0);

                    $(api.column(2).footer()).html(formatCurrency(sumColumn(2)));
                    $(api.column(3).footer()).html(formatCurrency(sumColumn(3)));
                    $(api.column(4).footer()).html(formatCurrency(sumColumn(4)));
                    $(api.column(5).footer()).html(formatCurrency(sumColumn(5)));

                    // FR % e ER % globais
                    const globalFR = sumColumn(5) / sumColumn(4) || 0;
                    const globalER = sumColumn(5) / sumColumn(2) || 0;

                    $(api.column(6).footer()).html(formatPercent(globalFR));
                    $(api.column(7).footer()).html(formatPercent(globalER));
                }
            });

        })
        .catch(err => console.error('Erro ao carregar o JSON:', err));

    veIndicador();

});


// Query params
function getQueryParams() {
    const params = {};
    const query = new URLSearchParams(window.location.search);
    for (const [key, value] of query.entries()) {
        params[key] = value;
    }
    return params;
}

// Indicadores Gerais por Candidatura e por Processo
function veIndicador() {
    fetch('dados/candidaturasIndicadores.php')
      .then(response => response.json())
      .then(data => {

        const botoesContainer = $('#botoesIndicadores');
        const tabelaContainer = $('#tabelaIndicadores');

        botoesContainer.empty();
        tabelaContainer.empty();

        // CSS aplicado diretamente
        const style = `
        <style>
            table.dataTable thead th {
                vertical-align: middle !important;
                text-align: center;
            }
            table.dataTable thead tr:first-child th {
                border-bottom: none;
                font-weight: bold;
            }
            table.dataTable thead tr:nth-child(2) th {
                border-top: none;
                font-weight: normal;
            }
            .dt-body-right {
                text-align: right;
            }
        </style>
        `;
        tabelaContainer.append(style);

        // Agrupa dados por programa
        const grupos = {};
        data.forEach(item => {
            const key = `${item.programa}`;
            if (!grupos[key]) grupos[key] = [];
            grupos[key].push(item);
        });

        const path = "../../global/imagens";

        Object.keys(grupos).forEach((key, index) => {

            const groupData = grupos[key];
            const logoName = groupData[0].logo || '';
            const logoURL = logoName ? `${path}/${logoName}` : '';

            // BOTÃO
            botoesContainer.append(`
                <div class="col-auto mb-2 d-flex justify-content-center">
                    <button class="btn btn-outline-primary text-white fw-bold group-btn"
                        style="background-image:url('${logoURL}');
                               background-size:contain;
                               background-repeat:no-repeat;
                               background-position:center 10px;
                               padding-top:50px; min-width:120px;"
                        data-group-index="${index}">
                    </button>
                </div>
            `);

            const tableId = `tabela_${index}`;

            // TABELA COM HEADER DUPLO
            tabelaContainer.append(`
                <div class="col-12 table-responsive mb-3" id="container_${tableId}" style="display:none;">
                    <table id="${tableId}" class="display table table-sm table-striped table-hover small" style="width:100%;">
                        
                        <thead>
                            <tr>
                                <th rowspan="2">Programa</th>
                                <th rowspan="2">Candidatura</th>
                                <th rowspan="2">Processo</th>
                                <th colspan="2">Valores</th>
                                <th colspan="2">Rede (Km)</th>
                                <th colspan="2">Ramais (un)</th>
                            </tr>
                            <tr>
                                <th>Adjudicado</th>
                                <th>Faturado</th>
                                <th>Previsto</th>
                                <th>Executado</th>
                                <th>Previsto</th>
                                <th>Executado</th>
                            </tr>
                        </thead>

                        <tfoot>
                            <tr>
                                <th colspan="3" class="text-right">Totais</th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                            </tr>
                        </tfoot>

                    </table>
                </div>
            `);

            // DATATABLE
            const table = $(`#${tableId}`).DataTable({
                data: groupData,
                columns: [
                    { data: 'programa' },
                    { data: 'candidatura' },
                    { data: 'processo_nome' },

                    {
                        data: 'adjudicado_por_processo',
                        className: 'dt-body-right',
                        render: data => Number(data).toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' €'
                    },
                    {
                        data: 'faturado_por_processo',
                        className: 'dt-body-right',
                        render: data => Number(data).toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' €'
                    },

                    {
                        data: 'KmRede_previsto',
                        className: 'dt-body-right',
                        render: data => Number(data).toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' km'
                    },
                    {
                        data: 'KmRede_executado',
                        className: 'dt-body-right',
                        render: data => Number(data).toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' km'
                    },

                    {
                        data: 'numRamais_previsto',
                        className: 'dt-body-right',
                        render: data => Number(data).toLocaleString('de-DE')
                    },
                    {
                        data: 'numRamais_executado',
                        className: 'dt-body-right',
                        render: data => Number(data).toLocaleString('de-DE')
                    }
                ],

                paging: false,
                searching: false,
                info: false,
                autoWidth: false,

                footerCallback: function () {
                    const api = this.api();

                    const soma = col =>
                        api.column(col).data().reduce((a, b) => a + (parseFloat(b) || 0), 0);

                    $(api.column(3).footer()).html(soma(3).toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' €').addClass('text-right');
                    $(api.column(4).footer()).html(soma(4).toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' €').addClass('text-right');

                    $(api.column(5).footer()).html(soma(5).toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' km').addClass('text-right');
                    $(api.column(6).footer()).html(soma(6).toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' km').addClass('text-right');

                    $(api.column(7).footer()).html(soma(7).toLocaleString('de-DE')).addClass('text-right');
                    $(api.column(8).footer()).html(soma(8).toLocaleString('de-DE')).addClass('text-right');
                }
            });

        });

        // EVENTO BOTÕES
        $('.group-btn').on('click', function () {
            const index = $(this).data('group-index');
            tabelaContainer.children().hide();
            $(`#container_tabela_${index}`).slideDown();
        });

      })
      .catch(error => console.error('Erro ao buscar dados:', error));
}

// Query params
function getQueryParams() {
  const params = {};
  const query = new URLSearchParams(window.location.search);
  for (const [key, value] of query.entries()) {
    params[key] = value;
  }
  return params;
}

// Redireciona ao selecionar uma candidatura
function candidaturaRedirected(itemProcurado) {
    var URL = "candidaturaNested.html?itemProcurado=" + encodeURIComponent(itemProcurado); // alterar para candidaturaNested
    window.location.href = URL;
}
