const devMenu = document.querySelectorAll("div.devMenu")[0];
devMenu.style.display = "block";

const hasShotgun = document.querySelector("#hasShotgun");
const hasDash = document.querySelector("#hasDash");

const devInterval = setInterval(function () {

    if (hasShotgun.checked) {
        player.collectables.shotgun = player.possibleCollectables.shotgun;
    } else {
        player.collectables.shotgun = [];
    };

    if (hasDash.checked) {
        player.collectables.dash = player.possibleCollectables.dash;
    } else {
        player.collectables.dash = [];
    };

}, 1000/30);