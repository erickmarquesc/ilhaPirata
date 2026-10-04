import * as THREE from 'three';
import { useBrilho, useMaterial } from '../materiais.jsx';
import Peca from '../Peca.jsx';

// ===================== Jangada → barco pirata =====================
// 1 jangada de troncos · 2 jangada reforçada · 3 bote de tábuas · 4 chalupa · 5 barco pirata
// A proa aponta para +X (a cena gira o barco para o rumo em que ele navega).
// A origem fica na linha d'água.

const MADEIRA = '#8b5a2b', MADEIRA_CLARA = '#a06a35', MADEIRA_ESCURA = '#5a3a1c', CORDA = '#d9c38a';
const PANO = '#efe6cf', CONVES = '#b08250', OURO = '#f5c84c', PRETO = '#1a1a1a';

// Altura do convés (onde a tripulação fica em pé) em cada nível
const CONVES_POR_NIVEL = [4.6, 5.2, 4.4, 5.6, 7];
export function alturaDoConves(nivel = 1) { return CONVES_POR_NIVEL[Math.min(nivel, 5) - 1]; }

// ---------- Casco visto de cima: popa reta, laterais e proa pontuda, extrudado para cima ----------
const cascos = new Map();
function formaDoCasco(L, W, recuo = 0) {
  const meio = W / 2 - recuo, popa = -L / 2 + recuo, inicioProa = L / 6, proa = L / 2 - recuo * 1.5;
  const f = new THREE.Shape();
  f.moveTo(popa, -meio * 0.85);
  f.lineTo(inicioProa, -meio);
  f.quadraticCurveTo(proa * 0.92, -meio * 0.8, proa, 0);
  f.quadraticCurveTo(proa * 0.92, meio * 0.8, inicioProa, meio);
  f.lineTo(popa, meio * 0.85);
  f.closePath();
  return f;
}
// depth = altura; girado para a extrusão ficar em pé (base em y=0)
function geoCasco(L, W, H) {
  const chave = `${L}:${W}:${H}`;
  if (!cascos.has(chave)) {
    cascos.set(chave, {
      casco: new THREE.ExtrudeGeometry(formaDoCasco(L, W), { depth: H, bevelEnabled: false }).rotateX(-Math.PI / 2),
      conves: new THREE.ShapeGeometry(formaDoCasco(L, W, 1.6)).rotateX(-Math.PI / 2),
      amurada: (() => {
        const anel = formaDoCasco(L, W);
        anel.holes.push(formaDoCasco(L, W, 1.2));
        return new THREE.ExtrudeGeometry(anel, { depth: 2.4, bevelEnabled: false }).rotateX(-Math.PI / 2);
      })(),
    });
  }
  return cascos.get(chave);
}

function Casco({ L, W, H, cor, faixa = null, faixaOuro = false }) {
  const mat = useMaterial();
  const g = geoCasco(L, W, H);
  const fundo = -H * 0.4; // parte do casco fica dentro d'água
  return (
    <group position={[0, fundo, 0]}>
      <mesh geometry={g.casco} material={mat(cor)} castShadow receiveShadow />
      {faixa && <mesh geometry={g.amurada} material={mat(faixaOuro ? OURO : faixa)} position={[0, H * 0.55, 0]} scale={[1.005, 0.35, 1.005]} />}
      <mesh geometry={g.conves} material={mat(CONVES)} position={[0, H + 0.05, 0]} receiveShadow />
      <mesh geometry={g.amurada} material={mat(MADEIRA_ESCURA)} position={[0, H, 0]} castShadow />
    </group>
  );
}

