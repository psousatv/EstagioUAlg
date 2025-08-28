// URL do endpoint PHP
const API_URL = 'dados/orcamentoDashboard.php';

// Faz o fetch dos dados
fetch(API_URL)
    .then(response => response.json())
    .then(data => {
        if (data.status !== "Successo") throw new Error("Erro ao carregar dados");

        const { orcamento } = data.dados;

        // Chama as funções de renderização
        cartoesInvestimento(orcamento);
        cartoesGastos(orcamento);
    })
    .catch(err => {
        document.getElementById('cartoesInvestimentos').innerHTML =
            `<div class="alert alert-danger">Erro: ${err.message}</div>`;
        document.getElementById('cartoesGastos').innerHTML =
            `<div class="alert alert-danger">Erro: ${err.message}</div>`;
    });

// Função genérica que gera os cartões
function gerarCartoes(rubricas, titulo, corCard) {
    const totalPrevisto = rubricas.reduce((soma, rub) => soma + (rub.valor_previsto ?? 0), 0);

    const totalCartao = `
        <div class="col-12 mb-3">
            <div class="card bg-info text-white h-100 d-flex flex-column justify-content-center">
                <div class="card-body text-center">
                    <h5>${titulo}</h5>
                    <h3>${totalPrevisto.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</h3>
                </div>
            </div>
        </div>
        <h1 class="mt-2"></h1>
    `;

    const cartoesHtml = rubricas.map(rub => `
        <div class="card col-md-3 ${corCard} text-white">
            <div class="d-flex justify-content-between px-md-1>
                <div class="text-end">
                    <p class="mb-0 small text-white">${rub.rubrica}</p>
                    <h3>
                        ${rub.valor_faturado?.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) ?? '—'}
                        <span class="h6">- ${(rub.percentagem ?? 0).toFixed(2)}%</span>
                    </h3>
                    <h6>
                        ${rub.valor_previsto?.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) ?? '—'}
                    </h6>
                </div>
                <div class="align-self-center">
                    <i class="fas fa-smile fa-3x"></i>
                </div>
            </div>
        </div>
    `).join('');

    return `<div class="row">${totalCartao}<br>${cartoesHtml}</div>`;
}

// Função que renderiza os investimentos
function cartoesInvestimento(orcamento) {
    const containerInvestimentos = document.getElementById('cartoesInvestimentos');
    const investimentos = Object.values(orcamento).flat().filter(rub => rub.tipo === 'Investimento');
    containerInvestimentos.innerHTML = gerarCartoes(investimentos, "Investimentos", "bg-primary");
}

// Função que renderiza os gastos
function cartoesGastos(orcamento) {
    const containerGastos = document.getElementById('cartoesGastos');
    const gastos = Object.values(orcamento).flat().filter(rub => rub.tipo === 'Gastos');
    containerGastos.innerHTML = gerarCartoes(gastos, "Gastos", "bg-secondary");
}
