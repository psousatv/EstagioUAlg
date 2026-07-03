<?php
include "../../../global/config/dbConn.php";

$codigoProcesso = isset($_GET['codigoProcesso'])
    ? intval($_GET['codigoProcesso'])
    : 0;

$descritivos = [
    1, 4, 5, 9, 10, 11, 12, 13,
    14, 16, 17, 18, 19, 26, 27,
    28, 29, 30
];

/**
 * 1️⃣ Buscar dados
 */
function buscarResultados(PDO $conn, int $codigoProcesso, array $descritivos): array
{
    $placeholders = implode(',', array_fill(0, count($descritivos), '?'));

        $sql = "
                SELECT
                    p2.proced_regime AS regime,
                    p2.proced_contrato AS contrato,
                    p2.proced_escolha AS procedimento,

                    d.descr_cod AS codigo,
                    d.descr_nome AS documento,

                    h1.historico_dataemissao AS data_documento,
                    h1.historico_datamov AS data_validacao_documento,
                    h1.historico_valor AS valor_documento,
                    h1.historico_doc AS referencias,
                    h1.historico_notas AS notas

                FROM descritivos d

                LEFT JOIN historico h1
                    ON h1.historico_descr_cod = d.descr_cod
                    AND h1.historico_proces_check = ?

                LEFT JOIN processo p1
                    ON p1.proces_check = h1.historico_proces_check

                LEFT JOIN procedimento p2
                    ON p2.proced_cod = p1.proces_proced_cod

                WHERE d.descr_cod IN ($placeholders)

                GROUP BY
                    d.descr_cod,
                    d.descr_nome,
                    p2.proced_regime,
                    p2.proced_contrato,
                    p2.proced_escolha,
                    h1.historico_dataemissao,
                    h1.historico_datamov,
                    h1.historico_valor,
                    h1.historico_doc,
                    h1.historico_notas
                ";

    $stmt = $conn->prepare($sql);

    $params = array_merge([$codigoProcesso], $descritivos);

    $stmt->execute($params);

    return $stmt->fetchAll(PDO::FETCH_ASSOC);

}

/**
 * 2️⃣ Criar contexto único do processo
 */
function criarContexto(array $resultados): array
{
    if (empty($resultados)) {
        return [
            'regime' => null,
            'proc' => null,
            'contrato' => null,
            'movimentos' => [],
            'valorMovimento4' => null,
            'erro' => false,
            'mensagem' => null
        ];
    }

    $base = $resultados[0];

    $movimentos = array_values(array_unique(
        array_column($resultados, 'codigo')
    ));

    $valorMovimento4 = null;

    foreach ($resultados as $r) {
        if ((int)$r['codigo'] === 4) {
            $valorMovimento4 = $r['valor_documento'] !== null
                ? (float)$r['valor_documento']
                : null;
            break;
        }
    }

    $erro = false;
    $mensagem = null;

    if ($valorMovimento4 === null || $valorMovimento4 == 0) {

        $erro = true;
    
        $mensagem = 'Início de Procedimento inexistente nos movimentos do processo.';

    }

    return [
        'regime' => $base['regime'] ?? null,
        'proc' => $base['procedimento'] ?? null,
        'contrato' => $base['contrato'] ?? null,
        'movimentos' => $movimentos,
        'valorMovimento4' => $valorMovimento4,
        'erro' => $erro,
        'mensagem' => $mensagem
    ];
}

/**
 * 3️⃣ Definir fases + regra do movimento 4
 */
function definirFases(array $ctx): array
{
    $fasesBase = [
        'Aquisição de Serviços' => [1, 4, 5, 10, 13, 14, 16, 17, 19, 28],
        'Aquisição de Bens'     => [1, 4, 5, 10, 13, 14, 16, 17, 19, 27],
        'Empreitada'            => [1, 4, 5, 10, 13, 14, 16, 17, 18, 19, 26, 29, 30],
    ];

    if ($ctx['erro']) {
        return [[], [
            'erro' => true,
            'mensagem' => $ctx['mensagem']
        ]];
    }

    $movimentos = $fasesBase[$ctx['contrato']] ?? [];

    

    /**
     * Regra:
     * movimento 4 < 10000 remove 17
     */
    if ($ctx['valorMovimento4'] < 10000) {
        $movimentos = array_values(
            array_diff($movimentos, [17])
        );
    }

    return [$movimentos, null];

}

/**
 * 4️⃣ Filtrar pontos
 */
function filtrarPontosControle(array $resultados, array $fases): array
{
    $pontos = [];

    foreach ($resultados as $r) {
        if (in_array($r['codigo'], $fases)) {
            $pontos[] = [
                'documento' => $r['documento'],
                'data_doc'  => $r['data_documento'],
                'data_val'  => $r['data_validacao_documento'],
                'refer'     => $r['referencias'],
                'notas'     => $r['notas']
            ];
        }
    }

    return $pontos;
}

/**
 * 5️⃣ Render HTML
 */
function gerarHTMLStepper(array $pontos): void
{
    echo '<div class="stepper-wrapper">';

    foreach ($pontos as $i => $pt) {

        $status = 'nulo';
        $dias = '';

        if ($pt['data_doc'] != 0) {

            $status = 'conforme';

            if ($i > 0 && $pontos[$i - 1]['data_doc'] != 0) {

                $d1 = new DateTime($pt['data_doc']);
                $d2 = new DateTime($pontos[$i - 1]['data_doc']);

                $dias = $d1->diff($d2)->days;

                if ($pt['documento'] === 'BaseGov' && $dias > 20) {
                    $status = 'desconforme';
                }
            }
        }

        $badge = $dias !== ''
            ? '<span class="badge rounded-pill bg-'
                . ($status === 'desconforme' ? 'danger' : 'info')
                . ' text-white badge-notification" style="position:absolute;top:0;right:0;transform:translate(50%,-50%);">'
                . $dias .
              '</span>'
            : '';

        echo '
        <div class="stepper-item ' . $status . '">

            <div class="step-counter position-relative" tabindex="0"
                role="button"
                data-bs-toggle="popover"
                data-bs-trigger="focus"
                data-bs-placement="top"
                title="' . $pt['refer'] . ' - ' . $pt['data_val'] . ' - ' . $pt['notas'] . '"
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

/**
 * 🚀 EXECUÇÃO
 */
$resultados = buscarResultados($myConn, $codigoProcesso, $descritivos);

$ctx = criarContexto($resultados);

if ($ctx['erro']) {
    echo '<div class="alert alert-warning">'
        . $ctx['mensagem'] .
    '</div>';
    exit;
}

[$fases, $erroFases] = definirFases($ctx);

if (!empty($erroFases)) {
    echo '<div class="alert alert-warning">'
        . $erroFases['mensagem'] .
    '</div>';
    exit;
}

$pontos = filtrarPontosControle($resultados, $fases);

gerarHTMLStepper($pontos);