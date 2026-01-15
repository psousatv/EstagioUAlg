<?php
include "../../../global/config/dbConn.php";

$codigoProcesso = isset($_GET['codigoProcesso']) ? intval($_GET['codigoProcesso']) : 0;

if ($codigoProcesso == 0) {
    echo "Código do processo inválido.";
    exit;
}

// Histórico Processos
$processoHistorico = 'SELECT * 
                      FROM historico
                      WHERE historico_proces_check = "' .$codigoProcesso. '"';

$stmt = $myConn->query($processoHistorico);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

function obterMovimentosDaFase($faseDesejada) {
    $fases = [
        "enquadramento" => [0, 1, 2, 3, 53, 54],
        "concurso" => [4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 51, 52, 80, 81, 82],
        "contrato" => [16, 17, 19, 40],
        "garantias" => [40, 41, 42, 43, 44],
        "preparacao_execucao" => [60, 61, 62, 63, 64],
        "execucao" => [9, 18, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 96, 98]
    ];

    return $fases[$faseDesejada] ?? [];
}

// --- Organizar dados por fase ---
$fases = ["enquadramento", "concurso", "contrato", "garantias", "preparacao_execucao", "execucao"];
$dadosPorFase = [];

foreach ($fases as $fase) {
    // Filtrando os dados da fase
    $movimentos = obterMovimentosDaFase($fase);
    $dadosPorFase[$fase] = array_filter($data, function($row) use ($movimentos) {
        return in_array($row['historico_descr_cod'], $movimentos);
    });

    // Ordenar os dados dentro de cada fase por data de emissão (ASC) e código do descritivo (ASC)
    usort($dadosPorFase[$fase], function($a, $b) {
        // Garantir que as datas estejam em formato válido
        $dataA = strtotime($a['historico_dataemissao']);
        $dataB = strtotime($b['historico_dataemissao']);

        // Ordenar por data de emissão (ASC)
        if ($dataA != $dataB) {
            return $dataA - $dataB;  // Ordem ascendente
        }

        // Caso as datas sejam iguais, ordenar por código do descritivo (ASC)
        return $a['historico_descr_cod'] - $b['historico_descr_cod'];
    });
}

// --- Gerar HTML ---
echo "<table class='table table-fixed table-bordered table-striped table-hover small'>";
echo "<tr style='text-align: center'>
        <th>Data</th>
        <th>Aprovado</th>
        <th>Assunto</th>
        <th colspan='2'>Documento</th>
        <th>Valor</th>
        <th>Observações</th>
      </tr>";

foreach ($dadosPorFase as $fase => $movimentos) {
    if (!empty($movimentos)) {
        // Linha de título da fase
        echo "<tr style='background-color:#40E0D0; font-weight:bold; text-align:left;'>
                <td colspan='7'>".ucwords(str_replace("_", " ", $fase))."</td>
              </tr>";

        // Movimentos da fase
        foreach ($movimentos as $row) {
            $dataEmissao = date('d-m-Y', strtotime($row['historico_dataemissao'])); // Formato dd-mm-aaaa
            $dataMovimento = date('d-m-Y', strtotime($row['historico_datamov'])); // Formato dd-mm-aaaa
            $valorFormatado = number_format($row['historico_valor'], 2, ',', '.');
            $observacoes = htmlspecialchars($row['historico_obs'], ENT_QUOTES);

            echo "<tr>
                    <td>{$dataEmissao}</td>
                    <td>{$dataMovimento}</td>
                    <td>{$row['historico_descr_nome']}</td>
                    <td>{$row['historico_doc']}</td>
                    <td>{$row['historico_num']}</td>
                    <td class='text-right'>{$valorFormatado}</td>
                    <td tabindex='0'
                        role='button'
                        data-bs-toggle='popover'
                        data-bs-trigger='focus'
                        data-bs-placement='top'
                        title='".htmlspecialchars($row['historico_notas'], ENT_QUOTES)."'
                        data-bs-content='".$observacoes."'>{$observacoes}</td>
                  </tr>";
        }
    }
}

echo "</table>";
?>
