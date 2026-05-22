'use client';

import { useState, useEffect, useRef } from 'react';
import { Sun, Moon, ChevronDown } from 'lucide-react';

const ROLES = { STUDENT: 'student', JM: 'junior_mentor', SM: 'senior_mentor', ADMIN: 'admin' };
const RL = { [ROLES.STUDENT]: 'Student', [ROLES.JM]: 'Junior Mentor', [ROLES.SM]: 'Senior Mentor', [ROLES.ADMIN]: 'Admin' };
const RC = { [ROLES.STUDENT]: '#4F6BF6', [ROLES.JM]: '#7C5CDB', [ROLES.SM]: '#D97706', [ROLES.ADMIN]: '#E04555' };
const TN = ['Alpha','Beta','Gamma','Delta','Epsilon','Zeta','Eta','Theta','Iota','Kappa','Lambda','Mu','Nu','Xi','Omicron','Pi','Rho','Sigma','Tau','Upsilon'];

const THEMES = {
  coolGrey: {
    bgGrad: 'linear-gradient(135deg, #3f4f61 0%, #2d3a4a 100%)',
    card: 'rgba(255,255,255,0.10)',
    cardBorder: 'rgba(255,255,255,0.18)',
    inputBg: 'rgba(255,255,255,0.08)',
    inputBorder: 'rgba(255,255,255,0.20)',
    inputFocus: 'rgba(255,255,255,0.55)',
    label: 'rgba(255,255,255,0.55)',
    labelActive: 'rgba(255,255,255,0.90)',
    text: '#f1f5f9',
    textSub: 'rgba(255,255,255,0.60)',
    particle: [200, 220, 240],
    dotRGB: [220, 235, 250],
    btnBorder: 'rgba(255,255,255,0.25)',
    btnBg: 'rgba(255,255,255,0.10)',
    accent: '#7eb8e8',
    icon: 'rgba(255,255,255,0.75)',
  },
  warmGrey: {
    bgGrad: 'linear-gradient(135deg, #4b4a52 0%, #38373e 100%)',
    card: 'rgba(255,255,255,0.10)',
    cardBorder: 'rgba(255,255,255,0.18)',
    inputBg: 'rgba(255,255,255,0.08)',
    inputBorder: 'rgba(255,255,255,0.20)',
    inputFocus: 'rgba(255,255,255,0.55)',
    label: 'rgba(255,255,255,0.55)',
    labelActive: 'rgba(255,255,255,0.90)',
    text: '#f1f5f9',
    textSub: 'rgba(255,255,255,0.60)',
    particle: [220, 215, 230],
    dotRGB: [235, 230, 245],
    btnBorder: 'rgba(255,255,255,0.25)',
    btnBg: 'rgba(255,255,255,0.10)',
    accent: '#c4b8d8',
    icon: 'rgba(255,255,255,0.75)',
  },
};

