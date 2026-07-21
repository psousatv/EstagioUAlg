<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

try {

    include "../../../global/config/dbConn.php";

    if (!isset($myConn)) {
        throw new Exception("Ligação PDO não encontrada.");
    }

    // =========================
    // Tipo de exportação
    // =========================
    $tipo = $_GET['tipo'] ?? null;

    $mapa = [
        'presenciais' => 9,
        'outros'      => 15
    ];

    if (!$tipo || !isset($mapa[$tipo])) {
        throw new Exception("Tipo de exportação inválido.");
    }

    $cod = $mapa[$tipo];

    // =========================
    // Ano corrente automático
    // =========================
    $anoAtual = date('Y');
    $anoAnterior = $anoAtual - 1;

    // =========================
    // Query
    // =========================
    $sql = "SELECT
                h.historico_proces_check,
                e.ent_nome,
                h.historico_descr_cod,
                h.historico_descr_nome,
                h.historico_dataemissao,
                h.historico_doc,
                h.historico_num,
                h.historico_valor,
                h.historico_obs,
                p.proces_nome,
                pr.proced_regime,
                pr.proced_contrato,
                pr.proced_escolha,
                r.rub_tipo,
                r.rub_rubrica,
                r.rub_item
            FROM historico h
            INNER JOIN entidade e
                ON h.historico_ent_cod = e.ent_cod
            INNER JOIN processo p
                ON h.historico_proces_check = p.proces_check
            INNER JOIN procedimento pr
                ON p.proces_proced_cod = pr.proced_cod
            INNER JOIN rubricas r
                ON p.proces_rub_cod = r.rub_cod
            WHERE h.historico_descr_cod = :cod
            AND h.historico_dataemissao BETWEEN :dataInicio AND :dataFim
            ORDER BY h.historico_dataemissao;";

    $stmt = $myConn->prepare($sql);

    $stmt->execute([
        'cod' => $cod,
        'anoAtual' => $anoAtual,
        'anoAnterior' => $anoAnterior
    ]);

    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($result);
    exit;

} catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([
        "erro" => true,
        "mensagem" => $e->getMessage()
    ]);

    exit;
}