<?php
//session_start();
include "../../../global/config/dbConn.php";

$nomeCandidatura = $_GET['nomeCandidatura'];

$query = "SELECT *
          FROM processo
          WHERE proces_cand LIKE '%".$nomeCandidatura."%'
          AND proces_report_valores = 1";

$stmt = $myConn->query($query);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

$rows = count($data);

echo '
<div class="card col-md-12">
  <div class="card-body">
  <div class="card-header bg-secondary text-white" >Processos na Candidatura ('.$rows.')</div>
  <h1 class="mt-2"></h1>
    <div class="col col-md-12">
      <div class="row">
        <table class="table table-striped small">';
        foreach($data as $row) {
            echo  '
              <tr>
                <td onclick="processoSelected('.$row["proces_check"].')">'.$row["proces_estado_nome"].'_'.$row["proces_nome"].'</td>
              </tr>';
          };
            echo '
        </table>
      </div>
    </div>
  </div>
</div>
';