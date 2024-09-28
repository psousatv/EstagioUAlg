<?php
//session_start();
include "../../../global/config/dbConn.php";

$orcamentoItem = $_GET['orcamentoItem'];

$sqlOrcamento = "SELECT  *
          FROM processo
          WHERE proces_rub_cod LIKE '%".$orcamentoItem."%'
          AND proces_report_valores = 1 AND proces_orc_ano=YEAR(NOW())
          ORDER BY proces_estado_nome ASC";

$stmt = $myConn->query($sqlOrcamento);
$procesosOrcamento = $stmt->fetchAll(PDO::FETCH_ASSOC);

//foreach($procesosOrcamento as $key) {
//  $logoCandidatura[] = $key["logo"];
//}

//$pathImagens = "../../global/imagens/";
//$logo = $pathImagens . $logoOrcamento[0];
$logo = "../../global/imagens/LogotipoTVerde.jpg";


$rows = count($procesosOrcamento);

$sqlTotaisOrcamento = "SELECT
          SUM(proces_val_adjudicacoes) AS adjudicado,
          SUM(proces_val_faturacao) AS faturado
          FROM processo
          WHERE proces_rub_cod LIKE '%".$orcamentoItem."%'
          AND proces_report_valores = 1 AND proces_orc_ano=YEAR(NOW())";

$stmt = $myConn->query($sqlTotaisOrcamento);
$totaisOrcamento = $stmt->fetchAll(PDO::FETCH_ASSOC);


foreach($totaisOrcamento as $key) {
  $totalOrcamento[] = $key["adjudicado"];
  //$logoOrcamento[] = $key["proces_path_imagens"];
}


echo '
<div class="card col-md-12">
  <div class="card-body">
  
    <div class="d-flex align-items-center justify-content-between">
    <div class="card-header bg-secondary text-white" >Processos na Rúbrica 
    ('.$rows.') - '.number_format($totalOrcamento[0], 2, ",", ".").'€
    </div>
    <img src="'.$logo.'" alt="2030" width="200" height="50">
    </div>
  <h1 class="mt-2"></h1>
    <div class="col col-md-12">
      <div class="row">
        <table class="table table-responsive table-striped small">';
        foreach($procesosOrcamento as $row) {
            echo '
              <tr onclick="redirectProcesso('.$row["proces_check"].')">
                <td class="badge bg-info text-white" >'
                  .$row["proces_estado_nome"].' <td> '
                  .$row["proces_nome"].'</td> ';
                  if($row["proces_val_faturacao"] == 0){
                    echo '<td class="bg-warning text-right">'.number_format($row["proces_val_adjudicacoes"], 2, ",", ".").'€</td>';
                  } else {
                    echo '<td class="bg-success text-right">'.number_format($row["proces_val_faturacao"], 2, ",", ".").'€</td>';
                  }
                };
            echo '
                </td>
              </tr>
        </table>
      </div>
    </div>
  </div>
</div>
';

