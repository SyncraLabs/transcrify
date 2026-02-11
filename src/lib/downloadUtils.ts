
import jsPDF from "jspdf";
import JSZip from "jszip";

export const downloadTXT = (title: string, content: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};

export const downloadMarkdown = (title: string, content: string) => {
    const element = document.createElement("a");
    const markdownContent = `# ${title}\n\n${content}`;
    const file = new Blob([markdownContent], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};

export const downloadPDF = (title: string, content: string, paragraphs?: string[]) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;

    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    const splitTitle = doc.splitTextToSize(title, maxWidth);
    doc.text(splitTitle, margin, margin);

    let y = margin + (splitTitle.length * 7) + 10;

    // Content
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    const textToProcess = paragraphs && paragraphs.length > 0 ? paragraphs : [content];

    textToProcess.forEach((para) => {
        if (y > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }

        const splitText = doc.splitTextToSize(para, maxWidth);
        const paraHeight = splitText.length * 7;

        if (y + paraHeight > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }

        doc.text(splitText, margin, y);
        y += paraHeight + 5; // Spacing between paragraphs
    });

    doc.save(`${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
};

export const downloadAllAsZip = async (results: { title: string; full_text: string }[]) => {
    const zip = new JSZip();

    results.forEach((result) => {
        const filename = `${result.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
        zip.file(filename, result.full_text);
    });

    const content = await zip.generateAsync({ type: "blob" });
    const element = document.createElement("a");
    element.href = URL.createObjectURL(content);
    element.download = "transcriptions.zip";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};
