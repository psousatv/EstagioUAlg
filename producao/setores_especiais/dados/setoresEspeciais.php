<?php
include "../../../global/config/dbConn.php";
header('Content-Type: application/json; charset=utf-8');

$anoCorrente   = $_GET['anoCorrente'] ?? date('Y');

// $placeholders é o que une os processos à listagem de setores especiais

try {
    
    // === PROCESSOS ===
    $sqlProcessos = "SELECT
        proces_check,
        proces_linha_se AS linha_se,
        proces_linha_orc AS linha_orcamento,
        proc.proced_regime AS regime,
        proces_padm AS padm,
        proces_nome AS designacao,
        proces_val_max AS maximo_aprovado,
        FROM processo
        WHERE proces_check IN ($placeholders)
        AND proces_report_valores = 1
        GROUP BY proces_check
        ORDER BY proces_nome";

    $stmtProc = $myConn->prepare($sqlProcessos);
    $stmt->bindParam(':anoCorrente', $anoCorrente, PDO::PARAM_INT);
    $stmtProc->execute();
    $processos = $stmtProc->fetchAll(PDO::FETCH_ASSOC);

    // WHERE YEAR(proces_data_pub_se) = :anoCorrente

    // === FATURAÇÃO ===

    
 

    // === AGRUPAR PROCESSOS POR ORÇAMENTO ===


    // === RETORNO FINAL: Listagem + processos ===
    echo json_encode([
        "listagem" => $listagem,
        "processos" => $processos,
        "faturacao" -> $faturas
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>