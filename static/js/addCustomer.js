document.addEventListener('DOMContentLoaded', function () {
//     document.getElementById("addCustomerForm").addEventListener("submit", function(event) {
//     event.preventDefault();

//     const name = document.getElementById("customerName").value;
//     const phone = document.getElementById("customerPhone").value;
//     const email = document.getElementById("customerEmail").value;

//     fetch("http://127.0.0.1:8000/add_customer/", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ name, phone, email })
//     }).then(() => window.location.href = "index.html");
// });/
document.getElementById("addCustomerForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const customerName = document.getElementById("customerName").value;
    const customerPhone = document.getElementById("customerPhone").value;
    let customerEmail = document.getElementById("customerEmail").value;

    const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(customerPhone)) {
            alert("Please enter a valid 10-digit phone number. Only numbers are allowed.");
            return;
        }

        if(customerName.trim()==""){
            alert("Name Not Provided");
            return;
        }

        if(customerEmail.trim()==""){
            customerEmail = "Email-Not-Provided";
        }


    const customerData = {
        customerName: customerName,
        customerPhone: customerPhone,
        customerEmail: customerEmail
    };

    // try {
        const response = await fetch("http://127.0.0.1:8000/add_customer/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",  // Ensure JSON format
            },
            body: JSON.stringify(customerData)
        });

        if (response.ok) {
            const result = await response.json();
            alert("Customer added successfully!");
        } else {
            const errorData = await response.json();
            alert("Error: " + errorData.detail);
        }
    // } catch (error) {
    //     alert("Failed to send request: " + error.message);
    // }
});

})


