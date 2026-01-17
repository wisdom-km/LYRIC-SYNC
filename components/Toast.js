import { CheckCircle2, XCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const isSuccess = type === 'success';

    return (
        <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
            style={{
                backgroundColor: 'rgba(20, 20, 22, 0.9)',
                backdropFilter: 'blur(10px)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                color: '#fff'
            }}
        >
            <div className={`flex items-center justify-center w-6 h-6 rounded-full ${isSuccess ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                {isSuccess ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            </div>
            <p className="text-sm font-medium pr-2">{message}</p>
            <button
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                }}
                className="text-white/40 hover:text-white transition-colors"
            >
                <X size={14} />
            </button>
        </div>
    );
}
