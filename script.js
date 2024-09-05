// API_HOST = "http://192.168.1.17:8000"; //DEVELOPMENT
API_HOST = "https://mwbapi.mytruebank.com"; //PRODUCTION

console.log("js ");

async function getData(retries = 2) {
  let attempt = 0;

  const getUrl = API_HOST + "/video_links";
  while (attempt < retries) {
    try {
      const response = await fetch(getUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic dXNlcm5hbWU6cGFzc3dvcmQ=",
        },
      });

      if (response.status === 401) {
        attempt++;
        console.log(`401 Unauthorized - retrying (${attempt}/${retries})`);
        if (attempt >= retries) {
          throw new Error("Maximum retry attempts reached");
        }
        // Optionally, you can wait for a bit before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }

      const data = await response.json();
      const filterData = data._items.find((item) => item.name === "New Card");

      console.log(filterData);

      if (filterData) {
        document.getElementById("heading").innerHTML = filterData.heading;
        document.getElementById("video").src = filterData.video_link;
        document
          .querySelector(":root")
          .style.setProperty("--primary-color", filterData.color_code);
        document.getElementById("img").src = filterData.image_link;
      }

      return filterData;
    } catch (e) {
      console.log("error ", e);
      attempt++;
      if (attempt >= retries) {
        throw new Error("Failed after multiple attempts");
      }
      // Optionally, you can wait for a bit before retrying
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  console.log("documet loaded");

  const dataUrls = await getData();
  console.log("dataUrls", dataUrls);

  document
    .getElementById("detailsForm")
    .addEventListener("submit", function (e) {
      e.preventDefault(); // Prevent the default form submissio

      // Get the input values
      const name = document.getElementById("name").value;
      const contactNumber = document.getElementById("number").value;

      // Define the API URL and request parameters
      const url = API_HOST + "/applied_leads"; // Replace with your actual API URL
      const method = "POST";
      const headers = {
        "Content-Type": "application/json",
        Authorization: "Basic dXNlcm5hbWU6cGFzc3dvcmQ=",
      };
      const data = {
        name: name,
        contact_no: contactNumber,
      };
      // window.location.href =
      //   "https://applyonline.hdfcbank.com/cards/credit-cards.html?CHANNELSOURCE=SWCC&DSACode=XCHL&LGcode=XCHL&LCcode=LUCK01&LC2=LUCK01&SMcode=K8865#nbb";
      // Perform the AJAX request
      fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(data),
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((err) => {
              throw new Error(err.message || "Something went wrong");
            });
          }
          window.location.href = dataUrls.redirect_url;

          return response.json();
        })

        .catch((err) => {
          console.error(err);
        });
    });
});
