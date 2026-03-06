"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Person {
  id:           number;
  nama:         string;
  jenisKelamin: "LAKI_LAKI" | "PEREMPUAN";
  tanggalLahir: string | null;
  tanggalWafat: string | null;
  tempatLahir:  string | null;
  foto:         string | null;
  generasi:     number;
  jumlahAnak:   number;
  isIstri:      boolean;
  pasangan:     { id: number; nama: string } | null;
}

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  merah:"#8B1A1A", merahTua:"#5C0E0E", merahTerang:"#C0392B",
  emas:"#C9A84C",  emasM:"#E8CC7A",    emasT:"#8B6914",
  hitam:"#0D0B08", hitamL:"#1A1612",   hitamM:"#111009",
  krem:"#F5EDD8",  kremT:"#E8D9B8",    putih:"#FDF8EE",
  biru:"#7EB8D4",  pink:"#D4A0B5",
};

// ─── UI helpers ───────────────────────────────────────────────────────────────
const UlosStripe = () => (
  <div style={{height:5,width:220,margin:"0 auto",
    background:`repeating-linear-gradient(90deg,${C.merah} 0px,${C.merah} 14px,${C.emas} 14px,${C.emas} 20px,${C.hitam} 20px,${C.hitam} 26px,${C.emas} 26px,${C.emas} 32px,${C.merah} 32px,${C.merah} 46px,${C.hitam} 46px,${C.hitam} 50px)`}}/>
);

const UlosBorder = () => (
  <div style={{height:6,width:"100%",
    background:`repeating-linear-gradient(90deg,${C.merahTua} 0px,${C.merahTua} 20px,${C.emasT} 20px,${C.emasT} 28px,${C.hitam} 28px,${C.hitam} 36px,${C.emasT} 36px,${C.emasT} 44px,${C.merahTua} 44px,${C.merahTua} 64px,${C.hitam} 64px,${C.hitam} 68px)`}}/>
);

// Roman numerals untuk generasi (n harus >= 1)
function toRoman(n: number): string {
  const vals = [40,10,9,5,4,1];
  const syms = ["XL","X","IX","V","IV","I"];
  let result = "", m = n;
  for (let i = 0; i < vals.length; i++) {
    while (m >= vals[i]) { result += syms[i]; m -= vals[i]; }
  }
  return result || "I";
}

function formatTahun(tgl: string | null): string {
  if (!tgl) return "—";
  return new Date(tgl).getFullYear().toString();
}

