<?php
//session_start();
include "../../../global/config/dbConn.php";

$codigoProcesso = intval($_GET['codigoProcesso']);
//$q = $_GET['q'];

//intval($check) = "SELECT proces_check FROM processo WHERE proces_nome LIKE '%$processo%'";



//Resumo do Processo
$processoResumo = "SELECT * FROM processo
                  INNER JOIN procedimento ON proced_cod = proces_proced_cod
                  INNER JOIN entidade ON ent_cod = proces_ent_cod
                  WHERE proces_cod > 0 AND proces_check = '" .$codigoProcesso. "'";

$stmt = $myConn->query($processoResumo);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach($data as $row)
{
  //Dados Genéricos do Processo
  echo '
  <div class="badge bg-primary text-white">Dados Genéricos do Processo</div>
  <div class="row small text-justify">
    <div class="col-md-4 d-grid"><b>Estado: </b></div>
    <div class="col-md-8 d-grid">'.$row["proces_estado_nome"].'</div>
    <div class="col-md-4 d-grid"><b>Prazo de Execução: </b></div>
    <div class="col-md-8 d-grid">'.$row["proces_prz_exec"].' dias - '.($row["proces_prz_exec"]/30).' mes(es)</div>
    <div class="col-md-4 d-grid"><b>Adjudicatária: </b></div>
    <div class="col-md-8 d-grid">('.$row["ent_cod"].') '.$row["ent_nome"].' ['.$row["ent_nif"].']</div>
    <div class="col-md-4 d-grid"><b>Processo Administrativo: </b></div>
    <div class="col-md-8 d-grid">'.$row['proces_padm'].'</div>
    <div class="col-md-4 d-grid"><b>Identificação: </b></div>
    <div class="col-md-8 d-grid">('.$row['proces_check'].') - '.$row['proces_nome'].'</div>
    <div class="col-md-4 d-grid"><b>Descrição: </b></div>
    <div class="col-md-8 d-grid">'.$row['proces_obs']. '</div>
  </div> 
  <hr>';
  //Enquadramento Legal e Orçamento
  echo '
  <div class="badge bg-info text-white">Enquadramento Legal e Orçamento</div>
  <div class="row small text-justify">
    <div class="col-md-4 d-grid"><b>Regime: </b></div>
    <div class="col-md-8 d-grid">'.$row['proced_regime'].'</div>
    <div class="col-md-4 d-grid"><b>Publicado em: </b></div>
    <div class="col-md-8 d-grid">'.$row['proces_data_pub_se'].'</div>
    <div class="col-md-4 d-grid"><b>Contrato: </b></div>
    <div class="col-md-8 d-grid">'.$row['proced_contrato'].'</div>
    <div class="col-md-4 d-grid"><b>Procedimento: </b></div>
    <div class="col-md-8 d-grid">('.$row['proces_proced_cod'].') - '.$row['proced_escolha'].'</div>
    <div class="col-md-4 d-grid""><b>Limite: </b></div>
    <div class="col-md-8 d-grid">'.number_format($row['proced_limite'], 2, ',', '.').'€</div>
    <div class="col-md-4 d-grid""><b>Orçamento: </b></div>
    <div class="col-md-8 d-grid">'.$row['proces_orc_ano']. '</div>
    <div class="col-md-4 d-grid""><b>Área de Atuação: </b></div>
    <div class="col-md-8 d-grid">'.$row['proces_orc_actividade']. '</div>
    <div class="col-md-4 d-grid""><b>Rubrica: </b></div> 
    <div class="col-md-8 d-grid">'.$row['proces_orc_rubrica']. '</div>
    <div class="col-md-4 d-grid"><b>Valor Base: </b></div>
    <div class="col-md-8 d-grid">'.number_format($row['proces_val_base'], 2, ',', '.').'€</div>
    <div class="col-md-4 d-grid"><b>Valor Máximo: </b></div>
    <div class="col-md-8 d-grid">'.number_format($row['proces_val_max'], 2, ',', '.').'€</div>
  </div>
  <hr>';
  //Valores
  echo '
  <div class="badge bg-success text-white">Valores</div>
  <div class="row small text-justify">
    <div class="col-md-3 d-grid"><b>Financiado: </b></div>
    <div class="col-md-9 d-grid">'.$row['proces_cand'].' </div>
    <div class="col-md-3 d-grid"><b>Adjudicado: </b></div>
    <div class="col-md-9 d-grid">('.$row["proces_data_adjudicacao"].'): '.number_format($row['proces_val_adjudicacoes'], 2, ',', '.').'€</div>
    <div class="col-md-3 d-grid"><b>Faturado: </b></div>
    <div class="col-md-9 d-grid">'.number_format($row['proces_val_faturacao'], 2, ',', '.').'€</div><div class="col-md-3 d-grid"><b>Reembolsado: </b></div>
    <div class="col-md-9 d-grid">'.number_format($row['proces_cand_recebido'], 2, ',', '.').'€</div>
  </div>
  <hr>';

};

