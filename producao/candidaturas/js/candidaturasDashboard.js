// Variáveis globais
var allData = [];
var dadosProgresso = [];
var dadosGrafico = [];
var titulo_colunas = [];
var nome_candidatura = [];

// Função para converter string em número
function intVal(i) {
    return typeof i === 'string'
        ? i.replace(/\./g, '').replace(',', '.') * 1
        : typeof i === 'number' ? i : 0;
}

// Redireciona ao selecionar uma candidatura
function candidaturaRedirected(itemProcurado) {
    var URL = "candidaturaNested.html?itemProcurado=" + encodeURIComponent(itemProcurado); // alterar para candidaturaNested
    window.location.href = URL;
}


// Fetch com jQuery
$(document).ready(function () {
    fetch("dados/candidaturasDashboard.php")
        .then(response => response.json())
        .then(data => {
            // Inicializa DataTable
            var dataTable = $('#tabela').DataTable({
                searching: false,
                lengthChange: false,
                aaData: data,
                columns: [
                    { data: 'candidatura' },
                    { data: 'taxa', className: 'dt-body-right', render: $.fn.dataTable.render.number('.', ',', 2, '') },
                    { data: 'elegivel', className: 'dt-body-right', render: $.fn.dataTable.render.number('.', ',', 2, '') },
                    { data: 'adjudicado', className: 'dt-body-right', render: $.fn.dataTable.render.number('.', ',', 2, '') },
                    { data: 'faturado', className: 'dt-body-right', render: $.fn.dataTable.render.number('.', ',', 2, '') },
                    { data: 'recebido', className: 'dt-body-right', render: $.fn.dataTable.render.number('.', ',', 2, '') },
                    { data: 'faturado_recebido_percent', className: 'dt-body-right', render: $.fn.dataTable.render.number('.', ',', 2, '') },
                    { data: 'elegivel_recebido_percent', className: 'dt-body-right', render: $.fn.dataTable.render.number('.', ',', 2, '') },
                    { data: 'inicio', visible: false }
                ],
                order: [[8, 'desc']],
                footerCallback: function (row, data, start, end, display) {
                    var api = this.api();
                    [2, 4, 5].forEach(function (colIndex) {
                        var totalGlobal = api.column(colIndex).data().reduce((a, b) => intVal(a) + intVal(b), 0);
                        var totalPagina = api.column(colIndex, { page: 'current' }).data().reduce((a, b) => intVal(a) + intVal(b), 0);
                        $(api.column(colIndex).footer()).html(
                            `<div class="text-right">
                                ${Number(totalPagina).toLocaleString('pt-PT')} €<br>
                                <small>(Global: ${Number(totalGlobal).toLocaleString('pt-PT')} €)</small>
                            </div>`
                        );
                    });
                }
            });

            // Preenche arrays auxiliares
            dataTable.rows().every(function () {
                var rowData = this.data();
                allData.push(rowData);
                titulo_colunas = Object.keys(rowData);
                nome_candidatura.push(rowData["candidatura"]);
                dadosProgresso.push([rowData["candidatura"], rowData["recebido"], rowData["elegivel_recebido_percent"]]);
                dadosGrafico.push(rowData["recebido"]);
            });

            // Cria os cartões
            var containerCurso = $('#cartoesCandidaturaEmCurso');
            var containerEncerrada = $('#cartoesCandidaturaEncerrada');
            containerCurso.empty();
            containerEncerrada.empty();

            data.forEach(dados => {
                let classeCartao, iconeCartao;

                if (dados.faturado_recebido_percent < .50) {
                    classeCartao = 'bg-danger text-white';
                    iconeCartao = 'fa fa-thumbs-down';
                } else if (dados.faturado_recebido_percent < .70) {
                    classeCartao = 'bg-warning text-dark';
                    iconeCartao = 'fa fa-exclamation-triangle';
                } else if (dados.faturado_recebido_percent < .85) {
                    classeCartao = 'bg-primary text-white';
                    iconeCartao = 'fa fa-cog fa-spin';
                } else {
                    classeCartao = 'bg-success text-white';
                    iconeCartao = 'fa fa-smile';
                }

                let cartao = `
                <div class="col-sm-6 col-md-3 mb-2">
                    <div class="card h-100 ${classeCartao}" onclick="candidaturaRedirected('${dados.candidatura}')">
                        <div class="d-flex px-3 py-2 small">
                            <div class="flex-grow-1 text-left">
                                <p class="mb-1 font-weight-bold">${dados.candidatura}</p>
                                <div>
                                    <h6>
                                        ${Intl.NumberFormat("de-DE", 
                                            { style: "currency", currency: "EUR" }).format(dados.faturado)} -
                                        ${Intl.NumberFormat("de-DE", 
                                            { style: "currency", currency: "EUR" }).format(dados.recebido)} -
                                        <span>${Intl.NumberFormat("de-DE", 
                                            {style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(dados.faturado_recebido_percent)}
                                        </span>
                                    </h6>
                                </div>
                                <div>
                                    <h5>
                                        ${Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(dados.elegivel)} 
                                        <span class="h6">- ${Intl.NumberFormat("de-DE", 
                                            { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(dados.elegivel_recebido_percent)}
                                        </span>
                                    </h5>
                                </div>
                            </div>
                            <div class="pl-2 mt-auto">
                                <i class="fas ${iconeCartao} fa-3x"></i>
                            </div>
                        </div>
                    </div>
                </div>
                `;
                
                if (dados.estado === 'Em Curso') {
                    containerCurso.append(cartao);
                } else {
                    containerEncerrada.append(cartao);
                }
            });
        })
        .catch(error => console.error("Erro ao carregar dados:", error)
    );
    
      // Função que cria as tabelas agrupadas
  veIndicador(); // chama sua função de fetch/DataTables para #indicadoresCandidatura

});

