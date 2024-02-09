function calcularPendiente(x1, y1, x2, y2) {
    return (y2 - y1) / (x2 - x1);
}

function painCanvasFijo(canvasId, textId, inputId, name) {
    const inputFile = document.getElementById(inputId);
    const canvas = document.getElementById(canvasId);
    const text = document.getElementById(textId);

    if (!inputFile.files.length) {
        alert("Selecciona un archivo CSV primero.");
        return;
    }

    const formData = new FormData();
    formData.append('file_csv', inputFile.files[0]);

    fetch('http://localhost/csv_graf/php/csvFijo.php', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        const ctx = canvas.getContext('2d');
        let yValues = data["data"].map(value => parseFloat(value));
        let xValues = data["labels"].map(label => parseFloat(label));

        // Calcular la pendiente
        const m = calcularPendiente(xValues[0], yValues[0], xValues[xValues.length - 1], yValues[yValues.length - 1]);
        let pendiente = 1 - (-parseFloat(m)) 
        // Crear una función para la línea de pendiente
        const lineaPendiente = xValues.map(x => m * x + yValues[0]);

        const chartConfig = {
            type: 'line',
            data: {
                labels: data["labels"],
                datasets: [
                    {
                        label: name,
                        data: yValues,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Pendiente',
                        data: lineaPendiente,
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1,
                        fill: false,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        };

        if (Chart.getChart(ctx)) {
            Chart.getChart(ctx).destroy();
        }
        new Chart(ctx, chartConfig);

        if (text) {
            const variation = Math.max(...yValues) - Math.min(...yValues);
            text.textContent = `Valor Máximo: [${Math.max(...yValues).toFixed(7)}] - Valor Mínimo: [${Math.min(...yValues).toFixed(7)}] - Variación: [${variation.toFixed(7)}] - Desviación Estándar: [${data.standardDeviation.toFixed(7)}] - Pendiente: [${pendiente.toFixed(7)}]`;
        }
    })
    .catch(error => {
        alert("Hubo un error al procesar el archivo CSV.");
        console.error(error);
    });
}
