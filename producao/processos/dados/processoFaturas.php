
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
    SELECT *,
    cs.candsub_fundo AS cand_taxa
    FROM factura
    LEFT JOIN processo p ON p.proces_check = fact_proces_check
    LEFT JOIN candidaturas_submetidas cs ON cs.candsub_codigo = p.proces_cand
    WHERE fact_proces_check = :codigoProcesso
      AND fact_tipo IN ('FTN', 'NC', 'FTC', 'IND', 'RPR','IVA')
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
    $fundo = round($imputado * $row['cand_taxa'], 2);

    $privado = round($imputado * (1 - $row['cand_taxa']) , 2);

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

    // Total geral e faturado (excluindo REF e IVA)
    if ($tipo !== 'REF' && $tipo !== 'IVA') {

        acumularTotais(
            $totaisGerais,
            $valores
        );

        $processoFaturasAcumulado += $valores['valor'];
    }
}

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
                <td class='text-left'>" . escapar($expediente) . "</td>
                <td class='text-left'>" . escapar($documento) . "</td>
                <td class='text-center'>" . escapar($dataFatura) . "</td>
                <td class='text-center'>" . escapar($autoNumero) . "</td>
                <td class='text-center'>" . escapar($autoData) . "</td>
        ";

        // Colunas monetárias
        echo celulaValor($valores['valor']);
        echo celulaValor($valores['caucao']);
        echo celulaValor($valores['subtotal'], 'col-subtotal');
        echo celulaValor($valores['garantia']);
        echo celulaValor($valores['iva']);
        echo celulaValor($valores['outros']);
        echo celulaValor($valores['pagar'],'col-pagar');
        echo celulaValor($valores['imputado']);
        echo celulaValor($valores['fundo'], 'col-financiamento');
        echo celulaValor($valores['privado'], 'col-financiamento');
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
