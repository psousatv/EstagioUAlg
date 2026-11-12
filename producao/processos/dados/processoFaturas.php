
<?php
// ------------------------------------------------------
// LIGAÇÃO À BASE DE DADOS
// ------------------------------------------------------
include "../../../global/config/dbConn.php";

$codigoProcesso = filter_input(
    INPUT_GET,
    'codigoProcesso',
    FILTER_VALIDATE_INT
);

if (!$codigoProcesso || $codigoProcesso <= 0) {
    http_response_code(400);
    exit("Código do processo inválido.");
}

// ------------------------------------------------------
// CONSULTA DAS FATURAS
// ------------------------------------------------------
$sql = "
    SELECT *
    FROM factura
    WHERE fact_proces_check = :codigoProcesso
      AND fact_tipo IN ('FTN', 'NC', 'FTC', 'IND', 'RPR')
    ORDER BY
        CASE fact_tipo
            WHEN 'FTN' THEN 1
            WHEN 'NC'  THEN 2
            WHEN 'FTC' THEN 3
            WHEN 'IND' THEN 4
            WHEN 'RPR' THEN 5
            ELSE 6
        END,
        fact_auto_num DESC
";

$stmt = $myConn->prepare($sql);

$stmt->execute([
    ':codigoProcesso' => $codigoProcesso
]);

$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

// ------------------------------------------------------
// FUNÇÕES AUXILIARES
// ------------------------------------------------------
function formatarValor($valor)
{
    return number_format((float)$valor, 2, ',', '.');
}

function escapar($valor)
{
    return htmlspecialchars(
        (string)$valor,
        ENT_QUOTES,
        'UTF-8'
    );
}

// Estrutura dos totais financeiros
function inicializarTotais()
{
    return [
        'valor'    => 0,
        'caucao'   => 0,
        'subtotal' => 0,
        'garantia' => 0,
        'iva'      => 0,
        'outros'   => 0,
        'pagar'    => 0,
        'imputado' => 0,
        'fundo'    => 0,
        'privado'  => 0
    ];
}

// Acumular valores
function acumularTotais(&$totais, $valores)
{
    foreach ($totais as $campo => $total) {
        $totais[$campo] += $valores[$campo] ?? 0;
    }
}

// Célula monetária
function celulaValor($valor, $classe = '')
{
    $classeNegativo = $valor < 0
        ? ' valor-negativo'
        : '';

    return "
        <td class='text-right {$classe}{$classeNegativo}'>
            " . formatarValor($valor) . "
        </td>
    ";
}

// ------------------------------------------------------
// CÁLCULOS FINANCEIROS POR FATURA
// ------------------------------------------------------
function calcularValoresFatura($row)
{
    $valor = (float)($row['fact_valor'] ?? 0);

    $caucao = (float)($row['fact_duovalor'] ?? 0);

    $garantia = (float)($row['fact_garban'] ?? 0);

    $outros = (float)($row['fact_duocga'] ?? 0);

    $iva = (float)($row['fact_iva'] ?? 0);

    $tipo = $row['fact_tipo'] ?? '';

    // Tratamento das notas de crédito
    if ($tipo === 'NC') {
        $caucao = 0;
        $garantia = 0;
    }

    // Subtotal após dedução da caução
    $subtotal = $valor - $caucao;

    // Valor a pagar
    if ($tipo === 'NC') {
        $pagar = 0;
    } else {
        $pagar = $subtotal;
    }

    // Valor imputado
    $imputado = $valor + $iva;

    // Financiamento
    $fundo = round($imputado * 0.60, 2);

    $privado = round($imputado * 0.40, 2);

    return [
        'valor'    => $valor,
        'caucao'   => $caucao,
        'subtotal' => $subtotal,
        'garantia' => $garantia,
        'iva'      => $iva,
        'outros'   => $outros,
        'pagar'    => $pagar,
        'imputado' => $imputado,
        'fundo'    => $fundo,
        'privado'  => $privado
    ];
}