export default function AnimatedLogin({ onLogin }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState(null);
  const [team, setTeam] = useState('');
  const [err, setErr] = useState('');
  const [nameFocused, setNameFocused] = useState(false);
  const [teamFocused, setTeamFocused] = useState(false);
  const [themeKey, setThemeKey] = useState('coolGrey');
  const particleCanvasRef = useRef(null);
  const cubeCanvasRef = useRef(null);
  const particleAnimRef = useRef(null);
  const cubeAnimRef = useRef(null);
  const theme = THEMES[themeKey];

  const go = () => {
    if (!name.trim()) return setErr('Please enter your name');
    if (!role) return setErr('Please select your role');
    if ((role === ROLES.STUDENT || role === ROLES.JM) && !team) return setErr('Please select your team');
    onLogin({ name: name.trim(), role, team: team ? parseInt(team) : null });
  };

  // Particle background
  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const [pr, pg, pb] = theme.particle;
    const particles = Array.from({ length: Math.min(90, Math.floor((window.innerWidth * window.innerHeight) / 15000)) }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3.5 + 1.0,
      sx: (Math.random() - 0.5) * 0.4,
      sy: (Math.random() - 0.5) * 0.4,
      op: Math.random() * 0.55 + 0.15,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.sx; p.y += p.sy;
        if (p.x > canvas.width) p.x = 0;
        if (p.x < 0) p.x = canvas.width;
        if (p.y > canvas.height) p.y = 0;
        if (p.y < 0) p.y = canvas.height;
        ctx.fillStyle = `rgba(${pr},${pg},${pb},${p.op})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      particleAnimRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(particleAnimRef.current); };
  }, [themeKey]);

  // 3D rotating dotted cube
  useEffect(() => {
    const canvas = cubeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 360;
    canvas.width = size;
    canvas.height = size;

    let animId;
    let rotX = -0.5;
    let rotY = 0.8;
    const [r, g, b] = theme.dotRGB;

    const project = (x, y, z) => {
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      let ty = y; y = y * cosX - z * sinX; z = ty * sinX + z * cosX;
      let tx = x; x = x * cosY + z * sinY; z = -tx * sinY + z * cosY;
      const p = 400, sc = p / (p + z);
      return { x: size / 2 + x * sc, y: size / 2 + y * sc, z, scale: sc };
    };

    const makeFace = (gen) => {
      const dots = gen().map(d => project(d.x, d.y, d.z));
      return { dots, avgZ: dots.reduce((s, d) => s + d.z, 0) / dots.length };
    };

    const gd = 18, cs = 90;
    const drawCube = () => {
      ctx.clearRect(0, 0, size, size);
      const faces = [
        makeFace(() => { const d=[]; for(let i=0;i<=gd;i++) for(let j=0;j<=gd;j++) d.push({x:-cs+(i/gd)*cs*2,y:-cs+(j/gd)*cs*2,z:-cs}); return d; }),
        makeFace(() => { const d=[]; for(let i=0;i<=gd;i++) for(let j=0;j<=gd;j++) d.push({x:-cs+(i/gd)*cs*2,y:-cs+(j/gd)*cs*2,z:cs}); return d; }),
        makeFace(() => { const d=[]; for(let i=0;i<=gd;i++) for(let j=0;j<=gd;j++) d.push({x:-cs+(i/gd)*cs*2,y:-cs,z:-cs+(j/gd)*cs*2}); return d; }),
        makeFace(() => { const d=[]; for(let i=0;i<=gd;i++) for(let j=0;j<=gd;j++) d.push({x:-cs+(i/gd)*cs*2,y:cs,z:-cs+(j/gd)*cs*2}); return d; }),
        makeFace(() => { const d=[]; for(let i=0;i<=gd;i++) for(let j=0;j<=gd;j++) d.push({x:-cs,y:-cs+(i/gd)*cs*2,z:-cs+(j/gd)*cs*2}); return d; }),
        makeFace(() => { const d=[]; for(let i=0;i<=gd;i++) for(let j=0;j<=gd;j++) d.push({x:cs,y:-cs+(i/gd)*cs*2,z:-cs+(j/gd)*cs*2}); return d; }),
      ];
      faces.sort((a, b) => a.avgZ - b.avgZ);
      faces.forEach(face => face.dots.forEach(dot => {
        const op = Math.max(0.2, Math.min(1, (dot.z + 200) / 300));
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 2.0 * dot.scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${op})`;
        ctx.fill();
      }));
      rotX += 0.003; rotY += 0.005;
      animId = requestAnimationFrame(drawCube);
    };
    drawCube();
    return () => cancelAnimationFrame(animId);
  }, [themeKey]);

  const inputStyle = (focused, hasVal) => ({
    width: '100%',
    padding: '22px 16px 8px',
    background: theme.inputBg,
    border: `1px solid ${focused ? theme.inputFocus : theme.inputBorder}`,
    borderRadius: 12,
    color: theme.text,
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s',
    backdropFilter: 'blur(4px)',
    WebkitAppearance: 'none',
    appearance: 'none',
  });

  const labelStyle = (focused, hasVal) => ({
    position: 'absolute',
    left: 16,
    top: focused || hasVal ? 7 : '50%',
    transform: focused || hasVal ? 'translateY(0)' : 'translateY(-50%)',
    fontSize: focused || hasVal ? 10 : 14,
    fontWeight: focused || hasVal ? 700 : 400,
    color: focused || hasVal ? theme.labelActive : theme.label,
    letterSpacing: focused || hasVal ? '0.07em' : '0',
    textTransform: focused || hasVal ? 'uppercase' : 'none',
    transition: 'all 0.2s ease',
    pointerEvents: 'none',
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.bgGrad,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "Arial,sans-serif",
      position: 'relative',
      overflow: 'hidden',
      transition: 'background 0.5s ease',
      padding: '20px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus, select:focus { outline: none; }
        ::placeholder { color: transparent; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
        select option { background: #3f4f61; color: #f1f5f9; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes teamSlide { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .al-wrap { animation: fadeUp 0.6s ease; }
        .al-team { animation: teamSlide 0.2s ease; }
        .al-role:hover { background: rgba(255,255,255,0.20) !important; transform: translateY(-1px); }
        .al-submit:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.30) !important; }
        .al-submit:active { transform: translateY(0); }
        .al-toggle:hover { background: rgba(255,255,255,0.22) !important; }
        @media (max-width: 700px) { .al-left { display: none !important; } .al-wrap { max-width: 420px !important; } }
      `}</style>

      {/* Particle canvas */}
      <canvas ref={particleCanvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }} />

      {/* Logo top-left */}
      <div style={{ position: 'absolute', top: 18, left: 20, zIndex: 10 }}>
        <img src="/bbb-logo.png" alt="BIZ BLKBOX" style={{ width: 90, height: 90, objectFit: 'contain', filter: 'invert(1)', opacity: 0.85 }} />
      </div>

      {/* Theme toggle */}
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
        <button
          className="al-toggle"
          onClick={() => setThemeKey(themeKey === 'coolGrey' ? 'warmGrey' : 'coolGrey')}
          style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.25)',
            color: theme.icon, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s', backdropFilter: 'blur(8px)',
          }}
          title={themeKey === 'coolGrey' ? 'Switch to Warm Grey' : 'Switch to Cool Grey'}
        >
          {themeKey === 'coolGrey' ? <Moon size={17} /> : <Sun size={17} />}
        </button>
      </div>

      {/* Main layout */}
      <div className="al-wrap" style={{ width: '100%', maxWidth: 900, display: 'flex', alignItems: 'center', gap: 56, position: 'relative', zIndex: 1 }}>

        {/* Left — 3D cube */}
        <div className="al-left" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <canvas ref={cubeCanvasRef} style={{ width: 360, height: 360 }} />
          <div style={{ textAlign: 'center', marginTop: 18 }}>
            <h1 style={{ fontSize: 42, fontWeight: 700, color: theme.text, letterSpacing: '-0.02em', fontFamily: 'Arial, sans-serif' }}>
              BBB 2026
            </h1>
            <p style={{ color: theme.textSub, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500, marginTop: 6 }}>
              Business Case Competition
            </p>
            <p style={{ color: theme.textSub, fontSize: 11, marginTop: 4, opacity: 0.7 }}>
              Wharton Korean Undergraduate Business Society
            </p>
          </div>
        </div>

        {/* Right — Login form */}
        <div style={{ flex: 1 }}>
          <div style={{
            background: theme.card,
            border: `1px solid ${theme.cardBorder}`,
            borderRadius: 24,
            padding: '36px 32px',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          }}>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: theme.text, marginBottom: 6, letterSpacing: '-0.01em' }}>
              Portal Access
            </h2>
            <p style={{ fontSize: 12, color: theme.textSub, marginBottom: 28 }}>
              Sign in to continue to BBB 2026
            </p>

            {/* Name */}
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <input
                value={name}
                onChange={e => { setName(e.target.value); setErr(''); }}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
                onKeyDown={e => e.key === 'Enter' && go()}
                style={inputStyle(nameFocused, name)}
              />
              <label style={labelStyle(nameFocused, name)}>Your Name</label>
            </div>

            {/* Role */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: theme.labelActive, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>
                Your Role
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {Object.entries(ROLES).map(([k, v]) => (
                  <button
                    key={k}
                    className="al-role"
                    onClick={() => { setRole(v); setTeam(''); setErr(''); }}
                    style={{
                      padding: '10px 8px', borderRadius: 10,
                      border: `1px solid ${role === v ? RC[v] : theme.btnBorder}`,
                      background: role === v ? `${RC[v]}22` : theme.btnBg,
                      color: role === v ? RC[v] : theme.textSub,
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      fontFamily: 'inherit', transition: 'all 0.15s',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    {RL[v]}
                  </button>
                ))}
              </div>
            </div>

            {/* Team */}
            {(role === ROLES.STUDENT || role === ROLES.JM) && (
              <div className="al-team" style={{ position: 'relative', marginBottom: 16 }}>
                <select
                  value={team}
                  onChange={e => { setTeam(e.target.value); setErr(''); }}
                  onFocus={() => setTeamFocused(true)}
                  onBlur={() => setTeamFocused(false)}
                  style={{ ...inputStyle(teamFocused, team), padding: '22px 36px 8px 16px', cursor: 'pointer' }}
                >
                  <option value=""></option>
                  {TN.map((n, i) => <option key={i} value={i + 1}>Team {n}</option>)}
                </select>
                <label style={labelStyle(true, true)}>Your Team</label>
                <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: theme.label, pointerEvents: 'none' }}>
                  <ChevronDown size={15} />
                </div>
              </div>
            )}

            {/* Error */}
            {err && (
              <div style={{
                padding: '9px 14px', borderRadius: 9, marginBottom: 14,
                background: 'rgba(224,69,85,0.15)',
                border: '1px solid rgba(224,69,85,0.3)',
                color: '#fca5a5', fontSize: 12, fontWeight: 500,
              }}>
                {err}
              </div>
            )}

            {/* Submit */}
            <button
              className="al-submit"
              onClick={go}
              style={{
                width: '100%', padding: '14px 20px',
                borderRadius: 12, border: '1px solid rgba(255,255,255,0.30)',
                background: 'rgba(255,255,255,0.16)',
                color: theme.text, fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                letterSpacing: '0.02em',
              }}
            >
              Enter Portal
            </button>

            <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: theme.textSub }}>
              Need help?{' '}
              <a href="mailto:support@bizblackbox.com" style={{ color: theme.accent, textDecoration: 'none', fontWeight: 500 }}>
                Contact support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
