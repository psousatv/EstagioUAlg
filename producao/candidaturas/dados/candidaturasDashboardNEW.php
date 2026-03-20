<?php
//session_start();
include "../../../global/config/dbConn.php";

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
    ROUND(cs.candsub_fundo * 100, 2) AS taxa,
    p.proces_check AS processo,
    p.proces_nome AS processo_nome,
    p.proces_cpv_sigla AS tipo,
    COALESCE(ha.adjudicado, 0) AS adjudicado,
    COALESCE(ha.pedido, 0) AS pedido,
    COALESCE(ha.recebido, 0) AS recebido,
    COALESCE(fp.faturado, 0) AS faturado,
    COALESCE(ROUND((ha.recebido / fp.faturado) * 100, 2), 0) AS faturado_recebido_percent,
    COALESCE(ROUND((ha.recebido / cs.candsub_max_elegivel) * 100,  2), 0) AS elegivel_recebido_percent
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
                ROUND(SUM(CASE WHEN h.historico_descr_cod = 92 THEN h.historico_valor ELSE 0 END), 2) AS recebido
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
    GROUP BY cs.candsub_codigo, p.proces_check
    ORDER BY  cs.candsub_programa, YEAR(cs.candsub_dt_inicio) DESC, p.proces_check";

$stmt = $myConn->query($query);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Array hierárquico
$result = [];

foreach ($rows as $row) {
    $prog = $row['programa'];
    $cand = $row['candidatura'];
    $proc = $row['processo'];

    // Programa
    if (!isset($result[$prog])) {
        $result[$prog] = [
            'programa' => $prog,
            'candidaturas' => []
        ];
    }

    // Candidatura
    if (!isset($result[$prog]['candidaturas'][$cand])) {
        $result[$prog]['candidaturas'][$cand] = [
            'candidatura' => $cand,
            'logo' => $row['logo'],
            'aviso' => $row['aviso'],
            'estado' => $row['estado'],
            'descricao' => $row['descricao'],
            'inicio' => $row['inicio'],
            'termo' => $row['termo'],
            'elegivel' => $row['elegivel'],
            'taxa' => $row['taxa'],
            'processos' => []
        ];
    }

    // Processo
    $result[$prog]['candidaturas'][$cand]['processos'][$proc] = [
        'processo' => $proc,
        'processo_nome' => $row['processo_nome'],
        'tipo' => $row['tipo'],
        'adjudicado' => $row['adjudicado'],
        'pedido' => $row['pedido'],
        'recebido' => $row['recebido'],
        'faturado' => $row['faturado'],
        'faturado_recebido_percent' => $row['faturado_recebido_percent'],
        'elegivel_recebido_percent' => $row['elegivel_recebido_percent']
    ];
}

// Opcional: transformar chaves em arrays sequenciais
$final = [];
foreach ($result as $progData) {
    $progData['candidaturas'] = array_values($progData['candidaturas']);
    foreach ($progData['candidaturas'] as &$candData) {
        $candData['processos'] = array_values($candData['processos']);
    }
    $final[] = $progData;
}

// Devolver JSON
header('Content-Type: application/json');
echo json_encode($final, JSON_PRETTY_PRINT);