// ------------------------------------------------------
// FUNÇÃO PARA LINHAS DE SUBTOTAIS E TOTAL GERAL
// ------------------------------------------------------
function apresentarTotais($titulo, $totais, $classe)
{
    echo "
        <tr class='{$classe}'>
            <th colspan='5' class='text-right'>
                " . escapar($titulo) . "
            </th>
    ";

    foreach ($totais as $campo => $valor) {

        $classeNegativo = $valor < 0
            ? ' valor-negativo'
            : '';

        echo "
            <th class='text-right{$classeNegativo}'>
                " . formatarValor($valor) . "
            </th>
        ";
    }

    echo "</tr>";
}

// ------------------------------------------------------
// DESIGNAÇÕES DOS GRUPOS
// ------------------------------------------------------
$tiposDocumento = [
    'FTN' => 'Faturas',
    'NC'  => 'Notas de Crédito',
    'FTC' => 'Faturas FTC',
    'IND' => 'Documentos IND',
    'RPR' => 'Revisão de Preços'
];

// ------------------------------------------------------
// AGRUPAMENTO DAS FATURAS
// ------------------------------------------------------
$grupos = [];

$totaisGerais = inicializarTotais();

$processoFaturasAcumulado = 0;

foreach ($data as $row) {

    $tipo = $row['fact_tipo'];

    $valores = calcularValoresFatura($row);

    // Criar grupo, caso ainda não exista
    if (!isset($grupos[$tipo])) {

        $grupos[$tipo] = [
            'documentos' => [],
            'totais' => inicializarTotais()
        ];
    }

    // Guardar documento e respetivos cálculos
    $grupos[$tipo]['documentos'][] = [
        'dados'   => $row,
        'valores' => $valores
    ];

    // Subtotais por tipo de documento (incluindo REF)
    acumularTotais(
        $grupos[$tipo]['totais'],
        $valores
    );

    // Total geral e faturado (excluindo REF)
    if ($tipo !== 'REF') {

        acumularTotais(
            $totaisGerais,
            $valores
        );

        $processoFaturasAcumulado += $valores['valor'];
    }
}

// ------------------------------------------------------
// ESTILOS - BALANÇO CONTABILÍSTICO
// ------------------------------------------------------
echo "
<style>

    .balanco-wrapper {
        background: #ffffff;
        border: 1px solid #d6dce3;
        border-radius: 5px;
        overflow: hidden;
    }

    .balanco-table {
        width: 100%;
        margin-bottom: 0;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 11px;
        color: #343a40;
        border-collapse: collapse;
        font-variant-numeric: tabular-nums;
    }

    .balanco-table th,
    .balanco-table td {
        padding: 7px 8px;
        vertical-align: middle;
        white-space: nowrap;
        border: 1px solid #e0e4e8;
    }

    /* Título principal */

    .balanco-table .balanco-titulo th {
        background-color: #17365d;
        color: #ffffff;
        padding: 14px 12px;
        font-size: 14px;
        border-color: #17365d;
    }

    .balanco-titulo-valor {
        font-size: 17px;
        font-weight: bold;
    }

    /* Secções do cabeçalho */

    .balanco-table .cabecalho-faturacao {
        background-color: #e3e9f0;
        color: #17365d;
        text-transform: uppercase;
        letter-spacing: 0.6px;
    }

    .balanco-table .cabecalho-financiamento {
        background-color: #e3ebe3;
        color: #355b3e;
        text-transform: uppercase;
        letter-spacing: 0.6px;
    }

    .balanco-table .cabecalho-colunas th {
        background-color: #f3f5f7;
        color: #495057;
        font-weight: 600;
        border-bottom: 2px solid #aebbc9;
    }

    /* Cabeçalho de cada grupo */

    .balanco-table .grupo-titulo th {
        background-color: #e8edf3;
        color: #17365d;
        font-size: 12px;
        font-weight: bold;
        border-top: 2px solid #a7b8ca;
        padding: 10px 9px;
    }

    .grupo-quantidade {
        font-size: 10px;
        font-weight: normal;
        color: #66788a;
        margin-left: 8px;
    }

    /* Linhas de detalhe */

    .balanco-table .linha-documento td {
        background-color: #ffffff;
    }

    .balanco-table .linha-documento:hover td {
        background-color: #f1f5fa;
    }

    /* Colunas financeiras com destaque discreto */

    .balanco-table .linha-documento .col-subtotal {
        background-color: #f5f7fa;
        font-weight: 600;
    }

    .balanco-table .linha-documento .col-pagar {
        background-color: #edf2f8;
        color: #17365d;
        font-weight: bold;
    }

    .balanco-table .linha-documento .col-financiamento {
        background-color: #f5f8f5;
    }

    /* Subtotais por grupo */

    .balanco-table .grupo-subtotal th {
        background-color: #edf1f5;
        color: #17365d;
        font-weight: bold;
        border-top: 1px solid #8fa3b8;
        border-bottom: 2px solid #8fa3b8;
        padding-top: 9px;
        padding-bottom: 9px;
    }

    /* Total geral */

    .balanco-table .total-geral th {
        background-color: #17365d;
        color: #ffffff;
        font-weight: bold;
        font-size: 12px;
        border-color: #365473;
        border-top: 3px double #ffffff;
        padding-top: 12px;
        padding-bottom: 12px;
    }

    /* Valores negativos */

    .balanco-table .valor-negativo {
        color: #b3261e !important;
    }

    .balanco-table .total-geral .valor-negativo {
        color: #ffb9b9 !important;
    }

    /* Nota de rodapé */

    .balanco-nota {
        padding: 9px 12px;
        background-color: #f8f9fa;
        border-top: 1px solid #d6dce3;
        color: #6c757d;
        font-size: 11px;
    }

