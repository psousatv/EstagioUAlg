<?php

require_once __DIR__ . "/../../../global/config/dbConn.php";

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$orcamentoItem = $_GET['orcamentoItem'] ?? null;
$anoCorrente   = $_GET['anoCorrente'] ?? date('Y');

if (!$orcamentoItem) {
    echo json_encode(["error" => "Parâmetro 'orcamentoItem' é obrigatório."]);
    exit;
}

// Funções para buscar dados
function getRubricas($myConn, $orcamentoItem) {
    $sql = "SELECT rub_cod, rub_tipo, rub_rubrica, rub_item
            FROM rubricas
            WHERE rub_cod = :codigoRubrica";
    $stmt = $myConn->prepare($sql);
    $stmt->bindParam(':codigoRubrica', $orcamentoItem, PDO::PARAM_STR);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getOrcamentos($myConn, $orcamentoItem, $anoCorrente) {
    $sql = "SELECT orc_check, orc_rub_cod, orc_ano, orc_tipo, 
            orc_conta_agregadora, orc_conta_descritiva, orc_valor_previsto
            FROM orcamento
            WHERE orc_rub_cod = :codigoRubrica
            AND orc_ano = :anoCorrente
            GROUP BY orc_conta_descritiva
            ORDER BY orc_check";
    $stmt = $myConn->prepare($sql);
    $stmt->bindParam(':codigoRubrica', $orcamentoItem, PDO::PARAM_STR);
    $stmt->bindParam(':anoCorrente', $anoCorrente, PDO::PARAM_STR);
    $stmt->execute();

    $orcamentos = [];
    $totalPrevistoOrcamento = 0;
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $orcamentos[] = $row;
        $totalPrevistoOrcamento += $row['orc_valor_previsto'];
    }
    return [$orcamentos, $totalPrevistoOrcamento];

}

function getProcessos($myConn, $indexOrcamento) {
    $codigoDescritivo = 14; // Adjudicação
    $sql = "SELECT proces_check, proces_orc_ano, proces_rub_cod, proces_orc_check, 
            p.proced_regime AS regime, proces_nome,
            SUM(COALESCE(historico_valor, 0)) AS valorAdjudicacoes
            FROM processo
            INNER JOIN procedimento p on proces_proced_cod = p.proced_cod
            INNER JOIN historico h ON historico_proces_check = proces_check
            WHERE proces_orc_check = :indexOrcamento
            AND historico_descr_cod = :codigoDescritivo
            AND proces_report_valores = 1
            ORDER BY proces_nome";
    $stmt = $myConn->prepare($sql);
    $stmt->bindParam(':indexOrcamento', $indexOrcamento, PDO::PARAM_STR);
    $stmt->bindParam(':codigoDescritivo', $codigoDescritivo, PDO::PARAM_STR);
    $stmt->execute();

    $processos = [];
    $totalAdjudicadoProcessos = 0;
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $processos[] = $row;
        $totalAdjudicadoProcessos += $row['valorAdjudicacoes'];
    }
    return [$processos, $totalAdjudicadoProcessos];
}


function getFaturas($myConn, $proces_check) {
    $sql = "SELECT fact_proces_check, fact_expediente, fact_tipo, fact_data, fact_valor
            FROM factura
            WHERE fact_proces_check = :codigoProcesso";
    $stmt = $myConn->prepare($sql);
    $stmt->bindParam(':codigoProcesso', $proces_check, PDO::PARAM_STR);
    $stmt->execute();

    $faturas = [];
    $totalFaturas = 0;
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $faturas[] = $row;
        $totalFaturas += $row['fact_valor'];
    }
    return [$faturas, $totalFaturas];
}

// Montar JSON final
$rubricas = getRubricas($myConn, $orcamentoItem);
$jsonDados = [];

foreach ($rubricas as $rubrica) {
    list($orcamentos, $totalPrevistoOrcamento) = getOrcamentos($myConn, $orcamentoItem, $anoCorrente);

    $rubricaDados = [
        'codigoRubrica'    => $rubrica['rub_cod'],
        'descricaoRubrica' => $rubrica['rub_rubrica'],
        'descricaoItem'    => $rubrica['rub_item'],
        'totaisPrevisto'   => 0,
        'totaisAdjudicado' => 0,
        'totaisFaturado'   => 0,
        'orcamentos'       => []
    ];

    $totalProcessosRubrica = 0;
    $totalFaturasRubrica = 0;

    foreach ($orcamentos as $orcamento) {
        list($processos, $totalAdjudicadoProcessos) = getProcessos($myConn, $orcamento['orc_check']);

        $orcamentoDados = [
            'indexOrcamento'            => $orcamento['orc_check'],
            'codigoRubrica'             => $orcamento['orc_rub_cod'],
            'descricaoRubricaOrcamento' => $orcamento['orc_conta_agregadora'],
            'descricaoItemOrcamento'    => $orcamento['orc_conta_descritiva'],
            'valorItemOrcamentoPrevisto'=> round($orcamento['orc_valor_previsto'],2),
            'valorItemOrcamentoAdjudicado'=> round($totalAdjudicadoProcessos,2),
            'valorItemOrcamentoFaturado'=> 0,
            'processos'                 => []
        ];

        foreach ($processos as $processo) {
            list($faturas, $totalFaturas) = getFaturas($myConn, $processo['proces_check']);

            $processoDados = [
                'indexProcesso'           => $processo['proces_check'],
                'indexOrcamento'          => $processo['proces_orc_check'],
                'regime'               => $processo['regime'],
                'descricao'               => $processo['proces_nome'],
                'valorProcessoAdjudicado' => round($processo['valorAdjudicacoes'],2), //Alterar para ir buscar ao histórico
                'valorProcessoFaturado'   => round($totalFaturas,2),
                'saldoProcesso'           => round($processo['valorAdjudicacoes'] - $totalFaturas,2),
                'faturas'                 => $faturas
            ];

            $orcamentoDados['processos'][] = $processoDados;
            $totalFaturasRubrica += $totalFaturas;
        }

        // Atualiza valor faturado do orçamento
        $orcamentoDados['valorItemOrcamentoFaturado'] = round(array_sum(array_column($orcamentoDados['processos'], 'valorProcessoFaturado')), 2);

        $rubricaDados['orcamentos'][] = $orcamentoDados;
        $totalProcessosRubrica += $totalAdjudicadoProcessos;
    }

    // Totais da rubrica
    $rubricaDados['totaisPrevisto']   = round($totalPrevistoOrcamento,2);
    $rubricaDados['totaisAdjudicado'] = round($totalProcessosRubrica,2);
    $rubricaDados['totaisFaturado']   = round($totalFaturasRubrica,2);

    $jsonDados[] = $rubricaDados;
}


// Retorno JSON
header('Content-Type: application/json; charset=utf-8');
echo json_encode(['rubricas' => $jsonDados], JSON_PRETTY_PRINT);
