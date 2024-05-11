// Global variable guitarData is available
// Prepare other global tables

import {createRoot} from 'react-dom/client'

function displayKey(key, suffixedRoot) {
  //console.log(guitarData.chords[key]);
  let suffixed = guitarData.chords[key.replace('#', 'sharp')].map((g) =>
    <li key={g.suffix} onClick={() => chordFound(g.key+g.suffix)}>{g.key+g.suffix}</li>
  )
  suffixedRoot.render(suffixed)
}

// On start, add navigation
function onStart() {
  //const root = createRoot(document.getElementById('Keys'));
  //root.render(<h1>Hello, world</h1>);

  const nav = createRoot(document.getElementById("Keys"))
  const suffixedRoot = createRoot(document.getElementById('Suffixed'))
  suffixedRoot.render("eh")
  /*guitarData["Keys"].forEach((e) => {
    let entry = createElement("li")
    entry.appendChild(document.createTextNode())
  })*/
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
  //searchBar.setAttribute('onsubmit', "return false;")
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

function ChordDisplay(key, suffix) {
  let chords = guitarData.keys[key].find((e) => e.suffix == suffix);

  return (
    <div class="chord">
        {key+suffix}
    </div>
  )
}

// TODO make this fancy
function chordFound(parsedChord) {
  const chordDiv = document.createElement("div");
  chordDiv.setAttribute('class', 'chord')
  chordDiv.appendChild(document.createTextNode(parsedChord));
  document.getElementById("container").appendChild(chordDiv)

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
