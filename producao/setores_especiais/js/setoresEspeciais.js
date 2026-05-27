let anoCorrente = new Date().getFullYear();

// Cabeçalhos personalizados
const cabecalhos = [
    "",
    "Detalhes",
    "SE",
    "Orçamento",
    "Descritivo",
    "Publicado",
    "Comprometido",
    "Faturado"
];

// =========================
// INIT
// =========================
function anoDefault() {
    document.getElementById('anoCorrente').value = anoCorrente;
    carregarTabela(anoCorrente);
}

function mudaAno() {
    const anoFormulario = document.getElementById('anoCorrente').value;

    if (!validaAno(anoFormulario)) {
        document.getElementById('anoCorrente').value = anoCorrente;
        return;
    }

    anoCorrente = anoFormulario;
    carregarTabela(anoCorrente);
}

// =========================
// LOAD DATA
// =========================
function carregarTabela(ano) {

    const url = 'dados/setoresEspeciais.php?anoCorrente=' + ano;

    $.getJSON(url, function (dados) {

        // guarda global para export
        window._dadosSetoresEspeciais = dados;

        if (!dados || !dados.listagem || !dados.listagem.length) {
            $('#listaDetalhes').html('<p>Nenhum dado encontrado.</p>');
            $('#titulo').html('');
            return;
        }

        // =========================
        // TITULO
        // =========================
        $('#titulo').html(`
            <div class="btn btn-primary col-md-8 d-grid small text-white text-left" id="tituloDetalhe">
                ${dados.titulo[0] || ''} - ${anoCorrente || ''} - ${dados.titulo[1] || ''}: Publicado a ${dados.listagem[0]['data_publicacao'] || ''}
            </div>

            <div class="btn btn-primary">
                <a class="text-white" href="setoresEspeciais.html">
                    <i class="fa-solid fa-rotate"></i>
                </a>
            </div>

            <div class="btn btn-success" id="btnExport">
                <i class="fa fa-file-excel"></i>
            </div>
        `);

        // bind export
        $('#btnExport').off('click').on('click', function () {
            exportSetoresEspeciais(window._dadosSetoresEspeciais);
        });

        // =========================
        // TABELA
        // =========================
        let linhasHTML = '';

        dados.listagem.forEach(item => {

            let cor = '';

            if (item.estado === 'Publicado') {
                cor = 'background-color: red;';
            } else if (item.estado === 'Em Curso' || item.estado === 'Finalizado' || item.estado === 'Encerrada') {
                cor = 'background-color: green;';
            }  else if (item.estado === 'Em Preparação') {
                cor = 'background-color: yellow;';
            } else {
                cor = 'background-color: blue;';
            }

            linhasHTML += '<tr>';

            // coluna estado (cor)
            linhasHTML += `
                <td style="${cor}" title="${item.estado}"></td>
            `;

            // detalhes
            linhasHTML += `
                <td class="text-center">
                    <i class="fas fa-info-circle text-primary fa-2x"
                       style="cursor:pointer;"
                       onclick='verDetalhes("${item.linha_se}", ${JSON.stringify(item.processos || [])})'
                       title="Mais detalhes"></i>
                </td>
            `;

            // restantes colunas
            const valores = Object.keys(item).filter(key =>
                key !== 'se_check' &&
                key !== 'data_publicacao' &&
                key !== 'estado' &&
                key !== 'processos'
            ).map(key => item[key]);

            valores.forEach((valor, idx) => {

                if (cabecalhos[idx + 2] === "Publicado" ||
                    cabecalhos[idx + 2] === "Comprometido" ||
                    cabecalhos[idx + 2] === "Faturado") {

                    valor = formatCurrency(valor);

                    linhasHTML += `<td class="text-right">${valor}</td>`;

                } else {

                    linhasHTML += `<td>${valor}</td>`;
                }
            });

            linhasHTML += '</tr>';
        });

        // =========================
        // TABLE HTML
        // =========================
        const tabelaHTML = `
            <div class="table-responsive small" style="max-height:800px;">
                <table class="table table-striped table-bordered mb-0 p-0 table-sm">

                    <thead class="sticky-top table-dark">
                        <tr>
                            ${cabecalhos.map((th, index) =>
                                index === 0
                                    ? `<th style="width:3px;padding:0;border:none;">${th}</th>`
                                    : `<th>${th}</th>`
                            ).join('')}
                        </tr>
                    </thead>

                    <tbody>
                        ${linhasHTML}
                    </tbody>

                </table>
            </div>
        `;

        $('#listaDetalhes').html(tabelaHTML);

        // ajusta primeira coluna
        document.querySelectorAll('table td:first-child, table th:first-child')
            .forEach(td => {
                td.style.width = '5px';
                td.style.minWidth = '5px';
                td.style.maxWidth = '5px';
                td.style.padding = '0';
            });
    });
}

