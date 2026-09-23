import fs from 'fs'
import path from 'path'
import { transformSync } from 'esbuild'
import JavaScriptObfuscator from 'javascript-obfuscator'

const SRC_DIR = path.resolve('src')

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath)

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file)
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles)
    } else {
      if (/\.(jsx?|tsx?)$/.test(file)) {
        arrayOfFiles.push(fullPath)
      }
    }
  })

  return arrayOfFiles
}

console.log('Starting in-place obfuscation of all source files in src/...')
const targetFiles = getAllFiles(SRC_DIR)
let obfuscatedCount = 0

targetFiles.forEach((filePath) => {
  const relPath = path.relative(SRC_DIR, filePath)
  console.log(`[Obfuscating] src/${relPath}...`)

  try {
    const rawContent = fs.readFileSync(filePath, 'utf-8')
    const loader = filePath.endsWith('.ts') ? 'ts' : filePath.endsWith('.tsx') ? 'tsx' : 'jsx'

    // Step 1: Transpile JSX/TS into standard ES JavaScript
    const transpiled = transformSync(rawContent, {
      loader,
      jsx: 'automatic',
      target: 'es2020',
      format: 'esm'
    })

    // Step 2: Obfuscate the transpiled JavaScript
    const obfuscated = JavaScriptObfuscator.obfuscate(transpiled.code, {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.75,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.3,
      debugProtection: false,
      disableConsoleOutput: false,
      identifierNamesGenerator: 'hexadecimal',
      log: false,
      numbersToExpressions: true,
      renameGlobals: false,
      selfDefending: true,
      simplify: true,
      splitStrings: true,
      splitStringsChunkLength: 10,
      stringArray: true,
      stringArrayCallsTransform: true,
      stringArrayCallsTransformThreshold: 0.75,
      stringArrayEncoding: ['base64'],
      stringArrayIndexShift: true,
      stringArrayRotate: true,
      stringArrayShuffle: true,
      stringArrayWrappersCount: 2,
      stringArrayWrappersChainedCalls: true,
      stringArrayWrappersParametersMaxCount: 4,
      stringArrayWrappersType: 'function',
      stringArrayThreshold: 0.75,
      unicodeEscapeSequence: false
    })

    // Step 3: Overwrite the source file with obfuscated JavaScript
    fs.writeFileSync(filePath, obfuscated.getObfuscatedCode(), 'utf-8')
    obfuscatedCount++
  } catch (err) {
    console.error(`Error obfuscating ${relPath}:`, err)
  }
})

console.log(`Successfully obfuscated ${obfuscatedCount} source files in src/!`)
