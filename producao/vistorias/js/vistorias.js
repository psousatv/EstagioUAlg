/* ============================================================
   VISTORIAS - Dashboard de Vistorias
============================================================ */
"use strict";

/* ============================================================
   Configuração
============================================================ */
const URL_DADOS = "dados/vistorias.php";

/* ============================================================
   Variáveis Globais
============================================================ */
let resultados = [];

let listas = {
    vencidas: [],
    programadas: [],
    agendadas: []
};

/* ============================================================
   Inicialização
============================================================ */
document.addEventListener("DOMContentLoaded", inicializar);

/* ============================================================
   Inicializar
============================================================ */
function inicializar(){

    carregarDados();

    const txtPesquisa = document.getElementById("txtPesquisa");

    if(txtPesquisa){
        txtPesquisa.addEventListener("input", filtrar);
    }

    const btnLimpar = document.getElementById("btnLimpar");

    if(btnLimpar){
        btnLimpar.addEventListener("click", limparPesquisa);
    }

}

/* ============================================================
   Carregar Dados
============================================================ */
async function carregarDados(){

    try{
        const response = await fetch(URL_DADOS);

        if(!response.ok){
            throw new Error(response.statusText);
        }

        resultados = await response.json();
        document.getElementById("lstErros").style.display = "none";
        listas = classificarVistorias(resultados);
        actualizarDashboard();

    }
    catch(erro){
        mostrarErro(erro.message);
    }

}

/* ============================================================
   Classificação
============================================================ */

function classificarVistorias(lista){

    const hoje = new Date();
    const actual = hoje.getFullYear() * 100 + (hoje.getMonth() + 1);

    const resultado = {
        vencidas: [],
        programadas: [],
        agendadas: []
    };

    lista.forEach(item => {

        item.provisoria = item.provisoria || "n.a.";
        item.valor = Number(item.valor || 0);
        const ano = Number(item.ano);
        const mes = Number(item.mes);

        /* ------------------------------
           Agendadas
        ------------------------------ */

        if(item.obs === "Agendado"){
            resultado.agendadas.push(item);
            return;
        }

        /* ------------------------------
           Programadas
        ------------------------------ */

        if(item.doc === "Programado" && item.obs === "Programado"){
            const data = ano * 100 + mes;

            if(data < actual){
                resultado.vencidas.push(item);
            } else{
                resultado.programadas.push(item);
            }
        }
    });

    /* ------------------------------
       Chamada para Ordenação
    ------------------------------ */
    resultado.vencidas.sort(ordenarData);
    resultado.programadas.sort(ordenarData);
    resultado.agendadas.sort(ordenarData);

    return resultado;

}

/* ============================================================
   Ordenação
============================================================ */

function ordenarData(a,b){

    if(a.data_registo < b.data_registo){
        return -1;
    }

    if(a.data_registo > b.data_registo){
        return 1;
    }

    return 0;

}

/* ============================================================
   Dashboard
============================================================ */
function actualizarDashboard(){
    renderizarTudo(listas);
}

/* ============================================================
   Limpar Pesquisa
============================================================ */
function limparPesquisa(){
    const txt = document.getElementById("txtPesquisa");
    txt.value = "";

    actualizarDashboard();

}

/* ============================================================
   Mostrar Erro
============================================================ */
function mostrarErro(texto){

    const erro = document.getElementById("lstErros");
    erro.style.display = "block";
    erro.innerHTML = texto;

}

/* ============================================================
   Pesquisa
============================================================ */

function filtrar() {
    const texto = document
        .getElementById("txtPesquisa")
        .value
        .trim()
        .toUpperCase();

    if (texto === "") {
        actualizarDashboard();
        return;

    }

    const filtradas = {
        vencidas: listas.vencidas.filter(item => pesquisar(item, texto)),
        programadas: listas.programadas.filter(item => pesquisar(item, texto)),
        agendadas: listas.agendadas.filter(item => pesquisar(item, texto))
    };

    renderizarTudo(filtradas);

}

/* ============================================================
   Pesquisa num registo
============================================================ */
function pesquisar(item, texto) {

    return (

        (item.entidade ?? "").toUpperCase().includes(texto) ||
        (item.designacao ?? "").toUpperCase().includes(texto) ||
        String(item.processo).includes(texto)

    );

}

/* ============================================================
   Renderização Geral
============================================================ */

function renderizarTudo(dados){
    renderizarLista("vencido", dados.vencidas, "danger");
    renderizarLista("programado", dados.programadas, "success");
    renderizarLista("agendado", dados.agendadas, "primary");

    actualizarResumo(dados);
    actualizarContadores(dados);
    actualizarBotoes(dados);

}

