
$(document).ready(function () {
  const queryParams = getQueryParams();

  let table;

  function formatCurrency(value) {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
  };

  function formatExpediente(str) {
    const clean = str.replace(/[^A-Za-z0-9]/g, '');
    return clean.replace(/^([A-Za-z])(\d+)/, (_, l, n) => {
        return `${l}.${n.slice(0,5)}.${n.slice(5,7)}`;
    });
  };

  // Nested row: apenas os itens financeiros do processo clicado
  
  // Nested row: apenas os itens financeiros do processo clicado
function formatNested(processo) {
  if (!processo) return 'Sem registros';

  let html = `<table class="table table-sm table-bordered table-dark">
      <thead>
        <tr>
          <th colspan="4">Pedidos</th>
          <th>Faturas</th>
          <th colspan="4">Reembolsos</th>
        </tr>
        <tr>
          <th>Número</th>
          <th>Expediente</th>
          <th>Data</th>
          <th>Valor</th>
          <th>Expediente / Data / Número / Auto / Valor</th>
          <th>Número</th>
          <th>Expediente</th>
          <th>Data</th>
          <th>Valor</th>
        </tr>
      </thead>
      <tbody>`;

    const pedidosMap = {};
    const faturasOrfaos = [];
    const reembolsosOrfaos = [];

    // Separar pedidos e faturas
    (processo.historico || []).forEach(h => {
        if (h.historico_descr_cod === 91) {
            if (!pedidosMap[h.historico_num]) pedidosMap[h.historico_num] = { pedido: h, faturas: [], reembolsos: [] };
        }
    });

    // Associar faturas diretamente aos pedidos
    (processo.faturas || []).forEach(f => {
        const historicoNum = f.fact_finan_pp;
        if (pedidosMap[historicoNum]) {
            pedidosMap[historicoNum].faturas.push(f);
        } else {
            faturasOrfaos.push(f);
        }
    });

    // Separar reembolsos e associar aos pedidos
    (processo.historico || []).forEach(h => {
        if (h.historico_descr_cod === 92) {
            const pedido = pedidosMap[h.historico_num];
            if (pedido) {
                pedido.reembolsos.push(h);
            } else {
                reembolsosOrfaos.push(h);
            }
        }
    });

    // Monta linhas de pedidos, faturas e reembolsos
    Object.values(pedidosMap).forEach(item => {
        const pedidoText = item.pedido
            ? [item.pedido.historico_num, item.pedido.historico_doc, item.pedido.historico_dataemissao, formatCurrency(item.pedido.valor)]
            : ['', '', '', ''];

        const faturasText = item.faturas
            .map(f => [formatExpediente(f.fact_expediente), f.fact_data, f.fact_num, f.fact_auto_num, formatCurrency(f.valor)].join(' / '))
            .join('<br>');

        if (item.reembolsos.length === 0) {
            html += `
                <tr>
                    <td>${pedidoText[0]}</td>
                    <td>${pedidoText[1]}</td>
                    <td>${pedidoText[2]}</td>
                    <td class="text-end">${pedidoText[3]}</td>
                    <td>${faturasText}</td>
                    <td></td><td></td><td></td><td></td>
                </tr>`;
        } else {
            item.reembolsos.forEach(reemb => {
                const reembText = [
                    reemb.historico_num,
                    reemb.historico_doc,
                    reemb.historico_dataemissao,
                    formatCurrency(reemb.valor)
                ];

                html += `
                    <tr>
                        <td>${pedidoText[0]}</td>
                        <td>${pedidoText[1]}</td>
                        <td>${pedidoText[2]}</td>
                        <td class="text-end">${pedidoText[3]}</td>
                        <td>${faturasText}</td>
                        <td>${reembText[0]}</td>
                        <td>${reembText[1]}</td>
                        <td>${reembText[2]}</td>
                        <td class="text-end">${reembText[3]}</td>
                    </tr>`;
            });
        }
    });

    // Linhas de faturas órfãs
    faturasOrfaos.forEach(f => {
        const fText = [formatExpediente(f.fact_expediente), f.fact_data, f.fact_num, f.fact_auto_num, formatCurrency(f.valor)];
        html += `<tr>
                    <td></td><td></td><td></td><td></td>
                    <td class="text-end">${fText.join(' / ')}</td>
                    <td></td><td></td><td></td><td></td>
                </tr>`;
    });

    // Linhas de reembolsos órfãos
    reembolsosOrfaos.forEach(r => {
        const reembText = [r.historico_num, r.historico_doc, r.historico_dataemissao, formatCurrency(r.valor)];
        html += `<tr>
                    <td></td><td></td><td></td><td></td>
                    <td></td><td></td><td></td><td></td>
                    <td>${reembText.join(' / ')}</td>
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

        // Título da candidatura
        $('#titulo').html(`
          <div class="btn btn-primary col-md-8 d-grid small text-white text-left">
            ${json.estado || ''}: ${json.candidatura || ''} 
            - ${json.designacao || ''} - ${json.taxa * 100 || ''}%
          </div>
          <div class="btn btn-warning">
            <a href="candidaturaNested.html?itemProcurado=${json.candidatura}" class="text-dark"><i class="fa-solid fa-rotate"></i></a>
          </div>
          <div class="btn btn-primary">
            <a class="text-white" href="candidaturasDashboard.html"><i class="fa-solid fa-search"></i></a>
          </div>
        `);

        // Logotipo da Candidatura
        const path = "../../global/imagens";

        $('#logo').html(`
          <img src="${path}/${json.logo}" alt="Logotipo" style="max-height: 50px;"></img>
        `);
        
        // Somatórios de todos os processos
        const totalAdjudicado = processos
        .reduce((sumProc, p) => sumProc + (p.historico?.filter(h => h.historico_descr_cod===14 && (h.valor||0) > 0).reduce((s,h) => s + h.valor,0) || 0), 0);

        const totalFaturas = processos
        .reduce((sumProc, p) => sumProc + (p.faturas?.filter(f => (f.valor||0) > 0).reduce((s,f) => s + f.valor,0) || 0), 0);

        const totalReembolsos = processos
        .reduce((sumProc, p) => sumProc + (p.historico?.filter(h => h.historico_descr_cod===92 && (h.valor||0) > 0).reduce((s,h) => s + h.valor,0) || 0), 0);

        // Valores da Candidatura
        $('#valores').html(`
          <table class="table table-striped table-md">
            <tr>
              <td class="bg-primary text-white">Aprovado</td>
              <td class="bg-primary text-white text-end">${formatCurrency(json.elegivel)}</td>
              <td class="bg-secondary text-white">Adjudicados </td>
              <td class="bg-secondary text-white text-end">${formatCurrency(totalAdjudicado)}</td>  
              <td class="bg-success text-white">Faturado </td>
              <td class="bg-success text-white text-end">${formatCurrency(totalFaturas)}</td>
              <td class="bg-info text-white">Reembolsos </td>
              <td class="bg-info text-white text-end">${formatCurrency(totalReembolsos)}</td>
            </tr>
          </table>
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
            ?.filter(h => h.historico_descr_cod === 14 && (h.valor || 0) > 0)
            .reduce((sum, h) => sum + h.valor, 0) || 0;
      
          return formatCurrency(totalAdjudicado);
        }
      },
      { 
        data: null,
        className: 'dt-body-right',
        render: function(data, type, row) {
          const totalFaturas = row.faturas
            ?.filter(f => (f.valor || 0) > 0)
            .reduce((sum, f) => sum + f.valor, 0) || 0;
      
          return formatCurrency(totalFaturas);
        }
      },
      { 
        data: null,
        className: 'dt-body-right',
        render: function(data, type, row) {
          const totalReembolsos = row.historico
        ?.filter(h => h.historico_descr_cod === 92 && (h.valor || 0) > 0)
        .reduce((sum, h) => sum + (h.valor || 0), 0) || 0;
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
