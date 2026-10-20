// Capturas de LexSearch con datos ficticios (cliente, expediente y plazo inventados cargados en la base local de desarrollo).
// Se sacan con Edge sin ventana contra http://localhost:5180 (prefijo s- en la carpeta); este script solo las recorta
// (para dejar afuera la biblioteca y los borradores reales de la usuaria) y pasa a WebP.
// Uso: node tools/make-lexsearch.mjs <carpeta-con-los-png>
import sharp from 'sharp';

const dir = process.argv[2];
if (!dir) throw new Error('Indicá la carpeta con los PNG');
// [png, salida, alto del recorte]. Biblioteca y borradores se cortan antes de la lista: ahí están los documentos y borradores reales.
for (const [file, out, height] of [
  ['s-biblioteca.png', 'biblioteca', 340],
  ['s-cliente-ficha.png', 'cliente', 1230],
  ['s-expedientes.png', 'expedientes', 300],
  ['s-timeline.png', 'expediente', 1530],
  ['s-expediente-editar.png', 'expediente-datos', 650],
  ['s-documentos.png', 'expediente-documentos', 710],
  ['s-plazos.png', 'plazos', 300],
  ['s-plazo-nuevo.png', 'plazo-nuevo', 830],
  ['s-plazo-detalle.png', 'plazo', 760],
  ['s-inhabiles.png', 'inhabiles', 1050],
  ['s-borradores.png', 'borradores', 665],
  // Con IA (Gemini), sobre documentos y datos inventados cargados en la base local; no se guardó nada de lo que se propone en pantalla.
  ['s-consulta.png', 'consultar-respuesta', 1010],
  ['s-importar.png', 'importar-actuaciones', 1220],
  ['s-contradicciones.png', 'contradicciones', 1305],
  ['s-borrador.png', 'borrador-generado', 880],
  ['s-estimador.png', 'estimador', 1500],
  ['s-audiencia-3.png', 'audiencia-devolucion', 1240],
  ['s-normativa-avisos.png', 'normativa-avisos', 1000],
  ['s-normativa-boletin.png', 'normativa-boletin', 830],
]) {
  const info = await sharp(`${dir}/${file}`).extract({ left: 0, top: 0, width: 1400, height }).webp({ quality: 84 }).toFile(`src/assets/lexsearch/${out}.webp`);
  console.log(`${out} ${info.width}x${info.height}`);
}
