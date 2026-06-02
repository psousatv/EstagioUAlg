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
    $dataInicio = $anoAtual . '-01-01';
    $dataFim    = $anoAtual . '-12-31';

    // =========================
    // Query
    // =========================
    $sql = "SELECT
                historico.historico_proces_check,
                entidade.ent_nome,
                historico.historico_descr_cod,
                historico.historico_descr_nome,
                historico.historico_dataemissao,
                historico.historico_doc,
                historico.historico_num,
                historico.historico_valor,
                historico.historico_obs,
                processo.proces_nome,
                procedimento.proced_regime,
                procedimento.proced_contrato,
                procedimento.proced_escolha,
                rubricas.rub_tipo,
                rubricas.rub_rubrica,
                rubricas.rub_item
            FROM historico
            INNER JOIN entidade ON historico.historico_ent_cod = entidade.ent_cod
            INNER JOIN processo ON historico.historico_proces_check = processo.proces_check
            INNER JOIN procedimento ON processo.proces_proced_cod = procedimento.proced_cod
            INNER JOIN rubricas ON processo.proces_rub_cod = rubricas.rub_cod
            WHERE historico.historico_descr_cod = :cod
              AND historico.historico_dataemissao BETWEEN :dataInicio AND :dataFim
            ORDER BY historico.historico_dataemissao";

    $stmt = $myConn->prepare($sql);

    $stmt->execute([
        'cod' => $cod,
        'dataInicio' => $dataInicio,
        'dataFim' => $dataFim
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