fetch('dados/orcamentoNested2.php')
    .then(res => res.json())
    .then(data => renderTabela(data));

function renderTabela(data) {

    console.table(data);

    if (!data.length) return;

    const rubrica = data[0];

    // Título
    document.getElementById('tituloRubrica').innerHTML =
        `Rubrica <strong>${rubrica.rub_cod}</strong> — ${rubrica.rub_rubrica}`;

    let html = `
    <table class="table table-bordered table-sm">
        <thead class="table-dark">
            <tr>
                <th>Descrição</th>
                <th class="text-end">Previsto</th>
                <th class="text-end">Faturado</th>
                <th class="text-end">Saldo</th>
                <th class="text-end">% Execução</th>
            </tr>
        </thead>
        <tbody>
    `;

    // NÍVEL 1 — RUB_ITEM
    html += `
        <tr class="table-primary fw-bold">
            <td>${rubrica.rub_item}</td>
            <td class="text-end">${fmt(rubrica.total_previsto)}</td>
            <td class="text-end">${fmt(rubrica.total_faturado)}</td>
            <td class="text-end">${fmt(rubrica.saldo)}</td>
            <td class="text-end">${rubrica.percentagem_execucao}%</td>
        </tr>
    `;

    // NÍVEL 2 — ORÇAMENTOS
    rubrica.orcamentos.forEach(orc => {

        html += `
        <tr class="table-light">
            <td class="ps-4">
                <i class="bi bi-folder"></i>
                Orçamento ${orc.orc_check}
            </td>
            <td class="text-end">${fmt(orc.orc_valor_previsto)}</td>
            <td class="text-end">${fmt(orc.total_faturado)}</td>
            <td class="text-end">${fmt(orc.saldo)}</td>
            <td class="text-end">${orc.percentagem_execucao}%</td>
        </tr>
        `;

        // NÍVEL 3 — PROCESSOS + FATURAS
        orc.processos.forEach(proc => {

            html += `
            <tr>
                <td class="ps-5 fw-semibold">
                    Processo ${proc.proces_check} — ${proc.proces_nome ?? ''}
                </td>
                <td></td>
                <td class="text-end">${fmt(proc.total_faturado)}</td>
                <td></td>
                <td></td>
            </tr>
            `;

            proc.faturas.forEach(f => {
                html += `
                <tr class="table-secondary">
                    <td class="ps-6">
                        Fatura ${f.fact_num} (${f.fact_data})
                    </td>
                    <td></td>
                    <td class="text-end">${fmt(f.fact_valor)}</td>
                    <td></td>
                    <td></td>
                </tr>
                `;
            });
        });
    });

    html += `</tbody></table>`;

    document.getElementById('tabelaContainer').innerHTML = html;
}

function fmt(valor) {
    return Number(valor).toLocaleString('pt-PT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}
