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

$tipoRegime = [];
$tipoProcedimento = [];
$tipoContrato = [];

for($i = 0; $i < count($resultados); $i++){
  if($resultados[$i]['data_documento'] != 0){
    $tipoRegime = $resultados[$i]['regime'];
    $tipoContrato = $resultados[$i]['contrato'];
    $tipoProcedimento = $resultados[$i]['procedimento'];
    break; // Pára o ciclo ao encontrar a condição
    };
  };

echo '<div>';
  //foreach($resultados as $row){
    echo '<div class="badge bg-warning">Regime: '.$tipoRegime.'</div>';
    echo '<br>';
    echo '<div class="badge bg-warning">Contrato: '.$tipoContrato.'</div>';
    echo '<br>';
    echo '<div class="badge bg-warning">Procedimento: '.$tipoProcedimento.'</div>';
    echo '<br>';
  //};
echo '</div>';