</style>
";

// ------------------------------------------------------
// INÍCIO DA TABELA
// ------------------------------------------------------
echo "
<div class='balanco-wrapper'>

    <div class='table-responsive'>

        <table class='table table-sm balanco-table'>

            <thead>

                <!-- TÍTULO PRINCIPAL -->
                <tr class='balanco-titulo'>
                    <th colspan='15'>

                        <div class='d-flex
                                    justify-content-between
                                    align-items-center'>

                            <span>
                                BALANÇO FINANCEIRO DO PROCESSO
                            </span>

                            <span class='balanco-titulo-valor'>
                                Faturado »
                                " . formatarValor(
                                    $processoFaturasAcumulado
                                ) . " €
                            </span>

                        </div>

                    </th>
                </tr>

                <!-- SECÇÕES -->
                <tr class='text-center'>

                    <th colspan='13'
                        class='cabecalho-faturacao'>
                        Faturação
                    </th>

                    <th colspan='2'
                        class='cabecalho-financiamento'>
                        Financiamento
                    </th>

                </tr>

                <!-- COLUNAS -->
                <tr class='cabecalho-colunas text-center'>

                    <th>Expediente</th>
                    <th>Documento</th>
                    <th>Data</th>
                    <th>Auto</th>
                    <th>Data Auto</th>

                    <th>Valor</th>
                    <th>Caução</th>
                    <th>Subtotal</th>
                    <th>Garantia</th>
                    <th>IVA</th>
                    <th>Outros</th>
                    <th>Pagar</th>
                    <th>Imputado</th>

                    <th>Fundo</th>
                    <th>Privado</th>

                </tr>

            </thead>

            <tbody>
";

