<?php
require_once __DIR__ . "/../../../global/config/dbConn.php";

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


header('Content-Type: application/json; charset=utf-8');

$itemProcurado = $_GET['itemProcurado'] ?? null;
//$itemProcurado = 'PRR-RE-C09-i01_2024_12396'

if (!$itemProcurado) {
    echo json_encode(["error" => "Parâmetro 'itemProcurado' é obrigatório."]);
    exit;
}

try {

    // === 1) CANDIDATURA ===
    $qryCandidaturas = "SELECT
            candsub_estado AS estado,
            candsub_programa AS programa,
            candsub_aviso AS aviso,
            candsub_codigo AS candidatura,
            candsub_nome AS designacao,
            candsub_dt_submissao AS submissao,
            candsub_dt_aprovacao AS aprovacao,
            candsub_dt_aceitacao AS aceitacao,
            candsub_dt_inicio AS inicio,
            candsub_dt_fim AS termo,
            candsub_max_elegivel AS elegivel,
            candsub_forfait AS defice_financeiro,
            candsub_fundo AS taxa,
            ca.cand_logo AS logo
        FROM candidaturas_submetidas
        INNER JOIN candidaturas_avisos ca ON ca.cand_aviso = candsub_aviso
        WHERE candsub_codigo = :itemProcurado";

    $cand = $myConn->prepare($qryCandidaturas);
    $cand->bindParam(':itemProcurado', $itemProcurado, PDO::PARAM_STR);
    $cand->execute();
    $candidatura = $cand->fetch(PDO::FETCH_ASSOC);

    if (!$candidatura) {
        echo json_encode(["error" => "Candidatura não encontrada."]);
        exit;
    }


    // === 2) PROCESSOS ASSOCIADOS ===
    $qryProcessos = "SELECT
            proces_check,
            proces_cand,
            proces_padm AS padm,
            proces_nome AS designacao
        FROM processo
        WHERE proces_cand = :candidatura
        AND proces_report_valores = 1
        ORDER BY proces_nome
    ";

    $stmtProc = $myConn->prepare($qryProcessos);
    $stmtProc->bindParam(':candidatura', $itemProcurado, PDO::PARAM_STR);
    $stmtProc->execute();
    $processos = $stmtProc->fetchAll(PDO::FETCH_ASSOC);


    // Estrutura final
    $candidatura["processos"] = [];


    // === 3) PARA CADA PROCESSO LEVA HISTÓRICO E FATURAS ===
    foreach ($processos as $proc) {

        $proc_check = $proc["proces_check"];

        // 3A) HISTÓRICO 91 e 92
        $qryHistorico = "SELECT
                historico_proces_check,
                historico_descr_cod,
                historico_dataemissao,
                historico_doc,
                historico_num,
                COALESCE(historico_valor, 0) AS valor
            FROM historico
            WHERE historico_proces_check = :pc
            AND historico_descr_cod IN (14, 91, 92)
            ORDER BY historico_dataemissao
        ";

        $stmtHist = $myConn->prepare($qryHistorico);
        $stmtHist->bindParam(':pc', $proc_check, PDO::PARAM_INT);
        $stmtHist->execute();
        $historico = $stmtHist->fetchAll(PDO::FETCH_ASSOC);


        // extrair lista dos pedidos de pagamento (descrição 91)
        $pedidos_pagamento = array_column(
            array_filter($historico, fn($h) => $h["historico_descr_cod"] == 91),
            "historico_num"
        );

        // Se não existir nenhum pedido, evitar erro de IN ()
        $pedidos_placeholders = implode(',', array_fill(0, count($pedidos_pagamento), '?'));


        // 3B) FATURAS associadas ao processo e ao pedido
        $faturas = [];

        if (!empty($pedidos_pagamento)) {

            $qryFaturas = "SELECT
                    fact_proces_check,
                    fact_finan_pp,
                    fact_tipo,
                    fact_data,
                    fact_expediente,
                    fact_auto_num,
                    fact_num,
                    COALESCE(fact_valor, 0) AS valor
                FROM factura
                WHERE fact_proces_check = ?
                AND fact_finan_pp IN ($pedidos_placeholders)
                ORDER BY fact_auto_num, fact_data
            ";

            $stmtFat = $myConn->prepare($qryFaturas);

            // primeiro parâmetro = proces_check
            $stmtFat->bindValue(1, $proc_check, PDO::PARAM_INT);

            // restantes = pedidos de pagamento
            $i = 2;
            foreach ($pedidos_pagamento as $pp) {
                $stmtFat->bindValue($i, $pp, PDO::PARAM_INT);
                $i++;
            }

            $stmtFat->execute();
            $faturas = $stmtFat->fetchAll(PDO::FETCH_ASSOC);
        }

        // adicionar ao processo
        $proc["historico"] = $historico;
        $proc["faturas"] = $faturas;

        $candidatura["processos"][] = $proc;
    }


    // === JSON FINAL ===
    echo json_encode($candidatura, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);


} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}


?>