<?php
//session_start();
include "../../../global/config/dbConn.php";

// Array de códigos de documentos
$descritivos = [1, 4, 5, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 26, 27, 28, 29, 30];
$codigoProcesso = isset($_GET['codigoProcesso']) ? intval($_GET['codigoProcesso']) : 0;
$atributoNaoNulo = 0;

// Gerar placeholders dinâmicos
$placeholders = implode(',', array_fill(0, count($descritivos), '?'));

// Montar a query com IN dinâmico
$sql = "SELECT
        p2.proced_regime AS regime,
        p2.proced_contrato AS contrato,
        p2.proced_escolha AS procedimento,
        d.descr_cod AS movimento,
        d.descr_nome AS documento,
        MIN(COALESCE(h1.historico_dataemissao, 0)) AS data_documento,
        MIN(COALESCE(h1.historico_notas, 'Sem anotações registadas')) AS notas
        FROM descritivos d
        LEFT JOIN historico h1 ON h1.historico_descr_cod = d.descr_cod AND h1.historico_proces_check = ?
        LEFT JOIN processo p1 ON p1.proces_check = h1.historico_proces_check AND p1.proces_check = ?
        LEFT JOIN procedimento p2 ON p2.proced_cod = p1.proces_proced_cod
        WHERE d.descr_cod IN ($placeholders)
        GROUP BY d.descr_cod, d.descr_nome, p2.proced_regime, p2.proced_contrato, p2.proced_escolha";
        //ORDER BY descr_cod ASC";

// Preparar statement
$stmt = $myConn->prepare($sql);

// Criar array de parâmetros
// Primeiro dois são o processo, depois vem todos os descr_cod
$params = array_merge([$codigoProcesso, $codigoProcesso], $descritivos);
// Executar
$stmt->execute($params);
// Buscar tudo
$resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Localizar o tipo de contratog
for($i = 0; $i < count($resultados); $i++){
  if($resultados[$i]['data_documento'] != 0){
    $atributoNaoNulo = $i;
  }
};

// ************************************************
// Filtrar os descritivos por tipo de procedimento
// para atribuição de valores às variáveis
$tipoRegime = [];
$tipoProcedimento = [];
$tipoContrato = [];
$dispensaControlar = [];
$fasesControlar = [];

if (
  $resultados[$atributoNaoNulo]['procedimento'] == 'Ajuste Direto Simplificado'){
    $tipoRegime = $resultados[$atributoNaoNulo]['regime'];
    $tipoContrato = $resultados[$atributoNaoNulo]['contrato'];
    $tipoProcedimento = $resultados[$atributoNaoNulo]['procedimento'];
    $dispensaControlar = [5, 11, 12, 13, 15, 16, 17, 18, 19, 26, 27, 28, 29, 30];
    $fasesControlar = [4, 10, 14];
} elseif (
  $resultados[$atributoNaoNulo]['procedimento'] != 'Ajuste Direto Simplificado' &&
  $resultados[$atributoNaoNulo]['contrato'] == 'Aquisição de Serviços'){
    $tipoRegime = $resultados[$atributoNaoNulo]['regime'];
    $tipoContrato = $resultados[$atributoNaoNulo]['contrato'];
    $tipoProcedimento = $resultados[$atributoNaoNulo]['procedimento'];
    $dispensaControlar = [11, 12, 19, 26, 27, 29, 30];
    $fasesControlar = [4, 5, 10, 13, 14, 15, 16, 17, 18, 28];
} elseif(
  $resultados[$atributoNaoNulo]['procedimento'] != 'Ajuste Direto Simplificado' &&
  $resultados[$atributoNaoNulo]['contrato'] == 'Aquisição de Bens'){
    $tipoRegime = $resultados[$atributoNaoNulo]['regime'];
    $tipoContrato = $resultados[$atributoNaoNulo]['contrato'];
    $tipoProcedimento = $resultados[$atributoNaoNulo]['procedimento'];
    $dispensaControlar = [11, 12, 19, 26, 28, 29, 30];
    $fasesControlar = [4, 5, 10, 13, 14, 15, 16, 17, 18, 27];
} elseif(
  $resultados[$atributoNaoNulo]['procedimento'] != 'Ajuste Direto Simplificado' &&
  $resultados[$atributoNaoNulo]['contrato'] == 'Empreitada'){
    $tipoRegime = $resultados[$atributoNaoNulo]['regime'];
    $tipoContrato = $resultados[$atributoNaoNulo]['contrato'];
    $tipoProcedimento = $resultados[$atributoNaoNulo]['procedimento'];
    $dispensaControlar = [11, 12, 27, 28];
    $fasesControlar = [4, 5, 10, 13, 14, 15, 16, 17, 18, 19, 26, 29, 30];
} else {
    $tipoRegime = null;
    $tipoProcedimento = null;
    $tipoContrato = null;
    $dispensaControlar = null;
    $fasesControlar = null;
};

$pontosControle = [];

