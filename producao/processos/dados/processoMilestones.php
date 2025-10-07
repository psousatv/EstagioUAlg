<?php
include "../../../global/config/dbConn.php";

$codigoProcesso = isset($_GET['codigoProcesso']) ? intval($_GET['codigoProcesso']) : 0;
$descritivos = [1, 4, 5, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 26, 27, 28, 29, 30];

// === 1. Função: Buscar resultados ===
function buscarResultados(PDO $myConn, int $codigoProcesso, array $descritivos): array {
    $placeholders = implode(',', array_fill(0, count($descritivos), '?'));
    $sql = "
        SELECT
            p2.proced_regime AS regime,
            p2.proced_contrato AS contrato,
            p2.proced_escolha AS procedimento,
            d.descr_cod AS movimento,
            d.descr_nome AS documento,
            MIN(COALESCE(h1.historico_dataemissao, 0)) AS data_documento,
            MIN(COALESCE(h1.historico_datamov, 0)) AS data_validacao_documento,
            h1.historico_valor AS valor_documento,
            MIN(COALESCE(h1.historico_doc, 0)) AS referencias,
            MIN(COALESCE(h1.historico_notas, 'Sem anotações registadas')) AS notas
        FROM descritivos d
        LEFT JOIN historico h1 ON h1.historico_descr_cod = d.descr_cod AND h1.historico_proces_check = ?
        LEFT JOIN processo p1 ON p1.proces_check = h1.historico_proces_check AND p1.proces_check = ?
        LEFT JOIN procedimento p2 ON p2.proced_cod = p1.proces_proced_cod
        WHERE d.descr_cod IN ($placeholders)
        GROUP BY d.descr_cod, d.descr_nome, p2.proced_regime, p2.proced_contrato, p2.proced_escolha
    ";

    $stmt = $myConn->prepare($sql);
    $params = array_merge([$codigoProcesso, $codigoProcesso], $descritivos);
    $stmt->execute($params);

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// === 2. Função: Determinar tipo de contrato e fases ===
function definirTipoProcesso(array $resultados): array {
    foreach ($resultados as $res) {
        $proc = $res['procedimento'];
        $contrato = $res['contrato'];
        $valor = $res['valor_documento'];
        $regime = $res['regime'];

        // Movimento Fatura (9) removido se houver Início de Procedimento (4)
        $movimentos = array_column($resultados, 'movimento');
        if (in_array(4, $movimentos) && in_array(9, $movimentos)) {
            $movimentos = [1, 4, 14];
        } else {
            $movimentos = [1, 9, 14];
        }

        if ($valor >= 10001 && $proc == 'Ajuste Direto Simplificado') {
            return [$regime, $proc, $contrato, [], [1, 4, 14, 17]];
        } else {
            return [$regime, $proc, $contrato, [], [1, 9, 14]];
        }

        $fases = [
            'Aquisição de Serviços' => [1, 4, 5, 10, 13, 14, 19, 28],
            'Aquisição de Bens'     => [1, 4, 5, 10, 13, 14, 19, 27],
            'Empreitada'            => [1, 4, 5, 10, 13, 14, 18, 19, 26, 29, 30],
        ];

        $dispensas = [
            'Ajuste Direto Simplificado' => [5,11,12,13,16,17,18,19,26,27,28,29,30],
            'Aquisição de Serviços'      => [11,12,19,26,27,29,30],
            'Aquisição de Bens'          => [11,12,19,26,28,29,30],
            'Empreitada'                 => [11,12,27,28],
        ];

        if ($proc == 'Ajuste Direto Simplificado') {
            return [$regime, $proc, $contrato, $dispensas[$proc], $movimentos];
        }

        if (isset($fases[$contrato])) {
            return [$regime, $proc, $contrato, $dispensas[$contrato], $fases[$contrato]];
        }
    }

    return [null, null, null, [], []];
}

// === 3. Função: Filtrar pontos de controle válidos ===
function filtrarPontosControle(array $resultados, array $fases): array {
    $pontos = [];

    foreach ($resultados as $res) {
        if (in_array($res['movimento'], $fases)) {
            $pontos[] = [
                'documento' => $res['documento'],
                'data_doc'  => $res['data_documento'],
                'data_val'  => $res['data_validacao_documento'],
                'refer'     => $res['referencias'],
                'notas'     => $res['notas']
            ];
        }
    }

    return $pontos;
}

// === 4. Função: Gerar HTML Stepper ===
function gerarHTMLStepper(array $pontos): void {
    echo '<div class="stepper-wrapper">';
    
    foreach ($pontos as $i => $pt) {
        $status = 'nulo';
        $dias = '';
        
        if ($pt['data_doc'] != 0) {
            $status = 'conforme';

            if ($i > 0 && $pontos[$i-1]['data_doc'] != 0) {
                $d1 = new DateTime($pt['data_doc']);
                $d2 = new DateTime($pontos[$i-1]['data_doc']);
                $dias = $d1->diff($d2)->days;

                if ($pt['data_doc'] < $pontos[$i-1]['data_doc']) {
                    $status = 'desconforme';
                }
            }
        }

        $badge = $dias !== '' 
            ? '<span class="badge rounded-pill bg-' . ($status === 'desconforme' ? 'danger' : 'info') . ' text-white badge-notification"
                    style="position: absolute; top: 0; right: 0; transform: translate(50%, -50%);">'
                    . $dias . 
              '</span>' 
            : '';

        echo '
            <div class="stepper-item ' . $status . '">
                <div class="step-counter position-relative"
                    tabindex="0" 
                    role="button" 
                    data-bs-toggle="popover" 
                    data-bs-trigger="focus" 
                    data-bs-placement="top"
                    title="' . $pt['refer'] . ', Registo: ' . $pt['data_doc'] . ' - ' . $pt['notas'] . '"
                    data-bs-content="' . $pt['data_val'] . '">
                    ' . ($i + 1) . $badge . '
                </div>
                <div class="step-name badge bg-' . ($status === 'conforme' ? 'success' : ($status === 'desconforme' ? 'danger' : 'secondary')) . ' text-white">'
                    . $pt['documento'] . 
                '</div>
                <div class="step-name badge bg-' . ($status === 'conforme' ? 'success' : ($status === 'desconforme' ? 'danger' : 'secondary')) . ' text-white">'
                    . $pt['data_val'] . 
                '</div>
            </div>';
    }

    echo '</div>';
}

// === Execução do fluxo ===
$resultados = buscarResultados($myConn, $codigoProcesso, $descritivos);
[$regime, $proc, $contrato, $dispensas, $fases] = definirTipoProcesso($resultados);
$pontos = filtrarPontosControle($resultados, $fases);
gerarHTMLStepper($pontos);
