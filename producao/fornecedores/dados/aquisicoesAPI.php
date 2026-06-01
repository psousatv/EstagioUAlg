<?php

class AquisicoesAPI
{
    private PDO $db;

    private array $tiposRegime = [
        'setores_especiais' => ['Setores Especiais'],
        'geral'             => ['Geral'],
        'excluida'          => ['Contratação Excluída'],
        'materiais'         => ['Critérios Materiais']
    ];

    public function __construct(PDO $conn)
    {
        $this->db = $conn;
    }

    // ==================================================
    // ENTIDADES
    // ==================================================
    public function getEntidades(string $fornecedor = ''): array
    {
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

        $sql .= " ORDER BY e.ent_nome";

        $stmt = $this->db->prepare($sql);

        if (!empty($fornecedor)) {
            $stmt->bindValue(
                ':fornecedor',
                '%' . $fornecedor . '%',
                PDO::PARAM_STR
            );
        }

        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ==================================================
    // FATURAS
    // ==================================================
    public function getFaturasAll(string $tipo): array
    {
        $regimes = $this->tiposRegime[$tipo]
            ?? $this->tiposRegime['setores_especiais'];

        $placeholders = [];
        $params = [];

        foreach ($regimes as $i => $regime) {

            $placeholder = ":regime{$i}";

            $placeholders[] = $placeholder;
            $params[$placeholder] = $regime;
        }

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
                pr.proced_contrato AS contrato,
                pr.proced_escolha AS procedimento,

                CONCAT(r.rub_tipo, ' ', r.rub_rubrica, ' ', r.rub_item) AS rubrica,
                p.proces_orc_actividade AS atividade,

                p.proces_padm AS padm,
                p.proces_nome AS designacao,

                SUM(h.historico_valor) AS adjudicado

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

                AND f.fact_tipo IN (
                    'FTN',
                    'FTC',
                    'RPR',
                    'NC'
                )

                AND pr.proced_regime IN (
                    " . implode(',', $placeholders) . "
                )

            GROUP BY
                f.fact_ent_cod,
                f.fact_proces_check,
                f.fact_expediente,
                f.fact_num,
                f.fact_data,
                f.fact_valor,
                f.fact_obs,
                pr.proced_regime,
                pr.proced_contrato,
                pr.proced_escolha,
                p.proces_orc_actividade,
                p.proces_padm,
                p.proces_nome,
                r.rub_tipo,
                r.rub_rubrica,
                r.rub_item

            HAVING adjudicado > 0

            ORDER BY
                f.fact_data DESC
        ";

        $stmt = $this->db->prepare($sql);

        foreach ($params as $placeholder => $value) {
            $stmt->bindValue(
                $placeholder,
                $value,
                PDO::PARAM_STR
            );
        }

        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}