<?php
//session_start();
include "../../../global/config/dbConn.php";

$logo = "../../global/imagens/LogotipoTVerde.jpg";

$orcamentoItem = $_GET['orcamentoItem'];
$anoCorrente = $_GET['anoCorrente'] ?? date('Y');

//if(isset($_GET['anoCorrente'])){
//  $anoCorrente = $_GET['anoCorrente'] ;
//} else {
//  $anoCorrente = date('Y');
//};

// Valores do Orçamento na Rúbrica
$sqlOrcamentoItemRubrica = "SELECT  
                          orc_check AS controle,
                          orc_tipo AS tipo,
                          orc_conta_descritiva AS descritivo,
                          orc_valor_previsto AS previsto,
                          SUM(orc_valor_previsto) AS total_previsto,
                          (SELECT SUM(historico_valor)
                          FROM historico
                          LEFT JOIN processo ON proces_check = historico_proces_check
                          WHERE proces_orc_check = orcamento.orc_check AND historico_descr_cod = 14) AS total_adjudicado,
                          (SELECT SUM(fact_valor) FROM factura
                          LEFT JOIN processo ON proces_check = fact_proces_check
                          WHERE proces_orc_check = orcamento.orc_check AND proces_report_valores = 1) AS total_faturado
                          FROM orcamento
                          WHERE orc_rub_cod = :orcamentoItem AND orc_ano = :anoCorrente
                          GROUP BY tipo
                          ORDER BY tipo";

//$stmt1 = $myConn->query($sqlOrcamentoItemRubrica);
//$orcamentoItemRubrica = $stmt1->fetchAll(PDO::FETCH_ASSOC);

$stmtOrc = $myConn->prepare($sqlOrcamentoItemRubrica);
$stmtOrc->bindParam(':orcamentoItem', $orcamentoItem);
$stmtOrc->bindParam(':anoCorrente', $anoCorrente);
$stmtOrc->execute();
$orcamentoList = $stmtOrc->fetchAll(PDO::FETCH_ASSOC);

//Número de processos - Orçamento' na Rúbrica
$rows = count($orcamentoList);

// Totais
$totalPrevisto = array_sum(array_column($orcamentoList, "total_previsto"));
$totalAdjudicado = array_sum(array_column($orcamentoList, "total_adjudicado"));
$totalFaturado = array_sum(array_column($orcamentoList, "total_faturado"));

// Processo indexados ao orçamento
$sqlProcessosOrcamentoItemRubrica = "SELECT
                                     proces_check,
                                     proces_orc_check,
                                     proces_padm AS padm,
                                     proced_sigla AS procedimento,
                                     proces_nome AS designacao,                                    
                                     (SELECT SUM(COALESCE(historico_valor, 0)) FROM historico
                                     WHERE historico_proces_check = proces_check 
                                     AND historico_descr_cod = 3) AS consulta,
                                     (SELECT SUM(COALESCE(historico_valor, 0)) FROM historico
                                     WHERE historico_proces_check = proces_check 
                                     AND historico_descr_cod = 14) AS adjudicado,
                                     (SELECT SUM(COALESCE(fact_valor, 0)) FROM factura
                                     WHERE fact_proces_check = proces_check) AS faturado
                                     FROM processo 
                                     INNER JOIN orcamento ON orc_check = proces_orc_check
                                     INNER JOIN procedimento ON proced_cod = proces_proced_cod
                                     WHERE proces_orc_check = orc_check
                                     AND proces_report_valores = 1
                                     ORDER BY designacao";

$stmt3 = $myConn->query($sqlProcessosOrcamentoItemRubrica);
$processosOrcamentoItemRubrica = $stmt3->fetchAll(PDO::FETCH_ASSOC);

echo '
  <table class="table table-responsive table-striped">
    <tr>
      <td class="bg-primary text-white">Items no Orçamento <span class="badge bg-secondary">('.$rows.')</span></td>
      <td class="bg-primary text-white">'.number_format($totalPrevisto, 2, ",", ".").'€</td>
      <td class="bg-secondary text-white">Processos Adjudicados</td>
      <td class="bg-secondary text-white">'.number_format($totalAdjudicado, 2, ",", ".").'€</td>  
      <td class="bg-success text-white">Valor Faturado</td>
      <td class="bg-success text-white">'.number_format($totalFaturado, 2, ",", ".").'€</td>
      <td class="bg-info text-white">Saldo</td>
      <td class="bg-info text-white">'.number_format($totalPrevisto-$totalAdjudicado, 2, ",", ".").'€</td>
    </tr>
  </table>';

