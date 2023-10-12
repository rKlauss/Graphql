const signInForm = document.getElementById("logInForm");
const ENDPOINT = "https://01.kood.tech/api/auth/signin";

signInForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const username_email = document.getElementById("username_email").value;
  const password = document.getElementById("password").value;
  const credentials = `${username_email}:${password}`;
  const base64Credentials = btoa(credentials);
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${base64Credentials}`,
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      const jwt = await response.json();
      localStorage.setItem("jwt", jwt);
      const data = document.getElementById("data");
      data.style.display = "block";
      getData();
      DrawColumns();
      errorMessage.style.display = "none";
      signInForm.style.display = "none";
      const logOutButton = document.createElement("button");
      logOutButton.id = "logOutButton";
      logOutButton.textContent = "Log Out";
      document.body.appendChild(logOutButton);
      logOutButton.addEventListener("click", () => {
        const container = document.getElementById("container");
        container.style.display = "none";
        localStorage.removeItem("jwt");
        signInForm.style.display = "block";
        logOutButton.style.display = "none";
      });
    } else {
      const errorMessage = document.getElementById("errorMessage");
      errorMessage.textContent =
        "Authentication failed. Please check your credentials.";
      errorMessage.style.display = "block";
    }
  } catch (error) {
    console.error("Error during sign-in:", error);
  }
});
