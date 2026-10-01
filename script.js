console.log("hii user")
let currentsong = new Audio();
let songs;
let currfolder;
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSecond = Math.floor(seconds % 60);
    let formattedMinutes = String(minutes).padStart(2, '0');
    let formattedSeconds = String(remainingSecond).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    // Filter out any undefined values
    songs = songs.filter(song => song !== undefined && song !== null);
    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songul.innerHTML = ""
    for (const song of songs) {
        if (song && song !== undefined) {
            songul.innerHTML = songul.innerHTML + `<li>
                            <img class="filter" src="music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Dhruv</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="filter" src="play.svg" alt="">
                            </div>
          </li>`;
        }
    }
    // attach an eventlistner to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    return songs;
}
const playmusic = (track, pause = false) => {
    currentsong.src = `/${currfolder}/` + track
    if (!pause) {
        currentsong.play()
        play.src = "paused.svg"
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
}
async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".cardcontainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs")) {
            let Folder = e.href.split("/").slice(-2)[0]
            // get meta data of folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${Folder}/info.json`)
            let response = await a.json();
            console.log(response)
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${Folder}" class="card">
            <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="65" height="65">
                    <!-- Light Green Circular Background -->
                    <circle cx="40" cy="40" r="38" fill="rgb(56, 237, 68)" />

                    <!-- Centered Play Button -->
                    <path d="M30 25L50 40L30 55Z" stroke="black" stroke-width="2.5" stroke-linejoin="round"
                        fill="none" />
                </svg>


            </div>
            <img src="/songs/${Folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }
    //load card whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
        })
    })
}
async function main() {

    // get list
    await getsongs("songs/English song")
    if (songs.length > 0) {
        playmusic(songs[0], true)
    }
    //display all albums song
    displayAlbums()
    //attach an eventlistner to playbar
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "paused.svg"
        }
        else {
            currentsong.pause()
            play.src = "play.svg"
        }
    })
    // eventlistner for time update
    currentsong.addEventListener("timeupdate", () => {
        console.log(currentsong.currentTime, currentsong.duration);
        document.querySelector(".songtime").innerHTML = `${formatTime(currentsong.currentTime)}:${formatTime(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    })
    // eventlistner for seekbar 
    document.querySelector(".seekbar").addEventListener("click", e => {
        let persent = (e.offsetX / e.target.getBoundingClientRect()
            .width) * 100;
        document.querySelector(".circle").style.left = persent + "%";
        currentsong.currentTime = ((currentsong.duration) * persent) / 100
    })
    // add eventlistner for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
        document.querySelector(".butten").style.left = "20px";
    })
    // add eventlistner for close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";
        document.querySelector(".butten").style.left = "-152%";
    })
    // add eventlistner for next and prev button
    prev.addEventListener("click", () => {
        console.log("Previous Clicked")
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1])
        }
    })
    Next.addEventListener("click", () => {
        console.log("Next Clicked")
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1])
        }
    })

}
main()