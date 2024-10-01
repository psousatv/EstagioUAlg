<?php
//session_start();
include "../../../global/config/dbConn.php";

$orcamentoItem = $_GET['orcamentoItem'];

$sqlProcessosItemRubrica = "SELECT  
                          proces_check,
                          proces_padm,
                          proces_estado_nome, 
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
                          AND proces_report_valores = 1 AND proces_orc_ano=YEAR(NOW())
                          ORDER BY dep_sigla, proces_nome ASC";

$stmt = $myConn->query($sqlProcessosItemRubrica);
$processosItemRubrica = $stmt->fetchAll(PDO::FETCH_ASSOC);

//foreach($procesosOrcamento as $key) {
//  $logoCandidatura[] = $key["logo"];
//}

//$pathImagens = "../../global/imagens/";
//$logo = $pathImagens . $logoOrcamento[0];
$logo = "../../global/imagens/LogotipoTVerde.jpg";


$rows = count($processosItemRubrica);

$sqlTotaisItemRubrica = "SELECT
                        SUM(proces_val_adjudicacoes) AS adjudicado
                        FROM processo
                        WHERE proces_rub_cod = '".$orcamentoItem."'
                        AND proces_report_valores = 1 AND proces_orc_ano=YEAR(NOW())";

$stmt = $myConn->query($sqlTotaisItemRubrica);
$totaisItemRubrica = $stmt->fetchAll(PDO::FETCH_ASSOC);


foreach($totaisItemRubrica as $key) {
  $totalItemRubrica[] = $key["adjudicado"];
  //$logoOrcamento[] = $key["proces_path_imagens"];
}


echo '
<div class="card col-md-12">
  <div class="card-body">
    <div class="d-flex align-items-center justify-content-between">
      <div class="card-header bg-secondary text-white" >Processos na Rúbrica 
        ('.$rows.') - '.number_format($totalItemRubrica[0], 2, ",", ".").'€
      </div>
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
            <th>Previsto</th>
            <th>Adjudicado</th>
            <th>Faturado</th>
          </tr>';
    foreach($processosItemRubrica as $row) {
    echo '<tr onclick="redirectProcesso('.$row["proces_check"].')">
            <td class=" bg-primary text-white">'.$row["proces_estado_nome"].'</td>
            <td class=" bg-secondary text-white">'.$row["departamento"].'</td>
            <td class=" bg-info text-white">'.$row["proces_padm"].'</td>
            <td>'.$row["proces_nome"].'</td>';
            if($row["faturado"] == 0){
      echo '
            <td class="bg-primary text-white text-right">'.number_format($row["previsto"], 2, ",", ".").'€</td>
            <td class="bg-secondary text-white text-right">'.number_format($row["adjudicado"], 2, ",", ".").'€</td>
            <td class="bg-warning text-right">'.number_format($row["faturado"], 2, ",", ".").'€</td>';
            } else {
      echo '
            <td class="bg-primary text-white text-right">'.number_format($row["previsto"], 2, ",", ".").'€</td>
            <td class="bg-secondary text-white text-right">'.number_format($row["adjudicado"], 2, ",", ".").'€</td>
            <td class="bg-success text-right">'.number_format($row["faturado"], 2, ",", ".").'€</td>';
            }
    };
    echo '
          </tr>
        </table>
      </div>
    </div>
  </div>
</div>';

