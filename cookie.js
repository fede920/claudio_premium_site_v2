document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("cookiesAccepted")) {
    document.getElementById("cookie-banner").style.display = "block";
  }

  document.getElementById("acceptCookies").onclick = () => {
    localStorage.setItem("cookiesAccepted", "true");
    document.getElementById("cookie-banner").style.display = "none";
  };
});
