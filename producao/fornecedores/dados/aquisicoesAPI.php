<?php

class AquisicoesAPI {

    private PDO $db;

    private array $tipos = [
        'geral' => [9, 14],
        'presenciais' => [9],
        'protocolos' => [100]
    ];

    public function __construct(PDO $conn) {
        $this->db = $conn;
    }

    // =========================
    // ENTIDADES
    // =========================
    public function getEntidades(string $fornecedor = ''): array {

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
            $stmt->bindValue(':fornecedor', "%{$fornecedor}%");
        }

        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // =========================
    // FATURAS
    // =========================
    public function getFaturasAll(string $tipo): array {

        $historicos = $this->tipos[$tipo] ?? [9,14];

        $in = implode(',', array_map('intval', $historicos));

        $sql = "
            SELECT
                f.fact_ent_cod,
                f.fact_proces_check,
                f.fact_expediente,
                f.fact_num,
                f.fact_data,
                f.fact_valor,
                f.fact_obs,

                pr.proced_regime AS regime,
                p.proces_orc_actividade AS atividade,
                CONCAT(r.rub_tipo, ' ', r.rub_rubrica, ' ', r.rub_item) AS rubrica,
                p.proces_padm AS padm,
                p.proces_nome AS designacao,

                SUM(
                    CASE
                        WHEN h.historico_descr_cod IN ($in)
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

            LEFT JOIN rubricas r
                ON r.rub_cod = p.proces_rub_cod

            WHERE
                YEAR(f.fact_data) IN (
                    YEAR(CURDATE()),
                    YEAR(CURDATE()) - 1
                )
                AND f.fact_tipo IN ('FTN', 'FTC', 'RPR', 'NC')

            GROUP BY
                f.fact_ent_cod,
                f.fact_proces_check,
                f.fact_expediente,
                f.fact_num,
                f.fact_data,
                f.fact_valor,
                f.fact_obs,
                p.proces_padm,
                pr.proced_regime,
                p.proces_nome,
                p.proces_orc_actividade,
                r.rub_tipo,
                r.rub_rubrica,
                r.rub_item

            HAVING adjudicado > 0

            ORDER BY f.fact_data DESC
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}