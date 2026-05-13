
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
        const pedidoText = item.pedido
            ? [item.pedido.historico_num, item.pedido.historico_doc, item.pedido.historico_dataemissao, formatCurrency(item.pedido.historico_valor)]
            : ['', '', '', ''];

        const faturasText = item.faturas
            .map(f => [formatExpediente(f.fact_expediente), f.fact_data, f.fact_num, f.fact_auto_num, formatCurrency(f.fact_valor)].join(' / '))
            .join('<br>');

            

        if (item.reembolsos.length === 0) {
            html += `
                <tr>
                    <td class="table-dark text-white">${pedidoText[0]}</td>
                    <td class="table-dark text-white">${pedidoText[1]}</td>
                    <td class="table-dark text-white">${pedidoText[2]}</td>
                    <td class="table-dark text-white text-right">${pedidoText[3]}</td>
                    <td></td><td></td><td></td><td></td><td></td>
                    <td class="table-warning">${faturasText}</td>
                    
                </tr>`;
        } else {
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
                      <td class="table-dark text-white">${pedidoText[0]}</td>
                      <td class="table-dark text-white">${pedidoText[1]}</td>
                      <td class="table-dark text-white">${pedidoText[2]}</td>
                      <td class="table-dark text-white text-right">${pedidoText[3]}</td>
                      <td class="table-info">${reembText[0]}</td>
                      <td class="table-info">${reembText[1]}</td>
                      <td class="table-info">${reembText[2]}</td>
                      <td class="table-info text-right">${reembText[3]}</td>
                      <td class="${saldoClass} text-right">${formatCurrency(saldo)}</td>
                      <td class="table-warning">${faturasText}</td>
                    </tr>`;
            });
        }
    });

    // Linhas de faturas órfãs
    faturasOrfaos.forEach(f => {
        const fText = [formatExpediente(f.fact_expediente), f.fact_data, f.fact_num, f.fact_auto_num, formatCurrency(f.fact_valor)];
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
        $('#reembolsos').html(`
          <div class="mt-2">
            <b>Considerar alterar o Layout por pedido de reembolso e órfãos (sem pedido)</b>
          </div>
        `);

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
          const tiposValidos = ['FTN', 'FTC', 'NC'];
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
