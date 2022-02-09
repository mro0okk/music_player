const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = "PLAYER"
const loadDuration = $("#audio-duration")
const player = $(".player")
const heading = $("header h1")
const cdThumb = $(".cd-thumb")
const audio = $("#audio")
const playlist = $(".playlist")
const cd = $(".cd")
const playBtn = $(".btn-toggle-play")
const progress = $("#progress")
const nextBtn = $(".btn-next")
const prevBtn = $(".btn-prev")
const randomBtn = $(".btn-random")
const repeatBtn = $(".btn-repeat")
const songs = $$(".song")
const totalTime = $("#total_time")
const currentTime = $(".current_time")
var Interval
const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem("PLAYER_STORAGE_KEY")) || {},
  songs: [
    {
      name: "Nevada",
      singer: "Vicetone",
      path: "./assets/music/song1.mp3",
      image: "./assets/img/song1.jpg",
    },
    {
      name: "Legends Never Die ",
      singer: "Nightcore",
      path: "./assets/music/song2.mp3",
      image: "./assets/img/song2.jpg",
    },
    {
      name: "Hoa nở không màu ",
      singer: "Hoài Lâm",
      path: "./assets/music/song3.mp3",
      image: "./assets/img/song3.jpg",
    },
    {
      name: "Lose Yourself ",
      singer: "Eminem",
      path: "./assets/music/song4.mp3",
      image: "./assets/img/song4.jpg",
    },
    {
      name: "Nevada",
      singer: "Vicetone",
      path: "./assets/music/song1.mp3",
      image: "./assets/img/song5.jpg",
    },
    {
      name: "Lose Yourself ",
      singer: "Eminem",
      path: "./assets/music/song4.mp3",
      image: "./assets/img/song4.jpg",
    },
    {
      name: "Legends Never Die ",
      singer: "Nightcore",
      path: "./assets/music/song2.mp3",
      image: "./assets/img/song6.jpg",
    },
  ],
  setConfig: function (key, val) {
    this.config[key] = val
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
  },
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return ` 
            <div class="song ${
              index === this.currentIndex ? "active" : ""
            }" data-index="${index}" =>
                <div class="thumb"style="background-image: url('${
                  song.image
                }');">
                    </div>
                    <div class="body">
                        <h3 class="title">'${song.name}'</h3>
                        <p class="author">'${song.singer}'</p>
            </div>
            <div class="option">
                <i class="fas fa-ellipsis-h"></i>
                </div>
                </div>
                `
    })
    playlist.innerHTML = htmls.join("")
  },
  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: () => {
        return this.songs[this.currentIndex]
      },
    })
  },
  handleEvents: () => {
    const _this = this
    const cd = $(".cd")
    const cdWidth = cd.offsetWidth
    //Xử lý CD chuyển động
    const cdThumbAnimate = cdThumb.animate(
      {
        transform: "rotate(360deg)",
      },
      {
        duration: 10000,
        iteration: "infinite",
      }
    )
    cdThumbAnimate.pause()
    document.onscroll = () => {
      const scrollTop = Math.round(window.scrollY)
      const newCdWidth = cdWidth - scrollTop
      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0
      cd.style.opacity = newCdWidth / cdWidth
    }

    function formatTime(time) {
      let min = Math.floor(time / 60)
      let sec = Math.floor(time % 60)
      if (min === NaN || sec === NaN) {
        return "0:00"
      } else {
        return min + ":" + (sec < 10 ? "0" + sec : sec)
      }
    }
    window.onload = () => {
      totalTime.textContent = formatTime(audio.duration)
    }
    audio.addEventListener("loadedmetadata", function () {
      totalTime.textContent = formatTime(audio.duration)
    })
    //Xử lý khi click Play
    playBtn.onclick = () => {
      if (_this.isPlaying) {
        audio.pause()
      } else {
        audio.play()
      }
    }
    //khi bài hát bắt đàu chạy
    audio.onplay = () => {
      _this.isPlaying = true
      player.classList.add("playing")
      cdThumbAnimate.play()
      clearInterval()
    }
    //khi bài hát bị dừng
    audio.onpause = () => {
      _this.isPlaying = false
      player.classList.remove("playing")
      cdThumbAnimate.pause()
    }
    //Khi tiến độ bài hát thay đổi
    audio.ontimeupdate = () => {
      const time = audio.currentTime
      const total = audio.duration
      const progressPercent = Math.floor(
        (audio.currentTime / audio.duration) * 100
      )
      if (audio.duration) {
        progress.value = progressPercent
      }
      currentTime.textContent = formatTime(time)
      audio_duration.style.color = "white"
      audio_duration.style.fontSize = "12px"
      if (audio.duration !== NaN) {
        total_time.textContent = formatTime(total)
      }
    }
    //Xử lý khi tua bài hát
    progress.onchange = (event) => {
      const seekTime = (audio.duration / 100) * event.target.value
      audio.currentTime = seekTime
    }

    //khi chuyển bài hát
    nextBtn.onclick = () => {
      if (app.isRandom) {
        app.playRandomSong()
      } else {
        app.nextSong()
      }
      audio.play()
      app.render()
      app.scrollToActiveSong()
    }
    prevBtn.onclick = () => {
      if (app.isRandom) {
        app.playRandomSong()
      } else {
        app.preSong()
      }
      audio.play()
      app.render()
    }
    randomBtn.onclick = (event) => {
      app.isRandom = !app.isRandom
      app.setConfig("isRandom", app.isRandom)
      randomBtn.classList.toggle("active", app.isRandom)
    }

    repeatBtn.onclick = (e) => {
      {
        app.isRepeat = !app.isRepeat
        app.setConfig("isRepeat", app.isRepeat)
        repeatBtn.classList.toggle("active", app.isRepeat)
        console.log(audio.duration)
      }
    }
    audio.onended = () => {
      if (app.isRepeat) {
        audio.play()
      } else {
        nextBtn.click()
      }
    }

    playlist.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)")
      if (songNode || e.target.closest(".option")) {
        if (songNode) {
          app.currentIndex = Number(songNode.dataset.index)
          app.loadCurrentSong()
          app.render()
          audio.play()
        }
        if (e.target.closest(".option")) {
          app.nextSong()
          app.loadCurrentSong()
          audio.play()
        }
      }
    }
  },
  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      })
    }, 300)
  },
  loadCurrentSong: function () {
    const heading = $("header h1")
    const cdThumb = $(".cd-thumb")
    const audio = $("#audio")

    heading.textContent = this.currentSong.name
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}'`
    audio.src = this.currentSong.path
  },
  loadConfig: function () {
    this.isRandom = this.config.isRandom
    this.isRepeat = this.config.isRepeat
    Object.assign(this, this.config)
  },
  nextSong: function () {
    this.currentIndex++
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0
    }
    this.loadCurrentSong()
  },
  preSong: function () {
    this.currentIndex--
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1
    }
    this.loadCurrentSong()
  },
  playRandomSong: function () {
    let newIndex
    do {
      newIndex = Math.floor(Math.random() * this.songs.length)
    } while (newIndex === this.currentIndex)
    this.currentIndex = newIndex
    this.loadCurrentSong()
  },
  render2: function () {
    const htmls = this.songs.map(() => {
      return ` 
                <div class="Time">
                <span>${audio.duration}</span>
                </div>
                `
    })
  },
  start: function () {
    //config assign to apps
    this.loadConfig()
    // define Object props
    this.defineProperties()
    //listen event
    this.handleEvents()
    //load first song when UI running
    this.loadCurrentSong()
    //Render Playlist
    this.render()
    this.render2()
  },
}
app.start()
