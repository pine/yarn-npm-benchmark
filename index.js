'use strict'

const path   = require('path')
const exec   = require('child_process').exec

const _           = require('lodash')
const csvLine     = require('csv-line')
const fs          = require('mz/fs')
const globby      = require('globby')
const log         = require('fancy-log')
const pEachSeries = require('p-each-series')
const pMap        = require('p-map')
const rimraf      = require('rimraf-promise')
const timeSpan    = require('time-span')

// env => ndenv node version
const ENVS = {
  'npm@2': '4.6.2',
  'npm@3': '6.9.1',
  'yarn' : '6.9.1',
}

const CSV_FILENAME = 'result.csv'

async function execAsync(command, opts) {
  return new Promise((resolve, reject) => {
    const child = exec(command, opts, (err, stdout, stderr) => {
      if (err) { reject(err) }
      else { resolve(null, stdout, stderr) }
    })

    child.stdout.on('data', data => process.stdout.write(data))
    child.stderr.on('data', data => process.stderr.write(data))
  })
}

async function execByNdenv(version, command, opts) {
  const cmd = `NDENV_VERSION=${version} ndenv exec ${command}`
  log(cmd)
  return execAsync(cmd, opts)
}

async function execByEnv(env, command, opts) {
  return execByNdenv(ENVS[env], command, opts)
}

async function showSystemInfo() {
  const envs = Object.keys(ENVS)
  await pEachSeries(envs, async env => {
    log(env)
    await execByEnv(env, 'node -v')

    if (~env.indexOf('npm')) {
      await execByEnv(env, 'npm -v')
    } else {
      await execByEnv(env, 'yarn -V')
    }
  })
}

async function cleanGlobalCache(env) {
  if (~env.indexOf('npm')) {
    await execByEnv(env, 'npm cache clean')
  } else {
    await execByEnv(env, 'yarn cache clean')
  }
}

async function cleanLocalCache(pkgRoot) {
  await pMap([
    'node_modules',
    'npm-shrinkwrap.json',
    'yar.lock',
  ], p => rimraf(path.join(pkgRoot, p)))
}

async function installByEnv(env, pkgRoot) {
  if (~env.indexOf('npm')) {
    await execByEnv(env, 'npm install --ignore-scripts', { cwd: pkgRoot })
  } else {
    await execByEnv(env, 'yarn --ignore-scripts', { cwd: pkgRoot })
  }
}

async function cleanResultCsv() {
  await rimraf(CSV_FILENAME)
}

async function logCsv(data) {
  const line = csvLine.encode(data)
  await fs.appendFile(CSV_FILENAME, `${line}\n`)
}

!async function() {
  try {
    await cleanResultCsv()
    await showSystemInfo()

    const pkgRoots = await globby(['./packages/*'])
    const envs     = Object.keys(ENVS)

    await pEachSeries(pkgRoots, async pkgRoot => {
      const basename = path.basename(pkgRoot)     // owner_repo
      const repo     = basename.replace('_', '/') // owner/repo
      const result   = [ repo ]

      try {
        await pEachSeries(envs, async env => {
          log(`Install for ${repo} by ${env}`)

          // clean all cache
          await Promise.all([
            cleanLocalCache(pkgRoot),
            cleanGlobalCache(env),
          ])

          // install
          const end  = timeSpan()
          await installByEnv(env, pkgRoot)
          const span = end() // ms

          result.push(env, span)
        })

        // logging
        log('Result:', JSON.stringify(result))
        await logCsv(result)
      } catch (e) {
        log.error('Error', e)
        log.error('Skip:', repo)
      }
    })

    log('Successful')
  } catch (e) {
    log.error('Error', e)
  }
}()
