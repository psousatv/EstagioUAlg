async function fetchData() {
  //const response = await fetch('blocoDados_AvaliacaoPropostas.json');
  const response = await fetch('blocoDados_HabilitacaoFornecedors.json');
  const json = await response.json();
  const container = document.getElementById('accordionJson');
  container.innerHTML = renderAccordion(json, 'accordionJson');
}

function renderAccordion(data, parentId) {
  let html = '';
  let index = 0;

  for (const key in data) {
    const element = data[key];
    const accId = `${parentId}-${key.replace(/\./g, '-')}`;
    const headingId = `heading-${accId}`;
    const collapseId = `collapse-${accId}`;

    html += `
      <div class="accordion-item">
        <h2 class="accordion-header" id="${headingId}">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}">
            ${key} - ${element.nome}
          </button>
        </h2>
        <div id="${collapseId}" class="accordion-collapse collapse" aria-labelledby="${headingId}" data-bs-parent="#${parentId}">
          <div class="accordion-body">
    `;

    const { subElementos, nome, ...fields } = element;

    for (const f in fields) {
      html += `<p class="field"><strong>${f}:</strong> ${fields[f]}</p>`;
    }

    if (subElementos) {
      const subAccordionId = `${accId}-sub`;
      html += `<div class="accordion mt-3" id="${subAccordionId}">`;
      html += renderAccordion(subElementos, subAccordionId);
      html += `</div>`;
    }

    html += `
          </div>
        </div>
      </div>
    `;
  }

  return html;
}

fetchData();