// Interagir nos resultados da query e descartar os pontos de controle
// que não pertencem ao procedimento
foreach($resultados as $resultado){
  if ($tipoContrato == 'Aquisição de Serviços') {
    if (in_array($resultado['movimento'], $fasesControlar)) {
      //continue;
      $pontosControle[] = [$resultado['documento'], $resultado['data_documento'], $resultado['notas']];
    }
    //$pontosControle[] = [$resultado['documento'], $resultado['data_documento'], $resultado['notas']];
  } elseif($tipoContrato == 'Aquisição de Bens'){
    if (in_array($resultado['movimento'], $fasesControlar)) {
      //continue;
      $pontosControle[] = [$resultado['documento'], $resultado['data_documento'], $resultado['notas']];
    }
    //$pontosControle[] = [$resultado['documento'], $resultado['data_documento'], $resultado['notas']];
  } elseif($tipoContrato == 'Empreitada') {
    if (in_array($resultado['movimento'], $fasesControlar)) {
      //continue;
      $pontosControle[] = [$resultado['documento'], $resultado['data_documento'], $resultado['notas']];
    }
    //$pontosControle[] = [$resultado['documento'], $resultado['data_documento'], $resultado['notas']];
  } else {
    $pontosControle[] = ['Não Iniciado', '' ,''];
  }
};


// ************************************************
// Filtrar os pontos de controle para atribuição
// às variáveis de controle de datas
$data_BaseGov = [];
$data_Contrato = [];
$data_Adjudicacao = [];
$quantidadePontosControle = count($pontosControle);
$incremento = 0;

//echo $data_Adjudicacao[0] . "<br>";
//echo $pontosControle[0][0];

for($i = 0; $i < count($pontosControle); $i++){
  // atribui, se exitir, o valor da data a BaseGov e acrescenta 20 dias
  if($pontosControle[$i][0] == 'BaseGov'){
    $data = $pontosControle[$i][1];
    $data_BaseGov = $data; //date('Y-m-d', strtotime($data, '+20 days'));
    //echo "Data de publicação BseGov: " . $data_BaseGov . "<br>";
  };
  // atribui, se exitir, o valor da data a Contrato
  if($pontosControle[$i][0] == 'Contrato'){
    $data_Contrato = $pontosControle[$i][1];
    //echo "Data de Contrato: " . $data_Contrato . "<br>";
  };
  // atribui, se exitir, o valor da data a BaseGov
  if($pontosControle[$i][0] == 'Adjudicação'){
    $data_Adjudicacao = $pontosControle[$i][1];
    //echo "Data de Adjudicação: " . $data_Adjudicacao  . "<br>";
  };
};

//echo "Pontos de Controle para o Procedimento de " . $tipoProcedimento
//      . "para o contrato de " . $tipoContrato
//      . "em Regime de " . $tipoRegime  . " -- "
//      . $quantidadePontosControle . "<br>";
//


//Enviar os resultados para html

echo "
  <div class='progress small' style='height: 40px;' >";
  //foreach($fases as $fase){
    for($i = 0; $i < count($pontosControle); $i++){
      if($pontosControle[$i][1] == 0){
        // Se a fase não estiver registada, lista apenas o nome da fase
        echo "<div class='progress-bar bg-info' role='progressbar' style='width: 45%;'
          aria-valuenow='0'
          aria-valuemin='0' aria-valuemax='100'>".$pontosControle[$i][0]."
      </div>";
      } else{
        if($pontosControle[$i][1] < $pontosControle[$i-1][1] || 
          ($pontosControle[$i][0] == 'BaseGov' && $data_BaseGov > $data_Adjudicacao && $data_BaseGov > $data_Contrato)){
          // Se a data de registo em BaseGov ultrapassar em 20 dias as
          //datas de Adjudicação ou de Contrato - Fica a vermelho
          echo "
          <div class='progress-bar bg-danger' role='progressbar' style='width: 45%;' aria-valuenow='$incremento'
            aria-valuemin='0' aria-valuemax='100'>".$pontosControle[$i][0]."
            <div style='display: flex; justify-content: center; margin-top: 15px;'
              tabindex='0'
              role='button'
              data-bs-toggle='popover'
              data-bs-trigger='focus'
              data-bs-placement='top'
              title='".$pontosControle[$i][2]."'
              data-bs-content='".$pontosControle[$i][2]."'>".$pontosControle[$i][1]."</div>
          </div>";
          //Oito etapas
          $incremento += 20;
          } else {
            echo "
              <div class='progress-bar bg-success' role='progressbar' style='width: 45%;'
                aria-valuenow='$incremento'
                aria-valuemin='0' aria-valuemax='100'>".$pontosControle[$i][0]."
                <div style='display: flex; justify-content: center; margin-top: 15px;'
                tabindex='0'
                role='button'
                data-bs-toggle='popover'
                data-bs-trigger='focus'
                data-bs-placement='top'
                title='".$pontosControle[$i][1]."'
                data-bs-content='".$pontosControle[$i][2]."'
                  >".$pontosControle[$i][1]."</div>
              </div>";
              //Oito etapas
              $incremento += 20;
            }
          }
        };

     // };
echo "</div>";
