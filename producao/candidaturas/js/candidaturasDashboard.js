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

// candidaturasDashboard.js
function veIndicador() {
    fetch('dados/candidaturasDashboard2.php')
      .then(response => response.json())
      .then(data => {
        const container = $('#indicadoresCandidaturas');
        container.empty(); // limpa conteúdo antigo

        // Agrupa dados por programa
        const grupos = {};
        data.forEach(item => {
          const key = `${item.programa}`;
          if (!grupos[key]) grupos[key] = [];
          grupos[key].push(item);
        });

        Object.keys(grupos).forEach((key, index) => {
          const groupData = grupos[key];

          // Cria div para o grupo
          const groupDivId = `grupo_${index}`;
          container.append(`<div id="${groupDivId}" class="col-sm-12"></div>`);
          const groupDiv = $(`#${groupDivId}`);

          // Logotipo da Candidatura
          const path = "../../global/imagens";
          const logoName = groupData[0].logo || ''; // pega o valor do JSON
          const logoURL = logoName ? `${path}/${logoName}` : ''; // monta a URL completa

          // Cabeçalho clicável
          groupDiv.append(`
              <h6 class="col-sm-3 header-toggle fw-bold rounded d-flex align-items-center"
                  style="cursor:pointer; border: 1px solid #ccc; padding: 6px 12px; background-color:#e9f2ff;">
              ${key}:
              ${logoURL ? `<img src="${logoURL}" alt="${key}" style="height:24px; width:auto; margin-left:8px;">` : ''}
              </h6>
          `);

          // Cria tabela (inicialmente escondida) ocupando toda a largura
          const tableId = `tabela_${index}`;
          groupDiv.append(`<div class="table-responsive"><table id="${tableId}" class="display table table-sm table-striped table-hover small" style="display:none; width:100%;"></table></div>`);

          // Inicializa DataTable
          const table = $(`#${tableId}`).DataTable({
            data: groupData,
            columns: [
                { data: 'programa', title: 'Programa' },
                { data: 'candidatura', title: 'Candidatura' },
                { data: 'processo_nome', title: 'Processo' },
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
            autoWidth: false
          });

          // Toggle da tabela ao clicar no cabeçalho
          groupDiv.find('.header-toggle').on('click', function() {
            $(`#${tableId}`).slideToggle();
          });
        });
      })
      .catch(error => console.error('Erro ao buscar dados:', error));
}