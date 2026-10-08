<?php

include "../../../global/config/dbConn.php";
require_once "aquisicoesAPI.php";

header('Content-Type: application/json; charset=utf-8');

try {

    /*
     * ==================================================
     * INICIALIZAÇÃO
     * ==================================================
     */

    $api = new AquisicoesAPI($myConn);


    /*
     * ==================================================
     * ACTION
     * ==================================================
     */

    $action = $_GET['action'] ?? '';

    if ($action !== 'full') {

        echo json_encode([
            'error' => 'invalid action'
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }


    /*
     * ==================================================
     * PARÂMETROS
     * ==================================================
     */

    $tipo = $_GET['tipo'] ?? 'setores_especiais';

    $fornecedor = trim(
        $_GET['frmFornecedor'] ?? ''
    );


    /*
     * ==================================================
     * DADOS
     * ==================================================
     */

    $entidades = $api->getEntidades($fornecedor);

    $faturas = $api->getFaturasAll($tipo);


    /*
     * ==================================================
     * MAPA DE ENTIDADES
     * ==================================================
     */

    $mapEntidades = [];

    foreach ($entidades as $entidade) {

        $entidade['processos'] = [];

        $entidade['total_anoAtual'] = 0;
        $entidade['total_anoAnterior'] = 0;

        $entidade['total_atividadeAA'] = 0;
        $entidade['total_atividadeARD'] = 0;
        $entidade['total_atividadeAmbas'] = 0;

        $entidade['total_faturado'] = 0;

        $mapEntidades[$entidade['ent_cod']] = $entidade;
    }


    /*
     * ==================================================
     * ANOS
     * ==================================================
     */

    $anoAtual = (int) date('Y');
    $anoAnterior = $anoAtual - 1;


    /*
     * ==================================================
     * PROCESSAMENTO DAS FATURAS
     * ==================================================
     */

    foreach ($faturas as $fatura) {

        $entCod = $fatura['fact_ent_cod'];

        $procCheck = $fatura['fact_proces_check'];


        /*
         * --------------------------------------------------
         * A entidade pode não existir na tabela entidade
         * --------------------------------------------------
         */

        if (!isset($mapEntidades[$entCod])) {
            continue;
        }


        /*
         * ==================================================
         * CRIAR PROCESSO
         * ==================================================
         */

        if (!isset(
            $mapEntidades[$entCod]['processos'][$procCheck]
        )) {

            $mapEntidades[$entCod]['processos'][$procCheck] = [

                'proces_check' => $procCheck,

                'padm' => $fatura['padm'],

                'regime' => $fatura['regime'],

                'contrato' => $fatura['contrato'],

                'procedimento' => $fatura['procedimento'],

                'designacao' => $fatura['designacao'],

                /*
                 * Valor adjudicado do processo.
                 *
                 * É obtido uma única vez, independentemente
                 * do número de faturas.
                 */
                'adjudicado' => (float)($fatura['adjudicado'] ?? 0),

                'faturas' => []
            ];
        }


        /*
         * ==================================================
         * ADICIONAR FATURA AO PROCESSO
         * ==================================================
         */

        $mapEntidades[$entCod]['processos'][$procCheck]['faturas'][] = [

            'fatura_expediente' =>
                $fatura['fact_expediente'],

            'fatura' =>
                $fatura['fact_num'],

            'fatura_data' =>
                $fatura['fact_data'],

            'fatura_valor' =>
                (float)$fatura['fact_valor'],

            'fatura_observacoes' =>
                $fatura['fact_obs'],

            'fatura_atividade' =>
                $fatura['atividade'],

            'fatura_rubrica' =>
                $fatura['rubrica']
        ];


        /*
         * ==================================================
         * VALORES DA FATURA
         * ==================================================
         */

        $valor = (float)$fatura['fact_valor'];


        /*
         * ==================================================
         * ANO DA FATURA
         * ==================================================
         */

        $anoFatura = (int)date(
            'Y',
            strtotime($fatura['fact_data'])
        );


        /*
         * ==================================================
         * TOTAIS ANUAIS
         * ==================================================
         */

        if ($anoFatura === $anoAtual) {

            $mapEntidades[$entCod]['total_anoAtual'] += $valor;

            $mapEntidades[$entCod]['total_faturado'] += $valor;
        }

        elseif ($anoFatura === $anoAnterior) {

            $mapEntidades[$entCod]['total_anoAnterior'] += $valor;
        }


        /*
         * ==================================================
         * TOTAIS POR ATIVIDADE
         * ==================================================
         */

        switch ($fatura['atividade']) {

            case 'AA - Águas de Abastecimento':

                $mapEntidades[$entCod]['total_atividadeAA'] += $valor;

                break;


            case 'AR - Águas Residuais':

                $mapEntidades[$entCod]['total_atividadeARD'] += $valor;

                break;


            default:

                $mapEntidades[$entCod]['total_atividadeAmbas'] += $valor;

                break;
        }
    }


    /*
     * ==================================================
     * PREPARAR RESULTADO
     * ==================================================
     */

    $resultado = [];


    foreach ($mapEntidades as $entidade) {

        /*
         * Converter processos associativos
         * para array normal.
         */
        $entidade['processos'] = array_values(
            $entidade['processos']
        );


        /*
         * Apenas entidades com faturação no ano atual.
         */
        if ($entidade['total_faturado'] <= 0) {
            continue;
        }


        $resultado[] = $entidade;
    }


    /*
     * ==================================================
     * JSON
     * ==================================================
     */

    echo json_encode(
        [
            'data' => $resultado
        ],
        JSON_UNESCAPED_UNICODE
    );


}
catch (Throwable $e) {

    http_response_code(500);

    echo json_encode(
        [
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString()
        ],
        JSON_UNESCAPED_UNICODE
    );

    exit;
}