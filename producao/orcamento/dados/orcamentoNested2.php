<?php

include "../../../global/config/dbConn.php";
header('Content-Type: application/json; charset=utf-8');

/* =========================
   1. PARÂMETROS
   ========================= */

$itemProcurado = '106' //$_GET['itemProcurado'] ?? null; // rub_cod
$anoCorrente   = '2026' //$_GET['anoCorrente'] ?? date('Y');

if (!$itemProcurado) {
    echo json_encode(["error" => "Parâmetro 'itemProcurado' (rub_cod) é obrigatório."]);
    exit;
}


/* =========================
   2. CARREGAR DADOS (COM FILTROS)
   ========================= */

/* ---- Rubrica (por rub_cod) ---- */
$stmt = $pdo->prepare("
    SELECT *
    FROM rubricas
    WHERE rub_cod = ?
");
$stmt->execute([$itemProcurado]);
$rubricas = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (!$rubricas) {
    echo json_encode([]);
    exit;
}

/* ---- Orçamentos (por ano e rubrica) ---- */
$stmt = $pdo->prepare("
    SELECT *
    FROM orcamento
    WHERE orc_ano = ?
      AND orc_rubrica = ?
");
$stmt->execute([$anoCorrente, $itemProcurado]);
$orcamentos = $stmt->fetchAll(PDO::FETCH_ASSOC);

/* ---- Processos (todos, filtrados depois) ---- */
$processos = $pdo->query("SELECT * FROM processos")->fetchAll(PDO::FETCH_ASSOC);

/* ---- Faturas (todas, filtradas depois) ---- */
$faturas = $pdo->query("SELECT * FROM faturas")->fetchAll(PDO::FETCH_ASSOC);


/* =========================
   3. MAPAS ASSOCIATIVOS
   ========================= */

/* ---- Rubricas ---- */
$rubricasMap = [];
foreach ($rubricas as $r) {
    $r['orcamentos'] = [];
    $r['total_previsto'] = 0;
    $r['total_faturado'] = 0;
    $r['saldo'] = 0;
    $r['percentagem_execucao'] = 0;
    $rubricasMap[$r['rub_cod']] = $r;
}

/* ---- Orçamentos ---- */
$orcamentosMap = [];
foreach ($orcamentos as $o) {
    $o['processos'] = [];
    $o['total_faturado'] = 0;
    $o['saldo'] = 0;
    $o['percentagem_execucao'] = 0;

    $orcamentosMap[$o['orc_check']] = $o;

    $rubricasMap[$o['orc_rubrica']]['orcamentos'][$o['orc_check']]
        = &$orcamentosMap[$o['orc_check']];
}

/* ---- Processos ---- */
$processosMap = [];
foreach ($processos as $p) {

    if (!isset($orcamentosMap[$p['proces_orc_check']])) {
        continue;
    }

    $p['faturas'] = [];
    $p['total_faturado'] = 0;

    $processosMap[$p['proces_check']] = $p;

    $orcamentosMap[$p['proces_orc_check']]['processos'][$p['proces_check']]
        = &$processosMap[$p['proces_check']];
}

/* ---- Faturas ---- */
foreach ($faturas as $f) {
    if (isset($processosMap[$f['fact_proces_check']])) {
        $processosMap[$f['fact_proces_check']]['faturas'][] = $f;
    }
}


/* =========================
   4. CÁLCULO DE TOTAIS
   ========================= */

/* ---- Processos ---- */
foreach ($processosMap as &$processo) {
    $total = 0;
    foreach ($processo['faturas'] as $f) {
        $total += (float) str_replace(',', '.', $f['fact_valor']);
    }
    $processo['total_faturado'] = round($total, 2);
}
unset($processo);

/* ---- Orçamentos ---- */
foreach ($orcamentosMap as &$orcamento) {
    $totalFaturado = 0;

    foreach ($orcamento['processos'] as $processo) {
        $totalFaturado += $processo['total_faturado'];
    }

    $previsto = (float) str_replace(',', '.', $orcamento['orc_valor_previsto']);

    $orcamento['total_faturado'] = round($totalFaturado, 2);
    $orcamento['saldo'] = round($previsto - $totalFaturado, 2);
    $orcamento['percentagem_execucao'] =
        $previsto > 0 ? round(($totalFaturado / $previsto) * 100, 2) : 0;
}
unset($orcamento);

/* ---- Rubrica ---- */
foreach ($rubricasMap as &$rubrica) {
    $totalPrevisto = 0;
    $totalFaturado = 0;

    foreach ($rubrica['orcamentos'] as $orcamento) {
        $totalPrevisto += (float) str_replace(',', '.', $orcamento['orc_valor_previsto']);
        $totalFaturado += $orcamento['total_faturado'];
    }

    $rubrica['total_previsto'] = round($totalPrevisto, 2);
    $rubrica['total_faturado'] = round($totalFaturado, 2);
    $rubrica['saldo'] = round($totalPrevisto - $totalFaturado, 2);
    $rubrica['percentagem_execucao'] =
        $totalPrevisto > 0 ? round(($totalFaturado / $totalPrevisto) * 100, 2) : 0;
}
unset($rubrica);


/* =========================
   5. NORMALIZAR ARRAYS
   ========================= */

$resultado = array_values(array_map(function ($rubrica) {
    $rubrica['orcamentos'] = array_values(array_map(function ($orc) {
        $orc['processos'] = array_values(array_map(function ($proc) {
            $proc['faturas'] = array_values($proc['faturas']);
            return $proc;
        }, $orc['processos']));
        return $orc;
    }, $rubrica['orcamentos']));
    return $rubrica;
}, $rubricasMap));


/* =========================
   6. OUTPUT
   ========================= */

echo json_encode($resultado, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
