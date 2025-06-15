window.addEventListener("DOMContentLoaded", () => 
{
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabBtns.forEach((btn) => 
  {
    btn.addEventListener("click", () => 
    {
      const tabId = btn.getAttribute("data-tab");
      
      tabBtns.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));
      
      btn.classList.add("active");
      document.getElementById(tabId).classList.add("active");
    });
  });

  const reportTypeRadios = document.querySelectorAll('input[name="report-type"]');
  const customDateRange = document.getElementById("custom-date-range");

  reportTypeRadios.forEach(radio => 
  {
    radio.addEventListener("change", () => 
    {
      customDateRange.style.display = radio.value === "custom" ? "flex" : "none";
      
      const previewType = document.getElementById("preview-type");
      if (radio.value === "weekly") 
      {
        previewType.textContent = "Weekly Report";
      } 
      else if (radio.value === "monthly") 
      {
        previewType.textContent = "Monthly Report";
      } 
      else 
      {
        previewType.textContent = "Custom Date Range Report";
      }
    });
  });

  const reportDepartment = document.getElementById("report-department");
  reportDepartment.addEventListener("change", () => 
  {
    document.getElementById("preview-department").textContent = 
      reportDepartment.value === "all" ? "All Departments" : reportDepartment.value;
  });

  const reportFormat = document.getElementById("report-format");
  reportFormat.addEventListener("change", () => 
  {
    document.getElementById("preview-format").textContent = 
      reportFormat.value.toUpperCase();
  });

  const startDate = document.getElementById("start-date");
  const endDate = document.getElementById("end-date");
  
  startDate.addEventListener("change", updateDateRangePreview);
  endDate.addEventListener("change", updateDateRangePreview);

  function updateDateRangePreview() 
  {
    if (startDate.value && endDate.value) 
    {
      document.getElementById("preview-date-range").textContent = 
        `${startDate.value} to ${endDate.value}`;
    }
  }

  const employeeInput = document.getElementById("search-employee");
  const departmentSelect = document.getElementById("filter-department");
  const statusSelect = document.getElementById("filter-status");
  const dateInput = document.getElementById("filter-date");
  const tbody = document.getElementById("attendance-tbody");

  function filterTable() 
  {
    const employeeFilter = employeeInput.value.toLowerCase();
    const departmentFilter = departmentSelect.value.toLowerCase();
    const statusFilter = statusSelect.value; 
    const dateFilter = dateInput.value;

    const rows = tbody.querySelectorAll("tr");
    let visibleCount = 0;

    rows.forEach((row) => 
    {
        const name = row.querySelector(".employee-name").textContent.toLowerCase();
        const id = row.querySelector(".employee-id").textContent.toLowerCase();
        const department = row.children[1].textContent.toLowerCase();
        const date = row.children[2].textContent;
        
        const statusElement = row.querySelector(".status-badge");
        const status = statusElement ? statusElement.textContent.trim() : "";

        const matchEmployee = name.includes(employeeFilter) || id.includes(employeeFilter);
        const matchDepartment = !departmentFilter || department === departmentFilter;
        const matchStatus = !statusFilter || status === statusFilter;
        const matchDate = !dateFilter || date === dateFilter;

        if (matchEmployee && matchDepartment && matchStatus && matchDate) 
        {
            row.style.display = "";
            visibleCount++;
        } 
        else 
        {
            row.style.display = "none";
        }
    });

    document.getElementById("record-count").textContent = visibleCount;
  }

  employeeInput.addEventListener("input", filterTable);
  departmentSelect.addEventListener("change", filterTable);
  statusSelect.addEventListener("change", filterTable);
  dateInput.addEventListener("change", filterTable);

  const today = new Date().toISOString().split('T')[0];
  dateInput.value = today;
  startDate.value = today;
  endDate.value = today;
});


