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

// Função para buscar as rubricas
function getRubricas($MyConn, $orcamentoItem) {
    $sql = "SELECT id_rubrica, descricao FROM rubricas";
    $result = $MyConn->query($sql);

    $rubricas = [];
    while ($row = $result->fetch_assoc()) {
        $rubricas[] = $row;
    }
    return $rubricas;
}

// Função para buscar orçamentos por rubrica e calcular o somatório do valor total
function getOrcamentos($MyConn, $orcamentoItem, $anoCorrente) {
    $sql = "SELECT id_orcamento, id_rubrica, valor_total, data_inicio, data_fim FROM orcamentos WHERE id_rubrica = ? AND ano = ?";
    $stmt = $MyConn->prepare($sql);
    $stmt->bind_param("i", $orcamentoItem);
    $stmt->bind_param("a", $anoCorrente);
    $stmt->execute();
    $result = $stmt->get_result();

    $orcamentos = [];
    $totalOrcamentos = 0; // Somatório do valor total dos orçamentos
    while ($row = $result->fetch_assoc()) {
        $orcamentos[] = $row;
        $totalOrcamentos += $row['valor_total']; // Adiciona o valor do orçamento ao total
    }
    return [$orcamentos, $totalOrcamentos];
}

// Função para buscar processos por orçamento e calcular o somatório do valor total
function getProcessos($MyConn, $id_orcamento) {
    $sql = "SELECT id_processo, id_orcamento, descricao, data_inicio, data_fim FROM processos WHERE id_orcamento = ?";
    $stmt = $MyConn->prepare($sql);
    $stmt->bind_param("i", $id_orcamento);
    $stmt->execute();
    $result = $stmt->get_result();

    $processos = [];
    $totalProcessos = 0; // Somatório do valor total dos processos
    while ($row = $result->fetch_assoc()) {
        $processos[] = $row;
        // Somar o valor dos processos (Este valor deve ser associado aos processos na tabela, mas vou assumí-lo por enquanto)
        $totalProcessos += 1000; // Supondo um valor fixo para cada processo, você pode modificar isso de acordo com a lógica
    }
    return [$processos, $totalProcessos];
}

// Função para buscar faturas por processo e calcular o somatório do valor total
function getFaturas($MyConn, $id_processo) {
    $sql = "SELECT id_fatura, id_processo, valor_fatura, data_emissao, status FROM faturas WHERE id_processo = ?";
    $stmt = $MyConn->prepare($sql);
    $stmt->bind_param("i", $id_processo);
    $stmt->execute();
    $result = $stmt->get_result();

    $faturas = [];
    $totalFaturas = 0; // Somatório do valor total das faturas
    while ($row = $result->fetch_assoc()) {
        $faturas[] = $row;
        $totalFaturas += $row['valor_fatura']; // Adiciona o valor da fatura ao total
    }
    return [$faturas, $totalFaturas];
}

// Criar a estrutura do JSON
$rubricas = getRubricas($MyCon, $orcamentoItem);
$jsonData = [];

foreach ($rubricas as $rubrica) {
    list($orcamentos, $totalOrcamentos) = getOrcamentos($MyConn, $orcamentoItem);
    $rubricaDados = [
        'id_rubrica' => $rubrica['id_rubrica'],
        'descricao' => $rubrica['descricao'],
        'valor_total' => 0,  // Inicializando com 0, vamos somar os totais dos orçamentos, processos e faturas
        'orcamentos' => []
    ];

    foreach ($orcamentos as $orcamento) {
        list($processos, $totalProcessos) = getProcessos($MyConn, $orcamento['id_orcamento']);
        $orcamentoDados = [
            'id_orcamento' => $orcamento['id_orcamento'],
            'id_rubrica' => $orcamento['id_rubrica'],
            'valor_total' => $orcamento['valor_total'],
            'data_inicio' => $orcamento['data_inicio'],
            'data_fim' => $orcamento['data_fim'],
            'processos' => []
        ];

        foreach ($processos as $processo) {
            list($faturas, $totalFaturas) = getFaturas($MyConn, $processo['id_processo']);
            $processoDados = [
                'id_processo' => $processo['id_processo'],
                'id_orcamento' => $processo['id_orcamento'],
                'descricao' => $processo['descricao'],
                'data_inicio' => $processo['data_inicio'],
                'data_fim' => $processo['data_fim'],
                'faturas' => [],
                'total_processos' => $totalProcessos // Associar o total de processos
            ];

            foreach ($faturas as $fatura) {
                $processoDados['faturas'][] = [
                    'id_fatura' => $fatura['id_fatura'],
                    'id_processo' => $fatura['id_processo'],
                    'valor_fatura' => $fatura['valor_fatura'],
                    'data_emissao' => $fatura['data_emissao'],
                    'status' => $fatura['status']
                ];
            }

            $orcamentoDados['processos'][] = $processoDados;
        }

        $rubricaDados['orcamentos'][] = $orcamentoDados;
    }

    // Somando o total de cada rubrica (orcamentos + processos + faturas)
    $rubricaDados['valor_total'] = $totalOrcamentos + $totalProcessos + $totalFaturas;

    $jsonDados[] = $rubricaDados;
}

// Converter a estrutura para JSON
header('Content-Type: application/json');
echo json_encode(['rubricas' => $jsonDados], JSON_PRETTY_PRINT);
?>
