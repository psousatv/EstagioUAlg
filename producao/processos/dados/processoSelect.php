<?php
//session_start();
include "../../../global/config/dbConn.php";

$processo = intval($_GET['processo']);
//$q = $_GET['q'];

//Seleciona o Processo
$processoSelect = 'SELECT * FROM processo
                  WHERE (proces_cod > 0 AND proces_report_valores = 1) AND proces_estado_nome <> "Qualquer Contrato"
                  AND proces_check = "' .$processo. '"' ;
                  //AND proces_check LIKE "%' .$processo. '%"' ;

$stmt = $myConn->query($processoSelect);
$resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach($resultado as $row)
{
  echo '<div class="small"><b>Processo Administrativo: </b>' .$row['proces_padm']. '</div>';
  echo '<div class="small"><b>Nome: </b>' .$row['proces_nome']. '</div>';
  echo '<div class="small"><b>Descrição: </b>' .$row['proces_obs']. '</div>';
  echo '<div class="small"><b>Estado: </b>' .$row['proces_estado_nome']. '</div>';
  echo '<div class="small"><b>Adjudicado: </b>' .number_format($row['proces_val_adjudicacoes'], 2, ',', '.'). '</div>';
  echo '<div class="small"><b>Faturado: </b>' .number_format($row['proces_val_faturacao'], 2, ',', '.'). '</div>';
  echo '<div class="small"><b>Financiado: </b>' .$row['proces_cand']. '</div>';
  echo '<div class="small"><b>Remmbolsado: </b>' .number_format($row['proces_cand_recebido'], 2, ',', '.'). '</div>';
}