/* ============================================================
   Renderizar Lista
============================================================ */
function renderizarLista(id, lista, badge){

    const container =document.getElementById(id);

    if(!container)
        return;

    if(lista.length===0){
        container.innerHTML = `
        <div class="sem-registos">
            <i class="fa fa-check-circle fa-3x mb-3"></i>
            <h6>Sem registos</h6>
        </div>
        `;

        return;

    }

    const html = lista.map(item => criarCard(item, badge, id==="agendado")).join("");
    container.innerHTML = html;

}

/* ============================================================
   Criar Cartão
============================================================ */
function criarCard(item, badge, mostrarTipo=false){

    const area = mostrarTipo && item.tipo ? 
        `${item.tipo} - ${item.actividade ?? ""}`
        : (item.actividade ?? "");

    const valor = formatarEuro(item.valor);

    return `
        <div class="card card-vistoria mb-3 shadow-sm border-${badge}">
            <div class="card-header bg-white">
                <div class="d-flex justify-content-between">

                    <div>
                        <div class="font-weight-bold">
                            <i class="fa fa-calendar text-${badge}"></i> ${item.data_registo}
                        </div>

                        <div class="titulo-vistoria mt-1">
                            <strong>${item.designacao}</strong>
                        </div>

                        <small class="text-muted">
                            <i class="fa fa-hashtag"></i>${item.processo}&nbsp;&nbsp;
                            <i class="fa fa-file-alt"></i>${item.doc_num ?? "-"}
                        </small>
                    </div>

                    <div>
                        <button class="btn btn-outline-${badge} btn-sm"
                            title="Abrir Processo"
                            onclick="redirectProcesso(${item.processo})">
                            <i class="fa fa-binoculars"></i>
                        </button>
                    </div>

                </div>
            </div>

            <div class="card-body py-1 px-2">
                
                <div class="row small mb-0">
                    <div class="col-4 font-weight-bold">Área</div>
                    <div class="col-8">${area}</div>
                </div>

                <div class="row small mb-0">
                    <div class="col-4 font-weight-bold">Entidade</div>
                    <div class="col-8">${item.entidade ?? ""}</div>
                </div>

                <div class="row small mb-0">
                    <div class="col-4 font-weight-bold">Receção</div>
                    <div class="col-8">${item.provisoria}</div>
                </div>

                <div class="row small mb-0">
                    <div class="col-4 font-weight-bold">Pedido</div>
                    <div class="col-8">
                        <span class="badge badge-${badge}">${item.doc}</span>  
                    </div>
                </div>

                <div class="row small">
                    <div class="col-4 font-weight-bold">Custo</div>
                    <div class="col-8"><strong>${valor} €</strong></div>
                </div>

            </div>

        </div>

    `;

}

/* ============================================================
   Contadores
============================================================ */
function actualizarContadores(dados){

    document.getElementById("totalVencidas").textContent = dados.vencidas.length;
    document.getElementById("totalProgramadas").textContent = dados.programadas.length;
    document.getElementById("totalAgendadas").textContent = dados.agendadas.length;

}

/* ============================================================
   Resumo
============================================================ */
function actualizarResumo(dados){

    const total = dados.vencidas.length + dados.programadas.length + dados.agendadas.length;
    const valor =
        [...dados.vencidas,
         ...dados.programadas,
         ...dados.agendadas].reduce(
            (soma,item)=>soma+Number(item.valor||0), 0
        );

    document.getElementById("totalRegistos").textContent = total;
    document.getElementById("totalVencidasResumo").textContent = dados.vencidas.length;
    document.getElementById("totalProgramadasResumo").textContent = dados.programadas.length;
    document.getElementById("totalAgendadasResumo").textContent = dados.agendadas.length;
    document.getElementById("valorTotal").textContent = formatarEuro(valor);
}

/* ============================================================
   Botões PDF / Excel - Se não houver registos, esconde os botões
============================================================ */
function actualizarBotoes(dados){

    mostrarGrupoBotoes("Vencidas", dados.vencidas.length > 0);
    mostrarGrupoBotoes("Programadas", dados.programadas.length > 0);
    mostrarGrupoBotoes("Agendadas", dados.agendadas.length > 0);

}

function mostrarGrupoBotoes(nome, mostrar){

    ["pdf", "xls"].forEach(tipo=>{

        const btn = document.getElementById(tipo + nome);

        if(btn){
            btn.style.display = mostrar
                ? ""
                : "none";
        }

    });

}

/* ============================================================
   EXPORTAÇÃO PDF
============================================================ */

