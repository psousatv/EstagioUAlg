document.addEventListener("DOMContentLoaded", () => {
    loadValidacoes();
});

async function loadValidacoes() {

    try {
        const response =  await fetch("producao/comum/dados/documentosPendentes.php");
        const text =  await response.text();
        const processos = JSON.parse(text);

        if (!Array.isArray(processos)) {
            throw new Error("Resposta não é um array JSON válido.");
        }

        renderValidacao(processos);

    } catch (error) {
        console.error("Erro ao carregar os Dados:", error);
        document.getElementById("documentosPendentes").innerHTML =
            `<div class="text-danger">Erro ao carregar dados.</div>`;
    }
}

function renderValidacao(processos) {

    const container = document.getElementById("documentosPendentes");
    container.innerHTML = "";

    const hoje = new Date();

    const lista = processos.map(proc => {

        const prazo = parseInt(proc.proces_prz_exec) || 0;

        const dataPendente = proc.historico_pendente_data
            ? new Date(proc.historico_pendente_data + "T00:00:00")
            : null;

        // Prioridade: Consignacao > Contrato > Adjudicacao > Hoje
        const dataBase = dataPendente || hoje;

        const dataTermo = new Date(dataBase);
        dataTermo.setDate(dataTermo.getDate() + prazo);

        const diasRestantes = Math.ceil(
            (hoje - dataTermo) / (1000 * 60 * 60 * 24)
        );

        // Badge
        let textoBadge = "";
        let classeBadge = "";

        if (diasRestantes <= 15) {
            textoBadge = "Em dia";
            classeBadge = "badge-success";
        } else if (diasRestantes > 15 && diasRestantes <= 20) {
            textoBadge = "A Terminar";
            classeBadge = "badge-warning";
        } else {
            textoBadge = "Fora Prazo";
            classeBadge = "badge-danger";
        }

        return {
            ...proc,
            dataBase,
            diasRestantes,
            textoBadge,
            classeBadge
        };

    }).sort((a, b) => a.dataTermo - b.dataTermo);

  // Tabela small + sticky
let html = `
<div class="table-responsive" style="max-height: 200px; overflow-y: auto;">
    <table class="table table-sm table-hover table-bordered align-middle w-100">
        <thead class="table-light sticky-top">
            <tr class="small">
                <th>Entidade</th>
                <th class="text-nowrap">Processo</th>
                <th>Fase</th>
                <th>Motivo</th>
                <th class="text-center">Desde</th>
                <th class="text-center">Dias</th>
                <th class="text-center">Estado</th>
                <th>Colaborador</th>
            </tr>
        </thead>
        <tbody>
`;

lista.forEach(proc => {

    html += `
        <tr class="small">
            <td>${proc.entidade}</td>
            <td class="text-nowrap">${proc.proces_nome}</td>
            <td>${proc.movimento}, ${proc.historico_notas}</td>
            <td>${proc.historico_pendente_motivo}</td>
            <td class="text-center">${formatDate(proc.dataBase)}</td>
            <td class="text-center">${proc.diasRestantes}</td>
            <td class="text-center">
                <span class="badge ${proc.classeBadge}">
                    ${proc.textoBadge}
                </span>
            </td>
            <td>${proc.historico_pendente_colaborador}</td>
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

