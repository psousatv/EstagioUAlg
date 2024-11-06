<?php
//session_start();
include "../../../global/config/dbConn.php";

$logo = "../../global/imagens/LogotipoTVerde.jpg";

$orcamentoItem = $_GET['orcamentoItem'];

if(isset($_GET['anoCorrente'])){
  $anoCorrente = $_GET['anoCorrente'];
} else {
  $anoCorrente = date('Y');
};

// Processos na Rúbrica
$sqlProcessosItemRubrica = "SELECT  
                          proces_check,
                          proces_padm,
                          proces_estado_nome AS estado, 
                          dep_sigla AS departamento, 
                          proces_nome,
                          proces_val_max AS previsto,
                          proces_val_adjudicacoes AS adjudicado,
                          (SELECT DISTINCT ROUND(SUM(fact_valor),2)
                          FROM factura
                          WHERE fact_proces_check = proces_check) AS faturado
                          FROM processo
                          LEFT JOIN departamento ON dep_cod = proces_departamento
                          WHERE proces_rub_cod = '".$orcamentoItem."'
                          AND proces_report_valores = 1 AND proces_orc_ano='".$anoCorrente."'
                          ORDER BY estado, dep_sigla, proces_nome ASC";

$stmt = $myConn->query($sqlProcessosItemRubrica);
$processosItemRubrica = $stmt->fetchAll(PDO::FETCH_ASSOC);
$rows = count($processosItemRubrica);

// Valor do Orçamento na Rúbrica
$sqlOrcamentoItemRubrica = "SELECT
                        SUM(orc_valor_previsto) AS previsto
                        FROM orcamento
                        WHERE orc_rub_cod = '".$orcamentoItem."'
                        AND orc_ano='".$anoCorrente."'";

$stmt = $myConn->query($sqlOrcamentoItemRubrica);
$totaisOrcamentoItemRubrica = $stmt->fetchAll(PDO::FETCH_ASSOC);

$totalOrcamentoItemRubrica = array_sum(array_column($totaisOrcamentoItemRubrica, "previsto"));
$totalProcessosAdjudicado = array_sum(array_column($processosItemRubrica, "adjudicado"));
$totalProcessosFaturado = array_sum(array_column($processosItemRubrica, "faturado"));

echo '
<div class="card col-md-12">
  <div class="card-body">
  <a class="small">Os valores de orçamento são ajustados para os valores de adjudicação </a>
    <div class="d-flex align-items-center justify-content-between">
      <table class="table table-responsive table-striped">
        <tr>
          <td class="bg-secondary text-white">Processos Adjudicados ('.$rows.')</td>
          <td class="bg-secondary text-white">'.number_format($totalProcessosAdjudicado, 2, ",", ".").'€</td>  
          <td class="bg-primary text-white">Orçamento Previsto</td>
          <td class="bg-primary text-white">'.number_format($totalOrcamentoItemRubrica, 2, ",", ".").'€</td>
          <td class="bg-success text-white">Valor Faturado</td>
          <td class="bg-success text-white">'.number_format($totalProcessosFaturado, 2, ",", ".").'€</td>
        </tr>
      </table>
      <img src="'.$logo.'" alt="2030" width="200" height="50">
    </div>
    
    <h1 class="mt-2"></h1>
    <div class="col col-md-12">
      <div class="row">
        <table class="table table-responsive table-striped small">
          <tr>
            <th>Estado</th>
            <th>DEP</th>
            <th>PADM</th>
            <th>Processo</th>
            <th>Adjudicado</th>
            <th>Previsto</th>
            <th>Faturado</th>
          </tr>';
          foreach($processosItemRubrica as $row) {
          echo '<tr onclick="redirectProcesso('.$row["proces_check"].')">
                  <td class=" bg-primary text-white">'.$row["estado"].'</td>
                  <td class=" bg-secondary text-white">'.$row["departamento"].'</td>
                  <td class=" bg-info text-white">'.$row["proces_padm"].'</td>
                  <td>'.$row["proces_nome"].'</td>';
                  if($row["faturado"] == 0){
            echo '
                  <td class="bg-secondary text-white text-right">'.number_format($row["adjudicado"], 2, ",", ".").'€</td>      
                  <td class="bg-primary text-white text-right">'.number_format($row["previsto"], 2, ",", ".").'€</td>
                  <td class="bg-warning text-white text-right">'.number_format($row["faturado"], 2, ",", ".").'€</td>';
                  } else {
            echo '
                  <td class="bg-secondary text-white text-right">'.number_format($row["adjudicado"], 2, ",", ".").'€</td>
                  <td class="bg-primary text-white text-right">'.number_format($row["previsto"], 2, ",", ".").'€</td>
                  <td class="bg-success text-white text-right">'.number_format($row["faturado"], 2, ",", ".").'€</td>';
                  }
          };
          echo '
          </tr>
        </table>
      </div>
    </div>
  </div>
</div>';

