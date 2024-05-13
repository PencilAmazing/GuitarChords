// Global variable guitarData is available
// Prepare other global tables

// BIG TODO: Global state mess, move it all to be jsx side
// No need for html really, just make it into a placeholder

import {createRoot} from 'react-dom/client'
import {useState} from 'react'

let containerRoot = null;
function displayKey(key, suffixedRoot) {
  //console.log(guitarData.chords[key]);
  let suffixed = guitarData.chords[key.replace('#', 'sharp')].map((g) =>
    <li key={g.suffix} onClick={() => chordFound([g.key, g.suffix])}>{g.key+g.suffix}</li>
  )
  suffixedRoot.render(suffixed)
}

// On start, add navigation
function onStart() {
  const nav = createRoot(document.getElementById("Keys"))
  const suffixedRoot = createRoot(document.getElementById('Suffixed'))
  suffixedRoot.render("eh")

  let cnt = 0
  const listItems = guitarData["keys"].map((e)=>
    <li key={cnt++} onClick={() => displayKey(e, suffixedRoot)}>{e}</li>
  )

  nav.render(listItems);
  displayKey('C', suffixedRoot)

  const searchBar = document.getElementById('searchBar')
  searchBar.addEventListener('submit', (e) => {
    e.preventDefault()
    addChord();
  })

  containerRoot = createRoot(document.getElementById("container"))
  //searchBar.setAttribute('onsubmit', "return false;")

  chordFound(['C', 'major'])
  chordFound(['A', 'major'])
}

function getSearchValue() {
  return document.getElementById("chordSearch").value.replace(' ', '')
}

// Chord is a string here
export function parseChord(chord) {
  let major = null
  let suffix = null

  // some shortcuts
  if (chord.length == 0) {
    return null
  }

  // single, major chord
  if (chord.length == 1) {
    if (guitarData["keys"].includes(chord.toUpperCase())) {
      major = chord.toUpperCase()
      suffix = ""
      return [major, suffix];
      //return chord.toUpperCase(); // Return chord as is
    }
  }
  // Else invoke full parser, since next could either be flat or minor

  let rest = null
  // construct key, including flats and sharps
  let keyLong = chord[0].toUpperCase() + chord[1].toLowerCase()
  if (guitarData["keys"].includes(keyLong)) {
    rest = chord.substring(2) // skip two
    major = keyLong
  } else if (guitarData["keys"].includes(keyLong[0])) {
    rest = chord.substring(1)
    major = keyLong[0]
  }

  if(chord[1] == '#') {
    //FIXME: mixed flats and sharps
    // increment key
  }

  // Get suffix from rest
  if(rest == "") {
    return [major, ""]
  } else if(rest.toLowerCase() == 'm') {
    suffix = "minor"
  } else {
    guitarData["suffixes"].some((elem)=> {
      if (elem.toLowerCase() == rest.toLowerCase()) {
        suffix = elem
        return true;
      }
    })
  }

  if (suffix == null) return null
  return [major, suffix]
}

function chordNotFound() {
  console.log("Chord not found")
}

function generateSVG() {

}

// FIXME variant is non-functional, always starts at zero
// FIXME didn't make space for open and muted strings
function ChordDisplay({baseKey, suffix, variant = 0}) {
  console.log(baseKey, suffix, variant)

  // Save state per chord image
  let [which, setWhich] = useState(0)

  let chordVariants = guitarData.chords[baseKey].find((e) => e.suffix == suffix).positions;
  let chordVariant = chordVariants[which]

  function nextVariant(backwards = false) {
    setWhich(which + (backwards ? -1 : 1))
  }

  // Draw lower frets (4 more)
  let frets = []
  for(let i = 0; i < 4; i++) {
    const spacing = 20*(i+1) + "%"
    frets.push(<line key={"fret"+i} x1="0" x2="100%" y1={spacing} y2={spacing} stroke="black" strokeWidth="2"/>)
    frets.push(<line key={"string"+i} y1="0" y2="100%" x1={spacing} x2={spacing} stroke="black" strokeWidth="2"/>)
  }

  //fretOffset = chordVariant.baseFret
  let shape = chordVariant.frets.map((e, i) => {
    let cx = 20*i + "%"
    let cy = 20*(e-chordVariant.baseFret) + 10 + "%"
    let fill = "black"
    if(e == -1)
      fill = "red"
    else if (e < chordVariant.baseFret) {
      // If below base fret, open string
      fill = "transparent"
      // position accordingly
      cy = "10%"
    }

    return <circle key={"finger"+i} cx={cx} cy={cy} r="8" stroke="black" fill={fill}/>
  })

  // Top of fretboard (thick if base fret == 1, otherwise like others
  let topFret = <line x1="0%" x2="100%" y1="0" y2="0" stroke="black"
                      strokeWidth={chordVariant.baseFret==1?"15": "2"}/>
  let boardFrame = <rect width="100%" height="100%" fill="transparent" stroke="black" strokeWidth="2"/>

  // Functional programming only in JSX :^)
  return (
    <div className="chord">
      <p>{baseKey}-{suffix}-{variant}</p>
      <svg version="1.1" width="100" height="200" xmlns="http://www.w3.org/2000/svg">
        {shape}
        {topFret}
        {frets}
        {boardFrame}
      </svg>
      <br/>
      <div style={{display:'flex'}}>
        <button>{'<'}</button>
        <p>{which}</p>
        <button>{'>'}</button>
      </div>
    </div>
  )
}

// TODO make this fancy
// 1. Create another root (or consolidate all into one?)
function chordFound(parsedChord) {
  //const chordDiv = document.createElement("div");
  //chordDiv.setAttribute('class', 'chord')
  //chordDiv.appendChild(document.createTextNode(parsedChord));
  //document.getElementById("container").appendChild(chordDiv)

  containerRoot.render(<ChordDisplay baseKey={parsedChord[0]} suffix={parsedChord[1]} variant={0}/>)
  // Clear input
  document.getElementById("chordSearch").value = ""
}

function addChord() {
  let chord = getSearchValue();
  let parsed = parseChord(chord);

  if(parsed == null) {
    chordNotFound();
    //return false;
  } else {
    chordFound(parsed[0] + parsed[1])
  }
  return false
}

onStart()
