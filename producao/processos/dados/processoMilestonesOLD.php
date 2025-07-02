<?php
//session_start();
include "../../../global/config/dbConn.php";

$codigoProcesso = intval($_GET['codigoProcesso']);

//Milestones dos Processos - Datas
$descritivosMilestones = "SELECT
                      p2.proced_regime AS regime,
                      p2.proced_contrato AS contrato,
                      p2.proced_escolha AS procedimento,
                      historico_descr_cod AS doc,
                      historico_descr_nome AS documento,
                      COALESCE(historico_dataemissao, 0) AS data_documento
                      FROM historico
                      INNER JOIN processo p1 ON p1.proces_check = historico_proces_check
                      INNER JOIN procedimento p2 ON p2.proced_cod = p1.proces_proced_cod
                      WHERE historico_proces_check = '" .$codigoProcesso. "'";

$stmt = $myConn->query($descritivosMilestones);
$descritivos = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Exemplo de saída (só para debug)
//echo var_dump($descritivos);
//foreach($descritivos as $item){
//  echo "<pre>";
//  print_r($item);
//  echo "</pre>";  
//};


//Milestones dos Processos - Datas
$processoMilestones = "SELECT
                      proced_regime AS regime,
                      proced_contrato AS contrato,
                      proced_escolha AS procedimento,
                      COALESCE(proces_data_registo, 0) AS Registado,
                      COALESCE(proces_data_enquadramento, 0) AS Enquadramento,
                      COALESCE(proces_data_aprovacao, 0) AS Aprovacao,
                      COALESCE(proces_data_entrega, 0) AS Proposta,
                      COALESCE(proces_data_adjudicacao, 0) AS Adjudicacao,
                      COALESCE(proces_data_contrato, 0) AS Contratacao,
                      COALESCE(proces_data_basegov, 0) AS BaseGov,
                      COALESCE(proces_data_csgn, 0) AS Consignacao,
                      COALESCE(proces_data_rp, 0) AS RP,
                      COALESCE(proces_data_rd, 0) AS RD,
                      COALESCE(proces_data_fim, 0) AS Contas,
                      COALESCE(proces_data_res, 0) AS RES
                      FROM processo
                      INNER JOIN procedimento ON proced_cod = proces_proced_cod
                      WHERE proces_check = '" .$codigoProcesso. "'";

$stmt = $myConn->query($processoMilestones);
$milestones = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Inicializa lista de exclusão padrão
$fases_ignorar = [];

// Definir fases a ignorar com base no primeiro marco
if (
  $milestones[0]['procedimento'] == 'Ajuste Direto Simplificado'
) {
  $fases_ignorar = [
    'regime', 'contrato', 'procedimento',
    'Registado', 'Enquadramento', 'Contrato',
    'BaseGov', 'Consignacao', 'RP', 'RD', 'Contas'. 'RES'
  ];
} elseif (
  $milestones[0]['contrato'] == 'Aquisição de Serviços' ||
  $milestones[0]['contrato'] == 'Aquisição de Bens'
) {
  $fases_ignorar = [
    'regime', 'contrato', 'procedimento',
    'Registado', 'Enquadramento', 'RP', 'RD', 'Contas'
  ];
} elseif (
  $milestones[0]['contrato'] == 'Empreitada'
) {
  $fases_ignorar = [
    'regime', 'contrato', 'procedimento',
    'Registado', 'Enquadramento', 'RES'  ];
}

$atributo = array_keys($milestones[0]);

// Datas calculadas corretamente (+20 dias)
$data_Contrato = date('Ymd', strtotime('+20 days', strtotime($milestones[0]['Contratacao'])));
$data_Adjudicacao = date('Ymd', strtotime('+20 days', strtotime($milestones[0]['Adjudicacao'])));
$data_BaseGov = date('Ymd', strtotime($milestones[0]['BaseGov']));

// Arrays separados
$fases_obras = [];
$fases_servicos = [];
$fases = [];

foreach($milestones as $milestone){
  // Se é Empreitada, vai para obras
  if ($milestone['contrato'] == 'Empreitada') {
    foreach($atributo as $nome_atributo){
      if (in_array($nome_atributo, $fases_ignorar)) {
        continue;
      }
      $valor_atributo = $milestone[$nome_atributo];
      $fases_obras[] = [$nome_atributo, $valor_atributo];
      $fases = $fases_obras;
    }
  }
  // Senão, vai para serviços
  else {
    foreach($atributo as $nome_atributo){
      if (in_array($nome_atributo, $fases_ignorar)) {
        continue;
      }
      $valor_atributo = $milestone[$nome_atributo];
      $fases_servicos[] = [$nome_atributo, $valor_atributo];
      $fases = $fases_servicos;
    }
  }
}

// Exemplo de saída (só para debug)
//echo "<pre>";
//print_r($fases);
//echo "</pre>";


//echo $fases[1][0] .'<br>';
//echo $fases[1][1] .'<br>';

echo "
  
  <div class='progress small' style='height: 30px;' >";

  //foreach($fases as $fase){
    for($i = 0; $i < count($fases); $i++){
      if($fases[$i][1] == 0){
        echo "<div class='progress-bar bg-info' role='progressbar' style='width: 25%;' 
          aria-valuenow='0' 
          aria-valuemin='0' aria-valuemax='100'>".$fases[$i][0]."
      </div>";
      } else{
        if($fases[$i][0] == 'BaseGov' && (
          $data_BaseGov > $data_Contrato || 
          $data_BaseGov > $data_Adjudicacao ||
          $data_BaseGov == 0)){
          echo "
          <div class='progress-bar bg-danger' role='progressbar' style='width: 25%;' 
            aria-valuenow='$incremento'
            aria-valuemin='0' aria-valuemax='100'>".$fases[$i][1]."
            <div style='display: flex; justify-content: center; margin-top: 15px;'>".$fases[$i][0]."</div>
          </div>";
          //Oito etapas
          $incremento += 12.50;
          } else {
            echo "
              <div class='progress-bar bg-success' role='progressbar' style='width: 25%;' 
                  aria-valuenow='$incremento'
                  aria-valuemin='0' aria-valuemax='100'>".$fases[$i][1]."
                  <div style='display: flex; justify-content: center; margin-top: 15px;'>".$fases[$i][0]."</div>
              </div>";
              //Oito etapas
              $incremento += 12.50;
            }
          }


        };

     // };
echo "</div>";
