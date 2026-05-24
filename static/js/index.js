
const del_bill= ()=>{

    const selectedCheckboxes = document.querySelectorAll(".bill-checkbox:checked");
  const selectedIds = Array.from(selectedCheckboxes).map(cb => cb.getAttribute("data-id"));
  console.log("Selected Bill IDs:", selectedIds);

  selectedIds.forEach(id=>{
    id = parseInt(id);
    fetch(`http://127.0.0.1:8000/delete_bill/${id}`, {
        method: 'DELETE',
    }).then(res =>{
        if(!res.ok){
            console.error(`Error in deleting bill with id ${id}`);
        }
    })
  });

  window.location.href = "/";
  
}

const send_pdf = (customer_name, customer_phone)=>{

    const pdf_button = document.getElementById("pdf");
    console.log(pdf_button);
    pdf_button?.addEventListener("click", ()=>{
        console.log("pdf clicked");
        const mainDiv = document.getElementById("bill_table");
        const headerDiv = document.createElement('div');

        // Create first line - Title
        const title = document.createElement('div');
        title.textContent = 'A1 ROSES';
        title.style.textAlign = 'center';
        title.style.fontWeight = 'bold';
        title.style.fontSize = '20px';
        title.style.margin = '5px 0';

        // Create second line - Address
        const address = document.createElement('div');
        address.textContent = '123 Bloom Street, Roseville, CA';
        address.style.textAlign = 'center';
        address.style.fontSize = '14px';
        address.style.margin = '3px 0';

        // Create third line - Name (left) and Date (right)
        const bottomLine = document.createElement('div');
        bottomLine.style.display = 'flex';
        bottomLine.style.justifyContent = 'space-between';
        bottomLine.style.fontSize = '14px';
        bottomLine.style.marginTop = '5px';

        const nameSpan = document.createElement('span');
        nameSpan.textContent = `Customer: ${customer_name}`;

        const dateSpan = document.createElement('span');
        const today_date = new Date().toLocaleDateString();
        dateSpan.textContent = `Date: ${today_date}`;

        const footerDiv = document.createElement('div');
        const temp = document.createElement('span');
        temp.textContent = "This is computer generated Bill";
        temp.style.fontStyle = 'italic';
        
        footerDiv.appendChild(temp);
        footerDiv.style.textAlign = 'center';

        bottomLine.appendChild(nameSpan);
        bottomLine.appendChild(dateSpan);

        // Append all lines to headerDiv
        headerDiv.appendChild(title);
        headerDiv.appendChild(address);
        headerDiv.appendChild(bottomLine);

        // Get the main division and prepend the header
        mainDiv.prepend(headerDiv);
        mainDiv.append(footerDiv);

        const opt = {
            margin:       0.5,
            filename:     `${today_date}_${customer_name}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        
        html2pdf().from(mainDiv).set(opt).save().then(()=>{
            const number = prompt("Enter WhatsApp number with country code (e.g., 919999999999):", customer_phone);
            if (!number){
                headerDiv.remove();
                footerDiv.remove();
                return;
            }

            headerDiv.remove();
            footerDiv.remove();

            const message = encodeURIComponent("Hi! Here is the bill of flowers from A1 ROSES.");
            const whatsappLink = `https://wa.me/${number}?text=${message}`;
            window.open(whatsappLink, "_blank");
        });
        
    });
}

