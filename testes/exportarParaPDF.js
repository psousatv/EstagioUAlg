async function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const relatorio = document.getElementById("relatorio");

  // Captura a área em alta qualidade
  const canvas = await html2canvas(relatorio, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");

  // Tamanhos do PDF (A4 em mm)
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Tamanhos da imagem
  const imgProps = pdf.getImageProperties(imgData);
  const imgWidth = pageWidth;
  const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

  let heightLeft = imgHeight;
  let position = 0;

  // Primeira página
  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  // Páginas seguintes (se necessário)
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save("relatorio.pdf");
}

