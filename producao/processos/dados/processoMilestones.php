<?php
include "../../../global/config/dbConn.php";

$codigoProcesso = isset($_GET['codigoProcesso'])
    ? intval($_GET['codigoProcesso'])
    : 0;

$formato = $_GET['formato'] ?? 'html';
$descritivos = [1, 4, 5, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 21, 26, 27, 28, 29, 30, 60];

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

            p1.proces_padm AS padm,
            p1.proces_nome AS processo,
            p1.proces_obs AS resumo,
            CONCAT(p1.proces_18cpv1, ' - ', cpv1.cpv1_nome) AS cpv1,
            CONCAT(p1.proces_18cpv2, ' - ', cpv2.cpv2_nome) AS cpv2,
            p1.proces_cand AS candidatura,
            p1.proces_prz_exec AS prazo,

            d.descr_cod AS codigo,
            d.descr_nome AS documento,

            h.historico_dataemissao AS data_documento,
            h.historico_datamov AS data_validacao_documento,
            h.historico_valor AS valor_documento,
            h.historico_doc AS referencias,
            h.historico_notas AS notas

        FROM descritivos d

        LEFT JOIN (
            SELECT *
            FROM (
                SELECT
                    h1.*,
                    ROW_NUMBER() OVER (
                        PARTITION BY h1.historico_descr_cod
                        ORDER BY h1.historico_datamov DESC
                    ) AS rn
                FROM historico h1
                WHERE h1.historico_proces_check = ?
            ) x
            WHERE x.rn = 1
        ) h
            ON h.historico_descr_cod = d.descr_cod

        LEFT JOIN processo p1
            ON p1.proces_check = h.historico_proces_check

        LEFT JOIN procedimento p2
            ON p2.proced_cod = p1.proces_proced_cod

        LEFT JOIN 18cpv1 cpv1
            ON cpv1.cpv1_cod = p1.proces_18cpv1

        LEFT JOIN 18cpv2 cpv2
            ON cpv2.cpv2_cod = p1.proces_18cpv2

        WHERE d.descr_cod IN ($placeholders)

        ORDER BY d.descr_cod
    ";

    $stmt = $conn->prepare($sql);

    $params = array_merge([$codigoProcesso], $descritivos);

    $stmt->execute($params);

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

