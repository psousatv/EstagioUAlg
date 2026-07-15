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
      <div class="d-flex justify-content-between align-items-center bg-primary rounded px-2 py-1 mb-2">

        <span class="text-white text-truncate flex-grow-1 pr-2">
            '.$row["proces_padm"].'_'.$row["proces_nome"].'
        </span>

        <div class="d-flex flex-shrink-0">

            <button class="btn btn-secondary btn-sm py-0 px-2 mr-1"
                    onclick="processoSelected('.$row["proces_check"].')"
                    title="Atualizar">
                <i class="fa fa-refresh"></i>
            </button>

            <a href="processosSearch.html"
              class="btn btn-warning btn-sm py-0 px-2 mr-1"
              title="Pesquisar">
                <i class="fa fa-search"></i>
            </a>

            <button class="btn btn-light btn-sm py-0 px-2"
                    onclick="processoSelected('.$row["proces_check"].')"
                    title="Imprimir">
                <i class="fa fa-print"></i>
            </button>

        </div>

      </div>
';
};