let processosPendentes = [];

// ==========================================================
// INICIALIZAÇÃO
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

    const container = document.getElementById("documentosPendentes");

    if (!container) {
        console.error(
            'Não foi encontrado o elemento com o ID "documentosPendentes".'
        );

        return;
    }

    configurarEventosTabela(container);
    loadValidacoes();
});


// ==========================================================
// CARREGAR DADOS
// ==========================================================

async function loadValidacoes() {

    const container = document.getElementById("documentosPendentes");

    mostrarCarregamento(container);

    try {

        const response = await fetch(
            "producao/comum/dados/documentosPendentes.php",
            {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "X-Requested-With": "XMLHttpRequest"
                },
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error(
                `Erro HTTP ${response.status}: ${response.statusText}`
            );
        }

        const processos = await response.json();

        if (!Array.isArray(processos)) {
            throw new Error(
                "A resposta do servidor não contém uma lista válida."
            );
        }

        processosPendentes = prepararDados(processos);

        renderValidacao();

    } catch (error) {

        console.error("Erro ao carregar os dados:", error);

        mostrarErro(
            container,
            "Não foi possível carregar os documentos pendentes."
        );
    }
}


// ==========================================================
// PREPARAR OS DADOS
// ==========================================================

function prepararDados(processos) {

    const hoje = obterDataSemHoras(new Date());

    return processos.map(proc => {

        const prazo = 15;

        const dataPendente = proc.historico_pendente_data
            ? converterDataSQL(proc.historico_pendente_data)
            : null;

        const dataBase = dataPendente || hoje;

        const dataTermo = new Date(dataBase);

        dataTermo.setDate(
            dataTermo.getDate() + prazo
        );

        /*
         * diasAtraso:
         *
         * Valor negativo: ainda faltam dias para terminar o prazo.
         * Valor zero: o prazo termina hoje.
         * Valor positivo: o prazo já terminou.
         */

        const diasAtraso = diferencaDias(
            dataTermo,
            hoje
        );

        let textoBadge;
        let classeBadge;

        if (diasAtraso <= 0) {

            textoBadge = "Em dia";
            classeBadge = "bg-success text-white";
        
        } else if (diasAtraso <= 5) {
        
            textoBadge = "A Terminar";
            classeBadge = "bg-warning text-dark";
        
        } else {
        
            textoBadge = "Fora Prazo";
            classeBadge = "bg-danger text-white";
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
// RENDERIZAR TABELA
// ==========================================================

function renderValidacao() {

    const container = document.getElementById("documentosPendentes");

    if (!container) {
        return;
    }

    if (processosPendentes.length === 0) {

        container.innerHTML = `
            <div class="alert alert-light border mb-0">
                Não existem documentos pendentes.
            </div>
        `;

        return;
    }

    const linhas = processosPendentes
        .map(proc => criarLinhaProcesso(proc))
        .join("");

    container.innerHTML = `
        <div
            class="table-responsive"
            style="max-height: 200px; overflow-y: auto;"
        >
            <table
                class="table table-sm table-hover table-bordered align-middle w-100 mb-0"
            >
                <thead class="table-light sticky-top">
                    <tr class="small">
                        <th>Motivo</th>
                        <th class="text-center">
                            Data Situação
                        </th>
                        <th class="text-center">
                            Dias
                        </th>
                        <th class="text-center">
                            Estado
                        </th>
                        <th>Entidade</th>
                        <th>Processo</th>
                        <th>Fase</th>
                        <th>Colaborador</th>
                    </tr>
                </thead>

                <tbody>
                    ${linhas}
                </tbody>
            </table>
        </div>
    `;
}


// ==========================================================
// CRIAR LINHA DA TABELA
// ==========================================================

function criarLinhaProcesso(proc) {

    const codigoProcesso = proc.proces_check ?? "";

    const entidade = proc.entidade === "Multi Fornecedor"
        ? proc.entidade2
        : proc.entidade;

    const fase = [
        proc.movimento,
        proc.historico_notas
    ]
        .filter(Boolean)
        .join(", ");

    return `
        <tr
            class="small linha-processo"
            data-codigo-processo="${escapeHtml(codigoProcesso)}"
            role="button"
            tabindex="0"
            title="Abrir processo"
            style="cursor: pointer;"
        >
            <td>
                ${escapeHtml(proc.historico_pendente_motivo)}
            </td>

            <td class="text-center text-nowrap">
                ${formatarData(proc.dataBase)}
            </td>

            <td class="text-center">
                ${formatarDias(proc.diasAtraso)}
            </td>

            <td class="text-center text-nowrap">
                <span class="badge ${proc.classeBadge} px-2 py-1 fw-semibold">
                    ${escapeHtml(proc.textoBadge)}
                </span>
            </td>

            <td>
                ${escapeHtml(entidade)}
            </td>

            <td class="text-nowrap">
                ${escapeHtml(proc.proces_nome)}
            </td>

            <td>
                ${escapeHtml(fase)}
            </td>

            <td>
                ${escapeHtml(
                    proc.historico_pendente_colaborador
                )}
            </td>
        </tr>
    `;
}


// ==========================================================
// EVENTOS DA TABELA
// ==========================================================

function configurarEventosTabela(container) {

    container.addEventListener("click", event => {

        const linha = event.target.closest(".linha-processo");

        if (!linha || !container.contains(linha)) {
            return;
        }

        const codigo = linha.dataset.codigoProcesso;

        redirectProcesso(codigo, linha);
    });


    container.addEventListener("keydown", event => {

        if (
            event.key !== "Enter" &&
            event.key !== " "
        ) {
            return;
        }

        const linha = event.target.closest(".linha-processo");

        if (!linha || !container.contains(linha)) {
            return;
        }

        event.preventDefault();

        const codigo = linha.dataset.codigoProcesso;

        redirectProcesso(codigo, linha);
    });
}


// ==========================================================
// ABRIR PROCESSO
// ==========================================================

async function redirectProcesso(codigo, linha = null) {

    if (!codigo) {

        console.error(
            "Código do processo inválido:",
            codigo
        );

        mostrarMensagemTemporaria(
            "Não foi possível identificar o processo.",
            "danger"
        );

        return;
    }

    const codigoSeguro = encodeURIComponent(codigo);

    bloquearLinha(linha, true);

    try {

        const response = await fetch(
            `producao/_search/searchEngine.php?codigoProcesso=${codigoSeguro}`,
            {
                method: "GET",
                headers: {
                    "Accept": "application/json, text/plain, */*",
                    "X-Requested-With": "XMLHttpRequest"
                },
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error(
                `Erro HTTP ${response.status}: ${response.statusText}`
            );
        }

        /*
         * A resposta não é usada diretamente.
         *
         * Esta chamada pode estar a:
         * - validar o processo;
         * - preparar dados;
         * - guardar dados na sessão;
         * - verificar permissões.
         *
         * Após a resposta com sucesso, é efetuado o redirecionamento.
         */

        const url =
            `producao/processos/processoResults.html` +
            `?codigoProcesso=${codigoSeguro}`;

        window.location.assign(url);

    } catch (error) {

        console.error(
            "Erro ao abrir o processo:",
            error
        );

        bloquearLinha(linha, false);

        mostrarMensagemTemporaria(
            "Não foi possível abrir o processo. Tente novamente.",
            "danger"
        );
    }
}


// ==========================================================
// ESTADOS VISUAIS
// ==========================================================

function mostrarCarregamento(container) {

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="text-center py-3">
            <div
                class="spinner-border spinner-border-sm text-primary"
                role="status"
            >
                <span class="visually-hidden">
                    A carregar...
                </span>
            </div>

            <span class="ms-2 small">
                A carregar documentos pendentes...
            </span>
        </div>
    `;
}


function mostrarErro(container, mensagem) {

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="alert alert-danger mb-0">
            ${escapeHtml(mensagem)}
        </div>
    `;
}


function bloquearLinha(linha, bloquear) {

    if (!linha) {
        return;
    }

    if (bloquear) {

        linha.dataset.conteudoOriginal =
            linha.innerHTML;

        linha.style.pointerEvents = "none";
        linha.style.opacity = "0.65";

        linha.setAttribute(
            "aria-busy",
            "true"
        );

    } else {

        linha.style.pointerEvents = "";
        linha.style.opacity = "";

        linha.removeAttribute(
            "aria-busy"
        );
    }
}


function mostrarMensagemTemporaria(
    mensagem,
    tipo = "info"
) {

    const id = "mensagem-validacoes";

    document
        .getElementById(id)
        ?.remove();

    const alerta = document.createElement("div");

    alerta.id = id;

    alerta.className =
        `alert alert-${tipo} ` +
        `alert-dismissible fade show position-fixed`;

    alerta.style.right = "20px";
    alerta.style.bottom = "20px";
    alerta.style.zIndex = "1080";
    alerta.style.maxWidth = "420px";

    alerta.setAttribute(
        "role",
        "alert"
    );

    alerta.innerHTML = `
        ${escapeHtml(mensagem)}

        <button
            type="button"
            class="btn-close"
            data-bs-dismiss="alert"
            aria-label="Fechar"
        ></button>
    `;

    document.body.appendChild(alerta);

    window.setTimeout(() => {
        alerta.remove();
    }, 5000);
}


// ==========================================================
// UTILITÁRIOS DE DATAS
// ==========================================================

function converterDataSQL(data) {

    if (!data) {
        return null;
    }

    /*
     * Aceita:
     * 2026-07-30
     * 2026-07-30 10:30:00
     * 2026-07-30T10:30:00
     */

    const parteData = String(data)
        .trim()
        .substring(0, 10);

    const partes = parteData.split("-");

    if (partes.length !== 3) {
        return null;
    }

    const ano = Number(partes[0]);
    const mes = Number(partes[1]);
    const dia = Number(partes[2]);

    if (
        !ano ||
        !mes ||
        !dia
    ) {
        return null;
    }

    const resultado = new Date(
        ano,
        mes - 1,
        dia
    );

    return Number.isNaN(resultado.getTime())
        ? null
        : resultado;
}


function obterDataSemHoras(data) {

    return new Date(
        data.getFullYear(),
        data.getMonth(),
        data.getDate()
    );
}


function diferencaDias(dataInicial, dataFinal) {

    const inicio = obterDataSemHoras(dataInicial);
    const fim = obterDataSemHoras(dataFinal);

    const milissegundosPorDia =
        1000 * 60 * 60 * 24;

    return Math.round(
        (fim - inicio) / milissegundosPorDia
    );
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


function formatarDias(diasAtraso) {

    if (!Number.isFinite(diasAtraso)) {
        return "—";
    }

    if (diasAtraso === 0) {
        return "Hoje";
    }

    if (diasAtraso < 0) {

        const diasRestantes =
            Math.abs(diasAtraso);

        return `${diasRestantes}`;
    }

    return `+${diasAtraso}`;
}


// ==========================================================
// UTILITÁRIOS DE FORMATAÇÃO
// ==========================================================

function formatarEuro(valor) {

    const numero = Number(valor) || 0;

    return new Intl.NumberFormat(
        "pt-PT",
        {
            style: "currency",
            currency: "EUR"
        }
    ).format(numero);
}


function escapeHtml(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {
        return "";
    }

    return String(valor)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}