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
    -- se houver nome do processo
    COALESCE(fp.faturado, 0) AS faturado_por_processo,
    COALESCE(ap.kmRede / 1000, 0) AS KmRede_por_processo,
    COALESCE(ap.numRamais, 0) AS numRamais_por_processo
    FROM candidaturas_submetidas cs
        -- Para acesso ao logo da Candidatura
        LEFT JOIN candidaturas_avisos ca ON ca.cand_aviso = cs.candsub_aviso
    
        -- Todos os processos da candidatura
        LEFT JOIN processo p ON p.proces_cand = cs.candsub_codigo
        -- Soma das faturas por processo
        LEFT JOIN (
            SELECT
                f.fact_proces_check,
                ROUND(SUM(f.fact_valor), 2) AS faturado
            FROM factura f
            GROUP BY f.fact_proces_check
            ) fp ON fp.fact_proces_check = p.proces_check
        -- Soma dos objetos dos autos por processo
        LEFT JOIN (
            SELECT
                a.auto_check,
                ROUND(SUM(CASE WHEN a.auto_objecto = 'Tubagens' THEN a.auto_qt ELSE 0 END), 2) AS kmRede,
                ROUND(SUM(CASE WHEN a.auto_objecto = 'Ramais' THEN a.auto_qt ELSE 0 END), 2) AS numRamais
            FROM obra_autos a
            GROUP BY a.auto_check
            ) ap ON ap.auto_check = p.proces_check
    WHERE p.proces_cpv_sigla = 'EMP'
    ORDER BY cs.candsub_dt_fim DESC, cs.candsub_programa, p.proces_check";

$stmt = $myConn->query($query);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Set the HTTP Content-Type header to indicate that the response is in JSON format
header('Content-Type: application/json');

echo json_encode($data);

