
// URL do seu endpoint PHP
const API_URL = 'teste.php';

fetch(API_URL)
    .then(response => response.json())
    .then(data => {
    if (data.status !== "Successo") throw new Error("Erro ao carregar dados");
    
    const { processo, historico, faturas, plano } = data.dados;

    const accordion = document.getElementById('accordionDados');
    accordion.innerHTML = `
        
        <div class="btn btn-primary text-white text-left mt-2">${processo[0]["nome"]}</div>

        ${criarItemAccordion("Histórico por Fases", "historico", criarHTMLHistorico(historico))}
        ${criarItemAccordion("Faturas", "faturas", criarHTMLFaturas(faturas))}
        ${criarItemAccordion("Plano de Faturação", "plano", criarHTMLPlano(plano))}
    `;
    })
    .catch(err => {
    document.getElementById('accordionDados').innerHTML = `<div class="alert alert-danger">Erro: ${err.message}</div>`;
    });

function criarItemAccordion(titulo, id, conteudo) {
    return `
    <div class="accordion-item">
        <h2 class="accordion-header" id="heading-${id}">
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${id}" aria-expanded="false" aria-controls="collapse-${id}">
            ${titulo}
        </button>
        </h2>
        <div id="collapse-${id}" class="accordion-collapse collapse" aria-labelledby="heading-${id}" data-bs-parent="#accordionDados">
        <div class="accordion-body">
            ${conteudo}
        </div>
        </div>
    </div>
    `;
}

function criarHTMLHistorico(historico) {
    let html = `<div class="accordion" id="subAccordionHistorico">`;
    let index = 0;
  
    for (const fase in historico) {
      const collapseId = `faseCollapse${index}`;
      const headerId = `faseHeader${index}`;
  
      html += `
        <div class="accordion-item">
          <h2 class="accordion-header" id="${headerId}">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}">
              ${fase} (${historico[fase].length})
            </button>
          </h2>
          <div id="${collapseId}" class="accordion-collapse collapse" aria-labelledby="${headerId}" data-bs-parent="#subAccordionHistorico">
            <div class="accordion-body p-0">
              <table class="table table-striped table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Data</th>
                    <th>Aprovado</th>
                    <th>Assunto</th>
                    <th>Expediente</th>
                    <th>Documento</th>
                    <th>Valor</th>
                    <th>Observações</th>
                  </tr>
                </thead>
                <tbody>
                  ${historico[fase].map(mov => `
                    <tr>
                      <td>${mov.data}</td>
                      <td>${mov.aprovado || '—'}</td>
                      <td>${mov.assunto}</td>
                      <td>${mov.expediente}</td>
                      <td>${mov.documento}</td>
                      <td>${mov.valor}</td>
                      <td>${mov.observacoes}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
      index++;
    }
  
    html += `</div>`;
    return html || '<p>Sem dados de histórico.</p>';
  }
  

function criarHTMLFaturas(faturas) {
    if (!faturas.length) return '<p>Sem faturas disponíveis.</p>';
    return `
    <table class="table table-bordered table-sm">
        <thead class="table-light">
        <tr>
            <th>Auto</th>
            <th>Data Auto</th>
            <th>Nº Fatura</th>
            <th>Data Fatura</th>
            <th>Valor</th>
            <th>Duodécimos</th>
            <th>Duodécimos Devolvidos</th>
            <th>Garantia</th>
            <th>Garantia Devolvida</th>
        </tr>
        </thead>
        <tbody>
        ${faturas.map(f => `
            <tr>
            <td>${f.auto}</td>
            <td>${f.auto_data}</td>
            <td>${f.fatura_num}</td>
            <td>${f.fatura_data}</td>
            <td>${f.fatura_valor}</td>
            <td>${f.retencoes_duodecimo}</td>
            <td>${f.retencoes_duodecimo_devolvido}</td>
            <td>${f.retencoes_garantia}</td>
            <td>${f.retencoes_garantia_devolvido}</td>
            </tr>
        `).join('')}
        </tbody>
    </table>
    `;
}

function criarHTMLPlano(plano) {
    if (!plano.length) return '<p>Sem plano de faturação.</p>';
    return `
    <table class="table table-striped table-sm">
        <thead class="table-light">
        <tr>
            <th>Ano</th>
            <th>Mês</th>
            <th>Auto</th>
            <th>Previsto</th>
            <th>Realizado</th>
            <th>Desvio</th>
        </tr>
        </thead>
        <tbody>
        ${plano.map(p => `
            <tr>
            <td>${p.ano}</td>
            <td>${p.mes}</td>
            <td>${p.auto}</td>
            <td>${p.previsto}</td>
            <td>${p.realizado}</td>
            <td>${p.desvio}</td>
            </tr>
        `).join('')}
        </tbody>
    </table>
    `;
}
  