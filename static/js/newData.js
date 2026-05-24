
// Extract the "text" parameter from URL
const params = new URLSearchParams(window.location.search);
let customer_id = params.get("cust");
let customer_name = params.get("text");
let customer_phone = params.get("phone");



async function download() {
    let customerId  = customer_id;
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }
    // console.log(typeof(startDate));
    // document.getElementById("result").innerText = `Start Date: ${startDate}, End Date: ${endDate}`;

    try {
        const response = await fetch(`http://127.0.0.1:8000/download_passbook?customer_id=${customerId}&start_date=${startDate}&end_date=${endDate}`);
        const dataArray = await response.json(); // Expecting: [[date, debit, credit, total], ...]

        console.log(dataArray);

        // Generate HTML content
        let html = `
            <h3 style = "text-align:center">A1 Roses - Bill Passbook<h3>
            <h4>Customer Name: ${customer_name}</h2>
            <h4>Customer Phone: ${customer_phone}</h2>
            <h4>Date Range: ${startDate} to ${endDate}</h4>
            <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f2f2f2;">
                        <th>Date</th>
                        <th>Debit</th>
                        <th>Credit</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>`;

        dataArray.forEach(row => {
            html += `
                <tr>
                    <td>${row[0]}</td>
                    <td>${row[1]}</td>
                    <td>${row[2]}</td>
                    <td>${row[3]}</td>
                </tr>`;
        });

        html += `</tbody></table>`;

        // Inject HTML into hidden div
        const container = document.getElementById('pdfContent');
        container.innerHTML = html;
        container.style.display = 'block'; // Show temporarily for layout

        // Convert HTML to PDF
        // setTimeout(()=>{
        //     const opt = {
        //     margin:       0.5,
        //     filename:     `passbook_${customerId}_${startDate}_to_${endDate}.pdf`,
        //     image:        { type: 'jpeg', quality: 0.98 },
        //     html2canvas:  { scale: 2 },
        //     jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        // };
        //     html2pdf().from(container).set(opt).save();
        // }, 2000);
const opt = {
            margin:       0.5,
            filename:     `passbook_${customerId}_${startDate}_to_${endDate}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
            await html2pdf().from(container).set(opt).save();
        container.style.display = 'none'; // Hide again after download

    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Failed to generate PDF. Please try again.");
    }
}

document.addEventListener('DOMContentLoaded',()=>{
    customer_id = params.get("cust");
    customer_name = params.get("text");
    customer_phone = params.get("phone");


  console.log(typeof(customer_id), customer_id,customer_name);
  const customer = document.getElementById('customer');
  const mobile = document.getElementById('mobile');
  const total_bill = document.getElementById('total_bill');
  const debit = document.getElementById('debited_amount');
  const submit = document.getElementById('debit_submit');
  const bills_text = document.getElementById('bills');

  fetch(`http://127.0.0.1:8000/get_total/${customer_id}`).then(res =>res.json()).then(res =>{
    console.log(typeof(res),res);
    total_bill.setAttribute('value',res[1]);

    bills_text.innerHTML = `
    <h3>Previous Total: \u20B9${res[0]}</h3>
    <h3>Debited amount: \u20B9${res[2]}</h3>
    <h3>New Total: \u20B9${parseFloat(res[1])}</h3>
    `
  })
  
  customer.setAttribute('value',customer_name);
  mobile.setAttribute('value',customer_phone);

  
  submit.addEventListener('click',(e)=>{
    e.preventDefault();
    const formData2 = new FormData();
    formData2.append("customer_id", customer_id);
    formData2.append("credit", 0);
    formData2.append("debit",parseFloat(debit.value));
    formData2.append("purchase_date", new Date().toISOString());

    fetch(`http://127.0.0.1:8000/update_passbook/`, {
        method: "POST",
        body: formData2
    }).then(r=>{
        window.location.href = `new-data?cust=${customer_id}&text=${customer_name}&phone=${customer_phone}`;
    })
    
  })
  
})
