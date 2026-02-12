document.addEventListener("DOMContentLoaded", () => {
    loadCronos();
});

async function loadCronos() {

    try {
        const response = await fetch("producao/comum/dados/cronosProcessos.php");
        const text = await response.text();
        const processos = JSON.parse(text);

        if (!Array.isArray(processos)) {
            throw new Error("Resposta não é um array JSON válido.");
        }

        renderCronos(processos);

    } catch (error) {
        console.error("Erro ao carregar cronos:", error);
        document.getElementById("lstCronos").innerHTML =
            `<div class="text-danger">Erro ao carregar dados.</div>`;
    }
}

function renderCronos(processos) {

    const container = document.getElementById("lstCronos");
    container.innerHTML = "";

    const hoje = new Date();

    const lista = processos.map(proc => {

        const prazo = parseInt(proc.proces_prz_exec) || 0;

        const dataAdjudicacao = proc.proces_data_adjudicacao
            ? new Date(proc.proces_data_adjudicacao + "T00:00:00")
            : null;

        const dataContrato = proc.proces_data_contrato
            ? new Date(proc.proces_data_contrato + "T00:00:00")
            : null;

        const dataConsignacao = proc.proces_data_csgn
            ? new Date(proc.proces_data_csgn + "T00:00:00")
            : null;

        // Prioridade: Consignacao > Contrato > Adjudicacao > Hoje
        const dataBase = dataConsignacao || dataContrato || dataAdjudicacao || hoje;

        const dataTermo = new Date(dataBase);
        dataTermo.setDate(dataTermo.getDate() + prazo);

        const diasRestantes = Math.ceil(
            (dataTermo - hoje) / (1000 * 60 * 60 * 24)
        );

        // Badge
        let textoBadge = "";
        let classeBadge = "";

        if (diasRestantes < 0) {
            textoBadge = "Vencida";
            classeBadge = "badge-danger";
        } else if (diasRestantes <= 10) {
            textoBadge = "Prorrogar";
            classeBadge = "badge-warning";
        } else if (diasRestantes <= 30) {
            textoBadge = "Atenção";
            classeBadge = "badge-info";
        } else {
            textoBadge = "Conforme";
            classeBadge = "badge-success";
        }

        return {
            ...proc,
            dataAdjudicacao,
            dataContrato,
            dataConsignacao,
            prazo,
            dataBase,
            dataTermo,
            diasRestantes,
            textoBadge,
            classeBadge
        };

    }).sort((a, b) => a.dataTermo - b.dataTermo);

   // Tabela small + sticky
    let html = `
    <div class="table-responsive" style="max-height: 200px; overflow-y: auto;">
        <table class="table table-sm table-hover table-bordered align-middle">
            <thead class="thead-light" style="position: sticky; top: 0; z-index: 10;">
                <tr class="small">
                    <th style="width: 75px;">Estado</th>
                    <th>Processo</th>
                    <th style="width: 75px;">Início</th>   <!-- largura fixa -->
                    <th style="width: 50px;" class="text-end">Prazo</th>
                    <th style="width: 75px;">Termo</th>   <!-- largura fixa -->
                    <th style="width: 50px;">Faltam</th>
                    
                </tr>
            </thead>
            <tbody>
    `;

    lista.forEach(proc => {
    html += `
        <tr class="small">
            <td style="width: 75px;">
                <span class="badge ${proc.classeBadge}">
                    ${proc.textoBadge}
                </span>
            </td>
            <td>${proc.proces_nome}</td>
            <td style="width: 75px;">${formatDate(proc.dataBase)}</td>
            <td style="width: 50px;" class="text-end">${proc.prazo}</td>
            <td style="width: 75px;">${formatDate(proc.dataTermo)}</td>
            <td style="width: 50px;">${proc.diasRestantes}</td>
            
        </tr>
    `;
    });

    html += `
            </tbody>
        </table>
    </div>
    `;


    container.innerHTML = html;
}

function formatDate(date) {
    if (!date) return "—";
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();
    return `${dia}-${mes}-${ano}`;
}
