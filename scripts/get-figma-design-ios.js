/**
 * Script para obtener el diseño de Figma y generar código iOS
 * 
 * Este script obtiene el diseño desde Figma usando la API
 * y genera código Swift/SwiftUI basado en el diseño
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ID del archivo y nodo de Figma
const FIGMA_FILE_KEY = '4l79MXXTlHHEl3IadjqtuL';
const NODE_ID = '3-5'; // node-id del enlace

// Token de API de Figma
const FIGMA_TOKEN = process.env.FIGMA_TOKEN || '';

if (!FIGMA_TOKEN) {
  console.error('❌ Error: Necesitas un token de API de Figma');
  console.log('\n📝 Pasos para obtener el token:');
  console.log('1. Ve a https://www.figma.com/developers/api#access-tokens');
  console.log('2. Crea un nuevo token personal');
  console.log('3. Ejecuta: $env:FIGMA_TOKEN="tu_token"; node scripts/get-figma-design-ios.js');
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

// Función para convertir node-id de URL a ID de API
function convertNodeId(nodeId) {
  // Los node-ids en URLs usan guiones (3-5), pero la API puede necesitar dos puntos (3:5)
  return nodeId.replace(/-/g, ':');
}

// Función para encontrar un nodo por ID
function findNodeById(node, targetId) {
  const apiId = convertNodeId(targetId);
  
  if (node.id === targetId || node.id === apiId || node.id === targetId.replace('-', ':')) {
    return node;
  }
  
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, targetId);
      if (found) return found;
    }
  }
  
  return null;
}

// Función para generar código iOS/SwiftUI desde el diseño
function generateIOSCode(node, designData) {
  let swiftCode = `import SwiftUI

struct LioDesign: View {
    var body: some View {
`;
  
  // Analizar el nodo y generar código SwiftUI
  if (node.type === 'FRAME' || node.type === 'GROUP') {
    swiftCode += `        VStack(alignment: .${node.layoutMode === 'HORIZONTAL' ? 'leading' : 'top'}, spacing: ${node.itemSpacing || 0}) {\n`;
    
    if (node.children) {
      node.children.forEach(child => {
        if (child.type === 'TEXT') {
          swiftCode += `            Text("${child.characters || ''}")\n`;
          if (child.style) {
            swiftCode += `                .font(.system(size: ${child.style.fontSize || 16}))\n`;
            swiftCode += `                .foregroundColor(Color(red: ${child.fills?.[0]?.color?.r || 0}, green: ${child.fills?.[0]?.color?.g || 0}, blue: ${child.fills?.[0]?.color?.b || 0}))\n`;
          }
        } else if (child.type === 'RECTANGLE' || child.type === 'ELLIPSE') {
          swiftCode += `            Rectangle()\n`;
          swiftCode += `                .frame(width: ${child.absoluteBoundingBox?.width || 100}, height: ${child.absoluteBoundingBox?.height || 100})\n`;
          if (child.fills && child.fills[0]) {
            const fill = child.fills[0];
            if (fill.color) {
              swiftCode += `                .fill(Color(red: ${fill.color.r}, green: ${fill.color.g}, blue: ${fill.color.b}))\n`;
            }
          }
        }
      });
    }
    
    swiftCode += `        }\n`;
  } else if (node.type === 'TEXT') {
    swiftCode += `        Text("${node.characters || ''}")\n`;
    if (node.style) {
      swiftCode += `            .font(.system(size: ${node.style.fontSize || 16}))\n`;
    }
  }
  
  swiftCode += `    }
}

#Preview {
    LioDesign()
}
`;
  
  return swiftCode;
}

// Función principal
async function main() {
  try {
    console.log('🚀 Obteniendo diseño desde Figma...\n');
    
    // Obtener el archivo completo
    console.log('📥 Obteniendo información del archivo...');
    const fileData = await figmaRequest(`/v1/files/${FIGMA_FILE_KEY}`);
    
    // Buscar el nodo específico
    console.log(`🔍 Buscando nodo ${NODE_ID}...`);
    let targetNode = null;
    
    function searchNode(node) {
      if (findNodeById(node, NODE_ID)) {
        targetNode = findNodeById(node, NODE_ID);
        return;
      }
      if (node.children) {
        node.children.forEach(child => searchNode(child));
      }
    }
    
    searchNode(fileData.document);
    
    if (!targetNode) {
      console.error('❌ No se encontró el nodo especificado');
      console.log('\n📋 Nodos disponibles en el archivo:');
      function listNodes(node, depth = 0) {
        const indent = '  '.repeat(depth);
        console.log(`${indent}- ${node.name || 'Unnamed'} (ID: ${node.id}, Type: ${node.type})`);
        if (node.children && depth < 3) {
          node.children.forEach(child => listNodes(child, depth + 1));
        }
      }
      listNodes(fileData.document);
      process.exit(1);
    }
    
    console.log(`✅ Nodo encontrado: "${targetNode.name}" (Type: ${targetNode.type})\n`);
    
    // Generar código iOS
    console.log('📱 Generando código iOS/SwiftUI...');
    const iosCode = generateIOSCode(targetNode, fileData);
    
    // Guardar el código
    const outputPath = path.join(__dirname, '..', 'ios', 'LioDesign.swift');
    const iosDir = path.dirname(outputPath);
    
    if (!fs.existsSync(iosDir)) {
      fs.mkdirSync(iosDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, iosCode, 'utf8');
    
    console.log(`\n✅ Código iOS generado en: ${outputPath}`);
    console.log('\n📋 Código generado:');
    console.log('─'.repeat(50));
    console.log(iosCode);
    console.log('─'.repeat(50));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
