"use client";

import Link from "next/link";
import { useEffect, useRef, useState, CSSProperties } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Stats {
  totalPerson:   number;
  totalMarriage: number;
  totalAnak:     number;
  lakiLaki:      number;
  perempuan:     number;
}

interface Person {
  id:           number;
  nama:         string;
  jenisKelamin: "LAKI_LAKI" | "PEREMPUAN";
  foto:         string | null;
  tempatLahir:  string | null;
}

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  merah:       "#8B1A1A",
  merahTua:    "#5C0E0E",
  merahTerang: "#C0392B",
  emas:        "#C9A84C",
  emasM:       "#E8CC7A",
  emasT:       "#8B6914",
  hitam:       "#0D0B08",
  hitamL:      "#1A1612",
  krem:        "#F5EDD8",
  kremT:       "#E8D9B8",
  putih:       "#FDF8EE",
};

// ─── Nav links & footer ───────────────────────────────────────────────────────
const navLinks  = [["#tarombo","Tarombo"],["#fitur","Fitur"],["#anggota","Anggota"],["/cari","Cari"],["#donasi","Donasi"]];
const footerCols = [
  { title:"Navigasi", links:[["/tarombo","Pohon Silsilah"],["/person","Daftar Anggota"],["/cari","Pencarian"]] },
  { title:"Lainnya",  links:[["/tentang","Tentang Kami"],["/kontak","Kontak"],["/login","Masuk Admin"]] },
];

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const TreeIcon = () => (
  <svg viewBox="0 0 48 48" style={{width:"100%",height:"100%"}} fill="none" stroke={C.emas} strokeWidth="1.2">
    <circle cx="24" cy="10" r="5"/><circle cx="10" cy="32" r="5"/><circle cx="38" cy="32" r="5"/>
    <line x1="24" y1="15" x2="14" y2="27"/><line x1="24" y1="15" x2="34" y2="27"/>
    <circle cx="4"  cy="44" r="3"/><circle cx="16" cy="44" r="3"/>
    <circle cx="32" cy="44" r="3"/><circle cx="44" cy="44" r="3"/>
    <line x1="10" y1="37" x2="6"  y2="41"/><line x1="10" y1="37" x2="14" y2="41"/>
    <line x1="38" y1="37" x2="34" y2="41"/><line x1="38" y1="37" x2="42" y2="41"/>
  </svg>
);
const PersonIcon = () => (
  <svg viewBox="0 0 48 48" style={{width:"100%",height:"100%"}} fill="none" stroke={C.emas} strokeWidth="1.2">
    <circle cx="24" cy="18" r="8"/>
    <path d="M8 40 C8 30 16 24 24 24 C32 24 40 30 40 40"/>
    <line x1="36" y1="12" x2="44" y2="4"/><circle cx="44" cy="4" r="3"/>
    <line x1="38" y1="20" x2="46" y2="20"/><circle cx="46" cy="20" r="3"/>
  </svg>
);
const SearchSVG = () => (
  <svg viewBox="0 0 48 48" style={{width:"100%",height:"100%"}} fill="none" stroke={C.emas} strokeWidth="1.2">
    <circle cx="20" cy="20" r="12"/>
    <line x1="29" y1="29" x2="44" y2="44"/>
    <line x1="14" y1="20" x2="26" y2="20"/>
    <line x1="20" y1="14" x2="20" y2="26"/>
  </svg>
);

const features = [
  { number:"01", title:"Visualisasi Pohon",  icon:<TreeIcon/>,   desc:"Lihat hubungan kekerabatan dalam pohon silsilah interaktif yang menampilkan seluruh garis keturunan Simangunsong secara visual." },
  { number:"02", title:"Kelola Data",        icon:<PersonIcon/>, desc:"Administrator dapat mengelola data anggota keluarga lengkap dengan foto, tanggal lahir, dan riwayat hidup untuk memperkaya arsip silsilah." },
  { number:"03", title:"Pencarian Cerdas",   icon:<SearchSVG/>,  desc:"Temukan saudara marga dengan cepat melalui fitur pencarian berdasarkan nama, generasi, daerah asal, maupun garis keturunan." },
];



// ─── Hooks ────────────────────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, vis };
}

// ─── Counter animation ────────────────────────────────────────────────────────
function useCounter(target: number, duration = 1800, active = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active || target === 0) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [active, target, duration]);
  return count;
}

// ─── UI Pieces ────────────────────────────────────────────────────────────────
const UlosStripe = () => (
  <div style={{height:6,width:260,margin:"0 auto",
    background:`repeating-linear-gradient(90deg,${C.merah} 0px,${C.merah} 14px,${C.emas} 14px,${C.emas} 20px,${C.hitam} 20px,${C.hitam} 26px,${C.emas} 26px,${C.emas} 32px,${C.merah} 32px,${C.merah} 46px,${C.hitam} 46px,${C.hitam} 50px)`
  }}/>
);

const HeroDivider = () => (
  <div style={{display:"flex",alignItems:"center",gap:14,margin:"0 auto 28px",width:"fit-content"}}>
    <div style={{width:80,height:1,background:`linear-gradient(90deg,transparent,${C.emas})`}}/>
    <div style={{width:8,height:8,background:C.emas,transform:"rotate(45deg)"}}/>
    <div style={{width:5,height:5,background:C.emas,transform:"rotate(45deg)",opacity:.5}}/>
    <div style={{width:8,height:8,background:C.emas,transform:"rotate(45deg)"}}/>
    <div style={{width:80,height:1,background:`linear-gradient(90deg,${C.emas},transparent)`}}/>
  </div>
);

