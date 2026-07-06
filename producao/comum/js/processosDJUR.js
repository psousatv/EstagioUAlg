document.addEventListener("DOMContentLoaded", () => {
    loadBaseGov();
});

async function loadBaseGov() {

    try {
        const response =  await fetch("producao/comum/dados/processosDJUR.php");
        const text =  await response.text();
        const processos = JSON.parse(text);

        if (!Array.isArray(processos)) {
            throw new Error("Resposta não é um array JSON válido.");
        }

        renderBaseGov(processos);

    } catch (error) {
        console.error("Erro ao carregar os Dados:", error);
        document.getElementById("lstBaseGov").innerHTML =
            `<div class="text-danger">Erro ao carregar dados.</div>`;
    }
}

function renderBaseGov(processos) {

    const container = document.getElementById("lstBaseGov");
    container.innerHTML = "";

    const hoje = new Date();

    const lista = processos.map(proc => {

        const prazo = parseInt(proc.proces_prz_exec) || 0;

        const dataAgendamento = proc.agendamento
            ? new Date(proc.agendamento + "T00:00:00")
            : null;

        // Prioridade: Consignacao > Contrato > Adjudicacao > Hoje
        const dataBase = dataAgendamento || hoje;

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
        <table class="table table-sm table-hover table-bordered align-middle">
            <thead class="thead-light" style="position: sticky; top: 0; z-index: 10;">
                <tr class="small">
                    <th style="width: 100px;">Entidade</th>
                    <th style="width: 75px;">Estado</th>
                    <th>Processo</th>
                    <th style="width: 75px;">Preparado</th>   <!-- largura fixa -->
                    <th style="width: 50px;">Passaram</th>
                    
                </tr>
            </thead>
            <tbody>
    `;

    lista.forEach(proc => {

    html += `
        <tr class="small">
            <td style="width: 50px;">${proc.entidade}</td>
            <td style="width: 75px;">
                <span class="badge ${proc.classeBadge}">
                    ${proc.textoBadge}
                </span>
            </td>
            <td>${proc.proces_nome}</td>
            <td style="width: 75px;">${formatDate(proc.dataBase)}</td>
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

