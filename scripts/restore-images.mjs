import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'

const projectRoot = path.join(path.dirname(new URL(import.meta.url).pathname), '..')
const publicRoot = path.join(projectRoot, 'public')

const roots = [
  path.join(process.env.USERPROFILE || '', 'OneDrive'),
  path.join(process.env.USERPROFILE || '', 'Downloads'),
  path.join(process.env.USERPROFILE || '', 'Desktop'),
  path.join(process.env.USERPROFILE || '', 'Pictures'),
].filter(Boolean)

const SKIP_DIRS = new Set(['.git', 'node_modules', 'dist', '.cache', '.next', 'build', 'out'])

async function ensureDir(dir) {
  await fsp.mkdir(dir, { recursive: true })
}

async function findFileByName(startDir, targetName, maxEntries = 200000) {
  const stack = [startDir]
  let visited = 0
  while (stack.length) {
    const dir = stack.pop()
    try {
      const entries = await fsp.readdir(dir, { withFileTypes: true })
      for (const ent of entries) {
        if (++visited > maxEntries) return null
        if (ent.isDirectory()) {
          if (SKIP_DIRS.has(ent.name.toLowerCase())) continue
          stack.push(path.join(dir, ent.name))
        } else if (ent.isFile()) {
          if (ent.name.toLowerCase() === targetName.toLowerCase()) {
            return path.join(dir, ent.name)
          }
        }
      }
    } catch {}
  }
  return null
}

async function copyIfFound(filename, destDir) {
  for (const root of roots) {
    try {
      if (!root || !fs.existsSync(root)) continue
      const found = await findFileByName(root, filename)
      if (found) {
        await ensureDir(destDir)
        const destPath = path.join(destDir, filename)
        await fsp.copyFile(found, destPath)
        console.log('OK  ', filename, '<-', found)
        return true
      }
    } catch {}
  }
  console.log('MISS', filename)
  return false
}

const covers = [
  'series.png',
  'film-stars.png',
  'footbal.jpg',
  'basketball-players.jpg',
  'basketball-teams.jpg',
  'movies.jpg',
  'football-players.jpg',
]

const actors = [
  'leonardo-dicaprio.jpg','brad-pitt.jpg','meryl-streep.jpg','denzel-washington.jpg','emma-stone.jpg','ryan-gosling.jpg','tom-cruise.jpg','robert-downey-jr.jpg','scarlett-johansson.jpg','chris-evans.jpg','natalie-portman.jpg','anne-hathaway.jpg','matt-damon.jpg','ben-affleck.jpg','christian-bale.jpg','joaquin-phoenix.jpg','ryan-reynolds.jpg','jennifer-lawrence.jpg','margot-robbie.jpg','zendaya.jpg','robert-de-niro.jpg','al-pacino.jpg','tom-hanks.jpg','morgan-freeman.jpg','samuel-l-jackson.jpg','keanu-reeves.jpg','hugh-jackman.jpg','will-smith.jpg','johnny-depp.jpg','cate-blanchett.jpg','keira-knightley.jpg','charlize-theron.jpg','emily-blunt.jpg','florence-pugh.jpg','tom-hardy.jpg','benedict-cumberbatch.jpg','matthew-mcconaughey.jpg','daniel-craig.jpg','idris-elba.jpg','henry-cavill.jpg','jake-gyllenhaal.jpg','andrew-garfield.jpg','adam-driver.jpg','oscar-isaac.jpg','pedro-pascal.jpg','tom-holland.jpg','woody-harrelson.jpg','colin-farrell.jpg','jesse-eisenberg.jpg','aaron-paul.jpg'
]

const bplayers = [
  'michael-jordan.jpg','lebron-james.jpg','kobe-bryant.jpg','kareem-abdul-jabbar.jpg','magic-johnson.jpg','larry-bird.jpg','shaquille-oneal.jpg','tim-duncan.jpg','hakeem-olajuwon.jpg','kevin-durant.jpg','stephen-curry.jpg','dirk-nowitzki.jpg','charles-barkley.jpg','david-robinson.jpg','moses-malone.jpg','isiah-thomas.jpg','scottie-pippen.jpg','allen-iverson.jpg','dwyane-wade.jpg','chris-paul.jpg','james-harden.jpg','giannis-antetokounmpo.jpg','nikola-jokic.jpg','luka-doncic.jpg','joel-embiid.jpg','kawhi-leonard.jpg','damian-lillard.jpg','anthony-davis.jpg','jayson-tatum.jpg','vince-carter.jpg','tracy-mcgrady.jpg','paul-pierce.jpg','ray-allen.jpg','reggie-miller.jpg','patrick-ewing.jpg','karl-malone.jpg','john-stockton.jpg','steve-nash.jpg','gary-payton.jpg','dennis-rodman.jpg','yao-ming.jpg','manu-ginobili.jpg','tony-parker.jpg','carmelo-anthony.jpg','dwight-howard.jpg','kevin-garnett.jpg','dominique-wilkins.jpg','alonzo-mourning.jpg','james-worthy.jpg','bill-russell.jpg','wilt-chamberlain.jpg','ja-morant.jpg','zion-williamson.jpg','shai-gilgeous-alexander.jpg','tyrese-haliburton.jpg','anthony-edwards.jpg'
]

const fplayers = [
  'lionel-messi.jpg','cristiano-ronaldo.jpg','neymar.jpg','kylian-mbappe.jpg','robert-lewandowski.jpg','luka-modric.jpg','kevin-de-bruyne.jpg','mohamed-salah.jpg','harry-kane.jpg','erling-haaland.jpg','karim-benzema.jpg','sergio-ramos.jpg','xavi.jpg','andres-iniesta.jpg','zinedine-zidane.jpg','ronaldinho.jpg','ronaldo-nazario.jpg','pele.jpg','diego-maradona.jpg','thierry-henry.jpg','wayne-rooney.jpg','frank-lampard.jpg','steven-gerrard.jpg','andrea-pirlo.jpg','paolo-maldini.jpg','gianluigi-buffon.jpg','iker-casillas.jpg','didier-drogba.jpg','samuel-etoo.jpg','luis-suarez.jpg','gareth-bale.jpg','zlatan-ibrahimovic.jpg','antoine-griezmann.jpg','ngolo-kante.jpg','toni-kroos.jpg','thomas-muller.jpg','marcelo.jpg','dani-alves.jpg','virgil-van-dijk.jpg','manuel-neuer.jpg','jan-oblak.jpg','alisson-becker.jpg','ederson.jpg','sergio-aguero.jpg','angel-di-maria.jpg','bruno-fernandes.jpg','bernardo-silva.jpg','vinicius-junior.jpg','jude-bellingham.jpg','phil-foden.jpg'
]

async function run() {
  console.log('Restoring covers...')
  for (const name of covers) await copyIfFound(name, path.join(publicRoot, 'covers'))

  console.log('Restoring actors...')
  for (const name of actors) await copyIfFound(name, path.join(publicRoot, 'posters-actors'))

  console.log('Restoring basketball players...')
  for (const name of bplayers) await copyIfFound(name, path.join(publicRoot, 'posters-basketball'))

  console.log('Restoring football players...')
  for (const name of fplayers) await copyIfFound(name, path.join(publicRoot, 'posters-football-players'))

  console.log('Restore finished')
}

run().catch(err => {
  console.error('Restore failed:', err)
  process.exit(1)
})


