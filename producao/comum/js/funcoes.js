// FUNÇÕES PARA IMPRIMIR NA IMPRESSORA, PDF E EXCEL

// OBRAS ATIVAS - CRONOLOGIA
function imprimirCronos() {
    // Seleciona todas as linhas do tbody gerado pelo renderVistorias()
    const linhas = Array.from(document.querySelectorAll("#lstCronos tbody tr"));

    // Começa o HTML da tabela de impressão
    let html = `
        <html>
        <head>
            <title>Impressão da Situação Cronológica de Processos Ativos</title>
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h4 { margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; }
                th, td { border: 1px solid #000; padding: 4px; text-align: left; }
                thead { display: table-header-group; }
                tr { page-break-inside: avoid; }
            </style>
        </head>
        <body>
            <h4>Cronologia de Processos Ativos</h4>
            <table>
                <thead>
                    <tr>
                        <th>Fase</th>
                        <th>Processo</th>
                        <th>Inicio</th>
                        <th>Prazo</th>
                        <th>Termo</th>
                        <th>Dias</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
    `;

    // Copia todas as linhas existentes
    linhas.forEach(tr => {
        html += `<tr>${tr.innerHTML}</tr>`;
    });

    html += `
                </tbody>
            </table>
        </body>
        </html>
    `;

    // Cria uma nova janela para impressão
    const janela = window.open("", "", "width=1000,height=700");
    janela.document.write(html);
    janela.document.close();
    janela.print();
}

async function exportarCronosPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'pt', 'a4');

    // Seleciona todas as linhas
    const linhas = Array.from(document.querySelectorAll("#lstCronos tbody tr"));

    // Monta array de arrays para o autoTable
    const dados = linhas.map(tr => {
        return Array.from(tr.children).map(td => td.innerText.trim());
    });

    // Cabeçalho
    const cabecalho = ["Fase", "Processo", "Início", "Prazo", "Termo", "Dias", "Estado"];

    doc.text("Cronologia dos Processos Ativos", 40, 30);

    doc.autoTable({
        head: [cabecalho],
        body: dados,
        startY: 50,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [0, 0, 255] },
        margin: { top: 40, left: 20, right: 20 }
    });

    doc.save("cronosProcessos.pdf");
}


function exportarCronosExcel() {
    const linhas = Array.from(document.querySelectorAll("#lstCronos tbody tr"));

    // Cria array de arrays com o conteúdo
    const dados = linhas.map(tr => {
        return Array.from(tr.children).map(td => td.innerText.trim());
    });

    // Adiciona cabeçalho
    dados.unshift(["Fase", "Processo", "Início", "Prazo", "Termo", "Dias", "Estado"]);

    // Converte para workbook
    const ws = XLSX.utils.aoa_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cronologia");

    XLSX.writeFile(wb, "cronosProcessos.xlsx");
}

// VISTORIAS
function imprimirVistorias() {
    // Seleciona todas as linhas do tbody gerado pelo renderVistorias()
    const linhas = Array.from(document.querySelectorAll("#lstVistorias tbody tr"));

    // Começa o HTML da tabela de impressão
    let html = `
        <html>
        <head>
            <title>Relação de Vistorias Vencidas e Vincendas</title>
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h4 { margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; }
                th, td { border: 1px solid #000; padding: 4px; text-align: left; }
                thead { display: table-header-group; }
                tr { page-break-inside: avoid; }
            </style>
        </head>
        <body>
            <h4>Relação de Vistorias Vencidas e Vincendas</h4>
            <table>
                <thead>
                    <tr>
                        <th>Entidade</th>
                        <th>Estado</th>
                        <th>Processo</th>
                        <th>Previsto</th>
                        <th>Dias</th>
                    </tr>
                </thead>
                <tbody>
    `;

    // Copia todas as linhas existentes
    linhas.forEach(tr => {
        html += `<tr>${tr.innerHTML}</tr>`;
    });

    html += `
                </tbody>
            </table>
        </body>
        </html>
    `;

    // Cria uma nova janela para impressão
    const janela = window.open("", "", "width=1000,height=700");
    janela.document.write(html);
    janela.document.close();
    janela.print();
}

