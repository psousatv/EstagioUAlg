let processosPendentes = [];

document.addEventListener("DOMContentLoaded", () => {
    loadValidacoes();
});

async function loadValidacoes() {

    try {

        const response = await fetch("producao/comum/dados/documentosPendentes.php");
        const processos = await response.json();

        if (!Array.isArray(processos)) {
            throw new Error("Resposta inválida.");
        }

        processosPendentes = prepararDados(processos);

        renderValidacao();

    } catch (error) {

        console.error("Erro ao carregar os dados:", error);

        document.getElementById("documentosPendentes").innerHTML =
            `<div class="text-danger">Erro ao carregar dados.</div>`;
    }

}

// ==========================================================
// Prepara os dados apenas uma vez
// ==========================================================

function prepararDados(processos) {

    const hoje = new Date();

    return processos.map(proc => {

        const prazo = 15;

        const dataPendente = proc.historico_pendente_data
            ? new Date(proc.historico_pendente_data + "T00:00:00")
            : null;

        const dataBase = dataPendente || hoje;

        const dataTermo = new Date(dataBase);
        dataTermo.setDate(dataTermo.getDate() + prazo);

        const diasAtraso = Math.ceil(
            (hoje - dataTermo) / (1000 * 60 * 60 * 24)
        );

        let textoBadge = "";
        let classeBadge = "";

        if (diasAtraso <= 10) {

            textoBadge = "Em dia";
            classeBadge = "badge-success";

        } else if (diasAtraso <= 15) {

            textoBadge = "A Terminar";
            classeBadge = "badge-warning";

        } else {

            textoBadge = "Fora Prazo";
            classeBadge = "badge-danger";

        }

        return {
            ...proc,
            prazo,
            dataBase,
            dataTermo,
            diasAtraso,
            textoBadge,
            classeBadge
        };

    });

}

// ==========================================================
// Render da tabela
// ==========================================================

function renderValidacao() {

    const container = document.getElementById("documentosPendentes");

    let html = `
    <div class="table-responsive" style="max-height:200px;overflow-y:auto;">
        <table class="table table-sm table-hover table-bordered align-middle w-100">

            <thead class="table-light sticky-top">

                <tr class="small">

                    <th>Motivo</th>
                    <th class="text-center">Data Situação</th>
                    <th class="text-center">Dias</th>
                    <th class="text-center">Estado</th>
                    <th>Entidade</th>
                    <th>Processo</th>
                    <th>Fase</th>
                    <th>Colaborador</th>

                </tr>

            </thead>

            <tbody>
    `;

    processosPendentes.forEach(proc => {

        html += `
            <tr class="small">

                <td>${proc.historico_pendente_motivo}</td>

                <td class="text-center">
                    ${formatDate(proc.dataBase)}
                </td>

                <td class="text-center">
                    ${proc.diasAtraso}
                </td>

                <td class="text-center">
                    <span class="badge ${proc.classeBadge}">
                        ${proc.textoBadge}
                    </span>
                </td>

                <td>${proc.entidade === "Multi Fornecedor" ? proc.entidade2 : proc.entidade}</td>

                <td class="text-nowrap">
                    ${proc.proces_nome}
                </td>

                <td>
                    ${proc.movimento}${proc.historico_notas ? ", " + proc.historico_notas : ""}
                </td>

                <td>
                    ${proc.historico_pendente_colaborador ?? ""}
                </td>

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

// ==========================================================
// Formata data
// ==========================================================

function formatDate(date) {

    if (!date)
        return "—";

    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const ano = date.getFullYear();

    return `${dia}-${mes}-${ano}`;

}