// =========================
// MODAL DETALHES
// =========================
function verDetalhes(linhaSE, processos) {

    if (!processos || !processos.length) {
        alert("Nenhum processo encontrado para essa linha.");
        return;
    }

    let processosHTML = '';

    processos.forEach(proc => {

        processosHTML += `
            <tr>
                <td>${proc.proces_contrato || ''}</td>
                <td>${proc.proced_regime || ''}</td>
                <td>${proc.proces_padm || ''}</td>
                <td>${proc.proces_nome || ''}</td>
                <td class="text-right">${formatCurrency(proc.proces_val_max)}</td>
                <td class="text-right">${formatCurrency(proc.proces_val_adjudicacoes)}</td>
                <td class="text-right">${formatCurrency(proc.proces_val_faturacao)}</td>
                <td class="text-center">
                    <i class="fas fa-info-circle text-primary fa-2x"
                       style="cursor:pointer;"
                       onclick='redirectProcesso(${proc.proces_check})'
                       title="Mais detalhes"></i>
                </td>
            </tr>
        `;
    });

    $('#processosBody').html(processosHTML);

    $('#modalDetalhes').modal('show');

    $('#modalDetalhes .modal-header button').focus();
}

function fecharModal() {
    $('#modalDetalhes').modal('hide');
}

// =========================
// EXPORT EXCEL
// =========================
function exportSetoresEspeciais(dados, filename = 'SETORES_ESPECIAIS') {

    if (!dados || !dados.listagem) return;

    const wb = XLSX.utils.book_new();
    const rows = [];

    dados.listagem.forEach(linha => {

        const processos = linha.processos || [];

        if (!processos.length) {

            rows.push({
                LinhaSE: linha.linha_se,
                Estado: linha.estado,
                Orcamento: linha.linha_orcamento || '',
                Descritivo: linha.descritivo || '',
                Publicado: linha.valor_publicado || 0,
                Contrato: '',
                Regime: '',
                PADM: '',
                Nome: '',
                Maximo: '',
                Comprometido: '',
                Faturacao: ''
            });

            return;
        }

        processos.forEach(proc => {

            rows.push({
                LinhaSE: linha.linha_se,
                Estado: linha.estado,
                Orcamento: linha.linha_orcamento || '',
                Descritivo: linha.descritivo || '',
                Publicado: linha.valor_publicado || 0,
                Contrato: proc.proces_contrato || '',
                Regime: proc.proced_regime || '',
                PADM: proc.proces_padm || '',
                Nome: proc.proces_nome || '',
                Maximo: proc.proces_val_max || 0,
                Comprometido: proc.proces_val_adjudicacoes || 0,
                Faturacao: proc.proces_val_faturacao || 0
            });
        });
    });

    const ws = XLSX.utils.json_to_sheet(rows);

    XLSX.utils.book_append_sheet(wb, ws, 'SetoresEspeciais');

    XLSX.writeFile(wb, `${filename}.xlsx`);
}

// =========================
// UTILS
// =========================
function formatCurrency(valor) {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
    }).format(valor || 0);
}

function redirectProcesso(codigoProcesso) {
    window.location.href =
        "../../producao/processos/processoResults.html?codigoProcesso=" + codigoProcesso;
}

// =========================
window.onload = anoDefault;