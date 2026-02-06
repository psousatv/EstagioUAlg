let anoCorrente = new Date().getFullYear();

// Cabeçalhos personalizados
const cabecalhos = [
    "",  
    "Detalhes",  
    "SE",
    "Orçamento",
    "Descritivo",
    "Valor Publicado",
    "Valor Faturado"
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
            return;
        }

        // Preenche título
        $('#titulo').html(`
            <div class="btn btn-primary col-md-8 d-grid small text-white text-left" id="tituloDetalhe">
                ${dados.titulo[0] || ''} - ${anoCorrente || ''} - ${dados.titulo[1] || ''}: Publicado a ${dados.listagem[0]['data_publicacao'] || ''}
            </div>
        `);

        // Monta a tabela principal
        let linhasHTML = '';
        dados.listagem.forEach(item => {
            linhasHTML += '<tr>';

            // Adiciona a nova célula de cor no início da linha
            let cor = '';
            if (item.estado === 'Em Curso') {
                cor = 'background-color: green;';
            } else if (item.estado === 'Em Preparação') {
                cor = 'background-color: orange;';
            } else {
                cor = 'background-color: transparent;';
            }

            // Adiciona a célula a cor
            linhasHTML += `
                <td style=" ${cor}" title="${item.estado}"></td>
            `;

            // Coluna Detalhes com ícone
            linhasHTML += `<td class="text-center">
                            <i class="fas fa-info-circle text-primary fa-2x" style="cursor:pointer;" 
                                onclick='verDetalhes("${item.linha_se}", ${JSON.stringify(item.processos)})' title="Mais detalhes"></i>
                        </td>`;

            // Ignora algumas colunas 
            const valores = Object.keys(item).filter(key => 
                key !== 'se_check' && 
                key !== 'data_publicacao' &&
                key !== 'estado' &&
                key !== 'processos').map(key => item[key]);

            // Adiciona os valores às células da tabela
            valores.forEach((valor, idx) => {
                if (cabecalhos[idx + 2] === "Valor Publicado" || cabecalhos[idx + 2] === "Valor Faturado") {
                    valor = formatCurrency(valor);
                    linhasHTML += `<td class="text-right">${valor}</td>`;
                } else {
                    linhasHTML += `<td>${valor}</td>`;
                }
            });

            linhasHTML += '</tr>';
        });

       // Cria o HTML da tabela
       const tabelaHTML = `
       <div class="table-responsive small" style="max-height:800px;">
           <table class="table table-striped table-bordered mb-0 p-0 table-sm">
               <thead class="sticky-top bg-white">
                   <tr>${cabecalhos.map((th, index) => index === 0 ? 
                    `<th style="width: 3px; min-width: 3px; max-width: 3px; padding: 0; margin: 0; border: none;">
                    ${th}</th>` : `<th>${th}</th>`).join('')}</tr>
               </thead>
               <tbody>${linhasHTML}</tbody>
           </table>
       </div>
   `;

        // Exibe a tabela
        $('#listaDetalhes').html(tabelaHTML);

        // Força a largura da primeira coluna após a tabela ser renderizada
        document.querySelectorAll('table td:first-child, table th:first-child').forEach(function(td) {
            td.style.width = '5px';
            td.style.minWidth = '5px';
            td.style.maxWidth = '5px';
            td.style.padding = '0';
        });

    });
}


// Função abrir o Modal para visualizar detalhes (clicando no ícone)
function verDetalhes(linhaSE, processos) {
    if (!processos || processos.length === 0) {
        alert("Nenhum processo encontrado para essa linha.");
        return;
    }

    let processosHTML = '';
    processos.forEach(proc => {
        processosHTML += ` 
            <tr>
                <td>${proc.proces_contrato}</td>
                <td>${proc.proced_regime}</td>
                <td>${proc.proces_padm}</td>
                <td>${proc.proces_nome}</td>
                <td class="text-right">${formatCurrency(proc.proces_val_max)}</td>
                <td class="text-right">${formatCurrency(proc.proces_val_faturacao)}</td>
                <td class="text-center">
                    <i class="fas fa-info-circle text-primary fa-2x" style="cursor:pointer;" 
                    onclick='redirectProcesso(${proc.proces_check})' title="Mais detalhes"></i>
                </td>
            </tr>
        `;
        
        //console.table(proc);

    });

    // Adiciona o HTML gerado à tabela no modal
    $('#processosBody').html(processosHTML);
    
    // Exibe o modal
    $('#modalDetalhes').modal('show');

    // Foca no primeiro botão ou elemento interativo dentro do modal (pode ser o botão de fechar, por exemplo)
    $('#modalDetalhes .modal-header button').focus();
}

// Função para fechar o modal
function fecharModal() {
    $('#modalDetalhes').modal('hide'); // Fecha o modal
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
