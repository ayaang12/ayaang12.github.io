import { useEffect, useRef, useState } from 'react';
import * as tmImage from '@teachablemachine/image';

interface Prediction {
  className: string;
  probability: number;
}

export function useTeachableMachine(modelUrl: string) {
  const [model, setModel] = useState<tmImage.CustomMobileNet | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const webcamRef = useRef<tmImage.Webcam | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadModel() {
      try {
        setIsLoading(true);
        setError(null);

        const modelURL = modelUrl + 'model.json';
        const metadataURL = modelUrl + 'metadata.json';

        const loadedModel = await tmImage.load(modelURL, metadataURL);

        if (mounted) {
          setModel(loadedModel);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to load model. Please check the model URL.');
          setIsLoading(false);
        }
      }
    }

    if (modelUrl) {
      loadModel();
    }

    return () => {
      mounted = false;
    };
  }, [modelUrl]);

  const startWebcam = async () => {
    try {
      setError(null);
      const flip = true;
      const width = 640;
      const height = 480;

      const webcam = new tmImage.Webcam(width, height, flip);
      await webcam.setup();
      await webcam.play();

      webcamRef.current = webcam;

      return webcam.canvas;
    } catch (err) {
      setError('Failed to access webcam. Please allow camera permissions.');
      throw err;
    }
  };

  const predict = async () => {
    if (!model || !webcamRef.current) return;

    try {
      webcamRef.current.update();
      const prediction = await model.predict(webcamRef.current.canvas);
      setPredictions(prediction);

      animationFrameRef.current = requestAnimationFrame(predict);
    } catch (err) {
      setError('Prediction error occurred.');
    }
  };

  const stopWebcam = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (webcamRef.current) {
      webcamRef.current.stop();
    }
  };

  return {
    model,
    predictions,
    isLoading,
    error,
    startWebcam,
    predict,
    stopWebcam,
  };
}
