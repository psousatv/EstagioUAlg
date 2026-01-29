let anoCorrente = new Date().getFullYear();

// Cabeçalhos personalizados
const cabecalhos = [
    "SE",
    "Orçamento",
    "Descritivo",
    "Valor Publicado",
    "Estado",
    "Detalhes"
];

// Função para inicializar o ano e carregar a tabela
function anoDefault() {
    document.getElementById('anoCorrente').value = anoCorrente;
    carregarTabela(anoCorrente);
}

// Função para alterar o ano
function mudaAno() {
    const anoFormulario = document.getElementById('anoCorrente').value;
    if (!validaAno(anoFormulario)) {
        document.getElementById('anoCorrente').value = anoCorrente;
        return;
    }
    anoCorrente = anoFormulario;
    carregarTabela(anoCorrente);
}

// Função para carregar os dados da tabela
function carregarTabela(ano) {
    const url = 'dados/setoresEspeciais.php?anoCorrente=' + ano;
    $.getJSON(url, function(dados) {
        if (!dados || !dados.listagem || !dados.listagem.length) {
            $('#listaDetalhes').html('<p>Nenhum dado encontrado.</p>');
            $('#titulo').html('');
            $('#valoresDetalhes').html('');
            return;
        }

        // Preenche título
        $('#titulo').html(`
            <div class="btn btn-primary col-md-8 d-grid small text-white text-left" id="tituloDetalhe">
                ${dados.titulo[0] || ''} - ${anoCorrente || ''} - ${dados.titulo[1] || ''}: Publicado a ${dados.listagem[0]['data_publicacao'] || ''}
            </div>
        `);

        // Preenche valoresDetalhes com resumo dos valores
        const v = dados.resumoValores || {};
        const valoresHTML = `
            <table class="table table-striped table-md">
                <tr>
                    <td class="bg-secondary text-white">Obras</td>
                    <td class="text-end bg-secondary text-white text-right">${formatCurrency(v.obras)}</td>
                    <td class="bg-primary text-white">Investimentos</td>
                    <td class="text-end bg-primary text-white text-right">${formatCurrency(v.investimentos)}</td>
                    <td class="bg-success text-white">Aquisições</td>
                    <td class="text-end bg-success text-white text-right">${formatCurrency(v.aquisicoes)}</td>
                </tr>
            </table>
        `;
        $('#valoresDetalhes').html(valoresHTML);

        // Monta a tabela principal
        let linhasHTML = '';
        dados.listagem.forEach(item => {
            linhasHTML += '<tr>';

            // Ignora a primeira coluna (se_check) e a coluna de processos
            const valores = Object.keys(item).filter(key => key !== 'se_check' && key !== 'data_publicacao' && key !== 'processos').map(key => item[key]);

            // Adiciona os valores às células da tabela
            valores.forEach((valor, idx) => {
                if (cabecalhos[idx] === "Valor Publicado") {
                    valor = formatCurrency(valor);
                    linhasHTML += `<td class="text-right">${valor}</td>`;
                } else {
                    linhasHTML += `<td>${valor}</td>`;
                }
            });

            // Coluna Detalhes com ícone
            linhasHTML += `<td class="text-center">
                            <i class="fas fa-info-circle text-primary" style="cursor:pointer;" 
                                onclick='verDetalhes("${item.linha_se}", ${JSON.stringify(item.processos)})' title="Mais detalhes"></i>
                        </td>`;

            // Adiciona a célula com a cor ao final da linha
            let cor = '';
            if (item.estado === 'Em Curso') {
                cor = 'background-color: green;';
            } else if (item.estado === 'Em Preparação') {
                cor = 'background-color: orange;';
            } else {
                cor = 'background-color: transparent;';
            }

            // Adiciona a nova célula no final com 1 pixel de largura
            linhasHTML += `<td style="width: 1px; ${cor}"></td>`; // Largura de 3 pixels

            linhasHTML += '</tr>';
        });

        // Cria o HTML da tabela
        const tabelaHTML = `
            <table class="table table-striped table-sm small">
                <thead>
                    <tr>${cabecalhos.filter(th => th !== "Processos").map(th => `<th>${th}</th>`).join('')}</tr>
                </thead>
                <tbody>${linhasHTML}</tbody>
            </table>
        `;

        // Exibe a tabela
        $('#listaDetalhes').html(tabelaHTML);
    });
}

// Função para visualizar detalhes (clicando no ícone)
function verDetalhes(linhaSE, processos) {
    if (!processos || processos.length === 0) {
        alert("Nenhum processo encontrado para essa linha.");
        return;
    }

    let processosHTML = '';
    processos.forEach(proc => {
        processosHTML += ` 
            <tr>
                <td>${proc.proces_padm}</td>
                <td>${proc.proces_nome}</td>
                <td class="text-right">${formatCurrency(proc.proces_val_max)}</td>
                <td>${proc.proces_contrato}</td>
                <td class="text-right">${formatCurrency(proc.proces_val_faturacao)}</td>
                <td class="text-center">
                    <i class="fas fa-info-circle text-primary" style="cursor:pointer;" 
                    onclick='redirectProcesso(${proc.proces_check})' title="Mais detalhes"></i>
                </td>
            </tr>
        `;
    });

    $('#processosBody').html(processosHTML);
    $('#modalDetalhes').modal('show');
}

// Função para fechar o modal
function fecharModal() {
    $('#modalDetalhes').modal('hide');
}

// Formatação de valores monetários
function formatCurrency(valor) {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(valor || 0);
}

// Redireciona para o processo
function redirectProcesso(codigoProcesso) {
    var obrasURL = "../../producao/processos/processoResults.html?codigoProcesso=" + codigoProcesso;
    window.location.href = obrasURL;
}

window.onload = anoDefault;
