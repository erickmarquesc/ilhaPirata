import Peca from '../Peca.jsx';

// ===================== Animais fofos =====================
// Modelos em escala de raio 1 (quem chama aplica o raio), frente virada para +X.
// Cada parte que se mexe é um grupo com pivô na articulação, registrado no "rig":
//   rig.corpo, rig.cabeca, rig.cauda, rig.pernas[], rig.asas[], rig.olhos[]
// A animação (andar, pastar, piscar...) fica em AnimalAnimado.

const BOCHECHA = '#ffb3c1', PUPILA = '#1c1410';

// Liga um ref de callback a um campo do rig (ou a uma lista dele)
const ligar = (rig, campo, i) => el => {
  if (i === undefined) rig[campo] = el;
  else (rig[campo] ||= [])[i] = el;
};

// Olho grande com brilhinho (o grupo é que pisca)
function Olho({ rig, i, p, tam = 0.11 }) {
  return (
    <group ref={ligar(rig, 'olhos', i)} position={p}>
      <Peca geo="bolaLisa" cor="#ffffff" s={tam} sombra={false} />
      <Peca geo="bolaLisa" cor={PUPILA} p={[tam * 0.55, 0, 0]} s={tam * 0.72} sombra={false} />
      <Peca geo="bolaLisa" cor="#ffffff" p={[tam * 1.15, tam * 0.3, tam * 0.25]} s={tam * 0.22} sombra={false} />
    </group>
  );
}

function Rosto({ rig, x, y = 0.08, z = 0.18, tam, bochecha = true }) {
  return (
    <>
      <Olho rig={rig} i={0} p={[x, y, z]} tam={tam} />
      <Olho rig={rig} i={1} p={[x, y, -z]} tam={tam} />
      {bochecha && [z + 0.07, -z - 0.07].map(bz => (
        <Peca key={bz} geo="bolaLisa" cor={BOCHECHA} p={[x - 0.02, y - 0.15, bz]} s={[0.04, 0.05, 0.07]} sombra={false} />
      ))}
    </>
  );
}

// Perna com pivô no quadril (gira em Z para dar o passo)
function Perna({ rig, i, p, altura, raio, cor, casco }) {
  return (
    <group ref={ligar(rig, 'pernas', i)} position={p}>
      <Peca geo="cilindro" cor={cor} p={[0, -altura / 2, 0]} s={[raio, altura, raio]} />
      {casco && <Peca geo="cilindro" cor={casco} p={[0, -altura + 0.05, 0]} s={[raio * 1.15, 0.1, raio * 1.15]} sombra={false} />}
    </group>
  );
}

function Orelha({ lado, p, cor, dentro = BOCHECHA, tam = 1 }) {
  return (
    <group position={[p[0], p[1], p[2] * lado]} rotation={[lado * 0.9, 0, 0.2]}>
      <Peca geo="bolaLisa" cor={cor} s={[0.07 * tam, 0.1 * tam, 0.2 * tam]} />
      <Peca geo="bolaLisa" cor={dentro} p={[0.03, 0, 0]} s={[0.04 * tam, 0.065 * tam, 0.13 * tam]} sombra={false} />
    </group>
  );
}

