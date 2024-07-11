document.addEventListener('DOMContentLoaded', init);

//vars
let inputField;
let pasteButton;
let searchButton;
let viewModeIcon;
let viewMode;
let error;
let status;
let loader;
let videoDiv;


function init() {
    //get event listeners and initialize variables
    inputField = document.getElementById("link")
    inputField.addEventListener('focus', function() {
        inputField.select();
    });

    pasteButton = document.getElementById("pasteButton");
    pasteButton.addEventListener("click", pasteClipboard);

    searchButton = document.getElementById("search");
    searchButton.addEventListener("click", validateLink);
    searchButton.disabled = false; //enable button after init

    viewModeIcon = document.getElementById("viewmode-icon");
    viewModeIcon.addEventListener("click", switchViewmode)

    videoDiv = document.getElementById("video-div");

    error = document.getElementById("error");
    status = document.getElementById("status");
    loader = document.getElementById("loader")

    //retrieve viewmode if not found create viewmode (dark/light)
    if (localStorage.getItem("viewMode") === null){
        console.log("no viewmode found creating one");
        localStorage.setItem("viewMode", "light");
        viewMode = localStorage.getItem("viewMode");

    }else
    {
        viewMode = localStorage.getItem("viewMode");
    }

    //light darkmode button
    if (viewMode === "light"){
        document.getElementById("viewmode-icon").src = "./icons/moon-solid.svg";
    }else {
        document.getElementById("viewmode-icon").src = "./icons/lightbulb-solid.svg";
    }
}


async function pasteClipboard() {
    //retrieve pasted text from clipboard
    inputField.value = await navigator.clipboard.readText();
}

function switchViewmode() {
    if (viewMode === "light") {
        localStorage.setItem("viewMode", "dark");
        viewMode = "dark";
        document.getElementById("viewmode-icon").src = "./icons/lightbulb-solid.svg";
    }else {
        localStorage.setItem("viewMode", "light");
        viewMode = "light";
        document.getElementById("viewmode-icon").src = "./icons/moon-solid.svg";
    }
}

function setError(errorMsg, visibility) {
    //visbility = hidden or visible

    if (visibility === "visible") {
        //hiding status message
        setStatus("", "hidden")

        //setting error message
        error.innerHTML = errorMsg
        error.classList.remove("hidden")
    }
    else if(visibility === "hidden") {
        //remove error message
        error.classList.add("hidden")
    }
}

function setStatus(statusMsg, visibility) {
    //visbility = hidden or visible

    if (visibility === "visible") {
        //hiding error message
        setError("", "hidden")
        //setting error message
        status.innerHTML = statusMsg
        status.classList.remove("hidden")
    }
    else if(visibility === "hidden") {
        //remove error message
        status.classList.add("hidden")
    }
}

//first validate the youtube link
function validateLink() {
    //get link
    const link = inputField.value

    //disable button and show loading anim
    searchButton.disabled = true
    loader.classList.toggle("hidden")


    //check if empty
    if (link.length === 0 || link === ""){
        setError("Link cannot be empty", "visible")

        //enable button and disable loading animation
        searchButton.disabled = false
        loader.classList.toggle("hidden")

        return
    }else{
        setError("", "hidden")
    }

   //validate link
    fetch(`http://localhost:8000/validate?URL=${encodeURIComponent(link)}`)
        .then(response => {
            if (!response.ok) {
                return response.text().then(errorMessage => {
                    throw new Error(errorMessage);
                });
            }
            return response.text();
        })
        .then(data => {
            videoInfo(link) // if response = 200 || Get video information
            return data;
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            setError(error.message, "visible");

            //enable button and disable loading animation
            searchButton.disabled = false
            loader.classList.toggle("hidden")
        });
}

function videoInfo(link) {

    console.log(link)
    console.log(`http://localhost:8000/info?URL=${encodeURIComponent(link)}`);

    //fetching video info
    fetch(`http://localhost:8000/info?URL=${encodeURIComponent(link)}`)
        .then(response => {
            if (!response.ok) {
                console.log(response)
                return response.text().then(errorMessage => {
                    throw new Error(errorMessage);
                });
            }
            return response.json();
        })
        .then(data => {
            buildVideoPreview(data, link)
        })
        .catch(error => {
            console.error('Er is een probleem opgetreden met de fetch-operatie:', error);
            setError(error.message, "visible");

            //enable button and disable loading animation
            searchButton.disabled = false
            loader.classList.toggle("hidden")
        });
}

function buildVideoPreview(data, link) {
    let videoTitle = document.getElementById("video-title");
    let videoThumbnail = document.getElementById("video-thumbnail");
    let videoLength = document.getElementById("video-length");
    let downloadAudioButton = document.getElementById("downloadMp3Button");
    downloadAudioButton.addEventListener("click", function() { downloadAudio(link)}); //onclick do download audio function
    let downloadVideoButton = document.getElementById("downloadMp4Button");
    downloadVideoButton.addEventListener("click", function() { downloadVideo(link)})

    console.log(data)
    //get video duration
    const duration = formatTime(data.videoDetails.lengthSeconds)

    videoTitle.innerText = data.videoDetails.title;
    const thumbnailcount = data.videoDetails.thumbnails.length - 1; //get highest res thumbnail


    videoThumbnail.src = data.videoDetails.thumbnails[thumbnailcount].url;
    videoLength.innerText = duration;

    //make video div visible
    videoDiv.classList.remove("hidden");

    //enable button and disable loading animation
    searchButton.disabled = false
    loader.classList.toggle("hidden")
}

function downloadAudio(link) {
    window.location.href = `http://localhost:8000/audio?URL=${link}`;
    setStatus("Audio downloaded started successfully 😎", "visible")
}

function downloadVideo(link) {
    //let videoQuality = document.getElementById("quality");

    //console.log(videoQuality.value)
    window.location.href = `http://localhost:8000/video?URL=${link}`;
    setStatus("Video downloaded started successfully 😎", "visible")
}

function formatTime(seconds) {
    // Calculate the number of days, hours, minutes, and remaining seconds
    const days = Math.floor(seconds / (60 * 60 * 24));
    const hours = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const remainingSeconds = seconds % 60;

    let formattedTime = '';

    if (days > 0) {
        formattedTime += `${days} day${days > 1 ? 's' : ''} | `;
    }

    // Add hours to the formatted string if they are present
    if (hours > 0) {
        formattedTime += `${hours} hour${hours > 1 ? 's' : ''} | `;
    }

    // Add minutes to the formatted string if they are present
    if (minutes > 0 || (days === 0 && hours === 0)) {
        formattedTime += `${minutes} minute${minutes > 1 ? 's' : ''} | `;
    }

    // Add seconds to the formatted string
    formattedTime += `${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}`;

    return formattedTime;
}