<?php
include "../../../global/config/dbConn.php";

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$orcamentoItem = $_GET['orcamentoItem'] ?? null;
$anoCorrente   = $_GET['anoCorrente'] ?? date('Y');

if (!$orcamentoItem) {
    echo json_encode(["error" => "Parâmetro 'orcamentoItem' é obrigatório."]);
    exit;
}

// 🔹 Rubrica - Informações da rubrica principal
$qryRubrica = "SELECT rub_cod, rub_tipo, rub_rubrica, rub_item FROM rubricas WHERE rub_cod = :codigoRubrica";
$stmRubrica = $myConn->prepare($qryRubrica);
$stmRubrica->bindParam(':codigoRubrica', $orcamentoItem, PDO::PARAM_STR);
$stmRubrica->execute();
$rubrica = $stmRubrica->fetch(PDO::FETCH_ASSOC); // Rubrica isolada

if (!$rubrica) {
    echo json_encode(["error" => "Rubrica não encontrada."]);
    exit;
}

// 🔹 Lista de Rubricas no Orçamento com o mesmo rub_cod
$qryListaRubricas = "SELECT orc_check, orc_rub_cod, orc_ano, orc_tipo, orc_descritivo, orc_observacoes, orc_valor_previsto 
                     FROM orcamento 
                     WHERE orc_rub_cod = :codigoRubrica
                     AND orc_ano = :anoCorrente";
$stmListaRubricas = $myConn->prepare($qryListaRubricas);
$stmListaRubricas->bindParam(':anoCorrente', $anoCorrente, PDO::PARAM_STR);
$stmListaRubricas->bindParam(':codigoRubrica', $orcamentoItem, PDO::PARAM_STR);
$stmListaRubricas->execute();
$listaRubricas = $stmListaRubricas->fetchAll(PDO::FETCH_ASSOC);

// 🔹 Processos - Obter os processos relacionados a essa rubrica
// 🔹 Historico - Equacionar usar a tabela historico para somar as adjudicações
$qryProcessos = "SELECT proces_check, proces_orc_ano, proces_rub_cod, proces_orcamento, proces_nome, proces_val_adjudicacoes
                 FROM processo
                 WHERE proces_rub_cod = :codigoRubrica
                 AND proces_orc_ano = :anoCorrente
                 AND proces_report_valores = 1
                 ORDER BY proces_nome";
$stmProcessos = $myConn->prepare($qryProcessos);
$stmProcessos->bindParam(':anoCorrente', $anoCorrente, PDO::PARAM_STR);
$stmProcessos->bindParam(':codigoRubrica', $orcamentoItem, PDO::PARAM_STR);
$stmProcessos->execute();
$listaProcessos = $stmProcessos->fetchAll(PDO::FETCH_ASSOC);

// 🔹 Faturas - Obter as faturas associadas a cada processo
$qryFaturas = "SELECT fact_proces_check, fact_expediente, fact_tipo, fact_data, fact_valor
               FROM factura
               WHERE fact_proces_check = :procesCheck
               ORDER BY fact_data";
$stmFaturas = $myConn->prepare($qryFaturas);
$faturas = [];

foreach ($listaProcessos as $processo) {
    $stmFaturas->bindValue(':procesCheck', $processo['proces_check'], PDO::PARAM_INT);
    $stmFaturas->execute();
    $faturas[$processo['proces_check']] = $stmFaturas->fetchAll(PDO::FETCH_ASSOC);
}

// Calculando os totais acumulados
$totalAdjudicado = 0;
$totalFaturado = 0;
$totalSaldo = 0;
// 🔹 Montar a estrutura com rubrica e listaRubricas, e agregar faturas
foreach ($listaRubricas as &$rub) {
    $rub['processos'] = [];
    foreach ($listaProcessos as $proc) {
        // Garantir que estamos considerando apenas os processos com o mesmo orc_rub_cod da rubrica
        if ($proc['proces_rub_cod'] == $rub['orc_rub_cod']) {
            // Agregar faturas para o processo
            $faturasDoProcesso = $faturas[$proc['proces_check']] ?? [];
            $proc['faturas'] = $faturasDoProcesso;

            if($proc['proces_orcamento'] == $rub['orc_check']){
                /// Calcula o acumulado de adjudicado e faturado
                $faturado = array_reduce($proc['faturas'], function($sum, $fa) {
                    return $sum + (float)$fa['fact_valor'];
                }, 0);

                $adjudicado = (float)$proc['proces_val_adjudicacoes'];
                $saldo = $adjudicado - $faturado;

                // Atualiza os totais
                $totalAdjudicado += $adjudicado;
                $totalFaturado += $faturado;
                $totalSaldo += $saldo;
         

            $proc['faturado'] = $faturado;
            $proc['adjudicado'] = $adjudicado;
            $proc['saldo'] = $saldo;
            
            }

            $rub['processos'][] = $proc; // Adiciona o processo à rubrica
        }
    }
}

// 🔹 Resposta JSON
$resposta = [
    "status" => "Sucesso",
    "data" => [
        "rubrica" => [
            "rubrica" => $rubrica['rub_rubrica'] ,
            "item" => $rubrica['rub_item']
        ],
        "listaRubricas" => $listaRubricas,
        "totais" => [
                "adjudicado" => $totalAdjudicado,
                "faturado" => $totalFaturado,
                "saldo" => $totalSaldo
        ]
    ]
];

echo json_encode($resposta, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
