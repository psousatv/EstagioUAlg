<?php
//session_start();
include "../../../global/config/dbConn.php";

$nomeProcesso = strval($_GET['nomeProcesso']);


//Seleciona o Processo
$processoSelect = "SELECT proces_check, proces_padm, proces_nome 
                  FROM processo
                  WHERE (proces_nome LIKE '%"  .$nomeProcesso. "%' OR proces_check ='".$nomeProcesso."') AND proces_report_valores = 1";

$stmt = $myConn->query($processoSelect);
$resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach($resultado as $row)
{
  echo
  '
  <div onclick="resumoProcesso(this.value)" id="codigoProcesso" class="btn btn-primary col-md-1 d-grid small text-left">'.$row["proces_check"].'</div>
  <div id="nomeProcesso" class="btn btn-primary col-md-10 d-grid small text-left">'.$row["proces_padm"].'_'.$row["proces_nome"].'</div>

  ';

};

$codigoprocesso = intval($row['proces_check']);
print($codigoprocesso);