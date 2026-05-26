const emptyBpmnXml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                  targetNamespace="http://bpmn.io/schema/bpmn" 
                  id="Definitions_1">
  <bpmn:process id="Process_1" isExecutable="false" />
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

async function createNewDiagram(bpmnInstance) {
    try {
        // Importamos el XML base definido arriba
        await bpmnInstance.importXML(emptyBpmnXml);

        // Opcional: Ajustar el zoom para que se vea centrado
        const canvas = bpmnInstance.get('canvas');
        canvas.zoom('fit-viewport');
    } catch (err) {
        console.error('Error al crear el flujo:', err);
    }
}

function fileInputOnChange(e, bpmnInstance) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    // Definimos qué pasa cuando el archivo termine de leerse
    reader.onload = async function (e) {
        const xmlContenido = e.target.result;
        openDiagram(bpmnInstance,xmlContenido);
    };

    // Iniciamos la lectura del archivo como texto
    reader.readAsText(file);
}

/**
 * Open diagram in our viewer instance.
 *
 * @param {String} bpmnXML diagram to display
 */
async function openDiagram(bpmnInstance,bpmnXML) {

    // import diagram
    try {

        await bpmnInstance.importXML(bpmnXML);

        // access viewer components
        var canvas = bpmnInstance.get('canvas');
        var overlays = bpmnInstance.get('overlays');


        // zoom to fit full viewport
        canvas.zoom('fit-viewport');
    } catch (err) {

        console.error('could not import BPMN 2.0 diagram', err);
    }
}

// Función para ajustar el zoom
function adjustZoom(bpmnInstance, action) {
    // Obtenemos el módulo Canvas
    const canvas = bpmnInstance.get('canvas');

    if (action === 'in') {
        canvas.zoom(canvas.zoom() * 1.2); // Aumenta un 20%
    } else if (action === 'out') {
        canvas.zoom(canvas.zoom() * 0.8); // Reduce un 20%
    } else if (action === 'reset') {
        canvas.zoom('fit-viewport'); // Centra y ajusta el diagrama a la pantalla
    }
}


async function exportDiagram(bpmnInstance) {

    try {

        var { xml } = await bpmnInstance.saveXML({ format: true });

        // 2. Crear un Blob (un objeto tipo archivo) con el contenido XML
        const blob = new Blob([xml], { type: 'text/bpmn' });

        // 3. Crear un link temporal para la descarga
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'diagrama-proceso.bpmn'; // Nombre del archivo

        // 4. Simular el click y limpiar
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        console.log('Diagrama exportado con éxito');
    } catch (err) {

        console.error('could not save BPMN 2.0 diagram', err);
    }
}

async function exportAsPng(bpmnInstance) {
    try {
        // 1. Obtener el SVG del modelador
        const { svg } = await bpmnInstance.saveSVG();

        // 2. Configurar dimensiones
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        // Convertir el string SVG a un formato que la imagen entienda (Blob o DataURL)
        const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = function () {
            // Definir el tamaño del canvas igual al de la imagen
            canvas.width = img.width;
            canvas.height = img.height;

            // Opcional: Pintar un fondo blanco (si no, el PNG será transparente)
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Dibujar el SVG en el canvas
            ctx.drawImage(img, 0, 0);

            // 3. Convertir el canvas a PNG y descargar
            const pngUrl = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = 'diagrama.png';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            // Limpiar memoria
            URL.revokeObjectURL(url);
        };

        img.src = url;

    } catch (err) {
        console.error('Error al exportar PNG:', err);
    }
}

async function exportSVG(bpmnInstance) {
    try {
        const { svg } = await bpmnInstance.saveSVG();
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'diagrama.svg';
        a.click();

        window.URL.revokeObjectURL(url);
    } catch (err) {
        console.error('Error al guardar el SVG:', err);
    }
}