// Vela quadrada pendurada numa verga (atravessada no barco)
function VelaQuadrada({ y, largura, altura, cor = PANO, listrada = false }) {
  return (
    <group position={[0, y, 0]}>
      <Peca geo="cilindro" cor={MADEIRA_ESCURA} p={[0, altura / 2 + 0.6, 0]} s={[0.6, largura + 4, 0.6]} r={[Math.PI / 2, 0, 0]} />
      <Peca cor={cor} p={[0.8, 0, 0]} s={[0.5, altura, largura]} r={[0, 0, -0.08]} />
      {listrada && [-altura / 4, altura / 4].map(dy => (
        <Peca key={dy} cor="#7a2a22" p={[1.1, dy, 0]} s={[0.3, altura / 7, largura]} r={[0, 0, -0.08]} sombra={false} />
      ))}
    </group>
  );
}
function Mastro({ x = 0, altura, children }) {
  return (
    <group position={[x, 0, 0]}>
      <Peca geo="cilindro" cor={MADEIRA_ESCURA} p={[0, altura / 2, 0]} s={[1.3, altura, 1.3]} />
      {children}
    </group>
  );
}
function Barril({ p }) {
  return (
    <group position={p}>
      <Peca geo="cilindro" cor="#8a5a30" p={[0, 2.5, 0]} s={[2.4, 5, 2.4]} />
      {[1.2, 3.8].map(y => <Peca key={y} geo="cilindro" cor="#3a2a1a" p={[0, y, 0]} s={[2.55, 0.5, 2.55]} sombra={false} />)}
    </group>
  );
}
function Bandeira({ p, tam = 1 }) {
  return (
    <group position={p} scale={tam}>
      <Peca cor={PRETO} p={[3.2, 0, 0]} s={[6.4, 4.2, 0.3]} sombra={false} />
      <Peca geo="bola" cor="#f2f2f2" p={[3.2, 0.5, 0.25]} s={0.9} sombra={false} />
      <Peca cor="#f2f2f2" p={[3.2, -0.9, 0.25]} s={[2.8, 0.4, 0.2]} r={[0, 0, 0.6]} sombra={false} />
      <Peca cor="#f2f2f2" p={[3.2, -0.9, 0.25]} s={[2.8, 0.4, 0.2]} r={[0, 0, -0.6]} sombra={false} />
    </group>
  );
}
function Lanterna({ p }) {
  const luz = useBrilho('#ffcf6a', 1.6);
  return (
    <group position={p}>
      <mesh geometry={geoLuz} material={luz} scale={[1, 1.4, 1]} />
      <Peca geo="telhado" cor="#2a2a2a" p={[0, 1.8, 0]} s={[1.8, 1.2, 1.8]} sombra={false} />
    </group>
  );
}
const geoLuz = new THREE.IcosahedronGeometry(1, 0);

// ---------- Nível 1: jangada de troncos (com as etapas da obra) ----------
const geoVelaTriangular = new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(2, 42), new THREE.Vector2(24, 14), new THREE.Vector2(2, 10)]));
function JangadaTroncos({ progresso }) {
  const mat = useMaterial();
  const troncos = 6;
  const pTroncos = Math.min(progresso / 0.7, 1);
  const visiveis = Math.ceil(troncos * pTroncos);
  const pMastro = progresso > 0.7 ? Math.min((progresso - 0.7) / 0.3, 1) : 0;
  return (
    <group>
      {Array.from({ length: visiveis }, (_, i) => (
        <Peca key={i} geo="cilindro" cor={i % 2 ? MADEIRA_CLARA : MADEIRA} p={[0, 2.4, -11 + i * 4.4]} s={[2.3, 54, 2.3]} r={[0, 0, Math.PI / 2]} />
      ))}
      {pTroncos >= 1 && [-19, 19].map(x => <Peca key={x} cor={CORDA} p={[x, 4.6, 0]} s={[1.6, 1, 27]} sombra={false} />)}
      {pMastro > 0 && <Peca geo="cilindro" cor={MADEIRA_ESCURA} p={[0, 4 + 22 * pMastro, 0]} s={[1.4, 44 * pMastro, 1.4]} />}
      {pMastro >= 1 && <mesh geometry={geoVelaTriangular} material={mat(PANO, true)} position={[0, 4, 0]} castShadow />}
    </group>
  );
}

