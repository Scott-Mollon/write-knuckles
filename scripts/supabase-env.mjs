/**
 * Switch / inspect which remote Supabase project the CLI is linked to.
 * Project refs come from VITE_SUPABASE_URL in the env files.
 *
 *   node scripts/supabase-env.mjs status
 *   node scripts/supabase-env.mjs staging
 *   node scripts/supabase-env.mjs prod
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const ENVS = {
  staging: { file: '.env.development', appScript: 'dev' },
  prod: { file: '.env.production', appScript: 'dev:prod' },
}

function parseEnv(filePath) {
  const env = {}
  for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const i = trimmed.indexOf('=')
    if (i === -1) continue
    env[trimmed.slice(0, i).trim()] = trimmed.slice(i + 1).trim()
  }
  return env
}

function projectRefFromUrl(url) {
  const match = url?.match(/^https:\/\/([a-z0-9]+)\.supabase\.co\/?$/i)
  return match?.[1] ?? null
}

function currentLinkedRef() {
  const path = resolve(root, 'supabase/.temp/project-ref')
  if (!existsSync(path)) return null
  return readFileSync(path, 'utf8').trim() || null
}

function resolveEnv(name) {
  const cfg = ENVS[name]
  if (!cfg) {
    console.error(`Unknown env "${name}". Use: staging | prod | status`)
    process.exit(1)
  }
  const filePath = resolve(root, cfg.file)
  if (!existsSync(filePath)) {
    console.error(`Missing ${cfg.file}`)
    process.exit(1)
  }
  const env = parseEnv(filePath)
  const ref = projectRefFromUrl(env.VITE_SUPABASE_URL)
  if (!ref) {
    console.error(`Could not parse project ref from VITE_SUPABASE_URL in ${cfg.file}`)
    process.exit(1)
  }
  return { ...cfg, name, env, ref, filePath }
}

function status() {
  const linked = currentLinkedRef()
  console.log(`Supabase CLI linked: ${linked ?? '(none)'}\n`)

  for (const name of Object.keys(ENVS)) {
    const { file, ref, env, appScript } = resolveEnv(name)
    const current = linked && linked === ref
    console.log(`${current ? '>' : ' '} ${name.padEnd(8)} ${ref}`)
    console.log(`  file: ${file}`)
    console.log(`  url:  ${env.VITE_SUPABASE_URL}`)
    console.log(`  app:  npm run ${appScript}`)
    if (current) console.log('  (CLI linked here)')
    console.log()
  }
}

function link(name) {
  const { ref, file, appScript } = resolveEnv(name)

  if (name === 'prod') {
    console.warn('⚠  Linking CLI to PRODUCTION. Be careful with db push / resets.\n')
  }

  console.log(`Linking Supabase CLI → ${name} (${ref}) from ${file}...`)
  const result = spawnSync(
    'supabase',
    ['link', '--project-ref', ref, '--yes'],
    { cwd: root, stdio: 'inherit', shell: true },
  )
  if (result.status !== 0) process.exit(result.status ?? 1)

  console.log(`\nLinked to ${name}.`)
  console.log(`App env: npm run ${appScript}`)
  console.log('(Vite mode is independent of CLI link — use the app script above.)\n')
  status()
}

const cmd = process.argv[2] ?? 'status'
if (cmd === 'status') status()
else if (cmd === 'staging' || cmd === 'prod') link(cmd)
else {
  console.error('Usage: node scripts/supabase-env.mjs [status|staging|prod]')
  process.exit(1)
}
