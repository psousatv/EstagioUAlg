<?php
include "../../../global/config/dbConn.php";
header('Content-Type: application/json; charset=utf-8');

class AquisicoesAPI {

    private $db;

    public function __construct($conn) {
        $this->db = $conn;
    }

    // =========================
    // ENTIDADES
    // =========================
    public function getEntidades($fornecedor = '') {

        $sql = "
            SELECT 
                e.ent_cod,
                e.ent_nome AS entidade,
                e.ent_nif AS contribuinte
            FROM entidade e
            WHERE 1=1
        ";

        if (!empty($fornecedor)) {
            $sql .= " AND e.ent_nome LIKE :fornecedor ";
        }

        $sql .= " ORDER BY e.ent_nome ";

        $stmt = $this->db->prepare($sql);

        if (!empty($fornecedor)) {
            $stmt->bindValue(':fornecedor', "%$fornecedor%");
        }

        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // =========================
    // FATURAS + PROCESSOS (FILTRADOS)
    // =========================
    public function getFaturasAll($ano = '') {

        $sql = "
            SELECT
                f.fact_ent_cod,
                f.fact_proces_check,
                f.fact_num,
                f.fact_data,
                f.fact_valor,
                f.fact_obs,

                p.proces_padm AS padm,
                pr.proced_regime AS regime,
                p.proces_nome AS designacao,

                SUM(
                    CASE 
                        WHEN h.historico_descr_cod = 9 OR h.historico_descr_cod = 14
                        THEN h.historico_valor 
                        ELSE 0 
                    END
                ) AS adjudicado

            FROM factura f

            LEFT JOIN processo p
                ON p.proces_check = f.fact_proces_check

            LEFT JOIN procedimento pr
                ON pr.proced_cod = p.proces_proced_cod

            LEFT JOIN historico h
                ON h.historico_proces_check = p.proces_check

            WHERE f.fact_data >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
        ";

        if (!empty($ano)) {
            $sql .= " AND YEAR(f.fact_data) = :ano ";
        }

        $sql .= "
            GROUP BY
                f.fact_ent_cod,
                f.fact_proces_check,
                f.fact_num,
                f.fact_data,
                f.fact_valor,
                f.fact_obs,
                p.proces_padm,
                pr.proced_regime,
                p.proces_nome
        ";

        // 🔥 FILTRA SÓ PROCESSOS COM VALOR
        $sql .= " HAVING adjudicado > 0 ";

        $sql .= " ORDER BY f.fact_data DESC ";

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
            $faturas   = $api->getFaturasAll($ano);

            // =========================
            // MAP ENTIDADES
            // =========================
            $mapEnt = [];

            foreach ($entidades as $e) {
                $e['processos'] = [];
                $e['total_atual'] = 0; //Faturado no Ano
                $e['total_anterior'] = 0; //Faturado no Ano Atual
                $e['total_faturado'] = 0; //Faturado Total
                $mapEnt[$e['ent_cod']] = $e;
            }

            // =========================
            // MAP (ENTIDADE → PROCESSO → FATURA)
            // =========================
            foreach ($faturas as $f) {

                $ent = $f['fact_ent_cod'];
                $proc = $f['fact_proces_check'];

                if (!isset($mapEnt[$ent])) {
                    continue;
                }

                // criar processo (se não existir)
                if (!isset($mapEnt[$ent]['processos'][$proc])) {

                    $mapEnt[$ent]['processos'][$proc] = [
                        'proces_check' => $proc,
                        'padm' => $f['padm'],
                        'regime' => $f['regime'],
                        'designacao' => $f['designacao'],
                        'faturas' => []
                    ];
                }

                // adicionar fatura
                $mapEnt[$ent]['processos'][$proc]['faturas'][] = [
                    'fatura' => $f['fact_num'],
                    'fatura_data' => $f['fact_data'],
                    'fatura_valor' => floatval($f['fact_valor']),
                    'fatura_observacoes' => $f['fact_obs']
                ];

                // acumular total entidade
                $anoAtual = date('Y');
                $anoAnterior = $anoAtual - 1;

                $anoFatura = (int) substr($f['fact_data'], 0, 4);

                if ($anoFatura == $anoAtual) {
                    // ano atual
                    $mapEnt[$ent]['total_atual'] += (float) $f['fact_valor'];
                    $mapEnt[$ent]['total_faturado'] += (float) $f['fact_valor'];

                } elseif ($anoFatura == $anoAnterior) {
                    // ano anterior
                    $mapEnt[$ent]['total_anterior'] += (float) $f['fact_valor'];
                    $mapEnt[$ent]['total_faturado'] += (float) $f['fact_valor'];
                }

            }

            // =========================
            // NORMALIZAR + FILTRAR
            // =========================
            $result = [];

            foreach ($mapEnt as $e) {

                // normalizar processos
                $e['processos'] = array_values($e['processos']);

                // 🚫 descartar entidades sem faturação
                if ($e['total_faturado'] <= 0) {
                    continue;
                }

                $result[] = $e;
            }

            echo json_encode([
                "data" => $result
            ], JSON_UNESCAPED_UNICODE);

            break;
    }

} catch (Exception $e) {

    echo json_encode([
        "error" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}