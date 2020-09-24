const devMenu = document.querySelectorAll("div.devMenu")[0];
devMenu.style.display = "block";

const hasShotgun = document.querySelector("#hasShotgun");
const hasDash = document.querySelector("#hasDash");

hasShotgun.addEventListener("change", _ => {
    if (hasShotgun.checked) {
        player.collectables.shotgun = player.possibleCollectables.shotgun;
    } else {
        player.collectables.shotgun = [];
    };
});
hasDash.addEventListener("change", _ => {
    if (hasDash.checked) {
        player.collectables.shotgun = player.possibleCollectables.shotgun;
    } else {
        player.collectables.shotgun = [];
    };
});