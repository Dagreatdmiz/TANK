import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, RefreshCw, Barcode, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function QRScannerModal() {
  const { isQRScannerOpen, setIsQRScannerOpen, handleScanSuccess, products } = useStore();
  const [cameraError, setCameraError] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const html5QrCodeRef = useRef(null);
  const [manualCode, setManualCode] = useState('');

  // Sample barcodes from actual store inventory for quick 1-click test scanning
  const sampleBarcodes = products.slice(0, 6);

  useEffect(() => {
    if (!isQRScannerOpen) {
      stopScanner();
      return;
    }

    let isMounted = true;

    // Discover video devices
    Html5Qrcode.getCameras()
      .then(devices => {
        if (!isMounted) return;
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Prefer environment/back camera if available
          const backCamera = devices.find(d => 
            d.label.toLowerCase().includes('back') || 
            d.label.toLowerCase().includes('environment') || 
            d.label.toLowerCase().includes('rear')
          );
          const defaultId = backCamera ? backCamera.id : devices[0].id;
          setSelectedCameraId(defaultId);
          startScanner(defaultId);
        } else {
          setCameraError('No camera found on this device. You can test with the quick barcode buttons below.');
        }
      })
      .catch(err => {
        if (!isMounted) return;
        setCameraError('Camera access denied or unavailable. Please enable camera permission or use the quick barcode test buttons.');
      });

    return () => {
      isMounted = false;
      stopScanner();
    };
  }, [isQRScannerOpen]);

  const startScanner = async (cameraId) => {
    try {
      setCameraError(null);
      if (html5QrCodeRef.current) {
        await stopScanner();
      }

      const qrCode = new Html5Qrcode('qr-reader-container');
      html5QrCodeRef.current = qrCode;

      const config = {
        fps: 15,
        qrbox: { width: 260, height: 260 },
        aspectRatio: 1.0,
      };

      await qrCode.start(
        cameraId,
        config,
        (decodedText) => {
          // Success callback
          stopScanner();
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // parse error, ignore per html5-qrcode recommendations
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.warn('Failed to start scanner:', err);
      setCameraError('Unable to start live camera preview. You can use the quick barcode simulator below.');
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (e) {
        // ignore stop errors
      }
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      stopScanner();
      handleScanSuccess(manualCode.trim());
    }
  };

  const handleSimulateScan = (sku) => {
    stopScanner();
    handleScanSuccess(sku);
  };

  if (!isQRScannerOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card scanner-modal animate-scale-in">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-with-icon">
            <div className="icon-badge primary">
              <Camera size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold">QR & Barcode Scanner</h2>
              <p className="text-xs text-muted">Point camera at product barcode or choose a quick sample</p>
            </div>
          </div>
          <button 
            onClick={() => {
              stopScanner();
              setIsQRScannerOpen(false);
            }} 
            className="btn-icon text-muted hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scanner Viewport */}
        <div className="scanner-body">
          <div className="scanner-camera-wrapper">
            <div id="qr-reader-container" className="qr-container"></div>
            
            {/* Visual Laser Guide overlay */}
            <div className="scanner-reticle-overlay">
              <div className="reticle-box">
                <div className="reticle-laser"></div>
                <div className="corner top-left"></div>
                <div className="corner top-right"></div>
                <div className="corner bottom-left"></div>
                <div className="corner bottom-right"></div>
              </div>
            </div>

            {cameraError && (
              <div className="camera-error-banner">
                <AlertTriangle size={24} className="text-amber" />
                <p className="text-sm">{cameraError}</p>
              </div>
            )}
          </div>

          {/* Camera Switcher if multiple available */}
          {cameras.length > 1 && (
            <div className="flex items-center justify-between mt-3 px-1">
              <span className="text-xs text-muted">Camera Source:</span>
              <select 
                value={selectedCameraId || ''} 
                onChange={(e) => {
                  setSelectedCameraId(e.target.value);
                  startScanner(e.target.value);
                }}
                className="input-select text-xs py-1 px-2"
              >
                {cameras.map(cam => (
                  <option key={cam.id} value={cam.id}>
                    {cam.label || `Camera ${cam.id}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Manual Entry Form */}
          <form onSubmit={handleManualSubmit} className="manual-barcode-form mt-4">
            <label className="text-xs font-semibold text-muted block mb-1">
              Type or Scan with Physical USB Scanner:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Barcode size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Enter barcode or SKU..."
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="input-field pl-9 py-2 text-sm w-full font-mono"
                  autoFocus
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm px-4">
                Submit
              </button>
            </div>
          </form>

          {/* Quick Simulation Barcode Buttons */}
          <div className="quick-simulate-section mt-4 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-1.5 mb-2">
              <Zap size={14} className="text-amber" />
              <span className="text-xs font-semibold text-slate-300">Quick Test Barcode Simulator:</span>
            </div>
            <div className="quick-simulate-grid">
              {sampleBarcodes.map(prod => (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => handleSimulateScan(prod.sku)}
                  className="quick-barcode-btn"
                  title={`Simulate scan for ${prod.name}`}
                >
                  <span className="item-icon">{prod.image}</span>
                  <div className="text-left flex-1 min-w-0">
                    <div className="text-xs font-medium truncate text-white">{prod.name}</div>
                    <div className="text-[10px] font-mono text-emerald-400">{prod.sku}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer justify-end">
          <button
            type="button"
            onClick={() => {
              stopScanner();
              setIsQRScannerOpen(false);
            }}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
