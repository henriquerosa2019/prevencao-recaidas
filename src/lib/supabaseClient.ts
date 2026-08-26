import { createClient } from '@supabase/supabase-js'

// 🔌 Conexão com o Supabase (projeto "AA On Line").
//
// ⚠️ Por que os valores estão aqui no código, e não só nas variáveis de
// ambiente: o build publicado na Vercel estava apontando para um projeto
// Supabase antigo/inexistente (bagwmkoirrqcegxdpnhy), o que derrubava login,
// cadastro e redefinição de senha com "Failed to fetch"/ERR_NAME_NOT_RESOLVED.
// Como o Vite "assa" essas variáveis dentro do JavaScript no momento do build,
// uma variável errada na Vercel quebra o app inteiro em produção.
//
// Estes dois valores são públicos por natureza — a chave "anon" é feita para
// ficar visível no navegador; quem protege os dados é o RLS no banco, não o
// segredo da chave. Manter o padrão aqui garante que o app funcione mesmo se
// a variável de ambiente estiver ausente ou errada.
//
// As variáveis de ambiente continuam tendo prioridade: se um dia você quiser
// apontar para outro projeto (staging, por exemplo), basta definir
// VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY que elas vencem o padrão abaixo.

const SUPABASE_URL_PADRAO = 'https://pyydnicvltkioovtvzfk.supabase.co'
const SUPABASE_ANON_KEY_PADRAO =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5eWRuaWN2bHRraW9vdnR2emZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNTUwMzEsImV4cCI6MjA5MDYzMTAzMX0.-_d2zNCPnoNPJBaGnc2JUmq_uj2Xi7FUETQC-ViQ4Ew'

// Só aceitamos a variável de ambiente se ela apontar para um projeto Supabase
// de verdade — assim um valor vazio ou colado errado não derruba o app.
const urlDoAmbiente = import.meta.env.VITE_SUPABASE_URL as string | undefined
const chaveDoAmbiente = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

const ambienteValido =
  typeof urlDoAmbiente === 'string' &&
  urlDoAmbiente.startsWith('https://') &&
  urlDoAmbiente.includes('.supabase.co') &&
  typeof chaveDoAmbiente === 'string' &&
  chaveDoAmbiente.length > 20

const supabaseUrl = ambienteValido ? urlDoAmbiente! : SUPABASE_URL_PADRAO
const supabaseAnonKey = ambienteValido ? chaveDoAmbiente! : SUPABASE_ANON_KEY_PADRAO

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
