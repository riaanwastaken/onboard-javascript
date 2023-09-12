// ApiManager Class
class ApiManager {
  totalRecordCount: number | null;
  columnNames: string[] | null;

  constructor() {
    this.totalRecordCount = null;
    this.columnNames = null;
  }

  async fetchTotalRecordCount(): Promise<void> {
    try {
      const response = await fetch('http://localhost:2050/recordCount');
      if (!response.ok) {
        throw new Error(`Failed to fetch total record count: ${response.statusText}`);
      }
      const data: number = await response.json();
      this.totalRecordCount = data;
    } catch (error) {
      console.error(`Error fetching total record count: ${error}`);
    }
  }
  
  async fetchColumnNames(): Promise<void> {
    try {
      const response = await fetch('http://localhost:2050/columns');
      if (!response.ok) {
        throw new Error(`Failed to fetch column names: ${response.statusText}`);
      }
      const data: string[] = await response.json();
      this.columnNames = data;
    } catch (error) {
      console.error(`Error fetching column names: ${error}`);
    }
  }
  
  async fetchRecords(from: number, to: number): Promise<any[][] | null> {
    try {
      const response = await fetch(`http://localhost:2050/records?from=${from}&to=${to}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch records: ${response.statusText}`);
      }
      const data: any[][] = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching records: ${error}`);
      return null;
    }
  }
  
}



// TableRenderer Class
type apiRecord = any[];

class TableRenderer {
  constructor() {
    // State initialization
  }

  setColumnNames(columnNames: string[]): void {
    try {
      const thead = document.querySelector('thead');
      if (thead === null) {
        throw new Error('Table header not found.');
      }
      
      const row = document.createElement('tr');
      for (const columnName of columnNames) {
        const cell = document.createElement('th');
        cell.textContent = columnName;
        row.appendChild(cell);
      }
      thead.appendChild(row);
    } catch (error) {
      if (error instanceof Error) {  // Type guard
        console.error(`An error occurred: ${error.message}`);
      } else {
        console.error(`An unknown error occurred: ${error}`);
      }
    }
  }
  

  render(records: apiRecord[] | null) {
    try {
      if (records === null) {
        throw new Error("No records to render.");
      }

      const tbody = document.querySelector('tbody');
      if (tbody === null) {
        throw new Error('Table body not found.');
      }
      
      tbody.innerHTML = ''; // Clear existing rows
      
      records.forEach((record) => {
        const row = document.createElement('tr');
        record.forEach((cell) => {
          const td = document.createElement('td');
          td.textContent = cell.toString();
          row.appendChild(td);
        });
        tbody.appendChild(row);
      });
    } catch (error) {
      console.error(`An error occurred: ${error}`);
    }
  }
  

  adjustRows(): void {
    try {
      const rowHeight = 20; 
      const headerHeight = 180; 
      const availableHeight = (window.innerHeight) - headerHeight ;
    
      let numRows = Math.floor(availableHeight / rowHeight);
      
      // Check for a minimum number of rows
      if (numRows <= 0) {
        console.log("Window size too small, setting minimum number of rows to 1");
        numRows = 1;
      }
      // Fetch the records for the current page based on the newly calculated numRows
      const apiManager = new ApiManager();
      const currentPage = 1; // Replace with your actual current page from PaginationManager
  
      const from = (currentPage - 1) * numRows;
      const to = from + numRows - 1;
    
      apiManager.fetchRecords(from, to).then(records => {
        if (records !== null) {
          this.render(records);
        }
      }).catch(error => {
        console.error(`An error occurred while fetching records: ${error}`);
      });
    } catch (error) {
      console.error(`An error occurred: ${error}`);
    }
  }
}

 // const records = await apiManager.fetchRecords(0, 9);
  // tableRenderer.render(records);
// WindowManager Class
class WindowManager {
  private timeoutId: number | null = null;

  constructor(private tableRenderer: TableRenderer) {}

  handleResize() {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = window.setTimeout(() => {
      this.tableRenderer.adjustRows();
      this.timeoutId = null;
    }, 200);
  }
}




// PaginationManager Class
class PaginationManager {
  currentPage: number = 1;

  incrementPage(): void {
    this.currentPage += 1;
  }

  decrementPage(): void {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
    }
  }
}


// main script
window.onload = async () => {
  const apiManager = new ApiManager();
  const tableRenderer = new TableRenderer();
  const windowManager = new WindowManager(tableRenderer);
  const paginationManager = new PaginationManager(); 

  // Fetch total record count and column names
  await apiManager.fetchTotalRecordCount();
  await apiManager.fetchColumnNames();
  
  // Set column names
  if (apiManager.columnNames !== null) {
    tableRenderer.setColumnNames(apiManager.columnNames);
  }

  // Initial fetch and render of records
  tableRenderer.adjustRows();

  // Attach event listeners
  window.addEventListener('resize', () => windowManager.handleResize());

  // You can also attach listeners for 'Next Page', 'Previous Page', and 'Filter by ID' here
};




























// *** Development Setup ***//
// go run main.go
// npm run build
// npm run watch
// *** Development Setup ***//




// *** Global Variables ***//
// const ROW_HEIGHT = 21;
// let currentPage = 1;
// let recordsPerPage = 25;
// let totalRecords: number;
// let lastFilteredId: string | null = null;
// let cachedColumnNames: string[] | null = null;
// let totalPages: number;





// // Initialize the page when the window loads
// window.onload = async () => {
//   calculateRecordsPerPage();
//   await fetchTotalRecords();
//   generateInitialTable();




//   // Re-generate the table when the window is resized
//   // Re-generate the table when the window is resized
//   window.addEventListener("resize", debounce(async () => {
//     // Find the first row and its ID.
//     const firstRow = document.querySelector('#myTable tbody tr');
//     let firstRowId = 0;
    
//     if (firstRow && firstRow.id) {
//       firstRowId = parseInt(firstRow.id.split('-')[1], 10);
//     }
    
//     console.log("In debounce (before recalculating):");
//     console.log(`First row ID: ${firstRowId}`);
//     console.log(`Current page: ${currentPage}`);
    
//     // Recalculate the number of records per page
//     calculateRecordsPerPage();
  
//     // Recalculate currentPage based on firstRowId
//     currentPage = Math.floor(firstRowId / recordsPerPage) + 1;
    
//     console.log("In debounce (after recalculating):");
//     console.log(`First row ID should still be: ${firstRowId}`);
//     console.log(`New current page: ${currentPage}`);
    
//     // Regenerate table
//     if (lastFilteredId) {
//       const id = parseInt(lastFilteredId, 10);
//       filterRecordsById(id.toString());
//     } else {
//       generateTable(currentPage, null);  // Generate the table for the current page
//     }
//   }, 250));
  
  

// // Handle Previous button click
// document.getElementById("prevBtn")?.addEventListener("click", () => {
//   const filterInput = document.getElementById("filterInput") as HTMLInputElement;
//   if (!filterInput.value) {
//     lastFilteredId = null;
//   }
//   currentPage--;
//   generateTable(currentPage, lastFilteredId);

//   if (currentPage === 1) {
//     document.getElementById("prevBtn")?.setAttribute("disabled", "true");
//   } else {
//     document.getElementById("prevBtn")?.removeAttribute("disabled");
//     document.getElementById("nextBtn")?.removeAttribute("disabled");
//   }
// });

// // Handle Next button click
// document.getElementById("nextBtn")?.addEventListener("click", () => {
//   const filterInput = document.getElementById("filterInput") as HTMLInputElement;
//   if (!filterInput.value) {
//     lastFilteredId = null;
//   }
//   currentPage++;
//   generateTable(currentPage, lastFilteredId);

//   document.getElementById("prevBtn")?.removeAttribute("disabled");
//   if (currentPage * recordsPerPage >= totalRecords) {
//     document.getElementById("nextBtn")?.setAttribute("disabled", "true");
//   }
// });

  



//   // Filter functionality
//   let errorTimeout: number | null = null;

//   const filterInput = document.getElementById("filterInput") as HTMLInputElement;
//   const errorMessage = document.getElementById("errorMessage");

//   if (filterInput && errorMessage) {
//     filterInput.addEventListener("input", async function() { // Added async here to call await later
//       const query = this.value.trim();

//       // Clear any existing timeout and error message
//       if (errorTimeout !== null) {
//         clearTimeout(errorTimeout);
//       }
//       errorMessage.textContent = "";

//       if (query === "") {
//         // If input is empty, remove the highlight and revert the table
//         lastFilteredId = null;
//         currentPage = 1; // Resetting to the first page
//         await generateTable(currentPage, null, undefined); // Use currentPage which is now 1
//         document.getElementById("prevBtn")?.setAttribute("disabled", "true");
//         return;
//       }
      
//       const isValidNumber = /^[0-9]+$/.test(query) && parseInt(query, 10) <= 999999;

//       if (isValidNumber) {
//         lastFilteredId = query;
//         filterRecordsById(query);
//       } else {
//         // Set up the delayed message
//         errorTimeout = setTimeout(() => {
//           errorMessage.textContent = "Invalid input. Please enter a number between 0 and 999999.";
//         }, 500);
//       }
//     });
//   }
// };




// function generateInitialTable() {
//   generateTable(currentPage, null);
// }



// function removeRowsFromTable(rowsToRemove: number) {
//   const table = document.getElementById('myTable');
//   if (table) {
//     const tbody = table.querySelector('tbody');
//     if (tbody) {
//       // Remove the last 'rowsToRemove' rows from the table
//       for (let i = 0; i < rowsToRemove; i++) {
//         if (tbody.lastElementChild) {
//           tbody.removeChild(tbody.lastElementChild);
//         }
//       }
//     }
//   }
// }

//   // Debounce function
//   function debounce(func: Function, wait: number) {
//     let timeout: ReturnType<typeof setTimeout>;
//     return function executedFunction(...args: any[]) {
//       const later = () => {
//         clearTimeout(timeout);
//         func(...args);
//       };
//       clearTimeout(timeout);
//       timeout = setTimeout(later, wait);
//     };
// }




//   // Calculate the number of records to display on each page based on the window height
//   function calculateRecordsPerPage() {
//     const headingHeight = document.getElementById('main-heading')?.offsetHeight || 0; 
//     const paginationHeight = document.getElementById('pagination')?.offsetHeight || 0;  
//     const availableHeight = window.innerHeight - headingHeight - paginationHeight - 10;
//     recordsPerPage = Math.floor(availableHeight / ROW_HEIGHT);
//     totalPages = Math.ceil(totalRecords / recordsPerPage);
//     console.log("In calculateRecordsPerPage:");
//     console.log(`Records per page: ${recordsPerPage}`);
//   }




//   // Fetch columns and cache them if they are not already cached
//   async function fetchColumnData() {
//     if (cachedColumnNames !== null) {
//       return cachedColumnNames;
//     }
//     const response = await fetch("http://localhost:2050/columns");
//     const columnNames = await response.json();
//     cachedColumnNames = columnNames;  // Store in cache
//     return columnNames;
//   }
  
  


//   // Generate the header of the table
//   function generateTableHeader(columnNames: string[]) {
//     const thead = document.createElement('thead');
//     const tr = document.createElement('tr');
//     columnNames.forEach((name) => {
//       const th = document.createElement('th');
//       th.textContent = name;
//       tr.appendChild(th);
//     });
//     thead.appendChild(tr);
//     return thead;
//   }




//   // Fetch a subset of row data from the server
//   async function fetchRowData(from: number, to: number) {
//     // Make sure 'to' doesn't exceed the maximum allowed record number
//     to = Math.min(to, 999999);
    
//     // Make sure 'to' is not negative
//     if (to < 0) {
//       to = 0;
//     }
    
//     // Make sure 'from' is not greater than 'to'
//     if (from > to) {
//       from = to;
//     }
  
//     // Ensure 'from' is not negative
//     if (from < 0) {
//       from = 0;
//     }
  
//     const response = await fetch(`http://localhost:2050/records?from=${from}&to=${to}`);
    
//     if (!response.ok) {
//       console.error(`Fetch failed: ${response.status} ${response.statusText}`);
//       return [];
//     }
    
//     const records = await response.json();
//     return records;
//   }
  
  
  

//   // Generate the body of the table
//   function generateTableRows(records: any[][], highlightId: string | null) {
//     const tbody = document.createElement('tbody');
//     records.forEach((record, index) => {
//       const tr = document.createElement('tr');
//       tr.id = `row-${record[0]}`;  // Assuming the ID is the first cell in each record
      
//       // Highlight the row if it matches the filtered ID
//       if (highlightId && highlightId === record[0].toString()) {
//         tr.classList.add("highlighted-green");
//       }
//       record.forEach((cell) => {
//         const td = document.createElement('td');
//         td.textContent = cell;
//         tr.appendChild(td);
//       });
//       tbody.appendChild(tr);
//     });
//     return tbody;
//   }




//   // Generate the complete table
//   async function generateTable(page: number, highlightId: string | null, updateMode: boolean = false) {
//     const columnNames = await fetchColumnData();
//     const from = (page - 1) * recordsPerPage;
//     let to = Math.min(page * recordsPerPage, totalRecords) - 1;
//     const records = await fetchRowData(from, to);
  
//     const thead = generateTableHeader(columnNames);
//     const tbody = generateTableRows(records, highlightId);
    
//     // Clear existing data if any
//     const table = document.getElementById('myTable');
//     if (table) {
//       if (updateMode) {
//         const existingTbody = table.querySelector('tbody');
//         if (existingTbody) {
//           tbody.querySelectorAll('tr').forEach((row) => {
//             existingTbody.appendChild(row);
//           });
//         }
//       } else {
//         table.innerHTML = "";
//         table.appendChild(thead);
//         table.appendChild(tbody);
//       }
//     }
//     console.log("In generateTable:");
//     console.log(`Start index: ${from}`);
//     console.log(`End index: ${to}`);
//     // Set column widths
//     setColumnWidths();
    
//     // If there is a filtered ID, you could call some logic here
//     if (lastFilteredId) {
//       // centerHighlightedRow();
//     }
  
//     // Disable or Enable the Next button based on the last record
//     if (to >= totalRecords - 1) {
//       document.getElementById("nextBtn")?.setAttribute("disabled", "true");
//     } else {
//       document.getElementById("nextBtn")?.removeAttribute("disabled");
//     }
//   }
  
  
//   function setColumnWidths(): void {
//     // Assuming your table has an id of "myTable"
//     const table = document.getElementById("myTable");
    
//     if (table) {
//       // Count the number of columns in your table
//       const headerCells = table.querySelectorAll("th");
//       const numCols = headerCells.length;
  
//       // Calculate the width for each column
//       const colWidth = 100 / numCols;
  
//       // Set the width
//       headerCells.forEach((headerCell: Element) => {
//         (headerCell as HTMLElement).style.width = `${colWidth}%`;
//       });
//     }
//   }
  


//   // Fetch the total number of records
//   async function fetchTotalRecords() {
//     const response = await fetch("http://localhost:2050/recordCount");
//     totalRecords = await response.json();
//     totalPages = Math.ceil(totalRecords / recordsPerPage);
//   }




//   // Filter records by ID and regenerate the table accordingly
//   async function filterRecordsById(query: string) {
//     lastFilteredId = query;
//     if (!query) {
//       // Revert to initial state if no query
//       generateTable(1, null);  // Start with the first page
//       document.getElementById("prevBtn")?.setAttribute("disabled", "true");  // Disable the Previous button here
//       return;
//     }
  
//     let id = parseInt(query, 10);
  
//     // Calculate the current page based on the filtered ID
//     currentPage = Math.ceil((id + 1) / recordsPerPage);
  
//     // Enable or Disable the Previous button based on the current page
//     if (currentPage > 1) {
//       document.getElementById("prevBtn")?.removeAttribute("disabled");  // Enable the Previous button here
//     } else {
//       document.getElementById("prevBtn")?.setAttribute("disabled", "true");  // Disable the Previous button here
//     }
  
//     console.log(`Fetching records for page ${currentPage} with highlight on ${id}`);
//     await generateTable(currentPage, id.toString());
//   }
  
  



//   // Center the row that is highlighted
//   // function centerHighlightedRow() {
//   //   const highlightedRow = document.querySelector(".highlighted");
//   //   const mainContainer = document.getElementById("main-container"); 
  
//   //   if (highlightedRow && mainContainer) {
//   //     const containerHeight = mainContainer.clientHeight;
//   //     const rowTop = highlightedRow.getBoundingClientRect().top;
//   //     const rowHeight = highlightedRow.clientHeight;
//   //     const scrollPosition = rowTop + mainContainer.scrollTop - (containerHeight / 2) + (rowHeight / 2);
//   //     mainContainer.scrollTop = scrollPosition;
//   //   }
//   // }
  
  
