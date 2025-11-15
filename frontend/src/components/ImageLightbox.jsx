import { X, Download, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";

const ImageLightbox = ({ src, alt, onClose }) => {
  const [zoom, setZoom] = useState(1);

  const handleDownload = async () => {
    const response = await fetch(src);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = alt || "image.jpg";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition">
        <X size={24} className="text-white" />
      </button>
      
      <div className="absolute top-4 left-4 flex gap-2">
        <button onClick={(e) => { e.stopPropagation(); setZoom(Math.min(zoom + 0.5, 3)); }} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition">
          <ZoomIn size={20} className="text-white" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); setZoom(Math.max(zoom - 0.5, 0.5)); }} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition">
          <ZoomOut size={20} className="text-white" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); handleDownload(); }} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition">
          <Download size={20} className="text-white" />
        </button>
      </div>

      <img src={src} alt={alt} onClick={(e) => e.stopPropagation()} style={{ transform: `scale(${zoom})`, transition: "transform 0.2s" }} className="max-w-[90vw] max-h-[90vh] object-contain" />
    </div>
  );
};

export default ImageLightbox;
