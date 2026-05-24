document.getElementById("flowerForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append("name", document.getElementById("flowerName").value);
    formData.append("price", document.getElementById("flowerPrice").value);
    formData.append("quantity", document.getElementById("flowerCount").value);
    formData.append("image", document.getElementById("flowerImage").files[0]);

    console.log(formData);

    fetch("http://127.0.0.1:8000/add_flower/", {
        method: "POST",
        body: formData
    }).then(() => window.location.href = "index.html");
});
