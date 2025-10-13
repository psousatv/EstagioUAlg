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
function candidaturaRedirected(nomeCandidatura) {
    console.log("Nome Candidatura:", nomeCandidatura);
    var URL = "candidaturaNested.html?nomeCandidatura=" + encodeURIComponent(nomeCandidatura);
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
        .catch(error => console.error("Erro ao carregar dados:", error));
});