const GorgaDivider = () => (
  <div style={{width:"100%",height:60,background:C.merahTua,overflow:"hidden",position:"relative",zIndex:10}}>
    <svg viewBox="0 0 800 60" width="100%" height="60" preserveAspectRatio="xMidYMid meet" style={{opacity:.85}}>
      <defs>
        <pattern id="gorga" x="0" y="0" width="40" height="60" patternUnits="userSpaceOnUse">
          <polygon points="20,4 36,18 20,32 4,18" fill="none" stroke={C.emas} strokeWidth="1.2"/>
          <line x1="20" y1="4" x2="20" y2="56" stroke={C.merah} strokeWidth=".8" opacity=".6"/>
          <line x1="4"  y1="30" x2="36" y2="30" stroke={C.merah} strokeWidth=".8" opacity=".6"/>
          <circle cx="2"  cy="30" r="2" fill={C.emas} opacity=".7"/>
          <circle cx="38" cy="30" r="2" fill={C.emas} opacity=".7"/>
          <polyline points="8,38 20,52 32,38" fill="none" stroke={C.emas} strokeWidth="1" opacity=".8"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#gorga)"/>
    </svg>
  </div>
);

const UlosBorder = () => (
  <div style={{height:8,width:"100%",
    background:`repeating-linear-gradient(90deg,${C.merahTua} 0px,${C.merahTua} 20px,${C.emasT} 20px,${C.emasT} 28px,${C.hitam} 28px,${C.hitam} 36px,${C.emasT} 36px,${C.emasT} 44px,${C.merahTua} 44px,${C.merahTua} 64px,${C.hitam} 64px,${C.hitam} 68px)`
  }}/>
);

const btnPrimary: CSSProperties = {
  fontFamily:"'Cinzel',serif",fontSize:"0.72rem",letterSpacing:"0.2em",
  textTransform:"uppercase",color:C.hitam,fontWeight:600,
  background:`linear-gradient(135deg,${C.emas} 0%,${C.emasM} 50%,${C.emas} 100%)`,
  padding:"14px 36px",textDecoration:"none",display:"inline-block",
  clipPath:"polygon(12px 0%,100% 0%,calc(100% - 12px) 100%,0% 100%)",
  transition:"all .3s",cursor:"pointer",border:"none",
};
const btnSecondary: CSSProperties = {
  fontFamily:"'Cinzel',serif",fontSize:"0.72rem",letterSpacing:"0.2em",
  textTransform:"uppercase",color:C.emas,background:"transparent",
  border:`1px solid rgba(201,168,76,.5)`,padding:"14px 36px",textDecoration:"none",
  display:"inline-block",clipPath:"polygon(12px 0%,100% 0%,calc(100% - 12px) 100%,0% 100%)",
  transition:"all .3s",
};

const SectionHeader = ({tag,title,gold,sub,light=false}:{tag:string;title:string;gold:string;sub:string;light?:boolean}) => (
  <div style={{textAlign:"center",marginBottom:64}}>
    <span style={{fontFamily:"'Cinzel',serif",fontSize:"0.63rem",letterSpacing:"0.4em",textTransform:"uppercase",color:light?C.emasM:C.merahTerang,display:"block",marginBottom:14}}>{tag}</span>
    <h2 style={{fontFamily:"'Cinzel Decorative',cursive",fontSize:"clamp(1.8rem,3.5vw,3rem)",fontWeight:700,color:C.putih,marginBottom:12}}>
      {title} <span style={{color:C.emas}}>{gold}</span>
    </h2>
    <p style={{fontFamily:"'IM Fell English',serif",fontStyle:"italic",fontSize:"1.1rem",color:C.kremT,opacity:.8}}>{sub}</p>
  </div>
);