// ===================== Ovelha / carneiro / cordeiro =====================
const TUFOS = [
  [0, 0.42, 0], [0.42, 0.25, 0.3], [0.42, 0.25, -0.3], [-0.42, 0.28, 0.3], [-0.42, 0.28, -0.3],
  [0, 0.15, 0.55], [0, 0.15, -0.55], [-0.75, 0.15, 0], [0.55, 0.05, 0], [0.15, 0.38, 0.35], [-0.2, 0.4, -0.3],
];
function Ovelha({ an, rig, filhote }) {
  const macho = an.sexo === 'm';
  const la = filhote ? '#fbf8f0' : macho ? '#e9e1cf' : '#f6f4ee';
  const rosto = macho ? '#5a4a3a' : '#4a4040';
  return (
    <group>
      {[[0.45, 0.3], [0.45, -0.3], [-0.45, 0.3], [-0.45, -0.3]].map(([x, z], i) => (
        <Perna key={i} rig={rig} i={i} p={[x, 0.6, z]} altura={0.6} raio={0.12} cor="#3a3434" />
      ))}
      <group ref={ligar(rig, 'corpo')} position={[0, 0.98, 0]}>
        <Peca geo="bolaLisa" cor={la} s={[0.95, 0.72, 0.72]} />
        {TUFOS.map(([x, y, z], i) => <Peca key={i} geo="bolaLisa" cor={la} p={[x, y, z]} s={0.36 + (i % 3) * 0.05} />)}
        <group ref={ligar(rig, 'cauda')} position={[-0.92, 0.1, 0]}>
          <Peca geo="bolaLisa" cor={la} s={0.2} />
        </group>
      </group>
      <group ref={ligar(rig, 'cabeca')} position={[0.85, 1.3, 0]} scale={filhote ? 1.6 : 1.35}>
        <Peca geo="bolaLisa" cor={rosto} p={[0.12, 0, 0]} s={[0.36, 0.34, 0.33]} />
        <Peca geo="bolaLisa" cor={la} p={[0.02, 0.27, 0]} s={0.22} />
        <Peca geo="bolaLisa" cor={la} p={[0.08, 0.24, 0.13]} s={0.15} />
        <Peca geo="bolaLisa" cor={la} p={[0.08, 0.24, -0.13]} s={0.15} />
        <Orelha lado={1} p={[0.02, 0.05, 0.36]} cor={rosto} />
        <Orelha lado={-1} p={[0.02, 0.05, 0.36]} cor={rosto} />
        <Rosto rig={rig} x={0.36} y={0.1} z={0.15} tam={0.12} />
        {macho && !filhote && [1, -1].map(l => (
          <Peca key={l} geo="rosca" cor="#c9b48a" p={[0, 0.12, 0.3 * l]} s={0.15} r={[0, 0, 0]} />
        ))}
      </group>
    </group>
  );
}

// ===================== Vaca / touro / bezerro =====================
function Vaca({ an, rig, filhote }) {
  const macho = an.sexo === 'm';
  const pelo = macho ? '#7a4a2a' : '#f7f5f0';
  const mancha = macho ? '#5a3418' : '#2a2a2a';
  return (
    <group>
      {[[0.5, 0.32], [0.5, -0.32], [-0.5, 0.32], [-0.5, -0.32]].map(([x, z], i) => (
        <Perna key={i} rig={rig} i={i} p={[x, 0.68, z]} altura={0.68} raio={0.14} cor={pelo} casco="#3a2a20" />
      ))}
      <group ref={ligar(rig, 'corpo')} position={[0, 1.05, 0]}>
        <Peca geo="bolaLisa" cor={pelo} s={[1.0, 0.6, 0.6]} />
        <Peca geo="bolaLisa" cor={mancha} p={[0.1, 0.25, 0.42]} s={[0.32, 0.25, 0.12]} sombra={false} />
        <Peca geo="bolaLisa" cor={mancha} p={[-0.45, 0.05, -0.45]} s={[0.28, 0.22, 0.1]} sombra={false} />
        <Peca geo="bolaLisa" cor={mancha} p={[-0.2, 0.4, -0.2]} s={[0.25, 0.12, 0.2]} sombra={false} />
        {!macho && !filhote && <Peca geo="bolaLisa" cor="#f2b3b8" p={[-0.25, -0.5, 0]} s={[0.16, 0.12, 0.16]} sombra={false} />}
        {/* rabo pendurado com tufo; pivô na base */}
        <group ref={ligar(rig, 'cauda')} position={[-0.95, 0.25, 0]}>
          <Peca geo="cilindro" cor={pelo} p={[0, -0.32, 0]} s={[0.04, 0.64, 0.04]} sombra={false} />
          <Peca geo="bolaLisa" cor={mancha} p={[0, -0.66, 0]} s={[0.08, 0.12, 0.08]} sombra={false} />
        </group>
      </group>
      <group ref={ligar(rig, 'cabeca')} position={[0.98, 1.45, 0]} scale={filhote ? 1.6 : 1.35}>
        <Peca geo="bolaLisa" cor={pelo} p={[0.08, 0, 0]} s={[0.38, 0.36, 0.35]} />
        <Peca geo="bolaLisa" cor="#f0b8b0" p={[0.36, -0.13, 0]} s={[0.17, 0.16, 0.26]} />
        {[0.09, -0.09].map(z => <Peca key={z} geo="bolaLisa" cor="#7a4a44" p={[0.52, -0.1, z]} s={0.035} sombra={false} />)}
        {macho && !filhote && <Peca geo="rosca" cor="#e6b84a" p={[0.53, -0.2, 0]} s={0.07} r={[0, Math.PI / 2, 0]} sombra={false} />}
        <Orelha lado={1} p={[-0.02, 0.12, 0.38]} cor={pelo} tam={1.1} />
        <Orelha lado={-1} p={[-0.02, 0.12, 0.38]} cor={pelo} tam={1.1} />
        {[1, -1].map(l => (
          <Peca key={l} geo="cone" cor="#f3ead2" p={[-0.02, 0.36, 0.2 * l]} s={macho ? [0.06, 0.28, 0.06] : [0.04, 0.14, 0.04]} r={[l * (macho ? -0.6 : -0.3), 0, 0]} sombra={false} />
        ))}
        <Rosto rig={rig} x={0.3} y={0.12} z={0.19} tam={0.115} />
      </group>
    </group>
  );
}

