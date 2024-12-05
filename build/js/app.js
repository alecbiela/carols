'use strict'
import Alpine from 'https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/module.esm.min.js'

let songs
let currentSong = parseInt(localStorage.getItem('currentsong')) || 1
localStorage.setItem('currentsong', currentSong)

const SWIPE_THRESHOLD = 50 // num pixels traveled to be considered a "swipe"
let touch = { x0: 0, y0: 0, x1: 0, y1: 0 } // holds the touch data

let TRANSITION_IN_PROGRESS = false

//main ajax function to load songs JSON
const loadSongs = () => {
  const xhr = new XMLHttpRequest()
  xhr.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      songs = JSON.parse(this.responseText).songs
      const title =
        songs[currentSong - 1].id + '. ' + songs[currentSong - 1].name
      const lHTML = songs[currentSong - 1].lyrics
      document.querySelector('.song.current .song-title').textContent = title
      document.querySelector('.song.current .song-lyrics').innerHTML = lHTML

      if (songs.length === 1) {
        document
          .getElementById('next_button')
          .setAttribute('disabled', 'disabled')
        document
          .getElementById('prev_button')
          .setAttribute('disabled', 'disabled')
      }

      // create buttons for navigation to each individual song
      for (let i = 0; i < songs.length; i++) {
        const ele = document.createElement('li')
        ele.classList = 'song-nav-item'
        const b = document.createElement('button')
        b.setAttribute('type', 'button')
        b.setAttribute('data-song-id', songs[i].id)
        b.textContent = songs[i].id + '. ' + songs[i].name
        b.addEventListener('click', songButtonClick)
        if (currentSong > songs[i].id) b.classList = 'song-button prev-song'
        else if (currentSong < songs[i].id) b.classList = 'song-button'
        else b.classList = 'song-button current-song'
        ele.appendChild(b)

        document.querySelector('.song-navigation').appendChild(ele)
      }
      // scroll the nav to the current song
      document.querySelector('.current-song').scrollIntoView()

      //set the initial browser state to support future pushstate() and popstate() events
      //history.replaceState(songs[currentSong-1].id, "", document.location.href);

      //initialize arrows
      checkArrows()
    }
  }
  xhr.open('GET', 'data/songs.json', true)
  xhr.send()
}

const songButtonClick = (e) => {
  currentSong = e.target.getAttribute('data-song-id')
  loadSong(currentSong)
  toggleNavMenu()
  //history.pushState(currentSong, "", currentSong);
}

const prevButtonClick = () => {
  const s = currentSong - 1
  loadSong(s)
  //history.pushState(s, "", s);
}

const nextButtonClick = () => {
  const s = currentSong + 1
  loadSong(s)
  //history.pushState(s, "", s);
}

const toggleNavMenu = () => {
  document.getElementById('navigation_wrapper').classList.toggle('nav-open')
}

document.getElementById('song_select').addEventListener('click', toggleNavMenu)
document
  .getElementById('next_button')
  .addEventListener('click', nextButtonClick)
document
  .getElementById('prev_button')
  .addEventListener('click', prevButtonClick)

const replaceStagingSong = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let el = document.querySelector('.song.exiting')
      if (el.classList.contains('left')) {
        el.classList.add('right')
        el.classList.remove('left')
      } else {
        el.classList.remove('right')
        el.classList.add('left')
      }
      el.classList.add('staging')
      el.classList.remove('exiting')
      TRANSITION_IN_PROGRESS = false
      resolve('done')
    }, 250)
  })
}
const resetStaging = async () => {
  //const result = await replaceStagingSong();
  await replaceStagingSong()
}

