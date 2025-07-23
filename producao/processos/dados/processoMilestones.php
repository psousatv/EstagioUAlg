<?php
//session_start();
include "../../../global/config/dbConn.php";

// Array de códigos de documentos
$descritivos = [1, 4, 5, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 26, 27, 28, 29, 30];
$codigoProcesso = isset($_GET['codigoProcesso']) ? intval($_GET['codigoProcesso']) : 0;
$i = 0;

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
        MIN(COALESCE(h1.historico_datamov, 0)) AS data_validacao_documento,
        h1.historico_valor AS valor_documento,
        MIN(COALESCE(h1.historico_doc, 0)) AS referencias,
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


// ************************************************
// Filtrar os descritivos por tipo de procedimento
// para atribuição de valores às variáveis
// Localizar o tipo de contrato

$tipoRegime = [];
$tipoProcedimento = [];
$tipoContrato = [];
$dispensaControlar = [];
$fasesControlar = [];


for($i = 0; $i < count($resultados); $i++){
  if($resultados[$i]['data_documento'] != 0){
    if (
      $resultados[$i]['procedimento'] == 'Ajuste Direto Simplificado' &&
      $resultados[$i]['valor_documento'] >= 10000){
      // Procedimento por Ajuste Direto Simplificado de valor >= 10.000 [inclui contrato]
      // Deve vir primeiro que o genérico, senão não é executado
        $tipoRegime = $resultados[$i]['regime'];
        $tipoContrato = $resultados[$i]['contrato'];
        $tipoProcedimento = $resultados[$i]['procedimento'];
        $dispensaControlar = [5, 11, 12, 13, 15, 16, 18, 19, 26, 27, 28, 29, 30];
        $fasesControlar = [4, 14, 17];
        break; // Pára o ciclo ao encontrar a condição
    } elseif (
      // Procedimento por Ajuste Direto Simplificado
      $resultados[$i]['procedimento'] == 'Ajuste Direto Simplificado' &&
      $resultados[$i]['valor_documento'] < 10000){
        $tipoRegime = $resultados[$i]['regime'];
        $tipoContrato = $resultados[$i]['contrato'];
        $tipoProcedimento = $resultados[$i]['procedimento'];
        $dispensaControlar = [5, 11, 12, 13, 15, 16, 17, 18, 19, 26, 27, 28, 29, 30];
        $fasesControlar = [4, 14];
        break; // Pára o ciclo ao encontrar a condição
    } elseif (
    // Serviços - Qualquer Procedimento, excepto, ADs
      $resultados[$i]['procedimento'] != 'Ajuste Direto Simplificado' &&
      $resultados[$i]['contrato'] == 'Aquisição de Serviços'){
        $tipoRegime = $resultados[$i]['regime'];
        $tipoContrato = $resultados[$i]['contrato'];
        $tipoProcedimento = $resultados[$i]['procedimento'];
        $dispensaControlar = [11, 12, 19, 26, 27, 29, 30];
        $fasesControlar = [4, 5, 10, 13, 14, 15, 16, 17, 19, 28];
        break; // Pára o ciclo ao encontrar a condição
    } elseif(
      // Bens - Qualquer Procedimento, excepto, ADs
      $resultados[$i]['procedimento'] != 'Ajuste Direto Simplificado' &&
      $resultados[$i]['contrato'] == 'Aquisição de Bens'){
        $tipoRegime = $resultados[$i]['regime'];
        $tipoContrato = $resultados[$i]['contrato'];
        $tipoProcedimento = $resultados[$i]['procedimento'];
        $dispensaControlar = [11, 12, 19, 26, 28, 29, 30];
        $fasesControlar = [4, 5, 10, 13, 14, 15, 16, 17, 19, 27];
        break; // Pára o ciclo ao encontrar a condição
    } elseif(
      // Empreitadas - Qualquer Procedimento, excepto, ADs
      $resultados[$i]['procedimento'] != 'Ajuste Direto Simplificado' &&
      $resultados[$i]['contrato'] == 'Empreitada'){
        $tipoRegime = $resultados[$i]['regime'];
        $tipoContrato = $resultados[$i]['contrato'];
        $tipoProcedimento = $resultados[$i]['procedimento'];
        $dispensaControlar = [11, 12, 27, 28];
        $fasesControlar = [4, 5, 10, 13, 14, 15, 16, 17, 18, 19, 26, 29, 30];
        break; // Pára o ciclo ao encontrar a condição
    } else {
        $tipoRegime = null;
        $tipoProcedimento = null;
        $tipoContrato = null;
        $dispensaControlar = null;
        $fasesControlar = null;
    };
  } else {
    continue;
  };
  
};


$pontosControle = [];
$referenciasControle = [
                        $resultado['documento'], 
                        $resultado['data_documento'], 
                        $resultado['data_validacao_documento'], 
                        $resultado['referencias'], 
                        $resultado['notas']
                      ];

