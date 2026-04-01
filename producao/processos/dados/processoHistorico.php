<?php
include "../../../global/config/dbConn.php";

$codigoProcesso = intval($_GET['codigoProcesso'] ?? 0);
if (!$codigoProcesso) exit("Código do processo inválido.");

// Buscar dados
$sql = "SELECT * FROM historico WHERE historico_proces_check = ?";
$stmt = $myConn->prepare($sql);
$stmt->execute([$codigoProcesso]);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Definir fases e códigos
$fases = [
    "enquadramento" => [0, 1, 2, 3, 51, 52, 53, 54],
    "procedimento" => [4, 5, 6, 7, 8, 10, 11, 12, 13, 80, 81, 82],
    "adjudicação" => [14, 16, 44],
    "contrato" => [17, 19, 40],
    "preparacao_execucao" => [60, 61, 62, 63, 64],
    "execucao" => [9, 18, 21, 22, 24],
    "financiamento" => [91, 92],
    "garantia" => [25, 26, 27, 28, 30, 42, 42, 43],
    "contas_finais" => [23, 29]
];

// Organizar dados por fase e determinar fase a expandir
$dadosPorFase = [];
$ultimaFase = null;
$ultimaData = 0;
$temExecucao = false;

foreach ($fases as $fase => $codigos) {
    $movimentos = array_filter($data, fn($row) =>
        in_array($row['historico_descr_cod'], $codigos)
    );

    usort($movimentos, fn($a,$b) =>
        strtotime($a['historico_dataemissao']) <=> strtotime($b['historico_dataemissao'])
        ?: $a['historico_descr_cod'] <=> $b['historico_descr_cod']
    );

    if ($movimentos) {
        $dadosPorFase[$fase] = $movimentos;

        // Marcar se a fase execução tem dados
        if ($fase === 'execucao') {
            $temExecucao = true;
        }

        // Determinar a fase com a data mais recente
        $ultimo = end($movimentos);
        $dataMov = strtotime($ultimo['historico_dataemissao']);
        if ($dataMov > $ultimaData) {
            $ultimaData = $dataMov;
            $ultimaFase = $fase;
        }
    }
}

// Se a fase execução tiver dados, ela é a fase a expandir
if ($temExecucao) {
    $ultimaFase = 'execucao';
}
?>

<table class="table table-fixed table-bordered table-striped table-hover small">
    <thead style="position: sticky; top: 0; background-color:white; z-index: 2;">
        <tr style="text-align:center">
            <th>Data</th>
            <th>Aprovado</th>
            <th>Assunto</th>
            <th>Documento</th>
            <th>Nº Documento</th>
            <th>Valor</th>
            <th>Observações</th>
        </tr>
    </thead>
    <tbody>
    <?php $i=0; foreach ($dadosPorFase as $fase => $movimentos): $i++;
        $mostrar = ($fase == $ultimaFase);
    ?>
        <!-- Linha da fase -->
        <tr style="background-color:#40E0D0; font-weight:bold; cursor:pointer;"
            data-bs-toggle="collapse"
            data-bs-target=".fase<?=$i?>"
            aria-expanded="<?= $mostrar ? 'true' : 'false' ?>">
            <td colspan="7"><?= ucwords(str_replace("_"," ",$fase)) ?></td>
        </tr>

        <!-- Dados da fase -->
        <?php foreach ($movimentos as $row): 
            $dataEmissao = date('d-m-Y', strtotime($row['historico_dataemissao']));
            $dataMovimento = date('d-m-Y', strtotime($row['historico_datamov'] ?? $row['historico_dataemissao']));
            $valor = number_format($row['historico_valor'],2,',','.');
            $obs = htmlspecialchars($row['historico_obs'] ?? '',ENT_QUOTES);
        ?>
            <tr class="collapse fase<?=$i?> <?= $mostrar ? 'show' : '' ?>">
                <td><?=$dataEmissao?></td>
                <td><?=$dataMovimento?></td>
                <td><?=$row['historico_descr_nome']?></td>
                <td><?=$row['historico_doc']?></td>
                <td><?=$row['historico_num']?></td>
                <td class="text-right"><?=$valor?></td>
                <td tabindex="0"
                    role="button"
                    data-bs-toggle="popover"
                    data-bs-trigger="focus"
                    data-bs-placement="top"
                    title="<?=htmlspecialchars($row['historico_notas'] ?? '',ENT_QUOTES)?>"
                    data-bs-content="<?=$obs?>"
                >
                    <?=$obs?>
                </td>
            </tr>
        <?php endforeach; ?>
    <?php endforeach; ?>
    </tbody>
</table>