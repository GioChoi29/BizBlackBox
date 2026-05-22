'use client';

import { useState, useEffect, useRef } from 'react';

const CUBE_COLOR = '#475569';

const BG_THEMES = [
  { label: 'Cool Grey', bg: '#3f4f61', card: '#4a5f74', input: '#5a6d80', text: '#f1f5f9', sub: '#cbd5e1', dotRGB: [220, 230, 242], dotSize: 2.2 },
  { label: 'Warm Grey', bg: '#4b4a52', card: '#5c5b65', input: '#6e6d78', text: '#f1f5f9', sub: '#d1d5db', dotRGB: [230, 228, 235], dotSize: 2.2 },
];

const ROLES = { STUDENT: 'student', JM: 'junior_mentor', SM: 'senior_mentor', ADMIN: 'admin' };
const RL = { [ROLES.STUDENT]: 'Student', [ROLES.JM]: 'Junior Mentor', [ROLES.SM]: 'Senior Mentor', [ROLES.ADMIN]: 'Admin' };
const RC = { [ROLES.STUDENT]: '#4F6BF6', [ROLES.JM]: '#7C5CDB', [ROLES.SM]: '#D97706', [ROLES.ADMIN]: '#E04555' };
const TN = ['Alpha','Beta','Gamma','Delta','Epsilon','Zeta','Eta','Theta','Iota','Kappa','Lambda','Mu','Nu','Xi','Omicron','Pi','Rho','Sigma','Tau','Upsilon'];

