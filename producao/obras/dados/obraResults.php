<?php
//session_start();
include "../../../global/config/dbConn.php";

$codigoProcesso = intval($_GET['codigoProcesso']);

//Resumo do Processo
$processoResumo = "SELECT * FROM processo
                  INNER JOIN procedimento ON proced_cod = proces_proced_cod
                  INNER JOIN entidade ON ent_cod = proces_ent_cod
                  INNER JOIN 18cpv1 ON cpv1_cod = proces_18cpv1
                  INNER JOIN 18cpv2 ON cpv2_cod = proces_18cpv2
                  WHERE proces_cod > 0 AND proces_check = '" .$codigoProcesso. "'";

$stmt = $myConn->query($processoResumo);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach($data as $row)
{
  //Dados Genéricos do Processo
  echo '
  <div class="badge bg-primary text-white">Dados Genéricos do Processo</div>
  <div class="row small text-justify">
    <div class="col-md-2"><b>Enquadramento/Aprovado: </b></div>
    <div class="col-md-10 text-primary">'.$row["proces_enquadramento"].'/'.$row["proces_data_aprovacao"].'</div>  
    <div class="col-md-2"><b>Processo Administrativo: </b></div>
    <div class="col-md-10">'.$row['proces_padm'].'</div>
    <div class="col-md-2"><b>Identificação: </b></div>
    <div class="col-md-10 text-primary">('.$row['proces_check'].') - '.$row['proces_nome'].'</div>
    <div class="col-md-2"><b>Descrição: </b></div>
    <div class="col-md-10">'.$row['proces_obs']. '</div>
    <div class="col-md-2"><b>Adjudicatária: </b></div>
    <div class="col-md-10 text-primary">('.$row["ent_cod"].') '.$row["ent_nome"].' ['.$row["ent_nif"].'] - ['.$row["ent_alvara"].']</div>
    <div class="col-md-2"><b>Estado: </b></div>
    <div class="col-md-10">('.$row["proces_estado_data"].'): '.$row["proces_estado_nome"].'</div>
    <div class="col-md-2"><b>Consignação: </b></div>
    <div class="col-md-10 text-primary">'.$row["proces_csgn"].'</div>
    <div class="col-md-2"><b>Prazo de Execução: </b></div>
    <div class="col-md-10">'.$row["proces_prz_exec"].' dias - '.($row["proces_prz_exec"]/30).' mes(es)</div>
    <div class="col-md-2"><b>Fim Previsto: </b></div>
    <div class="col-md-10">'.$row["proces_fim"].'</div>
  </div> 
  <hr>';
};
