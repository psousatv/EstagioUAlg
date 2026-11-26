<?php

// ==========================================================
// ORÇAMENTO DASHBOARD
// Recolha de dados sem cálculos financeiros
// ==========================================================

include "../../../global/config/dbConn.php";

header('Content-Type: application/json; charset=utf-8');

try {

    // ======================================================
    // FUNÇÃO DE CONSULTA
    // ======================================================

    function consultar($conn, $sql) {

        $stmt = $conn->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    // ======================================================
    // 1. RUBRICAS
    // ======================================================

    $rubricas = consultar($myConn, "
        SELECT
            r.rub_cod AS cod,
            r.rub_tipo AS tipo,
            r.rub_rubrica AS rubrica,
            r.rub_item AS item

        FROM rubricas r

        WHERE r.rub_cod NOT IN (999)

        ORDER BY
            r.rub_cod,
            r.rub_tipo DESC,
            r.rub_rubrica,
            r.rub_item
    ");


    // ======================================================
    // 2. ORÇAMENTOS
    // Todos os anos
    // ======================================================

    $orcamentos = consultar($myConn, "
        SELECT
            o.orc_check,
            o.orc_rubrica,
            o.orc_ano AS ano,
            o.orc_tipo AS tipo,
            o.orc_regime AS regime,
            o.orc_conta_descritiva AS descritivo,
            o.orc_valor_previsto AS orcamento

        FROM orcamento o

        WHERE o.orc_rubrica NOT IN (999)

        ORDER BY
            o.orc_ano,
            o.orc_rubrica,
            o.orc_regime,
            o.orc_tipo
    ");


    // ======================================================
    // 3. PROCESSOS
    // Independentemente do ano do orçamento
    // ======================================================

    $processos = consultar($myConn, "
        SELECT
            p.proces_check,
            p.proces_orc_check,

            o.orc_rubrica,
            o.orc_ano AS ano_orcamento,

            p.proces_linha_orc AS linha_orcamento,
            p.proces_linha_se AS linha_se,
            p.proces_padm AS padm,

            proc.proced_regime AS regime,

            p.proces_nome AS designacao,
            p.proces_val_max AS val_max,
            p.proces_report_valores

        FROM processo p

        LEFT JOIN procedimento proc
            ON proc.proced_cod = p.proces_proced_cod

        INNER JOIN orcamento o
            ON o.orc_check = p.proces_orc_check

        WHERE o.orc_rubrica NOT IN (999)
          AND p.proces_report_valores = 1

        ORDER BY
            o.orc_rubrica,
            p.proces_nome
    ");


    // ======================================================
    // 4. HISTÓRICOS
    // Valores que integram as adjudicações
    // ======================================================

    $historicos = consultar($myConn, "
        SELECT
            h.historico_proces_check AS proces_check,
            h.historico_descr_cod AS tipo,
            h.historico_valor AS valor

        FROM historico h

        INNER JOIN processo p
            ON p.proces_check = h.historico_proces_check

        INNER JOIN orcamento o
            ON o.orc_check = p.proces_orc_check

        WHERE o.orc_rubrica NOT IN (999)
          AND p.proces_report_valores = 1
          AND h.historico_descr_cod IN (9, 14, 100)
    ");


    // ======================================================
    // 5. FATURAS
    // Todos os anos
    // ======================================================

    $faturas = consultar($myConn, "
        SELECT
            f.fact_proces_check,

            e.ent_nome,

            f.fact_auto_num,
            f.fact_auto_data,
            f.fact_tipo,
            f.fact_expediente,
            f.fact_num,
            f.fact_data,
            f.fact_iva,
            f.fact_valor

        FROM factura f

        INNER JOIN processo p
            ON p.proces_check = f.fact_proces_check

        INNER JOIN orcamento o
            ON o.orc_check = p.proces_orc_check

        LEFT JOIN entidade e
            ON e.ent_cod = f.fact_ent_cod

        WHERE o.orc_rubrica NOT IN (999)
          AND p.proces_report_valores = 1

        ORDER BY
            o.orc_rubrica,
            f.fact_proces_check,
            f.fact_data,
            f.fact_num
    ");


    // ======================================================
    // 6. RETORNO JSON
    // ======================================================

    echo json_encode([

        'rubricas'   => $rubricas,
        'orcamentos' => $orcamentos,
        'processos'  => $processos,
        'historicos' => $historicos,
        'faturas'    => $faturas

    ], JSON_UNESCAPED_UNICODE);


} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        'error' => 'Erro ao consultar a base de dados.'
    ], JSON_UNESCAPED_UNICODE);

    error_log($e->getMessage());
}