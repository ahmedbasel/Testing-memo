import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root',
})
export class PdfService {

  async downloadElementAsPdf(
    element: HTMLElement,
    fileName: string
  ) {

    // Clone the element
    const clone =
      element.cloneNode(true) as HTMLElement;

    // Basic PDF-safe styling
    clone.style.position = 'fixed';
    clone.style.left = '0';
    clone.style.top = '0';
    clone.style.width = '1000px';
    clone.style.backgroundColor = '#ffffff';
    clone.style.color = '#0f172a';
    clone.style.opacity = '1';
    clone.style.zIndex = '999999';

    // Remove Tailwind classes from clone
    // so html2canvas doesn't encounter OKLCH colors
    clone.querySelectorAll('*').forEach(
      (child) => {

        const htmlChild =
          child as HTMLElement;

        htmlChild.style.color =
          '#0f172a';

        htmlChild.style.backgroundColor =
          '#ffffff';

        htmlChild.style.borderColor =
          '#e2e8f0';

        htmlChild.style.boxShadow =
          'none';
      }
    );

    // Add clone temporarily to body
    document.body.appendChild(clone);

    try {

      const canvas =
        await html2canvas(
          clone,
          {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
          }
        );

      const imageData =
        canvas.toDataURL('image/png');

      const pdf =
        new jsPDF(
          'p',
          'mm',
          'a4'
        );

      const pageWidth =
        pdf.internal.pageSize.getWidth();

      const pageHeight =
        pdf.internal.pageSize.getHeight();

      const margin = 10;

      const contentWidth =
        pageWidth - margin * 2;

      const contentHeight =
        (canvas.height * contentWidth) /
        canvas.width;

      let heightLeft =
        contentHeight;

      let position =
        margin;

      pdf.addImage(
        imageData,
        'PNG',
        margin,
        position,
        contentWidth,
        contentHeight
      );

      heightLeft -=
        pageHeight - margin * 2;

      while (heightLeft > 0) {

        position =
          heightLeft -
          contentHeight +
          margin;

        pdf.addPage();

        pdf.addImage(
          imageData,
          'PNG',
          margin,
          position,
          contentWidth,
          contentHeight
        );

        heightLeft -=
          pageHeight - margin * 2;
      }

      pdf.save(
        `${fileName}.pdf`
      );

    } finally {

      // Remove temporary clone
      clone.remove();

    }
  }
}