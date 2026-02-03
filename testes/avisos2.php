<?php
// Inclui o arquivo de configuração do banco de dados
include "../global/config/dbConn.php";

// Define o cabeçalho para indicar que a resposta é um JSON
header('Content-Type: application/json');

try {
    // Sua query SQL
    $query = 'SELECT *
              FROM processo
              INNER JOIN entidade ent ON ent.ent_cod = processo.proces_ent_cod
              WHERE processo.proces_report_valores > 0
              ORDER BY processo.proces_cod, processo.proces_data_estado, processo.proces_estado';

    $stmt = $myConn->query($query);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Converte o array PHP em uma string JSON e a imprime
    echo json_encode($data);

} catch (PDOException $e) {
    // Em caso de erro, retorna um status de erro e uma mensagem JSON
    http_response_code(500);
    echo json_encode(['error' => 'Erro na base de dados: ' . $e->getMessage()]);
}
?>