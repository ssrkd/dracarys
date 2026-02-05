import React from 'react'

export default function AnimatedWaterBackground({ children, position = 'left' }) {
    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #4DD0E1 0%, #26C6DA 25%, #00BCD4 50%, #00ACC1 75%, #0097A7 100%)',
            backgroundSize: '400% 400%',
            animation: 'waterFlow 20s ease infinite'
        }}>
            {/* Floating bubbles/circles */}
            <div style={{
                position: 'absolute',
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                top: '10%',
                left: '15%',
                animation: 'float 8s ease-in-out infinite',
                backdropFilter: 'blur(2px)'
            }} />

            <div style={{
                position: 'absolute',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                top: '60%',
                right: '20%',
                animation: 'float 6s ease-in-out infinite 1s',
                backdropFilter: 'blur(2px)'
            }} />

            <div style={{
                position: 'absolute',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.12)',
                bottom: '15%',
                left: '25%',
                animation: 'float 10s ease-in-out infinite 2s',
                backdropFilter: 'blur(2px)'
            }} />

            <div style={{
                position: 'absolute',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.06)',
                top: '35%',
                right: '15%',
                animation: 'float 12s ease-in-out infinite 0.5s',
                backdropFilter: 'blur(2px)'
            }} />

            {/* Wave overlay */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '200px',
                background: 'linear-gradient(180deg, transparent 0%, rgba(0, 151, 167, 0.3) 100%)',
                animation: 'wave 4s ease-in-out infinite'
            }} />

            {/* Content */}
            <div style={{
                position: 'relative',
                zIndex: 1,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                color: '#FFFFFF'
            }}>
                {children}
            </div>

            <style>{`
        @keyframes waterFlow {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          33% {
            transform: translateY(-30px) translateX(20px);
          }
          66% {
            transform: translateY(-15px) translateX(-20px);
          }
        }

        @keyframes wave {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(-20px);
          }
        }
      `}</style>
        </div>
    )
}