// ---------- Nível 2: jangada reforçada ----------
function JangadaReforcada() {
  return (
    <group>
      {Array.from({ length: 8 }, (_, i) => (
        <Peca key={i} geo="cilindro" cor={i % 2 ? MADEIRA_CLARA : MADEIRA} p={[0, 2.6, -15.4 + i * 4.4]} s={[2.4, 62, 2.4]} r={[0, 0, Math.PI / 2]} />
      ))}
      {[-24, 0, 24].map(x => <Peca key={x} cor={CORDA} p={[x, 5, 0]} s={[1.6, 1, 36]} sombra={false} />)}
      {/* amurada de estacas */}
      {[-17, 17].map(z => Array.from({ length: 7 }, (_, i) => (
        <Peca key={`${z}${i}`} cor={MADEIRA_ESCURA} p={[-27 + i * 9, 7, z]} s={[1.2, 5, 1.2]} />
      )))}
      {[-17, 17].map(z => <Peca key={`c${z}`} cor={MADEIRA} p={[0, 9, z]} s={[56, 1, 1]} />)}
      <Mastro altura={40}>
        <VelaQuadrada y={24} largura={24} altura={22} />
      </Mastro>
      {/* remo-leme na popa */}
      <Peca cor={MADEIRA_ESCURA} p={[-33, 3, 0]} s={[14, 1, 1]} r={[0, 0, 0.35]} />
      <Peca cor={MADEIRA} p={[-39, 0.8, 0]} s={[5, 0.6, 3.2]} r={[0, 0, 0.35]} />
      <Barril p={[16, 4, -9]} />
    </group>
  );
}

// ---------- Nível 3: bote de tábuas ----------
function Bote() {
  return (
    <group>
      <Casco L={64} W={22} H={7} cor={MADEIRA} faixa="#6b3f1f" />
      <Mastro x={4} altura={44}>
        <VelaQuadrada y={28} largura={24} altura={22} />
      </Mastro>
      {/* remos dos dois lados */}
      {[-1, 1].map(l => (
        <group key={l}>
          <Peca cor={MADEIRA_ESCURA} p={[-8, 3, l * 14]} s={[1, 1, 14]} r={[l * 0.5, 0, 0]} />
          <Peca cor={MADEIRA} p={[-8, 0, l * 20]} s={[3, 0.5, 5]} r={[l * 0.5, 0, 0]} />
        </group>
      ))}
      <Barril p={[-20, 4.2, -5]} />
      <Peca cor={MADEIRA_ESCURA} p={[-27, 5, 0]} s={[4, 3, 14]} />
    </group>
  );
}

// ---------- Nível 4: chalupa ----------
const geoBujarrona = new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(34, 2), new THREE.Vector2(0, 40)]));
function Chalupa() {
  const mat = useMaterial();
  return (
    <group>
      <Casco L={76} W={26} H={9} cor="#7a4a24" faixa="#c9a24a" />
      {/* gurupés e bujarrona */}
      <Peca geo="cilindro" cor={MADEIRA_ESCURA} p={[42, 8, 0]} s={[0.8, 18, 0.8]} r={[0, 0, -1.25]} />
      <mesh geometry={geoBujarrona} material={mat(PANO, true)} position={[6, 9, 0]} castShadow />
      <Mastro x={6} altura={52}>
        <VelaQuadrada y={34} largura={28} altura={26} />
      </Mastro>
      {/* cabine na popa */}
      <group position={[-24, 5.4, 0]}>
        <Peca cor={MADEIRA_CLARA} p={[0, 4, 0]} s={[16, 8, 18]} />
        <Peca cor={MADEIRA_ESCURA} p={[0, 8.6, 0]} s={[18, 1.2, 20]} />
        <Peca cor="#3a4a52" p={[8.2, 4.5, -4]} s={[0.4, 3, 3]} sombra={false} />
        <Peca cor="#3a4a52" p={[8.2, 4.5, 4]} s={[0.4, 3, 3]} sombra={false} />
      </group>
      <Lanterna p={[-34, 16, 0]} />
      <Barril p={[20, 5.4, -7]} />
      <Barril p={[22, 5.4, 6]} />
    </group>
  );
}

