window.onload = (function(){
    'use strict';

    var songs;
    var currentSong = parseInt(localStorage.getItem("currentsong")) || 1;
    localStorage.setItem("currentsong", currentSong);
    console.log(currentSong);

    function loadSongs(){
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(){
            if (this.readyState == 4 && this.status == 200) {
                songs = JSON.parse(this.responseText).songs;
                var title = songs[currentSong-1].id + '. ' + songs[currentSong-1].name;
                var lHTML = songs[currentSong-1].lyrics;
                document.querySelector('.song.current .song-title').textContent = title;
                document.querySelector('.song.current .song-lyrics').innerHTML = lHTML;

                if(songs.length === 1){
                    document.getElementById('next_button').setAttribute('disabled', 'disabled');
                    document.getElementById('prev_button').setAttribute('disabled', 'disabled');
                }

                // create buttons for navigation to each individual song
                for(var i=0; i<songs.length; i++){
                    var ele = document.createElement('li');
                    ele.classList = 'song-nav-item';
                    var b = document.createElement('button');
                    b.setAttribute('type', 'button');
                    b.setAttribute('data-song-id', songs[i].id);
                    b.textContent = songs[i].id + '. ' + songs[i].name;
                    b.addEventListener('click', songButtonClick);
                    if(currentSong > songs[i].id) b.classList = 'song-button prev-song';
                    else if(currentSong < songs[i].id) b.classList = 'song-button';
                    else b.classList = 'song-button current-song';
                    ele.appendChild(b);

                    document.querySelector('.song-navigation').appendChild(ele);
                }
                // scroll the nav to the current song
                document.querySelector('.current-song').scrollIntoView();

                //initialize arrows
                checkArrows();
            }
        };
        xhr.open('GET', 'songs.json', true);
        xhr.send();
    }

    loadSongs();

    document.getElementById('next_button').addEventListener('click', function(){
        loadSong(currentSong + 1);
    });

    document.getElementById('prev_button').addEventListener('click', function(){
        loadSong(currentSong - 1);
    });

    var songButtonClick = function(){
        currentSong = this.getAttribute('data-song-id');
        loadSong(currentSong);
        toggleNavMenu();
    };

    var toggleNavMenu = function(){
        document.getElementById('navigation_wrapper').classList.toggle('nav-open');
    };
    document.getElementById('song_select').addEventListener('click', toggleNavMenu);

    function loadSong(song){
        // store previous song, update current song
        var pSong = currentSong;
        currentSong = parseInt(song);
        localStorage.setItem("currentsong", currentSong);

        // update the content in the main area
        var title = songs[song-1].id + '. ' + songs[song-1].name;
        var lHTML = songs[song-1].lyrics;
        var num = songs[song-1].id;
        document.querySelector('.song.staging .song-title').textContent = title;
        document.querySelector('.song.staging .song-lyrics').innerHTML = lHTML;

        // PAGE TURNING ANIMATION
        var cSong = document.querySelector('.song.current');
        var nSong = document.querySelector('.song.staging');
        cSong.classList.remove('current');
        nSong.classList.remove('staging','d-none');
        cSong.classList.add('staging');
        nSong.classList.add('current');

        // spread syntax, iterate through all buttons and remove current, if index < selected song, make it a previous song
        var navAll = document.querySelectorAll('.song-button');
        var navAllArr = [...navAll];
        navAllArr.forEach(ni => {
            ni.classList.remove('current-song', 'prev-song');
            var sid = parseInt(ni.getAttribute('data-song-id'));
            if(sid < song) ni.classList.add('prev-song');
        });
        // make selected song "current-song"
        document.querySelector('.song-button[data-song-id="'+song+'"]').classList.add("current-song");
        document.querySelector('.current-song').scrollIntoView();

        window.scroll({top: 0, left: 0, behavior: 'smooth'});

        // Checks arrows and enables/disables them as needed
        checkArrows();
    }

    function checkArrows(){
        if(currentSong === 1){
            document.getElementById('prev_button').setAttribute('disabled', 'disabled');
            document.getElementById('next_button').removeAttribute('disabled');
        }else if(currentSong === songs.length){
            document.getElementById('next_button').setAttribute('disabled', 'disabled');
            document.getElementById('prev_button').removeAttribute('disabled');
        } else {
            document.getElementById('next_button').removeAttribute('disabled');
            document.getElementById('prev_button').removeAttribute('disabled');
        }
    }

    // when the songs are done transitioning, hide the staging one
    document.querySelectorAll('.song').forEach(song =>{
        song.addEventListener('transitionend', function(){
            //if(this.classList.contains('staging')) this.classList.add('d-none');
        });
    });

})();