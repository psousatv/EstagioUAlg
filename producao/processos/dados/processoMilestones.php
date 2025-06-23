<?php
//session_start();
include "../../../global/config/dbConn.php";

$codigoProcesso = intval($_GET['codigoProcesso']);

//Milestones dos Processos - Datas
$processoMilestones = "SELECT 
                      COALESCE(proces_data_registo, 0) AS Registado,
                      COALESCE(proces_data_enquadramento, 0) AS Enquadramento,
                      COALESCE(proces_data_aprovacao, 0) AS Aprovacao,
                      COALESCE(proces_data_entrega, 0) AS Proposta,
                      COALESCE(proces_data_adjudicacao, 0) AS Adjudicacao,
                      COALESCE(proces_data_contrato, 0) AS Contrato,
                      COALESCE(proces_data_basegov, 0) AS BaseGov,
                      COALESCE(proces_data_csgn, 0) AS Consignacao,
                      COALESCE(proces_data_rp, 0) AS RP,
                      COALESCE(proces_data_fim, 0) AS Contas,
                      COALESCE(proces_data_rd, 0) AS RD
                      FROM processo
                      WHERE proces_check = '" .$codigoProcesso. "'";

$stmt = $myConn->query($processoMilestones);
$milestones = $stmt->fetchAll(PDO::FETCH_ASSOC);
$incremento = 0;

echo "
  
  <div class='progress small' style='height: 30px;' >";

  foreach($milestones as $milestone){
    foreach($milestone as $key => $valor){
      if($valor == 0){
        echo "<div class='progress-bar bg-info' role='progressbar' style='width: 25%;' 
          aria-valuenow='0' 
          aria-valuemin='0' aria-valuemax='100'>$key
      </div>";
      } else{
      echo "
      <div class='progress-bar bg-success' role='progressbar' style='width: 25%;' 
          aria-valuenow='$incremento' 
          aria-valuemin='0' aria-valuemax='100'>$valor
          <div style='display: flex; justify-content: center; margin-top: 15px;'>$key</div>
      </div>";
      //Oito etapas
      $incremento += 12.50;
    }}
  };
  
echo "</div>";