// ─── Person Row Card ──────────────────────────────────────────────────────────
const PersonRow = ({
  person, index, isAdmin, onDelete, onNavigate,
}: {
  person:     Person;
  index:      number;
  isAdmin:    boolean;
  onDelete:   (id: number) => void;
  onNavigate: () => void;
}) => {
  const isLaki   = person.jenisKelamin === "LAKI_LAKI";
  const accent   = isLaki ? C.biru : C.pink;
  const initials = person.nama.split(" ").slice(0,2).map(w=>w[0]).join("");
  const [hovered, setHovered] = useState(false);
  const isIstri  = person.isIstri;

  return (
    <div>
      {/* Connector line untuk pasangan (non-keturunan) */}
      {isIstri && (
        <div style={{display:"flex",alignItems:"center",paddingLeft:60,marginBottom:0}}>
          <div style={{width:1,height:10,background:`rgba(201,168,76,0.18)`,marginLeft:20}}/>
          <div style={{height:1,width:16,background:`rgba(201,168,76,0.15)`,borderTop:"1px dashed rgba(201,168,76,0.2)"}}/>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:"0.44rem",letterSpacing:"0.2em",color:C.emasT,opacity:.45,marginLeft:5}}>
            PASANGAN
          </span>
        </div>
      )}

      {/* Indent wrapper untuk pasangan */}
      <div style={{paddingLeft: isIstri ? 32 : 0}}>
        <div
          onClick={onNavigate}
          onMouseEnter={()=>setHovered(true)}
          onMouseLeave={()=>setHovered(false)}
          style={{
            display:"flex", alignItems:"center",
            background: hovered
              ? "rgba(201,168,76,0.05)"
              : (isIstri ? "rgba(13,11,8,0.7)" : "rgba(26,22,18,0.7)"),
            border:`1px solid ${
              hovered
                ? "rgba(201,168,76,0.25)"
                : (isIstri ? "rgba(201,168,76,0.07)" : "rgba(201,168,76,0.1)")
            }`,
            borderLeft:`2px solid ${isIstri ? "rgba(201,168,76,0.2)" : (hovered ? C.emas : accent)}`,
            transition:"all .25s", cursor:"pointer", position:"relative", overflow:"hidden",
            marginBottom: 2,
            opacity: isIstri ? 0.55 : 1,
          }}
        >
          {/* Hover glow */}
          {hovered && (
            <div style={{position:"absolute",inset:0,
              background:`linear-gradient(90deg,${isIstri?"rgba(212,160,181,0.05)":"rgba(139,26,26,0.1)"},transparent)`,
              pointerEvents:"none"}}/>
          )}

          {/* No. urut */}
          <div style={{width:52,minWidth:52,textAlign:"center",padding:"18px 0",borderRight:`1px solid rgba(201,168,76,0.07)`}}>
            <span style={{fontFamily:"'Cinzel Decorative',cursive",fontSize:"0.7rem",color:C.emasT,opacity:.6}}>
              {String(index+1).padStart(2,"0")}
            </span>
          </div>

          {/* Avatar */}
          <div style={{padding:"14px 16px"}}>
            <div style={{
              width:isIstri?42:48, height:isIstri?42:48, borderRadius:"50%",
              background:`linear-gradient(135deg,${C.merahTua},${C.hitam})`,
              border:`2px solid ${accent}`,
              display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0,
            }}>
              {person.foto
                ? <img src={person.foto} alt={person.nama} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                : <span style={{fontFamily:"'Cinzel Decorative',cursive",fontSize:isIstri?"1rem":"1.1rem",color:accent}}>{initials}</span>
              }
            </div>
          </div>

          {/* Nama + info */}
          <div style={{flex:1, padding:"14px 8px 14px 0", minWidth:0}}>
            <div style={{display:"flex",alignItems:"baseline",gap:10,flexWrap:"wrap"}}>
              <h3 style={{
                fontFamily:"'Cinzel',serif",
                fontSize: isIstri ? "0.82rem" : "0.9rem",
                fontWeight:700,
                color: hovered ? C.emasM : (isIstri ? C.kremT : C.putih),
                letterSpacing:"0.04em",transition:"color .25s",
              }}>
                {person.nama}
              </h3>
              <span style={{
                fontFamily:"'Cinzel',serif",fontSize:"0.52rem",letterSpacing:"0.18em",
                textTransform:"uppercase",color:accent,
                border:`1px solid ${accent}`,
                padding:"2px 7px",opacity:.75,whiteSpace:"nowrap",
              }}>
                {isLaki?"Laki-laki":"Perempuan"}
              </span>
            </div>

            {/* Meta info */}
            <div style={{display:"flex",gap:16,marginTop:4,flexWrap:"wrap"}}>
              {person.tempatLahir && (
                <span style={{fontFamily:"'IM Fell English',serif",fontStyle:"italic",fontSize:"0.76rem",color:C.emasT}}>
                  📍 {person.tempatLahir}
                </span>
              )}
              {(person.tanggalLahir || person.tanggalWafat) && (
                <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"0.78rem",color:C.kremT,opacity:.55}}>
                  {formatTahun(person.tanggalLahir)}{person.tanggalWafat?` – ${formatTahun(person.tanggalWafat)}`:""}
                </span>
              )}
              {person.pasangan && (
                <span style={{fontFamily:"'IM Fell English',serif",fontStyle:"italic",fontSize:"0.76rem",
                  color: isIstri ? C.biru : C.pink, opacity:.65}}>
                  ✦ {person.pasangan.nama}
                </span>
              )}
            </div>
          </div>

          {/* Generasi badge */}
          {!isIstri && (
            <div style={{padding:"0 18px",textAlign:"center",borderLeft:`1px solid rgba(201,168,76,0.08)`,minWidth:72}}>
              <div style={{fontFamily:"'Cinzel Decorative',cursive",fontSize:"1.1rem",color:C.emas,lineHeight:1,marginBottom:3}}>
                {toRoman(person.generasi + 1)}
              </div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.52rem",letterSpacing:"0.15em",textTransform:"uppercase",color:C.emasT,opacity:.7}}>
                Gen.
              </div>
            </div>
          )}

          {/* Jumlah anak */}
          {person.jumlahAnak > 0 && (
            <div style={{padding:"0 18px",textAlign:"center",borderLeft:`1px solid rgba(201,168,76,0.08)`,minWidth:64}}>
              <div style={{fontFamily:"'Cinzel Decorative',cursive",fontSize:"1.1rem",color:C.merahTerang,lineHeight:1,marginBottom:3}}>
                {person.jumlahAnak}
              </div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.52rem",letterSpacing:"0.15em",textTransform:"uppercase",color:C.emasT,opacity:.7}}>
                Anak
              </div>
            </div>
          )}

          {/* Admin action buttons — klik tidak memicu navigasi row */}
          {isAdmin && (
            <div
              style={{display:"flex",gap:4,padding:"0 10px",borderLeft:`1px solid rgba(201,168,76,0.08)`}}
              onClick={e => e.stopPropagation()}
            >
              <a
                href={`/admin/edit/${person.id}`}
                style={{
                  fontFamily:"'Cinzel',serif",fontSize:"0.52rem",letterSpacing:"0.12em",
                  textTransform:"uppercase",color:C.emas,textDecoration:"none",
                  background:"rgba(201,168,76,.08)",border:`1px solid rgba(201,168,76,.25)`,
                  padding:"5px 10px",transition:"all .2s",whiteSpace:"nowrap",
                }}
              >
                Edit
              </a>
              <button
                onClick={() => onDelete(person.id)}
                style={{
                  fontFamily:"'Cinzel',serif",fontSize:"0.52rem",letterSpacing:"0.12em",
                  textTransform:"uppercase",color:C.merahTerang,
                  background:"rgba(139,26,26,.08)",border:`1px solid rgba(192,57,43,.25)`,
                  padding:"5px 10px",cursor:"pointer",transition:"all .2s",whiteSpace:"nowrap",
                }}
              >
                Hapus
              </button>
            </div>
          )}

          {/* Arrow */}
          <div style={{padding:"0 16px",color:hovered?C.emas:"rgba(201,168,76,.2)",transition:"color .25s",fontSize:"0.9rem"}}>→</div>
        </div>
      </div>
    </div>
  );
};