// ===================== Galinha / galo / pintinho =====================
function Galinha({ an, rig, filhote }) {
  const macho = an.sexo === 'm' && !filhote;
  const pena = filhote ? '#ffe27a' : macho ? '#c8642a' : '#fbfbf7';
  const asa = filhote ? '#ffd65a' : macho ? '#8a3a1a' : '#ece8de';
  return (
    <group>
      {[0.16, -0.16].map((z, i) => (
        <Perna key={i} rig={rig} i={i} p={[0, 0.45, z]} altura={0.45} raio={0.06} cor="#f0a030" />
      ))}
      <group ref={ligar(rig, 'corpo')} position={[0, 0.85, 0]}>
        <Peca geo="bolaLisa" cor={pena} s={[0.72, 0.62, 0.6]} />
        {[1, -1].map((l, i) => (
          <group key={l} ref={ligar(rig, 'asas', i)} position={[-0.05, 0.05, 0.55 * l]}>
            <Peca geo="bolaLisa" cor={asa} p={[-0.05, 0, 0]} s={[0.42, 0.28, 0.1]} sombra={false} />
          </group>
        ))}
        <group ref={ligar(rig, 'cauda')} position={[-0.62, 0.25, 0]}>
          {filhote ? (
            <Peca geo="bolaLisa" cor={pena} s={0.14} />
          ) : macho ? (
            [['#1f5a3a', 0.5, 0], ['#2a2a2a', 0.85, 0.12], ['#c8642a', 0.2, -0.12]].map(([cor, rz, z], i) => (
              <Peca key={i} geo="bolaLisa" cor={cor} p={[-0.15, 0.3, z]} s={[0.16, 0.48, 0.07]} r={[0, 0, rz]} sombra={false} />
            ))
          ) : (
            <Peca geo="cone" cor={pena} p={[-0.05, 0.12, 0]} s={[0.18, 0.4, 0.14]} r={[0, 0, 0.6]} sombra={false} />
          )}
        </group>
      </group>
      <group ref={ligar(rig, 'cabeca')} position={[0.45, 1.45, 0]} scale={filhote ? 1.55 : 1.25}>
        <Peca geo="bolaLisa" cor={pena} s={0.34} />
        <Peca geo="cone" cor="#f5a623" p={[0.38, -0.04, 0]} s={[0.07, 0.18, 0.07]} r={[0, 0, -Math.PI / 2]} sombra={false} />
        {!filhote && (
          <>
            {[[-0.08, 0.32], [0.04, 0.37], [0.16, 0.32]].map(([x, y], i) => (
              <Peca key={i} geo="bolaLisa" cor="#e02a2a" p={[x, y, 0]} s={macho ? 0.11 : 0.07} sombra={false} />
            ))}
            <Peca geo="bolaLisa" cor="#e02a2a" p={[0.28, -0.2, 0]} s={[0.05, macho ? 0.11 : 0.07, 0.05]} sombra={false} />
          </>
        )}
        <Rosto rig={rig} x={0.24} y={0.08} z={0.17} tam={0.095} bochecha={!macho} />
      </group>
    </group>
  );
}

export const MODELOS_ANIMAL = { ovelha: Ovelha, vaca: Vaca, galinha: Galinha };
