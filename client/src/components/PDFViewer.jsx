import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { ChevronLeft, ChevronRight } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function PDFViewer({ url }) {
  const canvasRef = useRef(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true);
        const pdf = await pdfjsLib.getDocument(url).promise;
        setNumPages(pdf.numPages);
        renderPage(pdf, 1);
      } catch (error) {
        console.error('Error loading PDF:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPdf();
  }, [url]);

  const renderPage = async (pdf, pageNum) => {
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: canvas.getContext('2d'),
        viewport: viewport,
      };

      await page.render(renderContext).promise;
    } catch (error) {
      console.error('Error rendering page:', error);
    }
  };

  const handlePageChange = async (newPage) => {
    if (newPage < 1 || newPage > numPages) return;
    setCurrentPage(newPage);
    try {
      const pdf = await pdfjsLib.getDocument(url).promise;
      renderPage(pdf, newPage);
    } catch (error) {
      console.error('Error changing page:', error);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Loading PDF...</div>;
  }

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <canvas ref={canvasRef} style={{ maxWidth: '100%', border: '1px solid var(--border)', borderRadius: 8 }} />
      </div>
      {numPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <button
            className="btn btn-sm btn-outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ minWidth: 120, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
            Page {currentPage} of {numPages}
          </span>
          <button
            className="btn btn-sm btn-outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === numPages}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