function exportarPDF(lista, titulo) {

    if (!lista || lista.length === 0)
        return;

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
    });

    doc.setFontSize(16);
    doc.text(titulo, 14, 15);
    doc.setFontSize(10);
    
    doc.text(
        "Data: " + new Date().toLocaleDateString("pt-PT"),
        14,
        22
    );

    const linhas = lista.map(item => [
        item.tipo ?? "",
        item.doc_num ?? "",
        item.data_registo,
        item.provisoria,
        item.designacao,
        item.entidade,
        item.actividade,
        formatarEuro(item.valor || 0)
    ]);

    doc.autoTable({
        startY: 28,
        theme: "grid",
        styles: {
            fontSize: 8,
            cellPadding: 2
        },
        head: [["Tipo", "Doc", "Data", "Receção", "Designação", "Entidade", "Área", "Valor (€)"]],
        body: linhas,
        foot: [["", "", "", "", "", "", "Total", formatarEuro(totalLista(lista))]]
    });

    doc.save(

        titulo + ".pdf"

    );

}

/* ============================================================
   BOTÕES PDF
============================================================ */

function inicializarExportacaoPDF() {

    const pdfVencidas =document.getElementById("pdfVencidas");
    if (pdfVencidas) {
        pdfVencidas.addEventListener("click", () => {exportarPDF(listas.vencidas, "Vistorias_Vencidas");});
    }

    const pdfProgramadas = document.getElementById("pdfProgramadas");
    if (pdfProgramadas) {
        pdfProgramadas.addEventListener("click", () => {exportarPDF(listas.programadas, "Vistorias_Programadas");});
    }

    const pdfAgendadas = document.getElementById("pdfAgendadas");
    if (pdfAgendadas) {pdfAgendadas.addEventListener("click", () => {exportarPDF(listas.agendadas, "Vistorias_Agendadas");});
    }

}

/* ============================================================
   INICIALIZAÇÃO PDF
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
        inicializarExportacaoPDF();
    }
);

/* ============================================================
   EXPORTAÇÃO EXCEL
============================================================ */
function exportarExcel(lista, nomeFolha) {

    if (!lista || lista.length === 0) {
        return;
    }

    const dados = lista.map(item => ({

        Processo: item.processo,
        Designação: item.designacao,
        Entidade: item.entidade,
        Área: item.actividade,
        Tipo: item.tipo ?? "",
        Data: item.data_registo,
        Pedido: item.doc,
        Documento: item.doc_num,
        Receção: item.provisoria,
        Valor: formatarEuro(item.valor)

    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dados);
    XLSX.utils.book_append_sheet(wb, ws, nomeFolha);
    XLSX.writeFile(wb, `${nomeFolha}.xlsx`);

}

/* ============================================================
   LIGAÇÃO DOS BOTÕES EXCEL
============================================================ */

function inicializarExportacaoExcel() {
    const btn1 = document.getElementById("xlsVencidas");

    if (btn1) {btn1.addEventListener("click", () => {
        exportarExcel(listas.vencidas, "Vistorias_Vencidas");
        });
    }

    const btn2 = document.getElementById("xlsProgramadas");
    if (btn2) {btn2.addEventListener("click", () => {
        exportarExcel(listas.programadas, "Vistorias_Programadas");
        });
    }

    const btn3 = document.getElementById("xlsAgendadas");

    if (btn3) {btn3.addEventListener("click", () => {
        exportarExcel(listas.agendadas, "Vistorias_Agendadas");
        });
    }

}

/* ============================================================
   REDIRECT PROCESSO
============================================================ */

function redirectProcesso(codigo) {
    const xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            window.location.href = `../processos/processoResults.html?codigoProcesso=${codigo}`;
            }
        };

    xmlhttp.open("GET", `../_search/searchEngine.php?codigoProcesso=${codigo}`, true);
    xmlhttp.send();

}

/* ============================================================
   FORMATAR MOEDA
============================================================ */
function formatarEuro(valor){
    return new Intl.NumberFormat('de-DE', {minimumFractionDigits: 2}).format(valor || 0) + '€';
    }
      

/* ============================================================
   FORMATAR DATA
============================================================ */

function formatarData(data) {

    if (!data) return "";

    const d = new Date(data);

    if (isNaN(d)) return data;

    return d.toLocaleDateString("pt-PT");

}

/* ============================================================
   TOTAL DE UMA LISTA
============================================================ */

function totalLista(lista) {
    return lista.reduce((total, item) => total + Number(item.valor || 0), 0);
}

/* ============================================================
   ATALHOS DE TECLADO
============================================================ */

document.addEventListener("keydown", function (e) {
    /* ESC - Limpa a pesquisa */

    if (e.key === "Escape") {
        limparPesquisa();
    }

});

/* ============================================================
   INICIALIZAÇÃO FINAL
============================================================ */
document.addEventListener("DOMContentLoaded", () => {

    inicializarExportacaoExcel();

});