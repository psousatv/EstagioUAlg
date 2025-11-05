

$(document).ready(function () {
    const queryParams = getQueryParams();

    // Função para formatar valores monetários
    function formatCurrency(value) {
        return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
    }

    // Função para gerar a tabela HTML dinamicamente
    function generateTable(data) {
        let tableHTML = `
            <table id="processosNested" class="table table-striped table-bordered">
                <thead>
                    <tr>
                        <th>Candidatura</th>
                        <th class="text-right">Taxa</th>
                        <th class="text-right">Elegível</th>
                        <th class="text-right">Adjudicado</th>
                        <th class="text-right">Faturado</th>
                        <th class="text-right">Recebido</th>
                        <th class="text-right">% Faturado/Recebido</th>
                        <th class="text-right">% Elegível/Recebido</th>
                        <th>Inicio</th>
                        <th>Detalhes</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.forEach((row) => {
            const formattedTaxa = formatCurrency(row.taxa);
            const formattedElegivel = formatCurrency(row.elegivel);
            const formattedAdjudicado = formatCurrency(row.adjudicado);
            const formattedFaturado = formatCurrency(row.faturado);
            const formattedRecebido = formatCurrency(row.recebido);
            const formattedFaturadoRecebidoPercent = (row.faturado_recebido_percent).toFixed(2) + "%";
            const formattedElegivelRecebidoPercent = (row.elegivel_recebido_percent).toFixed(2) + "%";

            tableHTML += `
                <tr>
                    <td>${row.candidatura}</td>
                    <td class="text-right">${formattedTaxa}</td>
                    <td class="text-right">${formattedElegivel}</td>
                    <td class="text-right">${formattedAdjudicado}</td>
                    <td class="text-right">${formattedFaturado}</td>
                    <td class="text-right">${formattedRecebido}</td>
                    <td class="text-right">${formattedFaturadoRecebidoPercent}</td>
                    <td class="text-right">${formattedElegivelRecebidoPercent}</td>
                    <td class="text-right">${row.inicio}</td>
                    <td><button class="btn btn-info btn-sm details-btn" data-candidatura="${row.candidatura}">Detalhes</button></td>
                </tr>
            `;
        });

        tableHTML += '</tbody></table>';
        $('#table-container').html(tableHTML); // Adiciona a tabela no container

        // Adiciona evento de clique para os botões de "Detalhes"
        $('.details-btn').on('click', function () {
            const candidatura = $(this).data('candidatura');
            showDetails(candidatura); // Exibe os detalhes
        });
    }

    // Função para exibir os detalhes do processo
    function showDetails(candidatura) {
        // Aqui pode fazer uma require para obter os dados do processo específico
        alert(`Exibindo detalhes para a candidatura: ${candidatura}`);
    }

    // Função para obter parâmetros da URL
    function getQueryParams() {
        const params = {};
        const query = new URLSearchParams(window.location.search);
        for (const [key, value] of query.entries()) { params[key] = value; }
        return params;
    }

    // Chamar o AJAX para obter os dados da tabela
    $.ajax({
        url: 'dados/candidaturasNested.php',
        data: queryParams,
        success: function (response) {
            if (response && response.candidaturas && response.candidaturas.length > 0) {
                const candidatura = response.candidaturas[0];
                $('#tituloCandidatura').text(`${candidatura.codigoCandidatura}: ${candidatura.nomeCandidatura} - ${candidatura.descriçãoCandidatura}`);

                // Mostrar os totais da Candidatura
                $('#resumoValoresCandidatura').html(`
                    <div class="row text-center">
                        <div class="col-4"><div class="p-2 bg-dark text-white rounded"><strong>Previsto</strong><br>${formatCurrency(candidatura.totaisPrevisto)}</div></div>
                        <div class="col-4"><div class="p-2 bg-success text-white rounded"><strong>Adjudicado</strong><br>${formatCurrency(candidatura.totaisAdjudicado)}</div></div>
                        <div class="col-4"><div class="p-2 bg-warning text-dark rounded"><strong>Faturado</strong><br>${formatCurrency(candidatura.totaisFaturado)}</div></div>
                    </div>
                `);

                // Gerar a tabela com os dados da candidatura
                generateTable(candidatura.orcamentos);
            } else {
                alert('Nenhum dado encontrado');
            }
        },
        error: function () {
            alert('Erro ao carregar os dados');
        }
    });
});
