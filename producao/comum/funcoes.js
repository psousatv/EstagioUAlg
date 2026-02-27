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
            <link href="vendors/bootstrap/bootstrap.min.css" rel="stylesheet" type="text/css">
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
                        <th>Estado</th>
                        <th>Processo</th>
                        <th>Inicio</th>
                        <th>Prazo</th>
                        <th>Termo</th>
                        <th>Faltam</th>
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
    const cabecalho = ["Estado", "Processo", "Início", "Prazo", "Termo", "Faltam"];

    doc.text("Cronologia dos Processos Ativos", 40, 30);

    doc.autoTable({
        head: [cabecalho],
        body: dados,
        startY: 50,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [220, 220, 220] },
        margin: { top: 40, left: 20, right: 20 }
    });

    doc.save("vistoriasCronosProcessos.pdf");
}

// VISTORIAS
function exportarCronosExcel() {
    const linhas = Array.from(document.querySelectorAll("#lstCronos tbody tr"));

    // Cria array de arrays com o conteúdo
    const dados = linhas.map(tr => {
        return Array.from(tr.children).map(td => td.innerText.trim());
    });

    // Adiciona cabeçalho
    dados.unshift(["Estado", "Processo", "Início", "Prazo", "Termo", "Faltam"]);

    // Converte para workbook
    const ws = XLSX.utils.aoa_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cronologia");

    XLSX.writeFile(wb, "CronosProcessos.xlsx");
}

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
                        <th>Faltam</th>
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
    const cabecalho = ["Entidade", "Estado", "Processo", "Previsto", "Faltam"];

    doc.text("Lista de Vistorias", 40, 30);

    doc.autoTable({
        head: [cabecalho],
        body: dados,
        startY: 50,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [220, 220, 220] },
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
    dados.unshift(["Entidade", "Estado", "Processo", "Previsto", "Faltam"]);

    // Converte para workbook
    const ws = XLSX.utils.aoa_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vistorias");

    XLSX.writeFile(wb, "vistoriasProcessos.xlsx");
}