function generateReport() 
{
  const reportType = document.querySelector('input[name="report-type"]:checked').value;
  const department = document.getElementById("report-department").value;
  const format = document.getElementById("report-format").value;
  
  let startDate = '';
  let endDate = '';
  
  if (reportType === 'custom') 
  {
    startDate = document.getElementById("start-date").value;
    endDate = document.getElementById("end-date").value;
    
    if (!startDate || !endDate) 
    {
      alert("Please select both start and end dates for custom range");
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) 
    {
      alert("End date must be after start date");
      return;
    }
  }
  
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'download_report.php';
  form.style.display = 'none';
  
  addHiddenInput(form, 'reportType', reportType);
  addHiddenInput(form, 'department', department);
  addHiddenInput(form, 'format', format);
  
  if (reportType === 'custom') 
  {
    addHiddenInput(form, 'startDate', startDate);
    addHiddenInput(form, 'endDate', endDate);
  }
  
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

function addHiddenInput(form, name, value) 
{
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = name;
  input.value = value;
  form.appendChild(input);
}


function generateReport() 
{
  const reportType = document.querySelector('input[name="report-type"]:checked').value;
  const department = document.getElementById("report-department").value;
  const format = document.getElementById("report-format").value;
  
  let startDate = '';
  let endDate = '';
  
  if (reportType === 'custom') 
  {
    startDate = document.getElementById("start-date").value;
    endDate = document.getElementById("end-date").value;
    
    if (!startDate || !endDate) 
    {
      alert("Please select both start and end dates for custom range");
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) 
    {
      alert("End date must be after start date");
      return;
    }
  } 
  else 
  {
    startDate = '';
    endDate = '';
  }
  
  const generateBtn = document.querySelector('.btn-primary');
  const originalText = generateBtn.innerHTML;
  generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
  generateBtn.disabled = true;
  
  const data = 
  {
    reportType,
    department,
    format,
    startDate,
    endDate
  };
  
  fetch('generate_report.php', 
  {
    method: 'POST',
    headers: 
    {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })
  .then(response => 
  {
    if (!response.ok) 
    {
      throw new Error('Network response was not ok');
    }
    return response.blob();
  })
  .then(blob => 
  {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    let filename = 'attendance_report';
    if (reportType === 'weekly') 
    {
      filename += '_weekly';
    } 
    else if (reportType === 'monthly') 
    {
      filename += '_monthly';
    } 
    else 
    {
      filename += `_${startDate}_to_${endDate}`;
    }
    
    if (department !== 'all') 
    {
      filename += `_${department}`;
    }
    
    filename += `.${format}`;
    a.download = filename;
  
    document.body.appendChild(a);
    a.click();
    
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  })
  .catch(error => 
  {
    console.error('Error:', error);
    alert('Error generating report: ' + error.message);
  })
  .finally(() => 
  {
    generateBtn.innerHTML = originalText;
    generateBtn.disabled = false;
  });
}

function previewReport() 
{
  const reportType = document.querySelector('input[name="report-type"]:checked').value;
  const department = document.getElementById("report-department").value;
  
  let startDate = '';
  let endDate = '';
  
  if (reportType === 'custom') 
  {
    startDate = document.getElementById("start-date").value;
    endDate = document.getElementById("end-date").value;
    
    if (!startDate || !endDate) 
    {
      alert("Please select both start and end dates for custom range");
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) 
    {
      alert("End date must be after start date");
      return;
    }
  }
  
  const previewWindow = window.open('', '_blank');
  
  previewWindow.document.write
  (`
    <html>
      <head>
        <title>Loading Preview...</title>
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
          .loading { text-align: center; }
          .spinner { font-size: 24px; margin-bottom: 16px; }
        </style>
      </head>
      <body>
        <div class="loading">
          <div class="spinner"><i class="fas fa-spinner fa-spin"></i></div>
          <div>Generating report preview...</div>
        </div>
      </body>
    </html>
  `);
  
  const data = 
  {
    reportType,
    department,
    startDate,
    endDate,
    preview: true
  };
  
  fetch('generate_report.php', 
  {
    method: 'POST',
    headers: 
    {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })
  .then(response => response.text())
  .then(html => 
  {
    previewWindow.document.open();
    previewWindow.document.write(html);
    previewWindow.document.close();
  })
  .catch(error => 
  {
    console.error('Error:', error);
    previewWindow.document.write
    (`
      <html>
        <head><title>Error</title></head>
        <body>
          <h1>Error Generating Preview</h1>
          <p>${error.message}</p>
        </body>
      </html>
    `);
  });
}

function formatDate(dateString) 
{
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}