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

        //console.table(proc);

        // =========================
        // PRAZO
        // =========================
        const prazo = parseInt(proc.proces_prz_exec) || 0;

        // =========================
        // DATAS (FORMATO ISO DO PHP)
        // =========================
        const dataAdjudicacao = proc.data_adjudicacao
            ? new Date(proc.data_adjudicacao)
            : null;

        const dataContrato = proc.data_contrato
            ? new Date(proc.data_contrato)
            : null;

        const dataConsignacao = proc.data_consignacao
            ? new Date(proc.data_consignacao)
            : null;

        const dataPSeguranca = proc.data_pss
            ? new Date(proc.data_pss)
            : null;

        // =========================
        // DATA BASE
        // =========================
        let dataBase = hoje;

        /*
            REGRA:

            - Se PSeguranca existe e é posterior à Consignacao → usa PSeguranca
            - Caso contrário → usa Consignacao
            - Fallback → Contrato → Adjudicação → Hoje
        */
        if (proc.proces_cpv_sigla === "SF") {
                dataBase = dataAdjudicacao || hoje;
        } else if (proc.proces_cpv_sigla === "EMP") {
            if (
                dataPSeguranca &&
                dataConsignacao &&
                dataPSeguranca > dataConsignacao
            ) {
                dataBase = dataPSeguranca;
            } else if (dataConsignacao) {
                dataBase = dataConsignacao;
            } else if (dataContrato) {
                dataBase = dataContrato;
            } else if (dataAdjudicacao) {
                dataBase = dataAdjudicacao;
            }
        }

        // =========================
        // DATA TERMO
        // =========================
        const dataTermo = new Date(dataBase);
        dataTermo.setDate(dataTermo.getDate() + prazo);

        // =========================
        // DIAS RESTANTES
        // =========================
        const diasRestantes = Math.ceil(
            (dataTermo - hoje) / (1000 * 60 * 60 * 24)
        );

        // =========================
        // BADGES
        // =========================
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
            prazo,
            dataAdjudicacao,
            dataContrato,
            dataConsignacao,
            dataPSeguranca,
            dataBase,
            dataTermo,
            diasRestantes,
            textoBadge,
            classeBadge
        };

    }).sort((a, b) => a.dataTermo - b.dataTermo);

    // =========================
    // TABELA
    // =========================
    let html = `
    <div class="table-responsive" style="max-height: 200px; overflow-y: auto;">
        <table class="table table-sm table-hover table-bordered align-middle">

            <thead class="thead-light"
                   style="position: sticky; top: 0; z-index: 10;">

                <tr class="small">

                    <th style="width: 75px;">Estado</th>
                    <th>Processo</th>
                    <th style="width: 90px;">Início</th>
                    <th style="width: 50px;" class="text-end">Prazo</th>
                    <th style="width: 90px;">Termo</th>
                    <th style="width: 60px;">Faltam</th>

                </tr>

            </thead>

            <tbody>
    `;

    lista.forEach(proc => {

        html += `
            <tr class="small">

                <td>
                    <span class="badge ${proc.classeBadge}">
                        ${proc.textoBadge}
                    </span>
                </td>
                <td>${proc.proces_nome}</td>
                <td>${formatDate(proc.dataBase)}</td>
                <td class="text-end">${proc.prazo}</td>
                <td>${formatDate(proc.dataTermo)}</td>
                <td>${proc.diasRestantes}</td>
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

// =========================
// FORMAT DATE (de-DE)
// =========================
function formatDate(date) {

    if (!date) return "—";

    return new Intl.DateTimeFormat('de-DE').format(date);
}