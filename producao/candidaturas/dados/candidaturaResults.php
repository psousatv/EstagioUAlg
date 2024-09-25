<?php
//session_start();
include "../../../global/config/dbConn.php";

$nomeCandidatura = $_GET['nomeCandidatura'];

$sqlCandidatura = "SELECT  *, ca.cand_logo as logo
          FROM processo
          LEFT JOIN candidaturas_submetidas cs on  cs.candoper_codigo = proces_cand
          LEFT JOIN candidaturas_avisos ca on ca.cand_aviso = cs.candsubm_aviso
          WHERE proces_cand LIKE '%".$nomeCandidatura."%'
          AND proces_report_valores = 1
          ORDER BY proces_estado_nome ASC";

$stmt = $myConn->query($sqlCandidatura);
$procesosCandidatura = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach($procesosCandidatura as $key) {
  $logoCandidatura[] = $key["logo"];
}

$pathImagens = "../../global/imagens/";
$logo = $pathImagens . $logoCandidatura[0];


$rows = count($procesosCandidatura);

$sqlTotaisCandidatura = "SELECT
          proces_path_imagens,
          SUM(proces_cand_elegivel) AS elegivel
          FROM processo
          WHERE proces_cand LIKE '%".$nomeCandidatura."%'
          AND proces_report_valores = 1";

$stmt = $myConn->query($sqlTotaisCandidatura);
$totaisCandidatura = $stmt->fetchAll(PDO::FETCH_ASSOC);


foreach($totaisCandidatura as $key) {
  $totalCandidatura[] = $key["elegivel"];
  $logoCandidatura[] = $key["proces_path_imagens"];
}


echo '
<div class="card col-md-12">
  <div class="card-body">
  
    <div class="d-flex align-items-center justify-content-between">
    <div class="card-header bg-secondary text-white" >Processos na Candidatura 
    ('.$rows.') - '.number_format($totalCandidatura[0], 2, ",", ".").'€
    </div>
    <img src="'.$logo.'" alt="2030" width="200" height="50">
    </div>
  <h1 class="mt-2"></h1>
    <div class="col col-md-12">
      <div class="row">
        <table class="table table-responsive table-striped small">';
        foreach($procesosCandidatura as $row) {
            echo '
              <tr>
                <td onclick="redirectProcesso('.$row["proces_check"].')">'
                  .$row["proces_estado_nome"].' <td> '
                  .$row["proces_nome"].'</td> ';
                  if($row["proces_val_adjudicacoes"] == 0){
                    echo '<td class="bg-warning text-right">'.number_format($row["proces_val_max"], 2, ",", ".").'€</td>';
                  } else {
                    echo '<td class="bg-success text-right">'.number_format($row["proces_val_adjudicacoes"], 2, ",", ".").'€</td>';
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