let flowerDetails = {};
editFlower = (name,idd,price,quantity)=>{
    console.log(name,idd,price,quantity, typeof(name), typeof(idd), typeof(price), typeof(quantity));
    const id = idd;
    const newname = window.prompt("Enter new flower name", name);
    const newprice = window.prompt("Enter new flower price", price);
    const newquantity = window.prompt("Enter new flower quantity", quantity);

    console.log(newname,id,newprice,newquantity, typeof(newname), typeof(id), typeof(newprice), typeof(newquantity));

    if(id==null){
        alert("Error: ID is undefined/null");
        return;
    }

    if(newname==null || newprice==null|| newquantity==null){
        return;
    }

    fetch("http://127.0.0.1:8000/edit_flower/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id,
            newname,
            newprice,
            newquantity
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was 'not ok'");
        }
        return response.json();
    })
    .then(customerData => {
        alert("Flowerr edited successfully!");
    })

    fetch("http://127.0.0.1:8000/flowers/")
    .then(res => res.json())
    .then(data => {
        const flowerDisplay = document.getElementById("flowerDisplay");
        flowerDisplay.innerHTML = "";
        data.forEach(f => {
            flowerDetails[f.id] = { price: f.price, quantity: f.quantity, name: f.name, image: f.image };
            const card = document.createElement("div");
            card.className = "flower-card";
            card.setAttribute("data-id", f.id);
            card.innerHTML = `
                <img src="../backend/${f.image}" alt="${f.name}" />
                <p><strong>${f.name}</strong></p>
                <p>ID:${f.id} | Price:₹${f.price}</p>
                <button class="edit-flower" onclick = "editFlower('${f.name}', ${f.id}, ${f.price}, ${f.quantity})" >Edit</button>
                <button class="delete-btn">Delete</button>
            `;
            flowerDisplay.appendChild(card);
        });

    })
    .catch(err => console.error("Error loading flowers:", err));
}

