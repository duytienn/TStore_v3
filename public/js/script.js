// Show Alert
const showAlert = document.getElementById("alert");
const inAlert = document.querySelector("[show-alert]");
if (inAlert) {
    const exit = document.querySelector("[exit]");
    const time = parseInt(inAlert.getAttribute('time'));
    setTimeout(() => {
        showAlert.classList.add("hidden-alert");
    },time);
    exit.addEventListener("click", () => {
        showAlert.classList.add("hidden-alert");
    })
}
// End Show Alert
// SwiperIntroduce
var swiper = new Swiper(".mySwiper", {
    effect: "cards",
        grabCursor: true,
    });
//End SwiperIntroduce

// SHOW ITEM //
const showItem = document.getElementById('see-more-btn');
if (showItem) {
  document.getElementById('see-more-btn').addEventListener('click', function() {
    const hiddenProducts = document.querySelectorAll('.hidden');
    
    hiddenProducts.forEach((product, index) => {
      if (index < 4) { 
        product.classList.remove('hidden');
      }
    });
    if (hiddenProducts.length <= 4) {
      this.style.display = 'none';
    }
  });
}
  
// END SHOW ITEM //
// SWIPERWATCH
var swiper = new Swiper(".mySwiper2", {
  watchSlidesProgress: true,
  slidesPerView: 2,
});
// END SWIPERWATCH

// FORM SORT
const formSort = document.querySelector("[sort]");
if (formSort) {
  let url = new URL(window.location.href);
  const sortSelect = document.querySelector("[sort-select]");
  
  sortSelect.addEventListener("change", (e) => {
    const valueOption = e.target.value;
    const [sortKey, sortValue] = valueOption.split("-");
    url.searchParams.set("sortKey", sortKey);
    url.searchParams.set("sortValue", sortValue);

    window.location.href = url;
  })
};
// END FORM SORT