// Interagir nos resultados da query e descartar os pontos de controle
// que não pertencem ao procedimento
foreach($resultados as $resultado){
  if ($tipoContrato == 'Aquisição de Serviços') {
    if (in_array($resultado['movimento'], $fasesControlar)) {
      //continue;
      $pontosControle[] = [
                            $resultado['documento'], 
                            $resultado['data_documento'], 
                            $resultado['data_validacao_documento'], 
                            $resultado['referencias'], 
                            $resultado['notas']
                          ];
    }
    //$pontosControle[] = [$resultado['documento'], $resultado['data_documento'], $resultado['notas']];
  } elseif($tipoContrato == 'Aquisição de Bens'){
    if (in_array($resultado['movimento'], $fasesControlar)) {
      //continue;
      $pontosControle[] = [
                            $resultado['documento'], 
                            $resultado['data_documento'], 
                            $resultado['data_validacao_documento'], 
                            $resultado['referencias'], 
                            $resultado['notas']
                          ];
    }
    //$pontosControle[] = [$resultado['documento'], $resultado['data_documento'], $resultado['notas']];
  } elseif($tipoContrato == 'Empreitada') {
    if (in_array($resultado['movimento'], $fasesControlar)) {
      //continue;
      $pontosControle[] = [
                            $resultado['documento'], 
                            $resultado['data_documento'], 
                            $resultado['data_validacao_documento'], 
                            $resultado['referencias'], 
                            $resultado['notas']
                          ];
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
    $data_BaseGov = $pontosControle[$i][2];
    //echo "Data de publicação BseGov: " . $data_BaseGov . "<br>";
  };
  // atribui, se exitir, o valor da data a Contrato
  if($pontosControle[$i][0] == 'Contrato'){
    $data = $pontosControle[$i][2];
    $data_Contrato = date('Y-m-d', strtotime($data . '+20 days'));
    //echo "Data de Contrato: " . $data_Contrato . "<br>";
  };
  // atribui, se exitir, o valor da data a BaseGov
  if($pontosControle[$i][0] == 'Adjudicação'){
    $data = $pontosControle[$i][2];
    $data_Adjudicacao = date('Y-m-d', strtotime($data . '+20 days'));
    //echo "Data de Adjudicação: " . $data_Adjudicacao  . "<br>";
  };
};

//echo "Pontos de Controle para o Procedimento de " . $tipoProcedimento
//      . "para o contrato de " . $tipoContrato
//      . "em Regime de " . $tipoRegime  . " -- "
//      . $quantidadePontosControle . "<br>";
//

//echo 'Adjudicação: ' .$data_Adjudicacao;
//echo var_dump($pontosControle);
//Enviar os resultados para html

// **************************************




echo '<div class="stepper-wrapper">';
for($i = 0; $i < count($pontosControle); $i++){
  if($pontosControle[$i][1] == 0){
    echo '
      <div class="stepper-item nulo">
        <div class="step-counter">'.($i+1).'</div>
        <div class="step-name">'.$pontosControle[$i][0].'</div>
      </div>';
  } else { 
    if($pontosControle[$i][1] < $pontosControle[$i-1][1] || ($i != 0 && $pontosControle[$i-1][1] == 0) || 
      ($pontosControle[$i][0] == 'BaseGov' && $data_BaseGov > $data_Adjudicacao && $data_BaseGov > $data_Contrato)){
      
      if($i >0 ){
        // Dias passados entre datas
        $data_inicio = new DateTime($pontosControle[$i][1]);
        $data_fim = new DateTime($pontosControle[$i-1][1]);

        $intervalo = $data_inicio->diff($data_fim);
      };

      echo '
            <div class="stepper-item desconforme">
              <div class="step-counter position-relative" 
                tabindex="0" 
                role="button" 
                data-bs-toggle="popover" 
                data-bs-trigger="focus" 
                data-bs-placement="top"
                title="' . $pontosControle[$i][3] . ', Registo: ' . $pontosControle[$i][1] . ' - ' . $pontosControle[$i][4] . '"
                data-bs-content="' . $pontosControle[$i][2] . '">
                
                ' . ($i + 1) . '

                <span class="badge rounded-pill bg-danger text-white badge-notification"
                      style="position: absolute; top: 0; right: 0; transform: translate(50%, -50%);">
                  ' . $intervalo->days . '
                </span>
              </div>

              <div class="step-name badge bg-danger text-white">' . $pontosControle[$i][0] . '</div>
              <div class="step-name badge bg-danger text-white">' . $pontosControle[$i][2] . '</div>
              
            </div>';
    } else{
          if($i >0 ){
            // Dias passados entre datas
            $data_inicio = new DateTime($pontosControle[$i][1]);
            $data_fim = new DateTime($pontosControle[$i-1][1]);
      
            $intervalo = $data_inicio->diff($data_fim);
          };

          echo '
                <div class="stepper-item conforme">
                  <div class="step-counter position-relative" 
                    tabindex="0" 
                    role="button" 
                    data-bs-toggle="popover" 
                    data-bs-trigger="focus" 
                    data-bs-placement="top"
                    title="' . $pontosControle[$i][3] . ', Registo: ' . $pontosControle[$i][1] . ' - ' . $pontosControle[$i][4] . '"
                    data-bs-content="' . $pontosControle[$i][2] . '">
                    
                    ' . ($i + 1) . '

                    <span class="badge rounded-pill bg-info text-white badge-notification"
                          style="position: absolute; top: 0; right: 0; transform: translate(50%, -50%);">
                      ' . $intervalo->days . '
                    </span>
                  </div>

                  <div class="step-name badge bg-success text-white">' . $pontosControle[$i][0] . '</div>
                  <div class="step-name badge bg-success text-white">' . $pontosControle[$i][2] . '</div>
                </div>';           
      }
  }
};

echo '</div>';