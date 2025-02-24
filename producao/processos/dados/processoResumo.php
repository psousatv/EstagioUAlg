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
    <div class="col-md-10 text-primary">
      '.$row["proces_enquadramento"].'/
      '.$row["proces_data_aprovacao"].'
    </div>  
    <div class="col-md-2"><b>Processo Administrativo: </b></div>
    <div class="col-md-10">
      '.$row['proces_padm'].'
    </div>
    <div class="col-md-2"><b>Identificação: </b></div>
    <div class="col-md-10 text-primary">
      ('.$row['proces_check'].') - 
      '.$row['proces_nome'].'
    </div>
    <div class="col-md-2"><b>Descrição: </b></div>
    <div class="col-md-10">
      '.$row['proces_obs']. '
    </div>
    <div class="col-md-2"><b>Adjudicatária: </b></div>
    <div class="col-md-10 text-primary">
      <mark class="bg-warning">
        <i class="fa-solid fa-binoculars"
          onclick="redirectInformacoesCPV('.$row['proces_check'].')">
        </i>
      </mark>
        ('.$row["ent_cod"].') 
        '.$row["ent_nome"].' [
        '.$row["ent_nif"].'] - [
        '.$row["ent_alvara"].']
    </div>
    <div class="col-md-2"><b>Estado: </b></div>
    <div class="col-md-10">
        '.$row["proces_estado_nome"].': 
        '.$row["proces_data_adjudicacao"].' - 
        '.number_format($row['proces_val_adjudicacoes'], 2, ',', '.').'€
    </div>
    <div class="col-md-2"><b>Consignação: </b></div>
    <div class="col-md-10 text-primary">
        '.$row["proces_csgn"].'
    </div>
    <div class="col-md-2"><b>Prazo de Execução: </b></div>
    <div class="col-md-10">
      '.$row["proces_prz_exec"].' dias - 
      '.($row["proces_prz_exec"]/30).' mes(es)
    </div>
  </div> 
  <hr>';
  //Enquadramento Legal e Orçamento
  echo '
  <div class="badge bg-info text-white">Enquadramento Legal e Orçamento</div>
  <div class="row small text-justify">
    <div class="col-md-2"><b>Regime: </b></div>
    <div class="col-md-10 text-primary">
        '.$row['proces_data_pub_se'].': 
        '.$row['proced_regime'].' [
        '.$row['proces_ficha_imob'].']
    </div>
    <div class="col-md-2"><b>Contrato: </b></div>
    <div class="col-md-10 text-primary">
        '.$row['proced_contrato'].'
    </div>
    <div class="col-md-2"><b>Procedimento: </b></div>
    <div class="col-md-10">
      <mark class="bg-warning">
        <i class="fa-solid fa-binoculars"
          onclick="redirectInformacoesCPV('.$row['proces_proced_cod'].')">
        </i>
      </mark>
      ('.$row['proces_proced_cod'].') - 
      '.$row['proced_escolha'].'
    </div>
    <div class="col-md-2""><b>Limite: </b></div>
    <div class="col-md-10 text-primary">
      '.number_format($row['proced_limite'], 2, ',', '.').'€
    </div>
    <div class="col-md-2""><b>Orçamentos: </b></div>
    <div class="col-md-10">
        '.$row['proces_orc_ano'].' [
        '.$row['proces_conta_imob'].']
    </div>
    <div class="col-md-2"><b>Área de Atuação: </b></div>
    <div class="col-md-10 text-primary">
      '.$row['proces_orc_actividade'].'
    </div>
    <div class="col-md-2"><b>Rubrica: </b></div> 
    <div class="col-md-10">
      <mark class="bg-warning">
        <i class="fa-solid fa-binoculars"
          onclick="redirectInformacoesCPV('.$row['proces_rub_cod'].')">
        </i>
      </mark>
        ['.$row['proces_rub_cod'].'] - 
        '.$row['proces_orc_rubrica'].'
    </div>
    <div class="col-md-2"><b>CPV Principal: </b></div> 
    <div class="col-md-10 text-primary">
      <mark class="bg-warning">
        <i class="fa-solid fa-binoculars"
          onclick="redirectInformacoesCPV('.$row['proces_18cpv1'].')">
        </i>
      </mark>
      '.$row['proces_18cpv1'].' - 
      '.$row['cpv1_nome'].' - [
      '.$row['cpv1_referencia'].']
    </div>
    <div class="col-md-2"><b>CPV Secundário: </b></div> 
    <div class="col-md-10">
      '.$row['proces_18cpv2'].' - 
      '.$row['cpv2_nome'].'
    </div>
    <div class="col-md-2"><b>Valor Base: </b></div>
    <div class="col-md-10 text-primary">
      '.number_format($row['proces_val_base'], 2, ',', '.').'€
    </div>
    <div class="col-md-2"><b>Valor Máximo: </b></div>
    <div class="col-md-10">
      '.number_format($row['proces_val_max'], 2, ',', '.').'€
    </div>
  </div>
  <hr>';
  //Valores
  echo '
  <div class="badge bg-success text-white">Valores</div>
  <div class="row small text-justify">
    <div class="col-md-2"><b>Financiado: </b></div>
    <div class="col-md-10 text-primary">
        '.$row['proces_cand'].'
    </div>
    <div class="col-md-2"><b>Aprovado: </b></div>
    <div class="col-md-10">
      '.number_format($row['proces_cand_elegivel'], 2, ',', '.').'€
    </div>
    <div class="col-md-2"><b>AutoFinanciamento: </b></div>
    <div class="col-md-10 text-primary">
      '.number_format($row['proces_cand_nao_elegivel'], 2, ',', '.').'€
    </div>
    <div class="col-md-2"><b>Reembolsável</b></div>
    <div class="col-md-10">
      '.number_format($row['proces_cand_fundo'], 2, ',', '.').'€
    </div>
    <div class="col-md-2"><b>Faturado: </b></div>
    <div class="col-md-10">
        '.number_format($row['proces_val_faturacao'], 2, ',', '.').'€
    </div>
    <div class="col-md-2"><b>Reembolsado: </b></div>
    <div class="col-md-10">
        '.number_format($row['proces_cand_recebido'], 2, ',', '.').'€
    </div>
  </div>
  <hr>';

};