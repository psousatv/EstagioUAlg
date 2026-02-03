fetch('blocoDados_HabilitacaoFornecedor.json')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('data-container');
    let index = 0;

    Object.entries(data).forEach(([nivel, item]) => {
      const subniveles = item.subElementos || {};
      const collapseId = `collapse-${index++}`;
      const card = document.createElement('div');
      card.className = 'accordion-item';

      card.innerHTML = `
        <h2 class="accordion-header" id="heading-${nivel}">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}">
            ${nivel} - ${item.nome}
          </button>
        </h2>
        <div id="${collapseId}" class="accordion-collapse collapse">
          <div class="accordion-body">
            <ul class="list-group mb-3">
              <li class="list-group-item"><strong>Repetível:</strong> ${item.repetível}</li>
              <li class="list-group-item"><strong>Obrigatório:</strong> ${item.obrigatório}</li>
              <li class="list-group-item"><strong>Tipo:</strong> ${item.tipo}</li>
              <li class="list-group-item"><strong>Grupo:</strong> ${item.grupo}</li>
              <li class="list-group-item"><strong>Público/Privado:</strong> ${item.visibilidade}</li>
              <li class="list-group-item"><strong>Registado por:</strong> ${item.registadoPor}</li>
            </ul>
            ${renderSubNiveis(subniveles)}
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  });

function renderSubNiveis(subniveles) {
  if (!Object.keys(subniveles).length) return '';
  return `
    <h5>Subníveis</h5>
    <ul class="list-group">
      ${Object.entries(subniveles).map(([key, val]) => `
        <li class="list-group-item">
          <strong>${key}</strong>: ${val.nome || 'Sem descrição'} (${val.tipo || '-'})
        </li>`).join('')}
    </ul>`;
}
