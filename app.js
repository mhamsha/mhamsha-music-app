let songs = [];
let currFolder;
let songUL;
let songsName = [];
let reducedSongsName = [];
let songImage;

async function getSongs(folder) {
  currFolder = folder;
  const url = `http://127.0.0.1:5500/${folder}/`;
  let songsName = [];
  const response = await fetch(url);
  const data = await response.text();
  // console.log(data)
  let div = document.createElement("div");
  div.innerHTML = data;
  let as = div.getElementsByTagName("a");
  // console.log(as);
  // * This loop is to get the songs name
  for (let i = 0; i < as.length; i++) {
    const element = as[i];
    if (element.href.endsWith(".mp3")) {
      songsName.push(element.innerText);
    }
  }
  //  console.log(songsName);
  // * This loop is to get the songs url
  for (let i = 0; i < as.length; i++) {
    const element = as[i];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href);
    }
  }

  // console.log(songs);
  return songsName;
}
async function displayAlbums() {
  // console.log("displaying albums")
  let a = await fetch(`http://127.0.0.1:5500/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardDiv");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
      // console.log(e.href)
      let folder = e.href.split("/").slice(-1)[0];
      // console.log(folder)
      // Get the metadata of the folder
      let a = await fetch(`/songs/${folder}/info.json`);
      // console.log(a)
      let response = await a.json();
      // console.log(response)
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        ` <div data-folder=${folder} class="card">
          <img src="/songs/${folder}/cover.jpeg" alt="image" />
          <h3>${response.title}</h3>
          <p>${response.description}</p>
        </div>`;
    }
  }
  // * This is for the playlist card click functionality
  let playlist = document.getElementsByClassName("card");
  Array.from(playlist).forEach((element) => {
    // console.log(element);
    let newElement = element.cloneNode(true);
    element.parentNode.replaceChild(newElement, element);
    element = newElement;
    element.addEventListener("click", function (e) {
      // Remove all existing event listeners to prevent multiple triggers
      songUL.innerHTML = "";
      let folderName = e.currentTarget.dataset.folder;
      main(folderName);
    });
  });
}
function reducedSongsNameFunc() {
  for (let i = 0; i < songsName.length; i++) {
    element = songsName[i].split(".mp3")[0].split("(")[0];
    reducedSongsName.push(element);
    songUL.innerHTML += `<li><div>${element}</div>${songImage}</li>`;
  }
}
async function main(folderName = "daily mix 1") {
  songUL = document.querySelector(".songList");
  songsName = await getSongs(`songs/${folderName}`);
  songImage = `<img class="imgStop"  src="svg/musicStop.svg"  alt="play">`;
  // * Add reducedSongsName and songImage in UL
  reducedSongsNameFunc();
  let imgElements = document.querySelectorAll(".songList li img");
  let playCircle = document.querySelector(".playCircle");
  let previousImg = null;
  let audioPlay = null;
  let audio;
  let presentImg = null;
  // * Add event listener to the all img elements
  imgElements.forEach(function (img, index) {
    img.addEventListener("click", () => {
      // * This is for side bar song name
      if (img.src.endsWith("svg/musicStop.svg")) {
        document.querySelector(".songName").innerHTML = reducedSongsName[index];
        // * This is for the song name in the middle
        if (previousImg) {
          previousImg.src = "svg/musicStop.svg";
          img.src = "svg/musicPlay.svg";
          previousImg = img;
          playCircle.src = "svg/playCircle.svg";
          presentImg = img;
        }
        //* this is else condition for the song name in the middle
        else {
          img.src = "svg/musicPlay.svg";
          previousImg = img;
          playCircle.src = "svg/playCircle.svg";
          presentImg = img;
          playCircle.addEventListener("click", () => {
            if (playCircle.src.endsWith("svg/playCircle.svg")) {
              playCircle.src = "svg/pauseCircle.svg";
              audio.pause();
            } else {
              if (presentImg.src.endsWith("svg/musicPlay.svg")) {
                playCircle.src = "svg/playCircle.svg";
                audio.play();
              } else {
                // console.log(presentImg);
              }
            }
          });
        }
        // * this condition is to check if the audio is playing or not and always check if the side bar has true value
        if (audioPlay) {
          audio.pause();
          audio = new Audio(songs[index]);
          audio.play();
        } else {
          audio = new Audio(songs[index]);
          audio.play();
          audioPlay = audio;
        }
      }

      // * this is else condition for the side bar song name
      else {
        img.src = "svg/musicStop.svg";
        playCircle.src = "svg/pauseCircle.svg";
        playCircle.addEventListener("click", () => {
          if (playCircle.src.endsWith("svg/playCircle.svg")) {
            playCircle.src = "svg/pauseCircle.svg";
            audio.pause();
          } else {
            if (presentImg.src.endsWith("svg/musicPlay.svg")) {
              playCircle.src = "svg/playCircle.svg";
              audio.play();
            } else {
              // console.log(presentImg);
            }
          }
        });

        audio.pause();
        previousImg = null;
        audioPlay = null;
        presentImg = null;
      }

      audio.addEventListener("timeupdate", function () {
        // console.log(audio.currentTime, audio.duration);

        // * funtion to convert seconds into minutes
        function secondsToMinutes(time) {
          let minutes = Math.floor(time / 60);
          let seconds = Math.floor(time % 60);
          if (seconds < 10) {
            seconds = `0${seconds}`;
          }
          return `${minutes}:${seconds}`;
        }
        // * To show the time of the song
        document.querySelector(".songTime").innerHTML = `${secondsToMinutes(
          audio.currentTime
        )}/${secondsToMinutes(audio.duration)}`;

        // * To move the seek bar from left to right
        document.querySelector(".songcircle").style.left =
          (audio.currentTime / audio.duration) * 100 + "%";
      });
    });
  });
  // * This is for skip next/previous button functionality
  let next = document.querySelector(".next");
  let prev = document.querySelector(".prev");
  prev.addEventListener("click", () => {
    let index = songs.indexOf(audio.src);

    index = (index - 1 + songs.length) % songs.length;
    // console.log(index)
    audio.src = songs[index];
    document.querySelector(".songName").innerHTML = reducedSongsName[index];
    if (previousImg) {
      previousImg.src = "svg/musicStop.svg";
      imgElements[index].src = "svg/musicPlay.svg";
      playCircle.src = "svg/playCircle.svg";
      previousImg = imgElements[index];
      presentImg = imgElements[index];
    }
    audio.play();
  });

  next.addEventListener("click", () => {
    let index = songs.indexOf(audio.src);
    index = (index + 1) % songs.length;
    audio.src = songs[index];
    document.querySelector(".songName").innerHTML = reducedSongsName[index];
    if (previousImg) {
      previousImg.src = "svg/musicStop.svg";
      imgElements[index].src = "svg/musicPlay.svg";
      playCircle.src = "svg/playCircle.svg";
      previousImg = imgElements[index];
      presentImg = imgElements[index];
    }
    audio.play();
  });
  // * This is for the seek bar click functionality
  let songBar = document.querySelector(".songlineBar");
  songBar.addEventListener("click", (e) => {
    let move = (e.offsetX / songBar.clientWidth) * audio.duration;
    audio.currentTime = move;
  });
}

displayAlbums();
main();
