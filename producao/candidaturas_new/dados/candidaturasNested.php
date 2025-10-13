<?php

require_once __DIR__ . "/../../../global/config/dbConn.php";

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$nomeCandidatura = $_GET['nomeCandidatura'] ?? null;

if (!$nomeCandidatura) {
    echo json_encode(["error" => "Parâmetro 'orcamentoItem' é obrigatório."]);
    exit;
}

// Funções para buscar dados
function getTitulo($myConn, $nomeCandidatura) {
    $sql = "SELECT rub_cod, rub_tipo, rub_rubrica, rub_item
            FROM rubricas
            WHERE rub_cod = :nomeCandidatura";
    $stmt = $myConn->prepare($sql);
    $stmt->bindParam(':nomeCandidatura', $nomeCandidatura, PDO::PARAM_STR);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getOrcamentos($myConn, $orcamentoItem, $anoCorrente) {
    $sql = "SELECT orc_check, orc_rub_cod, orc_ano, orc_tipo, orc_descritivo, orc_observacoes, orc_valor_previsto
            FROM orcamento
            WHERE orc_rub_cod = :codigoRubrica
            AND orc_ano = :anoCorrente
            ORDER BY orc_check";
    $stmt = $myConn->prepare($sql);
    $stmt->bindParam(':codigoRubrica', $orcamentoItem, PDO::PARAM_STR);
    $stmt->bindParam(':anoCorrente', $anoCorrente, PDO::PARAM_STR);
    $stmt->execute();

    $orcamentos = [];
    $totalItemPrevisto = 0;
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $orcamentos[] = $row;
        $totalItemPrevisto += $row['orc_valor_previsto'];
    }
    return [$orcamentos, $totalItemPrevisto];
}

function getProcessos($myConn, $indexOrcamento) {
    $sql = "SELECT proces_check, proces_orc_ano, proces_rub_cod, proces_orcamento, 
            p.proced_regime AS regime, proces_nome, proces_val_adjudicacoes 
            FROM processo
            INNER JOIN procedimento p on proces_proced_cod = p.proced_cod
            WHERE proces_orcamento = :indexOrcamento
            AND proces_report_valores = 1
            ORDER BY proces_nome";
    $stmt = $myConn->prepare($sql);
    $stmt->bindParam(':indexOrcamento', $indexOrcamento, PDO::PARAM_STR);
    $stmt->execute();

    $processos = [];
    $totalProcessos = 0;
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $processos[] = $row;
        $totalProcessos += $row['proces_val_adjudicacoes'];
    }
    return [$processos, $totalProcessos];
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
    list($orcamentos, $totalItemPrevisto) = getOrcamentos($myConn, $orcamentoItem, $anoCorrente);

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
        list($processos, $totalProcessos) = getProcessos($myConn, $orcamento['orc_check']);

        $orcamentoDados = [
            'indexOrcamento'            => $orcamento['orc_check'],
            'codigoRubrica'             => $orcamento['orc_rub_cod'],
            'descricaoRubricaOrcamento' => $orcamento['orc_descritivo'],
            'descricaoItemOrcamento'    => $orcamento['orc_observacoes'],
            'valorItemOrcamentoPrevisto'=> round($orcamento['orc_valor_previsto'],2),
            'valorItemOrcamentoAdjudicado'=> round($totalProcessos,2),
            'valorItemOrcamentoFaturado'=> 0,
            'processos'                 => []
        ];

        foreach ($processos as $processo) {
            list($faturas, $totalFaturas) = getFaturas($myConn, $processo['proces_check']);

            $processoDados = [
                'indexProcesso'           => $processo['proces_check'],
                'indexOrcamento'          => $processo['proces_orcamento'],
                'regime'               => $processo['regime'],
                'descricao'               => $processo['proces_nome'],
                'valorProcessoAdjudicado' => round($processo['proces_val_adjudicacoes'],2), //Alterar para ir buscar ao histórico
                'valorProcessoFaturado'   => round($totalFaturas,2),
                'saldoProcesso'           => round($processo['proces_val_adjudicacoes'] - $totalFaturas,2),
                'faturas'                 => $faturas
            ];

            $orcamentoDados['processos'][] = $processoDados;
            $totalFaturasRubrica += $totalFaturas;
        }

        // Atualiza valor faturado do orçamento
        $orcamentoDados['valorItemOrcamentoFaturado'] = round(array_sum(array_column($orcamentoDados['processos'], 'valorProcessoFaturado')), 2);

        $rubricaDados['orcamentos'][] = $orcamentoDados;
        $totalProcessosRubrica += $totalProcessos;
    }

    // Totais da rubrica
    $rubricaDados['totaisPrevisto']   = round($totalItemPrevisto,2);
    $rubricaDados['totaisAdjudicado'] = round($totalProcessosRubrica,2);
    $rubricaDados['totaisFaturado']   = round($totalFaturasRubrica,2);

    $jsonDados[] = $rubricaDados;
}

// Retorno JSON
header('Content-Type: application/json; charset=utf-8');
echo json_encode(['rubricas' => $jsonDados], JSON_PRETTY_PRINT);
