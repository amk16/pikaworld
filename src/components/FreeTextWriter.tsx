import React, { useState, useRef, useEffect } from 'react';

interface TextElement {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
}

interface FreeTextWriterProps {
  workspaceId?: string;
  initialTextContent?: string;
  onTextChange?: (textContent: string) => void;
}

const FreeTextWriter: React.FC<FreeTextWriterProps> = ({ 
  workspaceId, 
  initialTextContent, 
  onTextChange 
}) => {
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Load initial text content from workspace
  useEffect(() => {
    if (initialTextContent) {
      try {
        const parsedElements = JSON.parse(initialTextContent);
        if (Array.isArray(parsedElements)) {
          setTextElements(parsedElements);
        }
      } catch (error) {
        console.error('Error parsing initial text content:', error);
      }
    }
  }, [initialTextContent, workspaceId]);

  // Save text content when it changes
  useEffect(() => {
    if (onTextChange) {
      const textContent = JSON.stringify(textElements);
      onTextChange(textContent);
    }
  }, [textElements, onTextChange]);

  const handleContainerClick = (e: React.MouseEvent) => {
    // Don't create new text if clicking on existing text or while dragging
    if (editingId || draggingId) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newTextElement: TextElement = {
      id: Date.now().toString(),
      x,
      y,
      text: 'Click to edit',
      fontSize: 16,
      color: '#000000'
    };

    setTextElements(prev => [...prev, newTextElement]);
    setEditingId(newTextElement.id);
  };

  const handleTextClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (draggingId) return;
    setEditingId(id);
  };

  const handleTextChange = (id: string, newText: string) => {
    setTextElements(prev =>
      prev.map(el => (el.id === id ? { ...el, text: newText } : el))
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      setEditingId(null);
    }
    if (e.key === 'Delete' && e.ctrlKey) {
      // Only delete the entire text element with Ctrl+Delete
      setTextElements(prev => prev.filter(el => el.id !== id));
      setEditingId(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setEditingId(null);
    setDraggingId(id);
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const element = textElements.find(el => el.id === id);
    if (element) {
      setDragOffset({
        x: e.clientX - rect.left - element.x,
        y: e.clientY - rect.top - element.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    setTextElements(prev =>
      prev.map(el =>
        el.id === draggingId ? { ...el, x, y } : el
      )
    );
  };

  const handleMouseUp = () => {
    setDraggingId(null);
    setDragOffset({ x: 0, y: 0 });
  };

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (draggingId) {
      document.addEventListener('mousemove', handleMouseMove as any);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove as any);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingId, dragOffset]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full absolute inset-0 cursor-crosshair"
      onClick={handleContainerClick}
      onMouseMove={handleMouseMove}
    >
      {textElements.map(element => (
        <div
          key={element.id}
          className={`absolute select-none ${
            draggingId === element.id ? 'cursor-grabbing' : 'cursor-grab'
          } ${editingId === element.id ? 'outline-none' : ''}`}
          style={{
            left: element.x,
            top: element.y,
            fontSize: element.fontSize,
            color: element.color,
            zIndex: editingId === element.id ? 1000 : 100
          }}
          onClick={(e) => handleTextClick(e, element.id)}
          onMouseDown={(e) => handleMouseDown(e, element.id)}
        >
          {editingId === element.id ? (
            <input
              type="text"
              value={element.text}
              onChange={(e) => handleTextChange(element.id, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, element.id)}
              onBlur={() => setEditingId(null)}
              className="bg-transparent border-none outline-none font-inherit"
              style={{
                fontSize: 'inherit',
                color: 'inherit',
                fontFamily: 'inherit'
              }}
              autoFocus
            />
          ) : (
            <span
              className="hover:bg-yellow-200 hover:bg-opacity-30 px-1 rounded transition-colors"
              style={{ fontSize: 'inherit', color: 'inherit' }}
            >
              {element.text}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default FreeTextWriter;