// ------------------------------------------------------
// LISTAGEM AGRUPADA POR FACT_TIPO
// ------------------------------------------------------
foreach ($grupos as $tipo => $grupo) {

    $designacao = $tiposDocumento[$tipo] ?? $tipo;

    $quantidade = count($grupo['documentos']);

    // --------------------------------------------------
    // CABEÇALHO DO GRUPO
    // --------------------------------------------------
    echo "
        <tr class='grupo-titulo'>
            <th colspan='15'>

                " . escapar($tipo) . "
                &mdash;
                " . escapar($designacao) . "

                <span class='grupo-quantidade'>
                    ({$quantidade} " .
                    ($quantidade === 1
                        ? 'documento'
                        : 'documentos') . ")
                </span>

            </th>
        </tr>
    ";

    // --------------------------------------------------
    // DOCUMENTOS DO GRUPO
    // --------------------------------------------------
    foreach ($grupo['documentos'] as $documentoGrupo) {

        $row = $documentoGrupo['dados'];

        $valores = $documentoGrupo['valores'];

        // ----------------------------------------------
        // EXPEDIENTE
        // ----------------------------------------------
        $exp = (string)($row['fact_expediente'] ?? '');

        if ($exp !== '') {

            $expediente =
                substr($exp, 0, 1) . "." .
                substr($exp, 1, 5) . "." .
                substr($exp, 6, 7);

        } else {

            $expediente = '';
        }

        // ----------------------------------------------
        // DADOS DO DOCUMENTO
        // ----------------------------------------------
        $documento =
            $row['fact_tipo'] . "_" .
            ($row['fact_num'] ?? '');

        $dataFatura = $row['fact_data'] ?? '';

        $autoNumero = $row['fact_auto_num'] ?? '';

        $autoData = $row['fact_auto_data'] ?? '';

        // ----------------------------------------------
        // LINHA DO DOCUMENTO
        // ----------------------------------------------
        echo "
            <tr class='linha-documento'>

                <td class='text-left'>
                    " . escapar($expediente) . "
                </td>

                <td class='text-left'>
                    " . escapar($documento) . "
                </td>

                <td class='text-center'>
                    " . escapar($dataFatura) . "
                </td>

                <td class='text-center'>
                    " . escapar($autoNumero) . "
                </td>

                <td class='text-center'>
                    " . escapar($autoData) . "
                </td>
        ";

        // Colunas monetárias
        echo celulaValor($valores['valor']);

        echo celulaValor($valores['caucao']);

        echo celulaValor(
            $valores['subtotal'],
            'col-subtotal'
        );

        echo celulaValor($valores['garantia']);

        echo celulaValor($valores['iva']);

        echo celulaValor($valores['outros']);

        echo celulaValor(
            $valores['pagar'],
            'col-pagar'
        );

        echo celulaValor($valores['imputado']);

        echo celulaValor(
            $valores['fundo'],
            'col-financiamento'
        );

        echo celulaValor(
            $valores['privado'],
            'col-financiamento'
        );

        echo "</tr>";
    }

    // --------------------------------------------------
    // SUBTOTAL DO GRUPO
    // --------------------------------------------------
    apresentarTotais(
        'SUBTOTAL ' . $tipo,
        $grupo['totais'],
        'grupo-subtotal'
    );
}

// ------------------------------------------------------
// SEM DOCUMENTOS
// ------------------------------------------------------
if (empty($grupos)) {

    echo "
        <tr>
            <td colspan='15'
                class='text-center text-muted py-4'>

                Não existem documentos para este processo.

            </td>
        </tr>
    ";
}

// ------------------------------------------------------
// FIM DO CORPO DA TABELA
// ------------------------------------------------------
echo "</tbody>";

// ------------------------------------------------------
// TOTAL GERAL
// ------------------------------------------------------
echo "<tfoot>";

apresentarTotais(
    'TOTAL GERAL',
    $totaisGerais,
    'total-geral'
);

echo "
            </tfoot>

        </table>

    </div>

    <div class='balanco-nota'>

        <strong>Total de documentos:</strong>
        " . count($data) . "

        &nbsp; | &nbsp;

        <strong>Grupos:</strong>
        " . count($grupos) . "

        &nbsp; | &nbsp;

        <strong>Financiamento:</strong>
        Fundo 60% / Privado 40%

        &nbsp; | &nbsp;

        <strong>Nota:</strong>
        O acumulado faturado exclui os documentos REF.

    </div>

</div>
";

?>
