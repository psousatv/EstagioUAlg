<?php
include "../../global/config/dbConn.php";

function gerarTabelaProcessos(array $data): void {
    echo '
        <div class="col-sm-12 col-lg-12">
            <div class="card col-sm-12">
                <table class="table table-responsive table-striped">';
    foreach ($data as $row) {
        echo '
                    <tr class="small" onclick="redirectProcesso('.$row["proces_check"].')">
                        <td>'.$row["proces_nome"].'</td>
                        <td class="text-primary">'.$row["ent_nif"].'</td>
                        <td>'.$row["ent_nome"].'</td>
                    </tr>';
    }
    echo '
                </table>
            </div>
        </div>';
}

// Limpar todos os filtros que não forem enviados
$nomeProcesso = $_GET['nomeProcesso'] ?? null;
$nomeFornecedor = $_GET['nomeFornecedor'] ?? null;
$codigoProcessoAdministrativo = $_GET['codigoProcessoAdministrativo'] ?? null;

if ($nomeProcesso) {
    $query = "SELECT proces_check, proces_padm, proces_nome, ent_nome, ent_nif 
              FROM processo
              INNER JOIN entidade ON ent_cod = proces_ent_cod
              WHERE proces_nome LIKE :valor
              AND proces_report_valores > 0
              ORDER BY proces_nome, ent_nif DESC";

    $stmt = $myConn->prepare($query);
    $stmt->execute([':valor' => "%$nomeProcesso%"]);
    gerarTabelaProcessos($stmt->fetchAll(PDO::FETCH_ASSOC));

} elseif ($nomeFornecedor) {
    $query = "SELECT proces_check, proces_padm, proces_nome, ent_nome, ent_nif
              FROM processo
              INNER JOIN entidade ent ON ent_cod = proces_ent_cod
              WHERE ent_nome LIKE :valor
              ORDER BY proces_nome ASC";

    $stmt = $myConn->prepare($query);
    $stmt->execute([':valor' => "%$nomeFornecedor%"]);
    gerarTabelaProcessos($stmt->fetchAll(PDO::FETCH_ASSOC));

} elseif ($codigoProcessoAdministrativo) {
    $query = "SELECT proces_check, proces_padm, proces_nome, ent_nome, ent_nif
              FROM processo
              INNER JOIN entidade ent ON ent_cod = proces_ent_cod
              WHERE proces_padm LIKE :valor
              ORDER BY proces_nome ASC";

    $stmt = $myConn->prepare($query);
    $stmt->execute([':valor' => "%$codigoProcessoAdministrativo%"]);
    gerarTabelaProcessos($stmt->fetchAll(PDO::FETCH_ASSOC));
}
