<?php
//session_start();
include "../../../global/config/dbConn.php";

$codigoProcesso = isset($_GET['codigoProcesso']) ? intval($_GET['codigoProcesso']) : 0;

//Histórico Processos
$processoHistorico = 'SELECT * 
                      FROM historico
                      WHERE historico_proces_check = "' .$codigoProcesso. '"
                      ORDER BY historico_dataemissao DESC, historico_descr_cod' ;

$stmt = $myConn->query($processoHistorico);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

function obterMovimentosDaFase($faseDesejada) {
  $fases = [
      "enquadramento" => [0, 1, 2, 3, 53, 54],
      "concurso" => [4, 5, 6, 7, 8, 10, 11, 12, 13, 51, 52, 80, 81, 82],
      "contrato" => [14, 15, 16, 17, 19, 40],
      "preparacao_execucao" => [60, 61, 62, 63, 64],
      "execucao" => [18, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 96, 98]
  ];

  if (array_key_exists($faseDesejada, $fases)) {
      return $fases[$faseDesejada];
  }

  return []; // Ou pode retornar "Fase desconhecida"
};

//**** Para chamar a função **//
// $movimentos = obterMovimentosDaFase("execucao");
//
// if (!empty($movimentos)) {
//     echo "Movimentos da fase 'execucao': " . implode(', ', $movimentos);
// } else {
//    echo "Fase desconhecida ou sem movimentos.";
// };


echo "
<table class='table table-fixed table-bordered table-striped table-hover small'>
  <tr style='text-align: center'>
    <th>Data</th>
    <th>Aprovado</th>
    <th>Assunto</th>
    <th colspan='2'>Documento</th>
    <th>Valor</th>
    <th>Observações</th>
    <!--th>Notas</th-->
  </tr>";
foreach($data as $row)
{
  echo "
    <tr>
      <td>".$row['historico_dataemissao']."</td>
      <td>".$row['historico_datamov']."</td>
      <td>".$row['historico_descr_nome']."</td>
      <td>".$row['historico_doc']."</td>
      <td>".$row['historico_num']."</td>
      <td class='text-right'>".number_format($row['historico_valor'], 2, ',', '.')."</td>
      <td tabindex='0'
          role='button'
          data-bs-toggle='popover'
          data-bs-trigger='focus'
          data-bs-placement='top'
          title='".$row['historico_notas']."'
          data-bs-content='".$row['historico_notas']."'>".$row['historico_obs']."</td>";
    echo "</tr>";
};
echo "
  </table>";
