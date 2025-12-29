// =======================
// Variáveis globais
// =======================
let grafico = null;
let allData = [];
let dadosGrafico = [];
let dadosOriginais = []; // dados vindos do backend

// =======================
// Inicialização
// =======================
document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
});

// =======================
// Fetch de dados
// =======================
async function carregarDados() {
    try {
        const response = await fetch('dados/main.php');

        if (!response.ok) throw new Error('Erro ao carregar dados');

        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Formato de dados inválido');

        dadosOriginais = validarDados(data);

        // Inicializa dashboard com todos os dados
        atualizarDashboard(dadosOriginais);

    } catch (error) {
        console.error(error);
        alert('Erro ao carregar os dados.');
    }
}

// =======================
// Validação de dados
// =======================
function validarDados(data) {
    return data.map(item => ({
        contrato: item.contrato ?? 'N/D',
        adjudicado: Number(item.adjudicado) || 0,
        faturado: Number(item.faturado) || 0,
        percent: Number(item.percent) || 0
    }));
}

// =======================
// Atualiza todo o dashboard
// =======================
function atualizarDashboard(data) {
    allData = [...data];
    dadosGrafico = data.map(d => [d.contrato, d.adjudicado, d.faturado]);

    inicializarTabela(data);
    criarGrafico(data);
    criarCartoes(data);
}

// =======================
// DataTable
// =======================
function inicializarTabela(data) {
    $('#tabela').DataTable({
        destroy: true,
        data: data,
        columns: [
            { data: 'contrato' },
            { data: 'adjudicado', className: 'dt-body-right', render: renderMoeda },
            { data: 'faturado', className: 'dt-body-right', render: renderMoeda },
            { data: 'percent', className: 'dt-body-right', render: d => `${d}%` }
        ]
    });
}

// =======================
// Gráfico Misto (barra + linha) com acumulado
// =======================
function calcularAcumulado(data, campo) {
    let total = 0;
    return data.map(item => total += item[campo]);
}

function criarGrafico(data) {
    const labels = data.map(d => d.contrato);

    const adjudicadoAcum = calcularAcumulado(data, 'adjudicado');
    const faturadoAcum = calcularAcumulado(data, 'faturado');

    if (grafico) grafico.destroy();

    grafico = new Chart(document.getElementById('grafico'), {
        data: {
            labels: labels,
            datasets: [
                {
                    type: 'bar',
                    label: 'Adjudicado (Acumulado)',
                    data: adjudicadoAcum,
                    backgroundColor: 'rgba(178, 34, 34, 0.4)'
                },
                {
                    type: 'line',
                    label: 'Faturado (Acumulado)',
                    data: faturadoAcum,
                    borderColor: 'rgba(3, 100, 255, 0.9)',
                    backgroundColor: 'rgba(3, 100, 255, 0.1)',
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// =======================
// Cartões
// =======================
function criarCartoes(data) {
    const container = document.getElementById('cartoesEsquerdaGrafico');
    container.innerHTML = '';

    const fragment = document.createDocumentFragment();

    data.forEach(item => {
        const { classe, icone } = obterClasseCartao(item.percent);

        const div = document.createElement('div');
        div.innerHTML = `
        <div class="col-md-12 stretch-card pb-sm-3">
            <div class="card ${classe}">
                <div class="card-body">
                    <div class="d-flex justify-content-between px-md-1">
                        <div class="text-end">
                            <p class="mb-0 text-white"
                               onclick="redirectTipoProcesso('${item.contrato}')">
                               ${item.contrato}
                            </p>
                            <h6>${formatarMoeda(item.faturado)} <span>- ${item.percent}%</span></h6>
                            <h6>${formatarMoeda(item.adjudicado)}</h6>
                        </div>
                        <div class="align-self-center">
                            <i class="fas ${icone} fa-3x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
        fragment.appendChild(div);
    });

    container.appendChild(fragment);
}

function obterClasseCartao(percent) {
    if (percent < 10) return { classe: 'bg-danger text-white', icone: 'fa-thumbs-down' };
    if (percent < 35) return { classe: 'bg-warning text-black', icone: 'fa-warning' };
    if (percent < 75) return { classe: 'bg-primary text-white', icone: 'fa-cog fa-spin' };
    return { classe: 'bg-success text-white', icone: 'fa-smile' };
}

// =======================
// Helpers
// =======================
function formatarMoeda(valor) {
    return `${valor.toLocaleString('pt-PT')} €`;
}

function renderMoeda(data) {
    return formatarMoeda(Number(data));
}

// =======================
// Redirecionamento
// =======================
function redirectTipoProcesso(tipoProcesso) {
    const url = (tipoProcesso === 'Empreitada')
        ? '../obras/obrasSearch.html'
        : '../servicos/servicosSearch.html';

    window.location.href = url;
}
