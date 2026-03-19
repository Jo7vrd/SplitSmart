import { useRef, useCallback, useState } from 'react'
import Webcam from 'react-webcam'
import { X, Zap, Image as ImageIcon } from 'lucide-react'

interface Props {
    onBack: () => void
    onCapture: (img: string) => void
}

export default function ScanStruk({ onBack, onCapture }: Props) {
    const webcamRef = useRef<Webcam>(null)
    const [flashOn, setFlashOn] = useState(false)

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot()
        if (imageSrc) onCapture(imageSrc)
    }, [onCapture])

    return (
        <div className="flex flex-col h-[100dvh] bg-dark text-white relative overflow-hidden">

            {/* Webcam */}
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: 'environment' }}
                className="absolute inset-0 w-full h-full object-cover opacity-80"
            />

            {/* Overlay */}
            <div className="relative z-10 flex flex-col h-full">

                {/* Status Bar spacing */}
                <div className="pt-14" />

                {/* Top Bar */}
                <div className="flex justify-between items-center px-6 pb-4">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm font-medium active:scale-95 transition-transform"
                    >
                        <X size={14} />
                        Batal
                    </button>
                    <button
                        onClick={() => setFlashOn(!flashOn)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium active:scale-95 transition-transform ${flashOn ? 'bg-amber-400 text-dark' : 'bg-white/10 text-white'
                            }`}
                    >
                        <Zap size={14} className={flashOn ? 'fill-dark' : ''} />
                        Flash
                    </button>
                </div>

                {/* Title */}
                <div className="text-center mt-4 mb-8">
                    <h1 className="font-sans text-2xl font-bold">Scan Struk</h1>
                    <p className="text-sm text-white/50 mt-1 font-sans">Arahkan kamera ke struk belanja</p>
                </div>

                {/* Scanner Frame */}
                <div className="flex-1 flex items-center justify-center px-10">
                    <div className="relative w-full aspect-[3/4]">

                        {/* Corner brackets — accent color */}
                        <span className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-accent rounded-tl-sm" />
                        <span className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-accent rounded-tr-sm" />
                        <span className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-accent rounded-bl-sm" />
                        <span className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-accent rounded-br-sm" />

                        {/* Scan line animation */}
                        <span className="absolute left-0 right-0 h-[2px] bg-accent/60 animate-scan" />
                    </div>
                </div>

                {/* Hint */}
                <p className="text-center text-sm text-white/40 font-sans mt-6">
                    Pastikan seluruh struk terlihat dalam bingkai
                </p>

                {/* Bottom Controls */}
                <div className="pb-10 pt-6 px-10 flex justify-between items-center">
                    <button className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center active:scale-95 transition-transform">
                        <ImageIcon size={20} />
                    </button>

                    {/* Shutter */}
                    <button
                        onClick={capture}
                        className="w-20 h-20 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                        style={{ background: 'rgba(255,255,255,0.15)', padding: 4 }}
                    >
                        <div className="w-full h-full bg-white rounded-full" />
                    </button>

                    <div className="w-14 h-14" />
                </div>

            </div>
        </div>
    )
}