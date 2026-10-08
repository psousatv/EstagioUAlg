<?php

class AquisicoesAPI
{
    private PDO $db;

    /*
     * ==================================================
     * REGIMES DE CONTRATAÇÃO
     * ==================================================
     */
    private array $tiposRegime = [
        'setores_especiais' => ['Setores Especiais'],
        'geral'             => ['Geral'],
        'materiais'         => ['Critérios Materiais'],
        'excluida_regime'   => ['Contratação Excluída']
    ];


    /*
     * ==================================================
     * TIPOS DE PROCEDIMENTO
     * ==================================================
     */
    private array $tiposEscolha = [
        'ajuste_direto'              => ['Ajuste Direto'],
        'ajuste_direto_simplificado' => ['Ajuste Direto Simplificado'],
        'consulta_previa'            => ['Consulta Prévia'],
        'excluida_escolha'           => ['Contratação Excluída']
    ];


    /*
     * ==================================================
     * CONSTRUTOR
     * ==================================================
     */
    public function __construct(PDO $conn)
    {
        $this->db = $conn;
    }


    /*
     * ==================================================
     * ENTIDADES
     * ==================================================
     */
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

        /*
         * Filtro opcional por fornecedor
         */
        if ($fornecedor !== '') {

            $sql .= "
                AND e.ent_nome LIKE :fornecedor
            ";
        }

        $sql .= "
            ORDER BY e.ent_nome
        ";

        $stmt = $this->db->prepare($sql);

        if ($fornecedor !== '') {

            $stmt->bindValue(
                ':fornecedor',
                '%' . $fornecedor . '%',
                PDO::PARAM_STR
            );
        }

        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    /*
     * ==================================================
     * FATURAS
     * ==================================================
     */
    public function getFaturasAll(string $tipo): array
    {
        /*
        * ==================================================
        * IDENTIFICAR O TIPO DE FILTRO
        * ==================================================
        */

        $campoFiltro = null;
        $valorFiltro = null;

        /*
        * --------------------------------------------------
        * REGIME
        * --------------------------------------------------
        */

        if (isset($this->tiposRegime[$tipo])) {

            $campoFiltro = 'pr.proced_regime';
            $valorFiltro = $this->tiposRegime[$tipo][0];
        }

        /*
        * --------------------------------------------------
        * PROCEDIMENTO
        * --------------------------------------------------
        */

        elseif (isset($this->tiposEscolha[$tipo])) {

            $campoFiltro = 'pr.proced_escolha';
            $valorFiltro = $this->tiposEscolha[$tipo][0];
        }

        /*
        * --------------------------------------------------
        * TIPO INVÁLIDO
        * --------------------------------------------------
        */

        else {

            return [];
        }


        /*
        * ==================================================
        * SQL
        * ==================================================
        *
        * Se for REGIME:
        *
        *     proced_regime = regime selecionado
        *
        *     O procedimento pode ser qualquer um.
        *
        *
        * Se for PROCEDIMENTO:
        *
        *     proced_escolha = procedimento selecionado
        *
        *     O regime pode ser qualquer um.
        * ==================================================
        */

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

                CONCAT(
                    r.rub_tipo,
                    ' ',
                    r.rub_rubrica,
                    ' ',
                    r.rub_item
                ) AS rubrica,

                p.proces_orc_actividade AS atividade,
                p.proces_padm AS padm,
                p.proces_nome AS designacao,

                h.adjudicado

            FROM factura f

            LEFT JOIN processo p
                ON p.proces_check = f.fact_proces_check

            LEFT JOIN procedimento pr
                ON pr.proced_cod = p.proces_proced_cod

            LEFT JOIN (

                SELECT
                    historico_proces_check,
                    SUM(historico_valor) AS adjudicado

                FROM historico

                GROUP BY
                    historico_proces_check

            ) h
                ON h.historico_proces_check = p.proces_check

            LEFT JOIN rubricas r
                ON r.rub_cod = p.proces_rub_cod

            WHERE

                /*
                * Ano corrente + ano anterior
                */
                YEAR(f.fact_data) IN (
                    YEAR(CURDATE()),
                    YEAR(CURDATE()) - 1
                )

                /*
                * Tipos de fatura
                */
                AND f.fact_tipo IN (
                    'FTN',
                    'FTC',
                    'RPR',
                    'NC'
                )

                /*
                * Filtro selecionado:
                *
                * regime OU procedimento
                */
                AND {$campoFiltro} = :filtro

                /*
                * Apenas processos com adjudicação positiva
                */
                AND h.adjudicado > 0

            ORDER BY
                f.fact_data DESC
        ";


        /*
        * ==================================================
        * PREPARAR
        * ==================================================
        */

        $stmt = $this->db->prepare($sql);


        /*
        * ==================================================
        * PARÂMETRO
        * ==================================================
        */

        $stmt->bindValue(
            ':filtro',
            $valorFiltro,
            PDO::PARAM_STR
        );


        /*
        * ==================================================
        * EXECUTAR
        * ==================================================
        */

        $stmt->execute();


        /*
        * ==================================================
        * RESULTADO
        * ==================================================
        */

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
