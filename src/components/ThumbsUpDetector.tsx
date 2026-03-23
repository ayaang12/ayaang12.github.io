import { useEffect, useState, useCallback } from 'react';
import { useTeachableMachine } from '../hooks/useTeachableMachine';
import { WebcamView } from './WebcamView';
import { Camera, AlertCircle, Loader2, ThumbsUp, Info } from 'lucide-react';

const DEFAULT_MODEL_URL = 'https://teachablemachine.withgoogle.com/models/YOUR_MODEL_ID/';

export function ThumbsUpDetector() {
  const [modelUrl, setModelUrl] = useState(DEFAULT_MODEL_URL);
  const [customUrl, setCustomUrl] = useState('');
  const [webcamCanvas, setWebcamCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [showThumbsUp, setShowThumbsUp] = useState(false);
  const [detectionCount, setDetectionCount] = useState(0);
  const [isEditingUrl, setIsEditingUrl] = useState(true);

  const { model, predictions, isLoading, error, startWebcam, predict, stopWebcam } =
    useTeachableMachine(modelUrl);

  useEffect(() => {
    const thumbsUpPrediction = predictions.find(
      (p) =>
        p.className.toLowerCase().includes('thumbs') ||
        p.className.toLowerCase().includes('thumb')
    );

    if (thumbsUpPrediction && thumbsUpPrediction.probability > 0.85) {
      setShowThumbsUp(true);
      setDetectionCount((prev) => prev + 1);

      const timer = setTimeout(() => {
        setShowThumbsUp(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [predictions]);

  const handleStartWebcam = useCallback(async () => {
    if (!model) return;

    try {
      const canvas = await startWebcam();
      setWebcamCanvas(canvas);
      setIsWebcamActive(true);
      predict();
    } catch (err) {
      console.error('Failed to start webcam:', err);
    }
  }, [model, startWebcam, predict]);

  const handleStopWebcam = useCallback(() => {
    stopWebcam();
    setIsWebcamActive(false);
    setWebcamCanvas(null);
  }, [stopWebcam]);

  const handleLoadModel = () => {
    if (customUrl.trim()) {
      let url = customUrl.trim();
      if (!url.endsWith('/')) {
        url += '/';
      }
      setModelUrl(url);
      setIsEditingUrl(false);
    }
  };

  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, [stopWebcam]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <ThumbsUp className="w-12 h-12 text-blue-600" />
            <h1 className="text-5xl font-bold text-gray-900">
              Thumbs Up Detector
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Using Google Teachable Machine for gesture recognition
          </p>
        </div>

        {isEditingUrl && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-blue-100">
            <div className="flex items-start gap-3 mb-4">
              <Info className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Setup Instructions
                </h3>
                <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                  <li>
                    Go to{' '}
                    <a
                      href="https://teachablemachine.withgoogle.com/train/image"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Teachable Machine
                    </a>
                  </li>
                  <li>Create an Image Project with 2 classes: "Thumbs Up" and "No Thumbs"</li>
                  <li>Record samples for each class using your webcam</li>
                  <li>Train your model</li>
                  <li>Export the model and copy the shareable link</li>
                  <li>Paste the link below</li>
                </ol>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://teachablemachine.withgoogle.com/models/YOUR_MODEL_ID/"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleLoadModel()}
              />
              <button
                onClick={handleLoadModel}
                disabled={!customUrl.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
              >
                Load Model
              </button>
            </div>
          </div>
        )}

        {!isEditingUrl && (
          <>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-red-800 font-medium">{error}</p>
                  <button
                    onClick={() => setIsEditingUrl(true)}
                    className="text-red-600 hover:underline text-sm mt-1"
                  >
                    Change model URL
                  </button>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="bg-white rounded-xl shadow-lg p-8 mb-6 flex items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                <p className="text-gray-600 font-medium">Loading model...</p>
              </div>
            )}

            {!isLoading && !error && model && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-gray-700 font-medium">Model loaded successfully</p>
                  </div>
                  <button
                    onClick={() => setIsEditingUrl(true)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Change model
                  </button>
                </div>

                {!isWebcamActive ? (
                  <button
                    onClick={handleStartWebcam}
                    className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                    Start Webcam
                  </button>
                ) : (
                  <button
                    onClick={handleStopWebcam}
                    className="w-full py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    Stop Webcam
                  </button>
                )}
              </div>
            )}

            {isWebcamActive && (
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-blue-600" />
                    Live Camera Feed
                  </h3>
                  <WebcamView webcamCanvas={webcamCanvas} />
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Predictions
                    </h3>
                    <div className="space-y-3">
                      {predictions.map((prediction, index) => (
                        <div key={index}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700">
                              {prediction.className}
                            </span>
                            <span className="text-sm text-gray-600">
                              {(prediction.probability * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${prediction.probability * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Detection Stats
                    </h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {detectionCount}
                    </p>
                    <p className="text-sm text-gray-600">Thumbs up detected</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {showThumbsUp && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <div className="text-9xl animate-bounce drop-shadow-2xl">
              👍
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
