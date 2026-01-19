/**
 * Script para obtener el SVG del icono de Lio desde Figma
 * 
 * Uso:
 * 1. Obtén un token de API de Figma desde: https://www.figma.com/developers/api#access-tokens
 * 2. Ejecuta: node scripts/get-figma-svg.js
 * 
 * O establece la variable de entorno:
 * FIGMA_TOKEN=tu_token node scripts/get-figma-svg.js
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ID del archivo de Figma extraído del enlace de Dev Mode
// https://www.figma.com/design/4l79MXXTlHHEl3IadjqtuL/lio?node-id=0-1&m=dev&t=cHqXztQcx3Sr2SnG-1
const FIGMA_FILE_KEY = '4l79MXXTlHHEl3IadjqtuL';
const NODE_ID_FROM_URL = '0-1'; // node-id del enlace (puede necesitar conversión)

// Token de API de Figma (obtener desde https://www.figma.com/developers/api#access-tokens)
const FIGMA_TOKEN = process.env.FIGMA_TOKEN || '';

if (!FIGMA_TOKEN) {
  console.error('❌ Error: Necesitas un token de API de Figma');
  console.log('\n📝 Pasos para obtener el token:');
  console.log('1. Ve a https://www.figma.com/developers/api#access-tokens');
  console.log('2. Crea un nuevo token personal');
  console.log('3. Ejecuta: FIGMA_TOKEN=tu_token node scripts/get-figma-svg.js');
  console.log('\nO establece la variable de entorno en tu sistema.');
  process.exit(1);
}

// Función para hacer peticiones a la API de Figma
function figmaRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.figma.com',
      path: endpoint,
      method: 'GET',
      headers: {
        'X-Figma-Token': FIGMA_TOKEN
      }
    };

    https.get(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Error ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Función para buscar un nodo por nombre o ID
function findNode(node, targetId, targetName = null) {
  // Convertir node-id de URL (0-1) a formato de API si es necesario
  if (node.id === targetId || node.id === targetId.replace('-', ':')) {
    return node;
  }
  
  // Buscar por nombre si se proporciona
  if (targetName && node.name && node.name.toLowerCase().includes(targetName.toLowerCase())) {
    return node;
  }
  
  // Buscar recursivamente en hijos
  if (node.children) {
    for (const child of node.children) {
      const found = findNode(child, targetId, targetName);
      if (found) return found;
    }
  }
  
  return null;
}

// Función para obtener el SVG de un nodo
async function getSVG(nodeIdOrName = null) {
  try {
    // Primero obtenemos la información del archivo
    console.log('📥 Obteniendo información del archivo...');
    const fileData = await figmaRequest(`/v1/files/${FIGMA_FILE_KEY}`);
    
    let targetNodeId = nodeIdOrName || NODE_ID_FROM_URL;
    
    // Si tenemos el node-id de la URL, intentamos encontrarlo en la estructura
    if (fileData.document) {
      console.log('🔍 Buscando el nodo del icono en la estructura del archivo...');
      
      // Buscar nodos que puedan ser el logo (buscar por nombres comunes)
      const possibleNames = ['logo', 'icon', 'lio', 'star', 'estrella'];
      let foundNode = null;
      
      for (const name of possibleNames) {
        foundNode = findNode(fileData.document, targetNodeId, name);
        if (foundNode) {
          console.log(`✅ Nodo encontrado: "${foundNode.name}" (ID: ${foundNode.id})`);
          targetNodeId = foundNode.id;
          break;
        }
      }
      
      // Si no encontramos por nombre, intentar con el ID de la URL
      if (!foundNode) {
        foundNode = findNode(fileData.document, targetNodeId);
        if (foundNode) {
          targetNodeId = foundNode.id;
        }
      }
      
      // Si aún no encontramos, usar el primer frame o el nodo raíz
      if (!foundNode && fileData.document.children && fileData.document.children.length > 0) {
        foundNode = fileData.document.children[0];
        targetNodeId = foundNode.id;
        console.log(`⚠️  Usando el primer frame encontrado: "${foundNode.name}" (ID: ${targetNodeId})`);
      }
    }
    
    // Obtenemos la imagen SVG del nodo
    console.log(`📥 Obteniendo SVG del nodo: ${targetNodeId}...`);
    const imageEndpoint = `/v1/images/${FIGMA_FILE_KEY}?ids=${targetNodeId}&format=svg`;
    const imageData = await figmaRequest(imageEndpoint);
    
    if (imageData.images && imageData.images[targetNodeId]) {
      const svgUrl = imageData.images[targetNodeId];
      console.log('✅ URL del SVG obtenida:', svgUrl);
      
      // Descargamos el SVG
      return new Promise((resolve, reject) => {
        https.get(svgUrl, (res) => {
          let svgData = '';
          res.on('data', (chunk) => {
            svgData += chunk;
          });
          res.on('end', () => {
            resolve(svgData);
          });
        }).on('error', reject);
      });
    } else {
      // Si no funciona con el ID, intentar listar todos los nodos disponibles
      console.log('⚠️  No se pudo obtener el SVG directamente. Nodos disponibles:');
      if (fileData.document) {
        function listNodes(node, depth = 0) {
          const indent = '  '.repeat(depth);
          console.log(`${indent}- ${node.name || 'Unnamed'} (ID: ${node.id}, Type: ${node.type})`);
          if (node.children) {
            node.children.forEach(child => listNodes(child, depth + 1));
          }
        }
        listNodes(fileData.document);
      }
      throw new Error('No se pudo obtener el SVG del nodo. Revisa los nodos disponibles arriba.');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// Función principal
async function main() {
  try {
    console.log('🚀 Iniciando descarga del SVG desde Figma...\n');
    
    const svgContent = await getSVG(NODE_ID);
    
    // Guardamos el SVG
    const outputPath = path.join(__dirname, '..', 'assets', 'frames', 'SVG-LIO-FIGMA.svg');
    fs.writeFileSync(outputPath, svgContent, 'utf8');
    
    console.log(`\n✅ SVG guardado en: ${outputPath}`);
    console.log('\n📋 Contenido del SVG:');
    console.log('─'.repeat(50));
    console.log(svgContent);
    console.log('─'.repeat(50));
    
  } catch (error) {
    console.error('\n❌ Error al obtener el SVG:', error.message);
    process.exit(1);
  }
}

main();
