const url = "dados/fornecedoresVistorias.php";

let resultados = [];

/* ============================================================
   Inicialização
============================================================ */

document.addEventListener("DOMContentLoaded", vistorias);

/* ============================================================
   Carregar dados
============================================================ */

async function vistorias() {

    try {

        const response = await fetch(url);

        if (!response.ok)
            throw new Error(response.statusText);

        resultados = await response.json();

        document.getElementById("lstErros").style.display = "none";

        const listas = classificarVistorias(resultados);

        renderizarLista("vencido", listas.vencidas, "danger");
        renderizarLista("programado", listas.programadas, "success");
        renderizarLista("agendado", listas.agendadas, "primary");

        actualizarContadores(listas);

    }
    catch (erro) {

        const erros = document.getElementById("lstErros");

        erros.style.display = "block";
        erros.innerHTML = erro.message;

    }

}

/* ============================================================
   Classificação
============================================================ */

function classificarVistorias(lista) {

    const hoje = new Date();

    const actual =
        hoje.getFullYear() * 100 +
        (hoje.getMonth() + 1);

    const resultado = {
        vencidas: [],
        programadas: [],
        agendadas: []
    };

    lista.forEach(item => {

        item.provisoria = item.provisoria || "n.a.";

        const ano = Number(item.ano);
        const mes = Number(item.mes);

        if (item.obs === "Agendado") {

            resultado.agendadas.push(item);
            return;

        }

        if (item.doc === "Programado" &&
            item.obs === "Programado") {

            const data = ano * 100 + mes;

            if (data < actual)
                resultado.vencidas.push(item);
            else
                resultado.programadas.push(item);

        }

    });

    return resultado;

}

/* ============================================================
   Card
============================================================ */

function criarCard(item, badge, mostrarTipo = false) {

    const area = mostrarTipo && item.tipo
        ? `${item.tipo} - ${item.actividade ?? ""}`
        : (item.actividade ?? "");

    const valor = Number(item.valor || 0).toLocaleString(
        "pt-PT",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

    return `
            <div class="card mb-3 shadow-sm border-${badge}">
                <div class="card-header bg-white">
                    <div class="d-flex justify-content-between">

                        <div>
                            <div class="font-weight-bold">
                                <i class="fa fa-calendar text-${badge}"></i>${item.data_registo}
                            </div>
                            <div class="mt-1">
                                <strong>${item.designacao}</strong>
                            </div>

                            <small class="text-muted">Processo #${item.processo} * referente a: ${item.doc_num ?? ""}</small> 

                        </div>

                        <div>
                            <button
                                class="btn btn-outline-${badge} btn-sm"
                                onclick="redirectProcesso(${item.processo})">
                                <i class="fa fa-binoculars"></i>
                            </button>
                        </div>

                    </div>
                </div>

                <div class="card-body py-2">
                
                    <div class="row small mb-1">
                        
                        <div class="col-4 font-weight-bold">Área</div>
                            <div class="col-8">${area}</div>
                        </div>  

                        <div class="row small mb-1">
                            <div class="col-4 font-weight-bold">Entidade</div>
                            <div class="col-8">${item.entidade ?? ""}</div>
                        </div>

                        <div class="row small mb-1">
                            <div class="col-4 font-weight-bold">Receção</div>
                            <div class="col-8">${item.provisoria}</div>
                        </div>

                        <div class="row small mb-1">
                            <div class="col-4 font-weight-bold">Pedido</div>
                            <div class="col-8">${item.doc ?? ""}</div>
                        </div>

                        <div class="row small">
                            <div class="col-4 font-weight-bold">Custo</div>
                            <div class="col-8">${valor} €</div>
                        </div>

                </div>

            </div>

            `;

}

/* ============================================================
   Render
============================================================ */

function renderizarLista(id, lista, badge) {

    const container = document.getElementById(id);

    if (!container)
        return;

    const html = [];

    lista
        .filter(item => Number(item.ano) > 0)
        .forEach(item => {

            html.push(

                criarCard(
                    item,
                    badge,
                    id === "agendado"
                )

            );

        });

    if (html.length === 0) {

        html.push(`

<div class="text-center text-muted p-4">
    <i class="fa fa-check-circle fa-2x mb-2"></i>
    <br>
    Sem registos.
</div>

`);

    }

    container.innerHTML = html.join("");

}

/* ============================================================
   Contadores
============================================================ */

function actualizarContadores(listas) {

    document.getElementById("totalVencidas").innerHTML =
        listas.vencidas.length;

    document.getElementById("totalProgramadas").innerHTML =
        listas.programadas.length;

    document.getElementById("totalAgendadas").innerHTML =
        listas.agendadas.length;

}

/* ============================================================
   Processo
============================================================ */

function redirectProcesso(codigo) {

    const xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {

        if (this.readyState === 4 &&
            this.status === 200) {

            window.location.href =
                `../processos/processoResults.html?codigoProcesso=${codigo}`;

        }

    };

    xmlhttp.open(
        "GET",
        `../_search/searchEngine.php?codigoProcesso=${codigo}`,
        true
    );

    xmlhttp.send();

}