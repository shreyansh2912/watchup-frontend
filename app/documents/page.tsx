"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, FilePlus, FolderOpen, Pen, Square, MousePointer, Save, ArrowLeft, ZoomIn, ZoomOut, Type, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

interface CanvasFile {
  id: number;
  name: string;
  data: any; // JSON data
  createdAt: string;
}

interface Point {
  x: number;
  y: number;
}

interface DrawingElement {
  type: 'path' | 'rect' | 'text' | 'line' | 'arrow' | 'circle';
  points?: Point[]; // For path
  x?: number; // For rect/text/circle
  y?: number; // For rect/text/circle
  width?: number; // For rect/circle
  height?: number; // For rect/circle
  text?: string; // For text
  color: string; // Stroke/Text color
  fillColor?: string; // For rect/circle
  strokeWidth: number;
  fontSize?: number; // For text
  startX?: number; // For line/arrow
  startY?: number; // For line/arrow
  endX?: number; // For line/arrow
  endY?: number; // For line/arrow
}

export default function DocumentsPage() {
  const { token, user } = useAuth();
  const [view, setView] = useState<'manager' | 'editor'>('manager');
  const [files, setFiles] = useState<CanvasFile[]>([]);
  const [currentFile, setCurrentFile] = useState<CanvasFile | null>(null);
  const [newFileName, setNewFileName] = useState('');

  // Editor State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<'select' | 'pen' | 'rect' | 'text' | 'eraser' | 'line' | 'arrow' | 'circle'>('pen');
  const [color, setColor] = useState('#000000');
  const [fillColor, setFillColor] = useState('transparent');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fontSize, setFontSize] = useState(20);
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [textInput, setTextInput] = useState<{ x: number, y: number, value: string } | null>(null);

  // Load files from API
  useEffect(() => {
    if (token) {
        fetchFiles();
    }
  }, [token]);

  const fetchFiles = async () => {
    if (!token) return;
    try {
      const res = await api.get('/canvas');
      setFiles(res.data);
    } catch (err) {
      console.error("Failed to fetch files", err);
    }
  };


  const handleCreateFile = async () => {
    if (!newFileName.trim() || !token) return;
    try {
      const res = await api.post('/canvas', { name: newFileName });
      setFiles([res.data, ...files]);
      setCurrentFile(res.data);
      setElements([]);
      setNewFileName('');
      setView('editor');
      setOffset({ x: 0, y: 0 });
      setScale(1);
    } catch (err) {
      console.error("Failed to create file", err);
    }
  };

  const handleOpenFile = (file: CanvasFile) => {
    setCurrentFile(file);
    setElements(file.data || []);
    setView('editor');
    setOffset({ x: 0, y: 0 });
    setScale(1);
  };

  const handleSave = async () => {
    if (!currentFile || !token) return;
    try {
      const res = await api.put(`/canvas/${currentFile.id}`, { data: elements });
      // Update local state
      setFiles(files.map(f => f.id === currentFile.id ? { ...f, data: elements } : f));
      toast.success("Saved!");
    } catch (err) {
      console.error("Failed to save file", err);
    }
  };

  const handleDeleteFile = async (e: React.MouseEvent, id: number) => {
      e.stopPropagation();
      if(!confirm("Delete this file?") || !token) return;
      try {
        await api.delete(`/canvas/${id}`);
        setFiles(files.filter(f => f.id !== id));
      } catch (err) {
          console.error("Failed to delete", err);
      }
  }

  // Canvas Rendering
  useEffect(() => {
    if (view !== 'editor' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.save();
      ctx.translate(offset.x, offset.y);
      ctx.scale(scale, scale);

      // Draw elements
      elements.forEach(el => {
        ctx.strokeStyle = el.color;
        ctx.lineWidth = el.strokeWidth;
        ctx.fillStyle = el.fillColor || 'transparent';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        if (el.type === 'path' && el.points) {
          if (el.points.length > 0) {
            ctx.moveTo(el.points[0].x, el.points[0].y);
            el.points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.stroke();
          }
        } else if (el.type === 'rect' && el.x !== undefined && el.y !== undefined) {
          ctx.rect(el.x, el.y, el.width || 0, el.height || 0);
          if (el.fillColor && el.fillColor !== 'transparent') ctx.fill();
          ctx.stroke();
        } else if (el.type === 'circle' && el.x !== undefined && el.y !== undefined) {
            ctx.beginPath();
            const radius = Math.sqrt(Math.pow(el.width || 0, 2) + Math.pow(el.height || 0, 2)) / 2;
            const centerX = el.x + (el.width || 0) / 2;
            const centerY = el.y + (el.height || 0) / 2;
            ctx.ellipse(centerX, centerY, Math.abs((el.width || 0) / 2), Math.abs((el.height || 0) / 2), 0, 0, 2 * Math.PI);
            if (el.fillColor && el.fillColor !== 'transparent') ctx.fill();
            ctx.stroke();
        } else if ((el.type === 'line' || el.type === 'arrow') && el.startX !== undefined && el.endX !== undefined) {
            ctx.moveTo(el.startX, el.startY || 0);
            ctx.lineTo(el.endX, el.endY || 0);
            ctx.stroke();

            if (el.type === 'arrow') {
                const headLength = 10 + el.strokeWidth;
                const dx = el.endX - (el.startX || 0);
                const dy = (el.endY || 0) - (el.startY || 0);
                const angle = Math.atan2(dy, dx);
                ctx.beginPath();
                ctx.moveTo(el.endX, el.endY || 0);
                ctx.lineTo(el.endX - headLength * Math.cos(angle - Math.PI / 6), (el.endY || 0) - headLength * Math.sin(angle - Math.PI / 6));
                ctx.moveTo(el.endX, el.endY || 0);
                ctx.lineTo(el.endX - headLength * Math.cos(angle + Math.PI / 6), (el.endY || 0) - headLength * Math.sin(angle + Math.PI / 6));
                ctx.stroke();
            }
        } else if (el.type === 'text' && el.text && el.x !== undefined && el.y !== undefined) {
            ctx.font = `${el.fontSize || 20}px sans-serif`;
            ctx.fillStyle = el.color; // Text color is stroke color
            ctx.fillText(el.text, el.x, el.y);
        }
      });

      ctx.restore();
    };

    // Handle resize
    const resize = () => {
        canvas.width = canvas.parentElement?.clientWidth || 800;
        canvas.height = canvas.parentElement?.clientHeight || 600;
        draw();
    };
    
    resize();
    window.addEventListener('resize', resize);

    return () => window.removeEventListener('resize', resize);
  }, [view, elements, scale, offset]);

  // Mouse Event Handlers for Canvas
  const getCanvasPoint = (e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - offset.x) / scale,
      y: (e.clientY - rect.top - offset.y) / scale
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (tool === 'select') {
        setIsPanning(true);
        setStartPoint({ x: e.clientX, y: e.clientY });
        return;
    }

    if (tool === 'text') {
        const point = getCanvasPoint(e);
        setTextInput({ x: point.x, y: point.y, value: '' });
        return;
    }

    if (tool === 'eraser') {
        setIsDrawing(true);
        // Delete element under cursor
        const point = getCanvasPoint(e);
        const newElements = elements.filter(el => {
            if (el.type === 'rect' || el.type === 'circle') {
                return !(point.x >= (el.x || 0) && point.x <= (el.x || 0) + (el.width || 0) &&
                         point.y >= (el.y || 0) && point.y <= (el.y || 0) + (el.height || 0));
            }
            // Simple proximity check for others
            if (el.type === 'path' && el.points) {
                return !el.points.some(p => Math.hypot(p.x - point.x, p.y - point.y) < 10);
            }
            if (el.type === 'line' || el.type === 'arrow') {
                 // Distance to line segment check could be better, but simple box for now
                 const minX = Math.min(el.startX || 0, el.endX || 0) - 10;
                 const maxX = Math.max(el.startX || 0, el.endX || 0) + 10;
                 const minY = Math.min(el.startY || 0, el.endY || 0) - 10;
                 const maxY = Math.max(el.startY || 0, el.endY || 0) + 10;
                 return !(point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY);
            }
            if (el.type === 'text' && el.x !== undefined && el.y !== undefined) {
                 return !(point.x >= el.x && point.x <= el.x + (el.text?.length || 0) * (el.fontSize || 20) * 0.6 &&
                          point.y >= el.y - (el.fontSize || 20) && point.y <= el.y);
            }
            return true;
        });
        setElements(newElements);
        return;
    }

    setIsDrawing(true);
    const point = getCanvasPoint(e);
    setStartPoint(point);

    if (tool === 'pen') {
      setElements([...elements, { type: 'path', points: [point], color, strokeWidth }]);
    } else if (tool === 'rect') {
      setElements([...elements, { type: 'rect', x: point.x, y: point.y, width: 0, height: 0, color, fillColor, strokeWidth }]);
    } else if (tool === 'circle') {
      setElements([...elements, { type: 'circle', x: point.x, y: point.y, width: 0, height: 0, color, fillColor, strokeWidth }]);
    } else if (tool === 'line' || tool === 'arrow') {
      setElements([...elements, { type: tool, startX: point.x, startY: point.y, endX: point.x, endY: point.y, color, strokeWidth }]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && startPoint) {
        const dx = e.clientX - startPoint.x;
        const dy = e.clientY - startPoint.y;
        setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        setStartPoint({ x: e.clientX, y: e.clientY });
        return;
    }

    if (!isDrawing || !startPoint) return;
    const point = getCanvasPoint(e);

    if (tool === 'eraser') {
         // Continue deleting while dragging
        const newElements = elements.filter(el => {
            if (el.type === 'rect' || el.type === 'circle') {
                return !(point.x >= (el.x || 0) && point.x <= (el.x || 0) + (el.width || 0) &&
                         point.y >= (el.y || 0) && point.y <= (el.y || 0) + (el.height || 0));
            }
            if (el.type === 'path' && el.points) {
                return !el.points.some(p => Math.hypot(p.x - point.x, p.y - point.y) < 10);
            }
             if (el.type === 'line' || el.type === 'arrow') {
                 const minX = Math.min(el.startX || 0, el.endX || 0) - 10;
                 const maxX = Math.max(el.startX || 0, el.endX || 0) + 10;
                 const minY = Math.min(el.startY || 0, el.endY || 0) - 10;
                 const maxY = Math.max(el.startY || 0, el.endY || 0) + 10;
                 return !(point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY);
            }
            if (el.type === 'text' && el.x !== undefined && el.y !== undefined) {
                 return !(point.x >= el.x && point.x <= el.x + (el.text?.length || 0) * (el.fontSize || 20) * 0.6 &&
                          point.y >= el.y - (el.fontSize || 20) && point.y <= el.y);
            }
            return true;
        });
        setElements(newElements);
        return;
    }

    if (tool === 'pen') {
      const newElements = [...elements];
      const currentElement = newElements[newElements.length - 1];
      if (currentElement.type === 'path' && currentElement.points) {
        currentElement.points.push(point);
        setElements(newElements);
      }
    } else if (tool === 'rect' || tool === 'circle') {
      const newElements = [...elements];
      const currentElement = newElements[newElements.length - 1];
      if (currentElement.type === 'rect' || currentElement.type === 'circle') {
        currentElement.width = point.x - (currentElement.x || 0);
        currentElement.height = point.y - (currentElement.y || 0);
        setElements(newElements);
      }
    } else if (tool === 'line' || tool === 'arrow') {
      const newElements = [...elements];
      const currentElement = newElements[newElements.length - 1];
      if (currentElement.type === 'line' || currentElement.type === 'arrow') {
        currentElement.endX = point.x;
        currentElement.endY = point.y;
        setElements(newElements);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setIsPanning(false);
    setStartPoint(null);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (textInput && textInput.value) {
          setElements([...elements, { 
              type: 'text', 
              x: textInput.x, 
              y: textInput.y, 
              text: textInput.value, 
              color, 
              fontSize,
              strokeWidth: 0 
            }]);
      }
      setTextInput(null);
  }

  if (!user) {
      return (
          <div className="min-h-screen bg-white dark:bg-gray-950">
              <Navbar />
              <div className="container py-10 text-center">
                  <h1 className="text-2xl font-bold mb-4">Please login to view your documents</h1>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-muted/30">
          <div className="flex items-center gap-4">
            {view === 'editor' && (
              <Button variant="ghost" size="icon" onClick={() => setView('manager')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <h2 className="font-bold text-lg">
              {view === 'manager' ? 'My Documents' : currentFile?.name || 'Untitled'}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative">
          {view === 'manager' ? (
            <div className="p-8 h-full overflow-y-auto">
              {/* Create New */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Create New</h3>
                <div className="flex gap-4 max-w-md">
                  <Input 
                    placeholder="File Name..." 
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                  />
                  <Button onClick={handleCreateFile}>
                    <FilePlus className="w-4 h-4 mr-2" />
                    Create
                  </Button>
                </div>
              </div>

              {/* Saved Files */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Saved Files</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {files.map(file => (
                    <div 
                      key={file.id} 
                      className="p-4 border border-border rounded-lg hover:border-primary cursor-pointer transition-colors bg-card relative group"
                      onClick={() => handleOpenFile(file)}
                    >
                      <FolderOpen className="w-8 h-8 text-primary mb-2" />
                      <p className="font-semibold truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{new Date(file.createdAt).toLocaleDateString()}</p>
                      <button 
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded text-red-500"
                        onClick={(e) => handleDeleteFile(e, file.id)}
                      >
                          <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {files.length === 0 && (
                    <p className="text-muted-foreground italic">No files saved yet.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col relative bg-[#f8f9fa] dark:bg-gray-900">
              {/* Canvas Area */}
              <div className="flex-1 relative overflow-hidden cursor-crosshair">
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 touch-none"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                />
                
                {/* Text Input Overlay */}
                {textInput && (
                     <textarea
                        autoFocus
                        value={textInput.value}
                        onChange={(e) => setTextInput({ ...textInput, value: e.target.value })}
                        onBlur={handleTextSubmit}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleTextSubmit(e);
                            }
                        }}
                        className="absolute bg-transparent border border-primary outline-none resize-none overflow-hidden"
                        style={{ 
                            left: textInput.x * scale + offset.x, 
                            top: textInput.y * scale + offset.y,
                            color: color, 
                            fontSize: `${fontSize * scale}px`,
                            minWidth: '100px',
                            height: 'auto',
                            lineHeight: '1.2'
                        }}
                        placeholder="Type here..."
                    />
                )}
              </div>

              {/* Floating Toolbar (Eraser.io Style) */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-border p-2 flex items-center gap-2 z-10">
                 <div className="flex items-center gap-1 border-r border-border pr-2">
                    <Button variant={tool === 'select' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('select')} title="Select / Pan">
                        <MousePointer className="w-4 h-4" />
                    </Button>
                 </div>
                 <div className="flex items-center gap-1 border-r border-border pr-2">
                    <Button variant={tool === 'pen' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('pen')} title="Pen">
                        <Pen className="w-4 h-4" />
                    </Button>
                    <Button variant={tool === 'eraser' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('eraser')} title="Eraser">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                 </div>
                 <div className="flex items-center gap-1 border-r border-border pr-2">
                    <Button variant={tool === 'rect' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('rect')} title="Rectangle">
                        <Square className="w-4 h-4" />
                    </Button>
                     <Button variant={tool === 'circle' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('circle')} title="Circle">
                        <div className="w-4 h-4 border-2 border-current rounded-full" />
                    </Button>
                     <Button variant={tool === 'arrow' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('arrow')} title="Arrow">
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                    </Button>
                     <Button variant={tool === 'line' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('line')} title="Line">
                        <div className="w-4 h-0.5 bg-current -rotate-45" />
                    </Button>
                 </div>
                 <div className="flex items-center gap-1">
                    <Button variant={tool === 'text' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('text')} title="Text">
                        <Type className="w-4 h-4" />
                    </Button>
                 </div>
              </div>

              {/* Properties Bar (Floating Top Left) */}
              <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-border p-2 flex flex-col gap-3 z-10">
                 <div className="flex items-center gap-2">
                    <span className="text-xs font-medium w-12">Color</span>
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0 p-0" />
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-xs font-medium w-12">Fill</span>
                     <div className="flex items-center gap-1">
                         <input type="color" value={fillColor === 'transparent' ? '#ffffff' : fillColor} onChange={(e) => setFillColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0 p-0" />
                         <button onClick={() => setFillColor('transparent')} className="text-[10px] underline text-muted-foreground">None</button>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-xs font-medium w-12">Width</span>
                    <input type="range" min="1" max="20" value={strokeWidth} onChange={(e) => setStrokeWidth(parseInt(e.target.value))} className="w-20 h-2" />
                 </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium w-12">Size</span>
                    <input type="number" min="10" max="100" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="w-12 h-6 text-xs border rounded px-1" />
                 </div>
              </div>

               {/* Zoom Controls (Floating Bottom Right) */}
               <div className="absolute bottom-6 right-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-border p-1 flex items-center gap-1 z-10">
                    <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.max(0.1, s - 0.1))}>
                        <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-xs w-10 text-center">{Math.round(scale * 100)}%</span>
                    <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.min(5, s + 0.1))}>
                        <ZoomIn className="w-4 h-4" />
                    </Button>
                    <div className="w-px h-4 bg-border mx-1" />
                     <Button variant="default" size="sm" onClick={handleSave} className="h-8">
                        <Save className="w-3 h-3 mr-1" />
                        Save
                    </Button>
                </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
