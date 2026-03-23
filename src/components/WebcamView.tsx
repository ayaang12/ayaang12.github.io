import { useEffect, useRef } from 'react';

interface WebcamViewProps {
  webcamCanvas: HTMLCanvasElement | null;
}

export function WebcamView({ webcamCanvas }: WebcamViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (webcamCanvas && containerRef.current) {
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(webcamCanvas);
    }
  }, [webcamCanvas]);

  return (
    <div
      ref={containerRef}
      className="relative rounded-lg overflow-hidden shadow-2xl border-4 border-blue-500"
    />
  );
}