document.addEventListener("DOMContentLoaded", () => {
    let selectedCustomerId = null;
    flowerDetails = {}; // Store flower details including price
    let currentBillContainer = null;
    let allCustomers = []; // To store all loaded customers

    // Function to fetch flower details including price
    const loadFlowerDetails = () => {
        fetch("http://127.0.0.1:8000/flowers/")
            .then(res => res.json())
            .then(data => {
                const flowerDisplay = document.getElementById("flowerDisplay");
                flowerDisplay.innerHTML = "";
                data.forEach(f => {
                    flowerDetails[f.id] = { price: f.price, quantity: f.quantity, name: f.name, image: f.image };
                    const card = document.createElement("div");
                    card.className = "flower-card";
                    card.setAttribute("data-id", f.id);
                    card.innerHTML = `
                        <img src="../backend/${f.image}" alt="${f.name}" />
                        <p><strong>${f.name}</strong></p>
                        <p>ID:${f.id} | Price:₹${f.price}</p>
                        <button class="edit-flower" onclick = "editFlower('${f.name}', ${f.id}, ${f.price}, ${f.quantity})" >Edit</button>
                        <button class="delete-btn">Delete</button>
                    `;
                    flowerDisplay.appendChild(card);
                });

            })
            .catch(err => console.error("Error loading flowers:", err));
    };

    // Load Flowers on page load
    loadFlowerDetails();

    // Load Customers
    fetch("http://127.0.0.1:8000/customers/")
        .then(res => res.json())
        .then(data => {
            allCustomers = data; // Store all customers
            renderCustomerList(data); // Render the initial list
        })
        .catch(err => console.error("Error loading customers:", err));

    function renderCustomerList(customers) {
        const customerList = document.getElementById("customerList");
        customerList.innerHTML = "";
        customers.forEach(c => {
            const div = document.createElement("div");
            div.className = "customer-item";
            div.setAttribute("data-id", c.id);
            div.setAttribute("cust-name",c.name);
            div.setAttribute("cust-phone",c.phone);

            div.innerHTML = `
            <div style = "display:flex; flex-direction: column;">
                <span>${c.name}</span>
                <h5 style="margin:auto 0;">${c.phone}</h5>
                </div>
                <div class="deleteEditBtn">
                <button class="edit-customer-btn" data-customer-id="${c.id}" data-name= ${c.name} data-phone= ${c.phone} data-email= ${c.email}>Edit</button>
                <button class="delete-customer-btn" data-customer-id="${c.id}">Delete</button>
                </div>
            
            `;
            customerList.appendChild(div);
        });

        // Add event listeners to the new delete buttons
        document.querySelectorAll(".delete-customer-btn").forEach(button => {
            button.addEventListener("click", function() {
                const customerIdToDelete = this.getAttribute("data-customer-id");
                deleteCustomer(customerIdToDelete, this.parentNode);
            });
        });

        document.querySelectorAll(".edit-customer-btn").forEach(button => {
            button.addEventListener("click", function() {
                const customerIdToDelete = this.getAttribute("data-customer-id");
                const customername = this.getAttribute("data-name");
                const customerphone = this.getAttribute("data-phone");
                const customeremail = this.getAttribute("data-email");
                editCustomer(customerIdToDelete,customername, customerphone, customeremail, this.parentNode);
            });
        });
    }

    //............................... Search Customer Functionality
    const searchInput = document.getElementById("customerSearch");
    searchInput.addEventListener("input", function() {
        const searchTerm = this.value.toLowerCase();
        const filteredCustomers = allCustomers.filter(customer =>
            customer.name.toLowerCase().includes(searchTerm)
        );
        renderCustomerList(filteredCustomers);
    });

    function deleteCustomer(customerId, customerElement) {
        if (!confirm("Are you sure you want to delete this customer?")) return;

        fetch(`http://127.0.0.1:8000/delete_customer/${customerId}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (response.ok) {
                customerElement.remove();
                allCustomers = allCustomers.filter(c => c.id !== parseInt(customerId)); // Update the allCustomers array
                alert("Customer deleted successfully.");
                // If a customer was selected for billing, reset the billing area
                if (selectedCustomerId === customerId) {
                    const existingBillContainer = document.getElementById("billFormInnerContainer");
                    if (existingBillContainer) {
                        existingBillContainer.remove();
                        currentBillContainer = null;
                        selectedCustomerId = null;
                    }
                }
            } else {
                alert("Failed to delete customer.");
            }
        })
        .catch(error => {
            console.error("Error deleting customer:", error);
            alert("An error occurred while deleting the customer.");
        });
    }

    const editCustomer = (customerId, customername, customerphone, customeremail, customerElement)=>{
        const id = customerId;
        const name = window.prompt("Enter new customer name", customername);
        const phone = window.prompt("Enter new customer phone number", customerphone);
        const email = window.prompt("Enter new customer email", customeremail);

        console.log(name, typeof(name), phone, typeof(phone), email, typeof(email));

        fetch("http://127.0.0.1:8000/edit_customer/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id,
                name,
                phone,
                email
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(customerData => {
            allCustomers.push(customerData); // Add new customer to the array
            renderCustomerList(allCustomers); // Re-render the list
            console.log("Customer added:", customerData);
            alert("Customer edited successfully!");
        })

        fetch("http://127.0.0.1:8000/customers/")
        .then(res => res.json())
        .then(data => {
            allCustomers = data; // Store all customers
            renderCustomerList(data); // Render the initial list
        })

    }

    // Toggle Add Flower Form
    document.getElementById("addFlowerBtn")?.addEventListener("click", e => {
        e.preventDefault();
        document.getElementById("addFlowerForm")?.classList.remove("hidden");
    });

    document.getElementById("closeFormBtn")?.addEventListener("click", () => {
        document.getElementById("addFlowerForm")?.classList.add("hidden");
    });

    // Submit Add Flower Form
    document.getElementById("flowerForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const imageInput = document.getElementById("flowerImage");
        if (!imageInput.files[0]) {
            alert("Please select an image");
            return;
        }

        const formData = new FormData();
        formData.append("name", document.getElementById("flowerName").value);
        formData.append("price", document.getElementById("flowerPrice").value);
        formData.append("count", document.getElementById("flowerCount").value);
        formData.append("image", imageInput.files[0]);

        await fetch("http://127.0.0.1:8000/add_flower/", {
            method: "POST",
            body: formData
        });

        location.reload();
    });

    // Delete Flower Handler
    document.getElementById("flowerDisplay")?.addEventListener("click", (e) => {
        if (e.target.classList.contains("delete-btn")) {
            const card = e.target.closest(".flower-card");
            const flowerId = card.getAttribute("data-id");

            if (confirm("Are you sure to delete this flower?")) {
                fetch(`http://127.0.0.1:8000/delete_flower/${flowerId}`, {
                    method: "DELETE"
                }).then(res => {
                    if (res.ok) card.remove();
                    else alert("Failed to delete flower");
                });
            }
        }
    });

    // Add Customer Handler
    document.getElementById("addCustomerForm")?.addEventListener("submit", function (e) {
        e.preventDefault();
        let c = "l";

        const customerName = document.getElementById("customerName").value;
        const customerPhone = document.getElementById("customerPhone").value;
        const customerEmail = document.getElementById("customerEmail").value;

        // Phone number validation (exactly 10 digits and only numbers)
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
            customerEmail = "Email Not Provided"
        }

        return;

        // // Email validation
        // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // if (!emailRegex.test(customerEmail)) {
        //     alert("Please enter a valid email address.");
        //     return;
        // }

        fetch("http://127.0.0.1:8000/add_customer/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                customerName,
                customerPhone,
                customerEmail
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(customerData => {
            allCustomers.push(customerData); // Add new customer to the array
            renderCustomerList(allCustomers); // Re-render the list
            console.log("Customer added:", customerData);
            alert("Customer added successfully!");
            document.getElementById("customerForm").reset(); // Clear the form
        })
        // .catch(error => {
        //     console.error("Error adding customer:", error);
        //     alert("Failed to add customer.");
        // });
    });

    document.getElementById("customerList")?.addEventListener("click", (e) => {
        console.log('tapped');
        const customerDiv = e.target.closest(".customer-item");
        if(customerDiv){
            selectedCustomerId = customerDiv.getAttribute("data-id");
            let selectedCustomerName = customerDiv.getAttribute("cust-name");
            let selectedCustomerPhone = customerDiv.getAttribute("cust-phone");
            let customerInfo = {selectedCustomerId,selectedCustomerName,selectedCustomerPhone};
            sessionStorage.setItem("ForCustomerPopup", JSON.stringify(customerInfo));
            customerPopup(selectedCustomerId,selectedCustomerName,selectedCustomerPhone);
        }
        
    });

});

