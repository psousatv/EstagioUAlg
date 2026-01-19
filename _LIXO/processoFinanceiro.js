const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

// Defina aqui o código do processo manualmente ou via query string
// Ex: index.html?codigoProcesso=123
const urlParams = new URLSearchParams(window.location.search);
const codigoProcesso = urlParams.get('codigoProcesso') || 0;

if (!codigoProcesso) {
    console.error('Código do processo não informado na URL.');
}

/**
 * Função que gera tabela HTML a partir do JSON
 */
function gerarTabelaHTML(dados, titulo) {
    let acumuladoTotal = dados.reduce((sum, row) => sum + parseFloat(row.Acumulado), 0);
    let html = `<b>${titulo} » ${acumuladoTotal.toFixed(2)}€</b>
                <table class='table table-bordered table-striped table-hover small'>
                <tr style='text-align: center'>
                    <th>Ano</th>
                    <th>Acumulado</th>`;
    meses.forEach(m => html += `<th>${m}</th>`);
    html += `</tr>`;

    dados.forEach(row => {
        html += `<tr>
                    <td style='text-align:center'>${row.Ano}</td>
                    <td style='text-align:right'>${parseFloat(row.Acumulado).toFixed(2)}</td>`;
        meses.forEach(m => html += `<td style='text-align:right'>${parseFloat(row[m]).toFixed(2)}</td>`);
        html += `</tr>`;
    });

    html += `</table>`;
    return html;
}

/**
 * Busca dados do PHP via fetch e insere nas divs
 */
fetch(`dados/processoFinanceiro.php?codigoProcesso=${codigoProcesso}`)
    .then(res => res.json())
    .then(data => {
        document.getElementById('tabelaPrevisto').innerHTML = gerarTabelaHTML(data.previsto, 'Previsto');
        document.getElementById('tabelaRealizado').innerHTML = gerarTabelaHTML(data.realizado, 'Realizado');
    })
    .catch(err => console.error('Erro ao carregar dados:', err));
