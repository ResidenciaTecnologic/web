<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header("Access-Control-Allow-Headers: X-Requested-With");
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

if (isset($_FILES['file_csv'])) {
    $path = $_FILES['file_csv']['tmp_name'];

    if (!is_readable($path) || !($file = fopen($path, 'r'))) {
        echo json_encode(["error" => "No se puede abrir o leer el archivo CSV"]);
        exit;
    }

    $labels = [];
    $data = [];

    while (($row = fgetcsv($file, 0, ",")) !== FALSE) {
        if (count($row) < 2) {
            continue;
        }
        $labels[] = $row[0];
        if (is_numeric($row[1])) {
            $data[] = $row[1];
        }
    }

    fclose($file);

    if (count($data) > 0) {
        $mean = array_sum($data) / count($data);
        $sumOfDifferencesSquared = array_reduce($data, function ($carry, $value) use ($mean) {
            return $carry + pow($value - $mean, 2);
        }, 0);
        $stdDev = sqrt($sumOfDifferencesSquared / count($data));
        $max = max($data);
        $min = min($data);

        // Calcular la pendiente
        $xValues = array_keys($data);
        $yValues = array_values($data);
        $pendiente = count($yValues) > 1 ? ($yValues[count($yValues) - 1] - $yValues[0]) / ($xValues[count($xValues) - 1] - $xValues[0]) : 0;

        $response = [
            "labels" => $labels,
            "data" => $data,
            "mean" => $mean,
            "standardDeviation" => $stdDev,
            "max" => $max,
            "min" => $min,
            "pendiente" => $pendiente
        ];
    } else {
        echo json_encode(["error" => "No hay datos numéricos para calcular"]);
        exit;
    }

    echo json_encode($response);
} else {
    echo json_encode(["error" => "No se proporcionó un archivo CSV"]);
}
?>
