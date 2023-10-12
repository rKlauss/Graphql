function getData() {
  const jwtToken = localStorage.getItem("jwt");
  const graphqlQuery = `
      {
        user {
          id
          login
          createdAt
          attrs
        }
        transaction(where: {_and: [{type: {_eq: "xp"}}, {eventId: {_eq: 85}}]}) {
          amount
          object {
            name
          }
        }
      }
    `;
  fetch("https://01.kood.tech/api/graphql-engine/v1/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: graphqlQuery }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data && data.data) {
        const user = data.data.user[0];
        const transactions = data.data.transaction || [];
        displayUser(user);
        drawPieChart(transactions);
      } else {
        console.error("GraphQL response does not contain expected data:", data);
      }
    })
    .catch((error) => {
      console.error("Error making GraphQL request:", error);
    });
}
function displayUser(user) {
  const userHeader = document.getElementById("userHeader");
  userHeader.textContent = "User Details";
  const userIdElement = document.getElementById("userId");
  const userLoginElement = document.getElementById("userLogin");
  const userCreatedAtElement = document.getElementById("userCreatedAt");
  const userEmailElement = document.getElementById("userEmail");
  const userNationalityElement = document.getElementById("userNationality");
  userIdElement.textContent = user.id;
  userLoginElement.textContent = user.login;
  userCreatedAtElement.textContent = formatCreatedAt(user.createdAt);
  userEmailElement.textContent = user.attrs.email;
  userNationalityElement.textContent = user.attrs.nationality;
  console.log("asmalsf");
}
function formatCreatedAt(createdAt) {
  const date = new Date(createdAt);
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString(undefined, options);
}
function drawPieChart(transactions) {
  const svgWidth = 500;
  const svgHeight = 500;
  const radius = Math.min(svgWidth, svgHeight) / 2;
  const cx = svgWidth / 2;
  const cy = svgHeight / 2;
  const colors = [
    "yellow",
    "#2ecc71",
    "#9b59b6",
    "#bdc3c7",
    "#1abc9c",
    "#95a5a6",
  ];
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", svgWidth);
  svg.setAttribute("height", svgHeight);
  const totalAmount = transactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );
  let startAngle = 0;
  transactions.forEach((transaction, index) => {
    const endAngle =
      startAngle + (transaction.amount / totalAmount) * 2 * Math.PI;
    const objectName = transaction.object.name;
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
    const pathData = `M ${cx},${cy} L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2} Z`;
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    path.setAttribute("fill", colors[index % colors.length]);
    path.setAttribute("stroke", "black");
    path.setAttribute("stroke-width", "2");

    const tooltipText = `${objectName}, ${transaction.amount / 1000} kB`;
    path.setAttribute("data-tooltip", tooltipText);
    svg.appendChild(path);
    startAngle = endAngle;
  });
  const tooltip = document.createElement("div");
  tooltip.style.position = "absolute";
  tooltip.style.display = "none";
  tooltip.style.backgroundColor = "white";
  tooltip.style.padding = "5px";
  svg.addEventListener("mouseover", (event) => {
    if (event.target.tagName === "path") {
      const tooltipText = event.target.getAttribute("data-tooltip");
      tooltip.textContent = tooltipText;
      tooltip.style.display = "block";
      tooltip.style.left = `${event.pageX + 10}px`;
      tooltip.style.top = `${event.pageY}px`;
    }
  });
  svg.addEventListener("mouseout", () => {
    tooltip.style.display = "none";
  });
  document.body.appendChild(tooltip);
  const graphContainer = document.getElementById("graphContainer");
  const graphHeader = document.createElement("h1");
  graphHeader.textContent = "Your projects";
  const graphText = document.createElement("p");
  graphContainer.appendChild(graphHeader);
  graphContainer.appendChild(graphText);
  graphContainer.appendChild(svg);
}
function DrawColumns() {
  const jwtToken = localStorage.getItem("jwt");
  const query2 = `
  {
    transaction(where: {_and: [ {eventId: {_eq: 85}}]}) {
      type
      amount
    }
  }
  `;
  fetch("https://01.kood.tech/api/graphql-engine/v1/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: query2 }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data && data.data) {
        const transactions = data.data.transaction;
        let upCount = 0;
        let downCount = 0;
        let upValue = 0;
        let downValue = 0;
        transactions.forEach((transaction) => {
          if (transaction.type === "up") {
            upCount++;
            upValue += transaction.amount;
          } else if (transaction.type === "down") {
            downCount++;
            downValue += transaction.amount;
          }
        });
        const columnGraphDiv = document.getElementById("columnGraph");
        const svgWidth = 800;
        const svgHeight = 400;
        const svg = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );
        const auditHeader = document.createElement("h1");
        auditHeader.textContent = "Your audits";
        columnGraphDiv.appendChild(auditHeader);
        svg.setAttribute("width", svgWidth);
        svg.setAttribute("height", svgHeight);

        const totalValue = upValue + downValue;
        const upAmountBarWidth = (upValue / totalValue) * (svgWidth - 100);
        const downAmountBarWidth = (downValue / totalValue) * (svgWidth - 100);
        const upAmountBarHeight = 50;
        const upAmountBar = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );
        upAmountBar.setAttribute("x", 0);
        upAmountBar.setAttribute("y", 50);
        upAmountBar.setAttribute("width", upAmountBarWidth);
        upAmountBar.setAttribute("height", upAmountBarHeight);
        upAmountBar.setAttribute("fill", "yellow");
        svg.appendChild(upAmountBar);
        const upAmountText = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        upAmountText.setAttribute("x", 20);
        upAmountText.setAttribute("y", 80);
        upAmountText.setAttribute("fill", "black");
        upAmountText.textContent = `Audits done: ${formatFileSize(upValue)}`;
        svg.appendChild(upAmountText);
        const downAmountBarHeight = 50;
        const downAmountBar = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );
        downAmountBar.setAttribute("x", 0);
        downAmountBar.setAttribute("y", 60 + upAmountBarHeight);
        downAmountBar.setAttribute("width", downAmountBarWidth);
        downAmountBar.setAttribute("height", downAmountBarHeight);
        downAmountBar.setAttribute("fill", "lightyellow");
        svg.appendChild(downAmountBar);
        const downAmountText = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        downAmountText.setAttribute("x", 20);
        downAmountText.setAttribute("y", 90 + upAmountBarHeight);
        downAmountText.setAttribute("fill", "black");
        downAmountText.textContent = `Audits received: ${formatFileSize(
          downValue
        )}`;
        svg.appendChild(downAmountText);
        const upCountParagraph = document.createElement("p");
        upCountParagraph.textContent = `Audits done: ${upCount}`;
        columnGraphDiv.appendChild(upCountParagraph);
        const downCountParagraph = document.createElement("p");
        downCountParagraph.textContent = `Audits received: ${downCount}`;
        columnGraphDiv.appendChild(downCountParagraph);
        const auditRatio = document.createElement("p");
        auditRatio.textContent = `Audit ratio: ${(upValue / downValue).toFixed(
          1
        )}`;
        columnGraphDiv.appendChild(auditRatio);
        columnGraphDiv.appendChild(svg);
      } else {
        console.error("GraphQL response does not contain expected data:", data);
      }
    })
    .catch((error) => {
      console.error("Error making GraphQL request:", error);
    });
}
function formatFileSize(sizeInKB) {
  let dividedValue = (sizeInKB / 1000000).toFixed(3);
  if (dividedValue >= 1) {
    return (dividedValue * 1).toFixed(2) + "Mb";
  } else {
    return dividedValue * 1000 + "kb";
  }
}
