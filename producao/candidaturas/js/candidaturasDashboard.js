// Variáveis globais
var allData = [];
var dadosProgresso = [];
var dadosGrafico = [];
var titulo_colunas = [];
var nome_candidatura = [];

$.ajax({
    url: "dados/candidaturasDashboard.php",
    method: 'GET',
    contentType: 'application/json'
}).done(function (data) {
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
            { data: 'inicio', visible: false } // usada apenas para ordenar
        ],
        order: [[8, 'desc']],

        // Totais no rodapé
        footerCallback: function (row, data, start, end, display) {
            var api = this.api();

            // Função auxiliar: string → número
            var intVal = function (i) {
                return typeof i === 'string'
                    ? i.replace(/\./g, '').replace(',', '.') * 1
                    : typeof i === 'number' ? i : 0;
            };

            // Colunas a somar: 2 = Elegível, 4 = Faturado, 5 = Recebido
            [2, 4, 5].forEach(function (colIndex) {
                // Total global
                let totalGlobal = api.column(colIndex).data().reduce((a, b) => intVal(a) + intVal(b), 0);

                // Total apenas da página
                let totalPagina = api.column(colIndex, { page: 'current' }).data().reduce((a, b) => intVal(a) + intVal(b), 0);

                // Atualiza o rodapé com alinhamento à direita
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

    // Containers de cartões
    var containerCurso = document.getElementById('cartoesCandidaturaEmCurso');
    var containerEncerrada = document.getElementById('cartoesCandidaturaEncerrada');
    containerCurso.innerHTML = '<div class="row"></div>';
    containerEncerrada.innerHTML = '<div class="row"></div>';

    let htmlCurso = "";
    let htmlEncerrada = "";

    data.forEach((dados) => {
        let classeCartao, iconeCartao;

        // Definição de cores conforme percentuais
        if (dados["faturado_recebido_percent"] < 50) {
            classeCartao = 'bg-danger text-white';
            iconeCartao = 'fa fa-thumbs-down';
        } else if (dados["faturado_recebido_percent"] >= 50 && dados["faturado_recebido_percent"] < 70) {
            classeCartao = 'bg-warning text-dark';
            iconeCartao = 'fa fa-exclamation-triangle';
        } else if (dados["faturado_recebido_percent"] >= 70 && dados["faturado_recebido_percent"] < 85) {
            classeCartao = 'bg-primary text-white';
            iconeCartao = 'fa fa-cog fa-spin';
        } else {
            classeCartao = 'bg-success text-white';
            iconeCartao = 'fa fa-smile';
        }

            // Monta cartão (4 colunas por linha no desktop)
            let cartao = `
            <div class="col-sm-6 col-md-3 mb-3">
                <div class="card h-100 ${classeCartao}" onclick="candidaturaRedirected('${dados["candidatura"]}')">
                    <div class="d-flex justify-content-between px-3 py-2">
                        <div class="flex-grow-1 text-left">
                            <p class="mb-1 small font-weight-bold">${dados["candidatura"]}</p>
                            <div>
                                ${Number(dados["faturado"]).toLocaleString('pt-PT')}€ (F) - 
                                ${Number(dados["recebido"]).toLocaleString('pt-PT')}€ (R) - 
                                ${dados["faturado_recebido_percent"]}%
                            </div>
                            <div>
                                ${Number(dados["elegivel"]).toLocaleString('pt-PT')}€ (E) - 
                                ${dados["elegivel_recebido_percent"]}%
                            </div>
                        </div>
                        <div class="align-self-center pl-2">
                            <i class="fas ${iconeCartao} fa-3x"></i>
                        </div>
                    </div>
                </div>
            </div>`;

        // Adiciona ao container correto
        if (dados["estado"] === 'Em Curso') {
            htmlCurso += cartao;
        } else {
            htmlEncerrada += cartao;
        }
    });

    // Injeta dentro das rows
    containerCurso.querySelector(".row").innerHTML = htmlCurso;
    containerEncerrada.querySelector(".row").innerHTML = htmlEncerrada;
});

// Redireciona ao selecionar uma candidatura
function candidaturaRedirected(nomeCandidatura) {
    console.log("Nome Candidatura:", nomeCandidatura);
    var URL = "candidaturaResults.html?nomeCandidatura=" + encodeURIComponent(nomeCandidatura);
    window.location.href = URL;
}
