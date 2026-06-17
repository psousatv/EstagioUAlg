
$(document).ready(function () {
  const queryParams = getQueryParams();

  let table;

  function formatCurrency(value) {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
  };

  function formatExpediente(str) {
    if (typeof str !== 'string') return '';
  
    const clean = str.replace(/[^A-Za-z0-9]/g, '');
    return clean.replace(/^([A-Za-z])(\d+)/, (_, l, n) => {
      return `${l}.${n.slice(0,5)}.${n.slice(5,7)}`;
    });
  }

  // Nested row: apenas os itens financeiros do processo clicado
  function formatNested(processo) {
    if (!processo) return 'Sem registros';

    let html = `<table class="table table-sm table-bordered small">
                  <thead>
                    <tr>
                        <th class="table-dark text-center" colspan="4">Pedidos</th>
                        <th class="table-info text-center" colspan="4">Reembolsos</th>
                        <th class="table-success text-center">Balanço</th>
                        <th class="table-warning text-center">Faturas</th>
                    </tr>
                    <tr>
                        <!-- PEDIDOS -->
                        <th class="table-dark">Número</th>
                        <th class="table-dark">Expediente</th>
                        <th class="table-dark">Data</th>
                        <th class="table-dark text-right">Valor</th>
                        <!-- REEMBOLSOS -->
                        <th class="table-info">Número</th>
                        <th class="table-info">Expediente</th>
                        <th class="table-info">Data</th>
                        <th class="table-info text-right">Valor</th>
                        <!-- BALANÇO -->
                        <th class="table-success text-right">Valor</th>
                        <!-- FATURAS -->
                        <th class="table-warning">Expediente / Data / Número / Auto / Valor</th>
                    </tr>
                  </thead>
              <tbody>`;

        const { pedidosMap, faturasOrfaos, reembolsosOrfaos } = (processo.historico || []).reduce(
          (acc, h) => {
            const num = h.historico_num;
        
            // Separar pedidos
            if (h.historico_descr_cod === 91 && num != null) {
              acc.pedidosMap[num] ??= { pedido: h, faturas: [], reembolsos: [] };
            }
        
            // Separar reembolsos
            if (h.historico_descr_cod === 92 && num != null) {
              if (acc.pedidosMap[num]) {
                acc.pedidosMap[num].reembolsos.push(h);
              } else {
                acc.reembolsosOrfaos.push(h);
              }
            }
        
            return acc;
          },
          { pedidosMap: {}, faturasOrfaos: [], reembolsosOrfaos: [] }
        );
        
        // Associar faturas aos pedidos
        (processo.faturas || []).forEach(f => {

          const num = f.fact_finan_pp;
          if (pedidosMap[num]) {
            pedidosMap[num].faturas.push(f);
          } else {
            faturasOrfaos.push(f);
          }
        });
      

      // Monta linhas de pedidos, faturas e reembolsos
      Object.values(pedidosMap).forEach(item => {

        // -------------------------
        // PEDIDO
        // -------------------------
        const pedidoText = item.pedido
            ? [
                item.pedido.historico_num,
                item.pedido.historico_doc,
                item.pedido.historico_dataemissao,
                formatCurrency(item.pedido.historico_valor)
            ]
            : ['', '', '', ''];
    
        // -------------------------
        // FATURAS NORMAIS
        // -------------------------
        //const faturasNormais = item.faturas.map(f => [
        //    formatExpediente(f.fact_expediente),
        //    f.fact_data,
        //    `${f.fact_tipo}_${f.fact_num}`,
        //    `AM_${f.fact_auto_num}`,
        //    formatCurrency(f.fact_valor)
        //].join(' / '));
    
        const faturasNormais = item.faturas.map(f => [
          formatExpediente(f.fact_expediente),
          f.fact_data,
          `${f.fact_tipo}_${f.fact_num}`,
          `${f.fact_auto_num}`,
          formatCurrency(f.fact_valor)
        ].join(' / '));

        // -------------------------
        // REEMBOLSOS CANCELADOS
        // Se valor negativo + expediente cancelado
        // aparecem também em FATURAS
        // -------------------------
        const cancelamentos = item.reembolsos
            .filter(r =>
                r.historico_valor < 0 &&
                r.historico_doc &&
                r.historico_doc.toLowerCase().includes('cancel')
            )
            .map(r => [
                r.historico_num,
                'CANCELADO'
            ].join(' -> '));
    
        // -------------------------
        // JUNTA FATURAS + CANCELAMENTOS
        // -------------------------
        const faturasText = [
            ...faturasNormais,
            ...cancelamentos
        ].join('<br>');
    
        // -------------------------
        // SEM REEMBOLSOS
        // -------------------------
        if (item.reembolsos.length === 0) {
    
            html += `
                <tr>
                    <td class="table-dark text-white">${pedidoText[0]}</td>
                    <td class="table-dark text-white">${pedidoText[1]}</td>
                    <td class="table-dark text-white">${pedidoText[2]}</td>
                    <td class="table-dark text-white text-right">${pedidoText[3]}</td>
    
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
    
                    <td></td>
    
                    <td class="table-warning">
                        ${faturasText}
                    </td>
                </tr>
            `;
    
        } else {
    
            // -------------------------
            // COM REEMBOLSOS
            // -------------------------
            item.reembolsos.forEach(reemb => {
    
                const reembText = [
                    reemb.historico_num,
                    reemb.historico_doc,
                    reemb.historico_dataemissao,
                    formatCurrency(reemb.historico_valor)
                ];
    
                const saldo = reemb.historico_valor >= 0
                    ? reemb.historico_valor - item.pedido.historico_valor
                    : 0;
    
                const saldoClass = saldo >= 0
                    ? 'table-success'
                    : 'table-danger';
    
                html += `
                    <tr>
    
                        <!-- PEDIDOS -->
                        <td class="table-dark text-white">${pedidoText[0]}</td>
                        <td class="table-dark text-white">${pedidoText[1]}</td>
                        <td class="table-dark text-white">${pedidoText[2]}</td>
                        <td class="table-dark text-white text-right">${pedidoText[3]}</td>
    
                        <!-- REEMBOLSOS -->
                        <td class="table-info">${reembText[0]}</td>
                        <td class="table-info">${reembText[1]}</td>
                        <td class="table-info">${reembText[2]}</td>
                        <td class="table-info text-right">${reembText[3]}</td>
    
                        <!-- SALDO -->
                        <td class="${saldoClass} text-right">
                            ${formatCurrency(saldo)}
                        </td>
    
                        <!-- FATURAS -->
                        <td class="table-warning">
                            ${faturasText}
                        </td>
    
                    </tr>
                `;
            });
        }
      });

      // Linhas de faturas órfãs
      faturasOrfaos.forEach(f => {
          const fText = [formatExpediente(f.fact_expediente), f.fact_data, f.fact_tipo + "_" + f.fact_num, "AM_" + f.fact_auto_num, formatCurrency(f.fact_valor)];
          html += `<tr>
                      <td></td><td></td><td></td><td></td>
                      <td></td><td></td><td></td><td></td><td></td>
                      <td class="table-danger">${fText.join(' / ')}</td>
                  </tr>`;
      });

      // Linhas de reembolsos órfãos
      reembolsosOrfaos.forEach(r => {
          const reembText = [r.historico_num, r.historico_doc, r.historico_dataemissao, formatCurrency(r.historico_valor)];
          html += `<tr>
                      <td></td><td></td><td></td><td></td>
                      <td class="table-danger">${reembText.join(' / ')}</td>
                      <td></td><td></td><td></td><td></td><td></td>
                      
                  </tr>`;
      });

      html += `</tbody></table>`;
      return html;
    }

    function renderReembolsosCards(processos) {

      const grupos = {};
    
      // =====================================================
      // 1. PERCORRER TODOS OS PROCESSOS (AGREGAÇÃO GLOBAL)
      // =====================================================
      processos.forEach(processo => {

        const historico = processo.historico || [];
      
        historico.forEach(h => {
      
          // 🚫 FILTRO PP
          if (h.historico_num && !String(h.historico_num).startsWith('PP')) return;
      
          const key = h.historico_num || 'ORFAO';
      
          if (!grupos[key]) {
            grupos[key] = {
              key,
              totalPedido: 0,
              totalReembolso: 0
            };
          }
      
          if (h.historico_descr_cod === 91) {
            grupos[key].totalPedido += (h.historico_valor || 0);
          }
      
          if (h.historico_descr_cod === 92) {
            grupos[key].totalReembolso += (h.historico_valor || 0);
          }
        });
      });
    
      // =====================================================
      // 2. ORDENAR ALFABÉTICO (ORFÃO NO FIM)
      // =====================================================
      const ordenados = Object.values(grupos).sort((a, b) => {
    
        if (a.key === 'ORFAO') return 1;
        if (b.key === 'ORFAO') return -1;
    
        return String(a.key).localeCompare(String(b.key), 'pt');
      });
    
      // =====================================================
      // 3. RENDER CARDS
      // =====================================================
      let html = `<div class="row g-2">`;
    
      ordenados.forEach(g => {
    
        const percent = g.totalPedido > 0
          ? (g.totalReembolso / g.totalPedido) * 100
          : 0;
    
        html += `
          <div class="col-6 col-sm-3 col-md-2 col-lg-1-5">
    
            <div class="card border-info shadow-sm h-100 reembolso-card"
                 data-key="${g.key}">
    
              <div class="card-header bg-info text-white p-1 text-center small">
                ${g.key === 'ORFAO' ? 'Órfão' : g.key}
              </div>
    
              <div class="card-body p-1 small text-center">
    
                <div style="font-size: 11px;">
                  <b>P:</b> ${formatCurrency(g.totalPedido)}
                </div>
    
                <div style="font-size: 11px;">
                  <b>R:</b> ${formatCurrency(g.totalReembolso)}
                </div>
    
                <div class="mt-1">
                  <span class="badge bg-warning" style="font-size: 10px;">
                    ${percent.toFixed(1)}%
                  </span>
                </div>
    
              </div>
    
            </div>
    
          </div>
        `;
      });
    
      html += `</div>`;
    
      return html;
    }

  // Inicializa DataTable principal
  table = $('#processosNested').DataTable({
    ajax: {
      url: 'dados/candidaturaNested.php',
      dataSrc: function (json) {
        // Retorna todos os processos como linhas
        const processos = json.processos.map(proc => ({
          ...proc,
          candidatura: json.candidatura,
          estado: json.estado,
          aviso: json.aviso,
          programa: json.programa,
          nome: json.designacao,
          taxa: json.taxa,
          logo: json.logo
        }));

        console.table(json);

        // Título da candidatura
        $('#titulo').html(`
          <div>
            <div class="btn btn-primary col-md-10 d-grid small text-white text-left">
              ${json.estado || ''}: ${json.candidatura || ''} 
              - ${json.designacao || ''} - Apoio de ${json.taxa * 100 || ''}%
            </div>
            <div class="btn btn-warning">
              <a href="candidaturaNested.html?itemProcurado=${json.candidatura}" class="text-dark"><i class="fa-solid fa-rotate"></i></a>
            </div>
            <div class="btn btn-primary">
              <a class="text-white" href="candidaturasDashboard.html"><i class="fa-solid fa-search"></i></a>
            </div>
          </div>
          <div class="mt-2">
            <b>Breve descrição da Candiatura - a do Aviso</b>
          </div>
        `);

        // Logotipo da Candidatura
        const path = "../../global/imagens";

        $('#logo').html(`
          <img src="${path}/${json.logo}" alt="Logotipo" style="max-height: 50px;"></img>
        `);
        
        // Somatórios de todos os processos
        const totalAdjudicado = processos
        .reduce((sumProc, p) => sumProc + 
        (p.historico?.filter(h => h.historico_descr_cod===14 && (h.historico_valor||0) > 0)
        .reduce((s,h) => s + h.historico_valor,0) || 0), 0);

        //const totalFaturas = processos
        //.reduce((sumProc, p) => sumProc + (p.faturas?.filter(f => (f.fact_valor||0) > 0).reduce((s,f) => s + f.fact_valor,0) || 0), 0);
        
        const totalPedidos = processos
        .reduce((sumProc, p) => 
          sumProc + (
            p.historico
              ?.filter(h => 
                h.historico_descr_cod === 91 && 
                (h.historico_valor || 0) > 0
              )
              .reduce((s, h) => s + h.historico_valor, 0) || 0
          ),
        0);

        const totalReembolsos = processos
        .reduce((sumProc, p) => 
          sumProc + (
            p.historico
              ?.filter(h => 
                h.historico_descr_cod === 92 && 
                (h.historico_valor || 0) > 0
              )
              .reduce((s, h) => s + h.historico_valor, 0) || 0
          ),
        0);

        // Valores da Candidatura
        $('#valores').html(`
          <table class="table table-striped table-md">
            <tr>
              <td class="bg-primary text-white">Investimento Aprovado</td>
              <td class="bg-primary text-white text-right">${formatCurrency(json.elegivel)}</td>
              <td class="bg-secondary text-white">Apoio Previsto</td>
              <td class="bg-secondary text-white text-right">${formatCurrency(json.elegivel * json.taxa)}</td>  
              <td class="bg-success text-white">Pedido </td>
              <td class="bg-success text-white text-right">${formatCurrency(totalPedidos)}</td>
              <td class="bg-info text-white">Pago </td>
              <td class="bg-info text-white text-right">${formatCurrency(totalReembolsos * json.taxa)}</td>
            </tr>
          </table>
        `);
        
        // Cartões
        $('#reembolsos').html(renderReembolsosCards(processos));

        return processos;
      },
      data: function(d) {
        return { ...d, ...queryParams };
      }
    },
    paging: false,
    searching: false,
    select: true,
    columnDefs: [{ className: "dt-head-center", targets: "_all" }],
    columns: [
      { data: 'padm' },
      { 
        data: 'designacao',
        render: function(data, type, row) {
          const totalPedidosLinha = row.historico?.length || 0;
          return `${data} <span class="badge bg-info text-white">(${totalPedidosLinha})</span>`;
        }
      },
      { 
        data: null,
        className: 'dt-body-right',
        render: function(data, type, row) {
          const totalAdjudicado = row.historico
            ?.filter(h => h.historico_descr_cod === 14 && (h.historico_valor || 0) > 0)
            .reduce((sum, h) => sum + h.historico_valor, 0) || 0;
      
          return formatCurrency(totalAdjudicado);
        }
      },
      { 
        data: null,
        className: 'dt-body-right',
        render: function(data, type, row) {
          const tiposValidos = ['FTN', 'FTC', 'NC', 'REF', 'IND'];
          const totalFaturas = row.faturas 
          ?.filter(f => tiposValidos.includes(f.fact_tipo))
          .reduce((sum, f) => sum + (f.fact_valor || 0), 0) || 0;
          return formatCurrency(totalFaturas);
        }
      },
      { 
        data: null,
        className: 'dt-body-right',
        render: function(data, type, row) {
          const totalReembolsos = row.historico 
          ?.filter(h => h.historico_descr_cod === 92 
            && (h.historico_valor || 0) > 0 
            && !(h.historico_num?.includes("Ad")))
          .reduce((sum, h) => sum + (h.historico_valor || 0), 0) || 0;
          return formatCurrency(totalReembolsos);
        }
      },
      {
        data: null,
        className: 'details-control dt-center align-middle',
        orderable: false,
        defaultContent: '<button class="btn-detalhe"><i class="fa-solid fa-circle-info"></i></button>'
      }
    ]
  });

  $(document).on('click', '.reembolso-card', function () {

    const key = $(this).data('key');
    const processos = table.rows().data().toArray();
  
    let html = '';
  
    processos.forEach(processo => {
  
      const pedido = (processo.historico || [])
        .find(h =>
          h.historico_descr_cod === 91 &&
          String(h.historico_num) === String(key)
        );
  
      const reembolsos = (processo.historico || [])
        .filter(h =>
          h.historico_descr_cod === 92 &&
          String(h.historico_num) === String(key)
        );
  
      const faturas = (processo.faturas || [])
        .filter(f =>
          String(f.fact_finan_pp) === String(key)
        );
  
      if (!pedido && reembolsos.length === 0 && faturas.length === 0) return;
  
      html += `
        <div class="border rounded p-3 mb-3">
  
          <h6 class="text-primary mb-2"
            style="cursor:pointer; text-decoration: underline;"
            onclick="redirectProcesso('${processo.proces_check}')">
            Processo: ${processo.designacao} (${processo.padm})
          </h6>
  
          <div class="row">
  
            <!-- ================= PEDIDO ================= -->
            <div class="col-md-4">
              <div class="card border-dark h-100">
                <div class="card-header bg-dark text-white p-1 small">
                  Pedido
                </div>
  
                <div class="card-body small">
  
                  ${pedido ? `
                    <div><b>Nº:</b> ${pedido.historico_num}</div>
                    <div><b>Expediente:</b> ${pedido.historico_doc || '-'}</div>
                    <div><b>Data:</b> ${pedido.historico_dataemissao || '-'}</div>
                    <div><b>Valor:</b> ${formatCurrency(pedido.historico_valor)}</div>
                  ` : `<span class="text-muted">Sem pedido</span>`}
  
                </div>
              </div>
            </div>
  
            <!-- ================= REEMBOLSOS ================= -->
            <div class="col-md-4">
              <div class="card border-info h-100">
                <div class="card-header bg-info text-white p-1 small">
                  Reembolsos
                </div>
  
                <div class="card-body small">
  
                  ${reembolsos.length ? reembolsos.map(r => `
                    <div class="border-bottom mb-1 pb-1">
  
                      <div><b>Nº:</b> ${r.historico_num}</div>
                      <div><b>Expediente:</b> ${r.historico_doc || '-'}</div>
                      <div><b>Data:</b> ${r.historico_dataemissao || '-'}</div>
                      <div><b>Valor:</b> ${formatCurrency(r.historico_valor)}</div>
  
                    </div>
                  `).join('') : '<span class="text-muted">Sem reembolsos</span>'}
  
                </div>
              </div>
            </div>
  
            <!-- ================= FATURAS ================= -->
            <div class="col-md-4">
              <div class="card border-warning h-100">
                <div class="card-header bg-warning text-dark p-1 small">
                  Faturas
                </div>
  
                <div class="card-body small">
  
                  ${faturas.length ? faturas.map(f => `
                    <div class="border-bottom mb-1 pb-1">
  
                      <div><b>Expediente:</b> ${formatExpediente(f.fact_expediente)}</div>
                      <div><b>Data:</b> ${f.fact_data || '-'}</div>
                      <div><b>Doc:</b> ${f.fact_tipo}_${f.fact_num}</div>
                      <div><b>Auto:</b> ${f.fact_auto_num || '-'}</div>
                      <div><b>Valor:</b> ${formatCurrency(f.fact_valor)}</div>
  
                    </div>
                  `).join('') : '<span class="text-muted">Sem faturas</span>'}
  
                </div>
              </div>
            </div>
  
          </div>
  
        </div>
      `;
    });
  
    $('#modalReembolsosBody').html(html || '<p>Sem dados.</p>');
  
    new bootstrap.Modal(document.getElementById('modalReembolsos')).show();
  });

  // Toggle nested row
  $('#processosNested tbody').on('click', 'td.details-control button', function () {
    const tr = $(this).closest('tr');
    const row = table.row(tr);
    const icon = $(this).find('i');

    if (row.child.isShown()) {
      row.child.hide();
      icon.removeClass('fa-circle-minus').addClass('fa-circle-info');
    } else {
      row.child(formatNested(row.data())).show();
      icon.removeClass('fa-circle-info').addClass('fa-circle-minus');
    }
  });

  // Clique em qualquer parte da linha (exceto no botão de detalhe)
  $('#processosNested tbody').on('click', 'tr', function (e) {

    // Não aciona se clicar no botão de detalhes
    if ($(e.target).closest('.btn-detalhe').length) return;

    const rowData = table.row(this).data();
    if (!rowData) return;

    redirectProcesso(rowData.proces_check);
  });

});

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
