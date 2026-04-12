<?php
include "../../../global/config/dbConn.php";
header('Content-Type: application/json; charset=utf-8');

class AquisicoesAPI {

    private $db;

    public function __construct($conn) {
        $this->db = $conn;
    }

    // =========================
    // ENTIDADES (últimos 5 anos)
    // =========================
    public function getEntidades($fornecedor = '') {

        $sql = "
            SELECT 
                e.ent_cod,
                e.ent_nome AS entidade,
                e.ent_nif AS contribuinte,
                COUNT(p.proces_check) AS total_processos

            FROM entidade e
            INNER JOIN processo p 
                ON p.proces_ent_cod = e.ent_cod

            WHERE p.proces_report_valores = 1
              AND p.proces_data_adjudicacao >= DATE_SUB(CURDATE(), INTERVAL 5 YEAR)
        ";

        if (!empty($fornecedor)) {
            $sql .= " AND e.ent_nome LIKE :fornecedor ";
        }

        $sql .= "
            GROUP BY e.ent_cod, e.ent_nome, e.ent_nif
            ORDER BY e.ent_nome
        ";

        $stmt = $this->db->prepare($sql);

        if (!empty($fornecedor)) {
            $stmt->bindValue(':fornecedor', "%$fornecedor%");
        }

        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // =========================
    // PROCESSOS (últimos 5 anos)
    // =========================
    public function getProcessosAll($ano = '') {

        $sql = "
            SELECT
                p.proces_check,
                p.proces_ent_cod,
                p.proces_padm AS padm,
                pr.proced_regime AS regime,
                p.proces_nome AS designacao,
                YEAR(p.proces_data_adjudicacao) AS ano_adjudicado,

                COALESCE(SUM(
                    CASE WHEN h.historico_descr_cod = 14 
                    THEN h.historico_valor END
                ),0) AS adjudicado

            FROM processo p
            LEFT JOIN procedimento pr 
                ON pr.proced_cod = p.proces_proced_cod

            LEFT JOIN historico h 
                ON h.historico_proces_check = p.proces_check

            WHERE p.proces_report_valores = 1
              AND p.proces_data_adjudicacao >= DATE_SUB(CURDATE(), INTERVAL 5 YEAR)
        ";

        if (!empty($ano)) {
            $sql .= " AND YEAR(p.proces_data_adjudicacao) = :ano ";
        }

        $sql .= "
            GROUP BY 
                p.proces_check,
                p.proces_ent_cod,
                p.proces_padm,
                pr.proced_regime,
                p.proces_nome,
                YEAR(p.proces_data_adjudicacao)

            ORDER BY p.proces_nome
        ";

        $stmt = $this->db->prepare($sql);

        if (!empty($ano)) {
            $stmt->bindValue(':ano', $ano);
        }

        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // =========================
    // FATURAS (últimos 5 anos)
    // =========================
    public function getFaturasAll($ano = '') {

        $sql = "
            SELECT
                fact_proces_check,
                fact_auto_num AS auto_num,
                fact_auto_data AS data_auto,
                fact_expediente AS expediente,
                fact_num AS fatura,
                fact_data AS fatura_data,
                fact_valor AS fatura_valor
            FROM factura
            WHERE fact_data >= DATE_SUB(CURDATE(), INTERVAL 5 YEAR)
        ";

        if (!empty($ano)) {
            $sql .= " AND YEAR(fact_data) = :ano ";
        }

        $sql .= " ORDER BY fact_data DESC";

        $stmt = $this->db->prepare($sql);

        if (!empty($ano)) {
            $stmt->bindValue(':ano', $ano);
        }

        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}

// =========================
// ROUTER
// =========================
try {

    $api = new AquisicoesAPI($myConn);

    $action = $_GET['action'] ?? '';

    switch ($action) {

        case 'full':

            $fornecedor = $_GET['frmFornecedor'] ?? '';
            $ano = $_GET['anoCorrente'] ?? '';

            $entidades = $api->getEntidades($fornecedor);
            $processos = $api->getProcessosAll($ano);
            $faturas   = $api->getFaturasAll($ano);

            // MAP PROCESSOS
            $mapProc = [];

            foreach ($processos as $p) {
                $p['faturas'] = [];
                $mapProc[$p['proces_check']] = $p;
            }

            foreach ($faturas as $f) {

                $key = $f['fact_proces_check'];

                if (isset($mapProc[$key])) {
                    $mapProc[$key]['faturas'][] = $f;
                }
            }

            // MAP ENTIDADES
            $mapEnt = [];

            foreach ($entidades as $e) {
                $e['processos'] = [];
                $mapEnt[$e['ent_cod']] = $e;
            }

            foreach ($mapProc as $p) {

                $ent = $p['proces_ent_cod'];

                if (isset($mapEnt[$ent])) {
                    $mapEnt[$ent]['processos'][] = $p;
                }
            }

            echo json_encode([
                "data" => array_values($mapEnt)
            ], JSON_UNESCAPED_UNICODE);

            break;

        default:

            echo json_encode([
                "error" => "Ação inválida"
            ], JSON_UNESCAPED_UNICODE);

            break;
    }

} catch (Exception $e) {

    echo json_encode([
        "error" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}