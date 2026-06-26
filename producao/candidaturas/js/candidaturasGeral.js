let processosGlobais = [];
let table;


$(document).ready(function () {

  const candidatura = getUrlParameter('itemProcurado');

  $.ajax({
    url: 'dados/candidaturasNested.php',
    type: 'GET',
    dataType: 'json',
    data: {
      itemProcurado: candidatura
    },

    success: function (json) {
      renderTitulo(json);
      renderHistorico(json);
    },

    error: function () {
      $('#historico').html(`
        <div class="alert alert-danger mb-0">
          Erro ao carregar dados do histórico.
        </div>
      `);
    }

  });

});

/* =========================
   RENDER TÍTULO
   ========================= */
function renderTitulo(json){
  
  const path = "../../global/imagens";

  const html = `
  <div class="row w-100 align-items-center">

  <!-- 2/3: Título + botões -->
  <div class="col-10 d-flex align-items-center gap-2">

    <!-- Título -->
    <div class="btn btn-primary flex-grow-1 text-white text-start d-flex align-items-center">
      ${json.candidatura || ''} - ${json.designacao || ''}
    </div>

    <!-- Botão 1 -->
    <div class="btn btn-warning d-flex align-items-center justify-content-center" style="width:40px; height:40px;">
      <a href="candidaturasNested.html?itemProcurado=${json.candidatura}" class="text-dark">
        <i class="fa-solid fa-arrow-right fa-lg"></i>
      </a>
    </div>
    
    <!-- Botão 2 -->
    <div class="btn btn-primary d-flex align-items-center justify-content-center" style="width:40px; height:40px;">
      <a href="candidaturasGeral.html?itemProcurado=${json.candidatura}" class="text-white">
        <i class="fa-solid fa-rotate fa-lg"></i>
      </a>
    </div>

    <!-- Botão 3 -->
    <div class="btn btn-danger d-flex align-items-center justify-content-center" style="width:40px; height:40px;">
      <a class="text-white" href="candidaturasDashboard.html">
        <i class="fa-solid fa-search fa-lg"></i>
      </a>
    </div>

  </div>

  <!-- 1/3: Logotipo -->
  <div class="col-2 d-flex justify-content-end align-items-center">
    <img src="${path}/${json.logo}" alt="Logotipo" style="max-height: 50px;">
  </div>

</div>
`;

$('#titulo').html(html);

};


/* =========================
   RENDER HISTÓRICO
   ========================= */
   function renderHistorico(json) {

  
    const html = `
      <div class="row g-3 align-items-stretch">
  
        <!-- CARTÃO 1 -->
        <div class="col-md-4">
          <div class="card small text-left shadow-sm h-100">
            <div class="card-body">
  
              <div class="mb-2">
                <strong>Aviso: ${json.aviso || ''}</strong>
                <div>Abertura: ${json.abertura || ''} - Fecho: ${json.fecho || ''}</div>
              </div>
  
              <div class="mb-2">
                <div class="fw-bold">Prioridade: ${json.prioridade || ''}</div>
                <div>Tipologia: ${json.tipologia_intervencao || ''}</div>
              </div>
  
              <div>
                <div class="fw-bold">Objetivo: ${json.objetivo || ''}</div>
                <div>Ação: ${json.tipologia_acao || ''}</div>
                <div>Taxa de Cofinanciamento: ${((json.taxa || 0) * 100).toFixed(2)}%</div>
              </div>
  
            </div>
          </div>
        </div>
  
        <!-- CARTÃO 2 -->
        <div class="col-md-4">
          <div class="card small text-left shadow-sm h-100">
            <div class="card-body">
  
              <div class="mb-2">
                <strong>Candidatura: ${json.estado || ''}</strong>
                <div>Início: ${json.inicio || ''} - Termo: ${json.termo || ''}</div>
              </div>
  
              <div class="mb-2">
                <div class="fw-bold">Submissão: ${json.submissao || ''}</div>
                <div>Aprovação: ${json.aprovacao || ''}</div>
                <div class="fw-bold">Termo de Aceitação: ${json.aceitacao || ''}</div>
              </div>
  
            </div>
          </div>
        </div>
  
        <!-- CARTÃO 3 -->
        <div class="col-md-4">
          <div class="card small text-left shadow-sm h-100">
            <div class="card-body">
  
              <div class="mb-2">
                <strong>Indicadores: Em Construção</strong>
              </div>
  
              <div class="table-responsive">
                <table class="table table-sm table-hover table-bordered small align-middle mb-0">
  
                  <thead>
                    <tr>
                      <th>Indicador</th>
                      <th>Unidade</th>
                      <th>Meta</th>
                      <th>Execução</th>
                      <th>%</th>
                    </tr>
                  </thead>
  
                  <tbody>
  
                    <tr>
                      <td>RCO 30 ITI</td>
                      <td>Km</td>
                      <td class="text-end">5,11</td>
                      <td class="text-end">0</td>
                      <td class="text-end">0,00%</td>
                    </tr>
  
                    <tr>
                      <td>RCR 75 ITI</td>
                      <td>Un</td>
                      <td class="text-end">1</td>
                      <td class="text-end">1</td>
                      <td class="text-end">100,00%</td>
                    </tr>
  
                    <tr>
                      <td>RCR 41 ITI</td>
                      <td>Pessoas</td>
                      <td class="text-end">145</td>
                      <td class="text-end">0</td>
                      <td class="text-end">0,00%</td>
                    </tr>
  
                    <tr>
                      <td>RCR 43 ITI</td>
                      <td>m3/ano</td>
                      <td class="text-end">Perdas</td>
                      <td class="text-end">Aplicável?</td>
                      <td class="text-end">0,00%</td>
                    </tr>
  
                  </tbody>
  
                </table>
              </div>
  
            </div>
          </div>
        </div>
  
      </div>
    `;
  
    $('#historico').html(html);

  }


/* =========================
   URL PARAM
   ========================= */
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}



/// ************************ ///
///    UTILITÁRIOS
/// ************************ ///

//Formatação de Moeda
function formatCurrency(value){
  return new Intl.NumberFormat('de-DE', {minimumFractionDigits: 2}).format(value || 0) + '€';
}

// Formatação de Expediente
function formatExpediente(str){
  return str 
  ? `${str[0]}.${str.slice(1, 6)}.${str.slice(6)}`
  : '';
}

// Formatação para o PDF
function cleanPdfText(text) {
  if (!text) return "";

  return String(text)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&/g, "&") // protege contra lixo residual
    .trim();
}

// Query params
function getQueryParams() {
  const params = {};
  const query = new URLSearchParams(window.location.search);
  for (const [key, value] of query.entries()) {
    params[key] = value;
  }
  return params;
}

// Redireciona para o processo
function redirectProcesso(codigoProcesso){
  const obrasURL = `../../producao/processos/processoResults.html?codigoProcesso=${codigoProcesso}`;
  window.location.href = obrasURL;
}