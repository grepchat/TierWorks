$ErrorActionPreference = 'SilentlyContinue'

function Copy-FirstMatch {
  param(
    [string[]]$Roots,
    [string]$Pattern,
    [string]$Destination
  )
  foreach ($r in $Roots) {
    $found = Get-ChildItem -Path $r -Recurse -Filter $Pattern -File -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) {
      $destPath = Join-Path $Destination $Pattern
      New-Item -ItemType Directory -Force -Path $Destination | Out-Null
      Copy-Item $found.FullName -Destination $destPath -Force
      return $true
    }
  }
  return $false
}

$projectRoot = Join-Path $PSScriptRoot '..'
$publicRoot = Join-Path $projectRoot 'public'
$roots = @($env:USERPROFILE, 'C:\Users\gchad\OneDrive', 'C:\Users\gchad\Downloads', 'C:\Users\gchad\Desktop', 'C:\Users\gchad\Pictures')

# Covers
$covers = @('film-stars.png','footbal.jpg','series.png','basketball-players.jpg','basketball-teams.jpg','movies.jpg','football-players.jpg')
$coversDest = Join-Path $publicRoot 'covers'
foreach ($c in $covers) { Copy-FirstMatch -Roots $roots -Pattern $c -Destination $coversDest | Out-Null }

# Actors
$actors = @('leonardo-dicaprio.jpg','brad-pitt.jpg','meryl-streep.jpg','denzel-washington.jpg','emma-stone.jpg','ryan-gosling.jpg','tom-cruise.jpg','robert-downey-jr.jpg','scarlett-johansson.jpg','chris-evans.jpg','natalie-portman.jpg','anne-hathaway.jpg','matt-damon.jpg','ben-affleck.jpg','christian-bale.jpg','joaquin-phoenix.jpg','ryan-reynolds.jpg','jennifer-lawrence.jpg','margot-robbie.jpg','zendaya.jpg','robert-de-niro.jpg','al-pacino.jpg','tom-hanks.jpg','morgan-freeman.jpg','samuel-l-jackson.jpg','keanu-reeves.jpg','hugh-jackman.jpg','will-smith.jpg','johnny-depp.jpg','cate-blanchett.jpg','keira-knightley.jpg','charlize-theron.jpg','emily-blunt.jpg','florence-pugh.jpg','tom-hardy.jpg','benedict-cumberbatch.jpg','matthew-mcconaughey.jpg','daniel-craig.jpg','idris-elba.jpg','henry-cavill.jpg','jake-gyllenhaal.jpg','andrew-garfield.jpg','adam-driver.jpg','oscar-isaac.jpg','pedro-pascal.jpg','tom-holland.jpg','woody-harrelson.jpg','colin-farrell.jpg','jesse-eisenberg.jpg','aaron-paul.jpg')
$actorsDest = Join-Path $publicRoot 'posters-actors'
foreach ($n in $actors) { Copy-FirstMatch -Roots $roots -Pattern $n -Destination $actorsDest | Out-Null }

# Basketball players
$bplayers = @('michael-jordan.jpg','lebron-james.jpg','kobe-bryant.jpg','kareem-abdul-jabbar.jpg','magic-johnson.jpg','larry-bird.jpg','shaquille-oneal.jpg','tim-duncan.jpg','hakeem-olajuwon.jpg','kevin-durant.jpg','stephen-curry.jpg','dirk-nowitzki.jpg','charles-barkley.jpg','david-robinson.jpg','moses-malone.jpg','isiah-thomas.jpg','scottie-pippen.jpg','allen-iverson.jpg','dwyane-wade.jpg','chris-paul.jpg','james-harden.jpg','giannis-antetokounmpo.jpg','nikola-jokic.jpg','luka-doncic.jpg','joel-embiid.jpg','kawhi-leonard.jpg','damian-lillard.jpg','anthony-davis.jpg','jayson-tatum.jpg','vince-carter.jpg','tracy-mcgrady.jpg','paul-pierce.jpg','ray-allen.jpg','reggie-miller.jpg','patrick-ewing.jpg','karl-malone.jpg','john-stockton.jpg','steve-nash.jpg','gary-payton.jpg','dennis-rodman.jpg','yao-ming.jpg','manu-ginobili.jpg','tony-parker.jpg','carmelo-anthony.jpg','dwight-howard.jpg','kevin-garnett.jpg','dominique-wilkins.jpg','alonzo-mourning.jpg','james-worthy.jpg','bill-russell.jpg','wilt-chamberlain.jpg','ja-morant.jpg','zion-williamson.jpg','shai-gilgeous-alexander.jpg','tyrese-haliburton.jpg','anthony-edwards.jpg')
$bplayersDest = Join-Path $publicRoot 'posters-basketball'
foreach ($n in $bplayers) { Copy-FirstMatch -Roots $roots -Pattern $n -Destination $bplayersDest | Out-Null }

# Football players
$fplayers = @('lionel-messi.jpg','cristiano-ronaldo.jpg','neymar.jpg','kylian-mbappe.jpg','robert-lewandowski.jpg','luka-modric.jpg','kevin-de-bruyne.jpg','mohamed-salah.jpg','harry-kane.jpg','erling-haaland.jpg','karim-benzema.jpg','sergio-ramos.jpg','xavi.jpg','andres-iniesta.jpg','zinedine-zidane.jpg','ronaldinho.jpg','ronaldo-nazario.jpg','pele.jpg','diego-maradona.jpg','thierry-henry.jpg','wayne-rooney.jpg','frank-lampard.jpg','steven-gerrard.jpg','andrea-pirlo.jpg','paolo-maldini.jpg','gianluigi-buffon.jpg','iker-casillas.jpg','didier-drogba.jpg','samuel-etoo.jpg','luis-suarez.jpg','gareth-bale.jpg','zlatan-ibrahimovic.jpg','antoine-griezmann.jpg','ngolo-kante.jpg','toni-kroos.jpg','thomas-muller.jpg','marcelo.jpg','dani-alves.jpg','virgil-van-dijk.jpg','manuel-neuer.jpg','jan-oblak.jpg','alisson-becker.jpg','ederson.jpg','sergio-aguero.jpg','angel-di-maria.jpg','bruno-fernandes.jpg','bernardo-silva.jpg','vinicius-junior.jpg','jude-bellingham.jpg','phil-foden.jpg')
$fplayersDest = Join-Path $publicRoot 'posters-football-players'
foreach ($n in $fplayers) { Copy-FirstMatch -Roots $roots -Pattern $n -Destination $fplayersDest | Out-Null }

Write-Host 'Restore complete.'