// load a specific song with id "song"
const loadSong = (song) => {
  if (TRANSITION_IN_PROGRESS === true) return
  TRANSITION_IN_PROGRESS = true
  // store previous song, update current song
  let pSong = currentSong
  currentSong = parseInt(song)
  localStorage.setItem('currentsong', currentSong)

  // update the content in the main area
  //TODO: Make this dynamically generate el with .right or .left depending on next/prev
  //el.classList.add("staging");
  //el.classList.add((pSong > currentSong) ? "left" : "right");
  const title = songs[song - 1].id + '. ' + songs[song - 1].name
  const lHTML = songs[song - 1].lyrics
  //var num = songs[song-1].id;

  // PAGE TURNING ANIMATION
  const cSong = document.querySelector('.song.current')
  let nSong
  if (pSong > currentSong) nSong = document.querySelector('.song.staging.left')
  else nSong = document.querySelector('.song.staging.right')

  nSong.getElementsByClassName('song-title')[0].textContent = title
  nSong.getElementsByClassName('song-lyrics')[0].innerHTML = lHTML

  cSong.classList.remove('current')
  nSong.classList.remove('staging', 'right', 'left')
  cSong.classList.add('exiting', pSong > currentSong ? 'right' : 'left')
  nSong.classList.add('current')

  resetStaging()

  // spread syntax, iterate through all buttons and remove current, if index < selected song, make it a previous song
  const navAll = document.querySelectorAll('.song-button')
  const navAllArr = [...navAll]
  navAllArr.forEach((ni) => {
    ni.classList.remove('current-song', 'prev-song')
    const sid = parseInt(ni.getAttribute('data-song-id'))
    if (sid < song) ni.classList.add('prev-song')
  })

  // make selected song "current-song"
  document
    .querySelector('.song-button[data-song-id="' + song + '"]')
    .classList.add('current-song')
  document.querySelector('.current-song').scrollIntoView()

  //TODO: Find out why this isnt working
  window.scroll({ top: 0, left: 0, behavior: 'smooth' })

  // Checks arrows and enables/disables them as needed
  checkArrows()
}

// dynamically update arrows to become interactable as they are needed
const checkArrows = () => {
  if (currentSong === 1) {
    document.getElementById('prev_button').setAttribute('disabled', 'disabled')
    document.getElementById('next_button').removeAttribute('disabled')
  } else if (currentSong === songs.length) {
    document.getElementById('next_button').setAttribute('disabled', 'disabled')
    document.getElementById('prev_button').removeAttribute('disabled')
  } else {
    document.getElementById('next_button').removeAttribute('disabled')
    document.getElementById('prev_button').removeAttribute('disabled')
  }
}

const handleGesture = () => {
  const dX = touch.x1 - touch.x0
  const dY = touch.y1 - touch.y0

  // we don't want people who are trying to scroll to accidentally change song
  // so look at vertical delta first, and if it's big enough then don't do anything
  if (Math.abs(dY) < SWIPE_THRESHOLD * 2) {
    if (dX > SWIPE_THRESHOLD && currentSong !== 1)
      prevButtonClick() // swipe left, unless we're on the first song
    else if (dX < -SWIPE_THRESHOLD && currentSong !== songs.length)
      nextButtonClick() // swipe right, unless we're on the last song
  }
}

// when the songs are done transitioning, hide the staging one
/*document.querySelectorAll('.song').forEach(song =>{
        song.addEventListener('transitionend', function(){
            if(this.classList.contains('staging')) this.classList.add('d-none');
        });
    });*/

// runs when user clicks the back button (pop current state off, return to previous)
/*window.addEventListener("popstate", (e) => {
        if(e.state){
            loadSong(e.state);
        }
    });*/

Alpine.data('app', () => ({
  currentSong,
  songs,
  loadSongs,
  init() {
    // handle mobile touch gestures (swiping)
    window.addEventListener('touchstart', (e) => {
      touch.x0 = e.changedTouches[0].screenX
      touch.y0 = e.changedTouches[0].screenY
    })
    window.addEventListener('touchend', (e) => {
      touch.x1 = e.changedTouches[0].screenX
      touch.y1 = e.changedTouches[0].screenY
      handleGesture()
    })
  },
}))

Alpine.start()
