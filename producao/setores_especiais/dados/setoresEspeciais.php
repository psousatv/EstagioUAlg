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
        p.proces_val_faturacao,
        po.proced_regime,
        p.proces_proced_cod
    FROM setores_especiais s
    LEFT JOIN processo p
        ON p.proces_linha_se = s.se_check
    JOIN procedimento po
        ON p.proces_proced_cod = po.proced_cod
    WHERE s.se_ano = :anoCorrente
      AND p.proces_report_valores = 1
    ORDER BY s.se_linha_se, p.proces_proced_cod
    ";

    $stmtProc = $myConn->prepare($sqlProcessos);
    $stmtProc->bindParam(':anoCorrente', $anoCorrente, PDO::PARAM_INT);
    $stmtProc->execute();
    $processos = $stmtProc->fetchAll(PDO::FETCH_ASSOC);

    // Agrupar processos por linha_se e somar os valores de faturação e valor máximo
    $resumoValores = [];
    $processosPorLinha = [];

    foreach ($processos as $processo) {
        // Agrupar os processos por linha_se
        $linha_se = $processo['linha_se'];

        // Inicializar o array de resumo para esta linha_se, caso ainda não tenha sido inicializado
        if (!isset($resumoValores[$linha_se])) {
            $resumoValores[$linha_se] = [
                'total_val_faturacao' => 0,
                'total_val_max' => 0
            ];
        }

        // Somar os valores de faturação e valor máximo
        if ($processo['proced_regime'] == 'Setores Especiais'){
            $resumoValores[$linha_se]['total_val_faturacao'] += $processo['proces_val_faturacao'];
            $resumoValores[$linha_se]['total_val_max'] += $processo['proces_val_max'];    
        }
        
        // Agrupar processos por linha_se para adicionar na coluna "processos"
        if (!isset($processosPorLinha[$linha_se])) {
            $processosPorLinha[$linha_se] = [];
        }

        // Adiciona o processo à lista de processos para a linha_se
        $processosPorLinha[$linha_se][] = $processo;
    }

    // Adicionar o total_faturacao e os processos diretamente à listagem de setores especiais
    foreach ($setoresEspeciais as &$setor) {
        $linha_se = $setor['linha_se'];

        // Adicionar o total_faturacao diretamente
        if (isset($resumoValores[$linha_se])) {
            $setor['total_faturacao'] = $resumoValores[$linha_se]['total_val_faturacao'];
        } else {
            $setor['total_faturacao'] = 0;
        }

        // Adicionar os processos correspondentes à linha_se como uma nova coluna
        if (isset($processosPorLinha[$linha_se])) {
            $setor['processos'] = $processosPorLinha[$linha_se];  // Coluna de processos
        } else {
            $setor['processos'] = [];  // Caso não haja processos para essa linha_se
        }

        // Reorganizando as colunas, com 'total_faturacao' logo após 'valor_publicado' e 'processos' logo após 'estado'
        $setor = [
            'se_check' => $setor['se_check'],
            'linha_se' => $setor['linha_se'],
            'linha_orcamento' => $setor['linha_orcamento'],
            'data_publicacao' => $setor['data_publicacao'],
            'descritivo' => $setor['descritivo'],
            'valor_publicado' => $setor['valor_publicado'],
            'total_faturacao' => $setor['total_faturacao'],  // Adicionando após 'valor_publicado'
            'estado' => $setor['estado'],
            'processos' => $setor['processos']  // Adicionando 'processos' após 'estado'
        ];
    }

    // === RETORNO FINAL ===
    echo json_encode([
        "titulo" => $titulo,         // Títulos
        "listagem" => $setoresEspeciais, // Listagem de setores com os processos associados e total_faturacao
        "resumoValores" => $resumoValores // Resumo de valores máximos por contrato
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    // Caso haja algum erro na execução, retorna a mensagem de erro
    echo json_encode(["error" => $e->getMessage()]);
}
?>