// ─── Generation Section Header ────────────────────────────────────────────────
const GenHeader = ({ gen, directCount, spouseCount }: { gen: number; directCount: number; spouseCount: number }) => (
  <div style={{
    display:"flex",alignItems:"center",gap:16,
    margin:"32px 0 10px",
  }}>
    <div style={{
      fontFamily:"'Cinzel Decorative',cursive",fontSize:"1.4rem",fontWeight:700,
      color:C.emas,minWidth:52,textAlign:"center",
      textShadow:`0 0 20px rgba(201,168,76,.3)`,
    }}>
      {toRoman(gen + 1)}
    </div>
    <div style={{flex:1,height:1,background:`linear-gradient(90deg,rgba(201,168,76,.3),transparent)`}}/>
    <span style={{fontFamily:"'Cinzel',serif",fontSize:"0.58rem",letterSpacing:"0.2em",textTransform:"uppercase",color:C.emasT,opacity:.7}}>
      Generasi ke-{gen+1} · {directCount} keturunan{spouseCount > 0 ? ` · ${spouseCount} pasangan` : ""}
    </span>
    <div style={{width:6,height:6,background:C.merah,transform:"rotate(45deg)",opacity:.6}}/>
  </div>
);

// ─── Skeleton loader ──────────────────────────────────────────────────────────
const Skeleton = () => (
  <div style={{display:"flex",flexDirection:"column",gap:2}}>
    {[0,1,2,3,4].map(i=>(
      <div key={i} style={{height:76,background:"rgba(26,22,18,0.5)",border:"1px solid rgba(201,168,76,.06)",animation:"pulse 1.5s ease infinite",animationDelay:`${i*0.1}s`}}/>
    ))}
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PersonListPage() {
  const router = useRouter();

  const [persons,  setPersons]  = useState<Person[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string|null>(null);
  const [search,   setSearch]   = useState("");
  const [gender,   setGender]   = useState<""|"LAKI_LAKI"|"PEREMPUAN">("");
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin,  setIsAdmin]  = useState(false);

  useEffect(()=>{
    const fn = ()=>setScrolled(window.scrollY>40);
    window.addEventListener("scroll",fn);
    return ()=>window.removeEventListener("scroll",fn);
  },[]);

  // Cek auth untuk tampilkan tombol admin (tanpa redirect)
  useEffect(()=>{
    fetch("/api/auth/me")
      .then(r=>r.json())
      .then(d=>{ if(d.success) setIsAdmin(true); })
      .catch(()=>{});
  },[]);

  // Fetch
  const fetchData = (q="",g="") => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("cari",q);
    if (g) params.set("gender",g);
    fetch(`/api/person/all?${params}`)
      .then(r=>r.json())
      .then(res=>{ if(res.success) setPersons(res.data); else setError("Gagal memuat data"); })
      .catch(()=>setError("Koneksi server gagal"))
      .finally(()=>setLoading(false));
  };

  useEffect(()=>{ fetchData(); },[]);

  // Debounced search
  useEffect(()=>{
    const t = setTimeout(()=>fetchData(search,gender),350);
    return ()=>clearTimeout(t);
  },[search,gender]);

  // Hapus anggota (admin only)
  async function handleDelete(id: number) {
    if (!confirm("Yakin ingin menghapus anggota ini?\nSemua data relasi (pernikahan & anak) juga akan dihapus.")) return;
    try {
      const res  = await fetch(`/api/person/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchData(search, gender);
      } else {
        alert("Gagal menghapus: " + (data.message || "Terjadi kesalahan"));
      }
    } catch {
      alert("Terjadi kesalahan saat menghapus data");
    }
  }

  // Group by generasi, spouses sorted right after their partner
  const grouped = useMemo(()=>{
    const map = new Map<number,Person[]>();
    for (const p of persons) {
      if (!map.has(p.generasi)) map.set(p.generasi,[]);
      map.get(p.generasi)!.push(p);
    }
    return [...map.entries()].sort((a,b)=>a[0]-b[0]).map(([gen, list]) => {
      const spouseByPartnerId = new Map<number, Person>();
      for (const p of list) {
        if (p.isIstri && p.pasangan) spouseByPartnerId.set(p.pasangan.id, p);
      }
      const added = new Set<number>();
      const ordered: Person[] = [];
      for (const p of list) {
        if (p.isIstri) continue;
        ordered.push(p);
        added.add(p.id);
        const spouse = spouseByPartnerId.get(p.id);
        if (spouse) { ordered.push(spouse); added.add(spouse.id); }
      }
      for (const p of list) {
        if (!added.has(p.id)) ordered.push(p);
      }
      return [gen, ordered] as [number, Person[]];
    });
  },[persons]);

  // Index flat per person — O(n) lookup, hindari persons.indexOf(p) yang O(n²)
  const personIndices = useMemo(()=>{
    const map = new Map<number,number>();
    persons.forEach((p,i)=>map.set(p.id,i));
    return map;
  },[persons]);

  const totalLaki     = persons.filter(p=>p.jenisKelamin==="LAKI_LAKI").length;
  const totalPerempuan = persons.filter(p=>p.jenisKelamin==="PEREMPUAN").length;

  return (
    <div style={{minHeight:"100vh",backgroundColor:C.hitam,color:C.krem,fontFamily:"'Cormorant Garamond',serif",overflowX:"hidden",position:"relative"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;600;700&family=IM+Fell+English:ital@0;1&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{background-color:${C.hitam}}

        @keyframes fadeUp {from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse  {0%,100%{opacity:.35}50%{opacity:.7}}

        .fu{opacity:0;animation:fadeUp .7s ease forwards}
        .d1{animation-delay:.1s}.d2{animation-delay:.2s}.d3{animation-delay:.3s}

        .filter-btn:hover{border-color:rgba(201,168,76,.5)!important;color:${C.emas}!important}
        .filter-active{border-color:${C.emas}!important;color:${C.emas}!important;background:rgba(201,168,76,.08)!important}
        .back-link:hover{color:${C.emas}!important;border-color:rgba(201,168,76,.4)!important}

        .gorga-bg{
          background-image:repeating-linear-gradient(45deg,${C.emas} 0,${C.emas} 1px,transparent 0,transparent 50%),repeating-linear-gradient(-45deg,${C.emas} 0,${C.emas} 1px,transparent 0,transparent 50%);
          background-size:28px 28px;
        }

        /* Scrollbar */
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:${C.hitam}}
        ::-webkit-scrollbar-thumb{background:${C.emasT}}
      `}</style>

      {/* Gorga bg */}
      <div className="gorga-bg" style={{position:"fixed",inset:0,zIndex:0,opacity:.035,pointerEvents:"none"}}/>

      {/* Side lines */}
      <div style={{position:"fixed",left:0,top:0,width:3,height:"100%",background:`linear-gradient(to bottom,transparent,${C.merah} 20%,${C.merah} 80%,transparent)`,opacity:.45,zIndex:1,pointerEvents:"none"}}/>
      <div style={{position:"fixed",right:0,top:0,width:3,height:"100%",background:`linear-gradient(to bottom,transparent,${C.merah} 20%,${C.merah} 80%,transparent)`,opacity:.45,zIndex:1,pointerEvents:"none"}}/>

      {/* ── Navbar ── */}
      <nav style={{
        position:"sticky",top:0,zIndex:50,
        padding:"16px 48px",display:"flex",justifyContent:"space-between",alignItems:"center",
        background:scrolled?`rgba(13,11,8,.97)`:`rgba(13,11,8,.92)`,
        borderBottom:`1px solid rgba(201,168,76,${scrolled?".18":".08"})`,
        transition:"all .4s",
      }}>
        <Link href="/" style={{fontFamily:"'Cinzel Decorative',cursive",fontSize:"0.95rem",color:C.emas,textDecoration:"none"}}>
          Silsilah <span style={{color:C.merahTerang}}>Simangunsong</span>
        </Link>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <Link href="/tarombo" style={{fontFamily:"'Cinzel',serif",fontSize:"0.62rem",letterSpacing:"0.18em",textTransform:"uppercase",color:C.kremT,textDecoration:"none",padding:"7px 16px",border:`1px solid rgba(201,168,76,.15)`,transition:"all .3s"}} className="back-link">
            Pohon Silsilah
          </Link>
          <Link href="/tambah" style={{fontFamily:"'Cinzel',serif",fontSize:"0.62rem",letterSpacing:"0.18em",textTransform:"uppercase",color:C.hitam,background:`linear-gradient(135deg,${C.emas},${C.emasM})`,textDecoration:"none",padding:"7px 18px",clipPath:"polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)"}}>
            + Tambah
          </Link>
        </div>
      </nav>

      <div style={{position:"relative",zIndex:2,maxWidth:900,margin:"0 auto",padding:"48px 24px 80px"}}>

        {/* ── Header ── */}
        <div className="fu d1" style={{textAlign:"center",marginBottom:48}}>
          <UlosStripe/>
          <p style={{fontFamily:"'Cinzel',serif",fontSize:"0.6rem",letterSpacing:"0.45em",textTransform:"uppercase",color:C.merahTerang,margin:"18px 0 10px"}}>
            Silsilah Simangunsong
          </p>
          <h1 style={{fontFamily:"'Cinzel Decorative',cursive",fontSize:"clamp(1.8rem,4vw,3rem)",fontWeight:700,color:C.putih,marginBottom:10,textShadow:`0 0 40px rgba(201,168,76,.2)`}}>
            Daftar <span style={{color:C.emas}}>Anggota</span>
          </h1>
          <p style={{fontFamily:"'IM Fell English',serif",fontStyle:"italic",fontSize:"1rem",color:C.kremT,opacity:.7}}>
            Diurutkan dari generasi tertua hingga termuda
          </p>
        </div>

        {/* ── Stats ── */}
        {!loading && persons.length>0 && (
          <div className="fu d2" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:2,marginBottom:36}}>
            {[
              {v:persons.length, l:"Total Anggota", c:C.emas},
              {v:totalLaki,      l:"Laki-laki",     c:C.biru},
              {v:totalPerempuan, l:"Perempuan",      c:C.pink},
            ].map((s,i)=>(
              <div key={i} style={{background:"rgba(26,22,18,0.7)",border:`1px solid rgba(201,168,76,.1)`,padding:"16px",textAlign:"center"}}>
                <div style={{fontFamily:"'Cinzel Decorative',cursive",fontSize:"1.8rem",color:s.c,lineHeight:1,marginBottom:4}}>{s.v}</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.56rem",letterSpacing:"0.22em",textTransform:"uppercase",color:C.emasT,opacity:.75}}>{s.l}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Search & Filter ── */}
        <div className="fu d2" style={{display:"flex",gap:10,marginBottom:32,flexWrap:"wrap"}}>
          {/* Search input */}
          <div style={{flex:1,minWidth:220,position:"relative"}}>
            <svg style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",opacity:.4}} width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="5" stroke={C.emas} strokeWidth="1.2"/>
              <line x1="10" y1="10" x2="13" y2="13" stroke={C.emas} strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <input
              value={search}
              onChange={e=>setSearch(e.target.value)}
              placeholder="Cari nama anggota..."
              style={{
                width:"100%",background:"rgba(26,22,18,.9)",
                border:`1px solid rgba(201,168,76,.22)`,color:C.kremT,
                fontFamily:"'Cinzel',serif",fontSize:"0.67rem",letterSpacing:"0.1em",
                padding:"11px 14px 11px 36px",outline:"none",
                transition:"border-color .2s",
              }}
              onFocus={e=>e.target.style.borderColor=C.emas}
              onBlur={e=>e.target.style.borderColor="rgba(201,168,76,.22)"}
            />
          </div>

          {/* Gender filter */}
          {(["","LAKI_LAKI","PEREMPUAN"] as const).map(g=>(
            <button
              key={g}
              onClick={()=>setGender(g)}
              className={`filter-btn ${gender===g?"filter-active":""}`}
              style={{
                fontFamily:"'Cinzel',serif",fontSize:"0.6rem",letterSpacing:"0.18em",textTransform:"uppercase",
                color:gender===g?C.emas:C.kremT,
                background: gender===g?"rgba(201,168,76,.08)":"transparent",
                border:`1px solid ${gender===g?C.emas:"rgba(201,168,76,.2)"}`,
                padding:"10px 18px",cursor:"pointer",transition:"all .25s",
              }}
            >
              {g===""?"Semua":g==="LAKI_LAKI"?"Laki-laki":"Perempuan"}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        {loading && <Skeleton/>}

        {error && (
          <div style={{textAlign:"center",padding:"60px 0"}}>
            <p style={{fontFamily:"'Cinzel Decorative',cursive",fontSize:"1rem",color:C.merahTerang,marginBottom:8}}>Gagal Memuat</p>
            <p style={{fontFamily:"'IM Fell English',serif",fontStyle:"italic",color:C.emasT}}>{error}</p>
          </div>
        )}

        {!loading && !error && persons.length===0 && (
          <div style={{textAlign:"center",padding:"60px 0"}}>
            <p style={{fontFamily:"'IM Fell English',serif",fontStyle:"italic",fontSize:"1.1rem",color:C.emasT}}>
              {search ? `Tidak ada hasil untuk "${search}"` : "Belum ada anggota terdaftar."}
            </p>
            <Link href="/tambah" style={{display:"inline-block",marginTop:20,fontFamily:"'Cinzel',serif",fontSize:"0.67rem",letterSpacing:"0.2em",textTransform:"uppercase",color:C.hitam,background:`linear-gradient(135deg,${C.emas},${C.emasM})`,padding:"12px 28px",textDecoration:"none",clipPath:"polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)"}}>
              Tambah Sekarang
            </Link>
          </div>
        )}

        {!loading && !error && grouped.length>0 && (
          <div className="fu d3">
            {grouped.map(([gen, list])=>(
              <div key={gen}>
                <GenHeader
                  gen={gen}
                  directCount={list.filter(p=>!p.isIstri).length}
                  spouseCount={list.filter(p=>p.isIstri).length}
                />
                {list.map((p)=>(
                  <PersonRow
                    key={p.id}
                    person={p}
                    index={personIndices.get(p.id) ?? 0}
                    isAdmin={isAdmin}
                    onDelete={handleDelete}
                    onNavigate={()=>router.push(`/profil/${p.id}`)}
                  />
                ))}
              </div>
            ))}

            {/* Bottom summary */}
            <div style={{marginTop:48,textAlign:"center",padding:"24px",border:`1px solid rgba(201,168,76,.1)`,background:"rgba(26,22,18,.5)"}}>
              <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:12}}>
                <div style={{width:60,height:1,background:`linear-gradient(90deg,transparent,${C.emas})`}}/>
                <div style={{width:6,height:6,background:C.emas,transform:"rotate(45deg)",marginTop:-2}}/>
                <div style={{width:60,height:1,background:`linear-gradient(90deg,${C.emas},transparent)`}}/>
              </div>
              <p style={{fontFamily:"'Cinzel Decorative',cursive",fontSize:"0.85rem",color:C.emas,marginBottom:4}}>
                {grouped.length} Generasi Tercatat
              </p>
              <p style={{fontFamily:"'IM Fell English',serif",fontStyle:"italic",fontSize:"0.85rem",color:C.emasT,opacity:.7}}>
                {persons.length} anggota keluarga Simangunsong dalam database
              </p>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:"0.56rem",letterSpacing:"0.25em",color:C.emasT,opacity:.5,marginTop:8,textTransform:"uppercase"}}>
                Horas · Horas · Horas
              </p>
            </div>
          </div>
        )}
      </div>

      <UlosBorder/>
    </div>
  );
}