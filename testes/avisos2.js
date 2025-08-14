document.addEventListener('DOMContentLoaded', function() {
    // Mapeia os estados do processo para o ID do elemento <tbody>
    const tableBodies = {
        '208': document.getElementById('curso-tbody'),
        '206': document.getElementById('adjudicado-tbody'),
        '205': document.getElementById('concurso-tbody'),
        '203': document.getElementById('consulta-tbody'),
        '202': document.getElementById('preparar-tbody'),
        '200': document.getElementById('outros-tbody'),
        '201': document.getElementById('outros-tbody')
    };

    // Função de redirecionamento, pode ser personalizada
    function redirectProcesso(proces_check) {
        console.log(`Redirecionando para o processo com ID: ${proces_check}`);
        // Exemplo: window.location.href = `pagina_detalhes.php?id=${proces_check}`;
    }
    // Torna a função global para que o HTML possa acessá-la
    window.redirectProcesso = redirectProcesso;

    // Faz a requisição para o arquivo PHP
    fetch('avisos2.php')
        .then(response => {
            // Verifica se a requisição foi bem-sucedida
            if (!response.ok) {
                throw new Error('Erro na rede ou no servidor.');
            }
            // Converte a resposta para JSON
            return response.json();
        })
        .then(data => {
            // Itera sobre os dados recebidos do PHP
            data.forEach(row => {
                const estado = row.proces_estado;
                const tbody = tableBodies[estado];

                // Se houver um <tbody> correspondente, cria e insere a linha
                if (tbody) {
                    const tr = document.createElement('tr');
                    tr.setAttribute('onclick', `redirectProcesso('${row.proces_check}')`);

                    // Cria o HTML da linha da tabela
                    tr.innerHTML = `
                        <td>${row.proces_estado_nome}</td>
                        <td>${row.proces_nome}</td>
                        <td>${row.ent_nome}</td>
                    `;

                    // Adiciona a linha ao <tbody> correto
                    tbody.appendChild(tr);
                }
            });
        })
        .catch(error => {
            console.error('Falha ao carregar os dados:', error);
            // Exibe uma mensagem de erro na página
            document.getElementById('curso-tbody').innerHTML = `<tr><td colspan="3">Erro ao carregar processos.</td></tr>`;
        });
});