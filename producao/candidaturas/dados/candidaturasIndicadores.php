<?php
//session_start();
include "../../../global/config/dbConn.php";


// dados para dashCandidaturas sem interações - Search ou outras
$query = "SELECT
    cs.candsub_programa AS programa,
    ca.cand_logo AS logo,
    cs.candsub_aviso AS aviso,
    cs.candsub_codigo AS candidatura,
    cs.candsub_nome AS descricao,
    cs.candsub_dt_inicio AS inicio,
    cs.candsub_dt_fim AS termo,
    cs.candsub_max_elegivel AS valor_aprovado,
    cs.candsub_fundo AS percent,
    p.proces_check AS processo,
    p.proces_nome AS processo_nome,
    p.proces_cpv_sigla AS tipo,
    COALESCE(ha.adjudicado, 0) AS adjudicado_por_processo,
    COALESCE(fp.faturado, 0) AS faturado_por_processo,
    COALESCE(mtp.previsto_kmRede / 1000, 0) AS KmRede_previsto,
    COALESCE(ap.executado_kmRede / 1000, 0) AS KmRede_executado,
    COALESCE(mtp.previsto_numRamais, 0) AS numRamais_previsto,
    COALESCE(ap.executado_numRamais, 0) AS numRamais_executado
    FROM candidaturas_submetidas cs
        -- Para acesso ao logo da Candidatura
        LEFT JOIN candidaturas_avisos ca ON ca.cand_aviso = cs.candsub_aviso
        -- Todos os processos da candidatura
        LEFT JOIN processo p ON p.proces_cand = cs.candsub_codigo
        -- Soma as adjudicações por processo
        LEFT JOIN (
            SELECT
                h.historico_proces_check,
                ROUND(SUM(CASE WHEN h.historico_descr_cod = 14 THEN h.historico_valor ELSE 0 END), 2) AS adjudicado
            FROM historico h
            GROUP BY h.historico_proces_check
            ) ha ON ha.historico_proces_check = p.proces_check
        -- Soma das faturas por processo
        LEFT JOIN (
            SELECT
                f.fact_proces_check,
                ROUND(SUM(CASE WHEN f.fact_tipo = 'FTN' THEN f.fact_valor ELSE 0 END), 2) AS faturado
            FROM factura f
            GROUP BY f.fact_proces_check
            ) fp ON fp.fact_proces_check = p.proces_check
        -- Soma dos objetos dos autos por processo
        LEFT JOIN (
            SELECT
                a.auto_check,
                ROUND(SUM(CASE WHEN a.auto_objecto = 'Tubagens' AND a.auto_num < 90 THEN a.auto_qt ELSE 0 END), 2) AS executado_kmRede,
                ROUND(SUM(CASE WHEN a.auto_objecto = 'Ramais' AND a.auto_num < 90 THEN a.auto_qt ELSE 0 END), 2) AS executado_numRamais
            FROM obra_autos a
            GROUP BY a.auto_check
            ) ap ON ap.auto_check = p.proces_check
        -- Soma dos objetos do mapa de trabalhos por processo
        LEFT JOIN (
            SELECT
                mt.mt_check,
                ROUND(SUM(CASE WHEN mt.mt_objecto = 'Tubagens' THEN mt.mt_qt ELSE 0 END), 2) AS previsto_kmRede,
                ROUND(SUM(CASE WHEN mt.mt_objecto = 'Ramais' THEN mt.mt_qt ELSE 0 END), 2) AS previsto_numRamais
            FROM mapa_trabalhos mt
            GROUP BY mt.mt_check
            ) mtp ON mtp.mt_check = p.proces_check
    WHERE p.proces_cpv_sigla = 'EMP' AND p.proces_report_valores = 1
    ORDER BY cs.candsub_dt_fim DESC, cs.candsub_programa, p.proces_check";

$stmt = $myConn->query($query);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Set the HTTP Content-Type header to indicate that the response is in JSON format
header('Content-Type: application/json');

echo json_encode($data);

