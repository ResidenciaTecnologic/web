function calcularPendiente(x1, y1, x2, y2) {
    return (y2 - y1) / (x2 - x1);
}

function painCanvas(canvasId, textId, inputId, name) {
    const inputFile = document.getElementById(inputId);
    const canvas = document.getElementById(canvasId);
    const text = document.getElementById(textId);

    if (!inputFile.files.length) {
        alert("Selecciona un archivo CSV primero.");
        return;
    }

    const formData = new FormData();
    formData.append('file_csv', inputFile.files[0]);

    fetch('http://localhost/csv_graf/php/csv.php', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        const ctx = canvas.getContext('2d');
        let yValues = data["data"].map(value => parseFloat(value));
        let xValues = data["labels"].map(label => parseFloat(label));

        // Calcular la pendiente
        let m = calcularPendiente(xValues[0], yValues[0], xValues[xValues.length - 1], yValues[yValues.length - 1]);

        let pendiente = 1 - (-parseFloat(m)) 
        // Crear una función para la línea de pendiente
        const lineaPendiente = xValues.map(x => m * x + yValues[0]);

        const chartConfig = {
            type: 'line',
            data: {
                labels: data["labels"],
                datasets: [
                    {
                        label: "Peso",
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


PrintImage = function (canvasId, textId) {
    var canvas = document.getElementById(canvasId);
    var textElement = document.getElementById(textId);
    var titleElement = document.getElementById("pdfTitle"); // Obtener el título

    if (canvas && textElement && titleElement) {
        html2canvas(canvas).then((canvas) => {
            // Inicializar jsPDF
            const pdf = new jspdf.jsPDF();

            // Añadir el título al PDF
            pdf.setFontSize(16); // Ajustar el tamaño de la fuente si es necesario
            pdf.text(titleElement.textContent, 10, 10); // Ajustar la posición si es necesario

            // Añadir la imagen del gráfico al PDF
            const imageData = canvas.toDataURL('image/png');
            pdf.addImage(imageData, 'PNG', 10, 20, 180, 100); // Ajustar la posición y el tamaño según sea necesario

            // Preparar el texto de análisis con saltos de línea
            const text = textElement.textContent;
            const splitText = pdf.splitTextToSize(text, 180); // Ajustar el ancho según sea necesario

            // Añadir el texto de análisis al PDF
            pdf.text(splitText, 10, 130); // Ajustar la posición si es necesario

            // Guardar el PDF
            pdf.save('grafica.pdf');
        });
    } else {
        alert("No se encontró el gráfico, el texto de análisis o el título.");
    }
};