function customerPopup(selectedCustomerId,selectedCustomerName,selectedCustomerPhone){
    
        
        // if (customerDiv) {
            // selectedCustomerId = customerDiv.getAttribute("data-id");
            // let selectedCustomerName = customerDiv.getAttribute("cust-name");
            // let selectedCustomerPhone = customerDiv.getAttribute("cust-phone");
            console.log(selectedCustomerName);
            console.log(selectedCustomerId, typeof(selectedCustomerId));
            const mainContent = document.querySelector(".main-content");

            // Remove existing bill form and history if present
            const existingBillContainer = document.getElementById("billFormInnerContainer");
            if (existingBillContainer) {
                existingBillContainer.remove();
                currentBillContainer = null;
            }

            // Create and append the bill form in the middle
            const billFormHTML = `
                <div id="billFormInnerContainer" style="margin-top: 20px;">
                    <h3>Add Flower to Customer Bill</h3>
                    <button class="close-btn" id="closeBillForm">&times;</button>
                    <form id="billForm">
                        <label>Customer Name:</label><br>
                        <div style = "display: flex; gap: 5px">
                        <input type="text" id="cust_name" value = ${selectedCustomerName} readonly><br><br>
                        <button class="update-data-btn" onclick=window.location.href='new-data?cust=${encodeURIComponent(selectedCustomerId)}&text=${encodeURIComponent(selectedCustomerName)}&phone=${encodeURIComponent(selectedCustomerPhone)}'>Update Passbook</button>
                        </div>
                        <label>Flower ID:</label><br>
                        <input type="number" id="flower_id" required><br><br>

                        <label>Today's Rate:</label><br>
                        <input type="number" id="todays_rate" required><br><br>

                        <label>Quantity:</label><br>
                        <input type="number" id="quantity" required><br><br>

                        <label>GST(%):</label><br>
                        <input type="number" id="gst" value = 0 required><br><br>

                        <label>Discount(%):</label><br>
                        <input type="number" id="discount" value = 0 required><br><br>

                        <label>Total Price:</label><br>
                        <input type="text" id="total_price" readonly><br><br>


                        <button type="submit">Add to Bill</button>
                        <button id="complete">Complete</button>
                    </form>
                    <div id="billHistoryContainer" style="margin-top: 20px;">
                        <button class="all-table-btn">All</button><button class="month-table-btn">Custom Month</button><button class="recent-table-btn">Recent</button>
                        
                        <h4>Purchases of Month <button class="hide-table-btn">Hide</button></h4>
                    </div>
                </div>
            `;
            mainContent.insertAdjacentHTML("beforeend", billFormHTML);
            currentBillContainer = document.getElementById("billFormInnerContainer");

            const billHistoryContainer = document.getElementById("billHistoryContainer");
            const hideTableButton = billHistoryContainer.querySelector(".hide-table-btn");
            const monthTableButton = billHistoryContainer.querySelector(".month-table-btn");
            const allTableButton = billHistoryContainer.querySelector(".all-table-btn");
            const recentTableButton = billHistoryContainer.querySelector(".recent-table-btn");
            const tableContainer = document.createElement("div");
            tableContainer.id = "pastBillsTable";
            billHistoryContainer.appendChild(tableContainer);

            hideTableButton?.addEventListener("click", () => {
                const tableDiv = document.getElementById("pastBillsTable");
                tableDiv.classList.toggle("hidden");
                hideTableButton.textContent = tableDiv.classList.contains("hidden") ? "Show" : "Hide";
            });

            recentTableButton?.addEventListener("click", () => {
                fetch(`http://127.0.0.1:8000/get_bills/${selectedCustomerId}`)
                    .then(res => res.json())
                    .then(bills => {
                        const pastBillsTable = document.getElementById("pastBillsTable");
                        pastBillsTable.innerHTML = ""; // Clear previous bills
                        if (bills.length > 0) {
                            const table = document.createElement("table");
                            const thead = document.createElement("thead");
                            const tbody = document.createElement("tbody");
                            thead.innerHTML = `
                                <tr>
                                    <th>Date</th>
                                    <th>Flower ID</th>
                                    <th>Flower Name</th>
                                    <th>Rate</th>
                                    <th>Quantity</th>
                                    <th>GST(%)</th>
                                    <th>Discount(%)</th>
                                    <th>Total Price</th>
                                </tr>
                            `;
                            
                            p_date = bills[bills.length - 1].purchase_date;
                            console.log(p_date);
                            bills = bills.filter(bill => bill.purchase_date === p_date);
                            console.log(bills);

                            total = 0
                            bills.forEach(bill => {
                                const purchaseDate = new Date(bill.purchase_date).toLocaleDateString();
                                console.log(purchaseDate);
                                
                                const row = document.createElement("tr");
                                row.innerHTML = `
                                    <td>${purchaseDate}</td>
                                    <td>${bill.flower_id}</td>
                                    <td>${bill.flower_name}</td>
                                    <td>₹${bill.rate_at_purchase}</td>
                                    <td>${bill.quantity}</td>
                                    <td>${bill.gst}</td>
                                    <td>${bill.discount}</td>
                                    <td>₹${bill.total_price}</td>
                                `;
                                tbody.appendChild(row);

                                total+=bill.total_price
                            });

                            const last_row = document.createElement("tr")
                            last_row.innerHTML = `<td> Overall Total: ₹${total} </td>`
                            tbody.appendChild(last_row);
                            table.appendChild(thead);
                            table.appendChild(tbody);

                            const billTable = document.createElement("div");
                            billTable.setAttribute("id", "bill_table");
                            billTable.appendChild(table);
                            pastBillsTable.appendChild(billTable);

                            const pdf = document.createElement("button");
                            pdf.setAttribute("id", "pdf");
                            pdf.innerHTML = `PDF`;
                            pastBillsTable.appendChild(pdf);

                            send_pdf(selectedCustomerName, selectedCustomerPhone);

                        } else {
                            pastBillsTable.textContent = "No past bills for this customer.";
                        }
                    })
            });

            monthTableButton?.addEventListener("click", () => {
                const month = window.prompt("Enter the number of month.")
                console.log(month);
                if(month==null) return;

                fetch(`http://127.0.0.1:8000/get_bills/${selectedCustomerId}`)
                    .then(res => res.json())
                    .then(bills => {
                        const pastBillsTable = document.getElementById("pastBillsTable");
                        pastBillsTable.innerHTML = ""; // Clear previous bills
                        if (bills.length > 0) {
                            const table = document.createElement("table");
                            const thead = document.createElement("thead");
                            const tbody = document.createElement("tbody");
                            thead.innerHTML = `
                                <tr>
                                    <th>Date</th>
                                    <th>Flower ID</th>
                                    <th>Flower Name</th>
                                    <th>Rate</th>
                                    <th>Quantity</th>
                                    <th>GST(%)</th>
                                    <th>Discount(%)</th>
                                    <th>Total Price</th>
                                </tr>
                            `;

                            total = 0
                            bills.forEach(bill => {
                                
                                const purchaseDate = new Date(bill.purchase_date).toLocaleDateString();
                                console.log(purchaseDate);
                                let curr_month = purchaseDate.split("/")[1];
                                console.log(curr_month, typeof(curr_month), curr_month==month);

                                if(curr_month!=month){
                                    return;
                                }

                                const row = document.createElement("tr");
                                row.innerHTML = `
                                    <td>${purchaseDate}</td>
                                    <td>${bill.flower_id}</td>
                                    <td>${bill.flower_name}</td>
                                    <td>₹${bill.rate_at_purchase}</td>
                                    <td>${bill.quantity}</td>
                                    <td>${bill.gst}</td>
                                    <td>${bill.discount}</td>
                                    <td>₹${bill.total_price}</td>
                                `;
                                tbody.appendChild(row);

                                total+=bill.total_price
                            });

                            const last_row = document.createElement("tr")
                            last_row.innerHTML = `<td> Overall Total: ₹${total} </td>`
                            tbody.appendChild(last_row);
                            table.appendChild(thead);
                            table.appendChild(tbody);

                            const billTable = document.createElement("div");
                            billTable.setAttribute("id", "bill_table");
                            billTable.appendChild(table);
                            pastBillsTable.appendChild(billTable);

                            const pdf = document.createElement("button");
                            pdf.setAttribute("id", "pdf");
                            pdf.innerHTML = `PDF`;
                            pastBillsTable.appendChild(pdf);

                            send_pdf(selectedCustomerName, selectedCustomerPhone);

                        } else {
                            pastBillsTable.textContent = "No past bills for this customer.";
                        }
                    })
                    .catch(err => {
                        console.error("Error fetching past bills:", err);
                        document.getElementById("pastBillsTable").textContent = "Failed to load past bills.";
                    });
            });
            
            document.getElementById("closeBillForm")?.addEventListener("click", () => {
                if (currentBillContainer) {
                    currentBillContainer.remove();
                    currentBillContainer = null;
                    selectedCustomerId = null;
                }
                sessionStorage.removeItem("ForCustomerPopup");
            });

            // Fetch and display past bills
            const loadPastBills = () => {
                fetch(`http://127.0.0.1:8000/get_bills/${selectedCustomerId}`)
                    .then(res => res.json())
                    .then(bills => {
                        const pastBillsTable = document.getElementById("pastBillsTable");
                        pastBillsTable.innerHTML = ""; // Clear previous bills
                        if (bills.length > 0) {
                            const table = document.createElement("table");
                            const thead = document.createElement("thead");
                            const tbody = document.createElement("tbody");

                            thead.innerHTML = `
                            <tr>
                                <th><input type="checkbox" id="selectAll"></th>
                                <th>Date</th>
                                <th>Flower ID</th>
                                <th>Flower Name</th>
                                <th>Rate</th>
                                <th>Quantity</th>
                                <th>GST(%)</th>
                                <th>Discount(%)</th>
                                <th>Total Price</th>
                            </tr>
                            `;

                            let total = 0;
                            bills.forEach(bill => {
                            const row = document.createElement("tr");
                            const purchaseDate = new Date(bill.purchase_date).toLocaleDateString();

                            row.innerHTML = `
                                <td><input type="checkbox" class="bill-checkbox" data-id="${bill.id}"></td>
                                <td>${purchaseDate}</td>
                                <td>${bill.flower_id}</td>
                                <td>${bill.flower_name}</td>
                                <td>₹${bill.rate_at_purchase}</td>
                                <td>${bill.quantity}</td>
                                <td>${bill.gst}</td>
                                <td>${bill.discount}</td>
                                <td>₹${bill.total_price}</td>
                            `;

                            tbody.appendChild(row);
                            total += bill.total_price;
                            });

                            // Add total row
                            const last_row = document.createElement("tr");
                            last_row.innerHTML = `<td colspan="10"><strong>Overall Total: ₹${total}</strong></td>`;
                            tbody.appendChild(last_row);

                            // Append table
                            table.appendChild(thead);
                            table.appendChild(tbody);

                            const billTable = document.createElement("div");
                            billTable.setAttribute("id", "bill_table");
                            billTable.appendChild(table);
                            pastBillsTable.appendChild(billTable);

                            const pdf = document.createElement("button");
                            pdf.setAttribute("id", "pdf");
                            pdf.innerHTML = `PDF`;
                            pastBillsTable.appendChild(pdf);

                            const del_bill_button = document.createElement("button");
                            del_bill_button.setAttribute("id", "del_bill_button");
                            del_bill_button.setAttribute("onclick", "del_bill()");
                            del_bill_button.innerHTML = `Delete`;
                            pastBillsTable.appendChild(del_bill_button);

                            document.getElementById("selectAll").addEventListener("change", function () {
                                const isChecked = this.checked;
                                const checkboxes = document.querySelectorAll(".bill-checkbox");
                                checkboxes.forEach(cb => {
                                  cb.checked = isChecked;
                                });
                              });
                              
                            send_pdf(selectedCustomerName, selectedCustomerPhone);

                        } else {
                            pastBillsTable.textContent = "No past bills for this customer.";
                        }
                    })
                    .catch(err => {
                        console.error("Error fetching past bills:", err);
                        document.getElementById("pastBillsTable").textContent = "Failed to load past bills.";
                    });
            };

            allTableButton?.addEventListener("click", () => {
                loadPastBills();
            });

            loadPastBills(); // Load bills when a customer is selected

            
            // Update total price dynamically
            const updateTotalPrice = () => {
                const fid = parseInt(document.getElementById("flower_id").value);
                const qty = parseInt(document.getElementById("quantity").value);
                const rate = parseFloat(document.getElementById("todays_rate").value);
                const gst = parseFloat(document.getElementById("gst").value);
                const discount = parseFloat(document.getElementById("discount").value);

                if (rate >= 0 && qty > 0){
                    document.getElementById("total_price").value = (rate * qty * ((100+gst)/100) * ((100 - discount)/100)).toFixed(2);
                } else{
                    document.getElementById("total_price").value = "";
                }
            };

            document.getElementById("quantity").addEventListener("input", updateTotalPrice);
            document.getElementById("todays_rate").addEventListener("input", updateTotalPrice);
            document.getElementById("gst").addEventListener("input", updateTotalPrice)
            document.getElementById("discount").addEventListener("input", updateTotalPrice)
            document.getElementById("flower_id").addEventListener("input", () => {
                const fid = parseInt(document.getElementById("flower_id").value);
                const flowerInfo = flowerDetails[fid];
                if (flowerInfo && !document.getElementById("todays_rate").value) {
                    document.getElementById("todays_rate").value = flowerInfo.price;
                    updateTotalPrice();
                } else if (!flowerInfo) {
                    document.getElementById("todays_rate").value = "";
                    document.getElementById("total_price").value = "";
                }
            });

            // Handle bill form submission
            let bill_array = [];
            document.getElementById("billForm").addEventListener("submit", (event) => {
                event.preventDefault();
                const flower_id = parseInt(document.getElementById("flower_id").value);
                const quantity = parseInt(document.getElementById("quantity").value);
                const gst = parseFloat(document.getElementById("gst").value);
                const discount = parseFloat(document.getElementById("discount").value);
                const total_price = parseFloat(document.getElementById("total_price").value);
                const rate_at_purchase = parseFloat(document.getElementById("todays_rate").value);
                const purchase_date = new Date().toISOString(); // Get current date

                temp_array = [selectedCustomerId,flower_id,flowerDetails[flower_id].name, quantity, gst, discount, total_price, rate_at_purchase];
                bill_array.push(temp_array);

            });

            // document.getElementById("clear").addEventListener('click', ()=>{
            //     bill_array = [];
            // })

            document.getElementById("complete").addEventListener('click', ()=>{
                if(bill_array.length==0){
                    return;
                }

                let purchase_date = new Date().toISOString(); // Get current date
                let final_price = 0;

                for(let i = 0; i<bill_array.length;i++){
                    const formData1 = new FormData();
                    formData1.append("customer_id", bill_array[i][0]);
                    formData1.append("flower_id", bill_array[i][1]);
                    formData1.append("flower_name", bill_array[i][2]);
                    formData1.append("quantity", bill_array[i][3]);
                    formData1.append("gst", bill_array[i][4]);
                    formData1.append("discount",bill_array[i][5]);
                    formData1.append("total_price", bill_array[i][6]);
                    formData1.append("rate_at_purchase", bill_array[i][7]);
                    formData1.append("purchase_date", purchase_date);

                    final_price+=bill_array[i][6];

                    fetch(`http://127.0.0.1:8000/add_bill/`, {
                        method: "POST",
                        body: formData1
                    })
                    .then(res => {
                        
                        if (!res.ok){
                            throw new Error(`HTTP error! status: ${res.status}`);
                        }
                        return res.json(); // Or res.text() if the server doesn't return JSON for success
                    })
                    .catch(error => {
                        alert("Error adding to bill");
                        console.error("Error adding bill:", error);
                    });
                    
                }

                const formData2 = new FormData();
                formData2.append("customer_id", bill_array[0][0]);
                formData2.append("credit", final_price);
                formData2.append("debit",0);
                formData2.append("purchase_date", purchase_date);

                fetch(`http://127.0.0.1:8000/update_passbook/`, {
                    method: "POST",
                    body: formData2
                })
                .then(res => {
                    
                    if (!res.ok){
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json(); // Or res.text() if the server doesn't return JSON for success
                })
                .then(r=>{bill_array = [];
                    window.location.href = "/";
                })
                .catch(error => {
                    alert("Error adding to passbook");
                    console.error("Error adding in passbook:", error);
                });

                
            });
        // }
        

    }

// Reopen popup if returning from update page
window.onload = function () {
  const data = sessionStorage.getItem("ForCustomerPopup");
  if (data) {
    const customer = JSON.parse(data);
    customerPopup(customer.selectedCustomerId,customer.selectedCustomerName,customer.selectedCustomerPhone);
  }
};