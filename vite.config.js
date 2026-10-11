import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''

  return {
    base: '/PK-Khmer-Type/',
    plugins: [
      {
        name: 'pk-inject-vite-env',
        transformIndexHtml(html) {
          const scriptTag = `<script>window.__PK_VITE_ENV__ = Object.assign({}, window.__PK_VITE_ENV__ || {}, ${JSON.stringify({
            VITE_SUPABASE_URL: supabaseUrl,
            VITE_SUPABASE_ANON_KEY: supabaseAnonKey
          })});</script>`
          return html.replace('</head>', `  ${scriptTag}\n</head>`)
        }
      }
    ]
  }
})