export default function LoginCube({ onLogin }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState(null);
  const [team, setTeam] = useState('');
  const [err, setErr] = useState('');
  const [themeIdx, setThemeIdx] = useState(0);
  const canvasRef = useRef(null);
  const dotColorRef = useRef(BG_THEMES[0].dotRGB);
  const dotSizeRef = useRef(BG_THEMES[0].dotSize);
  const theme = BG_THEMES[themeIdx];

  useEffect(() => {
    dotColorRef.current = BG_THEMES[themeIdx].dotRGB;
    dotSizeRef.current = BG_THEMES[themeIdx].dotSize;
  }, [themeIdx]);

  const go = () => {
    if (!name.trim()) return setErr('Please enter your name');
    if (!role) return setErr('Please select your role');
    if ((role === ROLES.STUDENT || role === ROLES.JM) && !team) return setErr('Please select your team');
    onLogin({ name: name.trim(), role, team: team ? parseInt(team) : null });
  };

  // 3D Rotating Dotted Cube Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 380;
    canvas.width = size;
    canvas.height = size;

    let animationId;
    let rotX = -0.5;
    let rotY = 0.8;

    const drawCube = () => {
      ctx.clearRect(0, 0, size, size);
      const centerX = size / 2;
      const centerY = size / 2;
      const cubeSize = 95;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      const project = (x, y, z) => {
        let tempY = y;
        y = y * cosX - z * sinX;
        z = tempY * sinX + z * cosX;
        let tempX = x;
        x = x * cosY + z * sinY;
        z = -tempX * sinY + z * cosY;
        const perspective = 400;
        const scale = perspective / (perspective + z);
        return { x: centerX + x * scale, y: centerY + y * scale, z, scale };
      };

      const makeFaceDots = (genFn) => {
        const dots3D = genFn();
        const projected = dots3D.map(d => project(d.x, d.y, d.z));
        return { dots: projected, avgZ: projected.reduce((sum, d) => sum + d.z, 0) / projected.length };
      };

      const gridDensity = 18;
      const faces = [
        makeFaceDots(() => { const d = []; for (let i = 0; i <= gridDensity; i++) for (let j = 0; j <= gridDensity; j++) d.push({ x: -cubeSize + (i / gridDensity) * cubeSize * 2, y: -cubeSize + (j / gridDensity) * cubeSize * 2, z: -cubeSize }); return d; }),
        makeFaceDots(() => { const d = []; for (let i = 0; i <= gridDensity; i++) for (let j = 0; j <= gridDensity; j++) d.push({ x: -cubeSize + (i / gridDensity) * cubeSize * 2, y: -cubeSize + (j / gridDensity) * cubeSize * 2, z: cubeSize }); return d; }),
        makeFaceDots(() => { const d = []; for (let i = 0; i <= gridDensity; i++) for (let j = 0; j <= gridDensity; j++) d.push({ x: -cubeSize + (i / gridDensity) * cubeSize * 2, y: -cubeSize, z: -cubeSize + (j / gridDensity) * cubeSize * 2 }); return d; }),
        makeFaceDots(() => { const d = []; for (let i = 0; i <= gridDensity; i++) for (let j = 0; j <= gridDensity; j++) d.push({ x: -cubeSize + (i / gridDensity) * cubeSize * 2, y: cubeSize, z: -cubeSize + (j / gridDensity) * cubeSize * 2 }); return d; }),
        makeFaceDots(() => { const d = []; for (let i = 0; i <= gridDensity; i++) for (let j = 0; j <= gridDensity; j++) d.push({ x: -cubeSize, y: -cubeSize + (i / gridDensity) * cubeSize * 2, z: -cubeSize + (j / gridDensity) * cubeSize * 2 }); return d; }),
        makeFaceDots(() => { const d = []; for (let i = 0; i <= gridDensity; i++) for (let j = 0; j <= gridDensity; j++) d.push({ x: cubeSize, y: -cubeSize + (i / gridDensity) * cubeSize * 2, z: -cubeSize + (j / gridDensity) * cubeSize * 2 }); return d; }),
      ];

      faces.sort((a, b) => a.avgZ - b.avgZ);

      const [r, g, b] = dotColorRef.current;
      const baseDotSize = dotSizeRef.current;
      faces.forEach(face => {
        face.dots.forEach(dot => {
          const opacity = Math.max(0.25, Math.min(1, (dot.z + 200) / 300));
          const dotSize = baseDotSize * dot.scale;
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, dotSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
          ctx.fill();
        });
      });

      rotX += 0.003;
      rotY += 0.005;
      animationId = requestAnimationFrame(drawCube);
    };

    drawCube();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'DM Sans','Pretendard',-apple-system,sans-serif",
      position: 'relative',
      overflow: 'hidden',
      transition: 'background 0.4s ease',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus, select:focus { outline: none; }
        ::placeholder { color: #4a5568; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2d3748; border-radius: 3px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes cubeTeamFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .cube-login-card { animation: fadeUp 0.5s ease; }
        .cube-team-row { animation: cubeTeamFade 0.25s ease; }
      `}</style>

      {/* Subtle grid background */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
      }} />

      {/* Corner accents */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 80, height: 80, borderTop: `3px solid ${CUBE_COLOR}60`, borderLeft: `3px solid ${CUBE_COLOR}60`, borderTopLeftRadius: 20, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 80, height: 80, borderBottom: `3px solid ${CUBE_COLOR}60`, borderRight: `3px solid ${CUBE_COLOR}60`, borderBottomRightRadius: 20, pointerEvents: 'none' }} />

      {/* Theme toggle button */}
      <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
        {BG_THEMES.map((t, i) => (
          <button key={i} onClick={() => setThemeIdx(i)} title={t.label} style={{
            width: 20, height: 20, borderRadius: '50%',
            background: t.bg,
            border: i === themeIdx ? '2px solid #f1f5f9' : '2px solid transparent',
            cursor: 'pointer', padding: 0, transition: 'border 0.2s',
            boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
          }} />
        ))}
      </div>

      <div className="cube-login-card" style={{ width: '100%', maxWidth: 900, display: 'flex', alignItems: 'center', gap: 60 }}>

        {/* Left: 3D Cube */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <canvas ref={canvasRef} style={{ width: 380, height: 380 }} />
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <h1 style={{ fontSize: 44, fontWeight: 700, color: theme.text, letterSpacing: '-0.02em', fontFamily: "'Space Mono',monospace" }}>
              BBB 2026
            </h1>
            <p style={{ color: theme.sub, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500, marginTop: 6 }}>
              Business Case Competition
            </p>
            <p style={{ color: theme.sub, fontSize: 11, marginTop: 4, letterSpacing: '0.04em', opacity: 0.7 }}>
              Wharton Korean Undergraduate Business Society
            </p>
          </div>
        </div>

        {/* Right: Login Form */}
        <div style={{ flex: 1 }}>
          <div style={{
            background: theme.card,
            border: `1.5px solid ${CUBE_COLOR}40`,
            borderRadius: 20,
            padding: '32px 28px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
            transition: 'background 0.4s ease',
          }}>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: theme.text, marginBottom: 24, letterSpacing: '-0.01em' }}>
              Portal Access
            </h2>

            {/* Name */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: theme.sub, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Your Name
              </label>
              <input
                value={name}
                onChange={e => { setName(e.target.value); setErr(''); }}
                onKeyDown={e => e.key === 'Enter' && go()}
                placeholder="Enter your full name"
                style={{
                  width: '100%', padding: '12px 14px',
                  background: theme.input, border: `1.5px solid ${name ? CUBE_COLOR : CUBE_COLOR + '40'}`,
                  borderRadius: 10, color: theme.text, fontSize: 14, fontFamily: 'inherit',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = CUBE_COLOR}
                onBlur={e => e.target.style.borderColor = name ? CUBE_COLOR : CUBE_COLOR + '40'}
              />
            </div>

            {/* Role */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: theme.sub, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Your Role
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {Object.entries(ROLES).map(([k, v]) => (
                  <button key={k} onClick={() => { setRole(v); setTeam(''); setErr(''); }} style={{
                    padding: '10px 8px', borderRadius: 10,
                    border: `1.5px solid ${role === v ? RC[v] : CUBE_COLOR + '40'}`,
                    background: role === v ? `${RC[v]}18` : theme.input,
                    color: role === v ? RC[v] : theme.sub,
                    fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all 0.15s',
                  }}>
                    {RL[v]}
                  </button>
                ))}
              </div>
            </div>

            {/* Team (conditional) */}
            {(role === ROLES.STUDENT || role === ROLES.JM) && (
              <div className="cube-team-row" style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: theme.sub, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Your Team
                </label>
                <select
                  value={team}
                  onChange={e => { setTeam(e.target.value); setErr(''); }}
                  style={{
                    width: '100%', padding: '12px 14px',
                    background: theme.input, border: `1.5px solid ${team ? CUBE_COLOR : CUBE_COLOR + '40'}`,
                    borderRadius: 10, color: team ? theme.text : theme.sub, fontSize: 14,
                    fontFamily: 'inherit', cursor: 'pointer', appearance: 'none',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => e.target.style.borderColor = CUBE_COLOR}
                  onBlur={e => e.target.style.borderColor = team ? CUBE_COLOR : CUBE_COLOR + '40'}
                >
                  <option value="">Select your team…</option>
                  {TN.map((n, i) => <option key={i} value={i + 1}>Team {n}</option>)}
                </select>
              </div>
            )}

            {/* Error */}
            {err && (
              <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(224,69,85,0.1)', color: '#E04555', fontSize: 12, marginBottom: 14, fontWeight: 500 }}>
                {err}
              </div>
            )}

            {/* Submit */}
            <button onClick={go} style={{
              width: '100%', padding: '13px 20px', borderRadius: 10,
              border: `1.5px solid ${CUBE_COLOR}`,
              background: CUBE_COLOR, color: '#f1f5f9',
              fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s', letterSpacing: '0.02em',
            }}
              onMouseEnter={e => { e.target.style.background = '#5a6d80'; e.target.style.transform = 'scale(1.015)'; }}
              onMouseLeave={e => { e.target.style.background = CUBE_COLOR; e.target.style.transform = 'scale(1)'; }}
            >
              Enter Portal
            </button>

            <div style={{ textAlign: 'center', marginTop: 18, fontSize: 11, color: '#374151' }}>
              Need help? Contact{' '}
              <a href="mailto:support@bizblackbox.com" style={{ color: CUBE_COLOR, textDecoration: 'none' }}
                onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                onMouseLeave={e => e.target.style.textDecoration = 'none'}
              >
                support@bizblackbox.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