const RevealDiv = ({children,style}:{children:React.ReactNode;style?:CSSProperties}) => {
  const {ref,vis} = useReveal();
  return (
    <div ref={ref} style={{opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(28px)",transition:"opacity .8s ease,transform .8s ease",...style}}>
      {children}
    </div>
  );
};

// ─── Stat Card dengan counter animasi ────────────────────────────────────────
const StatCard = ({value,label,desc,index,active}:{value:number;label:string;desc:string;index:number;active:boolean}) => {
  const count = useCounter(value, 1600, active);
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",padding:"16px 32px",position:"relative"}}>
      {index > 0 && (
        <div className="stat-sep" style={{position:"absolute",left:0,top:"20%",height:"60%",width:1,background:`linear-gradient(to bottom,transparent,${C.emasT},transparent)`}}/>
      )}
      <div style={{fontFamily:"'Cinzel Decorative',cursive",fontSize:"3rem",fontWeight:700,color:C.emas,lineHeight:1,marginBottom:8,textShadow:`0 0 30px rgba(201,168,76,.4)`}}>
        {count.toLocaleString("id-ID")}
      </div>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.6rem",letterSpacing:"0.25em",textTransform:"uppercase",color:C.kremT,opacity:.7,marginBottom:4}}>{label}</div>
      <div style={{fontFamily:"'IM Fell English',serif",fontStyle:"italic",fontSize:"0.88rem",color:C.emasT}}>{desc}</div>
    </div>
  );
};

// ─── Person Card ──────────────────────────────────────────────────────────────
const PersonCard = ({person}:{person:Person}) => (
  <Link href={`/profil/${person.id}`} style={{textDecoration:"none"}} className="person-card">
    <div style={{
      background:C.hitamL,border:`1px solid rgba(201,168,76,.12)`,
      padding:"20px",textAlign:"center",transition:"all .3s",cursor:"pointer",
    }}>
      {/* Avatar */}
      <div style={{
        width:64,height:64,borderRadius:"50%",margin:"0 auto 12px",
        background:`linear-gradient(135deg,${C.merahTua},${C.hitam})`,
        border:`2px solid rgba(201,168,76,.3)`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",
      }}>
        {person.foto
          ? <img src={person.foto} alt={person.nama} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          : <span style={{fontFamily:"'Cinzel Decorative',cursive",fontSize:"1.4rem",color:C.emas}}>
              {person.nama.charAt(0)}
            </span>
        }
      </div>
      <p style={{fontFamily:"'Cinzel',serif",fontSize:"0.75rem",color:C.kremT,lineHeight:1.4,letterSpacing:"0.03em",marginBottom:6}}>{person.nama}</p>
      <span style={{
        fontFamily:"'Cinzel',serif",fontSize:"0.55rem",letterSpacing:"0.15em",textTransform:"uppercase",
        color: person.jenisKelamin === "LAKI_LAKI" ? "#7EB8D4" : "#D4A0B5",
        border:`1px solid ${person.jenisKelamin === "LAKI_LAKI" ? "rgba(126,184,212,.3)" : "rgba(212,160,181,.3)"}`,
        padding:"2px 8px",
      }}>
        {person.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"}
      </span>
      {person.tempatLahir && (
        <p style={{fontFamily:"'IM Fell English',serif",fontStyle:"italic",fontSize:"0.75rem",color:C.emasT,marginTop:6}}>
          {person.tempatLahir}
        </p>
      )}
    </div>
  </Link>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [scrolled,   setScrolled]   = useState(false);
  const [stats,      setStats]      = useState<Stats | null>(null);
  const [persons,    setPersons]    = useState<Person[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingPersons, setLoadingPersons] = useState(true);
  const [statsActive, setStatsActive] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  // Scroll listener untuk navbar
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Fetch stats dari API
  useEffect(() => {
    fetch("/api/stats")
      .then(r => r.json())
      .then(res => { if (res.success) setStats(res.data); })
      .catch(console.error)
      .finally(() => setLoadingStats(false));
  }, []);

  // Fetch recent persons dari API
  useEffect(() => {
    fetch("/api/person?limit=4&sort=recent")
      .then(r => r.json())
      .then(res => { if (res.success) setPersons(res.data); })
      .catch(console.error)
      .finally(() => setLoadingPersons(false));
  }, []);

  // IntersectionObserver untuk stats counter
  useEffect(() => {
    const el = statsRef.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setStatsActive(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const statsData = stats
    ? [
        { value: stats.totalPerson,   label: "Anggota Tercatat",  desc: "Dalam database silsilah" },
        { value: stats.totalMarriage, label: "Pernikahan",         desc: "Tercatat dalam tarombo"  },
        { value: stats.totalAnak,     label: "Relasi Anak",        desc: "Hubungan orang tua-anak" },
      ]
    : [
        { value: 0, label: "Anggota Tercatat",  desc: "Memuat data..." },
        { value: 0, label: "Pernikahan",         desc: "Memuat data..." },
        { value: 0, label: "Relasi Anak",        desc: "Memuat data..." },
      ];

  return (
    <div style={{minHeight:"100vh",backgroundColor:C.hitam,color:C.krem,fontFamily:"'Cormorant Garamond',serif",overflowX:"hidden",position:"relative"}}>

      {/* ── Google Fonts + Global CSS ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;600;700&family=IM+Fell+English:ital@0;1&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background-color: ${C.hitam}; }

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(22px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes scrollPulse {
          0%,100% { opacity:.3; } 50% { opacity:1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .fu   { opacity:0; animation:fadeUp 1s ease forwards; }
        .d3   { animation-delay:.3s;  } .d5  { animation-delay:.5s;  }
        .d7   { animation-delay:.7s;  } .d9  { animation-delay:.9s;  }
        .d11  { animation-delay:1.1s; } .d13 { animation-delay:1.3s; }
        .d15  { animation-delay:1.5s; } .d21 { animation-delay:2.1s; }

        .btn-p:hover  { transform:translateY(-2px); box-shadow:0 8px 28px rgba(201,168,76,.4); }
        .btn-s:hover  { border-color:${C.emas}!important; background:rgba(201,168,76,.08)!important; transform:translateY(-2px); }
        .nav-a:hover  { color:${C.emas}!important; }
        .feat-card:hover { border-color:rgba(201,168,76,.3)!important; transform:translateY(-4px); }
        .feat-card:hover .feat-line { opacity:1!important; }
        .person-card > div:hover { border-color:rgba(201,168,76,.35)!important; transform:translateY(-3px); }
        .donate-card:hover { transform:translateY(-4px) !important; }
        @media (max-width:768px) { .donate-grid { grid-template-columns:1fr!important; } }
        .footer-a:hover  { opacity:1!important; color:${C.emas}!important; }

        @media (max-width:768px) {
          /* Nav */
          .nav-ul, .side-line { display:none!important; }
          nav { padding:12px 18px!important; }
          nav a[href="/"] { font-size:0.78rem!important; }

          /* Hero */
          .hero-section { padding:88px 20px 72px!important; min-height:auto!important; }
          .hero-two-col { flex-direction:column!important; gap:28px!important; align-items:center!important; text-align:center!important; }
          .hero-photo-wrap { flex-shrink:0!important; }
          .hero-photo-img { width:clamp(120px,38vw,160px)!important; }
          .hero-text { min-width:unset!important; text-align:center!important; }
          .hero-h1 { font-size:clamp(1.6rem,8vw,2.8rem)!important; margin-bottom:8px!important; }
          .hero-subtitle { font-size:0.85rem!important; margin-bottom:14px!important; }
          .hero-desc { font-size:0.95rem!important; margin-bottom:10px!important; }
          .hero-quote { font-size:0.72rem!important; margin-bottom:24px!important; }
          .hero-btns { justify-content:center!important; gap:10px!important; }
          .hero-btns a { font-size:0.6rem!important; padding:11px 20px!important; }

          /* Sections padding */
          section, footer { padding-left:18px!important; padding-right:18px!important; }
          section { padding-top:60px!important; padding-bottom:60px!important; }

          /* Stats */
          .stats-grid { grid-template-columns:1fr!important; gap:0!important; }
          .stat-sep { display:none!important; }
          .stats-section { padding:32px 18px!important; }

          /* Features */
          .feat-grid { grid-template-columns:1fr!important; }

          /* Persons grid */
          .persons-grid { grid-template-columns:repeat(2,1fr)!important; gap:8px!important; }

          /* Section headers */
          .section-tag { font-size:0.52rem!important; }
          .section-title { font-size:1.5rem!important; }
          .section-sub { font-size:0.88rem!important; }

          /* Tarombo section */
          .tarombo-stats { flex-direction:column!important; gap:12px!important; }
          .tarombo-stats > div { padding:14px 20px!important; }

          /* Donasi */
          .donasi-bank-row { flex-direction:column!important; gap:10px!important; }
          .donasi-bank-row > div[style*="width:1"] { display:none!important; }
          .donasi-konfirmasi { flex-direction:column!important; align-items:flex-start!important; gap:14px!important; }
          .donasi-norek { font-size:1rem!important; letter-spacing:0.06em!important; }

          /* CTA */
          .cta-btns { justify-content:center!important; }

          /* Footer */
          .footer-grid { grid-template-columns:1fr!important; gap:28px!important; }

          /* Donate grid */
          .donate-grid { grid-template-columns:1fr!important; }
        }

        @media (max-width:400px) {
          .hero-h1 { font-size:1.5rem!important; }
          .persons-grid { grid-template-columns:1fr!important; }
          nav a[href="/"] { font-size:0.68rem!important; }
        }
      `}</style>

      {/* Gorga bg */}
      <div style={{position:"fixed",inset:0,zIndex:0,opacity:.04,pointerEvents:"none",
        backgroundImage:`repeating-linear-gradient(45deg,${C.emas} 0,${C.emas} 1px,transparent 0,transparent 50%),repeating-linear-gradient(-45deg,${C.emas} 0,${C.emas} 1px,transparent 0,transparent 50%)`,
        backgroundSize:"28px 28px"}}/>

      {/* ── Navbar ── */}
      <nav style={{
        position:"fixed",top:0,width:"100%",zIndex:50,
        padding:"18px 56px",display:"flex",justifyContent:"space-between",alignItems:"center",
        background: scrolled ? `rgba(13,11,8,.97)` : `linear-gradient(to bottom,rgba(13,11,8,.95),transparent)`,
        borderBottom: scrolled ? `1px solid rgba(201,168,76,.15)` : "none",
        transition:"all .4s",
      }}>
        <Link href="/" style={{fontFamily:"'Cinzel Decorative',cursive",fontSize:"1rem",color:C.emas,textDecoration:"none"}}>
          Silsilah <span style={{color:C.merahTerang}}>Simangunsong</span>
        </Link>
        <ul className="nav-ul" style={{display:"flex",gap:36,listStyle:"none",margin:0,padding:0}}>
          {navLinks.map(([href,label]) => (
            <li key={href}>
              {href.startsWith("/")
                ? <Link href={href} className="nav-a" style={{fontFamily:"'Cinzel',serif",fontSize:"0.66rem",letterSpacing:"0.2em",textTransform:"uppercase",color:C.kremT,textDecoration:"none",transition:"color .3s"}}>{label}</Link>
                : <a   href={href} className="nav-a" style={{fontFamily:"'Cinzel',serif",fontSize:"0.66rem",letterSpacing:"0.2em",textTransform:"uppercase",color:C.kremT,textDecoration:"none",transition:"color .3s"}}>{label}</a>
              }
            </li>
          ))}
        </ul>
        <Link href="/login" className="btn-p" style={{...btnPrimary,fontSize:"0.65rem",padding:"9px 22px",clipPath:"polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)"}}>
          Masuk
        </Link>
      </nav>

      {/* ── Hero ── */}
      <section className="hero-section" style={{position:"relative",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"120px 72px 100px",zIndex:2,overflow:"hidden"}}>
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:800,height:800,pointerEvents:"none",background:"radial-gradient(ellipse at center,rgba(139,26,26,.15) 0%,rgba(201,168,76,.04) 50%,transparent 72%)"}}/>
        <div className="side-line" style={{position:"absolute",left:56,top:0,width:2,height:"100%",opacity:.5,background:`linear-gradient(to bottom,transparent,${C.merah} 30%,${C.merah} 70%,transparent)`}}/>
        <div className="side-line" style={{position:"absolute",right:56,top:0,width:2,height:"100%",opacity:.5,background:`linear-gradient(to bottom,transparent,${C.merah} 30%,${C.merah} 70%,transparent)`}}/>

        {/* Two-column layout */}
        <div className="hero-two-col" style={{display:"flex",alignItems:"center",gap:"clamp(40px,6vw,96px)",maxWidth:1100,width:"100%",flexWrap:"wrap",justifyContent:"center"}}>

          {/* LEFT: Foto */}
          <div className="fu d3" style={{flexShrink:0,position:"relative"}}>
            {/* Corner brackets */}
           
            {/* Ulos stripe top */}
            <div style={{position:"absolute",top:-18,left:0,right:0,height:6,zIndex:1,background:`repeating-linear-gradient(90deg,${C.merahTua} 0,${C.merahTua} 10px,${C.emasT} 10px,${C.emasT} 16px,${C.hitam} 16px,${C.hitam} 22px,${C.emasT} 22px,${C.emasT} 28px,${C.merahTua} 28px,${C.merahTua} 38px)`}}/>
            {/* Ulos stripe bottom */}
            <div style={{position:"absolute",bottom:-18,left:0,right:0,height:6,zIndex:1,background:`repeating-linear-gradient(90deg,${C.merahTua} 0,${C.merahTua} 10px,${C.emasT} 10px,${C.emasT} 16px,${C.hitam} 16px,${C.hitam} 22px,${C.emasT} 22px,${C.emasT} 28px,${C.merahTua} 28px,${C.merahTua} 38px)`}}/>
            {/* Photo */}
            <div className="hero-photo-img" style={{position:"relative",width:"clamp(180px,20vw,240px)",overflow:"hidden",border:`1px solid rgba(201,168,76,0.35)`,boxShadow:`0 0 0 4px rgba(13,11,8,0.9),0 0 0 5px rgba(201,168,76,0.15),0 24px 60px rgba(0,0,0,0.7),0 0 80px rgba(139,26,26,0.2)`}}>
              <div style={{position:"absolute",inset:0,zIndex:1,background:"linear-gradient(to bottom,rgba(13,11,8,0.2) 0%,transparent 25%,transparent 70%,rgba(13,11,8,0.4) 100%)",pointerEvents:"none"}}/>
              <img src="/kosmos.png" alt="Kosmas Simangunsong" style={{display:"block",width:"100%",height:"auto",objectFit:"cover",filter:"sepia(10%) contrast(1.05) brightness(0.93)"}}/>
            </div>
            {/* Caption */}
            <div style={{marginTop:18,textAlign:"center",borderTop:`1px solid rgba(201,168,76,0.2)`,paddingTop:10}}>
              <p style={{fontFamily:"'Cinzel Decorative',cursive",fontSize:"0.68rem",color:C.emas,letterSpacing:"0.08em"}}>Kosmas Simangunsong</p>
              <p style={{fontFamily:"'IM Fell English',serif",fontStyle:"italic",fontSize:"0.65rem",color:C.putih,opacity:.7,marginTop:2}}>Panuturi Simangunsong</p>
            </div>
          </div>

          {/* RIGHT: Text */}
          <div className="hero-text" style={{flex:1,minWidth:280,textAlign:"left"}}>
            <div className="fu d3" style={{marginBottom:22}}><UlosStripe/></div>
            <p className="fu d5" style={{fontFamily:"'Cinzel',serif",fontSize:"0.62rem",letterSpacing:"0.45em",textTransform:"uppercase",color:C.emas,marginBottom:20}}>
              Tarombo · Silsilah · Marga
            </p>
            <h1 className="fu d7 hero-h1" style={{fontFamily:"'Cinzel Decorative',cursive",fontWeight:900,lineHeight:1.08,color:C.putih,marginBottom:12,fontSize:"clamp(2rem,5vw,5rem)",textShadow:`0 0 60px rgba(201,168,76,.3),0 4px 20px rgba(0,0,0,.8)`}}>
              <span style={{color:C.emas}}>Silsilah</span><br/>
              <span style={{color:C.merahTerang}}>Simangunsong</span>
            </h1>
            <p className="fu d9 hero-subtitle" style={{fontFamily:"'Cinzel Decorative',cursive",color:C.emasM,letterSpacing:"0.12em",marginBottom:22,fontSize:"clamp(0.9rem,2vw,1.5rem)"}}>
              Marga Na Gok
            </p>
            <div className="fu d11" style={{marginBottom:22}}><HeroDivider/></div>
            <p className="fu d11 hero-desc" style={{fontFamily:"'IM Fell English',serif",fontStyle:"italic",color:C.kremT,maxWidth:500,lineHeight:1.78,marginBottom:14,fontSize:"clamp(1rem,1.8vw,1.25rem)"}}>
              Silsilah na so lupa, na so hasa Raja Simangunsong, anak, boru, bere dohot ibebere asa gabe parjambar, parhundul dohot partutur na mangolu di bagasan holong na sian Debata Jahowa. 

            </p>
            <p className="fu d13 hero-quote" style={{fontSize:"0.8rem",color:C.emasT,letterSpacing:"0.08em",marginBottom:40}}>
              &ldquo;Menjaga, Merawat dan Membumikan Nilai-nilai, Histori dan Silsilah Simangunsong yang Adaltif dengan Kultur Kekinian.&rdquo;
            </p>
            <div className="fu d15 hero-btns" style={{display:"flex",gap:16,flexWrap:"wrap"}}>
              <Link href="/tarombo" className="btn-p" style={btnPrimary}>Jelajahi Pohon Silsilah</Link>
              <Link href="/cari"    className="btn-s" style={btnSecondary}>Cari Anggota</Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="fu d21" style={{position:"absolute",bottom:32,left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
          
          <div style={{width:1,height:38,background:`linear-gradient(to bottom,${C.emasT},transparent)`,animation:"scrollPulse 2s ease infinite"}}/>
        </div>
      </section>

      <GorgaDivider/>

      {/* ── Stats — data real dari DB ── */}
      <section className="stats-section" style={{position:"relative",zIndex:10,background:C.hitamL,borderTop:`1px solid rgba(201,168,76,.2)`,borderBottom:`1px solid rgba(201,168,76,.2)`,padding:"52px 56px"}}>
        <div ref={statsRef}>
          <div className="stats-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",maxWidth:900,margin:"0 auto"}}>
            {loadingStats
              ? [0,1,2].map(i => (
                  <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"16px 32px",gap:8}}>
                    <div style={{width:80,height:40,background:"rgba(201,168,76,.08)",borderRadius:4,animation:"scrollPulse 1.5s ease infinite"}}/>
                    <div style={{width:120,height:12,background:"rgba(201,168,76,.05)",borderRadius:4,animation:"scrollPulse 1.5s ease infinite"}}/>
                  </div>
                ))
              : statsData.map((s,i) => (
                  <StatCard key={i} value={s.value} label={s.label} desc={s.desc} index={i} active={statsActive}/>
                ))
            }
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="fitur" style={{position:"relative",zIndex:10,padding:"100px 56px",background:C.hitam}}>
        <RevealDiv>
          <SectionHeader tag="Fitur Utama" title="Temukan" gold="Warisan Anda" sub="Alat lengkap untuk menjelajahi dan melestarikan silsilah keluarga"/>
          <div className="feat-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:2,maxWidth:1050,margin:"0 auto"}}>
            {features.map((f,i) => (
              <div key={i} className="feat-card" style={{position:"relative",background:C.hitamL,padding:"44px 32px",border:`1px solid rgba(201,168,76,.08)`,transition:"all .35s",overflow:"hidden"}}>
                <div className="feat-line" style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${C.merahTua},${C.emas},${C.merahTua})`,opacity:0,transition:"opacity .35s"}}/>
                <div style={{width:52,height:52,marginBottom:24,position:"relative",zIndex:1}}>{f.icon}</div>
                <h3 style={{fontFamily:"'Cinzel',serif",fontSize:"1rem",fontWeight:700,color:C.putih,letterSpacing:"0.05em",marginBottom:12,position:"relative",zIndex:1}}>{f.title}</h3>
                <p style={{fontSize:"0.97rem",lineHeight:1.78,color:C.kremT,opacity:.75,position:"relative",zIndex:1}}>{f.desc}</p>
                <div style={{position:"absolute",bottom:16,right:20,fontFamily:"'Cinzel Decorative',cursive",fontSize:"4rem",color:"rgba(201,168,76,.055)",fontWeight:900,lineHeight:1,pointerEvents:"none"}}>{f.number}</div>
              </div>
            ))}
          </div>
        </RevealDiv>
      </section>

      {/* ── Anggota — data real dari DB ── */}
      <section id="anggota" style={{position:"relative",zIndex:10,padding:"100px 56px",background:C.hitamL,borderTop:`1px solid rgba(201,168,76,.1)`}}>
        <RevealDiv>
          <SectionHeader tag="Anggota Terdaftar" title="Keluarga" gold="Simangunsong" sub="Data langsung dari database silsilah"/>

          {loadingPersons ? (
            <div style={{display:"flex",justifyContent:"center",alignItems:"center",padding:"48px",gap:12}}>
              <div style={{width:24,height:12,border:`2px solid rgba(201,168,76,.2)`,borderTopColor:C.emas,borderRadius:"50%",animation:"spin .8s linear infinite"}}/>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:"0.7rem",color:C.emasT,letterSpacing:"0.2em"}}>Memuat data...</span>
            </div>
          ) : persons.length === 0 ? (
            <p style={{textAlign:"center",fontFamily:"'IM Fell English',serif",fontStyle:"italic",color:C.emasT,fontSize:"1.05rem"}}>
              Belum ada data anggota. <Link href="/tambah" style={{color:C.emas}}>Tambahkan sekarang →</Link>
            </p>
          ) : (
            <div className="persons-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,maxWidth:1050,margin:"0 auto 40px"}}>
              {persons.map(p => <PersonCard key={p.id} person={p}/>)}
            </div>
          )}

          <div style={{textAlign:"center",marginTop:8}}>
            <Link href="/person" className="btn-s" style={btnSecondary}>
              Lihat Semua Anggota
            </Link>
          </div>
        </RevealDiv>
      </section>

      {/* ── Tarombo info ── */}
      <section id="tarombo" style={{position:"relative",zIndex:10,padding:"100px 56px",background:`linear-gradient(135deg,#5C0E0E 0%,#3D0A0A 50%,#5C0E0E 100%)`,overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,pointerEvents:"none",backgroundImage:"repeating-linear-gradient(0deg,rgba(201,168,76,.05) 0,rgba(201,168,76,.05) 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,rgba(201,168,76,.05) 0,rgba(201,168,76,.05) 1px,transparent 1px,transparent 40px)"}}/>
        <RevealDiv>
          <div style={{maxWidth:700,margin:"0 auto",textAlign:"center"}}>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:"0.63rem",letterSpacing:"0.4em",textTransform:"uppercase",color:C.emasM,display:"block",marginBottom:14}}>Tarombo Batak</span>
            <h2 style={{fontFamily:"'Cinzel Decorative',cursive",fontSize:"clamp(1.8rem,3.5vw,3rem)",fontWeight:700,color:C.putih,marginBottom:20}}>
              Akar yang <span style={{color:C.emas}}>Kuat</span>
            </h2>
            <p style={{fontFamily:"'IM Fell English',serif",fontStyle:"italic",fontSize:"1.05rem",color:C.kremT,opacity:.85,lineHeight:1.75,marginBottom:40}}>
              Tarombo adalah sistem silsilah marga Batak Toba yang mencatat garis keturunan patrilineal. Database ini menyimpan relasi antar anggota melalui tabel <span style={{color:C.emas}}>person</span>, <span style={{color:C.emas}}>marriage</span>, dan <span style={{color:C.emas}}>child</span> — memungkinkan penelusuran silsilah dari generasi ke generasi.
            </p>
            {stats && (
              <div className="tarombo-stats" style={{display:"flex",gap:24,justifyContent:"center",flexWrap:"wrap",marginBottom:40}}>
                {[
                  {v:stats.lakiLaki,  l:"Laki-laki", c:"#7EB8D4"},
                  {v:stats.perempuan, l:"Perempuan",  c:"#D4A0B5"},
                ].map((item,i) => (
                  <div key={i} style={{textAlign:"center",padding:"16px 32px",border:`1px solid rgba(201,168,76,.2)`,background:"rgba(13,11,8,.4)"}}>
                    <div style={{fontFamily:"'Cinzel Decorative',cursive",fontSize:"2rem",color:item.c,marginBottom:4}}>{item.v}</div>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.6rem",letterSpacing:"0.2em",textTransform:"uppercase",color:C.kremT,opacity:.6}}>{item.l}</div>
                  </div>
                ))}
              </div>
            )}
            <Link href="/tarombo" className="btn-p" style={btnPrimary}>
              Buka Pohon Silsilah
            </Link>
          </div>
        </RevealDiv>
      </section>

      {/* ── Donasi ── */}
      <section id="donasi" style={{position:"relative",zIndex:10,padding:"100px 56px",background:C.hitam,borderTop:`1px solid rgba(201,168,76,.1)`,overflow:"hidden"}}>
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:600,height:600,background:"radial-gradient(ellipse,rgba(201,168,76,.04) 0%,transparent 70%)",pointerEvents:"none"}}/>
        <RevealDiv>
          <SectionHeader tag="Dukung Kami" title="Jaga Warisan" gold="Bersama" sub="Bantu kami melestarikan silsilah dan budaya Batak Toba untuk generasi mendatang"/>

          <div style={{maxWidth:680,margin:"0 auto"}}>
            {/* Quote */}
            <p style={{fontFamily:"'IM Fell English',serif",fontStyle:"italic",fontSize:"1.05rem",color:C.kremT,opacity:.75,lineHeight:1.85,textAlign:"center",marginBottom:52}}>
              Silsilah ini dibangun dengan penuh dedikasi untuk menghubungkan anak cucu Simangunsong di seluruh penjuru dunia. Dukungan Anda — seberapapun besarnya — membantu kami menjaga server dan mengembangkan arsip leluhur.
            </p>

            {/* Rekening card */}
            <div style={{border:`1px solid rgba(201,168,76,.25)`,background:"rgba(26,22,18,0.85)",position:"relative",overflow:"hidden"}}>
              {/* Top accent */}
              <div style={{height:3,background:`linear-gradient(90deg,${C.merahTua},${C.emas},${C.merahTua})`}}/>

              <div style={{padding:"36px 40px"}}>
                <p style={{fontFamily:"'Cinzel',serif",fontSize:"0.6rem",letterSpacing:"0.35em",textTransform:"uppercase",color:C.emasT,textAlign:"center",marginBottom:32}}>
                  Informasi Rekening
                </p>

                {/* Banks */}
                <div style={{display:"flex",flexDirection:"column",gap:20}}>
                  {[
                    { bank:"Bank Central Asia (BCA)",     no:"6475 2911 01", nama:"Reinol Bernauli Simangunsong" },
                    { bank:"Bank Rakyat Indonesia (BRI)", no:"3348 5808 531", nama:"Jeremi Steven Simangunsong" },
                    { bank:"GoPay / OVO / Dana",          no:"0812 6240 2991", nama:"Reinol Bernauli Simangunsong" },
                  ].map((b,i) => (
                    <div key={i} style={{
                      display:"flex",alignItems:"center",gap:20,
                      padding:"20px 24px",
                      border:`1px solid rgba(201,168,76,.12)`,
                      background:"rgba(13,11,8,0.5)",
                      flexWrap:"wrap"
                    }}>
                      {/* Bank name */}
                      <div style={{minWidth:180}}>
                        <span style={{fontFamily:"'Cinzel',serif",fontSize:"0.62rem",letterSpacing:"0.15em",textTransform:"uppercase",color:C.emasT,display:"block",marginBottom:2}}>{b.bank}</span>
                        <span style={{fontFamily:"'IM Fell English',serif",fontStyle:"italic",fontSize:"0.78rem",color:C.kremT,opacity:.55}}>{b.nama}</span>
                      </div>
                      {/* Divider */}
                      <div style={{width:1,height:36,background:"rgba(201,168,76,.15)",flexShrink:0}}/>
                      {/* Nomor */}
                      <div style={{flex:1}}>
                        <span className="donasi-norek" style={{fontFamily:"'Cinzel Decorative',cursive",fontSize:"1.3rem",color:C.putih,letterSpacing:"0.12em"}}>{b.no}</span>
                      </div>
                      {/* Copy hint */}
                      <span style={{fontFamily:"'Cinzel',serif",fontSize:"0.52rem",letterSpacing:"0.15em",textTransform:"uppercase",color:C.emasT,opacity:.5,whiteSpace:"nowrap"}}>
                        Salin →
                      </span>
                    </div>
                  ))}
                </div>

                {/* Konfirmasi note */}
                <div className="donasi-konfirmasi" style={{marginTop:28,paddingTop:24,borderTop:`1px solid rgba(201,168,76,.1)`,display:"flex",gap:16,alignItems:"center",flexWrap:"wrap",justifyContent:"space-between"}}>
                  <p style={{fontFamily:"'IM Fell English',serif",fontStyle:"italic",fontSize:"0.85rem",color:C.kremT,opacity:.6,lineHeight:1.65,maxWidth:360}}>
                    Setelah transfer, konfirmasi melalui WhatsApp agar nama Anda tercatat sebagai donatur keluarga Simangunsong.
                  </p>
                  <a href="https://wa.me/6281262402991" style={{
                    fontFamily:"'Cinzel',serif",fontSize:"0.62rem",letterSpacing:"0.18em",textTransform:"uppercase",
                    color:C.hitam,background:`linear-gradient(135deg,${C.emas},${C.emasM})`,
                    padding:"12px 28px",textDecoration:"none",display:"inline-block",
                    clipPath:"polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
                    flexShrink:0,
                  }} className="btn-p">
                    Konfirmasi WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Thank you note */}
            <p style={{textAlign:"center",marginTop:28,fontFamily:"'Cinzel Decorative',cursive",fontSize:"0.75rem",color:C.emasT,letterSpacing:"0.12em",opacity:.65}}>
              Horas · Mauliate Godang · Horas
            </p>
          </div>
        </RevealDiv>
      </section>

            {/* ── CTA ──
      <section id="tentang" style={{position:"relative",zIndex:10,padding:"120px 40px",textAlign:"center",background:C.hitamL,overflow:"hidden"}}>
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:600,height:600,background:"radial-gradient(ellipse,rgba(139,26,26,.2) 0%,transparent 70%)",pointerEvents:"none"}}/>
        <RevealDiv style={{position:"relative",zIndex:1}}>
          <div style={{marginBottom:36}}><UlosStripe/></div>
          <h2 style={{fontFamily:"'Cinzel Decorative',cursive",color:C.putih,marginBottom:18,lineHeight:1.32,fontSize:"clamp(1.6rem,3vw,2.8rem)"}}>
            Mulai Telusuri<br/><span style={{color:C.emas}}>Akar Anda Hari Ini</span>
          </h2>
          <p style={{fontFamily:"'IM Fell English',serif",fontStyle:"italic",fontSize:"1.15rem",color:C.kremT,opacity:.8,marginBottom:44,maxWidth:480,marginLeft:"auto",marginRight:"auto",lineHeight:1.72}}>
            Bergabunglah bersama keluarga Simangunsong dalam menjaga warisan leluhur.
          </p>
          <div className="cta-btns" style={{display:"flex",gap:18,flexWrap:"wrap",justifyContent:"center"}}>
            <Link href="/login" className="btn-p" style={btnPrimary}>Login Admin</Link>
            <Link href="/tarombo"       className="btn-s" style={btnSecondary}>Lihat Pohon Silsilah</Link>
          </div>
        </RevealDiv>
      </section> */}

      {/* ── Footer ── */}
      <footer style={{position:"relative",zIndex:10,background:C.hitam,borderTop:`1px solid rgba(201,168,76,.15)`,padding:"56px 56px 36px"}}>
        <div className="footer-grid" style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:52,marginBottom:44,maxWidth:960,margin:"0 auto 44px"}}>
          <div>
            <span style={{fontFamily:"'Cinzel Decorative',cursive",fontSize:"1.1rem",color:C.emas,display:"block",marginBottom:14}}>Silsilah Simangunsong</span>
            <p style={{fontFamily:"'IM Fell English',serif",fontStyle:"italic",fontSize:"0.92rem",color:C.kremT,opacity:.6,lineHeight:1.72,maxWidth:270}}>
              Platform digital pelestarian silsilah dan tarombo marga Simangunsong. Menyambungkan generasi, menjaga akar budaya Batak Toba.
            </p>
            {stats && (
              <p style={{fontFamily:"'Cinzel',serif",fontSize:"0.6rem",letterSpacing:"0.15em",color:C.emasT,marginTop:16}}>
                {stats.totalPerson} anggota · {stats.totalMarriage} pernikahan tercatat
              </p>
            )}
          </div>
          {footerCols.map(col => (
            <div key={col.title}>
              <h4 style={{fontFamily:"'Cinzel',serif",fontSize:"0.6rem",letterSpacing:"0.3em",textTransform:"uppercase",color:C.emas,marginBottom:18}}>{col.title}</h4>
              <ul style={{listStyle:"none",padding:0,display:"flex",flexDirection:"column",gap:10}}>
                {col.links.map(([href,label]) => (
                  <li key={href}>
                    <Link href={href} className="footer-a" style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"0.92rem",color:C.kremT,opacity:.6,textDecoration:"none",transition:"all .3s"}}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{borderTop:`1px solid rgba(201,168,76,.1)`,paddingTop:24,display:"flex",justifyContent:"space-between",alignItems:"center",maxWidth:960,margin:"0 auto",flexWrap:"wrap",gap:10}}>
          <p style={{fontFamily:"'Cinzel',serif",fontSize:"0.56rem",letterSpacing:"0.2em",color:C.kremT,opacity:.4,textTransform:"uppercase"}}>© 2025 Silsilah Simangunsong · Marga Na Gok</p>
          <p style={{fontFamily:"'Cinzel',serif",fontSize:"0.56rem",letterSpacing:"0.2em",color:C.kremT,opacity:.4,textTransform:"uppercase"}}>Horas · Horas · Horas</p>
        </div>
      </footer>

      <UlosBorder/>
    </div>
  );
}