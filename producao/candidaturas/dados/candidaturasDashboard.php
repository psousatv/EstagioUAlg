<?php
//session_start();
include "../../../global/config/dbConn.php";


// dados para dashCandidaturas sem interações - Search ou outras
$queryOLD = "SELECT
          proces_cand AS candidatura,
          cs.candsub_estado AS estado,
          cs.candsub_programa AS programa,
          cs.candsub_fundo * 100 AS taxa,
          YEAR(cs.candsub_dt_inicio) AS inicio,
          ROUND(SUM(proces_val_adjudicacoes), 2) AS adjudicado,
          ROUND(SUM(proces_cand_elegivel), 2) AS elegivel,
          ROUND(SUM(proces_val_faturacao), 2) AS faturado,
          ROUND(SUM(proces_cand_recebido), 2) AS recebido,         
         COALESCE(ROUND((SUM(proces_cand_recebido) / SUM(proces_val_faturacao)), 4), 0) AS faturado_recebido_percent,
         COALESCE(ROUND((SUM(proces_cand_recebido) / SUM(proces_cand_elegivel)), 4), 0) AS elegivel_recebido_percent
         FROM processo
         INNER JOIN candidaturas_submetidas cs ON cs.candsub_codigo = proces_cand
         INNER JOIN historico h ON h.historico_proces_check = proces_check
         WHERE proces_cand NOT LIKE '%n.a.%' AND proces_report_valores = 1 AND h.historico_num NOT LIKE '%Ad%'
         GROUP BY proces_cand
         ORDER BY YEAR(cs.candsub_dt_inicio) DESC ";

// dados para candidaturasDashboard
$query = "SELECT
    cs.candsub_programa AS programa,
    ca.cand_logo AS logo,
    cs.candsub_aviso AS aviso,
    cs.candsub_codigo AS candidatura,
    cs.candsub_estado AS estado,
    cs.candsub_nome AS descricao,
    YEAR(cs.candsub_dt_inicio) AS inicio,
    YEAR(cs.candsub_dt_fim) AS termo,
    cs.candsub_max_elegivel AS elegivel,
    ROUND(cs.candsub_fundo, 2) AS taxa,
    COALESCE(ha.adjudicado, 0) AS adjudicado,
    COALESCE(ha.pedido, 0) AS pedido,
    COALESCE(ha.recebido, 0) AS recebido,
    COALESCE(fp.faturado, 0) AS faturado,
    COALESCE(ROUND(ha.recebido / fp.faturado, 2), 0) AS faturado_recebido_percent,
    COALESCE(ROUND(ha.recebido / cs.candsub_max_elegivel,  2), 0) AS elegivel_recebido_percent
    FROM candidaturas_submetidas cs
        -- Para acesso ao logo da Candidatura
        LEFT JOIN candidaturas_avisos ca ON ca.cand_aviso = cs.candsub_aviso
        -- Todos os processos da candidatura
        LEFT JOIN processo p ON p.proces_cand = cs.candsub_codigo
        -- Soma as adjudicações, pedidos de reembolso e reembolsos por processo
        LEFT JOIN (
            SELECT
                h.historico_proces_check,
                ROUND(SUM(CASE WHEN h.historico_descr_cod = 14 THEN h.historico_valor ELSE 0 END), 2) AS adjudicado,
                ROUND(SUM(CASE WHEN h.historico_descr_cod = 91 THEN h.historico_valor ELSE 0 END), 2) AS pedido,
                ROUND(SUM(CASE WHEN h.historico_descr_cod = 92 AND h.historico_num NOT LIKE '%Ad%'
                THEN h.historico_valor ELSE 0 END), 2) AS recebido
            FROM historico h
            GROUP BY h.historico_proces_check
            ) ha ON ha.historico_proces_check = p.proces_check
        -- Soma das faturas por processo
        LEFT JOIN (
            SELECT
                f.fact_proces_check,
                ROUND(SUM(CASE WHEN f.fact_tipo = 'FTN' OR f.fact_tipo = 'NC' THEN f.fact_valor ELSE 0 END), 2) AS faturado
            FROM factura f
            GROUP BY f.fact_proces_check
            ) fp ON fp.fact_proces_check = p.proces_check
    WHERE p.proces_cand <> 'n.a.' AND p.proces_report_valores = 1
    GROUP BY cs.candsub_codigo
    ORDER BY  cs.candsub_estado, cs.candsub_programa, YEAR(cs.candsub_dt_inicio) DESC";

$stmt = $myConn->query($query);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Set the HTTP Content-Type header to indicate that the response is in JSON format
header('Content-Type: application/json');

echo json_encode($data, JSON_PRETTY_PRINT);


//ROUND(SUM(CASE WHEN h.historico_descr_cod = 14 THEN h.historico_valor ELSE 0 END), 2) AS adjudicado,
//IF(SUM(proces_val_faturacao) = 0 OR SUM(proces_cand_recebido) = 0, 0,
//          ROUND((SUM(proces_cand_recebido) / SUM(proces_val_faturacao)), 2)) AS faturado_recebido_percent,
//IF(SUM(proces_cand_elegivel) = 0 OR SUM(proces_cand_recebido) = 0, 0,
//          ROUND((SUM(proces_cand_recebido) / SUM(proces_cand_elegivel)), 2)) AS elegivel_recebido_percent