async function exportarVistoriasPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'pt', 'a4');

    // Seleciona todas as linhas
    const linhas = Array.from(document.querySelectorAll("#lstVistorias tbody tr"));

    // Monta array de arrays para o autoTable
    const dados = linhas.map(tr => {
        return Array.from(tr.children).map(td => td.innerText.trim());
    });

    // Cabeçalho
    const cabecalho = ["Entidade", "Estado", "Processo", "Previsto", "Dias"];

    doc.text("Lista de Vistorias", 40, 30);

    doc.autoTable({
        head: [cabecalho],
        body: dados,
        startY: 50,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [0, 0, 255] },
        margin: { top: 40, left: 20, right: 20 }
    });

    doc.save("vistoriasProcessos.pdf");
}

function exportarVistoriasExcel() {
    const linhas = Array.from(document.querySelectorAll("#lstVistorias tbody tr"));

    // Cria array de arrays com o conteúdo
    const dados = linhas.map(tr => {
        return Array.from(tr.children).map(td => td.innerText.trim());
    });

    // Adiciona cabeçalho
    dados.unshift(["Entidade", "Estado", "Processo", "Previsto", "Dias"]);

    // Converte para workbook
    const ws = XLSX.utils.aoa_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vistorias");

    XLSX.writeFile(wb, "vistoriasProcessos.xlsx");
}

// ESTADIOS DE PROCESSOS
function imprimirEmValidacao() {
    // Seleciona todas as linhas do tbody gerado pelo renderBaseGov()
    const linhas = Array.from(document.querySelectorAll("#documentosPendentes tbody tr"));

    // Começa o HTML da tabela de impressão
    let html = `
        <html>
        <head>
            <title>Relação de Processos a Aguardar Alteração de Estado>
            <link href="../../vendors/bootstrap/bootstrap.min.css" rel="stylesheet" type="text/css">
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h4 { margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; }
                th, td { border: 1px solid #000; padding: 4px; text-align: left; }
                thead { display: table-header-group; }
                tr { page-break-inside: avoid; }
            </style>
        </head>
        <body>
            <h4>Relação de Processos a Aguardar Validação</h4>
            <table>
                <thead>
                    <tr>
                        <th>Pendente</th>    
                        <th>Entidade</th>
                        <th>Fase</th>
                        <th>Processo</th>
                        <th>Dias</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
    `;

    // Copia todas as linhas existentes
    linhas.forEach(tr => {
        html += `<tr>${tr.innerHTML}</tr>`;
    });

    html += `
                </tbody>
            </table>
        </body>
        </html>
    `;

    // Cria uma nova janela para impressão
    const janela = window.open("", "", "width=1000,height=700");
    janela.document.write(html);
    janela.document.close();
    janela.print();
}

async function criarPendentesPDF() {

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'pt', 'a4');

    let motivoAnterior = null;
    const dados = [];

    processosPendentes.forEach(proc => {

        const motivoAtual = proc.historico_pendente_motivo;

        // Cabeçalho do grupo
        if (motivoAtual !== motivoAnterior) {

            dados.push([
                {
                    content: motivoAtual,
                    colSpan: 8,
                    styles: {
                        fillColor: [230, 230, 230],
                        textColor: 0,
                        fontStyle: 'bold'
                    }
                }
            ]);

            motivoAnterior = motivoAtual;
        }

        // Linha de dados
        dados.push([
            "",
            formatarData(proc.dataBase),
            proc.diasAtraso,
            proc.textoBadge,
            proc.entidade === "Multi Fornecedor"
                ? proc.entidade2
                : proc.entidade,
            proc.proces_nome,
            `${proc.movimento}${proc.historico_notas ? `, ${proc.historico_notas}` : ""}`,
            proc.historico_pendente_colaborador ?? ""
        ]);

    });

    doc.text(
        "Documentos a Aguardar Alteração de Estado - Pendentes",
        40,
        30
    );

    doc.autoTable({

        head: [[
            "Motivo",
            "Registo",
            "Dias",
            "Estado",
            "Entidade",
            "Processo",
            "Fase / Documento",
            "Colaborador"
        ]],

        body: dados,

        startY: 50,

        styles: {
            fontSize: 8,
            cellPadding: 4
        },

        headStyles: {
            fillColor: [0, 0, 255],
            textColor: 255,
            fontStyle: 'bold'
        },

        margin: {
            top: 40,
            left: 20,
            right: 20
        },

        didDrawPage(data) {

            const pageHeight = doc.internal.pageSize.height;

            doc.setFontSize(10);
            doc.setTextColor(100);

            doc.text(
                "*BaseGov, por norma, a publicação deve ser feita até 20 dias após o último estádio de vínculo",
                data.settings.margin.left,
                pageHeight - 10
            );

        }

    });

    return doc;

}

