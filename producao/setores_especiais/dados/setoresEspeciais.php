<?php
include "../../../global/config/dbConn.php";
header('Content-Type: application/json; charset=utf-8');

$anoCorrente = $_GET['anoCorrente'] ?? date('Y');

// Títulos para exibição no front-end
$titulo = [
    "Plano Anual de Obras, Investimentos e Aquisições",
    "DAS",
];

try {
    // === SETORES ESPECIAIS ===
    $sqlSetoresEspeciais = "
    SELECT
        se_check,
        se_linha_se AS linha_se,
        se_linha_orcamento AS linha_orcamento,
        se_data_publicacao AS data_publicacao,
        se_descritivo AS descritivo,
        se_valor AS valor_publicado,
        se_estado AS estado
    FROM setores_especiais
    WHERE se_ano = :anoCorrente
    ORDER BY se_linha_se
    ";

    $stmt = $myConn->prepare($sqlSetoresEspeciais);
    $stmt->bindParam(':anoCorrente', $anoCorrente, PDO::PARAM_INT);
    $stmt->execute();
    $setoresEspeciais = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // === PROCESSOS COM SOMA DE VALOR MÁXIMO POR CONTRATO ===
    $sqlProcessos = "
    SELECT 
        s.se_check,
        s.se_linha_se AS linha_se,
        p.proces_check,
        p.proces_padm,
        p.proces_contrato,
        p.proces_estado_nome,
        p.proces_nome,
        p.proces_val_max,
        p.proces_val_faturacao
    FROM setores_especiais s
    LEFT JOIN processo p
        ON p.proces_linha_se = s.se_check
    WHERE s.se_ano = :anoCorrente
      AND p.proces_report_valores = 1
    ORDER BY s.se_linha_se, p.proces_nome
    ";

    $stmtProc = $myConn->prepare($sqlProcessos);
    $stmtProc->bindParam(':anoCorrente', $anoCorrente, PDO::PARAM_INT);
    $stmtProc->execute();
    $processos = $stmtProc->fetchAll(PDO::FETCH_ASSOC);

    // === AGRUPAR PROCESSOS POR LINHA_SE ===
    $processosPorLinha = [];
    $resumoValores = [
        'obras' => 0,
        'investimentos' => 0,
        'aquisicoes' => 0
    ];
    
    foreach ($processos as $proc) {
        $setorKey = $proc['linha_se']; // Associando cada processo ao seu setor
        if (!isset($processosPorLinha[$setorKey])) {
            $processosPorLinha[$setorKey] = []; // Cria uma nova chave se não existir
        }
        $processosPorLinha[$setorKey][] = $proc; // Adiciona o processo ao setor
        
        // Soma o valor máximo por contrato
        if ($proc['contrato'] == 'Obras') {
            $resumoValores['obras'] += $proc['valor_maximo'];
        } elseif ($proc['contrato'] == 'Investimentos') {
            $resumoValores['investimentos'] += $proc['valor_maximo'];
        } elseif ($proc['contrato'] == 'Aquisições') {
            $resumoValores['aquisicoes'] += $proc['valor_maximo'];
        }
    }

    // Calculando o saldo (como exemplo, você pode modificar conforme necessário)
    //$resumoValores['saldo'] = $resumoValores['obras'] + $resumoValores['investimentos'] + $resumoValores['aquisicoes'];

    // === ASSOCIA PROCESSOS A CADA LINHA ===
    foreach ($setoresEspeciais as &$setor) {
        $setor['processos'] = $processosPorLinha[$setor['linha_se']] ?? []; // Associando processos ao setor
    }

    // === RETORNO FINAL ===
    echo json_encode([
        "titulo" => $titulo,         // Títulos
        "listagem" => $setoresEspeciais, // Listagem de setores com os processos associados
        "resumoValores" => $resumoValores // Resumo de valores máximos por contrato
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    // Caso haja algum erro na execução, retorna a mensagem de erro
    echo json_encode(["error" => $e->getMessage()]);
}
?>