/* Criar contexto único do processo*/
function criarContexto(array $resultados): array
{
    if (empty($resultados)) {
        return [
            'regime' => null,
            'procedimento' => null,
            'contrato' => null,
            'movimentos' => [],
            'valorMovimento4' => null,
            'valorMovimento21' => null,
            'erro' => false,
            'mensagem' => null,
            'nome' => null,
            'resumo' => null,
            'candidatura' => null,
            'cpv1' => null,
            'cpv2' => null,
            'prazo' => null,
            'data14' => null,
            'data18' => null,
            'data60' => null
        ];
    }

    $base = $resultados[0];

    $movimentos = array_values(array_unique(
        array_column($resultados, 'codigo')
    ));

    $valorMovimento4 = null; /*Início de Procedimento*/
    $valorMovimento21 = null; /*Prorrogação/Suspensão*/
    $data14 = null; /*Adjudicação*/
    $data18 = null; /*Consignação*/
    $data60 = null; /*Plano de Segurança*/

    foreach ($resultados as $r) {

        $codigo = (int)$r['codigo'];

        if ($codigo === 4) {
            $valorMovimento4 = $r['valor_documento'] !== null
                ? (float)$r['valor_documento']
                : null;
        }

        if ($codigo === 21) {
            $valorMovimento21 = $r['valor_documento'] !== null
                ? (int)$r['valor_documento']
                : 0;
        }
        
        /* Data de Adjudicação */
        if ($codigo === 14 && !empty($r['data_documento'])) {
            $data14 = $r['data_documento'];
        }
        /* Data de Consignação */
        if ($codigo === 18 && !empty($r['data_documento'])) {
            $data18 = $r['data_documento'];
        }
        /* Data de Validação do Plano de Segurança */
        if ($codigo === 60 && !empty($r['data_documento'])) {
            $data60 = $r['data_documento'];
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
        'procedimento' => $base['procedimento'] ?? null,
        'contrato' => $base['contrato'] ?? null,
        'movimentos' => $movimentos,
        'valorMovimento4' => $valorMovimento4,
        'valorMovimento21' => $valorMovimento21,
        'erro' => $erro,
        'mensagem' => $mensagem,
        'nome' => ($base['padm'] ?? null) . '-' . ($base['processo'] ?? null),
        'resumo' => $base['resumo'] ?? null,
        'candidatura' => $base['candidatura'] ?? null,
        'cpv1' => $base['cpv1'] ?? null,
        'cpv2' => $base['cpv2'] ?? null,

        // NOVOS
        'prazo' => isset($base['prazo']) ? (int)$base['prazo'] : null,
        'data14' => $data14,
        'data18' => $data18,
        'data60' => $data60
    ];
}

//* Calcular a Data de Termo Previsto */
function calcularDataTermoPrevisto(array $ctx): ?string
{
    /*
     * ============================================================
     * EMPREITADA
     * ============================================================
     *
     * A data-base é determinada pelos movimentos 18 e 60.
     *
     * - Movimento 18 é obrigatório.
     * - Se existir movimento 60 posterior ao 18,
     *   a data-base passa a ser a data do movimento 60.
     * - Se o movimento 60 for anterior ao 18,
     *   mantém-se a data do movimento 18.
     */
    if (($ctx['contrato'] ?? '') === 'Empreitada') {

        if (empty($ctx['data18']) || empty($ctx['prazo'])) {
            return null;
        }

        /* Movimento 18 como data-base inicial */
        $dataBase = new DateTime($ctx['data18']);

        /*
         * Verificar movimento 60.
         * Só substitui a data-base se for posterior ao movimento 18.
         */
        if (!empty($ctx['data60'])) {

            $data60 = new DateTime($ctx['data60']);

            if ($data60 > $dataBase) {
                $dataBase = $data60;
            }
        }

    /*
     * ============================================================
     * RESTANTES CONTRATOS
     * ============================================================
     *
     * Se existir movimento 18, utiliza data18.
     * Caso contrário, utiliza data14.
     */
    } else {

        if (empty($ctx['prazo'])) {
            return null;
        }

        if (!empty($ctx['data18'])) {

            $dataBase = new DateTime($ctx['data18']);

        } elseif (!empty($ctx['data14'])) {

            $dataBase = new DateTime($ctx['data14']);

        } else {

            return null;
        }
    }


    /*
     * ============================================================
     * PRAZO CONTRATUAL
     * ============================================================
     */

    $prazo = (int)($ctx['prazo'] ?? 0);


    /*
     * ============================================================
     * MOVIMENTO 21 - SUSPENSÃO / RETOMA
     * ============================================================
     *
     * O valor do movimento 21 corresponde ao número de dias
     * que devem ser acrescentados ao prazo previsto.
     *
     * Se não existir movimento 21, considera 0 dias.
     */

    $diasSuspensao = (int)($ctx['valorMovimento21'] ?? 0);


    /*
     * ============================================================
     * PRAZO TOTAL PREVISTO
     * ============================================================
     *
     * Prazo contratual + dias de suspensão.
     */

    $prazoTotal = $prazo + $diasSuspensao;


    /*
     * ============================================================
     * DATA DE TERMO PREVISTO
     * ============================================================
     */

    $dataBase->modify("+{$prazoTotal} days");


    /*
     * Formato apresentado no Stepper
     */
    return $dataBase->format('d-m-Y');
}
 
/* Definir fases + regra do movimento 4 + Excessões pelo tipo de procedimento */
function definirFases(array $ctx): array
{
    $fasesBase = [

        'Aquisição de Serviços' => [1, 4, 5, 10, 13, 14, 16, 17, 19, 28],
        'Aquisição de Bens'     => [1, 4, 5, 10, 13, 14, 16, 17, 19, 27],
        'Empreitada'            => [1, 4, 5, 10, 13, 14, 16, 17, 18, 19, 26, 29, 30],

    ];

    /*Movimentos a ignorar */
    $dispensas = [

        'Ajuste Direto Simplificado' => [5, 11, 12, 13, 18, 19, 26, 27, 28, 29, 30],
        'Aquisição de Serviços'      => [11, 12, 26, 27, 29, 30],
        'Aquisição de Bens'          => [11, 12, 26, 28, 29, 30],
        'Empreitada'                 => [11, 12, 27, 28],

    ];

    if ($ctx['erro']) {

        return [[], [
            'erro' => true,
            'mensagem' => $ctx['mensagem']
        ]];

    }

    /* Fases base pelo tipo de contrato */
    $movimentos = $fasesBase[$ctx['contrato']] ?? [];

    /* Regra: movimento 4 < 10000 remove 17*/
    if (
        isset($ctx['valorMovimento4']) &&
        $ctx['valorMovimento4'] < 10000
    ) {

        $movimentos = array_diff($movimentos, [16, 17]);

    }

    /* Aplicar exceções do procedimento*/
    if (
        !empty($ctx['procedimento']) &&
        isset($dispensas[$ctx['procedimento']])
    ) {

        $movimentos = array_diff(
            $movimentos,
            $dispensas[$ctx['procedimento']]
        );

    }

    /* Reindexar array */
    $movimentos = array_values($movimentos);

    return [$movimentos, null];
}

/* Filtrar pontos */
function filtrarPontosControle(array $resultados, array $fases): array
{
    $pontos = [];

    foreach ($resultados as $r) {

        if (in_array($r['codigo'], $fases)) {

            $pontos[] = [
                'codigo'    => (int)$r['codigo'], // NOVO
                'documento' => $r['documento'],
                'data_doc'  => $r['data_documento'],
                'data_val'  => $r['data_validacao_documento'],
                'refer'     => $r['referencias'],
                'notas'     => $r['notas'],
                'valor'     => $r['valor_documento']
            ];
        }
    }

    return $pontos;
}

/* Render HTML */
function gerarHTMLStepper(array $pontos, array $ctx): void
{
    echo '<div class="stepper-wrapper">';

    /*
     * ============================================================
     * CALCULAR DATA DE TERMO PREVISTO
     * ============================================================
     */
    $dataTermoPrevisto = calcularDataTermoPrevisto($ctx);


    /*
     * ============================================================
     * VERIFICAR SE EXISTE REGISTO REAL 26, 27 OU 28
     * ============================================================
     *
     * O código existir em $pontos NÃO significa que exista
     * um registo.
     *
     * Só consideramos existente quando data_doc está preenchida.
     */
    $existeRegistoTermo = false;

    foreach ($pontos as $pt) {

        $codigo = (int)($pt['codigo'] ?? 0);

        if (
            in_array($codigo, [26, 27, 28], true)
            &&
            !empty($pt['data_doc'])
        ) {
            $existeRegistoTermo = true;
            break;
        }
    }


    /*
     * ============================================================
     * CONTROLO DO TERMO PREVISTO
     * ============================================================
     *
     * Garante que o Termo Previsto é apresentado apenas UMA vez.
     */
    $termoPrevistoApresentado = false;


    /*
     * ============================================================
     * GERAR STEPPER
     * ============================================================
     */
    foreach ($pontos as $i => $pt) {

        $status = 'nulo';
        $dias = '';

        $codigo = (int)($pt['codigo'] ?? 0);

        $descritivo = $pt['documento'];


        /*
         * ========================================================
         * TERMO PREVISTO
         * ========================================================
         *
         * Se:
         *
         * 1. Não existir nenhum registo real 26/27/28
         * 2. Estamos num ponto 26/27/28
         * 3. Ainda não apresentámos o Termo Previsto
         *
         * então usamos esse ponto para apresentar
         * a Data de Termo Previsto.
         */
        if (
            !$existeRegistoTermo
            &&
            !$termoPrevistoApresentado
            &&
            in_array($codigo, [26, 27, 28], true)
        ) {

            $descritivo = 'Termo Previsto';

            $dias = $dataTermoPrevisto ?? '';

            $status = 'nulo';

            $termoPrevistoApresentado = true;

        } else {

            /*
             * ====================================================
             * COMPORTAMENTO NORMAL
             * ====================================================
             */
            if (!empty($pt['data_doc'])) {

                $status = 'conforme';

                if (
                    $i > 0
                    &&
                    !empty($pontos[$i - 1]['data_val'])
                ) {

                    $d1 = new DateTime($pt['data_val']);
                    $d2 = new DateTime($pontos[$i - 1]['data_val']);

                    $dias = $d1->diff($d2)->days;


                    /*
                     * BaseGov
                     */
                    if (
                        $pt['documento'] === 'BaseGov'
                        &&
                        $dias > 20
                    ) {
                        $status = 'desconforme';
                    }
                }
            }
        }


        /*
         * ========================================================
         * BADGE
         * ========================================================
         */
        $badge = $dias !== ''
            ? '<span class="badge rounded-pill bg-'
                . ($status === 'desconforme' ? 'danger' : 'info')
                . ' text-white badge-notification" '
                . 'style="position:absolute;top:0;right:0;'
                . 'transform:translate(50%,-50%);">'
                . $dias .
              '</span>'
            : '';


        /*
         * ========================================================
         * HTML
         * ========================================================
         */
        echo '
        <div class="stepper-item ' . $status . '">

            <div class="step-counter position-relative"
                tabindex="0"
                role="button"
                data-bs-toggle="popover"
                data-bs-trigger="focus"
                data-bs-placement="top"

                title="[E:' . ($pt['data_doc'] ?? '') .
                    ' - V:' . ($pt['data_val'] ?? '') .
                    '] - ' . ($pt['notas'] ?? '') . '"

                data-bs-content="' . ($pt['data_val'] ?? '') . '">

                ' . ($i + 1) . $badge . '

            </div>

            <div class="step-name badge bg-'
                . ($status === 'conforme'
                    ? 'success'
                    : ($status === 'desconforme'
                        ? 'danger'
                        : 'secondary'))
                . ' text-white">'
                . $descritivo .
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

if ($formato === 'json') {

    header('Content-Type: application/json');

    echo json_encode([
        'pontos' => $pontos,
        'contexto' => $ctx
    ]);

    exit;
}

gerarHTMLStepper($pontos, $ctx);