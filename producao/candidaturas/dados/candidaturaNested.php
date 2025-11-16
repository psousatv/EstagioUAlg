<?php
require_once __DIR__ . "/../../../global/config/dbConn.php";

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


header('Content-Type: application/json; charset=utf-8');

$itemProcurado = $_GET['itemProcurado'] ?? null;
$anoCorrente   = $_GET['anoCorrente'] ?? date('Y');

if (!$itemProcurado) {
    echo json_encode(["error" => "Parâmetro 'itemProcurado' é obrigatório."]);
    exit;
}

try {
    // === Candidaturas ===
    $qryCandidaturas = "SELECT
        candsub_estado AS estado,
        candsub_programa AS programa,
        candsub_aviso AS aviso,
        candsub_codigo AS candidatura,
        candsub_nome AS designacao,
        candsub_submissao AS submissao,
        candsub_aprovacao AS aprovacao,
        candsub_aceitacao AS aceitacao,
        candsub_dt_inicio AS inicio,
        candsub_dt_fim AS termo,
        candsub_max_elegivel AS elegivel,
        candsub_forfait AS defice_financeiro,
        candsub_fundo AS taxa
        FROM candidaturas_submetidas
        WHERE candsub_codigo = :itemProcurado";

    $stmt = $myConn->prepare($qryCandidaturas);
    $stmt->bindParam(':itemProcurado', $itemProcurado, PDO::PARAM_INT);
    $stmt->execute();
    $candidaturas = $stmt->fetch(PDO::FETCH_ASSOC);

    // === Historico ===
    $itemsHistorico = [91, 92];
    $qryHistorico = "SELECT
        historico_proces_check,
        historico_descr_cod,
        historico_dataemissao,
        historico_doc,
        historico_num,
        COALESCE(historico_valor, 0)
        FROM historico
        WHERE historico_descr_cod IN :itemsHistorico";

    $stmt = $myConn->prepare($qryHistorico);
    $stmt->bindParam(':itemsHistorico', $itemsHistorico, PDO::PARAM_INT);
    $stmt->execute();
    $historico = $stmt->fetch(PDO::FETCH_ASSOC);

    // === Processos ===
    //$processosId = array_column($listaProcessos, 'proces_check');
    //$processos = [];

    //if (!empty($processosId)) {
    //    $placeholders = implode(',', array_fill(0, count($processosId), '?'));

        $qryProcessos = "SELECT
            proces_check,
            proces_orc_check,
            proces_linha_orc AS linha_orc,
            proces_linha_se AS linha_se,
            proces_padm AS padm,
            processo.proced_regime AS regime,
            proces_nome AS designacao,
            proces_val_max AS previsto,
            (SELECT COALESCE(SUM(h14.historico_valor), 0) 
            FROM historico h14 
            WHERE h14.historico_proces_check = proces_check
            AND h14.historico_descr_cod = 14) AS adjudicado,
            (SELECT COALESCE(SUM(f.fact_valor), 0)
            FROM factura f 
            WHERE f.fact_proces_check = proces_check
            AND YEAR(f.fact_data) = $anoCorrente) AS faturado
            FROM processo
            INNER JOIN procedimento processo ON processo.proced_cod = proces_proced_cod
            WHERE proces_orc_check IN ($placeholders)
            AND proces_report_valores = 1
            GROUP BY proces_check
            ORDER BY proces_nome";

        $stmtProc = $myConn->prepare($qryProcessos);
        $stmtProc->execute($processosId);
        $listaProcessos = $stmtProc->fetchAll(PDO::FETCH_ASSOC);
    //}

    // === Agrupa os Processos por Candidatura ===
    //$mapP = [];
    //foreach ($processos as $processo) {
    //    $mapP[$processo['proces_orc_check']][] = $processo;
    //}

    //foreach ($listaProcessos as &$orc) {
    //    $orc['processos'] = $mapP[$orc['orc_check']] ?? [];
    //}

    // === RETORNO FINAL: Candidatura + Data ===
    echo json_encode([
        "candidatura" => $candidatura,
        "data"    => $listaProcessos
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>