<?php
//session_start();
include "../../../global/config/dbConn.php";

$processo = strval($_GET['processo']);
//$q = $_GET['q'];

//intval($check) = "SELECT proces_check FROM processo WHERE proces_nome LIKE '%$processo%'";



//Seleciona o Processo
$processoSelect = "SELECT * FROM processo
                  WHERE (proces_cod > 0 AND proces_report_valores = 1) AND proces_estado_nome <> 'Qualquer Contrato' 
                  AND proces_check = '" .$processo. "';

//AND proces_nome LIKE '%$processo%'";

$stmt = $myConn->query($processoSelect);
$resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach($resultado as $row)
{
  
  echo '<div class="small"><b>Estado: </b>' .$row['proces_estado_nome']. '</div>';
  echo '<div class="small"><b>Valor Base: </b>' .number_format($row['proces_val_base'], 2, ',', '.'). '</div>';
  echo '<div class="small"><b>Prazo de Execução: </b>' .$row['proces_prz_exec']. ' dias</div>';
  echo '<div class="small"><b>Adjudicado: </b>' .number_format($row['proces_val_adjudicacoes'], 2, ',', '.'). '</div>';
  echo '<div class="small"><b>Faturado: </b>' .number_format($row['proces_val_faturacao'], 2, ',', '.'). '</div>';
  echo '<div class="small"><b>Financiado: </b>' .$row['proces_cand']. '</div>';
  echo '<div class="small"><b>Reembolsado: </b>' .number_format($row['proces_cand_recebido'], 2, ',', '.'). '</div>';
  echo '<div class="small"><b>Processo Administrativo: </b>' .$row['proces_padm']. '</div>';
  echo '<div class="small"><b>Nome: </b>' .$row['proces_nome']. '</div>';
  echo '<div class="small"><b>Descrição: </b>' .$row['proces_obs']. '</div>';
  echo '<div class="small"><b>Orçamento: </b>' .$row['proces_orc_ano']. '</div>';
  echo '<div class="small"><b>Rubrica: </b>' .$row['proces_orc_rubrica']. '</div>';

  
}

