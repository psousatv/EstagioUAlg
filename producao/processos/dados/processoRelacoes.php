<?php
//session_start();
include "../../../global/config/dbConn.php";

$codigoProcesso = isset($_GET['codigoProcesso']) ? intval($_GET['codigoProcesso']) : 0;
$descritivos = [1, 4, 5, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 26, 27, 28, 29, 30];

// Gerar placeholders dinâmicos
$placeholders = implode(',', array_fill(0, count($descritivos), '?'));

// Processos
$estadiosProcesso = "SELECT
                     historico_dataemissao AS data_registo,
                     historico_descr_nome AS registo,
                     historico_num AS documento,
                     historico_doc AS pormenor
                     FROM historico
                     WHERE historico_descr_cod IN ($placeholders)
                     AND historico_proces_check = ?
                     ORDER BY historico_dataemissao DESC
                     LIMIT 3";

// Como se utiliza o parâmetro ?, tem que utilizar o prepare
$stmt = $myConn->prepare($estadiosProcesso);
// Criar array de parâmetros
// Primeiro dois são o processo, depois vem todos os descr_cod
$params = array_merge($descritivos, [$codigoProcesso]);
// Executar
$stmt->execute($params);
//$stmt->execute([$codigoProcesso]);
// Buscar tudo
$estados = $stmt->fetchAll(PDO::FETCH_ASSOC);


// Processos Relacionados
$processosRelacionados = 'SELECT proces_rel_sec, proces_estado_nome, proces_padm, proces_nome
                          FROM processo_relacoes
                          INNER JOIN processo ON proces_check = proces_rel_sec
                          WHERE proces_rel_prin ="'.$codigoProcesso.'"
                          ORDER BY proces_cod, proces_sub';

$stmt = $myConn->query($processosRelacionados);
$relacoes = $stmt->fetchAll(PDO::FETCH_ASSOC);
// Quantidade de registo na query
$registos = count($relacoes);

echo '
<div class="card col-md-12">
  <div class="card-body">
  <div class="card-header bg-info text-white" >Últimos movimentos do processo</div>
  <h1 class="mt-2"></h1>
    <div class="col col-md-12">
      <div class="row">
        <ul class="list-group">';
        foreach($estados as $estado) {
            echo  '
              <li class="list-group-item">
                <span class="badge bg-info text-white">'.$estado["data_registo"].'</span>
                '.$estado["registo"].' - '.$estado["documento"].' - '.$estado["pormenor"].'
              </li>';
          };
            echo '
        </ul>
      </div>
    </div>
  </div>
</div>';
echo '<h1 class="mt-4"></h1>';
echo '
<div class="card col-md-12">
  <div class="card-body">
  <div class="card-header bg-warning" >Processos Relacionados ('.$registos.')</div>
  <h1 class="mt-2"></h1>
    <div class="col col-md-12">
      <div class="row">
        <ul class="list-group">';
        foreach($relacoes as $relacao) {
            echo  '
              <li class="list-group-item" onclick="redirectProcesso('.$relacao["proces_rel_sec"].')">
                <span class="badge bg-info text-white">'.$relacao["proces_estado_nome"].'</span>
                '.$relacao["proces_nome"]. '
              </li>
              <!--tr>
                <td onclick="redirectProcesso('.$relacao["proces_rel_sec"].')">'.$relacao["proces_estado_nome"].'_'.$relacao["proces_nome"].'</td>
              </tr-->';
          };
            echo '
        </ul>
      </div>
    </div>
  </div>
</div>';