/* global Alpine */
document.addEventListener('alpine:init', () => {
  'use strict'
  Alpine.data('app', () => ({
    SWIPE_THRESHOLD: 50,
    currentSong: parseInt(localStorage.getItem('currentsong')) || 0,
    songs: [],
    navOpen: false,
    touch: { x0: 0, y0: 0, x1: 0, y1: 0 },
    selectSong(num) {
      this.currentSong = num
      this.navOpen = false
      localStorage.setItem('currentsong', num)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    handleTouchStart(e) {
      this.touch.x0 = e.changedTouches[0].screenX
      this.touch.y0 = e.changedTouches[0].screenY
    },
    handleTouchEnd(e) {
      this.touch.x1 = e.changedTouches[0].screenX
      this.touch.y1 = e.changedTouches[0].screenY

      const dX = this.touch.x1 - this.touch.x0
      const dY = this.touch.y1 - this.touch.y0

      // we don't want people who are trying to scroll to accidentally change song
      // so look at vertical delta first, and if it's big enough then don't do anything
      if (Math.abs(dY) < this.SWIPE_THRESHOLD * 2) {
        if (dX > this.SWIPE_THRESHOLD && this.currentSong !== 1)
          this.currentSong -= 1 // swipe left, unless we're on the first song
        else if (dX < -this.SWIPE_THRESHOLD && this.currentSong !== this.songs.length)
          this.currentSong += 1 // swipe right, unless we're on the last song
      }
    },
  }))
  localStorage.setItem('currentsong', this.currentSong)
})
