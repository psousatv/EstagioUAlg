
<?php
// ------------------------------------------------------
// LIGAÇÃO À BASE DE DADOS
// ------------------------------------------------------
include "../../../global/config/dbConn.php";

// Código do processo
$codigoProcesso = filter_input(INPUT_GET, 'codigoProcesso', FILTER_VALIDATE_INT);

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
      AND fact_tipo IN ('FTN', 'FTC', 'IND', 'RPR')
    ORDER BY fact_auto_num DESC
";

$stmt = $myConn->prepare($sql);
$stmt->execute([
    ':codigoProcesso' => $codigoProcesso
]);

$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

// ------------------------------------------------------
// FUNÇÃO DE FORMATAÇÃO MONETÁRIA
// ------------------------------------------------------
function formatarValor($valor)
{
    return number_format((float)$valor, 2, ',', '.');
}

// ------------------------------------------------------
// TOTAL FATURADO (EXCLUINDO IND)
// ------------------------------------------------------
$processoFaturasAcumulado = 0;

foreach ($data as $fatura) {
    if ($fatura['fact_tipo'] !== 'IND') {
        $processoFaturasAcumulado += (float)$fatura['fact_valor'];
    }
}

// ------------------------------------------------------
// INICIALIZAÇÃO DOS TOTAIS
// ------------------------------------------------------
$totais = [
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

// ------------------------------------------------------
// INÍCIO DA TABELA
// ------------------------------------------------------
echo "
<table class='table table-bordered table-striped table-hover small'>

    <thead>
        <tr>
            <th colspan='15'
                class='bg-primary text-white text-left'>
                Faturado » " . formatarValor($processoFaturasAcumulado) . " €
            </th>
        </tr>

        <tr class='text-center'>
            <th colspan='13' class='bg-secondary text-white'>
                Faturação
            </th>
            <th colspan='2' class='bg-warning'>
                Financiamento
            </th>
        </tr>

        <tr class='text-center'>
            <th>Expediente</th>
            <th>Documento</th>
            <th>Data</th>
            <th>Auto</th>
            <th>Data</th>
            <th class='bg-info text-white'>Valor</th>
            <th class='bg-info text-white'>Caução</th>
            <th class='bg-secondary text-white'>SubTotal</th>
            <th class='bg-info text-white'>Garantia</th>
            <th class='bg-info text-white'>IVA</th>
            <th class='bg-info text-white'>Outros</th>
            <th class='bg-dark text-white'>Pagar</th>
            <th class='bg-info text-white'>Imputado</th>
            <th class='bg-warning'>Fundo</th>
            <th class='bg-warning'>Privado</th>
        </tr>
    </thead>

    <tbody>
";

// ------------------------------------------------------
// LISTAGEM DAS FATURAS
// ------------------------------------------------------
foreach ($data as $row) {

    // --------------------------------------------------
    // EXPEDIENTE
    // --------------------------------------------------
    $tipo   = substr((string)($row['fact_expediente'] ?? ''), 0, 1);
    $numero = substr((string)($row['fact_expediente'] ?? ''), 1, 5);
    $ano    = substr((string)($row['fact_expediente'] ?? ''), 6, 7);

    $expediente = $tipo . "." . $numero . "." . $ano;

    // --------------------------------------------------
    // VALORES DA FATURA
    // --------------------------------------------------
    $valor    = (float)($row['fact_valor'] ?? 0);
    $caucao   = (float)($row['fact_duovalor'] ?? 0);
    $garantia = (float)($row['fact_garban'] ?? 0);
    $outros   = (float)($row['fact_duocga'] ?? 0);
    $iva      = (float)($row['fact_iva'] ?? 0);

    $finanFundo = (float)($row['fact_finan_fundo'] ?? 0);

    // --------------------------------------------------
    // CÁLCULO DO IVA
    // --------------------------------------------------
    $iva60 = round($iva * 0.60, 2);
    $iva40 = round($iva * 0.40, 2);

    // --------------------------------------------------
    // CÁLCULOS FINANCEIROS
    // --------------------------------------------------
    $subtotal = $valor - $caucao;

    // Nota de crédito (caso seja incluída na consulta)
    if ($row['fact_tipo'] === 'NC') {
        $pagar = 0;
        $garantia = 0;
        $caucao = 0;
    } else {
        // Caução já deduzida no subtotal
        $pagar = $subtotal;
    }

    $imputado = $valor + $iva;

    $fundo = round($imputado  * .60, 2);

    $privado = round($imputado * .40, 2);;

    // --------------------------------------------------
    // ACUMULAÇÃO DOS TOTAIS
    // --------------------------------------------------
    $totais['valor']    += $valor;
    $totais['caucao']   += $caucao;
    $totais['subtotal'] += $subtotal;
    $totais['garantia'] += $garantia;
    $totais['iva']      += $iva;
    $totais['outros']   += $outros;
    $totais['pagar']    += $pagar;
    $totais['imputado'] += $imputado;
    $totais['fundo']    += $fundo;
    $totais['privado']  += $privado;

    // --------------------------------------------------
    // DADOS PARA APRESENTAÇÃO
    // --------------------------------------------------
    $documento = $row['fact_tipo'] . '_' . $row['fact_num'];

    $expediente = htmlspecialchars($expediente, ENT_QUOTES, 'UTF-8');
    $documento = htmlspecialchars($documento, ENT_QUOTES, 'UTF-8');
    $dataFatura = htmlspecialchars((string)($row['fact_data'] ?? ''), ENT_QUOTES, 'UTF-8');
    $autoNumero = htmlspecialchars((string)($row['fact_auto_num'] ?? ''), ENT_QUOTES, 'UTF-8');
    $autoData = htmlspecialchars((string)($row['fact_auto_data'] ?? ''), ENT_QUOTES, 'UTF-8');

    // --------------------------------------------------
    // LINHA DA FATURA
    // --------------------------------------------------
    echo "
    <tr>
        <td class='text-left'>{$expediente}</td>
        <td class='text-left'>{$documento}</td>
        <td class='text-left'>{$dataFatura}</td>
        <td class='text-left'>{$autoNumero}</td>
        <td class='text-left'>{$autoData}</td>

        <td class='bg-info text-white text-right'>
            " . formatarValor($valor) . "
        </td>

        <td class='bg-info text-white text-right'>
            " . formatarValor($caucao) . "
        </td>

        <td class='bg-secondary text-white text-right'>
            " . formatarValor($subtotal) . "
        </td>

        <td class='bg-info text-white text-right'>
            " . formatarValor($garantia) . "
        </td>

        <td class='bg-info text-white text-right'>
            " . formatarValor($iva) . "
        </td>

        <td class='bg-info text-white text-right'>
            " . formatarValor($outros) . "
        </td>

        <td class='bg-dark text-white text-right'>
            " . formatarValor($pagar) . "
        </td>

        <td class='bg-info text-white text-right'>
            " . formatarValor($imputado) . "
        </td>

        <td class='bg-warning text-right'>
            " . formatarValor($fundo) . "
        </td>

        <td class='bg-warning text-right'>
            " . formatarValor($privado) . "
        </td>
    </tr>
    ";
}

// ------------------------------------------------------
// FIM DO CORPO DA TABELA
// ------------------------------------------------------
echo "</tbody>";

// ------------------------------------------------------
// RODAPÉ - TOTAIS
// ------------------------------------------------------
echo "
<tfoot>
    <tr class='font-weight-bold'>

        <th colspan='5'
            class='bg-secondary text-white text-right'>
            TOTAIS
        </th>

        <th class='bg-info text-white text-right'>
            " . formatarValor($totais['valor']) . "
        </th>

        <th class='bg-info text-white text-right'>
            " . formatarValor($totais['caucao']) . "
        </th>

        <th class='bg-secondary text-white text-right'>
            " . formatarValor($totais['subtotal']) . "
        </th>

        <th class='bg-info text-white text-right'>
            " . formatarValor($totais['garantia']) . "
        </th>

        <th class='bg-info text-white text-right'>
            " . formatarValor($totais['iva']) . "
        </th>

        <th class='bg-info text-white text-right'>
            " . formatarValor($totais['outros']) . "
        </th>

        <th class='bg-dark text-white text-right'>
            " . formatarValor($totais['pagar']) . "
        </th>

        <th class='bg-info text-white text-right'>
            " . formatarValor($totais['imputado']) . "
        </th>

        <th class='bg-warning text-right'>
            " . formatarValor($totais['fundo']) . "
        </th>

        <th class='bg-warning text-right'>
            " . formatarValor($totais['privado']) . "
        </th>

    </tr>
</tfoot>

</table>
";
?>