// ---------- Nível 5: barco pirata ----------
function Canhoes() {
  return [-1, 1].map(l => [-18, -2, 14].map(x => (
    <group key={`${l}${x}`} position={[x, 7.4, l * 15.4]}>
      <Peca cor="#2a1a10" s={[4.6, 3.4, 1.2]} sombra={false} />
      <Peca geo="cilindro" cor="#2b2b2b" p={[0, 0, l * 2.4]} s={[1.1, 4.2, 1.1]} r={[Math.PI / 2, 0, 0]} />
    </group>
  )));
}
function NavioPirata() {
  const ouro = useBrilho(OURO, 0.5);
  return (
    <group>
      <Casco L={90} W={32} H={11} cor="#3d2618" faixa={OURO} faixaOuro />
      <Canhoes />
      {/* castelo de popa */}
      <group position={[-30, 6.6, 0]}>
        <Peca cor="#4a2e1c" p={[0, 5, 0]} s={[22, 10, 24]} />
        <Peca cor="#b08250" p={[0, 10.2, 0]} s={[22, 0.6, 24]} sombra={false} />
        {[-9, 9].map(z => <Peca key={z} cor={MADEIRA_ESCURA} p={[0, 11.8, z + Math.sign(z) * 2.6]} s={[22, 2.6, 0.8]} />)}
        {/* janelas douradas na popa */}
        {[-6, 0, 6].map(z => <Peca key={z} cor={OURO} p={[-11.2, 5, z]} s={[0.6, 3.6, 3.2]} sombra={false} />)}
        <Lanterna p={[-12, 15, 0]} />
      </group>
      {/* gurupés e figura de proa dourada */}
      <Peca geo="cilindro" cor={MADEIRA_ESCURA} p={[50, 10, 0]} s={[0.9, 20, 0.9]} r={[0, 0, -1.2]} />
      <mesh geometry={geoLuz} material={ouro} position={[46, 6, 0]} scale={[2.6, 2, 1.8]} />
      {/* mastro de proa */}
      <Mastro x={20} altura={54}>
        <VelaQuadrada y={24} largura={30} altura={18} listrada />
        <VelaQuadrada y={43} largura={24} altura={14} listrada />
      </Mastro>
      {/* mastro principal com cesto de gávea e bandeira pirata */}
      <Mastro x={-4} altura={66}>
        <VelaQuadrada y={26} largura={34} altura={20} listrada />
        <VelaQuadrada y={48} largura={28} altura={16} listrada />
        <group position={[0, 58, 0]}>
          <Peca geo="cilindro" cor="#8a5a30" s={[4.4, 4, 4.4]} />
          <Peca geo="cilindro" cor="#3a2a1a" p={[0, 1.8, 0]} s={[4.6, 0.6, 4.6]} sombra={false} />
        </group>
        <Bandeira p={[0, 70, 0]} tam={1.4} />
      </Mastro>
      <Barril p={[10, 6.6, -9]} />
      <Barril p={[10, 6.6, 9]} />
    </group>
  );
}

export function Jangada({ progresso = 1, est = null }) {
  const nivel = est?.nivel ?? 1;
  if (nivel >= 5) return <NavioPirata />;
  if (nivel === 4) return <Chalupa />;
  if (nivel === 3) return <Bote />;
  if (nivel === 2) return <JangadaReforcada />;
  return <JangadaTroncos progresso={progresso} />;
}
