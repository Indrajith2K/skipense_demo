import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import JavaScriptObfuscator from 'javascript-obfuscator'

function obfuscatorPlugin() {
  return {
    name: 'vite-plugin-obfuscator',
    apply: 'build',
    enforce: 'post',
    generateBundle(options, bundle) {
      for (const fileName in bundle) {
        const file = bundle[fileName]
        if (file.type === 'chunk' && fileName.endsWith('.js')) {
          console.log(`[Obfuscator] Scrambling & encrypting ${fileName}...`)
          const obfuscatedResult = JavaScriptObfuscator.obfuscate(file.code, {
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 0.75,
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 0.4,
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
          file.code = obfuscatedResult.getObfuscatedCode()
        }
      }
    }
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    obfuscatorPlugin()
  ],
})

