<?php
//session_start();
include "../../../global/config/dbConn.php";

$codigoProcesso = $_GET['codigoProcesso'];

$query = 'SELECT proces_check, proces_padm, proces_nome
          FROM processo
          WHERE proces_check ="'.$codigoProcesso.'"';


$stmt = $myConn->query($query);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach($data as $row) {
echo  '
<div class="col-10 d-flex align-items-center">
                <div class="d-flex justify-content-between align-items-center bg-primary rounded px-2 py-1 mb-2 w-100">

                  <!-- Identificação -->
                  <span class="text-white text-truncate flex-grow-1 pr-3">
                    '.$row["proces_padm"].'_'.$row["proces_nome"].'
                  </span>

                  <!-- Botões -->
                  <div class="d-flex gap-2 flex-shrink-0">

                    <a href="obraResults.html?codigoProcesso='.$row["proces_check"].'"
                      class="btn btn-secondary btn-sm mr-2"
                      title="Atualizar">
                      <i class="fa-solid fa-rotate text-light"></i>
                    </a>

                    <a href="obrasSearch.html"
                      class="btn btn-warning btn-sm mr-2"
                      title="Procurar">
                      <i class="fa-solid fa-search text-dark"></i>
                    </a>

                  </div>

                </div>
              </div>
';
};
