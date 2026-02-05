import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Delete } from 'lucide-react';
import { SEO } from '../components/SEO';
import { useToastStore } from '../store/toastStore';

export const AdminAuth: React.FC = () => {
    const [pin, setPin] = useState('');
    const [isError, setIsError] = useState(false);
    const navigate = useNavigate();
    const { addToast } = useToastStore();

    const CORRECT_PIN = '7775';

    useEffect(() => {
        if (pin.length === 4) {
            if (pin === CORRECT_PIN) {
                localStorage.setItem('dracarys_admin_token', 'authenticated_' + Date.now());
                addToast('success', 'Доступ разрешен');
                navigate('/dracarys-admin');
            } else {
                setIsError(true);
                addToast('error', 'Неверный PIN-код');
                setTimeout(() => {
                    setPin('');
                    setIsError(false);
                }, 500);
            }
        }
    }, [pin, navigate, addToast]);

    const handleNumberClick = (num: string) => {
        if (pin.length < 4) {
            setPin(prev => prev + num);
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
            <SEO title="Вход в управление" noindex />

            <div className="w-full max-w-xs space-y-12 animate-fade-in pt-20">
                <div className="text-center space-y-4">
                    <div className={`w-20 h-20 bg-dark text-white rounded-apple-xl flex items-center justify-center mx-auto transition-all duration-300 shadow-apple ${isError ? 'bg-accent shake' : ''}`}>
                        <Lock className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-black tracking-tighter uppercase">Admin Access</h1>
                    <p className="text-sm text-gray font-medium">Введите секретный код для входа</p>
                </div>

                {/* PIN Indicators */}
                <div className="flex justify-center gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${pin.length > i
                                ? 'bg-dark border-dark scale-110'
                                : 'border-gray-light bg-transparent'
                                } ${isError ? 'border-accent bg-accent' : ''}`}
                        />
                    ))}
                </div>

                {/* Keypad */}
                <div className="grid grid-cols-3 gap-4 px-4">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                        <button
                            key={num}
                            onClick={() => handleNumberClick(num)}
                            className="w-16 h-16 rounded-full glass border-transparent text-2xl font-bold text-dark hover:bg-dark hover:text-white active:scale-90 transition-all duration-200"
                        >
                            {num}
                        </button>
                    ))}
                    <div />
                    <button
                        onClick={() => handleNumberClick('0')}
                        className="w-16 h-16 rounded-full glass border-transparent text-2xl font-bold text-dark hover:bg-dark hover:text-white active:scale-90 transition-all duration-200"
                    >
                        0
                    </button>
                    <button
                        onClick={handleDelete}
                        className="w-16 h-16 rounded-full flex items-center justify-center text-gray hover:text-dark active:scale-90 transition-all duration-200"
                        aria-label="Удалить"
                    >
                        <Delete className="w-6 h-6" />
                    </button>
                </div>

                <div className="text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-xs font-bold text-gray uppercase tracking-widest hover:text-dark transition-colors"
                    >
                        Вернуться на главную
                    </button>
                </div>
            </div>

            <style>{`
        .shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
        </div>
    );
};