async function previewPendentesPDF() {
    try {
        const doc = await criarPendentesPDF();
        window.open(doc.output("bloburl"), "_blank");
    }
    catch (erro) {
        console.error(erro);
        alert("Erro ao gerar o PDF.");
    }

}
async function exportarPendentesPDF() {
    try {
        const doc = await criarPendentesPDF();
        doc.save("documentosPendentes.pdf");
    }
    catch (erro) {
        console.error(erro);
        alert("Erro ao gerar o PDF.");
    }

}

function exportarPendentesExcel() {

    const dados = processosPendentes.map(proc => ({

        Motivo: proc.historico_pendente_motivo,
        DataSituacao: formatarData(proc.dataBase),
        Dias: proc.diasAtraso,
        Estado: proc.textoBadge,
        Entidade: proc.entidade,
        Processo: proc.proces_nome,
        Fase: `${proc.movimento}${proc.historico_notas ? ", " + proc.historico_notas : ""}`,
        Colaborador: proc.historico_pendente_colaborador ?? ""

    }));


    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    
    XLSX.utils.book_append_sheet(wb, ws, "Pendentes");
    XLSX.writeFile(wb, "documentosPendentes.xlsx");

}

const Exportador = {

    // =========================
    // ENTRY POINT
    // =========================
    async exportar(tipo) {
  
      try {
  
        const url = `../aquisicoes/dados/apiPresenciais.php?tipo=${tipo}`;
  
        const res = await fetch(url);
        const data = await res.json();
  
        if (data.erro) {
          throw new Error(data.mensagem);
        }
  
        const ano = new Date().getFullYear();
        const filename = tipo === 'presenciais' ? `Presenciais_${ano}` : `Outros_Gastos_${ano}`;
  
        this.exportToExcel(data, filename);
  
      } catch (err) {
        console.error(err);
        alert('Erro na exportação');
      }
    },
  
    // =========================
    // EXCEL EXPORT
    // =========================
    exportToExcel(data, filename) {
  
      const wb = XLSX.utils.book_new();
  
      const rows = data.map(item => ({
        Aquisicao: item.historico_descr_nome,
        ProcessoNome: item.proces_nome,
        Regime: item.proced_regime,
        Contrato: item.proced_contrato,
        Rubrica: item.rub_rubrica,
        TipoRubrica: item.rub_tipo,
        Entidade: item.ent_nome,
        Data: item.historico_dataemissao,
        Documento: item.historico_doc,
        Numero: item.historico_num,
        Valor: item.historico_valor,
        Observacoes: item.historico_obs
        
      }));
  
      const ws = XLSX.utils.json_to_sheet(rows);
  
      XLSX.utils.book_append_sheet(wb, ws, 'Dados');
      XLSX.writeFile(wb, `${filename}.xlsx`);
    }
  
  };
  
  // =========================
  // CLICK GLOBAL MENU
  // =========================
  document.addEventListener('click', function (e) {
  
    const el = e.target.closest('.menu-api');
    if (!el) return;
  
    const tipo = el.dataset.api;
  
    if (tipo === 'presenciais') {
      Exportador.exportar('presenciais');
    }
  
    if (tipo === 'outros') {
      Exportador.exportar('outros');
    }
  
  });

    function formatDate(data) {
        const [dia, mes, ano] = data.split('-');
        return new Date(ano, mes - 1, dia);
    }

    function formatarData(data) {

        if (!data) {
            return "—";
        }

        const date = data instanceof Date
            ? data
            : new Date(data);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleDateString(
            "pt-PT",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );
    }