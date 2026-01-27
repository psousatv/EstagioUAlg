// URL do PHP que retorna JSON (corrigido relativo ao HTML)
const url = 'dados/setores_especiais.php';


// Textos
const titulo_mapa = 'Plano Anual de Obras, Investimentos e Aquisição';
const anoCorrente = new Date().getFullYear();  
const setor = 'DAS';

$('#titulo').html(`
    <div class="btn btn-primary col-md-8 d-grid small text-white text-left">
      ${titulo_mapa || ''}: ${anoCorrente || ''} - ${setor || ''}
    </div>
    <div class="btn btn-warning">
      <a href="orcamentoNested.html?itemProcurado=${setor}&anoCorrente=${anoCorrente}" class="text-dark"><i class="fa-solid fa-rotate"></i></a>
    </div>
    <div class="btn btn-primary">
      <a class="text-white" href="orcamentoDashboard.html"><i class="fa-solid fa-search"></i></a>
    </div>
    <h1 class="mt-2"></h1>
`);

// Automatizar posteriormente
const a = 0;
const b = 0;
const c = 0;
const saldoProcesso = 0;

$('#valoresDetalhes').html(`
    <table class="table table-striped table-md">
      <tr>
        <td class="bg-secondary text-white">Ajudicações</td>
        <td class="bg-secondary text-white text-right">${formatCurrency(a)}</td>
        
        <td class="bg-primary text-white">Orçamento</td>
        <td class="bg-primary text-white text-right">${formatCurrency(b)}</td>
        
        <td class="bg-success text-white">Faturado</td>
        <td class="bg-success text-white text-right">${formatCurrency(c)}</td>
        
        <td class="bg-info text-white">Saldo</td>
        <td class="bg-info text-white text-right">${formatCurrency(saldoProcesso)}</td>
      </tr>
    </table>
    <h1 class="mt-2"></h1>
`);

// Buscar os dados do PHP e criar a tabela dinamicamente
$.getJSON(url, function(dados) {
    if (!dados || dados.length === 0) {
        $('#listaDetalhes').html('<p>Nenhum dado encontrado.</p>');
        return;
    }

    // Cabeçalhos dinâmicos
    const cabecalho = Object.keys(dados[0]);

    let linhasHTML = '';
    dados.forEach(item => {
        linhasHTML += '<tr>';
        cabecalho.forEach(col => {
            let valor = item[col];
            if (col === 'valor') valor = formatCurrency(valor);
            linhasHTML += `<td>${valor}</td>`;
        });
        linhasHTML += '</tr>';
    });

    // Criar a tabela completa
    let tabelaHTML = `
        <table class="table table-striped table-md">
            <thead>
                <tr>
                    ${cabecalho.map(col => `<th>${col.replace(/_/g, ' ')}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${linhasHTML}
            </tbody>
        </table>
    `;

    $('#listaDetalhes').html(tabelaHTML);
});


// Função única para formatar valores monetários
function formatCurrency(valor) {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(valor || 0);
}


// Inicializa o formulário com o ano atual
function anoDefault() {
    document.getElementById('anoCorrente').value = anoCorrente;
    var url = 'dados/setoresEspeciais.php?anoCorrente=' + anoCorrente;
    //cartoes(url);
}

// Atualiza o ano
function mudaAno() {
    var anoFormulario = document.getElementById('anoCorrente').value;

    if (!validaAno(anoFormulario)) {
        // Se não for válido, restaura o input para o anoCorrente atual
        document.getElementById('anoCorrente').value = anoCorrente;
        return;
    }

    anoCorrente = anoFormulario;  // Atualiza a variável global

    var url = 'dados/setoresEspeciais.php?anoCorrente=' + anoCorrente;
    //cartoes(url);
}


function getQueryParams() {
    const params = {};
    const search = window.location.search;
    const query = new URLSearchParams(search);
    for (const [key, value] of query.entries()) {
      params[key] = value;
    }
    return params;
  };

// Ao clicar no processo redireciona para o processo
function redirectProcesso(codigoProcesso){
  var obrasURL = "../../producao/processos/processoResults.html?codigoProcesso=" + codigoProcesso;
  //window.open(obrasURL, "_blank");
  window.location.href = obrasURL;
};

// Chamada automática ao carregar a página
window.onload = anoDefault;