// Indicadores Gerais de Candidaturas com botões centralizados e totais
function veIndicador() {
    fetch('dados/candidaturasIndicadores.php')
      .then(response => response.json())
      .then(data => {
        const botoesContainer = $('#botoesIndicadores');
        const tabelaContainer = $('#tabelaIndicadores');
        botoesContainer.empty();
        tabelaContainer.empty(); // limpa tabelas antigas

        // Agrupa dados por programa
        const grupos = {};
        data.forEach(item => {
          const key = `${item.programa}`;
          if (!grupos[key]) grupos[key] = [];
          grupos[key].push(item);
        });

        // Caminho das logos
        const path = "../../global/imagens";

        Object.keys(grupos).forEach((key, index) => {
          const groupData = grupos[key];
          const logoName = groupData[0].logo || '';
          const logoURL = logoName ? `${path}/${logoName}` : '';

          // Cria botão do grupo
          const buttonHTML = `
            <div class="col-auto mb-2 d-flex justify-content-center">
              <button class="btn btn-outline-primary text-white fw-bold group-btn" 
                      style="background-image: url('${logoURL}'); 
                             background-size: contain; 
                             background-repeat: no-repeat; 
                             background-position: center 10px; 
                             padding-top: 40px; min-width:120px;" 
                      data-group-index="${index}">
                ${key}
              </button>
            </div>
          `;
          botoesContainer.append(buttonHTML);

          // Cria tabela (inicialmente invisível)
          const tableId = `tabela_${index}`;
          tabelaContainer.append(`<div class="col-12 table-responsive mb-3" id="container_${tableId}" style="display:none;">
                                      <table id="${tableId}" class="display table table-sm table-striped table-hover small" style="width:100%;">
                                        <tfoot>
                                          <tr>
                                            <th colspan="4" class="text-right">Totais</th>
                                            <th class="text-right"></th>
                                            <th class="text-right"></th>
                                            <th class="text-right"></th>
                                          </tr>
                                        </tfoot>
                                      </table>
                                  </div>`);

          // Inicializa DataTable com totais
          const table = $(`#${tableId}`).DataTable({
            data: groupData,
            columns: [
                { data: 'programa', title: 'Programa' },
                { data: 'candidatura', title: 'Candidatura' },
                { data: 'processo_nome', title: 'Processo' },
                { 
                    data: 'adjudicado_por_processo', 
                    title: 'Adjudicado', className: 'dt-body-right',
                    render: function(data) {
                      return Number(data).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
                    }
                  },
                { 
                  data: 'faturado_por_processo', 
                  title: 'Faturado', className: 'dt-body-right',
                  render: function(data) {
                    return Number(data).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
                  }
                },
                { 
                  data: 'KmRede_por_processo', title: 'Km Rede', className: 'dt-body-right',
                  render: function(data) {
                    return Number(data).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' km';
                  }
                },
                { 
                  data: 'numRamais_por_processo', title: 'Nº Ramais', className: 'dt-body-right',
                  render: function(data) {
                    return Number(data).toLocaleString('de-DE');
                  }
                }
            ],
            paging: false,
            searching: false,
            info: false,
            autoWidth: false,
            footerCallback: function (row, data, start, end, display) {
                var api = this.api();

                // Função para somar colunas
                const totalAdjudicado = api
                    .column(3, { page: 'current' })
                    .data()
                    .reduce((a, b) => a + parseFloat(b) || 0, 0);
                const totalFaturado = api
                    .column(4, { page: 'current' })
                    .data()
                    .reduce((a, b) => a + parseFloat(b) || 0, 0);

                const totalKm = api
                    .column(5, { page: 'current' })
                    .data()
                    .reduce((a, b) => a + parseFloat(b) || 0, 0);

                const totalRamais = api
                    .column(6, { page: 'current' })
                    .data()
                    .reduce((a, b) => a + parseFloat(b) || 0, 0);

                // Atualiza footer e alinha à direita
                $(api.column(3).footer()).html(
                    totalAdjudicado.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
                ).addClass('text-right'); // Alinha à direita
                $(api.column(4).footer()).html(
                    totalFaturado.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
                ).addClass('text-right'); // Alinha à direita
                $(api.column(5).footer()).html(
                    totalKm.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' km'
                ).addClass('text-right'); // Alinha à direita
                $(api.column(6).footer()).html(
                    totalRamais.toLocaleString('de-DE')
                ).addClass('text-right'); // Alinha à direita
            }
          });

        });

        // Evento ao clicar no botão do grupo
        $('.group-btn').on('click', function() {
            const index = $(this).data('group-index');

            // Esconde todas as tabelas
            tabelaContainer.children().hide();

            // Mostra a tabela do grupo clicado
            $(`#container_tabela_${index}`).slideDown();
        });

      })
      .catch(error => console.error('Erro ao buscar dados:', error));
}