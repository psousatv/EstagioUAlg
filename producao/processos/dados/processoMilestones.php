<?php
//session_start();
include "../../../global/config/dbConn.php";

// Array de códigos
$descritivos = [4, 5, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 26, 27, 28, 29, 30];
$codigoProcesso = isset($_GET['codigoProcesso']) ? intval($_GET['codigoProcesso']) : 0;

// Gerar placeholders dinâmicos
$placeholders = implode(',', array_fill(0, count($descritivos), '?'));

// Montar a query com IN dinâmico
$sql = "SELECT
        p2.proced_regime AS regime,
        p2.proced_contrato AS contrato,
        p2.proced_escolha AS procedimento,
        d.descr_cod AS movimento,
        d.descr_nome AS documento,
        COALESCE(h1.historico_dataemissao, 'Sem registos') AS data_documento
        FROM descritivos d
        LEFT JOIN historico h1 ON h1.historico_descr_cod = d.descr_cod AND h1.historico_proces_check = ?
        LEFT JOIN processo p1 ON p1.proces_check = h1.historico_proces_check AND p1.proces_check = ?
        LEFT JOIN procedimento p2 ON p2.proced_cod = p1.proces_proced_cod
        WHERE d.descr_cod IN ($placeholders)
        GROUP BY d.descr_cod, d.descr_nome, p2.proced_regime, p2.proced_contrato, p2.proced_escolha
        ORDER BY descr_cod ASC";

// Preparar statement
$stmt = $myConn->prepare($sql);

// Criar array de parâmetros
// Primeiro dois são o processo, depois vem todos os descr_cod
$params = array_merge([$codigoProcesso, $codigoProcesso], $descritivos);
// Executar
$stmt->execute($params);
// Buscar tudo
$resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Localizar o tipo de contrato
for($i = 0; $i < count($resultados); $i++){
  if($resultados[$i]['data_documento'] != 'Sem registos'){
    echo "<pre>";
    $atributoNaoNulo = $i;
    echo "</pre>";
  } 
};

// Filtrar os descritivos por tipo de procedimento
$dispensaControle = [];
$tipoProcedimento = [];
$tipoContrato = [];

if ($resultados[$atributoNaoNulo]['procedimento'] == 'Ajuste Direto Simplificado'){
  $dispensaControle = [5, 11, 12, 13, 15, 16, 17, 18, 19, 26, 27, 28, 29, 30];
  $tipoProcedimento = [$resultados[$atributoNaoNulo]['procedimento']];
  $tipoContrato = [$resultados[$atributoNaoNulo]['contrato']];
} elseif ($resultados[$atributoNaoNulo]['contrato'] == 'Aquisição de Serviços'){
  $dispensaControle = [19, 26, 27, 29, 30];
  $tipoProcedimento = [$resultados[$atributoNaoNulo]['procedimento']];
  $tipoContrato = [$resultados[$atributoNaoNulo]['contrato']];
} elseif($resultados[$atributoNaoNulo]['contrato'] == 'Aquisição de Bens'){
  $dispensaControle = [19, 26, 28, 29, 30];
  $tipoProcedimento = [$resultados[$atributoNaoNulo]['procedimento']];
  $tipoContrato = [$resultados[$atributoNaoNulo]['contrato']];
} elseif($resultados[$atributoNaoNulo]['contrato'] == 'Empreitada'){
  $dispensaControle = [27, 28];
  $tipoProcedimento = [$resultados[$atributoNaoNulo]['procedimento']];
  $tipoContrato = [$resultados[$atributoNaoNulo]['contrato']];
} else {
  $dispensaControle = [];
  $tipoProcedimento[] = [];
  $tipoContrato[] = [];
};

$pontosControle = [];
$quantidadePontosControle = count($pontosControle);

// Interagir nos resultados da query e descartar os pontos de controle
// que não pertencem ao procedimento
foreach($resultados as $resultado){
  if ($tipoContrato[0] == 'Aquisição de Serviços') {
    if (in_array($resultado['movimento'], $dispensaControle)) {
      continue;
    }
    $pontosControle = [$resultado['documento'], $resultado['data_documento']];
  } elseif($tipoContrato[0] == 'Aquisição de Bens'){
    if (in_array($resultado['movimento'], $dispensaControle)) {
      continue;
    }
    $pontosControle = [$resultado['documento'], $resultado['data_documento']];
  } elseif($tipoContrato[0] == 'Empreitada') {
    if (in_array($resultado['movimento'], $dispensaControle)) {
      continue;
    }
    $pontosControle[] = [$resultado['documento'], $resultado['data_documento']];
  }
};

echo var_dump($pontosControle);
$data_BaseGov = date("Y-m-d");
$data_Contrato = date("Y-m-d");
$data_Adjudicacao = date("Y-m-d");
$quantidadePontosControle = count($pontosControle);
$incremento = 0;

//Enviar os resultados para html

echo " 
  <div class='progress small' style='height: 30px;' >";
  //foreach($fases as $fase){
    for($i = 0; $i < count($pontosControle); $i++){
      if($pontosControle[$i][1] == 0){
        echo "<div class='progress-bar bg-info' role='progressbar' style='width: 25%;' 
          aria-valuenow='0' 
          aria-valuemin='0' aria-valuemax='100'>".$pontosControle[$i][0]."
      </div>";
      } else{
        if($pontosControle[$i][0] == 'BaseGov' && (
          $data_BaseGov > $data_Contrato || 
          $data_BaseGov > $data_Adjudicacao ||
          $data_BaseGov == 0)){
          echo "
          <div class='progress-bar bg-danger' role='progressbar' style='width: 25%;' 
            aria-valuenow='$incremento'
            aria-valuemin='0' aria-valuemax='100'>".$pontosControle[$i][1]."
            <div style='display: flex; justify-content: center; margin-top: 15px;'>".$pontosControle[$i][0]."</div>
          </div>";
          //Oito etapas
          $incremento += 12.50;
          } else {
            echo "
              <div class='progress-bar bg-success' role='progressbar' style='width: 25%;' 
                  aria-valuenow='$incremento'
                  aria-valuemin='0' aria-valuemax='100'>".$pontosControle[$i][1]."
                  <div style='display: flex; justify-content: center; margin-top: 15px;'>".$pontosControle[$i][0]."</div>
              </div>";
              //Oito etapas
              $incremento += 12.50;
            }
          }
        };

     // };
echo "</div>";
